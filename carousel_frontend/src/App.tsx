import React, { useEffect, useState } from 'react';
import './App.css';
import { Carousel, Slide } from './components/Carousel/Carousel.tsx';

// Attempt to import available assets. We know laptop.jpg exists. desktop.jpg may not exist, so we handle gracefully.
import laptopImg from './assets/carousel/laptop.jpg';

// PUBLIC_INTERFACE
export default function App(): React.ReactElement {
  /**
   * This App component applies theme data-attribute, renders site branding and
   * a responsive Carousel configured for autoplay while respecting reduced motion,
   * and includes accessible labelling and keyboard support (handled inside Carousel).
   */

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Basic handler to toggle theme for demonstration (respects App.css variables)
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Build slide data. We use laptop image as a fallback for any missing ones.
  // Note: require() with a dynamic string won't be bundled by CRA; tryResolveImage covers optionality,
  // but we restrict to a known import for laptop and gracefully fall back for any others.
  const desktopSrc = tryResolveImage('./assets/carousel/desktop.jpg') ?? laptopImg;
  const laptopSrc = laptopImg;
  const securitySrc = laptopImg; // Placeholder/fallback per instructions
  const networkingSrc = laptopImg; // Placeholder/fallback per instructions

  const slides: Slide[] = [
    {
      id: 'desktop',
      title: 'Desktop Solutions',
      caption: 'Custom builds and performance tuning for professionals.',
      imageSrc: desktopSrc,
      alt: 'High-performance desktop workstation on a clean desk',
    },
    {
      id: 'laptop',
      title: 'Laptop Services',
      caption: 'Upgrades, maintenance, and productivity optimization.',
      imageSrc: laptopSrc,
      alt: 'Modern laptop open on a table with soft ambient lighting',
    },
    {
      id: 'security',
      title: 'Security',
      caption: 'Endpoint protection, encryption, and threat monitoring.',
      imageSrc: securitySrc,
      alt: 'Abstract security shield concept representing device protection',
    },
    {
      id: 'networking',
      title: 'Networking',
      caption: 'Reliable home and office networks with expert setup.',
      imageSrc: networkingSrc,
      alt: 'Networking equipment and cables in a tidy setup',
    },
  ];

  // Determine autoplay respecting prefers-reduced-motion
  const prefersReducedMotion = usePrefersReducedMotion();
  const autoplayEnabled = !prefersReducedMotion;

  return (
    <div className="App app-bg">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">💻</span>
          <div className="brand-text">
            <h1 className="site-title">Computer Show</h1>
            <p className="site-tagline">Desktop • Laptop • Security • Networking</p>
          </div>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="content">
        <Carousel
          slides={slides}
          autoplay={{ enabled: autoplayEnabled, intervalMs: 5000 }}
          ariaLabel="Computer Show services carousel"
          className="homepage-carousel"
        />
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * tryResolveImage
 * Attempts to dynamically require an asset path. Returns undefined if not found.
 */
function tryResolveImage(relativePath: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const mod = require(`${relativePath}`);
    return mod?.default ?? mod;
  } catch {
    return undefined;
  }
}

/**
 * PUBLIC_INTERFACE
 * usePrefersReducedMotion
 * Detects reduced motion preference to disable autoplay if needed.
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
