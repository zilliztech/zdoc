import { link, mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { isEnglishUatBuildIdentity } from '../../../../../deploy/contracts/verify-image.mjs'
import { isJenkinsBuildNumber, openJenkinsUatEvidence, type JenkinsEvidenceReader, type JenkinsPreviewEnvironment } from '../adapters/jenkins-promotion-evidence'
import { collectPromotionPreview, preparePromotion, previewJenkinsUatEvidence, previewUatEvidence, promotionError, readUatGitDirectories } from '../adapters/promotion'
import { gitMetadataDirectories } from '../adapters/updates/git'
import { promotionPageId, type PromotionPreview, type PromotionResult } from '../core/promotion'
import { checkOutput } from './update'

const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n'

const usage = [
  'shared-docs promote-guides --mode preview --jenkins-build NUMBER --page ID --repo UPSTREAM --dev ZDOC_DEV --out DIRECTORY',
  'shared-docs promote-guides --mode preview --uat-build vdc-jenkins/english-uat/BUILD --page ID --repo UPSTREAM --dev ZDOC_DEV --out DIRECTORY',
  'shared-docs promote-guides --mode preview --uat-record FILE --repo UPSTREAM --dev ZDOC_DEV --out DIRECTORY',
  'shared-docs promote-guides --mode prepare --uat-record FILE --repo UPSTREAM --dev ZDOC_DEV --out DIRECTORY --preview FILE --pages ID,ID|all-eligible',
  'Run from the candidate zdoc checkout. Committed HEADs supply the candidate and dev baselines.',
  'The Jenkins build preview requires VDC_JENKINS_PREVIEW_ORIGIN, VDC_JENKINS_PREVIEW_JOB, VDC_JENKINS_PREVIEW_USER and VDC_JENKINS_PREVIEW_API_TOKEN from the trusted runner and writes only a report.',
  'The UAT build preview validates a record from the trusted mount supplied by the release environment and writes only a report.',
  'Pass a version-1 replay envelope with observation "replay", a nested English UAT release record, and openUpdatePages (an explicit list).',
  'Pass a fresh output directory. Replay artifacts describe local evidence only.',
].join('\n') + '\n'

type Options = { upstream: string; dev: string; out: string } & (
  { mode: 'preview'; record: string } | { mode: 'preview'; build: string; page: string; source: 'mount' | 'jenkins' }
  | { mode: 'prepare'; record: string; preview: string; selection: 'all-eligible' | string[] }
)

function argumentsFor(argv: string[], root: string): Options {
  const flags = new Set(['--mode', '--uat-record', '--uat-build', '--jenkins-build', '--page', '--repo', '--dev', '--out', '--preview', '--pages'])
  const values = new Map<string, string>()
  for (let index = 0; index < argv.length; index += 2) {
    const [flag, value] = argv.slice(index, index + 2)
    if (!flags.has(flag) || values.has(flag)) throw new Error(`Unknown or repeated option: ${flag}`)
    if (value === undefined || value.startsWith('--') || /[\0\r\n]/.test(value) || (!value && flag !== '--pages')) {
      throw new Error(`${flag} requires a value`)
    }
    values.set(flag, value)
  }
  function required(flag: string) {
    if (!values.has(flag)) throw new Error(`${flag} is required`)
    return values.get(flag)!
  }
  const mode = required('--mode')
  const path = (flag: string) => resolve(root, required(flag))
  const requestPaths = () => ({ upstream: path('--repo'), dev: path('--dev'), out: path('--out') })
  if (values.has('--uat-build') && values.has('--jenkins-build')) throw new Error('--uat-build and --jenkins-build are mutually exclusive')
  const buildFlag = values.has('--jenkins-build') ? '--jenkins-build' : '--uat-build'
  if (values.has(buildFlag)) {
    if (mode !== 'preview' || values.has('--preview') || values.has('--pages')) throw new Error(`${buildFlag} is preview only`)
    if (values.has('--uat-record')) throw new Error(`${buildFlag} and --uat-record are mutually exclusive`)
    const build = required(buildFlag)
    const page = required('--page')
    const source = buildFlag === '--jenkins-build' ? 'jenkins' : 'mount'
    if (source === 'jenkins' && !isJenkinsBuildNumber(build)) throw new Error('--jenkins-build requires an exact positive build number')
    if (source === 'mount' && !isEnglishUatBuildIdentity(build)) throw new Error('--uat-build requires an exact English UAT build identity')
    if (!promotionPageId(page)) throw new Error('--page requires one Guides page ID')
    return { mode, ...requestPaths(), build, page, source }
  }
  if (values.has('--page')) throw new Error('--page requires --uat-build or --jenkins-build')
  const common = { record: path('--uat-record'), ...requestPaths() }
  if (mode === 'preview') {
    if (values.has('--preview') || values.has('--pages')) throw new Error('--preview and --pages are prepare options')
    return { mode, ...common }
  }
  if (mode !== 'prepare') throw new Error('--mode must be preview or prepare')
  const input = required('--pages')
  const preview = path('--preview')
  if (input === 'all-eligible') return { mode, ...common, preview, selection: input }
  const selection = input === '' ? [] : input.split(',')
  if (selection.some(page => !promotionPageId(page)) || new Set(selection).size !== selection.length) {
    throw new Error('--pages must be a unique comma-separated list of Guides page IDs or all-eligible')
  }
  return { mode, ...common, preview, selection }
}

async function reserveOutput(options: Options, master: string) {
  const { out, upstream, dev } = options
  const repositories = [...new Set([master, upstream, dev])]
  // Git accepts subdirectories as -C, so protect the discovered worktree
  // as well as each requested path and its metadata directories.
  const protectedDirectories = 'build' in options
    ? (await Promise.all(repositories.map(readUatGitDirectories))).flatMap(root =>
      root.worktree ? [...root.metadata, root.worktree] : root.metadata)
    : (await Promise.all(repositories.map(gitMetadataDirectories))).flat()
  const requestDirectories = [...repositories, ...protectedDirectories]
  const evidenceRoot = 'source' in options && options.source === 'mount' ? process.env.VDC_JENKINS_EVIDENCE_ROOT : undefined
  const inputs = [...requestDirectories, ...('record' in options ? [options.record] : []),
    ...(options.mode === 'prepare' ? [options.preview] : []), ...(evidenceRoot ? [evidenceRoot] : [])]
  await checkOutput(out, inputs)
  await mkdir(dirname(out), { recursive: true })
  await checkOutput(out, inputs)
  // No reuse of a prior attempt, including an existing empty directory.
  await mkdir(out, { mode: 0o700 })
  return [...requestDirectories, out]
}

/** Publish the verified report last. A patch by itself carries no preparation outcome. */
async function publishPrepared(out: string, report: PromotionResult, patch: string) {
  const staging = await mkdtemp(join(out, '.promotion-'))
  const patchPath = join(out, 'promotion.patch')
  let patchPublished = false
  let reportPublished = false
  try {
    await writeFile(join(staging, 'promotion.patch'), patch, { flag: 'wx' })
    await writeFile(join(staging, 'promotion-result.json'), serialize(report), { flag: 'wx' })
    await link(join(staging, 'promotion.patch'), patchPath)
    patchPublished = true
    await link(join(staging, 'promotion-result.json'), join(out, 'promotion-result.json'))
    reportPublished = true
  } catch (error) {
    if (patchPublished) await unlink(patchPath)
    throw error
  } finally {
    try { await rm(staging, { recursive: true, force: true }) }
    catch (error) {
      // Cleanup cannot invalidate a report that has already committed.
      if (!reportPublished) throw error
    }
  }
}

export async function runGuidesPromotion(
  argv: string[], master: string, write = (message: string) => process.stdout.write(message), jenkinsEnvironment?: JenkinsPreviewEnvironment,
): Promise<number> {
  if (argv.length === 1 && argv[0] === '--help') {
    write(usage)
    return 0
  }
  let options: Options
  let readJenkins: JenkinsEvidenceReader | undefined
  let requestDirectories: string[]
  try {
    options = argumentsFor(argv, master)
    if ('source' in options && options.source === 'jenkins') readJenkins = openJenkinsUatEvidence(options.build, jenkinsEnvironment)
    requestDirectories = await reserveOutput(options, master)
  } catch (error) {
    write(`Guides promotion arguments: ${promotionError(error)}\n`)
    return 2
  }

  const scratch = await mkdtemp(join(tmpdir(), 'shared-guides-promotion-'))
  try {
    if ('build' in options) {
      const report = readJenkins
        ? await previewJenkinsUatEvidence({ ...options, master }, readJenkins, scratch)
        : await previewUatEvidence({ ...options, master, requestDirectories }, scratch)
      await writeFile(join(options.out, 'promotion-preview.json'), serialize(report), { flag: 'wx' })
      const reason = 'reason' in report.deployment ? report.deployment.reason
        : report.comparison.status === 'blocked' ? report.comparison.reason : undefined
      const source = report.observation === 'jenkins-direct' ? 'Jenkins UAT' : 'UAT'
      write(reason ? `Guides ${source} preview paused: ${reason}\n`
        : `Guides ${source} evidence preview written. Image label verification and operator acceptance are pending. Open update PRs were not checked.\n`)
      return report.status === 'paused' ? 1 : 0
    }
    if (options.mode === 'preview') {
      let report: PromotionPreview
      try {
        report = (await collectPromotionPreview({ ...options, master }, scratch)).preview
      } catch (error) {
        report = { schema_version: 1, observation: 'replay', status: 'paused', reason: promotionError(error), pages: [] }
      }
      await writeFile(join(options.out, 'promotion-preview.json'), serialize(report), { flag: 'wx' })
      const count = (status: string) => report.pages.filter(page => page.status === status).length
      write(report.reason ? `Guides promotion paused: ${report.reason}\n`
        : `Guides promotion replay preview written. ${count('eligible')} eligible, ${count('unnecessary')} unnecessary, ${count('blocked')} blocked.\n`)
      return report.status === 'paused' ? 1 : 0
    }
    let report: PromotionResult
    let patch: string | undefined
    try {
      const prepared = await preparePromotion({ ...options, master, previewPath: options.preview }, scratch)
      report = prepared.result
      patch = prepared.patch
    } catch (error) {
      report = { schema_version: 1, observation: 'replay', status: 'paused', selected: [], pages: [], reasons: [promotionError(error)] }
    }
    const resultPath = join(options.out, 'promotion-result.json')
    if (patch === undefined) {
      await writeFile(resultPath, serialize(report), { flag: 'wx' })
    } else {
      try {
        await publishPrepared(options.out, report, patch)
      } catch (error) {
        const { patchSha256: _patchSha256, ...attempt } = report
        report = { ...attempt, status: 'paused', reasons: [`Could not publish prepared artifacts: ${promotionError(error)}`] }
        await writeFile(resultPath, serialize(report), { flag: 'wx' })
      }
    }
    if (report.status === 'paused') {
      const reasons = [...report.reasons, ...report.pages.filter(page => page.reason).map(page => `${page.page}: ${page.reason}`)]
      write(`Guides promotion paused: ${reasons.join('\n')}\n`)
      return 1
    }
    write(report.status === 'empty' ? 'Guides promotion replay selected no pages.\n' : 'Guides promotion replay patch and report written.\n')
    return 0
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
}
