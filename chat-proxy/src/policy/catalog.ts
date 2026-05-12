import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import type {PolicyPayload} from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POLICY_DIR = join(__dirname, '..', '..', 'policies');

const cache = new Map<string, PolicyPayload[]>();
const TOPIC_NAME_PATTERN = /^[a-z0-9-]+$/;

function isPolicyPayload(value: unknown): value is PolicyPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const policy = value as Record<string, unknown>;
  const style = policy.style;

  return typeof policy.intent_id === 'string'
    && Array.isArray(policy.fixed_facts)
    && policy.fixed_facts.every(item => typeof item === 'string')
    && Array.isArray(policy.must_include)
    && policy.must_include.every(item => typeof item === 'string')
    && Array.isArray(policy.must_not_say)
    && policy.must_not_say.every(item => typeof item === 'string')
    && (policy.response_outline === undefined || (Array.isArray(policy.response_outline) && policy.response_outline.every(item => typeof item === 'string')))
    && (policy.trigger_phrases === undefined || (Array.isArray(policy.trigger_phrases) && policy.trigger_phrases.every(item => typeof item === 'string')))
    && !!style
    && typeof style === 'object'
    && typeof (style as Record<string, unknown>).language === 'string'
    && typeof (style as Record<string, unknown>).tone === 'string';
}

function clonePolicy(policy: PolicyPayload): PolicyPayload {
  return {
    intent_id: policy.intent_id,
    fixed_facts: [...policy.fixed_facts],
    must_include: [...policy.must_include],
    must_not_say: [...policy.must_not_say],
    response_outline: policy.response_outline ? [...policy.response_outline] : undefined,
    trigger_phrases: policy.trigger_phrases ? [...policy.trigger_phrases] : undefined,
    style: {
      language: policy.style.language,
      tone: policy.style.tone,
    },
  };
}

function clonePolicies(policies: PolicyPayload[]): PolicyPayload[] {
  return policies.map(clonePolicy);
}

export function loadTopicPolicies(topic: string): PolicyPayload[] {
  if (!TOPIC_NAME_PATTERN.test(topic)) {
    return [];
  }

  const cached = cache.get(topic);
  if (cached) {
    return clonePolicies(cached);
  }

  try {
    const filePath = join(POLICY_DIR, `${topic}.yaml`);
    const raw = readFileSync(filePath, 'utf-8');
    const doc = yaml.load(raw) as {policies?: unknown};
    const policies = Array.isArray(doc?.policies) && doc.policies.every(isPolicyPayload)
      ? doc.policies
      : [];

    if (policies.length > 0) {
      cache.set(topic, clonePolicies(policies));
    }

    return clonePolicies(policies);
  } catch {
    return [];
  }
}

export function getPolicyByIntent(topic: string, intentId: string): PolicyPayload | null {
  const policies = cache.get(topic) ?? loadTopicPolicies(topic);
  const policy = policies.find(p => p.intent_id === intentId);
  return policy ? clonePolicy(policy) : null;
}

export function clearPolicyCache(): void {
  cache.clear();
}
