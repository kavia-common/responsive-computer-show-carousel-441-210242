/* ============================================================================
   REQUIREMENT TRACEABILITY
   ============================================================================
   Requirement ID: REQ-CAR-002
   User Story: Build a responsive, accessible carousel (mobile-first) with autoplay,
               touch/keyboard navigation, indicators, arrows, and audit logging.
   Acceptance Criteria:
     - 4 slides visible over time; mobile shows partial neighbors.
     - Autoplay with pause on hover/focus and on touch.
     - Manual navigation via arrows, dots, swipe, and keyboard.
     - Accessible roles/labels and aria-current indicators.
     - Theming per Ocean Professional; smooth transitions; respects reduced motion.
     - Audit hooks fire on slide change, autoplay start/stop, and user interactions.
   GxP Impact: NO (UI only). Hooks prepared for future backend.
   Risk Level: LOW
   Validation Protocol: VP-CAR-UI-002
   ============================================================================
*/

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logUIEvent } from '../../utils/audit.ts';
import './Carousel.css';

export type Slide = {
  id: string;
  title: string;
  caption?: string;
  imageSrc: string;
  alt: string;
};

export type AutoplayConfig = {
  enabled?: boolean;
  intervalMs?: number; // > 0
};

export type Breakpoints = {
  tablet?: number;  // px
  desktop?: number; // px
};

export interface CarouselProps {
  /** Slides array must be non-empty. */
  slides: Slide[];
  /** Autoplay configuration. Defaults enabled with 4000ms. */
  autoplay?: AutoplayConfig;
  /** Responsive breakpoints. Defaults tablet 640, desktop 1024. */
  breakpoints?: Breakpoints;
  /** Optional className for container. */
  className?: string;
  /** Optional aria-label for the carousel region. */
  ariaLabel?: string;
}

/**
 * PUBLIC_INTERFACE
 * Carousel
 * ----------------------------------------------------------------------------
 * JSDoc:
 * An accessible, responsive carousel component with autoplay, touch and keyboard
 * navigation, indicators, and audit logging hooks. Mobile-first design shows
 * partial neighboring slides to hint scrollability.
 *
 * Props validation:
 * - slides: required, length > 0
 * - autoplay.intervalMs: if provided and autoplay enabled, must be > 0
 *
 * Errors handled:
 * - Timer setup guarded by try/catch; event handlers protected.
 * - Image load errors render a graceful fallback block.
 *
 * Returns: React.ReactElement
 */
