import type { Md2md } from '../types'

/** Programmed responses only. Shared semantic contract cases arrive with WP1/WP2. */
export class FakeMd2md implements Md2md {
  constructor(private readonly responses: Md2md) {}
  parseBlocks: Md2md['parseBlocks'] = (...args) => structuredClone(this.responses.parseBlocks(...args))
  stripBlockMarkers: Md2md['stripBlockMarkers'] = (...args) => this.responses.stripBlockMarkers(...args)
  preprocess: Md2md['preprocess'] = input => structuredClone(this.responses.preprocess(structuredClone(input)))
}
