import {describe, expect, it} from 'vitest';

import {feishuRegistrySchema} from '../src/adapters/lark-base-schema.js';
import {canonicalHash, canonicalJson} from '../src/domain/hash.js';

describe('Feishu registry schema', () => {
  it('uses filterable labels for controlled workflow values', () => {
    const pairs = feishuRegistrySchema.tables.documentPairs.fields;
    const runs = feishuRegistrySchema.tables.localizationRuns.fields;

    expect(pairs.find((field) => field.name === 'status')).toMatchObject({type: 'select', multiple: false});
    expect(pairs.find((field) => field.name === 'mode')).toMatchObject({type: 'select', multiple: false});
    expect(runs.find((field) => field.name === 'state')).toMatchObject({
      type: 'select',
      options: expect.arrayContaining([
        expect.objectContaining({name: 'review_required'}),
        expect.objectContaining({name: 'manual_action_required'}),
        expect.objectContaining({name: 'partial'}),
      ]),
    });
  });

  it('keeps machine payloads and dynamic scopes out of fixed labels', () => {
    const pairs = feishuRegistrySchema.tables.documentPairs.fields;
    const runs = feishuRegistrySchema.tables.localizationRuns.fields;

    expect(pairs.find((field) => field.name === 'version_scope')).toMatchObject({type: 'text'});
    expect(runs.find((field) => field.name === 'payload_json')).toMatchObject({type: 'text'});
  });

  it('defines the approved operational views', () => {
    expect(feishuRegistrySchema.views.localizationRuns.map((view) => view.name)).toEqual([
      'Needs Review',
      'Blocked or Partial',
      'Completed',
    ]);
    expect(feishuRegistrySchema.views.localizationRuns[0]?.filter.conditions).toEqual([
      ['state', 'intersects', [
        'classification_required',
        'translation_required',
        'review_required',
        'manual_action_required',
      ]],
    ]);
  });

  it('pins the release registry contract by canonical identity', () => {
    expect(canonicalJson(feishuRegistrySchema)).toHaveLength(5773);
    expect(canonicalHash(feishuRegistrySchema)).toBe('792285b9e93a2f1459c8c18e532b5a5a1e395a9fa6f0769419b4e3544899a657');
  });
});
