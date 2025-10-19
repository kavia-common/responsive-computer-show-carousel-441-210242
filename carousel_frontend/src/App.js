import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/theme.css';
import Carousel from './components/Carousel';
import ErrorBoundary from './components/ErrorBoundary';
import { getDefaultSlides } from './data/slides';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App" style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
      <header className="App-header" style={{ minHeight: 'auto', paddingTop: 56, paddingBottom: 24 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div style={{ padding: '16px 16px 0', textAlign: 'left', width: '100%', maxWidth: 1200 }}>
          <h1 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>Computer Show</h1>
          <p style={{ margin: 0, color: 'rgba(17, 24, 39, 0.8)' }}>
            Explore our services – mobile-first carousel with smooth, accessible interactions.
          </p>
        </div>
      </header>

      <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          <ErrorBoundary>
            <Carousel slides={getDefaultSlides()} />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
