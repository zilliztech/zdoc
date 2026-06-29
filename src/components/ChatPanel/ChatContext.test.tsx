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
      for (const data of events) {
        controller.enqueue(encoder.encode(`data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {'Content-Type': 'text/event-stream', 'X-Request-ID': 'client-request-1'},
  });
}

function wrapper(debugDefault = false) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return <ChatProvider chatEndpoint="/api/chat" debugDefault={debugDefault}>{children}</ChatProvider>;
  };
}

describe('ChatProvider request debugging', () => {
  beforeEach(() => {
    localStorage.clear();
    let uuidCount = 0;
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => {
        uuidCount++;
        return uuidCount === 1 ? 'client-request-1' : 'client-user-1';
      }),
      getRandomValues: (arr: Uint8Array) => arr.fill(1),
    });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(sseResponse([
      {type: 'connected', session_id: 'pending_1', permission_mode: 'bypassPermissions'},
      {type: 'session_id', session_id: 'server-session-1', timestamp: '2026-05-21T10:00:00.000000'},
      {type: 'chunk', data: {type: 'tool_use', id: 'toolu_1', name: 'mcp__inkeep-mcp__search', input: {query: 'short secret notice'}}},
      {type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text', delta: null},
      {type: 'stream_event', event_type: 'delta', block_index: 0, block_type: null, delta: 'assistant secret answer'},
      {type: 'stream_event', event_type: 'block_stop', block_index: 0, block_type: null, delta: null},
      {type: 'completed', session_id: 'server-session-1', timestamp: '2026-05-21T10:00:01.000000'},
      '[DONE]',
    ]))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('sends a request ID header with chat requests', async () => {
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => {
      await result.current.send('secret user prompt');
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/chat/stream');
    expect((init as RequestInit).headers).toMatchObject({'Content-Type': 'application/json', 'Accept': 'text/event-stream', 'X-Request-ID': 'client-request-1'});
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({
      message: 'secret user prompt',
      agent_config: {agent_config_code: 'zilliz-website-assistant'},
      streaming_mode: 'token',
      user_id: 'client-user-1',
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
    expect(logs).not.toContain('client-user-1');
    expect(logs).not.toContain('server-session-1');
    expect(logs).not.toContain('short secret notice');
    expect(logs).not.toContain('nested secret payload');
  });
});
