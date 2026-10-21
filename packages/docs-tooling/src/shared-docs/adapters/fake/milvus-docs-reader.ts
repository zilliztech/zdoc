import type { MilvusDocsReader } from '../types'

export class FakeMilvusDocsReader implements MilvusDocsReader {
  private readonly files: Record<string, Record<string, string>>
  constructor(files: Record<string, Record<string, string>>) { this.files = structuredClone(files) }
  async readFile(commit: string, path: string): Promise<string> {
    if (!Object.hasOwn(this.files, commit) || !Object.hasOwn(this.files[commit], path)) {
      throw new Error(`Missing fixture: ${commit}:${path}`)
    }
    return this.files[commit][path]
  }
}
