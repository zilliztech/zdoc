import {describe, expect, it} from 'vitest';

import {LocalizeError, toErrorEnvelope} from '../src/domain/errors.js';
import {canonicalHash} from '../src/domain/hash.js';
import {transitionRun} from '../src/domain/state-machine.js';
import {findReverseInsertionAnchor} from '../src/domain/recovery.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

describe('domain foundations', () => {
  it('hashes object keys canonically while preserving array order', () => {
    expect(canonicalHash({b: 2, a: 1})).toBe(canonicalHash({a: 1, b: 2}));
    expect(canonicalHash({items: ['a', 'b']})).not.toBe(canonicalHash({items: ['b', 'a']}));
  });

  it('allows a reviewed run to start applying', () => {
    expect(transitionRun('review_required', 'applying')).toBe('applying');
  });

  it('rejects an illegal transition from completed to applying', () => {
    expect(() => transitionRun('completed', 'applying')).toThrowError(
      expect.objectContaining({
        type: 'validation',
        subtype: 'illegal_state_transition',
      }),
    );
  });

  it('maps structured errors to stable envelopes and exit codes', () => {
    const error = new LocalizeError({
      type: 'stale_plan',
      subtype: 'source_revision_changed',
      message: 'The source revision changed.',
      hint: 'Regenerate the plan.',
      details: {expected: 10, actual: 11},
    });

    expect(error.exitCode).toBe(1);
    expect(toErrorEnvelope(error)).toEqual({
      ok: false,
      error: {
        type: 'stale_plan',
        subtype: 'source_revision_changed',
        message: 'The source revision changed.',
        hint: 'Regenerate the plan.',
        retryable: false,
        details: {expected: 10, actual: 11},
      },
    });
  });

  it('anchors consecutive deleted blocks after the nearest predecessor that still exists', () => {
    const document = parseFeishuDocument(
      '<p id="a">A</p><p id="b">B</p><p id="c">C</p>',
      {documentId: 'zh', revisionId: 1},
    );

    expect(findReverseInsertionAnchor(document, 'c', new Set(['b', 'c']))).toBe('a');
  });
});
