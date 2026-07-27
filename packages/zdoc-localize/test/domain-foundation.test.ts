import {describe, expect, it} from 'vitest';

import {LocalizeError, toErrorEnvelope} from '../src/domain/errors.js';
import {canonicalHash} from '../src/domain/hash.js';
import {transitionRun} from '../src/domain/state-machine.js';

describe('domain foundations', () => {
  it('hashes object keys canonically while preserving array order', () => {
    expect(canonicalHash({b: 2, a: 1})).toBe(canonicalHash({a: 1, b: 2}));
    expect(canonicalHash({items: ['a', 'b']})).not.toBe(canonicalHash({items: ['b', 'a']}));
  });

  it('allows a reviewed run to start applying', () => {
    expect(transitionRun('review_required', 'applying')).toBe('applying');
  });

  it('allows an accepted bootstrap review to complete', () => {
    expect(transitionRun('review_required', 'completed', 'bootstrap')).toBe('completed');
  });

  it('does not let an ordinary reviewed localization skip apply and verification', () => {
    expect(() => transitionRun('review_required', 'completed')).toThrowError(
      expect.objectContaining({subtype: 'illegal_state_transition'}),
    );
  });

  it('does not let an applying run skip verification', () => {
    expect(() => transitionRun('applying', 'completed')).toThrowError(
      expect.objectContaining({subtype: 'illegal_state_transition'}),
    );
  });

  it('allows an applying run to pause for a planned manual action', () => {
    expect(transitionRun('applying', 'manual_action_required')).toBe('manual_action_required');
    expect(transitionRun('manual_action_required', 'verifying')).toBe('verifying');
  });

  it('does not let a manual-action run complete without verification', () => {
    expect(() => transitionRun('manual_action_required', 'completed')).toThrowError(
      expect.objectContaining({subtype: 'illegal_state_transition'}),
    );
  });

  it('allows a failed recovery attempt to remain partial', () => {
    expect(transitionRun('recovering', 'partial')).toBe('partial');
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
});
