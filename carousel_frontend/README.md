# React Carousel - Ocean Professional

This app implements a mobile-first, accessible carousel showcasing Desktop, Laptop, Security, and Networking services with Ocean Professional theme.

Key highlights:
- Mobile-first with partially visible neighbor slides
- Touch/drag and keyboard navigation
- ARIA roles/labels, focus-safe controls
- Error boundary and slide image fallback
- Client-side audit hooks (console) with ISO timestamps, before/after indices
- Prop validation with PropTypes
- Test scaffolding for core navigation logic

Files:
- `src/components/Carousel.jsx` – core carousel
- `src/components/CarouselSlide.jsx` – presentational slide
- `src/components/ErrorBoundary.jsx` – error boundary wrapper
- `src/utils/audit.js` – audit hooks
- `src/data/slides.js` – slide data + validation
- `src/styles/theme.css` – Ocean Professional theme
- `src/__tests__/Carousel.test.jsx` – unit tests

Run:
- `npm start`
- `npm test`
- `npm run build`

GxP note: Audit hooks are client-side placeholders; integrate with authenticated user context and a secure collector for production compliance.
