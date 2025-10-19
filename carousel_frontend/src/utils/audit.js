//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-AUDIT-001
// User Story: As a quality stakeholder, I want carousel interactions to be
//             logged for traceability and continuous improvement.
// Acceptance Criteria: Log slide change events with before/after index,
//                     timestamp (ISO 8601), action type, and user id placeholder.
// GxP Impact: YES - Audit Trail visibility (frontend-only placeholder).
// Risk Level: LOW
// Validation Protocol: VP-AUD-001
// ============================================================================

/**
 * PUBLIC_INTERFACE
 * Create an audit event payload.
 * @param {Object} params
 * @param {'READ'|'UPDATE'|'CREATE'|'DELETE'|'INTERACT'} params.action - Type of action
 * @param {string} params.component - Component name
 * @param {Object} [params.metadata] - Additional metadata to capture
 * @param {string} [params.userId] - Optional user id (placeholder until auth exists)
 * @returns {{timestamp: string, action: string, component: string, metadata: Object, userId: string}}
 */
export function createAuditEvent({ action, component, metadata = {}, userId = 'anonymous' }) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    action,
    component,
    metadata,
    userId,
  };
}

/**
 * PUBLIC_INTERFACE
 * Log an audit event. Currently logs to console; replace with transport integration as needed.
 * @param {ReturnType<typeof createAuditEvent>} event
 */
export function logAuditEvent(event) {
  try {
    // For production, integrate with remote collector endpoint here.
    // Keep logs concise to avoid PII exposure.
    // eslint-disable-next-line no-console
    console.info('[AUDIT]', JSON.stringify(event));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[AUDIT][ERROR]', e);
  }
}

/**
 * PUBLIC_INTERFACE
 * Convenience method for slide change logging.
 * @param {Object} params
 * @param {number} params.fromIndex - Previous slide index
 * @param {number} params.toIndex - Next slide index
 * @param {number} params.total - Total slides
 * @param {string} [params.userId]
 */
export function logSlideChange({ fromIndex, toIndex, total, userId = 'anonymous' }) {
  const event = createAuditEvent({
    action: 'INTERACT',
    component: 'Carousel',
    metadata: {
      interaction: 'slide_change',
      beforeIndex: Number.isFinite(fromIndex) ? fromIndex : null,
      afterIndex: Number.isFinite(toIndex) ? toIndex : null,
      totalSlides: Number.isFinite(total) ? total : null,
    },
    userId,
  });
  logAuditEvent(event);
}
