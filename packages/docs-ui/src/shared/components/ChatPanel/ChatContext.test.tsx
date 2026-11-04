import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {siteState} = vi.hoisted(() => ({siteState: {current: 'en'}}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: '/docs/home'}),
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({siteConfig: {customFields: {site: siteState.current}}, i18n: {currentLocale: 'en'}}),
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

function markdownResponse(text = '# Test page') {
  return new Response(text, {status: 200, headers: {'Content-Type': 'text/markdown; charset=utf-8'}});
}

function isMarkdownUrl(url: unknown): boolean {
  return typeof url === 'string' && url.endsWith('.md');
}

function routeChatFetch(chatResponses: Response[]): void {
  let idx = 0;
  vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : String(input);
    if (isMarkdownUrl(url)) return Promise.resolve(markdownResponse());
    return Promise.resolve(chatResponses[idx++] ?? sseResponse([{type: 'done', data: {}}]));
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

function controlledRawSseResponse(): {
  response: Response;
  enqueue: (event: unknown) => void;
  close: () => void;
} {
  const encoder = new TextEncoder();
  let streamController: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller;
    },
  });
  return {
    response: new Response(stream, {status: 200, headers: {'Content-Type': 'text/event-stream'}}),
    enqueue(event) {
      const data = typeof event === 'string' ? event : JSON.stringify(event);
      streamController.enqueue(encoder.encode(`data: ${data}\n\n`));
    },
    close() {
      streamController.close();
    },
  };
}

function wrapper(debugDefault = false) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <ChatProvider chatEndpoint="/api/chat" debugDefault={debugDefault}>
        {children}
      </ChatProvider>
    );
  };
}

