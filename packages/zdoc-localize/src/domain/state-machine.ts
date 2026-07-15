import {LocalizeError} from './errors.js';
import type {RunState} from './model.js';

const transitions: Readonly<Record<RunState, readonly RunState[]>> = {
  scanning: ['classification_required', 'translation_required', 'blocked'],
  classification_required: ['translation_required', 'blocked'],
  translation_required: ['review_required', 'blocked'],
  review_required: ['stale', 'applying', 'blocked'],
  stale: ['scanning'],
  applying: ['verifying', 'partial', 'blocked'],
  verifying: ['completed', 'blocked'],
  completed: [],
  blocked: ['scanning'],
  partial: ['recovering'],
  recovering: ['scanning', 'blocked'],
};

export function transitionRun(current: RunState, next: RunState): RunState {
  if (!transitions[current].includes(next)) {
    throw new LocalizeError({
      type: 'validation',
      subtype: 'illegal_state_transition',
      message: `Cannot transition localization run from ${current} to ${next}.`,
      details: {current, next},
    });
  }
  return next;
}
