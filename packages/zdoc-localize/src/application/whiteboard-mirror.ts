import type {WhiteboardGateway} from './ports.js';
import {LocalizeError} from '../domain/errors.js';
import {canonicalWhiteboard, type CanonicalWhiteboard} from '../domain/whiteboard.js';

export interface WhiteboardMirrorResult {
  source: CanonicalWhiteboard;
  target: CanonicalWhiteboard;
}

export class WhiteboardMirror {
  constructor(private readonly whiteboards: WhiteboardGateway) {}

  async snapshot(token: string): Promise<CanonicalWhiteboard> {
    return canonicalWhiteboard(await this.whiteboards.queryRaw(token));
  }

  async mirror(sourceToken: string, targetToken: string, idempotencyToken: string): Promise<WhiteboardMirrorResult> {
    const source = await this.snapshot(sourceToken);
    await this.whiteboards.overwriteRaw({
      token: targetToken,
      raw: source.raw,
      idempotencyToken,
    });
    const target = await this.snapshot(targetToken);
    if (source.hash !== target.hash) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'whiteboard_verification_mismatch',
        message: 'The mirrored Whiteboard does not match the source Whiteboard.',
        details: {sourceHash: source.hash, targetHash: target.hash},
      });
    }
    return {source, target};
  }
}
