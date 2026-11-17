import { mkdir, writeFile } from 'node:fs/promises'
import { dump } from 'js-yaml'
import { join, resolve } from 'node:path'
import { gitMetadataDirectories } from '../adapters/updates/git'
import { createBuildReader } from '../adapters/build-page'
import { UpdateArgumentError } from '../adapters/updates/runner'
import { checkOutput } from './update'
import { readManualSharedDocs } from './build'
import { expandManualPages } from '../adapters/manual-page'
import { collectReferences, classifyLink } from '../core/links'
import { parseManualConfig } from '../core/manual-config'
import type { ManualConfig } from '../core/types'

/** Manual promotion (design 04 提升, design 10 WP13 manual-level): move `current` to
 * `next` and carry the one-sided local configuration across. The command never edits
 * the group; it writes the promoted lock and manual configuration into the output
 * directory for the promotion PR, and blocks when references to vanishing pages would
 * break the post-promotion build. Handwritten NextChannel markers are listed for the
 * author, never batch-removed: their unwrapping tracks each feature's release timing. */
export interface ManualPromoteOptions { sharedDocs: string; repo: string; dev: string; out: string }

export interface ManualPromoteReport {
  schema_version: 1
  kind: 'shared-manual-promotion'
  group: string
  manual: string
  lock: { from: { current: string; next: string }; to: { current: string; next: string } }
  /** cloud_pages promoted from `channel: next` to two-sided visibility. */
  cloudPagesPromoted: string[]
  /** cloud_pages retired entirely; their content/ files stay in place (orphaned). */
  cloudPagesRetired: string[]
  /** Upstream pages that vanish at next: they leave the manual with the promotion. */
  upstreamPagesRetired: string[]
  metadataRemoved: string[]
  excludeRemoved: string[]
  /** Advisory: authored block-level gates in remaining cloud content, for the author. */
  handwrittenGates: { file: string; line: number }[]
  /** Non-empty blocks the promotion: live pages still link a vanishing page. */
  blockedReferences: { kind: 'cloud' | 'upstream'; file: string; line: number; target: string }[]
}

export class ManualPromoteArgumentError extends Error {}
const fail = (message: string): never => { throw new ManualPromoteArgumentError(message) }
const GATE = /<\/?NextChannel\b/

export async function manualPromote(options: ManualPromoteOptions, write: (text: string) => void,
  repositoryRoot = process.cwd()): Promise<number> {
  try { return await promote(options, write, repositoryRoot) }
  catch (error) {
    if (error instanceof ManualPromoteArgumentError || error instanceof UpdateArgumentError) {
      write(`${error instanceof Error ? error.message : String(error)}\n`)
      return 2
    }
    throw error
  }
}

