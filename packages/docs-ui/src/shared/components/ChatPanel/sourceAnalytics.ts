import {chatSurface} from './ChatContext';
import {trackEvent} from '../../utils/analytics';

/** Chat-surface GA4 helpers. The 404 page renders its own source chips, so
 * these are helpers, not components. */

/** Fires `ai_source_click` for a cited-doc link/chip click. Shared by the
 * chat panel's sources list, its inline citation superscripts, and the 404
 * page's source chips — the renderings differ, so this is a helper, not a
 * component. Host only (not the full URL): short, and full URLs would just
 * duplicate pagePath-style noise. source_index is 1-based to match the badge
 * the panel renders. */
export function trackAiSourceClick(url: string, index: number): void {
  let host = '';
  try {
    host = new URL(url, window.location.origin).hostname;
  } catch {
    host = '';
  }
  trackEvent('ai_source_click', {
    surface: chatSurface(),
    source_index: index + 1,
    source_host: host,
  });
}

/** Fires `chat_message_copy` when a user copies a whole assistant message from
 * the panel's per-message copy button. Only the surface is worth recording:
 * message content stays out of GA4. */
export function trackChatMessageCopy(): void {
  trackEvent('chat_message_copy', {surface: chatSurface()});
}
