import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSourceConfig } from '../../core/config'
import { parseLock } from '../../core/lock'
import { analyzeUpdates, renderImpactMarkdown } from '../../core/updates/impact'
import { discoverPage } from '../../core/updates/discovery'
import { classifyLifecycle, defaultLifecyclePolicy, type LifecycleEvidence, type LifecyclePolicy } from '../../core/updates/lifecycle'
import type { FixedPageInput, FixedVersions } from '../../core/updates/types'
import { readUpdateConfiguration } from '../update-inputs'
import type { ImageFetcher } from '../images'
import { collectCandidate } from './candidate'
import { exportTree, resolveCommit, requireOrdered, sourceEndpoints, gitRead } from './git'
import { hash, readLifecycle } from './lifecycle'
import { GitHubReads, type ReadonlyGitHub } from './github'
export interface UpdateOptions { sharedDocs: string; repo: string; dev: string; out: string; mode?: string; masterSha?: string; devSha?: string;
  sourceSha?: string; comparisonMasterSha?: string; pages?: string; evidenceRun?: string; evidenceZip?: string }
export interface UpdateDependencies { fetcher?: ImageFetcher; github?: ReadonlyGitHub;
  clock?: { kind: 'offline-replay'; now: number }; policy?: LifecyclePolicy }