export const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoplay = { enabled: true, intervalMs: 4000 },
  breakpoints = { tablet: 640, desktop: 1024 },
  className,
  ariaLabel = 'Services carousel',
}) => {
  // Validation
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('Carousel: "slides" is required and must be a non-empty array.');
  }
  if (autoplay?.enabled && (typeof autoplay.intervalMs === 'number') && autoplay.intervalMs <= 0) {
    throw new Error('Carousel: "autoplay.intervalMs" must be > 0 when autoplay is enabled.');
  }

  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const total = slides.length;

  const cfg = useMemo(() => {
    const enabled = !!autoplay?.enabled && !prefersReducedMotion;
    const interval = Math.max(1, autoplay?.intervalMs ?? 4000);
    return { enabled, interval };
  }, [autoplay?.enabled, autoplay?.intervalMs, prefersReducedMotion]);

  // Audit: initial autoplay state
  useEffect(() => {
    if (cfg.enabled) {
      logUIEvent('carousel_autoplay_init', 'INFO', { enabled: true, intervalMs: cfg.interval });
    } else {
      logUIEvent('carousel_autoplay_init', 'INFO', { enabled: false, reason: prefersReducedMotion ? 'prefers-reduced-motion' : 'disabled-config' });
    }
  }, [cfg.enabled, cfg.interval, prefersReducedMotion]);

  const clampIndex = useCallback((index: number) => {
    if (index < 0) return total - 1;
    if (index >= total) return 0;
    return index;
  }, [total]);

  const goTo = useCallback((index: number, cause: 'auto' | 'arrow' | 'dot' | 'swipe' | 'kbd') => {
    const next = clampIndex(index);
    setActiveIndex((prev) => {
      if (prev !== next) {
        logUIEvent('carousel_slide_change', 'NAVIGATE', { from: prev, to: next, cause });
      }
      return next;
    });
  }, [clampIndex]);

  const next = useCallback((cause: 'auto' | 'arrow' | 'swipe' | 'kbd') => {
    goTo(activeIndex + 1, cause);
  }, [activeIndex, goTo]);

  const prev = useCallback((cause: 'arrow' | 'swipe' | 'kbd') => {
    goTo(activeIndex - 1, cause);
  }, [activeIndex, goTo]);

  // Autoplay timer management
  useEffect(() => {
    if (!cfg.enabled || isPaused) return;

    try {
      timerRef.current = window.setTimeout(() => next('auto'), cfg.interval);
      logUIEvent('carousel_autoplay_start', 'READ', { index: activeIndex, intervalMs: cfg.interval });
    } catch (e) {
      logUIEvent('carousel_timer_error', 'ERROR', { message: (e as Error).message });
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        logUIEvent('carousel_autoplay_stop', 'READ', { index: activeIndex, reason: 'cleanup' });
      }
    };
  }, [cfg.enabled, cfg.interval, isPaused, next, activeIndex]);

  // Pause handlers
  const handleHover = (pause: boolean) => {
    setIsPaused(pause);
    logUIEvent(pause ? 'carousel_hover_pause' : 'carousel_hover_resume', 'READ', { pause });
  };

  const handleFocus = (pause: boolean) => {
    setIsPaused(pause);
    logUIEvent(pause ? 'carousel_focus_pause' : 'carousel_focus_resume', 'READ', { pause });
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    try {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next('kbd');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev('kbd');
      }
    } catch (err) {
      logUIEvent('carousel_kbd_error', 'ERROR', { message: (err as Error).message });
    }
  };

  // Touch swipe support
  useSwipe(containerRef, {
    onSwipeLeft: () => next('swipe'),
    onSwipeRight: () => prev('swipe'),
    onTouchStart: () => {
      if (cfg.enabled) {
        setIsPaused(true);
        logUIEvent('carousel_touch_pause', 'READ', {});
      }
    },
    onTouchEnd: () => {
      if (cfg.enabled) {
        setIsPaused(false);
        logUIEvent('carousel_touch_resume', 'READ', {});
      }
    }
  });

  // Image error handling
  const onImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
    logUIEvent('carousel_image_error', 'ERROR', { slideId: id });
  };

  // Calculate transform
  const transformStyle = useMemo(() => {
    return { transform: `translateX(-${activeIndex * 100}%)` };
  }, [activeIndex]);

  // ARIA attributes
  const labelledById = 'carousel-title';

  return (
    <section
      className={`carousel ${className ?? ''}`.trim()}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onFocusCapture={() => handleFocus(true)}
      onBlurCapture={() => handleFocus(false)}
      onKeyDown={onKeyDown}
    >
      <div className="carousel-header">
        <h2 id={labelledById} className="carousel-title">Explore Our Services</h2>
        <p className="carousel-subtitle">Desktop, Laptop, Security, and Networking</p>
      </div>

      <div className="carousel-viewport" ref={containerRef} role="group" aria-labelledby={labelledById}>
        <div className="carousel-track" ref={trackRef} style={transformStyle}>
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const hasError = imageErrors[slide.id];

            return (
              <article
                key={slide.id}
                className={`carousel-slide${isActive ? ' is-active' : ''}`}
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${total}`}
              >
                <div className="media-wrapper" role="img" aria-label={slide.alt}>
                  {hasError ? (
                    <div className="fallback-block" aria-hidden="true">
                      <span className="fallback-label">{slide.title}</span>
                    </div>
                  ) : (
                    <img
                      src={slide.imageSrc}
                      alt={slide.alt}
                      loading="lazy"
                      className="responsive"
                      onError={() => onImageError(slide.id)}
                    />
                  )}
                  <div className="overlay">
                    <h3 className="overlay-title">{slide.title}</h3>
                    {slide.caption && <p className="overlay-caption">{slide.caption}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Controls */}
        <button
          type="button"
          className="control control-prev"
          aria-label="Previous slide"
          onClick={() => {
            try {
              prev('arrow');
              logUIEvent('carousel_prev_click', 'READ', { index: activeIndex });
            } catch (err) {
              logUIEvent('carousel_prev_error', 'ERROR', { message: (err as Error).message });
            }
          }}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="control control-next"
          aria-label="Next slide"
          onClick={() => {
            try {
              next('arrow');
              logUIEvent('carousel_next_click', 'READ', { index: activeIndex });
            } catch (err) {
              logUIEvent('carousel_next_error', 'ERROR', { message: (err as Error).message });
            }
          }}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      {/* Indicators */}
      <div className="carousel-indicators" role="tablist" aria-label="Slide indicators">
        {slides.map((_, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={`dot-${i}`}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'true' : undefined}
              className={`indicator${active ? ' is-active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                try {
                  goTo(i, 'dot');
                  logUIEvent('carousel_indicator_click', 'READ', { to: i });
                } catch (err) {
                  logUIEvent('carousel_indicator_error', 'ERROR', { message: (err as Error).message });
                }
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

/* ============================================================================
   Hooks and helpers
   ============================================================================
*/
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

type SwipeHandlers = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
};

function useSwipe(
  ref: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  threshold = 30
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      try {
        if (handlers.onTouchStart) handlers.onTouchStart();
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
      } catch (err) {
        logUIEvent('carousel_touchstart_error', 'ERROR', { message: (err as Error).message });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      // prevent vertical scroll threshold issues minimally
      // do not preventDefault to keep scroll when vertical predominantly
    };

    const onTouchEnd = (e: TouchEvent) => {
      try {
        if (!tracking) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          if (dx < 0) handlers.onSwipeLeft();
          else handlers.onSwipeRight();
        }
        if (handlers.onTouchEnd) handlers.onTouchEnd();
      } catch (err) {
        logUIEvent('carousel_touchend_error', 'ERROR', { message: (err as Error).message });
      } finally {
        tracking = false;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, handlers, threshold]);
}

/* ============================================================================
   RELEASE GATE CHECKLIST (short)
   - [x] Inputs validated (slides non-empty, autoplay interval > 0)
   - [x] Audit trail hooks implemented (nav, autoplay start/stop, errors)
   - [x] Error handling with graceful fallback on image errors
   - [x] Accessible roles/labels/aria-current
   - [x] Reduced motion respected
   - [x] Mobile-first with partial neighbor visibility
   ============================================================================
*/
