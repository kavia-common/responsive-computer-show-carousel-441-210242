import React from 'react';
import PropTypes from 'prop-types';
import { logSlideChange } from '../utils/audit';
import CarouselSlide from './CarouselSlide';

/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CAROUSEL-CORE-001
// User Story: As a visitor, I want a touch-friendly, accessible carousel to
//             browse slides with smooth transitions and keyboard support.
// Acceptance Criteria:
//  - Renders 4 slides (Desktop, Laptop, Security, Networking)
//  - Mobile-first with partially visible neighbors, swipe/drag, keyboard nav
//  - Ocean Professional theme, ARIA roles/labels
//  - Error handling for data/images, audit logging on slide change
// GxP Impact: YES - user interaction audit logging (frontend placeholder)
// Risk Level: LOW
// Validation Protocol: VP-CAROUSEL-001
// ============================================================================ 
 */

/**
 * PUBLIC_INTERFACE
 * Carousel Component
 * @param {Object} props
 * @param {Array} props.slides - Validated slides array
 * @param {number} [props.startIndex=0] - Initial active index
 * @param {string} [props.userId] - User id for audit logging (placeholder)
 */
export function Carousel({ slides, startIndex = 0, userId = 'anonymous' }) {
  const trackRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(
    Number.isFinite(startIndex) && startIndex >= 0 && startIndex < slides.length ? startIndex : 0
  );

  // Touch/drag state
  const posRef = React.useRef({ startX: 0, currentX: 0, isDragging: false, startTranslate: 0 });
  const animRef = React.useRef(0);

  const clampIndex = React.useCallback(
    (idx) => Math.max(0, Math.min(idx, slides.length - 1)),
    [slides.length]
  );

  const goTo = React.useCallback(
    (nextIdx) => {
      setActiveIndex((prev) => {
        const clamped = clampIndex(nextIdx);
        if (clamped !== prev) {
          logSlideChange({ fromIndex: prev, toIndex: clamped, total: slides.length, userId });
        }
        return clamped;
      });
    },
    [clampIndex, slides.length, userId]
  );

  const next = React.useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = React.useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  // Calculate slide width based on current viewport
  const getSlideWidth = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    const styles = window.getComputedStyle(container);
    const paddingLeft = parseFloat(styles.paddingLeft || '0');
    const paddingRight = parseFloat(styles.paddingRight || '0');
    const width = container.clientWidth - paddingLeft - paddingRight;

    // Match CSS breakpoints and slide size percentages
    if (window.matchMedia('(min-width: 1024px)').matches) {
      return width * (1 / 3); // 33.333%
    }
    if (window.matchMedia('(min-width: 640px)').matches) {
      return width * 0.6; // 60%
    }
    return width * 0.8; // 80% mobile
  }, []);

  const applyTransform = React.useCallback(
    (translateX) => {
      const track = trackRef.current;
      if (track) {
        track.style.transform = `translateX(${translateX}px)`;
      }
    },
    []
  );

  // Align to active index
  React.useEffect(() => {
    const slideW = getSlideWidth();
    const gap = 32; // 16px margin left + right
    const translateX = -(activeIndex * (slideW + gap));
    applyTransform(translateX);
  }, [activeIndex, getSlideWidth, applyTransform]);

  // Resize observer to re-align on viewport changes
  React.useEffect(() => {
    const handle = () => {
      const slideW = getSlideWidth();
      const gap = 32;
      const translateX = -(activeIndex * (slideW + gap));
      applyTransform(translateX);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [activeIndex, getSlideWidth, applyTransform]);

  // Touch/drag handlers
  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    posRef.current.isDragging = true;
    posRef.current.startX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;

    // Read current translateX from style (cross-browser)
    const style = window.getComputedStyle(track);
    const transform = style.transform || style.webkitTransform || 'none';
    let startTranslate = 0;
    if (transform && transform !== 'none') {
      // Examples:
      // matrix(a, b, c, d, tx, ty)
      // matrix3d(a1, a2, ..., a16) where tx is at position 13 (zero-based index 12)
      const values = transform.match(/matrix(3d)?\((.+)\)/i);
      if (values && values[2]) {
        const parts = values[2].split(',').map((v) => parseFloat(v.trim()));
        if (/matrix3d/i.test(values[0])) {
          // 3d matrix: tx at index 12
          startTranslate = Number.isFinite(parts[12]) ? parts[12] : 0;
        } else {
          // 2d matrix: tx at index 4
          startTranslate = Number.isFinite(parts[4]) ? parts[4] : 0;
        }
      }
    }
    posRef.current.startTranslate = startTranslate;

    track.setPointerCapture?.(e.pointerId || 0);
  };

  const onPointerMove = (e) => {
    if (!posRef.current.isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    posRef.current.currentX = currentX;
    const delta = currentX - posRef.current.startX;
    const translateX = posRef.current.startTranslate + delta;
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(() => applyTransform(translateX));
  };

  const onPointerUp = () => {
    if (!posRef.current.isDragging) return;
    posRef.current.isDragging = false;

    const delta = posRef.current.currentX - posRef.current.startX;
    const threshold = 40; // px threshold
    if (Math.abs(delta) > threshold) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    } else {
      // Snap back to active slide
      const slideW = getSlideWidth();
      const gap = 32;
      const translateX = -(activeIndex * (slideW + gap));
      applyTransform(translateX);
    }
  };

  // ARIA labels and roles
  const labelId = 'carousel-heading';

  return (
    <section
      className="carousel-container"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onKeyDown={onKeyDown}
      ref={containerRef}
    >
      <h2 id={labelId} className="visually-hidden">
        Services carousel
      </h2>

      <div
        className="carousel"
        role="group"
        aria-label="Slides"
      >
        <div
          className="carousel-track"
          ref={trackRef}
          style={{ touchAction: 'pan-y' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        >
          {slides.map((s, idx) => (
            <CarouselSlide
              key={s.id || idx}
              title={s.title}
              description={s.description}
              image={s.image}
              alt={s.alt}
            />
          ))}
        </div>
      </div>

      <div className="carousel-controls" role="group" aria-label="Carousel controls">
        <button
          type="button"
          className="carousel-button"
          aria-label="Previous slide"
          onClick={prev}
          disabled={activeIndex === 0}
        >
          ◀ Prev
        </button>
        <span aria-live="polite" aria-atomic="true">
          {activeIndex + 1} / {slides.length}
        </span>
        <button
          type="button"
          className="carousel-button"
          aria-label="Next slide"
          onClick={next}
          disabled={activeIndex === slides.length - 1}
        >
          Next ▶
        </button>
      </div>

      <div className="carousel-indicators" role="tablist" aria-label="Slide indicators">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            role="tab"
            aria-selected={activeIndex === idx}
            aria-controls={`slide-${idx}`}
            className={`carousel-dot ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => goTo(idx)}
            title={`Go to slide ${idx + 1}: ${s.title}`}
          />
        ))}
      </div>
    </section>
  );
}

Carousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      alt: PropTypes.string,
    })
  ).isRequired,
  startIndex: PropTypes.number,
  userId: PropTypes.string,
};

export default Carousel;
