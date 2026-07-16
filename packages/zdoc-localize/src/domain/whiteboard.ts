import {canonicalHash} from './hash.js';

const identityKeys = new Set(['id', 'node_id', 'uuid']);
const timestampKeys = new Set(['created_at', 'updated_at', 'create_time', 'update_time']);
const boardTokenKeys = new Set(['board_token', 'whiteboard_token']);

function collectIdentities(value: unknown, identities: Map<string, string>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIdentities(item, identities));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (identityKeys.has(key) && typeof child === 'string' && !identities.has(child)) {
      identities.set(child, `<node-${identities.size + 1}>`);
    }
    collectIdentities(child, identities);
  }
}

function normalizeValue(value: unknown, identities: Map<string, string>): unknown {
  if (typeof value === 'string') return identities.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, identities));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => {
      if (timestampKeys.has(key)) return [key, '<timestamp>'];
      if (boardTokenKeys.has(key)) return [key, '<board-token>'];
      return [key, normalizeValue(child, identities)];
    }));
}

export function normalizeWhiteboardRaw(raw: unknown): unknown {
  const identities = new Map<string, string>();
  collectIdentities(raw, identities);
  return normalizeValue(raw, identities);
}

export interface CanonicalWhiteboard {
  raw: unknown;
  normalized: unknown;
  hash: string;
}

export function canonicalWhiteboard(raw: unknown): CanonicalWhiteboard {
  const normalized = normalizeWhiteboardRaw(raw);
  return {raw, normalized, hash: canonicalHash(normalized)};
}
