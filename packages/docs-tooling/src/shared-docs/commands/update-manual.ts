import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { gitMetadataDirectories } from '../adapters/updates/git'
import { MilvusDocsReaderError } from '../adapters/reader-errors'
import { createBuildReader } from '../adapters/build-page'
import { checkOutput } from './update'
import { readManualSharedDocs } from './build'
import { mergeManualLedgerEntries, parseManualLedger, serializeManualLedger } from '../core/ledger'
import { parseManualConfig } from '../core/manual-config'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import type { ManualLedgerEntry, ManualMetadata } from '../core/types'

/** Manual-layout upstream update (design 06, WP12 manual-level): compare the tracking
 * head with the locked `next` over the whole manual and produce the candidate lock plus
 * the impact report. The publish surface is never changed by the lane alone (design:
 * B + tiered blocking): a removed page that is still published blocks the run, and each
 * unadjudicated added page is paired with a new `exclude` entry plus a deferred
 * `ledger.json` entry, so adoption always needs a human-authored edit. The command never
 * edits the group; the caller commits the candidate files into the rolling update PR,
 * whose validation runs the normal build. */
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
  /** Added pages not covered by an exclude entry: they would newly publish, so the
   * candidate pairs each with an exclude entry and stages a deferred ledger entry. */
  addedPending: string[]
  /** Pages present at the locked next but gone at head: retire-in-next candidates. */
  removed: string[]
  /** Removed pages that are published at the current pin and not excluded: adopting any
   * candidate would retire a live route, so the lane blocks before staging anything. */
  removedPublished: string[]
  /** Removed pages already excluded: they vanish without touching the publish surface. */
  removedExcluded: string[]
  /** Pages present at both commits whose bytes differ. */
  changed: string[]
  /** One existing page metadata entry as drafting grounding for the advisory stage. */
  metadataExample?: { file: string; fields: ManualMetadata }
  blocked: boolean
  upToDate: boolean
  counts: { added: number; removed: number; changed: number; addedPending: number; removedPublished: number }
}

export class ManualUpdateArgumentError extends Error {}
const fail = (message: string): never => { throw new ManualUpdateArgumentError(message) }

const LANE_OWNER = 'shared-docs-manual-lane'

/** True when the manual's exclude list already covers the logical page (module entries
 * end in `/` and prefix-match; page entries match exactly), mirroring expandManualPages. */
const isExcludedLogical = (exclude: readonly string[] | undefined, logical: string): boolean =>
  (exclude ?? []).some(entry => entry.endsWith('/') ? logical.startsWith(entry) : logical === entry)

/** Textually append exclude entries to the committed manual.yaml instead of re-dumping the
 * whole document, so the candidate diff stays exactly the appended lines. The section must
 * be a block list; anything else (inline flow value, duplicate key from a misfire) fails the
 * parse guard after the splice rather than corrupting the group file. */
export function appendExclusions(manualYaml: string, files: readonly string[]): string {
  const inline = manualYaml.match(/^exclude:[ \t]+\S.*$/m)
  if (inline) fail(`exclude must be a block list so pairing entries can be appended; rewrite the inline value (${inline[0].trim()}) as a block list first`)
  const lines = manualYaml.split('\n')
  const keyAt = lines.findIndex(line => /^exclude:\s*$/.test(line))
  if (keyAt < 0) {
    const base = manualYaml.replace(/\n$/, '')
    return `${base}\nexclude:\n${files.map(file => `  - ${file}`).join('\n')}\n`
  }
  let end = keyAt + 1
  while (end < lines.length && (lines[end].trim() === '' || /^[ \t]+- /.test(lines[end]) || /^[ \t]+#/.test(lines[end]))) end += 1
  const existingItem = lines.slice(keyAt + 1, end).find(line => /^[ \t]+- /.test(line))
  const indent = existingItem?.match(/^([ \t]+)- /)?.[1] ?? '  '
  lines.splice(end, 0, ...files.map(file => `${indent}- ${file}`))
  return lines.join('\n')
}

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
      added: [], addedPending: [], removed: [], removedPublished: [], removedExcluded: [], changed: [],
      blocked: false, upToDate: false, counts: { added: 0, removed: 0, changed: 0, addedPending: 0, removedPublished: 0 } }
    const exampleKey = Object.keys(shared.manualConfig.metadata ?? {}).find(key => key.endsWith('.md'))
    if (exampleKey) report.metadataExample = { file: exampleKey, fields: shared.manualConfig.metadata![exampleKey] }
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
      await writeReport(out, report, undefined, undefined, undefined)
      write(JSON.stringify({ exitCode: 0, out, ...report.counts, blocked: false, upToDate: true }) + '\n')
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
    // Tiered surface classification (B + tiered blocking): only a removal that retires a
    // live route blocks; excluded removals and everything else annotate.
    const currentSet = await logicals(shared.lock.current)
    const excluded = (logical: string) => isExcludedLogical(shared.manualConfig.exclude, logical)
    report.removedPublished = report.removed.filter(file => currentSet.has(file) && !excluded(file)).sort()
    report.removedExcluded = report.removed.filter(file => excluded(file)).sort()
    report.addedPending = report.added.filter(file => !excluded(file)).sort()
    report.counts = { added: report.added.length, removed: report.removed.length, changed: report.changed.length,
      addedPending: report.addedPending.length, removedPublished: report.removedPublished.length }
    if (report.removedPublished.length > 0) {
      // Blocking gate: retiring a live route needs a redirect decision that has no default.
      // Nothing is staged — no candidate lock, no manual.yaml, no ledger — so the open PR
      // slot stays free for the human's adjudication commit.
      report.blocked = true
      await writeReport(out, report, undefined, undefined, undefined)
      write(JSON.stringify({ exitCode: 3, out, blocked: true, removedPublished: report.removedPublished.length, ...report.counts, upToDate: false }) + '\n')
      return 3
    }
    let candidateManual: string | undefined
    let candidateLedger: string | undefined
    if (report.addedPending.length > 0) {
      // Zero-auto-adoption pairing: each unadjudicated addition rides behind a new exclude
      // entry, so the bump alone publishes nothing new. Adoption = a human removes the line.
      candidateManual = appendExclusions(shared.manualYaml, report.addedPending)
      const context = { manuals: [shared.manualConfig.publish.manual], betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
      const validated = parseManualConfig(candidateManual, context)
      if ('errors' in validated) {
        for (const error of validated.errors) write(`${error.file}:${error.line ?? 1} ${error.code}: ${error.message}\n`)
        fail('The exclude-paired candidate manual.yaml does not parse; refusing to stage it')
      }
      let ledgerText: string | undefined
      try { ledgerText = await readFile(join(resolve(repositoryRoot, options.sharedDocs), 'ledger.json'), 'utf8') } catch { ledgerText = undefined }
      const existing = parseManualLedger(ledgerText)
      if ('errors' in existing) {
        for (const error of existing.errors) write(`${error.file}:${error.page ? ` ${error.page}` : ''} ${error.code}: ${error.message}\n`)
        return 1
      }
      const today = new Date().toISOString().slice(0, 10)
      const additions: ManualLedgerEntry[] = report.addedPending
        .filter(file => !existing.ledger.entries.some(entry => entry.file === file))
        .map(file => ({ file, first_seen_pin: head, first_seen_at: today, classification: 'deferred' as const,
          reason: 'Upstream addition staged behind an exclude entry; adoption, exclusion, or deferral is a human ledger edit.',
          owner: LANE_OWNER, decided_at: today }))
      if (additions.length > 0) {
        const merged = mergeManualLedgerEntries(existing.ledger, additions)
        candidateLedger = serializeManualLedger(merged.ledger)
      }
    }
    const candidate = `schema_version: 1\ncurrent: ${shared.lock.current}\nnext: ${head}\n`
    await writeReport(out, report, candidate, candidateManual, candidateLedger)
    write(JSON.stringify({ exitCode: 0, out, ...report.counts, blocked: false, upToDate: false }) + '\n')
    return 0
  } finally { await reader.dispose() }
}

