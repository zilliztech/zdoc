import {describe, expect, it} from 'vitest';

import type {WhiteboardGateway} from '../src/application/ports.js';
import {WhiteboardMirror} from '../src/application/whiteboard-mirror.js';
import {canonicalWhiteboard, normalizeWhiteboardRaw} from '../src/domain/whiteboard.js';

class MemoryWhiteboards implements WhiteboardGateway {
  readonly values = new Map<string, unknown>();
  readonly updates: Array<{token: string; raw: unknown; idempotencyToken: string}> = [];
  async queryRaw(token: string): Promise<unknown> { return this.values.get(token); }
  async overwriteRaw(input: {token: string; raw: unknown; idempotencyToken: string}): Promise<void> {
    this.updates.push(input);
    this.values.set(input.token, structuredClone(input.raw));
  }
}

describe('Whiteboard mirroring', () => {
  it('normalizes server-assigned identities while preserving content and bindings', () => {
    const source = {
      board_token: 'source-board',
      nodes: [
        {id: 'source-a', type: 'text', text: 'Hello', x: 10, updated_at: 1},
        {id: 'source-b', type: 'connector', from: 'source-a', to: 'source-a'},
      ],
    };
    const target = {
      board_token: 'target-board',
      nodes: [
        {id: 'target-a', type: 'text', text: 'Hello', x: 10, updated_at: 2},
        {id: 'target-b', type: 'connector', from: 'target-a', to: 'target-a'},
      ],
    };

    expect(canonicalWhiteboard(source).hash).toBe(canonicalWhiteboard(target).hash);
    expect(canonicalWhiteboard({...target, nodes: [{id: 'target-a', type: 'text', text: 'Changed', x: 10}]}).hash)
      .not.toBe(canonicalWhiteboard(source).hash);
    expect(normalizeWhiteboardRaw(target)).toMatchObject({board_token: '<board-token>'});
  });

  it('overwrites and verifies a target Whiteboard', async () => {
    const gateway = new MemoryWhiteboards();
    gateway.values.set('source', {nodes: [{id: 'source-node', type: 'text', text: 'Hello'}]});
    gateway.values.set('target', {nodes: []});
    const mirror = new WhiteboardMirror(gateway);

    const result = await mirror.mirror('source', 'target', 'run-1-board-1');

    expect(result.source.hash).toBe(result.target.hash);
    expect(gateway.updates).toEqual([expect.objectContaining({
      token: 'target', idempotencyToken: 'run-1-board-1',
    })]);
  });
});
