import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: '/docs/home'}),
}));

import {ChatProvider, useChatContext} from './ChatContext';

function sseResponse(events: unknown[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        const {type, data} = event as {type: string; data: unknown};
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {'Content-Type': 'text/event-stream', 'X-Request-ID': 'client-request-1'},
  });
}

function rawSseResponse(events: unknown[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        const data = typeof event === 'string' ? event : JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {'Content-Type': 'text/event-stream'},
  });
}

function wrapper(debugDefault = false) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <ChatProvider
        chatEndpoint="/api/chat"
        agentConfigCode="zilliz_agent_dev"
        debugDefault={debugDefault}
      >
        {children}
      </ChatProvider>
    );
  };
}

describe('ChatProvider request debugging', () => {
  beforeEach(() => {
    localStorage.clear();
    let uuidCount = 0;
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => {
        uuidCount++;
        return uuidCount === 1 ? 'client-request-1' : 'client-conversation-1';
      }),
      getRandomValues: (arr: Uint8Array) => arr.fill(1),
    });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(sseResponse([
      {type: 'session', data: {sessionId: 'server-session-1'}},
      {type: 'agent', data: {type: 'general', name: 'Docs Agent'}},
      {type: 'tool-call', data: {tool: 'search', count: 1, query: 'short secret notice'}},
      {type: 'delta', data: {text: 'assistant secret answer'}},
      {type: 'done', data: {stop_reason: 'end_turn'}},
    ]))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('sends the docs agent request contract', async () => {
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => {
      await result.current.send('secret user prompt');
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/chat');
    expect((init as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'X-Request-ID': 'client-request-1',
      'X-Conversation-ID': 'client-conversation-1',
    });
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      message: 'secret user prompt',
      session_id: null,
      conversationId: 'client-conversation-1',
      streaming_mode: 'token',
      site: 'docs.zilliz.com',
      agent_config: {agent_config_code: 'zilliz_agent_dev'},
    });
  });

  it('emits console-only safe debug events when enabled', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(true)});

    await act(async () => {
      await result.current.send('secret user prompt');
    });

    await waitFor(() => expect(debugSpy).toHaveBeenCalled());
    const logs = debugSpy.mock.calls.map(call => JSON.stringify(call)).join('\n');
    expect(logs).toContain('chat.client.send.started');
    expect(logs).toContain('chat.client.fetch.response');
    expect(logs).toContain('chat.client.sse.event');
    expect(logs).toContain('chat.client.completed');
    expect(logs).toContain('client-request-1');
    expect(logs).not.toContain('secret user prompt');
    expect(logs).not.toContain('assistant secret answer');
    expect(logs).not.toContain('client-conversation-1');
    expect(logs).not.toContain('server-session-1');
    expect(logs).not.toContain('short secret notice');
    expect(logs).not.toContain('nested secret payload');
  });

  it('renders raw agent events without duplicate text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rawSseResponse([
      {type: 'connected', session_id: 'pending_1'},
      {type: 'session_id', session_id: 'server-session-1'},
      {type: 'status', phase: 'Searching docs'},
      {type: 'chunk', data: {type: 'tool_use', name: 'search'}},
      {type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text'},
      {type: 'stream_event', event_type: 'delta', block_index: 0, delta: 'one answer'},
      {type: 'chunk', data: {type: 'text', text: 'one answer'}},
      {type: 'sources', sources: [{title: 'Source', url: '/docs/source'}]},
      {type: 'confidence', level: 'high'},
      {type: 'completed'},
      '[DONE]',
    ]));

    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => {
      await result.current.send('question');
    });

    expect(result.current.messages.at(-1)).toMatchObject({
      role: 'assistant',
      text: 'one answer',
      toolCallCount: 1,
      confidence: 'high',
      sources: [{title: 'Source', url: '/docs/source'}],
    });
  });
});
