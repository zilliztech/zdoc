/** Client-side analytics events. Events are pushed onto window.dataLayer, which
 * the GTM bootstrap (docusaurus-gtm-plugin) creates before any theme code
 * runs; the GTM containers turn each `event` value into a GA4 hit. The helper
 * is deliberately thin: consent gating, container routing, and GA4 parameter
 * registration all live in the GTM/GA4 configuration (see the analytics design
 * spec), so a dataLayer push is the entire integration surface. */

export type AnalyticsParamValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** GA4 caps event parameter values at 100 characters; longer values are cut,
 * not rejected, so truncating here keeps the hit valid. The `event` key is
 * reserved by GTM for the trigger name and is stripped from params. */
const MAX_PARAM_LENGTH = 100;

export function normalizeAnalyticsParams(
  params: Record<string, AnalyticsParamValue> = {},
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === 'event' || value === undefined || value === '') continue;
    normalized[key] = String(value).slice(0, MAX_PARAM_LENGTH);
  }
  return normalized;
}

export function trackEvent(name: string, params?: Record<string, AnalyticsParamValue>): void {
  if (typeof window === 'undefined') return;
  const event = name.trim();
  if (!event) return;
  const dataLayer = (window.dataLayer ??= []);
  dataLayer.push({event, ...normalizeAnalyticsParams(params)});
}

/** Buckets a duration for the ask_ai_completed event. GA4 parameter values are
 * strings, and a raw millisecond count is unreadable in reports; coarse
 * buckets keep the funnel legible without registering a custom metric. */
export function durationBucket(durationMs: number): string {
  if (durationMs < 1_000) return '<1s';
  if (durationMs < 3_000) return '1-3s';
  if (durationMs < 10_000) return '3-10s';
  if (durationMs < 30_000) return '10-30s';
  return '>30s';
}
