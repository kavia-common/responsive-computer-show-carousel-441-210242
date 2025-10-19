import React from 'react';

/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-ERR-001
// User Story: As a user, I want helpful feedback if something goes wrong,
//             without the whole app crashing.
// Acceptance Criteria: Error boundary renders a friendly message and logs error.
// GxP Impact: NO - Frontend presentation, logs via console only.
// Risk Level: LOW
// Validation Protocol: VP-ERR-001
// ============================================================================ 
 */

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary component catches runtime errors in its subtree.
 * Provides accessible error messaging and logs technical details.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /** @param {Error} error @param {React.ErrorInfo} info */
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    this.setState({ hasError: true });
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div role="alert" aria-live="assertive" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong.</h2>
          <p>We’re sorry. Please try reloading the page or coming back later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
