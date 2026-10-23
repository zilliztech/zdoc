export interface ImageFetcher { fetch(url: string): Promise<Uint8Array> }

/** Read-only transport. Storage credentials and upload APIs are deliberately absent. */
export class HttpImageFetcher implements ImageFetcher {
  constructor(private readonly timeoutMs = 30_000) {}
  async fetch(url: string): Promise<Uint8Array> {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Expected an HTTP(S) image URL')
    const response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) })
    if (!response.ok) throw new Error(`Image download returned HTTP ${response.status}`)
    return new Uint8Array(await response.arrayBuffer())
  }
}

/** A sequence can model a source changing between the two required reads. */
export class FakeImageFetcher implements ImageFetcher {
  readonly requests: string[] = []
  private readonly counts = new Map<string, number>()
  private readonly responses: Map<string, (Uint8Array | Error)[]>
  constructor(responses: ReadonlyMap<string, Uint8Array | Error | readonly (Uint8Array | Error)[]>) {
    this.responses = new Map([...responses].map(([url, response]) => [url,
      (Array.isArray(response) ? response : [response]).map(value => value instanceof Error ? value : Uint8Array.from(value))]))
  }
  async fetch(url: string): Promise<Uint8Array> {
    this.requests.push(url)
    const values = this.responses.get(url)
    if (!values?.length) throw new Error(`Image not found: ${url}`)
    const index = this.counts.get(url) ?? 0
    this.counts.set(url, index + 1)
    const value = values[Math.min(index, values.length - 1)]
    if (value instanceof Error) throw value
    return Uint8Array.from(value)
  }
}