async function writeReport(out: string, report: ManualUpdateReport, candidate: string | undefined,
  candidateManual: string | undefined, candidateLedger: string | undefined) {
  await mkdir(out, { recursive: true })
  if (candidate !== undefined) await writeFile(join(out, 'next-lock.yaml'), candidate, { flag: 'wx' })
  if (candidateManual !== undefined) await writeFile(join(out, 'manual.yaml'), candidateManual, { flag: 'wx' })
  if (candidateLedger !== undefined) await writeFile(join(out, 'ledger.json'), candidateLedger, { flag: 'wx' })
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
  if (report.blocked) {
    return [`# Manual update: ${report.manual} — blocked at ${short}`, '',
      `Removed pages still published at the current pin: ${list(report.removedPublished)}.`,
      'Adopting the tracking head would retire live routes, so the lane staged no candidate (no `next-lock.yaml`,',
      'no `manual.yaml`, no `ledger.json`) and opened nothing. The removal decision has no default: retiring a',
      'published route also needs a redirect plan (nginx 301), which is a human call.', '',
      'Recipe per file, then re-run the lane:', '',
      '- Retire: add the file (or its module `dir/`) to `exclude`, remove its `metadata` key, and file the redirect;',
      '  a vanished page matches `exclude` against the pinned trees until the promotion cleans it up.',
      '- Keep: leave the lock as is; the page stays pinned until upstream restores it (or the pin moves past it).',
      '- Rename (a removed/added pair): exclude the old path, adopt the new path per the added-page flow below,',
      '  and move its `metadata` key old → new.'].join('\n') + '\n'
  }
  const lines = [`# Manual update: ${report.manual} to ${short}`, '',
    `Suggested PR title: \`shared-docs: update ${report.manual} to ${report.tracking} ${short}\``, '',
    `Range: ${report.from.slice(0, 12)}…${short} on \`${report.tracking}\`.`, '',
    `- Changed: ${list(report.changed)}`]
  if (report.addedPending.length > 0) {
    lines.push(`- Added pending adjudication (each paired with a new \`exclude\` entry): ${list(report.addedPending)}`,
      '  The candidate `manual.yaml` excludes them, so the bump publishes nothing new. Adopt a page by deleting',
      '  its `exclude` line (optionally copying the metadata draft recorded in `ledger.json`); the next build',
      '  publishes it on the next channel. `ledger.json` gains one `deferred` entry per pending page.')
  }
  if (report.added.length > report.addedPending.length) {
    lines.push(`- Added already excluded (no pairing needed): ${list(report.added.filter(file => !report.addedPending.includes(file)))}`)
  }
  if (report.removedExcluded.length > 0) {
    lines.push(`- Removed but already excluded (annotation only): ${list(report.removedExcluded)}`,
      '  They vanish from the excluded set; the promotion will clean up their reserved identities.')
  }
  lines.push('',
    'Apply `next-lock.yaml` plus, when staged, `manual.yaml` and `ledger.json` in one commit — the exclusion',
    'pairing and the ledger are atomic with the pin. PR validation builds the whole manual at the candidate next.',
    'Upstream renames have no dedicated handling: a removed/added pair must be reviewed as such.')
  return lines.join('\n') + '\n'
}
