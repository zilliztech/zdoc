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
    expect(parseAgentStreamEvent('status', JSON.stringify({phase: 'retrieving', busy: true, sequence: 1}), state)).toEqual([
      {type: 'status', status: 'retrieving', busy: true},
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
  it('orders status within each request and tolerates legacy and unknown phases', () => {
    const state = createAgentStreamState();
    const status = (payload: object) => parseAgentStreamEvent('status', JSON.stringify(payload), state);
    expect(status({phase: 'calculating', busy: true, sequence: 3})).toEqual([{type: 'status', status: 'calculating', busy: true}]);
    expect(status({phase: 'retrieving', busy: true, sequence: 2})).toEqual([]);
    expect(status({phase: 'generating', busy: true, sequence: 3})).toEqual([]);
    expect(status({phase: 'answering', busy: false, sequence: 4})).toEqual([{type: 'status', status: 'answering', busy: false}]);
    expect(state.ended).toBe(false);
    expect(status({busy: true})).toEqual([{type: 'status', status: 'working', busy: true}]);
    expect(status({phase: 'internal_tool_name', busy: true})).toEqual([{type: 'status', status: 'working', busy: true}]);
    expect(parseAgentStreamEvent('status', JSON.stringify({phase: 'preparing', busy: true, sequence: 1}), createAgentStreamState())).toHaveLength(1);
  });

  it.each(['completed', 'failed', 'cancelled'])('ends loading on terminal phase %s and ignores late text/status', phase => {
    const state = createAgentStreamState();
    expect(parseAgentStreamEvent('status', JSON.stringify({phase, busy: false, sequence: 1}), state)).toEqual([{type: 'done'}]);
    expect(parseAgentStreamEvent('status', JSON.stringify({phase: 'working', busy: true, sequence: 2}), state)).toEqual([]);
    expect(parseAgentStreamEvent('delta', JSON.stringify({text: 'late text'}), state)).toEqual([]);
  });

  it('recognizes normalized session expiry and keeps other errors generic', () => {
    const expired = 'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.';
    expect(parseAgentStreamEvent('error', JSON.stringify({error: expired}), createAgentStreamState())).toEqual([{type: 'error', message: expired}]);
    expect(parseAgentStreamEvent('error', JSON.stringify({error: 'internal detail'}), createAgentStreamState())).toEqual([{type: 'error', message: 'Something went wrong. Please refresh the page and try again.'}]);
  });

});
