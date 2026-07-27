import type {WhiteboardReadGateway} from './ports.js';
import {canonicalWhiteboard, type CanonicalWhiteboard} from '../domain/whiteboard.js';

export class WhiteboardMirror {
  constructor(private readonly whiteboards: WhiteboardReadGateway) {}

  async snapshot(token: string): Promise<CanonicalWhiteboard> {
    return canonicalWhiteboard(await this.whiteboards.queryRaw(token));
  }
}
