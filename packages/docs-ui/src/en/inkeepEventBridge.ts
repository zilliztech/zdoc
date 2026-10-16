import {trackEvent} from '../shared/utils/analytics';

/** Structural subset of `@inkeep/cxkit-types`' `InkeepCallbackEvent` — only the
 * fields this bridge reads. Declared locally on purpose: docs-ui keeps no
 * static dependency on the Inkeep SDK (the modal loads it on demand), and the
 * bridge should keep working across minor SDK type churn. */

export interface InkeepSearchCallbackEvent {
  eventName: string;
  properties?: {
    searchQuery?: string;
    totalResults?: number;
    url?: string;
  };
}

/** Forwards the Inkeep search modal's widget events onto the dataLayer. The
 * production English build renders Inkeep's modal (`searchProvider: 'inkeep'`);
 * the docs-ui `theme/Search` swizzle that used to emit these events is
 * tree-shaken out of both production builds, so without this bridge the
 * `search_performed` and `search_result_clicked` GTM tags never fire.
 *
 * Only the three search events are mapped. We never use Inkeep's assistant
 * (Ask-AI is the docs-ui chat panel hitting our own backend), so chat, form,
 * and widget events are dropped. `search_query_response_received` fires once
 * per settled query batch — the same cadence the previous modal emitted — so
 * typing a longer term reports each intermediate prefix; GA4 volume is free
 * and analysts filter by term. `search_query_submitted` (Enter) is redundant:
 * every submitted query also produced a response event. */
export function handleInkeepSearchEvent(event: InkeepSearchCallbackEvent): void {
  switch (event.eventName) {
    case 'search_query_response_received': {
      const {searchQuery, totalResults} = event.properties ?? {};
      if (!searchQuery) return;
      trackEvent('search_performed', {
        search_term: searchQuery,
        result_count: totalResults,
        surface: 'modal',
      });
      break;
    }
    case 'search_result_clicked': {
      const {searchQuery, url} = event.properties ?? {};
      if (!searchQuery && !url) return;
      trackEvent('search_result_clicked', {
        search_term: searchQuery,
        result_path: url,
      });
      break;
    }
    default:
      break;
  }
}
