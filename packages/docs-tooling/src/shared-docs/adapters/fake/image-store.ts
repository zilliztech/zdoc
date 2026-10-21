import type { ImageStore } from '../types'

export class FakeImageStore implements ImageStore {
  readonly uploads: { sha256: string; bytes: Uint8Array }[] = []
  constructor(private readonly baseUrl = 'https://images.example.test/') {}
  async upload(sha256: string, bytes: Uint8Array): Promise<string> {
    this.uploads.push({ sha256, bytes: Uint8Array.from(bytes) })
    return `${this.baseUrl}${sha256}`
  }
}
