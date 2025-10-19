/**
 * ============================================================================
 * REQUIREMENT TRACEABILITY
 * ============================================================================
 * Requirement ID: REQ-CAR-001
 * User Story: As a visitor, I want to navigate a carousel so I can learn about services.
 * Acceptance Criteria: Events for navigation and autoplay are logged with timestamp, user placeholder, and metadata.
 * GxP Impact: NO - Presentation/UI only; no patient or regulated data processed.
 * Risk Level: LOW
 * Validation Protocol: VP-CAR-UI-001
 * ============================================================================
 */

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'ERROR' | 'INFO';

export interface AuditEvent {
  eventName: string;
  action: AuditAction;
  userId: string; // placeholder; replace with auth context in future
  timestamp: string; // ISO 8601
  metadata?: Record<string, unknown>;
}

/**
 * PUBLIC_INTERFACE
 * logUIEvent
 * ----------------------------------------------------------------------------
 * JSDoc:
 * Logs a UI event in a lightweight audit trail format to the console. This is a
 * placeholder to be wired to a backend in the future.
 *
 * @param {string} eventName - A short, descriptive name for the event.
 * @param {AuditAction} action - The action classification.
 * @param {Record<string, unknown>=} metadata - Optional additional details.
 * @returns {AuditEvent} The event object that was logged.
 *
 * GxP Annotations:
 * - Attributable: userId placeholder used ('anonymous') until auth integration.
 * - Contemporaneous: Timestamp captured at the time of logging in ISO format.
 * - Accurate/Complete: All provided metadata included as-is.
 * Throws: None
 */
export function logUIEvent(
  eventName: string,
  action: AuditAction,
  metadata?: Record<string, unknown>
): AuditEvent {
  const evt: AuditEvent = {
    eventName,
    action,
    userId: 'anonymous',
    timestamp: new Date().toISOString(),
    metadata,
  };
  // In future replace with secure transport to backend audit service
  // eslint-disable-next-line no-console
  console.log('[AUDIT]', evt);
  return evt;
}