async function promote(options: ManualPromoteOptions, write: (text: string) => void,
  repositoryRoot: string): Promise<number> {
  const out = resolve(options.out), repo = resolve(options.repo)
  const inputs = [repo, join(repositoryRoot, 'shared-docs'), join(repositoryRoot, '.git'), join(repositoryRoot, 'packages')]
  await checkOutput(out, inputs)
  inputs.push(...await gitMetadataDirectories(repositoryRoot), ...await gitMetadataDirectories(repo))
  await checkOutput(out, inputs)
  const shared = await readManualSharedDocs(options.sharedDocs, repositoryRoot)
  if ('errors' in shared) {
    for (const error of shared.errors) write(`${error.file ?? '<input>'}:${error.line ?? 1} ${error.code}: ${error.message}\n`)
    return 1
  }
  const reader = createBuildReader(repo, undefined, undefined, shared.manualConfig.source.dir)
  try {
    // The promoted state reads only the next tree, so both lock commits must be sane
    // before any configuration is rewritten.
    for (const channel of ['current', 'next'] as const) {
      if (!await reader.isOnBranch(shared.lock[channel], shared.sourceConfig.track)) {
        fail(`Locked ${channel} ${shared.lock[channel]} is not on the tracking branch ${shared.sourceConfig.track}`)
      }
    }
    if (shared.lock.current !== shared.lock.next && !await reader.isAncestor(shared.lock.current, shared.lock.next)) {
      fail('current must be an ancestor of or equal to next')
    }
    const prefix = `${shared.manualConfig.source.dir}/`
    const nextFiles = (await reader.listFiles(shared.lock.next, shared.manualConfig.source.dir))
      .filter(file => file.startsWith(prefix) && file.endsWith('.md'))
    const nextLogicals = new Set(nextFiles.map(file => file.slice(prefix.length)))
    // Vanishing pages: upstream pages present at current but gone at next, plus cloud
    // pages configured retire-in-next. Their basenames may no longer be linked anywhere.
    const currentFiles = (await reader.listFiles(shared.lock.current, shared.manualConfig.source.dir))
      .filter(file => file.startsWith(prefix) && file.endsWith('.md'))
    const currentLogicals = new Set(currentFiles.map(file => file.slice(prefix.length)))
    const group = shared.sharedDocsPath?.split('/').pop() ?? shared.manualConfig.publish.manual
    const report: ManualPromoteReport = { schema_version: 1, kind: 'shared-manual-promotion', group,
      manual: shared.manualConfig.publish.manual,
      lock: { from: { current: shared.lock.current, next: shared.lock.next }, to: { current: shared.lock.next, next: shared.lock.next } },
      cloudPagesPromoted: [], cloudPagesRetired: [], upstreamPagesRetired: [], metadataRemoved: [], excludeRemoved: [],
      handwrittenGates: [], blockedReferences: [] }
    for (const logical of [...currentLogicals].filter(file => !nextLogicals.has(file)).sort()) {
      report.upstreamPagesRetired.push(logical)
    }
    const cloudPages = shared.manualConfig.cloud_pages ?? {}
    const remainingCloudPages: ManualConfig['cloud_pages'] = {}
    const remainingCloudFiles = new Map<string, { file: string; text: string }>()
    for (const [logical, entry] of Object.entries(cloudPages)) {
      if (entry.channel === 'retire-in-next') { report.cloudPagesRetired.push(logical); continue }
      remainingCloudPages[logical] = entry.channel === 'next' ? { file: entry.file } : { ...entry }
      if (entry.channel === 'next') report.cloudPagesPromoted.push(logical)
      const content = shared.cloudFiles.get(logical)
      if (content) remainingCloudFiles.set(logical, { file: content.file, text: content.text })
    }
    const vanishing = new Set([...report.upstreamPagesRetired, ...report.cloudPagesRetired]
      .map(logical => logical.slice(logical.lastIndexOf('/') + 1).toLowerCase()))
    // Reference closure: a basename a vanishing page owns must not be linked by any
    // surviving page — upstream links need an upstream fix, cloud links an author fix.
    for (const logical of [...nextLogicals].sort()) {
      const text = await reader.readFile(shared.lock.next, prefix + logical)
      for (const ref of collectReferences(text).links) {
        const kind = classifyLink(ref.url)
        if (kind !== 'page' && kind !== 'page-path') continue
        const head = ref.url.split('#')[0], target = head.slice(head.lastIndexOf('/') + 1).toLowerCase()
        if (vanishing.has(target)) report.blockedReferences.push({ kind: 'upstream', file: logical, line: ref.line, target })
      }
    }
    for (const [logical, content] of remainingCloudFiles) {
      content.text.split('\n').forEach((line, index) => { if (GATE.test(line)) report.handwrittenGates.push({ file: logical, line: index + 1 }) })
      for (const ref of collectReferences(content.text).links) {
        const kind = classifyLink(ref.url)
        if (kind !== 'page' && kind !== 'page-path') continue
        const head = ref.url.split('#')[0], target = head.slice(head.lastIndexOf('/') + 1).toLowerCase()
        if (vanishing.has(target)) report.blockedReferences.push({ kind: 'cloud', file: content.file, line: ref.line, target })
      }
    }
    if (report.blockedReferences.length) {
      await writeReport(out, report, undefined, undefined)
      write(JSON.stringify({ exitCode: 1, out, blocked: report.blockedReferences.length }) + '\n')
      return 1
    }
    // Approved-intent cleanup: configuration that names pages vanishing with this
    // promotion is removed and reported, never silently kept (it would fail the next
    // expansion with CONFIG_PATH_UNKNOWN) and physical content files are never deleted.
    const nextConfig: ManualConfig = JSON.parse(JSON.stringify(shared.manualConfig))
    if (nextConfig.metadata) {
      for (const key of Object.keys(nextConfig.metadata)) {
        const alive = key.endsWith('/')
          ? [...nextLogicals].some(file => file.startsWith(key)) || Object.keys(remainingCloudPages).some(file => file.startsWith(key))
          : nextLogicals.has(key) || remainingCloudPages[key] !== undefined
        if (!alive) { delete nextConfig.metadata[key]; report.metadataRemoved.push(key) }
      }
      if (!Object.keys(nextConfig.metadata).length) delete nextConfig.metadata
    }
    if (nextConfig.exclude) {
      const alive = nextConfig.exclude.filter(entry => entry.endsWith('/')
        ? [...nextLogicals].some(file => file.startsWith(entry)) : nextLogicals.has(entry))
      for (const entry of nextConfig.exclude) if (!alive.includes(entry)) report.excludeRemoved.push(entry)
      if (alive.length) nextConfig.exclude = alive
      else delete nextConfig.exclude
    }
    if (Object.keys(remainingCloudPages).length) nextConfig.cloud_pages = remainingCloudPages
    else delete nextConfig.cloud_pages
    const manualText = `${dump(nextConfig, { lineWidth: 0, noRefs: true }).trimEnd()}\n`
    // The rewritten configuration must parse and expand cleanly against the next tree
    // before anything is staged: a stale key that survived cleanup would fail the whole
    // promotion PR validation, so the command fails here with the expansion errors.
    const variables = shared.variables
    const parsed = parseManualConfig(manualText, { ...shared.context, file: 'manual.yaml', variables })
    if ('errors' in parsed) throw new ManualPromoteArgumentError(`Rewritten manual.yaml does not parse: ${parsed.errors.map(error => error.message).join('; ')}`)
    const expanded = expandManualPages(nextFiles, parsed.config,
      new Map([...remainingCloudFiles].map(([logical, content]) => [logical, { file: content.file, text: content.text }])))
    if (expanded.errors.length) throw new ManualPromoteArgumentError(`Rewritten manual.yaml fails expansion: ${expanded.errors.map(error => error.message).join('; ')}`)
    const lockText = `schema_version: 1\ncurrent: ${shared.lock.next}\nnext: ${shared.lock.next}\n`
    await writeReport(out, report, lockText, manualText)
    write(JSON.stringify({ exitCode: 0, out, promoted: report.cloudPagesPromoted.length, retired: report.cloudPagesRetired.length + report.upstreamPagesRetired.length }) + '\n')
    return 0
  } finally { await reader.dispose() }
}

