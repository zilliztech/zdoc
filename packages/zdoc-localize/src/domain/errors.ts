export type LocalizeErrorType =
  | 'validation'
  | 'configuration'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'compatibility'
  | 'stale_plan'
  | 'alignment_blocked'
  | 'unsupported_content'
  | 'confirmation_required'
  | 'partial_write'
  | 'verification_failed'
  | 'upstream'
  | 'internal';

export interface LocalizeErrorInput {
  type: LocalizeErrorType;
  subtype?: string;
  message: string;
  hint?: string;
  retryable?: boolean;
  details?: unknown;
}

function exitCodeFor(type: LocalizeErrorType, retryable: boolean): number {
  if (type === 'confirmation_required') return 10;
  if (type === 'validation') return 2;
  if (type === 'configuration' || type === 'authentication' || type === 'authorization') return 3;
  if (type === 'upstream' && retryable) return 4;
  if (type === 'verification_failed' || type === 'internal') return 5;
  return 1;
}

export class LocalizeError extends Error {
  readonly type: LocalizeErrorType;
  readonly subtype?: string;
  readonly hint?: string;
  readonly retryable: boolean;
  readonly details?: unknown;
  readonly exitCode: number;

  constructor(input: LocalizeErrorInput) {
    super(input.message);
    this.name = 'LocalizeError';
    this.type = input.type;
    this.subtype = input.subtype;
    this.hint = input.hint;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
    this.exitCode = exitCodeFor(this.type, this.retryable);
  }
}

export function toErrorEnvelope(error: LocalizeError): {
  ok: false;
  error: {
    type: LocalizeErrorType;
    subtype?: string;
    message: string;
    hint?: string;
    retryable: boolean;
    details?: unknown;
  };
} {
  return {
    ok: false,
    error: {
      type: error.type,
      ...(error.subtype ? {subtype: error.subtype} : {}),
      message: error.message,
      ...(error.hint ? {hint: error.hint} : {}),
      retryable: error.retryable,
      ...(error.details === undefined ? {} : {details: error.details}),
    },
  };
}

export function asLocalizeError(error: unknown): LocalizeError {
  if (error instanceof LocalizeError) return error;
  return new LocalizeError({
    type: 'internal',
    message: error instanceof Error ? error.message : String(error),
  });
}
