const USER_ID_KEY = 'zd-user-id';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** A browser identifier for session correlation, never an authenticated identity. */
export function getVisitorId(): string | undefined {
  try {
    const stored = localStorage.getItem(USER_ID_KEY);
    const existing = stored?.replace(/^browser:v1:/, '');
    if (existing && UUID_V4.test(existing)) return `browser:v1:${existing.toLowerCase()}`;

    let id: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
      id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } else {
      return undefined;
    }
    if (!UUID_V4.test(id)) return undefined;
    // Keep the existing key and raw UUID format so feedback and old clients share it.
    localStorage.setItem(USER_ID_KEY, id.toLowerCase());
    return `browser:v1:${id.toLowerCase()}`;
  } catch {
    // A transient ID would falsely count every request as a different visitor.
    return undefined;
  }
}