async function writeReport(out: string, report: ManualPromoteReport, lockText: string | undefined, manualText: string | undefined) {
  await mkdir(out, { recursive: true })
  if (lockText !== undefined && manualText !== undefined) {
    await writeFile(join(out, 'lock.yaml'), lockText, { flag: 'wx' })
    await writeFile(join(out, 'manual.yaml'), manualText, { flag: 'wx' })
  }
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
  await writeFile(join(out, 'report.md'), promoteMarkdown(report), { flag: 'wx' })
}

function promoteMarkdown(report: ManualPromoteReport): string {
  const list = (names: readonly string[]) => names.length ? names.map(name => `\`${name}\``).join(', ') : 'none'
  const lines = [`# Manual promotion: ${report.manual}`, '',
    `Lock: \`current\` ${report.lock.from.current.slice(0, 12)} → ${report.lock.to.current.slice(0, 12)} (\`next\` unchanged at ${report.lock.to.next.slice(0, 12)}).`, '',
    `- cloud_pages promoted to two-sided visibility: ${list(report.cloudPagesPromoted)}`,
    `- cloud_pages retired (config removed; content files stay): ${list(report.cloudPagesRetired)}`,
    `- Upstream pages retired with this promotion: ${list(report.upstreamPagesRetired)}`,
    `- Stale metadata keys removed: ${list(report.metadataRemoved)}`,
    `- Stale exclude entries removed: ${list(report.excludeRemoved)}`, '']
  if (report.handwrittenGates.length) {
    lines.push('## Handwritten channel markers (review individually; not removed automatically)', '',
      ...report.handwrittenGates.map(gate => `- \`${gate.file}\` line ${gate.line}`), '')
  }
  if (report.blockedReferences.length) {
    lines.push('## Blocked references (fix before promoting)', '',
      ...report.blockedReferences.map(ref => `- ${ref.kind} \`${ref.file}\` line ${ref.line} links \`${ref.target}\``), '',
      'A live page still links a page that vanishes with this promotion; the post-promotion build would fail.')
  }
  return lines.join('\n')
}
