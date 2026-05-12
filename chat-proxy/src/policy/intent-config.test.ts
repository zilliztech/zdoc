import {afterEach, describe, expect, it, vi} from 'vitest';

async function importIntent() {
  return import('./intent.js');
}

afterEach(() => {
  vi.doUnmock('./catalog.js');
  vi.resetModules();
});

describe('resolvePolicyIntent with configured trigger phrases', () => {
  it('matches intent from catalog trigger_phrases before fallback regex', async () => {
    vi.doMock('./catalog.js', () => ({
      loadTopicPolicies: vi.fn(() => [
        {
          intent_id: 'external_data_lake_search_how_it_works',
          fixed_facts: [],
          must_include: [],
          must_not_say: [],
          style: {language: 'same as user', tone: 'concise'},
          trigger_phrases: ['walk me through the lake search workflow in detail'],
        },
      ]),
    }));

    const {resolvePolicyIntent} = await importIntent();
    const intent = resolvePolicyIntent('Walk me through the lake search workflow in detail', ['on-demand-search']);
    expect(intent).toBe('external_data_lake_search_how_it_works');
  });
});
