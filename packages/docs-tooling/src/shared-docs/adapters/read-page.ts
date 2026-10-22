import { parsePageConfig, parseSourceConfig } from '../core/config'
import { parseLock, validateLockHistory } from '../core/lock'
import { diagnostic, yamlLine } from '../core/yaml'
import type { Channel, LockHistory, PageConfig, PageConfigContext, PageLock, SharedDocsError, SourceConfig } from '../core/types'
import type { MilvusDocsReader } from './types'
import { MilvusDocsReaderError } from './reader-errors'

export interface ReadPageInput {
  pageId: string
  sourceYaml: string
  pageYaml: string
  lockYaml?: string
  context: PageConfigContext
  sourceName?: string
}
export type ReadPageResult = {
  config: PageConfig; source: SourceConfig; lock: PageLock; markdown: Record<Channel, string>
} | { errors: SharedDocsError[] }

/** Parse every config before reading Git; report page errors together, but propagate infrastructure failures. */
export async function readPageSources(input: ReadPageInput, reader: MilvusDocsReader): Promise<ReadPageResult> {
  const pageFile = input.context.file ?? `shared-docs/pages/${input.pageId}/page.yaml`
  const lockContext = { file: pageFile.replace(/[^/]*$/, 'lock.yaml'), page: input.pageId }
  const source = parseSourceConfig(input.sourceYaml, { file: input.sourceName ?? 'shared-docs/source.yaml', page: input.pageId })
  const config = parsePageConfig(input.pageId, input.pageYaml, input.context)
  const lock = parseLock(input.lockYaml, lockContext)
  const errors: SharedDocsError[] = []
  for (const result of [source, config, lock]) if ('errors' in result) errors.push(...result.errors)
  if ('errors' in source || 'errors' in config || 'errors' in lock) return { errors }
  const history: LockHistory = { current: 'missing', next: 'missing' }
  const markdown: Record<Channel, string> = { current: '', next: '' }
  for (const channel of ['current', 'next'] as const) {
    const commit = lock.lock[channel]
    try {
      history[channel] = await reader.isOnBranch(commit, source.config.track) ? 'on-branch' : 'off-branch'
    } catch (error) {
      if (!(error instanceof MilvusDocsReaderError) || error.code !== 'MISSING_COMMIT') throw error
    }
    if (history[channel] === 'on-branch') {
      try { markdown[channel] = await reader.readFile(commit, config.config.source.file) }
      catch (error) {
        if (!(error instanceof MilvusDocsReaderError) || error.code !== 'MISSING_FILE') throw error
        errors.push(diagnostic('CONFIG_SOURCE_NOT_FOUND', `Source file not found at ${commit}: ${config.config.source.file}`,
          { file: pageFile, page: input.pageId, channel }, yamlLine(input.pageYaml, ['source', 'file'])))
      }
    }
  }
  if (history.current === 'on-branch' && history.next === 'on-branch') {
    history.ordered = await reader.isAncestor(lock.lock.current, lock.lock.next)
  }
  errors.push(...validateLockHistory(lock.lock, history, input.lockYaml!, lockContext))
  return errors.length ? { errors } : { config: config.config, source: source.config, lock: lock.lock, markdown }
}
