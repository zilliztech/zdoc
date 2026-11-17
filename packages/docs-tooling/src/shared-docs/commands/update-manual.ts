import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { gitMetadataDirectories } from '../adapters/updates/git'
import { MilvusDocsReaderError } from '../adapters/reader-errors'
import { createBuildReader } from '../adapters/build-page'
import { checkOutput } from './update'
import { readManualSharedDocs } from './build'

/** Manual-layout upstream update (design 06, WP12 manual-level): compare the tracking
 * head with the locked `next` over the whole manual and produce the candidate lock plus
 * the impact report. The command never edits the group; the caller commits the candidate
 * `next-lock.yaml` into the rolling update PR, whose validation runs the normal build. */
export interface ManualUpdateOptions { sharedDocs: string; repo: string; dev: string; out: string }

export interface ManualUpdateReport {
  schema_version: 1
  kind: 'shared-manual-update'
  group: string
  manual: string
  tracking: string
  from: string
  to: string
  /** Pages present at head but not at the locked next: whole-page next candidates. */
  added: string[]
  /** Pages present at the locked next but gone at head: retire-in-next candidates. */
  removed: string[]
  /** Pages present at both commits whose bytes differ. */
  changed: string[]
  upToDate: boolean
  counts: { added: number; removed: number; changed: number }
}

export class ManualUpdateArgumentError extends Error {}
const fail = (message: string): never => { throw new ManualUpdateArgumentError(message) }

export async function manualUpdate(options: ManualUpdateOptions, write: (text: string) => void,
  repositoryRoot = process.cwd()): Promise<number> {
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
    const head = await reader.trackedHead(shared.sourceConfig.track)
    const group = shared.sharedDocsPath?.split('/').pop() ?? shared.manualConfig.publish.manual
    const report: ManualUpdateReport = { schema_version: 1, kind: 'shared-manual-update', group,
      manual: shared.manualConfig.publish.manual, tracking: shared.sourceConfig.track, from: shared.lock.next, to: head,
      added: [], removed: [], changed: [], upToDate: false, counts: { added: 0, removed: 0, changed: 0 } }
    // Fail closed on a rewritten or diverged upstream history before anything else:
    // adopting a next that is not a descendant of the locked one would silently abandon
    // the pinned lineage, and an up-to-date report must not bless a broken lock.
    for (const [channel, commit] of [['current', shared.lock.current], ['next', shared.lock.next]] as const) {
      let onBranch: boolean
      try { onBranch = await reader.isOnBranch(commit, shared.sourceConfig.track) }
      catch (error) {
        if (!(error instanceof MilvusDocsReaderError) || error.code !== 'MISSING_COMMIT') throw error
        onBranch = false
      }
      if (!onBranch) fail(`Locked ${channel} ${commit} is missing from or off the tracking branch ${shared.sourceConfig.track}`)
    }
    if (!await reader.isAncestor(shared.lock.next, head)) {
      fail(`Tracking head ${head} is not a descendant of the locked next ${shared.lock.next}; refusing to adopt`)
    }
    if (head === shared.lock.next) {
      report.upToDate = true
      await writeReport(out, report, undefined)
      write(JSON.stringify({ exitCode: 0, out, ...report.counts, upToDate: true }) + '\n')
      return 0
    }
    const prefix = `${shared.manualConfig.source.dir}/`
    const logicals = async (commit: string) => {
      const files = await reader.listFiles(commit, shared.manualConfig.source.dir)
      return new Set(files.filter(file => file.startsWith(prefix) && file.endsWith('.md')).map(file => file.slice(prefix.length)))
    }
    const nextSet = await logicals(shared.lock.next), headSet = await logicals(head)
    report.added = [...headSet].filter(file => !nextSet.has(file)).sort()
    report.removed = [...nextSet].filter(file => !headSet.has(file)).sort()
    for (const logical of [...nextSet].filter(file => headSet.has(file)).sort()) {
      const [before, after] = await Promise.all([reader.readFile(shared.lock.next, prefix + logical), reader.readFile(head, prefix + logical)])
      if (before !== after) report.changed.push(logical)
    }
    report.counts = { added: report.added.length, removed: report.removed.length, changed: report.changed.length }
    const candidate = `schema_version: 1\ncurrent: ${shared.lock.current}\nnext: ${head}\n`
    await writeReport(out, report, candidate)
    write(JSON.stringify({ exitCode: 0, out, ...report.counts, upToDate: false }) + '\n')
    return 0
  } finally { await reader.dispose() }
}

async function writeReport(out: string, report: ManualUpdateReport, candidate: string | undefined) {
  await mkdir(out, { recursive: true })
  if (candidate !== undefined) await writeFile(join(out, 'next-lock.yaml'), candidate, { flag: 'wx' })
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
  await writeFile(join(out, 'report.md'), updateMarkdown(report), { flag: 'wx' })
}

function updateMarkdown(report: ManualUpdateReport): string {
  const short = report.to.slice(0, 12)
  const list = (names: readonly string[]) => names.length ? names.map(name => `\`${name}\``).join(', ') : 'none'
  if (report.upToDate) {
    return [`# Manual update: ${report.manual}`, '',
      `The tracking head equals the locked next (${short} on \`${report.tracking}\`); there is nothing to adopt.`,
      'No lock candidate was staged, so the caller should not open an update PR.'].join('\n') + '\n'
  }
  return [`# Manual update: ${report.manual} to ${short}`, '',
    `Suggested PR title: \`shared-docs: update ${report.manual} to ${report.tracking} ${short}\``, '',
    `Range: ${report.from.slice(0, 12)}…${short} on \`${report.tracking}\`.`, '',
    `- Added (whole-page \`next\` candidates): ${list(report.added)}`,
    `- Removed (\`retire-in-next\` candidates): ${list(report.removed)}`,
    `- Changed: ${list(report.changed)}`, '',
    'Apply `next-lock.yaml` to the group, then let the PR validation build the whole manual at the candidate next.',
    'Upstream renames have no dedicated handling: a removed/added pair must be reviewed as such.'].join('\n') + '\n'
}
