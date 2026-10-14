import {chatSurface} from './ChatContext';
import {trackEvent} from '../../utils/analytics';

/** Fires `ai_source_click` for a cited-doc link/chip click. Shared by the
 * chat panel's sources list and the 404 page's source chips — the two
 * renderings differ, so this is a helper, not a component. Host only (not the
 * full URL): short, and full URLs would just duplicate pagePath-style noise.
 * source_index is 1-based to match the badge the panel renders. */
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
