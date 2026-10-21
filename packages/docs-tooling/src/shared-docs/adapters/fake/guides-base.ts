import type { GuidesBase, GuidesSnapshot } from '../types'

export class FakeGuidesBase implements GuidesBase {
  private readonly snapshot: GuidesSnapshot
  constructor(snapshot: GuidesSnapshot) { this.snapshot = structuredClone(snapshot) }
  async getRecords() { return structuredClone(this.snapshot.records) }
}
