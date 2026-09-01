/**
 * Formats an ISO date string (YYYY-MM-DD) into a short friendly label.
 * e.g. "Mon 1"
 */
export function friendlyDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

/**
 * Formats a Unix timestamp (ms) into a friendly date-time string.
 * e.g. "Mon, Sep 1 · 6:24 PM"
 */
export function friendlyDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

/**
 * Returns a short weekday abbreviation from an ISO date string.
 * e.g. "Mon"
 */
export function shortWeekday(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Returns today's date as an ISO string, e.g. "2026-09-01"
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns an ISO date string for N days ago.
 */
export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
