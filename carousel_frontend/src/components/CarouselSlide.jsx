import React from 'react';
import PropTypes from 'prop-types';

/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CAROUSEL-SLIDE-001
// User Story: As a developer, I need a reusable slide component for Carousel.
// Acceptance Criteria: Accepts title, description, image, alt; handles missing image.
// GxP Impact: NO - Presentational.
// Risk Level: LOW
// ============================================================================ 
 */

/**
 * PUBLIC_INTERFACE
 * CarouselSlide renders a single slide with image, title, and description.
 */
export function CarouselSlide({ title, description, image, alt }) {
  const [error, setError] = React.useState(false);

  return (
    <article className="carousel-slide" tabIndex={-1}>
      <div className="carousel-slide-inner">
        <div className="slide-image-wrapper ocean-surface">
          {!error ? (
            <img
              className="slide-image"
              src={image}
              alt={alt || title}
              loading="lazy"
              onError={() => setError(true)}
            />
          ) : (
            <div
              role="img"
              aria-label={`${title} image unavailable`}
              className="slide-image"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                background:
                  'repeating-linear-gradient(45deg, rgba(37,99,235,0.08), rgba(37,99,235,0.08) 10px, rgba(249,250,251,1) 10px, rgba(249,250,251,1) 20px)',
              }}
            >
              Image unavailable
            </div>
          )}
        </div>
        <div className="slide-content">
          <h3 className="slide-title">{title}</h3>
          <p className="slide-desc">{description}</p>
        </div>
      </div>
    </article>
  );
}

CarouselSlide.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

CarouselSlide.defaultProps = {
  alt: '',
};

export default CarouselSlide;
