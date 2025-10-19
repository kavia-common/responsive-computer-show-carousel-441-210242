import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// PUBLIC_INTERFACE
function bootstrap(): void {
  /** Entrypoint that renders the App (TypeScript) which includes the Carousel homepage */
  const rootElem = document.getElementById('root');
  if (!rootElem) {
    // Fail gracefully with a clear message if root is missing
    // eslint-disable-next-line no-console
    console.error('Root element with id="root" not found. Cannot mount React app.');
    return;
  }
  const root = ReactDOM.createRoot(rootElem);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
