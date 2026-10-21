export type PageId = string
export type Channel = 'current' | 'next'

export interface SharedDocsError {
  code: string
  message: string
  file?: string
  /** One-based source line. */
  line?: number
  detail?: unknown
  page?: PageId
  channel?: Channel | 'both'
  fix?: string
}