export class UpdateArgumentError extends Error {}
export async function reportUpdates(options: UpdateOptions, repositoryRoot: string, dependencies: UpdateDependencies = {}) {
  const temporary = await mkdtemp(join(tmpdir(), 'shared-update-'))
  const errors: { pageId?: string; message: string }[] = []
  const pins: Record<string, any> = { schema_version: 1, offlineReplay: dependencies.clock?.kind === 'offline-replay',
    policy: dependencies.policy ?? defaultLifecyclePolicy, observedAt: new Date(dependencies.clock?.now ?? Date.now()).toISOString() }
  const inventory: Record<string, any>[] = [], observations: FixedPageInput[] = []
  let evidence: LifecycleEvidence = { reasons: ['NO_RETAINED_EVIDENCE'], records: [], identity: {} }
  let versions: FixedVersions | undefined
  try {
    const master = await resolveCommit(repositoryRoot, options.masterSha)
    pins.master = master
    const masterRoot = join(temporary, 'master'), devRoot = join(temporary, 'dev'), oldRoot = join(temporary, 'previous')
    await exportTree(repositoryRoot, master, ['shared-docs/guides'], masterRoot)
    const configuration = await readUpdateConfiguration(join(masterRoot, 'shared-docs/guides'), masterRoot)
    if ('errors' in configuration) throw new Error(JSON.stringify(configuration.errors))
    for (const pageId of configuration.sharedDocs.pages.keys()) inventory.push({ pageId, selected: !options.pages || options.pages.split(',').includes(pageId), status: 'analysis-unavailable' })
    if (options.pages?.split(',').some(id => !configuration.sharedDocs.pages.has(id))) throw new UpdateArgumentError('Unknown configured page')
    const dev = await resolveCommit(options.dev, options.devSha), previous = await resolveCommit(repositoryRoot, options.comparisonMasterSha ?? master)
    Object.assign(pins, { dev, comparisonMaster: previous })
    await exportTree(options.dev, dev, ['content/en/guides', 'content/en/byoc', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'], devRoot)
    await exportTree(repositoryRoot, previous, ['shared-docs/guides'], oldRoot)
    const oldConfiguration = await readUpdateConfiguration(join(oldRoot, 'shared-docs/guides'), oldRoot)
    if ('errors' in oldConfiguration) throw new Error(JSON.stringify(oldConfiguration.errors))
    const source = parseSourceConfig(configuration.sharedDocs.sourceYaml)
    if ('errors' in source) throw new Error(JSON.stringify(source.errors))
    const oldSource = parseSourceConfig(oldConfiguration.sharedDocs.sourceYaml)
    if ('errors' in oldSource || oldSource.config.repository !== source.config.repository || oldSource.config.track !== source.config.track) throw new Error('Comparison configuration uses a different source identity')
    const endpoints = await sourceEndpoints(options.repo, source.config.repository, source.config.track, options.sourceSha)
    pins.source = { repository: source.config.repository, track: source.config.track, head: endpoints.head, target: endpoints.target }
    const toolingRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
    const runtimePaths = new Set((await gitRead(toolingRoot, ['ls-files', '-z', '--', 'packages/docs-tooling/src', 'scripts/docs-tooling.js', 'scripts/lib/load-typescript.js'])).split('\0').filter(p => p && /\.(?:[cm]?[jt]s|json)$/.test(p) && !/\/(testing|fixtures|meta)\//.test(p) && !p.includes('.test.')))
    for (const path of ['core/updates/discovery.ts', 'core/updates/lifecycle.ts', 'commands/update.ts', ...['git', 'github', 'lifecycle', 'candidate', 'runner'].map(n => `adapters/updates/${n}.ts`)]) runtimePaths.add(`packages/docs-tooling/src/shared-docs/${path}`)
    const runtimeDigest = hash(JSON.stringify(await Promise.all([...runtimePaths].sort().map(async path => [path, hash(await readFile(join(toolingRoot, path)))]))))
    pins.tools = { runtimeDigest, pnpm: JSON.parse(await readFile(join(toolingRoot, 'package.json'), 'utf8')).packageManager, zdoc: await resolveCommit(toolingRoot), node: process.version, md2md: '1.3.0',
      lockfileSha256: hash(await readFile(join(toolingRoot, 'pnpm-lock.yaml'))) }
    pins.configurationSha256 = hash(JSON.stringify(configuration.files.map(({ file, sha256 }) => ({ file, sha256 }))))
    versions = { master, dev, tools: pins.tools }
    if (options.evidenceRun) {
      const directory = join(temporary, 'evidence'); await mkdir(directory)
      try {
        const baseline = JSON.parse(await readFile(join(devRoot, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'), 'utf8'))
        evidence = await readLifecycle(dependencies.github ?? new GitHubReads(), Number(options.evidenceRun), directory, options.evidenceZip, baseline.base_app_token)
        const { GitMilvusDocsReader } = await import('../git-milvus-docs-reader')
        for (const [repo, ancestor, head] of [[repositoryRoot, evidence.identity.masterSha, master], [options.dev, evidence.identity.devSha, dev]] as const) {
          if (typeof ancestor !== 'string' || !await new GitMilvusDocsReader(repo).isAncestor(ancestor, head)) evidence.reasons.push('PRODUCER_ANCESTRY_UNPROVEN')
        }
      }
      catch (error) { errors.push({ message: `Lifecycle infrastructure: ${String(error)}` }); evidence = { reasons: ['EVIDENCE_INFRASTRUCTURE_FAILURE'], records: [], identity: {} } }
    }
    pins.lifecycle = { ...evidence.identity, reasons: evidence.reasons, generatedAt: evidence.generatedAt }
    for (const item of inventory) {
      const page = configuration.sharedDocs.pages.get(item.pageId)!
      item.lifecycle = classifyLifecycle(evidence, item.pageId, page.config.publish, dependencies.clock?.now ?? Date.now(), pins.policy)
      if (!item.selected) { item.status = 'not-selected'; continue }
      try {
        const lock = parseLock(page.lockYaml)
        if ('errors' in lock) { item.status = 'content-failure'; item.errors = lock.errors; continue }
        await requireOrdered(endpoints.reader, lock.lock.current, lock.lock.next, endpoints.target)
        const collected = await collectCandidate({ repo: options.repo, dev: devRoot, pageId: item.pageId, current: lock.lock.current,
          oldNext: lock.lock.next, target: endpoints.target, configuration, previousConfiguration: oldConfiguration, versions, fetcher: dependencies.fetcher })
        observations.push(...collected.pages)
        const impact = analyzeUpdates(collected).pages[0]
        Object.assign(item, discoverPage(collected.pages[0], impact, item.lifecycle))
        if (impact.errors.some(e => ['IMAGE_FETCH_FAILED', 'IMAGE_CHANGED_DURING_READ', 'UPDATE_OBSERVATION_UNAVAILABLE'].includes(e.code))) {
          errors.push({ pageId: item.pageId, message: 'Image acquisition/observation unavailable; see page diagnostics' })
        }
      } catch (error) { const message = String(error); item.errors = [message]; errors.push({ pageId: item.pageId, message }) }
    }
  } catch (error) {
    if (error instanceof UpdateArgumentError) throw error
    errors.push({ message: String(error) })
  } finally { await rm(temporary, { recursive: true, force: true }) }
  for (const item of inventory) item.lifecycle ??= { state: 'unknown', reasons: ['ANALYSIS_INFRASTRUCTURE_FAILURE'] }
  const impact = versions && observations.length ? analyzeUpdates({ schema_version: 1, versions, pages: observations }) : null
  // Hash observed bytes/semantics, not execution timestamps or ephemeral producer IDs.
  const inputSha256 = hash(JSON.stringify({ master: pins.master, dev: pins.dev, source: pins.source, config: pins.configurationSha256,
    previous: pins.comparisonMaster, tools: pins.tools, pages: observations, policy: pins.policy,
    lifecycle: inventory.map(p => ({ pageId: p.pageId, lifecycle: p.lifecycle })) }))
  const report = { schema_version: 1, offlineReplay: pins.offlineReplay, pages: inventory, impact, infrastructureErrors: errors,
    counts: { configured: inventory.length, selected: inventory.filter(x => x.selected).length, analyzed: observations.length,
      retainedRecords: evidence.records.length, retainedShared: evidence.records.filter(r => r.source_kind === 'shared-page').length,
      sourceFiles: new Set(observations.flatMap(p => p.candidateNext.files.map(f => f.file))).size,
      observedFiles: observations.reduce((n, p) => n + p.candidateNext.files.length, 0),
      images: observations.reduce((n, p) => n + p.candidateNext.images.length, 0), outputs: observations.reduce((n, p) => n + p.candidateNext.manuals.length, 0) } }
  const markdown = ['# Read-only upstream update report', '', `Offline replay: ${pins.offlineReplay}. No mutation authorized.`, '',
    ...inventory.map(p => `- ${p.pageId}: ${p.status}; lifecycle ${p.lifecycle.state} (${p.lifecycle.reasons.join(', ')})`), '',
    ...errors.map(e => `Infrastructure failure${e.pageId ? ` (${e.pageId})` : ''}: ${e.message}`), '', impact ? renderImpactMarkdown(impact) : 'No impact observations available.'].join('\n') + '\n'
  return { exitCode: errors.length ? 1 : 0, pins, report, markdown,
    plan: { schema_version: 1, reportOnly: true, operations: [], inputSha256, pages: inventory.map(p => ({ pageId: p.pageId,
      proposedNext: p.proposedNext ?? null, futureEligible: p.futureEligible ?? false, reasons: p.reasons ?? p.lifecycle.reasons })) } }
}
