import {expect, test} from '@playwright/test';

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const expectedSseEvents = ['connected', 'session_id', 'chunk', 'stream_event', 'completed', 'done'];

function sse(events: unknown[]): string {
  return events.map(data => `data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`).join('');
}

test('streams a correlated chat response with safe console debug logs', async ({page}) => {
  const prompt = 'secret E2E user prompt 7845';
  const assistantAnswer = 'secret deterministic assistant answer 9361';
  const serverSessionId = 'server-session-e2e-secret';
  const debugPayloads: Array<Record<string, unknown>> = [];
  const debugLogTexts: string[] = [];
  const debugMessagePromises: Array<Promise<unknown[]>> = [];
  let chatRequestCount = 0;
  let capturedRequestId: string | undefined;
  let capturedConversationId: string | undefined;
  let capturedBody: Record<string, unknown> | undefined;

  page.on('console', msg => {
    if (msg.type() !== 'debug') return;
    debugLogTexts.push(msg.text());
    const valuesPromise = Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => undefined)));
    debugMessagePromises.push(valuesPromise);
    void valuesPromise.then(values => {
      if (values[0] === '[chat-debug]' && values[1] && typeof values[1] === 'object') {
        debugPayloads.push(values[1] as Record<string, unknown>);
      }
    });
  });

  await page.route('**/api/chat', async route => {
    chatRequestCount++;
    const request = route.request();
    capturedRequestId = request.headers()['x-request-id'];
    capturedConversationId = request.headers()['x-conversation-id'];
    capturedBody = request.postDataJSON() as Record<string, unknown>;

    expect(await request.headerValue('authorization')).toBeNull();
    expect(capturedRequestId).toMatch(requestIdPattern);
    expect(capturedConversationId).toMatch(requestIdPattern);
    expect(capturedBody).toMatchObject({
      message: prompt,
      session_id: null,
      conversationId: capturedConversationId,
      site: 'docs.zilliz.com',
      agent_config: {agent_config_code: 'zilliz_agent_dev'},
      streaming_mode: 'token',
    });

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Request-ID': capturedRequestId!,
      },
      body: sse([
        {type: 'connected', session_id: 'pending_1779357600.123456', permission_mode: 'bypassPermissions'},
        {type: 'session_id', session_id: serverSessionId, timestamp: '2026-05-21T10:00:00.000000'},
        {type: 'chunk', data: {type: 'tool_use', id: 'toolu_abc123', name: 'mcp__inkeep-mcp__search', input: {query: 'Zilliz Cloud pricing'}}},
        {type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text', delta: null},
        {type: 'stream_event', event_type: 'delta', block_index: 0, block_type: null, delta: assistantAnswer},
        {type: 'stream_event', event_type: 'block_stop', block_index: 0, block_type: null, delta: null},
        {type: 'completed', session_id: serverSessionId, timestamp: '2026-05-21T10:00:02.000000'},
        '[DONE]',
      ]),
    });
  });

  await page.goto('/docs/home?chatDebug=1');
  await page.getByRole('button', {name: 'Ask AI', exact: true}).first().click();
  const chatPanel = page.getByRole('complementary', {name: 'Zilliz Copilot'});
  await expect(chatPanel.getByText('Ask AI', {exact: true})).toBeVisible();

  await page.getByLabel('Chat message').fill(prompt);
  expect(new URL(page.url()).hostname).toBe('localhost');
  await page.getByRole('button', {name: 'Send'}).click();

  await expect(page.getByText(prompt)).toBeVisible();
  await expect(page.getByText(assistantAnswer)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Helpful', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Not helpful', exact: true})).toBeVisible();

  expect(chatRequestCount).toBe(1);
  expect(capturedRequestId).toMatch(requestIdPattern);
  expect(capturedConversationId).toMatch(requestIdPattern);
  expect(capturedBody).toBeTruthy();

  await expect.poll(() => debugPayloads.map(payload => payload.event)).toContain('chat.client.completed');

  const fetchResponseDebug = debugPayloads.find(payload => payload.event === 'chat.client.fetch.response');
  expect(fetchResponseDebug).toMatchObject({requestId: capturedRequestId, serverRequestId: capturedRequestId});

  const sseEventNames = debugPayloads
    .filter(payload => payload.event === 'chat.client.sse.event')
    .map(payload => payload.sseEvent);
  expect(sseEventNames).toEqual(expect.arrayContaining(expectedSseEvents));

  const completedDebug = debugPayloads.find(payload => payload.event === 'chat.client.completed');
  const eventCounts = completedDebug?.eventCounts as Record<string, number>;
  for (const eventName of expectedSseEvents) {
    expect(eventCounts[eventName]).toBeGreaterThanOrEqual(1);
  }

  const allDebugValues = await Promise.all(debugMessagePromises);
  const serializedDebug = `${JSON.stringify(allDebugValues)}\n${debugLogTexts.join('\n')}`;
  expect(serializedDebug).toContain('chat.client.send.started');
  expect(serializedDebug).toContain('chat.client.fetch.response');
  expect(serializedDebug).toContain('chat.client.sse.event');
  expect(serializedDebug).not.toContain(prompt);
  expect(serializedDebug).not.toContain(assistantAnswer);
  expect(serializedDebug).not.toContain(capturedConversationId!);
  expect(serializedDebug).not.toContain(serverSessionId);
});
