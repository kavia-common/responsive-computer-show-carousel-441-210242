//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CAROUSEL-001
// User Story: As a visitor, I want to swipe through desktop, laptop, security,
//             and networking slides so I can quickly understand offerings.
// Acceptance Criteria: 4 slides with title, description, and image paths.
// GxP Impact: NO - Frontend-only content data.
// Risk Level: LOW
// Validation Protocol: N/A
// ============================================================================

/**
 * @typedef {Object} CarouselSlide
 * @property {string} id - Unique identifier for the slide
 * @property {string} title - Title text for the slide
 * @property {string} description - Short description for the slide
 * @property {string} image - Public path to the image asset
 * @property {string} [alt] - Alternative text for accessibility
 */

/**
 * Validate an array of slide objects and sanitize invalid entries.
 * PUBLIC_INTERFACE
 * @param {unknown} items - Candidate slide array
 * @returns {CarouselSlide[]} - Validated slide array
 */
export function validateSlides(items) {
  const fallback = {
    id: 'fallback',
    title: 'Unavailable',
    description: 'Content could not be loaded.',
    image: '/images/placeholder.jpg',
    alt: 'Placeholder image',
  };

  if (!Array.isArray(items)) return [fallback];

  return items
    .filter((s) => s && typeof s === 'object')
    .map((s, idx) => {
      const id = typeof s.id === 'string' && s.id.trim() ? s.id : `slide-${idx}`;
      const title = typeof s.title === 'string' && s.title.trim() ? s.title.trim() : 'Untitled';
      const description =
        typeof s.description === 'string' && s.description.trim()
          ? s.description.trim()
          : 'No description provided.';
      const image = typeof s.image === 'string' && s.image.trim() ? s.image.trim() : '/images/placeholder.jpg';
      const alt =
        typeof s.alt === 'string' && s.alt.trim()
          ? s.alt.trim()
          : `${title} image`;

      return { id, title, description, image, alt };
    });
}

/**
 * Default data source for the carousel slides.
 * PUBLIC_INTERFACE
 * @returns {CarouselSlide[]} Slides data
 */
export function getDefaultSlides() {
  return validateSlides([
    {
      id: 'desktop',
      title: 'Desktop Solutions',
      description: 'High-performance workstations tailored for business.',
      image: '/images/desktop.jpg',
      alt: 'Desktop workstation',
    },
    {
      id: 'laptop',
      title: 'Laptop Fleet',
      description: 'Lightweight, powerful laptops for mobility and productivity.',
      image: '/images/laptop.jpg',
      alt: 'Modern laptop',
    },
    {
      id: 'security',
      title: 'Security Services',
      description: 'Protect your assets with proactive monitoring and response.',
      image: '/images/security.jpg',
      alt: 'Cybersecurity concept',
    },
    {
      id: 'networking',
      title: 'Networking',
      description: 'Reliable, scalable networks for seamless connectivity.',
      image: '/images/networking.jpg',
      alt: 'Network cables and switches',
    },
  ]);
}
