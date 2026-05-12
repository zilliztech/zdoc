export interface PolicyStyle {
  language: string;
  tone: string;
}

export interface PolicyPayload {
  intent_id: string;
  fixed_facts: string[];
  must_include: string[];
  must_not_say: string[];
  response_outline?: string[];
  trigger_phrases?: string[];
  style: PolicyStyle;
}

export interface PolicyValidationViolation {
  type: 'quality_empty' | 'quality_too_short' | 'quality_low_actionability';
  value: string;
  message: string;
}

export interface PolicyValidationResult {
  ok: boolean;
  violations: PolicyValidationViolation[];
}
