import {describe, expect, it} from 'vitest';
import {createAgentStreamState, parseAgentStreamEvent} from './agentStream';

describe('parseAgentStreamEvent', () => {
  it('captures established session ids from raw data-only events', () => {
    const state = createAgentStreamState();

    expect(parseAgentStreamEvent('', JSON.stringify({type: 'connected', session_id: 'pending_1'}), state)).toEqual([]);
    expect(parseAgentStreamEvent('', JSON.stringify({type: 'session_id', session_id: 'session-1'}), state)).toEqual([
      {type: 'session', sessionId: 'session-1'},
    ]);
  });

  it('renders stream-event text and ignores duplicate chunk text', () => {
    const state = createAgentStreamState();

    parseAgentStreamEvent('', JSON.stringify({
      type: 'stream_event',
      event_type: 'block_start',
      block_index: 0,
      block_type: 'text',
    }), state);
    expect(parseAgentStreamEvent('', JSON.stringify({
      type: 'stream_event',
      event_type: 'delta',
      block_index: 0,
      delta: 'hello',
    }), state)).toEqual([{type: 'text', text: 'hello'}]);
    expect(parseAgentStreamEvent('', JSON.stringify({
      type: 'chunk',
      data: {type: 'text', text: 'hello'},
    }), state)).toEqual([]);
  });

  it('renders chunk text and ignores thinking content', () => {
    const state = createAgentStreamState();

    expect(parseAgentStreamEvent('chunk', JSON.stringify({
      data: {type: 'thinking', thinking: 'private reasoning'},
    }), state)).toEqual([]);
    expect(parseAgentStreamEvent('chunk', JSON.stringify({
      data: {type: 'text', text: 'answer'},
    }), state)).toEqual([{type: 'text', text: 'answer'}]);
  });

  it('normalizes agent, status, tool, and safe error events', () => {
    const state = createAgentStreamState();

    expect(parseAgentStreamEvent('agent', JSON.stringify({type: 'general', name: 'Docs Agent'}), state)).toEqual([
      {type: 'agent', name: 'Docs Agent', agentType: 'general'},
    ]);
    expect(parseAgentStreamEvent('status', JSON.stringify({phase: 'Searching docs'}), state)).toEqual([
      {type: 'status', status: 'Searching docs'},
    ]);
    expect(parseAgentStreamEvent('tool-call', JSON.stringify({tool: 'search', count: 2}), state)).toEqual([
      {type: 'tool-call', count: 2},
    ]);
    expect(parseAgentStreamEvent('error', JSON.stringify({error: 'session not found or inactive'}), state)).toEqual([
      {
        type: 'error',
        message: 'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.',
      },
    ]);
  });

  it('normalizes metadata, completion, and malformed input', () => {
    const state = createAgentStreamState();

    expect(parseAgentStreamEvent('sources', JSON.stringify({
      sources: [{title: 'Create a cluster', url: '/docs/create-cluster'}],
    }), state)).toEqual([{type: 'sources', sources: [{title: 'Create a cluster', url: '/docs/create-cluster'}]}]);
    expect(parseAgentStreamEvent('grounding', JSON.stringify({
      citations: [{paragraphIndex: 0, sourceIndices: [0]}],
    }), state)).toEqual([{type: 'grounding', citations: [{paragraphIndex: 0, sourceIndices: [0]}]}]);
    expect(parseAgentStreamEvent('confidence', JSON.stringify({level: 'high'}), state)).toEqual([
      {type: 'confidence', level: 'high'},
    ]);
    expect(parseAgentStreamEvent('', '[DONE]', state)).toEqual([{type: 'done'}]);
    expect(parseAgentStreamEvent('delta', '{bad json', state)).toEqual([]);
  });
});
