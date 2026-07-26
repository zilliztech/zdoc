import type {AgentType, ConfidenceLevel, GroundingCitation, Source} from './types';

const SESSION_EXPIRED_ERROR =
  'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.';
const GENERIC_ERROR = 'Something went wrong. Please refresh the page and try again.';

export interface AgentStreamState {
  contentSource: 'stream-event' | 'chunk' | null;
  blockTypes: Record<number, string>;
  toolCallCount: number;
}

export type AgentStreamUpdate =
  | {type: 'session'; sessionId: string}
  | {type: 'text'; text: string}
  | {type: 'agent'; name: string; agentType?: AgentType}
  | {type: 'status'; status: string}
  | {type: 'tool-call'; count: number}
  | {type: 'sources'; sources: Source[]}
  | {type: 'grounding'; citations: GroundingCitation[]}
  | {type: 'confidence'; level: ConfidenceLevel}
  | {type: 'error'; message: string}
  | {type: 'done'};

export function createAgentStreamState(): AgentStreamState {
  return {contentSource: null, blockTypes: {}, toolCallCount: 0};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function displayError(payload: Record<string, unknown>): string {
  const value = payload.error ?? payload.content ?? payload.message;
  return typeof value === 'string' && /session not found or inactive/i.test(value)
    ? SESSION_EXPIRED_ERROR
    : GENERIC_ERROR;
}

function isAgentType(value: unknown): value is AgentType {
  return ['general', 'schema', 'resources', 'product', 'code'].includes(String(value));
}

function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return ['high', 'medium', 'low'].includes(String(value));
}

export function parseAgentStreamEvent(
  eventName: string,
  raw: string,
  state: AgentStreamState,
): AgentStreamUpdate[] {
  if (raw === '[DONE]') return [{type: 'done'}];

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(raw) as Record<string, any>;
  } catch {
    return [];
  }

  const eventType = eventName || stringValue(payload.type) || '';

  if (['session', 'session_id', 'connected'].includes(eventType)) {
    const sessionId = stringValue(payload.sessionId) || stringValue(payload.session_id);
    return sessionId && !sessionId.startsWith('pending')
      ? [{type: 'session', sessionId}]
      : [];
  }

  if (eventType === 'stream-event' || eventType === 'stream_event') {
    const blockIndex = typeof payload.block_index === 'number' ? payload.block_index : null;
    if (
      payload.event_type === 'block_start' &&
      blockIndex !== null &&
      typeof payload.block_type === 'string'
    ) {
      state.blockTypes[blockIndex] = payload.block_type;
      return [];
    }
    if (payload.event_type === 'block_stop' && blockIndex !== null) {
      delete state.blockTypes[blockIndex];
      return [];
    }

    const delta = stringValue(payload.delta);
    if (!delta) return [];
    const blockType =
      stringValue(payload.block_type) ||
      (blockIndex === null ? undefined : state.blockTypes[blockIndex]);
    if (blockType === 'thinking' || state.contentSource === 'chunk') return [];

    state.contentSource = 'stream-event';
    return [{type: 'text', text: delta}];
  }

  if (eventType === 'chunk') {
    if (state.contentSource === 'stream-event') return [];
    const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
    if (data.type === 'tool_use') {
      state.toolCallCount += 1;
      return [{type: 'tool-call', count: state.toolCallCount}];
    }
    if (data.type !== 'text' || typeof data.text !== 'string' || !data.text) return [];

    state.contentSource = 'chunk';
    return [{type: 'text', text: data.text}];
  }

  if (eventType === 'delta') {
    const text = stringValue(payload.text) || stringValue(payload.delta);
    return text ? [{type: 'text', text}] : [];
  }
  if (eventType === 'agent') {
    const name = stringValue(payload.name) || stringValue(payload.type);
    if (!name) return [];
    return [{
      type: 'agent',
      name,
      ...(isAgentType(payload.type) ? {agentType: payload.type} : {}),
    }];
  }
  if (eventType === 'status') {
    const status =
      stringValue(payload.phase) ||
      stringValue(payload.status) ||
      stringValue(payload.message);
    return status ? [{type: 'status', status}] : [];
  }
  if (eventType === 'tool-call') {
    const count = typeof payload.count === 'number' ? payload.count : state.toolCallCount + 1;
    state.toolCallCount = count;
    return [{type: 'tool-call', count}];
  }
  if (eventType === 'sources' && Array.isArray(payload.sources)) {
    return [{type: 'sources', sources: payload.sources as Source[]}];
  }
  if (eventType === 'grounding' && Array.isArray(payload.citations)) {
    return [{type: 'grounding', citations: payload.citations as GroundingCitation[]}];
  }
  if (eventType === 'confidence' && isConfidenceLevel(payload.level)) {
    return [{type: 'confidence', level: payload.level}];
  }
  if (eventType === 'error') return [{type: 'error', message: displayError(payload)}];
  if (['done', 'complete', 'completed'].includes(eventType)) return [{type: 'done'}];
  return [];
}