describe('ChatProvider request debugging', () => {
  beforeEach(() => {
    siteState.current = 'en';
    localStorage.clear();
    localStorage.setItem('zd-user-id', '550e8400-e29b-41d4-a716-446655440000');
    let uuidCount = 0;
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => {
        uuidCount++;
        return uuidCount === 1 ? 'client-request-1' : 'client-conversation-1';
      }),
      getRandomValues: (arr: Uint8Array) => arr.fill(1),
    });
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (isMarkdownUrl(url)) return Promise.resolve(markdownResponse());
      return Promise.resolve(sseResponse([
        {type: 'session', data: {sessionId: 'server-session-1'}},
        {type: 'agent', data: {type: 'general', name: 'Docs Agent'}},
        {type: 'tool-call', data: {tool: 'search', count: 1, query: 'short secret notice'}},
        {type: 'delta', data: {text: 'assistant secret answer'}},
        {type: 'done', data: {stop_reason: 'end_turn'}},
      ]));
    }));
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

    const [url, init] = vi.mocked(fetch).mock.calls[1];
    expect(url).toBe('/api/chat');
    expect((init as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'X-Request-ID': 'client-request-1',
      'X-Conversation-ID': 'client-conversation-1',
    });
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      message: 'secret user prompt',
      user_id: 'browser:v1:550e8400-e29b-41d4-a716-446655440000',
      session_id: null,
      conversationId: 'client-conversation-1',
      streaming_mode: 'token',
      site: 'docs.zilliz.com',
      agent_config: {agent_config_code: 'zilliz_docs_agent'},
      page_context: {url: 'http://localhost:3000/docs/home', content: '# Test page'},
    });
  });

  it('keeps visitor identity across new chats and provider remounts', async () => {
    routeChatFetch([]);
    const first = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => first.result.current.send('first question'));
    act(() => first.result.current.newChat());
    await act(async () => first.result.current.send('new session question'));
    first.unmount();
    const next = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => next.result.current.send('after refresh'));
    const bodies = vi.mocked(fetch).mock.calls
      .filter(([url]) => url === '/api/chat')
      .map(([, init]) => JSON.parse(init?.body as string));
    expect(bodies).toHaveLength(3);
    expect(bodies.map(body => body.user_id)).toEqual(Array(3).fill('browser:v1:550e8400-e29b-41d4-a716-446655440000'));
    expect(bodies.map(body => body.session_id)).toEqual([null, null, null]);
  });

  it('correlates chat with the visitor UUID and rates feedback without any network call', async () => {
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => result.current.send('question'));
    act(() => result.current.rateFeedback(1, 'up'));
    const chatBodies = vi.mocked(fetch).mock.calls
      .filter(([url]) => url === '/api/chat')
      .map(([, init]) => JSON.parse(init?.body as string));
    expect(chatBodies.at(-1).user_id).toBe('browser:v1:550e8400-e29b-41d4-a716-446655440000');
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/feedback'))).toBe(false);
  });

  it('continues chatting without identity when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {throw new Error('blocked');});
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => result.current.send('anonymous question'));
    const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string);
    expect(body).not.toHaveProperty('user_id');
    expect(result.current.messages.at(-1)?.text).toBe('assistant secret answer');
  });

  it('uses the Chinese docs contract for the Chinese site', async () => {
    siteState.current = 'zh-CN';
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => {
      await result.current.send('production question');
    });

    const [, init] = vi.mocked(fetch).mock.calls[1];
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({
      site: 'docs.zilliz.com.cn',
      agent_config: {agent_config_code: 'zilliz_docs_cn_agent'},
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

  it('reports the data-only done marker as a done debug event', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    routeChatFetch([rawSseResponse(['[DONE]'])]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(true)});

    await act(async () => {
      await result.current.send('question');
    });

    const sseEvents = debugSpy.mock.calls
      .filter(call => call[0] === '[chat-debug]' && call[1]?.event === 'chat.client.sse.event')
      .map(call => call[1]?.sseEvent);
    expect(sseEvents).toContain('done');
  });

  it('renders raw agent events without duplicate text', async () => {
    routeChatFetch([rawSseResponse([
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
    ])]);

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

  it('reuses the server session and conversation id on the next turn', async () => {
    routeChatFetch([
      rawSseResponse([
        {type: 'session_id', session_id: 'server-session-1'},
        {type: 'chunk', data: {type: 'text', text: 'first answer'}},
        '[DONE]',
      ]),
      rawSseResponse([
        {type: 'chunk', data: {type: 'text', text: 'second answer'}},
        '[DONE]',
      ]),
    ]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => result.current.send('first question'));
    await act(async () => result.current.send('second question'));

    const firstInit = vi.mocked(fetch).mock.calls[1][1] as RequestInit;
    const secondInit = vi.mocked(fetch).mock.calls[3][1] as RequestInit;
    expect(JSON.parse(secondInit.body as string)).toMatchObject({
      message: 'second question',
      session_id: 'server-session-1',
      conversationId: 'client-conversation-1',
    });
    expect((secondInit.headers as Record<string, string>)['X-Conversation-ID']).toBe(
      (firstInit.headers as Record<string, string>)['X-Conversation-ID'],
    );
  });

  it('stores and restores session transport state with chat history', async () => {
    routeChatFetch([
      rawSseResponse([
        {type: 'session_id', session_id: 'server-session-1'},
        {type: 'chunk', data: {type: 'text', text: 'first answer'}},
        '[DONE]',
      ]),
      rawSseResponse([{type: 'chunk', data: {type: 'text', text: 'follow-up'}}]),
    ]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => result.current.send('first question'));
    await waitFor(() => expect(result.current.chatHistory).toHaveLength(1));
    const chatId = result.current.chatHistory[0].id;

    act(() => result.current.newChat());
    act(() => result.current.loadChat(chatId));
    await act(async () => result.current.send('history follow-up'));

    const followUpInit = vi.mocked(fetch).mock.calls[3][1] as RequestInit;
    expect(JSON.parse(followUpInit.body as string)).toMatchObject({
      session_id: 'server-session-1',
      conversationId: 'client-conversation-1',
    });
  });

  it('posts an interrupt and ignores late stream events after stop', async () => {
    const controlled = controlledRawSseResponse();
    vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (isMarkdownUrl(url)) return Promise.resolve(markdownResponse());
      if (url.endsWith('/interrupt')) return Promise.resolve(new Response(null, {status: 204}));
      return Promise.resolve(controlled.response);
    });
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.send('long question');
    });
    controlled.enqueue({type: 'session_id', session_id: 'server-session-1'});
    controlled.enqueue({type: 'chunk', data: {type: 'text', text: 'partial'}});
    await waitFor(() => expect(result.current.messages.at(-1)?.text).toBe('partial'));

    act(() => result.current.stop());
    expect(fetch).toHaveBeenNthCalledWith(3, '/api/chat/interrupt', expect.objectContaining({
      method: 'POST',
      keepalive: true,
      headers: expect.objectContaining({'X-Conversation-ID': 'client-conversation-1'}),
    }));
    expect(JSON.parse(vi.mocked(fetch).mock.calls[2][1]?.body as string)).toEqual({
      session_id: 'server-session-1',
      conversationId: 'client-conversation-1',
    });

    controlled.enqueue({type: 'chunk', data: {type: 'text', text: ' late text'}});
    controlled.close();
    await act(async () => sendPromise!);
    expect(result.current.messages.at(-1)?.text).toBe('partial');
  });

  it('falls back to url when page markdown is unavailable', async () => {
    vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (isMarkdownUrl(url)) return Promise.resolve(new Response('Not Found', {status: 404}));
      return Promise.resolve(sseResponse([{type: 'done', data: {stop_reason: 'end_turn'}}]));
    });
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    await act(async () => {
      await result.current.send('question');
    });

    const [, init] = vi.mocked(fetch).mock.calls[1];
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({
      page_context: {url: 'http://localhost:3000/docs/home'},
    });
  });

  it('shows the reading-page status while page context is being fetched', async () => {
    let resolveMarkdown: (value: Response) => void;
    vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (isMarkdownUrl(url)) {
        return new Promise<Response>(resolve => {
          resolveMarkdown = resolve;
        });
      }
      return Promise.resolve(sseResponse([{type: 'done', data: {stop_reason: 'end_turn'}}]));
    });
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.send('question');
    });

    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('Reading page...'));
    await act(async () => {
      resolveMarkdown!(markdownResponse('# Real page'));
      await sendPromise!;
    });
    expect(result.current.messages.at(-1)?.status).toBeUndefined();
  });
  it('coalesces progress, ignores old sequences, and immediately resumes text', async () => {
    const controlled = controlledRawSseResponse();
    routeChatFetch([controlled.response]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    let sending: Promise<void>;
    act(() => { sending = result.current.send('cost question'); });
    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('preparing'));
    await act(async () => {
      controlled.enqueue({type: 'status', phase: 'retrieving', busy: true, sequence: 1});
      controlled.enqueue({type: 'status', phase: 'calculating', busy: true, sequence: 2});
      await new Promise(resolve => setTimeout(resolve, 180));
    });
    expect(result.current.messages.at(-1)).toMatchObject({status: 'calculating', busy: true});
    await act(async () => {
      controlled.enqueue({type: 'status', phase: 'working', busy: true, sequence: 1});
      controlled.enqueue({type: 'status', phase: 'answering', busy: false, sequence: 3});
      controlled.enqueue({type: 'chunk', data: {type: 'text', text: 'Which region?'}});
    });
    expect(result.current.isStreaming).toBe(true);
    expect(result.current.messages.at(-1)).toMatchObject({text: 'Which region?', busy: false});
    await act(async () => {
      controlled.enqueue({type: 'status', phase: 'answering', busy: false, sequence: 4});
      controlled.enqueue({type: 'status', phase: 'answering', busy: true, sequence: 5});
      await new Promise(resolve => setTimeout(resolve, 180));
    });
    expect(result.current.messages.at(-1)).toMatchObject({text: 'Which region?', status: 'answering', busy: true});
    expect(result.current.chatHistory.at(-1)?.messages.at(-1)).not.toHaveProperty('status');
    expect(result.current.chatHistory.at(-1)?.messages.at(-1)).not.toHaveProperty('busy');
    await act(async () => {
      controlled.enqueue({type: 'status', phase: 'generating', busy: true, sequence: 6});
      controlled.enqueue({type: 'chunk', data: {type: 'text', text: ' Resumed.'}});
      await new Promise(resolve => setTimeout(resolve, 180));
    });
    expect(result.current.messages.at(-1)).toMatchObject({text: 'Which region? Resumed.', busy: false});
    await act(async () => { controlled.enqueue({type: 'completed'}); });
    expect(result.current.isStreaming).toBe(false);
    await act(async () => { controlled.close(); await sending!; });
  });

  it.each(['en', 'zh-CN'])('preserves session expiry through duplicate done on %s', async site => {
    siteState.current = site;
    const expired = 'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.';
    routeChatFetch([sseResponse([
      {type: 'error', data: {error: expired}},
      {type: 'done', data: {}}, {type: 'done', data: {}},
    ])]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => result.current.send('expired session'));
    expect(result.current.messages.at(-1)).toMatchObject({text: expired, busy: false});
    expect(result.current.isStreaming).toBe(false);
  });

  it('cancels a pending phase on stop and rejects late events from the old request', async () => {
    const old = controlledRawSseResponse();
    const next = controlledRawSseResponse();
    routeChatFetch([old.response, next.response]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    let first: Promise<void>;
    act(() => { first = result.current.send('first'); });
    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('preparing'));
    await act(async () => { old.enqueue({type: 'status', phase: 'calculating', busy: true, sequence: 99}); });
    act(() => result.current.stop());
    let second: Promise<void>;
    act(() => { second = result.current.send('second'); });
    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('preparing'));
    await act(async () => {
      old.enqueue({type: 'chunk', data: {type: 'text', text: 'late old answer'}});
      old.close();
      next.enqueue({type: 'status', phase: 'retrieving', busy: true, sequence: 1});
      await new Promise(resolve => setTimeout(resolve, 180));
    });
    expect(result.current.messages.at(-1)).toMatchObject({text: '', status: 'retrieving', busy: true});
    await act(async () => { next.close(); await Promise.all([first!, second!]); });
    expect(result.current.messages.at(-1)).toMatchObject({busy: false});
    expect(result.current.isStreaming).toBe(false);
  });

  it('aborts and cancels pending phase updates on unmount', async () => {
    const controlled = controlledRawSseResponse();
    routeChatFetch([controlled.response]);
    const {result, unmount} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    let sending: Promise<void>;
    act(() => { sending = result.current.send('unmount'); });
    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('preparing'));
    await act(async () => { controlled.enqueue({type: 'status', phase: 'calculating', busy: true, sequence: 1}); });
    const signal = (vi.mocked(fetch).mock.calls.find(([url]) => url === '/api/chat')?.[1] as RequestInit).signal;
    unmount();
    expect(signal?.aborted).toBe(true);
    controlled.close();
    await sending!;
    await new Promise(resolve => setTimeout(resolve, 180));
  });

  it.each(['completed', 'failed', 'cancelled', 'interrupted', 'error', 'eof'])('clears pending progress on %s without waiting for stream close', async terminal => {
    const controlled = controlledRawSseResponse();
    routeChatFetch([controlled.response]);
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    let sending: Promise<void>;
    act(() => { sending = result.current.send('terminal'); });
    await waitFor(() => expect(result.current.messages.at(-1)?.status).toBe('preparing'));
    await act(async () => {
      controlled.enqueue({type: 'status', phase: 'calculating', busy: true, sequence: 1});
      if (terminal === 'eof') controlled.close();
      else if (terminal === 'interrupted' || terminal === 'error') controlled.enqueue({type: terminal, error: 'failure'});
      else controlled.enqueue({type: 'status', phase: terminal, busy: false, sequence: 2});
    });
    expect(result.current.isStreaming).toBe(false);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 180));
      if (terminal !== 'eof') controlled.close();
      await sending!;
    });
    expect(result.current.messages.at(-1)?.busy).toBe(false);
    expect(result.current.messages.at(-1)?.status).toBeUndefined();
  });

  it.each(['http', 'network'])('clears the preparing placeholder after a %s failure', async failure => {
    vi.mocked(fetch).mockImplementation(input => {
      if (isMarkdownUrl(input)) return Promise.resolve(markdownResponse());
      if (failure === 'network') return Promise.reject(new Error('offline'));
      return Promise.resolve(new Response(JSON.stringify({error: 'unavailable'}), {status: 502}));
    });
    const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
    await act(async () => result.current.send('failure'));
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.messages.some(message => message.busy)).toBe(false);
    expect(result.current.messages.at(-1)?.text).toBeTruthy();
  });

});
