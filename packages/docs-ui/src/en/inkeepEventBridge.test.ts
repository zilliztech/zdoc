import {describe, it, expect, beforeEach} from 'vitest';

import {handleInkeepSearchEvent} from './inkeepEventBridge';

describe('handleInkeepSearchEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('maps a received search response to search_performed with its count', () => {
    handleInkeepSearchEvent({
      eventName: 'search_query_response_received',
      properties: {searchQuery: 'partition key', totalResults: 7},
    });
    expect(window.dataLayer).toEqual([
      {event: 'search_performed', search_term: 'partition key', result_count: '7', surface: 'modal'},
    ]);
  });

  it('omits result_count when the response carried no count', () => {
    handleInkeepSearchEvent({
      eventName: 'search_query_response_received',
      properties: {searchQuery: 'partition key'},
    });
    expect(window.dataLayer).toEqual([
      {event: 'search_performed', search_term: 'partition key', surface: 'modal'},
    ]);
  });

  it('drops a response event without a query', () => {
    handleInkeepSearchEvent({eventName: 'search_query_response_received'});
    expect(window.dataLayer).toEqual([]);
  });

  it('maps a clicked result, keeping the full URL for external sources', () => {
    handleInkeepSearchEvent({
      eventName: 'search_result_clicked',
      properties: {
        searchQuery: 'partition key',
        url: 'https://support.zilliz.com/hc/en-us/articles/1',
      },
    });
    expect(window.dataLayer).toEqual([
      {
        event: 'search_result_clicked',
        search_term: 'partition key',
        result_path: 'https://support.zilliz.com/hc/en-us/articles/1',
      },
    ]);
  });

  it('sends a click even when Inkeep omitted the query', () => {
    handleInkeepSearchEvent({
      eventName: 'search_result_clicked',
      properties: {url: '/docs/single-vector-search'},
    });
    expect(window.dataLayer).toEqual([
      {event: 'search_result_clicked', result_path: '/docs/single-vector-search'},
    ]);
  });

  it('drops a click that carries neither query nor url', () => {
    handleInkeepSearchEvent({eventName: 'search_result_clicked'});
    handleInkeepSearchEvent({eventName: 'search_result_clicked', properties: {}});
    expect(window.dataLayer).toEqual([]);
  });

  it('ignores chat, form, and widget events — we do not use the Inkeep assistant', () => {
    handleInkeepSearchEvent({eventName: 'assistant_message_received'});
    handleInkeepSearchEvent({eventName: 'search_query_submitted', properties: {searchQuery: 'x'}});
    handleInkeepSearchEvent({eventName: 'assistant_source_item_clicked'});
    expect(window.dataLayer).toEqual([]);
  });
});
