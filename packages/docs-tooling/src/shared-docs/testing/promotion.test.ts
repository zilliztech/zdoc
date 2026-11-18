// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { runBuild } from '../commands/build'
import type { BuiltPage } from '../adapters/build-page'
import { guidesSnapshotPath } from '../adapters/guides-snapshot'
import type { SharedReceipt, SharedRenderTarget } from '../core/handoff/source-state'

const toolingRoot = resolve(import.meta.dirname, '../../../../..')
const launcher = join(toolingRoot, 'scripts/docs-tooling.js')
const require = createRequire(import.meta.url)
const { receiptProjection, renderIdentity } = require('../../lark/sharedPageRenderIdentity.js')
const group = 'shared-docs/guides'
const manifests = 'generated/en/manifests/shared-pages/guides'
const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const scratch: string[] = []
const readOnlyEvidence: string[] = []
vi.setConfig({ testTimeout: 60_000 })
const imageBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64')
const imageObject = `shared/${sha256(imageBytes)}.png`
const imageBase = 'https://images.example.invalid'
const images = [{ source: './diagram.png', sha256: sha256(imageBytes), object: imageObject }]

afterEach(() => {
  for (const root of readOnlyEvidence.splice(0)) {
    chmodSync(root, 0o755)
    chmodSync(join(root, 'evidence'), 0o755)
  }
  for (const root of scratch.splice(0)) rmSync(root, { recursive: true, force: true })
})

function git(root: string, ...args: string[]) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' })
}
function put(root: string, path: string, content: string | Buffer) {
  const file = join(root, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}
function init(root: string) {
  mkdirSync(root)
  git(root, 'init', '-q')
  git(root, 'config', 'user.name', 'Replay')
  git(root, 'config', 'user.email', 'replay@example.invalid')
}
function commit(root: string, message: string) {
  git(root, 'add', '.')
  git(root, 'commit', '-qm', message)
  return git(root, 'rev-parse', 'HEAD').trim()
}
function lock(a: string, b: string) { return `schema_version: 1\ncurrent: '${a}' # reviewed pin\nnext:    ${b}\n` }
function pageYaml(id: string) {
  return `schema_version: 1\nsource: {file: site/en/${id}.md}\npublish:\n  - {manual: guides, path: tutorials/${id}}\n  - {manual: guides-byoc, path: tutorials/${id}}\n`
}
function md(page: string, version: string, href?: string) {
  return [
    '---', `id: ${page}.md`, `title: Replay ${page}`, 'summary: Test page', '---', '',
    '## Setup', '', '<!-- doc:block:start id="sample-prose" -->', `Version ${version}. See [setup](#Setup).`,
    '<!-- doc:block:end id="sample-prose" -->', '', ...(href ? [`[Related page](${href})`, ''] : []), '![diagram](./diagram.png)', '',
    '```python', `version = "${version}"`, '```', '',
  ].join('\n')
}

function targetsFor(page: string): SharedRenderTarget[] {
  return ['guides', 'guides-byoc'].map(manual => ({
    manual, path: `tutorials/${page}`, extension: '.mdx', navigation: { sidebar_label: page, sidebar_position: 1 }, channel: 'current',
  }))
}

async function buildFixture(master: string, upstream: string, dev: string, page: string, out: string) {
  let built: readonly BuiltPage[] = []
  let log = ''
  const status = await runBuild({ sharedDocs: join(master, group), repo: upstream, dev, page, out }, text => { log += text }, {
    repositoryRoot: master, onBuilt(outputs) { built = outputs },
    fetchContext: { page, targets: targetsFor(page), records: [] },
    fetcher: { async fetch(url) { throw new Error(`Unexpected network image: ${url}`) } },
  })
  expect(status, log).toBe(0)
  return new Map(built.map(output => [output.manual, output.mdx.replaceAll(imageObject, `${imageBase}/${imageObject}`)]))
}

async function fixture(options: { secondEligible?: boolean; missingTarget?: boolean; badDigest?: boolean; mismatchedOutput?: string;
  omittedTarget?: boolean; channelRules?: boolean; openUpdatePages?: readonly string[];
  devInventory?: 'missing' | 'mismatched'; dependencyHref?: string; snapshotMismatch?: 'targets' | 'navigation';
  malformedYaml?: 'lock.yaml' | 'page.yaml'; nextAliasForSelected?: boolean } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'wp13-replay-')))
  scratch.push(root)
  const repos = Object.fromEntries(['master', 'dev', 'upstream'].map(name => {
    const path = join(root, name)
    init(path)
    return [name, path]
  }))
  const { master, dev, upstream } = repos
  const pages = ['first', 'second', 'third']
  put(upstream, 'site/en/diagram.png', imageBytes)
  for (const manual of ['guides', 'byoc']) {
    put(dev, `content/en/${manual}/tutorials/other.md`, '---\nslug: /other\ntitle: Other\ntoken: feishu-old-other\n---\n\nHistorical page.\n')
  }
  put(dev, `${manifests}/active.json`, json({ schema_version: 1, pages: [] }))
  put(dev, guidesSnapshotPath, json({ schema_version: 1, records: [], navigation_records: [], table_digests: {} }))
  const devBaseline = commit(dev, 'Pinned Guides destination context')
  const devFiles = git(dev, 'ls-files', 'content/en/guides', 'content/en/byoc', guidesSnapshotPath, manifests)
    .trim().split('\n').map(path => ({ path, sha256: sha256(readFileSync(join(dev, path))) }))
  function writeUpstreamVersion(version: string) {
    for (const page of pages) {
      const href = page === 'first' ? options.dependencyHref
        : page === 'second' && options.dependencyHref ? 'https://external.example/docs/byoc/other' : undefined
      put(upstream, `site/en/${page}.md`, md(page, version, href))
    }
  }
  writeUpstreamVersion('A')
  const a = commit(upstream, 'Initial upstream pages')
  writeUpstreamVersion('B')
  const b = commit(upstream, 'UAT upstream pages')
  writeUpstreamVersion('C')
  const c = commit(upstream, 'Later upstream pages')
  git(upstream, 'branch', 'v3.0.x')
  for (const file of ['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml']) {
    put(master, `${group}/${file}`, readFileSync(join(toolingRoot, group, file)))
  }
  for (const page of [...pages, 'inactive']) {
    put(master, `${group}/pages/${page}/page.yaml`, pageYaml(page))
    put(master, `${group}/pages/${page}/lock.yaml`, lock(page === 'second' && !options.secondEligible ? b : a, b))
  }
  if (options.channelRules) {
    put(master, `${group}/pages/first/page.yaml`, pageYaml('first') + [
      '', 'transforms:', '  # Review note outside both rules.', '  - operation: replace', '    channel: current',
      '    target: {block: sample-prose}', '    content: {file: old.md}', '  - operation: replace',
      '    target: {block: sample-prose}', '    content: {file: new.md}', '    channel: next', '',
    ].join('\n'))
    put(master, `${group}/pages/first/old.md`, 'Previous Cloud settings.\n')
    put(master, `${group}/pages/first/new.md`, 'Accepted Cloud settings.\n')
  }
  if (options.malformedYaml) {
    const file = `${group}/pages/first/${options.malformedYaml}`
    put(master, file, Buffer.concat([Buffer.from('# invalid Git bytes: '), Buffer.from([0xff]), Buffer.from('\n'), readFileSync(join(master, file))]))
  }
  const acceptedMaster = commit(master, 'Pinned Guides overlay')
  const overlay = git(master, 'ls-files', group).trim().split('\n').map(path => ({ path, sha256: sha256(readFileSync(join(master, path))) }))
  const historicalBuilds = new Map<string, Awaited<ReturnType<typeof buildFixture>>>()
  for (const page of pages) historicalBuilds.set(page, await buildFixture(master, upstream, dev, page, join(root, `built-${page}`)))
  const active = [], records = [], navigationRecords = []
  for (const page of pages) {
    const path = `${manifests}/${page}.json`
    const recordId = `record-${page}`
    const docLink = `https://github.com/zilliztech/zdoc/tree/master/${group}/pages/${page}`
    const targets = options.omittedTarget && page === 'first' ? targetsFor(page).slice(0, 1) : targetsFor(page)
    const snapshotTargets = targets.length === 1 || options.snapshotMismatch === 'targets' && page === 'first'
      ? ['Zilliz.SaaS'] : ['Zilliz.PaaS', 'Zilliz.SaaS']
    const navigation = { record_id: recordId, table_id: 'fixture-table', table_name: 'Guides replay', placement_type: 'canonical',
      parent_record_ids: [], order: 1, title: page, labels: null, slug: page, targets: snapshotTargets.map(value => value.toLowerCase()),
      progress: 'published', doc_token: null, doc_link: docLink, ref_target: null, ref_target_token: null, ref_target_anchor: null,
      source_kind: 'shared-page', shared_page: { group: 'guides', page } }
    const built = historicalBuilds.get(page)!
    const outputs = targets.map(target => {
      const file = `content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}/${target.path}.mdx`
      const generated = built.get(target.manual)!
      const content = page === options.mismatchedOutput ? generated.replace('Version B.', 'Unapproved deployment content.') : generated
      if (!(options.missingTarget && page === 'first' && target.manual === 'guides-byoc')) put(dev, file, content)
      return { manual: target.manual, path: file, sha256: options.badDigest && page === 'first' ? 'f'.repeat(64) : sha256(content) }
    })
    const current = page === 'second' && !options.secondEligible ? b : a
    const sourcePath = `site/en/${page}.md`
    const upstreamFiles = [{ path: sourcePath,
      current: sha256(git(upstream, 'show', `${current}:${sourcePath}`)), next: sha256(git(upstream, 'show', `${b}:${sourcePath}`)) }]
    const historicalFiles = page !== 'first' ? devFiles : options.devInventory === 'missing' ? devFiles.slice(1)
      : options.devInventory === 'mismatched' ? [{ ...devFiles[0], sha256: 'f'.repeat(64) }, ...devFiles.slice(1)] : devFiles
    const receipt: SharedReceipt = { schema_version: 1, page, token: `shared-${page}`, inputs: {
      milvus_docs: { repository: 'milvus-io/milvus-docs', current, next: b, files: upstreamFiles },
      zdoc: { repository: 'zilliztech/zdoc', commit: acceptedMaster, files: overlay },
      dev: { commit: devBaseline, files: historicalFiles },
      fetch: { navigation: { navigationRecords: [navigation], tableDigests: {} }, image_base_url: imageBase,
        render_targets: { schema_version: 1, targets: [...targets] }, active: null },
      tools: { zdoc: acceptedMaster, md2md: '1.3.0' }, images,
    }, outputs, channel: null, notes: [] }
    const identity = renderIdentity(receiptProjection(receipt.inputs, page))
    expect(identity.record).toBe(path)
    active.push({ page, record: recordId, feishu_token: `wiki-${page}`, feishu_aliases: [`wiki-${page}`], anchors: {}, activated_in: '1' })
    records.push({ record_id: recordId, table_id: navigation.table_id, table_name: navigation.table_name, placement_type: 'canonical',
      title: page, labels: null, slug: page, doc_link: docLink, source_kind: 'shared-page', shared_page: identity, parent_record_ids: [],
      order: 1, publish_status: 'published', publish_targets: snapshotTargets, release_channel: 'current',
      doc_token: null, source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: [], output_paths: outputs.map(output => output.path) })
    navigationRecords.push({ ...navigation, shared_page: identity,
      title: options.snapshotMismatch === 'navigation' && page === 'first' ? 'Unapproved navigation title' : navigation.title })
    put(dev, path, json(receipt))
  }
  put(dev, `${manifests}/active.json`, json({ schema_version: 1, pages: active }))
  put(dev, guidesSnapshotPath, json({ schema_version: 1, records, navigation_records: navigationRecords,
    table_digests: { 'fixture-table': sha256(JSON.stringify(navigationRecords)) } }))
  const byocDependency = options.dependencyHref ? 'channel: next\n' : ''
  put(dev, 'content/en/byoc/tutorials/other.md', `---\nslug: /other\ntitle: Other\ntoken: feishu-old-other\n${byocDependency}---\n\nPublished page after the historical dev pin.\n`)
  if (options.nextAliasForSelected) {
    put(dev, 'content/en/reference/sdk-forward.mdx', '---\nslug: /sdk-forward\ntoken: shared-first\nchannel: next\n---\n\nNEXT Reference copy.\n')
  }
  const deployed = commit(dev, 'Committed UAT outputs')
  put(master, `${group}/pages/third/lock.yaml`, lock(a, c))
  const currentMaster = commit(master, 'Advance third after acceptance')
  const recordPath = join(root, 'uat.json')
  writeFileSync(recordPath, json({ schema_version: 1, observation: 'replay', openUpdatePages: options.openUpdatePages ?? [], release: {
    site: 'en', environment: 'uat', status: 'succeeded', mode: 'rebuild', sourceRepository: 'zdoc', sourceSha: deployed,
    finalDeployedDigest: `sha256:${'1'.repeat(64)}`, jenkinsBuildIdentity: 'vdc-jenkins/english-uat/1',
  } }))
  return { root, master, dev, upstream, recordPath, currentMaster, deployed, devBaseline, a, b, c }
}

type Fixture = Awaited<ReturnType<typeof fixture>>

function deploymentFixture(f: Fixture, root = join(f.root, 'trusted')) {
  const { release } = JSON.parse(readFileSync(f.recordPath, 'utf8'))
  const uat = 'evidence/uat-records.json'
  put(root, uat, json([release]))
  put(root, 'evidence/resolved-images.json', json({}))
  put(root, 'evidence/prod-records.json', json([]))
  for (const file of readdirSync(join(root, 'evidence'))) chmodSync(join(root, 'evidence', file), 0o444)
  chmodSync(join(root, 'evidence'), 0o555)
  chmodSync(root, 0o555)
  readOnlyEvidence.push(root)
  return { release, root, env: { ...process.env, VDC_JENKINS_EVIDENCE_ROOT: root,
    VDC_JENKINS_EVIDENCE_PROTECTION: 'kernel-read-only-mount' } }
}

function deploymentPreview(f: Fixture, evidence: ReturnType<typeof deploymentFixture>, out: string, page = 'first') {
  return spawnSync(process.execPath, [launcher, 'shared-docs', 'promote-guides',
    '--mode', 'preview', '--repo', f.upstream, '--dev', f.dev,
    '--uat-build', evidence.release.jenkinsBuildIdentity, '--page', page, '--out', out],
  { cwd: f.master, encoding: 'utf8', env: evidence.env })
}

function cli(f: Fixture, args: string[], nodeArgs: string[] = []) {
  return spawnSync(process.execPath, [...nodeArgs, launcher, 'shared-docs', 'promote-guides',
    '--repo', f.upstream, '--dev', f.dev, '--uat-record', f.recordPath, ...args], { cwd: f.master, encoding: 'utf8' })
}
function preview(f: Fixture) {
  const out = join(f.root, 'preview')
  const result = cli(f, ['--mode', 'preview', '--out', out])
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
}

it('previews only activated pages from the pinned English UAT deployment', async () => {
  const f = await fixture()
  put(f.dev, 'content/en/byoc/tutorials/first.mdx', 'Uncommitted bytes must be ignored.\n')
  const report = preview(f)
  expect(report).toMatchObject({ observation: 'replay', status: 'preview',
    baseline: { master: f.currentMaster, dev: f.deployed }, uat: { record: { sourceSha: f.deployed } } })
  expect(report.pages.map((page: { page: string; status: string }) => [page.page, page.status])).toEqual([
    ['first', 'eligible'], ['second', 'unnecessary'], ['third', 'blocked'],
  ])
  expect(report.pages[0]).toMatchObject({ lock: { current: f.a, next: f.b }, acceptedNext: f.b,
    targets: [{ manual: 'guides' }, { manual: 'guides-byoc' }] })
  expect(report.pages[2].reason).toMatch(/locked next changed/i)
})

it.each([
  [{ missingTarget: true }, /missing Git blob/i],
  [{ badDigest: true }, /output digest mismatch/i],
  [{ omittedTarget: true }, /cover every configured/i],
  [{ openUpdatePages: ['first'] }, /open upstream update/i],
] as const)('holds an active page when its replay evidence is incomplete or conflicted (%j)', async (options, reason) => {
  const f = await fixture(options)
  expect(preview(f).pages[0]).toMatchObject({ page: 'first', status: 'blocked', reason: expect.stringMatching(reason) })
})

function prepare(f: Fixture, selection: string, name = 'prepare', nodeArgs: string[] = []) {
  const out = join(f.root, name)
  const command = cli(f, ['--mode', 'prepare', '--preview', join(f.root, 'preview/promotion-preview.json'),
    '--pages', selection, '--out', out], nodeArgs)
  const report = JSON.parse(readFileSync(join(out, 'promotion-result.json'), 'utf8'))
  const patch = join(out, 'promotion.patch')
  return { out, command, report, patch }
}

const jenkinsOrigin = 'https://jenkins.example.invalid'
const jenkinsJob = 'documentation/release-fixture'
const jenkinsNumber = '150'
const jenkinsBuildUrl = `${jenkinsOrigin}/job/documentation/job/release-fixture/${jenkinsNumber}/`
const jenkinsDigest = `sha256:${'1'.repeat(64)}`
const jenkinsCredentials = { user: 'test-reader', token: 'fake-read-token' }

function jenkinsResponses(deployed: string) {
  return {
    metadata: {
      number: Number(jenkinsNumber), building: false, result: 'SUCCESS', url: jenkinsBuildUrl,
      artifacts: [{ fileName: 'output.json', relativePath: 'output.json' }],
    },
    stages: { id: jenkinsNumber, name: `#${jenkinsNumber}`, status: 'SUCCESS', stages: [
      { id: '131', name: 'uat-en', status: 'SUCCESS', _links: { self: { href: new URL('execution/node/131/wfapi/describe', jenkinsBuildUrl).pathname } } },
      { id: '132', name: 'uat-cn', status: 'SUCCESS' },
      { id: '133', name: 'prod-en', status: 'SUCCESS' },
    ] },
    archive: {
      status: 'SUCCESS', job_name: jenkinsJob, build_number: jenkinsNumber, build_url: jenkinsBuildUrl,
      jenkins_build_id: `jenkins-documentation-release-fixture-${jenkinsNumber}`, zdoc_sha: deployed,
      build_from_branch: 'true', release_source: `branch:dev@${deployed.slice(0, 9)}`, image_tag: 'fixture-150',
      targets: { environments: ['uat'], sites: ['oversea', 'cn'] }, images: { oversea: {
        selected: true, source_image: 'registry.example.invalid/site-en:fixture-150', source_digest: jenkinsDigest, revision: deployed,
        deployments: {
          uat: { selected: true, deployment_image: 'registry.example.invalid/uat-en:fixture-150', deployment_digest: jenkinsDigest },
          prod: { selected: false, deployment_image: null, deployment_digest: null as string | null },
        },
      } },
    },
  }
}

type JenkinsResponses = ReturnType<typeof jenkinsResponses>
type JenkinsReply = {
  body?: string; status?: number; headers?: Record<string, string>; size?: number; stall?: boolean; close?: boolean; upgrade?: boolean;
  moveRef?: { repo: string; commit: string };
}

function jenkinsReplies(data: JenkinsResponses): JenkinsReply[] {
  return [data.metadata, data.stages, data.archive].map(body => ({ body: json(body) }))
}

function jenkinsCli(f: Fixture, name: string, replies: JenkinsReply[], options: {
  number?: string; args?: string[]; env?: NodeJS.ProcessEnv; traceGit?: boolean; mode?: 'preview' | 'prepare'; nodeTlsDebug?: string;
} = {}) {
  const preload = join(f.root, options.nodeTlsDebug ? 'block-jenkins-tls.cjs' : 'fake-jenkins-https.cjs')
  const out = join(f.root, name)
  const log = join(f.root, `${name}-requests.log`)
  const gitLog = join(f.root, `${name}-git.log`)
  if (options.nodeTlsDebug) writeFileSync(preload, `
require('node:tls').connect = () => {
  process.stderr.write('Offline Jenkins TLS connection intercepted\\n')
  throw new Error('Offline Jenkins TLS connection intercepted')
}
`)
  else writeFileSync(preload, `
const { EventEmitter } = require('node:events')
const { Readable } = require('node:stream')
const { appendFileSync } = require('node:fs')
const { execFileSync } = require('node:child_process')
const https = require('node:https')
const replies = JSON.parse(process.env.WP13_TEST_REPLIES)
let capturedDeadline
const realTimeout = AbortSignal.timeout
AbortSignal.timeout = time => {
  capturedDeadline = time
  return realTimeout(replies[0]?.stall ? 40 : time)
}
https.request = (url, options, respond) => {
  const reply = replies.shift()
  const request = new EventEmitter()
  request.destroy = () => {}
  const requestHeaders = {}
  request.setHeader = (name, value) => { requestHeaders[name] = value }
  request.end = (...body) => {
    const { method, headers, agent, rejectUnauthorized, signal, maxHeaderSize } = options
    appendFileSync(process.env.WP13_TEST_REQUEST_LOG, JSON.stringify({ url: url.href, method, headers, agent,
      rejectUnauthorized, maxHeaderSize, bounded: signal instanceof AbortSignal, deadline: capturedDeadline, body, requestHeaders }) + '\\n')
    if (!reply) return setImmediate(() => request.emit('error', new Error('Unexpected HTTPS request')))
    if (reply.stall) {
      const keepalive = setTimeout(() => request.emit('error', new Error('Missing abort signal')), 2000)
      signal.addEventListener('abort', () => {
        clearTimeout(keepalive)
        request.emit('error', new Error('Test abort'))
      }, { once: true })
      return
    }
    setImmediate(() => {
      if (reply.close) return request.emit('close')
      if (reply.upgrade) {
        const socket = { destroy() { request.emit('close') } }
        return request.emit('upgrade', { statusCode: 101 }, socket, Buffer.alloc(0))
      }
      if (reply.moveRef) execFileSync('git', ['-C', reply.moveRef.repo, 'update-ref', 'HEAD', reply.moveRef.commit])
      const response = Readable.from(reply.size ? [Buffer.alloc(reply.size)] : [Buffer.from(reply.body || '')])
      response.statusCode = reply.status ?? 200
      response.headers = reply.headers ?? {}
      response.complete = true
      response.once('end', () => setImmediate(() => request.emit('close')))
      respond(response)
    })
  }
  return request
}
require('node:module').syncBuiltinESMExports()
`)
  const env: NodeJS.ProcessEnv = { ...process.env, VDC_JENKINS_PREVIEW_ORIGIN: jenkinsOrigin, VDC_JENKINS_PREVIEW_JOB: jenkinsJob,
    VDC_JENKINS_PREVIEW_USER: jenkinsCredentials.user, VDC_JENKINS_PREVIEW_API_TOKEN: jenkinsCredentials.token,
    WP13_TEST_REPLIES: JSON.stringify(replies), WP13_TEST_REQUEST_LOG: log, ...options.env,
    ...(options.nodeTlsDebug ? { NODE_DEBUG: options.nodeTlsDebug } : {}) }
  if (options.traceGit) {
    const gitBin = execFileSync('/bin/sh', ['-c', 'command -v git'], { encoding: 'utf8' }).trim()
    const bin = join(f.root, 'bin')
    put(bin, 'git', '#!/bin/sh\nif [ "${VDC_JENKINS_PREVIEW_API_TOKEN+present}" ]; then echo present; else echo absent; fi >> "$WP13_TEST_GIT_LOG"\nexec "$WP13_TEST_GIT_BIN" "$@"\n')
    chmodSync(join(bin, 'git'), 0o755)
    Object.assign(env, { PATH: `${bin}:${process.env.PATH}`, WP13_TEST_GIT_BIN: gitBin, WP13_TEST_GIT_LOG: gitLog })
  }
  const command = spawnSync(process.execPath, ['--require', preload, launcher, 'shared-docs', 'promote-guides',
    '--mode', options.mode ?? 'preview', '--repo', f.upstream, '--dev', f.dev, '--jenkins-build', options.number ?? jenkinsNumber,
    '--page', 'first', '--out', out, ...options.args ?? []], { cwd: f.master, encoding: 'utf8', env, timeout: 15_000 })
  const reportPath = join(out, 'promotion-preview.json')
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : undefined
  const requests = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : []
  return { command, report, reportPath, requests, out, gitLog }
}

function assertJenkinsPaused(run: ReturnType<typeof jenkinsCli>, reason: RegExp, calls: number) {
  expect(run.command.status, run.command.stderr || run.command.stdout).toBe(1)
  expect(run.report).toMatchObject({ observation: 'jenkins-direct', status: 'paused', deployment: { reason: expect.stringMatching(reason) } })
  expect(run.requests).toHaveLength(calls)
  expect(run.command.stdout + run.command.stderr + JSON.stringify(run.report)).not.toContain(jenkinsCredentials.token)
}

it('previews the two Guides views by rereading one numbered Jenkins build with a read-only credential', async () => {
  const f = await fixture()
  const evidence = jenkinsResponses(f.deployed)
  const replies = jenkinsReplies(evidence)
  git(f.dev, 'commit', '--allow-empty', '-qm', 'Advance dev without republishing the page')
  const devHead = git(f.dev, 'rev-parse', 'HEAD').trim()
  const run = jenkinsCli(f, 'jenkins-preview', [...replies, ...replies], { traceGit: true })
  expect(run.command.status, run.command.stderr || run.command.stdout).toBe(0)
  expect(run.report).toMatchObject({
    observation: 'jenkins-direct', status: 'preview', page: 'first', build: jenkinsNumber,
    baseline: { master: f.currentMaster, dev: devHead, upstream: f.c },
    deployment: { status: 'build-validated', job: jenkinsJob, number: jenkinsNumber, buildId: evidence.archive.jenkins_build_id,
      stage: { id: '131', name: 'uat-en', status: 'SUCCESS' }, archivePath: 'output.json', archiveSha256: sha256(replies[2].body!),
      buildMetadataSha256: sha256(replies[0].body!), stagesSha256: sha256(replies[1].body!),
      sourceSha: f.deployed, finalDeployedDigest: jenkinsDigest },
    comparison: { status: 'matched', deployedNext: f.b, views: [{ manual: 'guides' }, { manual: 'guides-byoc' }] },
    imageLabels: { status: 'pending' }, operatorAcceptance: { status: 'pending' }, openUpdatePrs: { status: 'unobserved' },
  })
  expect(run.report.deployment).not.toHaveProperty('jenkinsBuildIdentity')
  expect(JSON.stringify(run.report) + run.command.stdout + run.command.stderr).not.toContain('registry.example.invalid')
  expect(run.command.stdout).toContain('Guides Jenkins UAT evidence preview written')
  for (const view of run.report.comparison.views) expect(view.uatViewSha256).toBe(view.candidateProdViewSha256)
  expect(readdirSync(run.out)).toEqual(['promotion-preview.json'])
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  expect(git(f.dev, 'status', '--porcelain')).toBe('')
  expect(new Set(readFileSync(run.gitLog, 'utf8').trim().split('\n'))).toEqual(new Set(['absent']))
  const metadata = new URL('api/json', jenkinsBuildUrl)
  metadata.searchParams.set('tree', 'number,building,result,url,artifacts[fileName,relativePath]')
  const urls = [metadata.href, jenkinsBuildUrl + 'wfapi/describe', jenkinsBuildUrl + 'artifact/output.json']
  expect(run.requests.map(request => request.url)).toEqual([...urls, ...urls])
  for (const request of run.requests) expect(request).toMatchObject({ method: 'GET', body: [], agent: false,
    rejectUnauthorized: true, bounded: true, deadline: 10_000, maxHeaderSize: 16 * 1024,
    headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' },
    requestHeaders: { Authorization: 'Basic ' + Buffer.from(`${jenkinsCredentials.user}:${jenkinsCredentials.token}`).toString('base64') },
  })
  for (const request of run.requests) expect(request.headers).not.toHaveProperty('Authorization')
  const out = join(f.root, 'jenkins-prepare')
  // A nonexistent replay record proves prepare rejects the Jenkins report before loading replay evidence.
  rmSync(f.recordPath)
  const prepare = cli(f, ['--mode', 'prepare', '--preview', run.reportPath, '--pages', 'first', '--out', out])
  expect(prepare.status, prepare.stderr || prepare.stdout).toBe(1)
  expect(prepare.stdout).toContain('Prepare requires a replay preview')
  expect(readdirSync(out)).toEqual(['promotion-result.json'])
})

it('pauses an otherwise verified historical Jenkins deployment when its dev publication receipt changed', async () => {
  const f = await fixture()
  const replies = jenkinsReplies(jenkinsResponses(f.deployed))
  const relative = `${manifests}/first.json`
  const receipt: SharedReceipt = JSON.parse(readFileSync(join(f.dev, relative), 'utf8'))
  put(f.dev, relative, json({ ...receipt, notes: ['Receipt republished after the deployment'] }))
  const currentDev = commit(f.dev, 'Republish first Guides receipt after UAT')
  const run = jenkinsCli(f, 'jenkins-stale', [...replies, ...replies])
  expect(run.command.status, run.command.stderr || run.command.stdout).toBe(1)
  expect(run.report).toMatchObject({ observation: 'jenkins-direct', status: 'paused', baseline: { dev: currentDev },
    deployment: { status: 'build-validated', sourceSha: f.deployed },
    comparison: { status: 'blocked', reason: 'Published page evidence changed after UAT' } })
  expect(run.requests).toHaveLength(6)
})

it('rejects failed, ambiguous or cross-target Jenkins evidence before comparison', async () => {
  const f = await fixture()
  const cases: [string, (data: JenkinsResponses) => void, RegExp, number][] = [
    ['building', v => { v.metadata.building = true }, /completed successfully/, 1],
    ['failed-build', v => { v.metadata.result = 'FAILURE' }, /completed successfully/, 1],
    ['cross-build-metadata', v => { v.metadata.number++ }, /metadata identity/, 1],
    ['cross-origin-metadata', v => { v.metadata.url = 'https://untrusted.example.invalid' }, /metadata identity/, 1],
    ['alternate-artifact', v => { v.metadata.artifacts[0].relativePath = 'elsewhere/output.json' }, /fixed archive path/, 1],
    ['duplicate-archive', v => { v.metadata.artifacts.push({ fileName: 'output.json', relativePath: 'elsewhere/output.json' }) }, /one output.json/, 1],
    ['cross-build-stages', v => { v.stages.id = '149' }, /same successful build/, 2],
    ['failed-uat', v => { v.stages.stages[0].status = 'FAILED' }, /successful uat-en/, 2],
    ['ambiguous-stage', v => { v.stages.stages.push({ id: '517', name: 'uat-en', status: 'SUCCESS' }) }, /one successful uat-en/, 2],
    ['ambiguous-id', v => { v.stages.stages[1].id = v.stages.stages[0].id }, /unique stage ID/, 2],
    ['cross-job-archive', v => { v.archive.job_name = 'ambiguous/release-fixture' }, /output.json identity/, 3],
    ['numeric-archive-build', v => { Object.assign(v.archive, { build_number: 150 }) }, /output.json identity/, 3],
    ['cross-build-id', v => { v.archive.jenkins_build_id = `vdc-jenkins/english-uat/${jenkinsNumber}` }, /Jenkins build ID/, 3],
    ['cross-build-url', v => { v.archive.build_url = jenkinsBuildUrl.replace('/150/', '/149/') }, /output.json identity/, 3],
    ['prod-only', v => { v.archive.targets.environments = ['prod']; v.archive.images.oversea.deployments.prod.selected = true;
      v.archive.images.oversea.deployments.prod.deployment_digest = jenkinsDigest }, /select English UAT/, 3],
    ['cn-only', v => { v.archive.targets.sites = ['cn'] }, /select English UAT/, 3],
    ['image-not-selected', v => { v.archive.images.oversea.selected = false }, /must select the English image/, 3],
    ['uat-not-selected', v => { v.archive.images.oversea.deployments.uat.selected = false }, /its UAT deployment/, 3],
    ['not-a-dev-rebuild', v => { v.archive.release_source = `branch:master@${f.deployed.slice(0, 9)}` }, /successful dev rebuild/, 3],
    ['short-sha', v => { v.archive.zdoc_sha = f.deployed.slice(0, 9) }, /full zdoc SHA/, 3],
    ['wrong-revision', v => { v.archive.images.oversea.revision = f.devBaseline }, /image revision/, 3],
    ['tag-only', v => { v.archive.images.oversea.source_digest = 'fixture-150' }, /same immutable digest/, 3],
    ['wrong-deploy-digest', v => { v.archive.images.oversea.deployments.uat.deployment_digest = `sha256:${'2'.repeat(64)}` }, /same immutable digest/, 3],
  ]
  for (const [name, change, reason, count] of cases) {
    const data = jenkinsResponses(f.deployed)
    change(data)
    const run = jenkinsCli(f, name, jenkinsReplies(data))
    assertJenkinsPaused(run, reason, count)
    expect(run.report.comparison.status).toBe('not-run')
  }
})

it('pauses when Jenkins facts drift and rechecks Git after the final archive read', async () => {
  const f = await fixture()
  const evidence = jenkinsResponses(f.deployed)
  const replies = jenkinsReplies(evidence)
  const newMetadata = { ...evidence.metadata, artifacts: [...evidence.metadata.artifacts, { fileName: 'other.txt', relativePath: 'other.txt' }] }
  const newStages = { ...evidence.stages, stages: [{ ...evidence.stages.stages[0], id: '211' }, ...evidence.stages.stages.slice(1)] }
  for (const [name, second, reason] of [
    ['metadata-drift', [{ body: json(newMetadata) }, replies[1], replies[2]], /build metadata changed/],
    ['stage-drift', [replies[0], { body: json(newStages) }, replies[2]], /stage evidence changed/],
    ['archive-drift', [replies[0], replies[1], { body: replies[2].body + '\n' }], /output.json changed/],
  ] as const) {
    const run = jenkinsCli(f, name, [...replies, ...second])
    assertJenkinsPaused(run, reason, 6)
    expect(run.report).toMatchObject({ deployment: { status: 'changed' }, comparison: { status: 'blocked' } })
  }
  const refDrift = jenkinsCli(f, 'git-drift', [...replies, replies[0], replies[1],
    { ...replies[2], moveRef: { repo: f.dev, commit: f.devBaseline } }])
  expect(refDrift.command.status, refDrift.command.stderr || refDrift.command.stdout).toBe(1)
  expect(refDrift.report).toMatchObject({ status: 'paused', baseline: { dev: f.deployed },
    deployment: { status: 'build-validated' }, comparison: { status: 'blocked', reason: 'Pinned repositories changed during UAT preview' } })
  expect(refDrift.requests).toHaveLength(6)
})

it('blocks Jenkins transport errors without retrying or falling through to an archive URL', async () => {
  const f = await fixture()
  const evidence = jenkinsResponses(f.deployed)
  const replies = jenkinsReplies(evidence)
  for (const [name, response, reason] of [
    ['unauthorized', { status: 401 }, /HTTP 401/],
    ['forbidden', { status: 403 }, /HTTP 403/],
    ['missing', { status: 404 }, /HTTP 404/],
    ['redirected', { status: 302, headers: { location: 'https://untrusted.example.invalid/download' } }, /redirect was rejected/],
    ['declared-oversize', { headers: { 'content-length': '524289' } }, /byte limit/],
    ['stream-oversize', { size: 524_289 }, /byte limit/],
    ['compressed', { headers: { 'content-encoding': 'gzip' } }, /encoding is unsupported/],
    ['premature-close', { close: true }, /closed before a complete response/],
    ['unexpected-upgrade', { upgrade: true }, /HTTP upgrade was rejected/],
    ['deadline', { stall: true }, /timed out/],
  ] as const) assertJenkinsPaused(jenkinsCli(f, name, [response, ...replies]), reason, 1)
  const duplicate = { body: replies[2].body!.replace('"status": "SUCCESS"', '"status": "SUCCESS", "status": "SUCCESS"') }
  assertJenkinsPaused(jenkinsCli(f, 'duplicate-json-key', [replies[0], replies[1], duplicate]), /strict JSON/, 3)
})

it('keeps Jenkins credentials out of native Node HTTPS diagnostics', async () => {
  const f = await fixture()
  const encoded = Buffer.from(`${jenkinsCredentials.user}:${jenkinsCredentials.token}`).toString('base64')
  for (const [name, nodeTlsDebug] of [['names', 'http,https'], ['wildcard', 'htt*']]) {
    const run = jenkinsCli(f, `node-debug-${name}`, [], { nodeTlsDebug })
    assertJenkinsPaused(run, /build metadata read failed/, 0)
    expect(run.command.stderr).toMatch(/HTTPS \d+: createConnection/)
    expect(run.command.stderr).toContain('Offline Jenkins TLS connection intercepted')
    expect(run.command.stderr).not.toContain(encoded)
  }
})

it('requires runner configuration and rejects caller-controlled Jenkins selectors', async () => {
  const f = await fixture()
  put(f.master, '.env', ['VDC_JENKINS_PREVIEW_ORIGIN=https://untrusted.example.invalid',
    'VDC_JENKINS_PREVIEW_JOB=untrusted/job', 'VDC_JENKINS_PREVIEW_USER=untrusted',
    'VDC_JENKINS_PREVIEW_API_TOKEN=untrusted-token'].join('\n'))
  const noRunnerOrigin = jenkinsCli(f, 'dotenv-origin', [], { env: { VDC_JENKINS_PREVIEW_ORIGIN: undefined }, traceGit: true })
  assertJenkinsPaused(noRunnerOrigin, /must be an HTTPS origin/, 0)
  expect(new Set(readFileSync(noRunnerOrigin.gitLog, 'utf8').trim().split('\n'))).toEqual(new Set(['absent']))
  for (const [name, env, reason] of [
    ['http', { VDC_JENKINS_PREVIEW_ORIGIN: 'http://jenkins.example.invalid' }, /must be an HTTPS origin/],
    ['origin-path', { VDC_JENKINS_PREVIEW_ORIGIN: jenkinsOrigin + '/job/some-job' }, /must be an HTTPS origin/],
    ['origin-userinfo', { VDC_JENKINS_PREVIEW_ORIGIN: 'https://user@jenkins.example.invalid' }, /must be an HTTPS origin/],
    ['job-traversal', { VDC_JENKINS_PREVIEW_JOB: 'documentation/../other' }, /job full name/],
    ['missing-token', { VDC_JENKINS_PREVIEW_API_TOKEN: undefined }, /read-only user and API token/],
  ] as const) assertJenkinsPaused(jenkinsCli(f, name, [], { env }), reason, 0)

  const prepareMode = jenkinsCli(f, 'direct-prepare-mode', [], { mode: 'prepare' })
  expect(prepareMode.command.status).toBe(2)
  expect(prepareMode.command.stdout).toMatch(/--jenkins-build is preview only/)
  expect(prepareMode.requests).toHaveLength(0)
  expect(existsSync(prepareMode.out)).toBe(false)

  for (const [name, number, args, reason] of [
    ['caller-url', 'https://untrusted.example.invalid/build/150', [], /exact positive build number/],
    ['caller-build-path', '../150', [], /exact positive build number/],
    ['zero-build', '0', [], /exact positive build number/],
    ['leading-zero-build', '0150', [], /exact positive build number/],
    ['caller-origin', jenkinsNumber, ['--jenkins-origin', jenkinsOrigin], /unknown or repeated option/i],
    ['caller-job', jenkinsNumber, ['--jenkins-job', jenkinsJob], /unknown or repeated option/i],
    ['mixed-mount', jenkinsNumber, ['--uat-build', 'vdc-jenkins/english-uat/150'], /mutually exclusive/],
    ['mixed-replay', jenkinsNumber, ['--uat-record', f.recordPath], /mutually exclusive/],
    ['prepare-flags', jenkinsNumber, ['--pages', 'first'], /preview only/],
  ] as [string, string, string[], RegExp][]) {
    const run = jenkinsCli(f, name, [], { number, args })
    expect(run.command.status, run.command.stderr || run.command.stdout).toBe(2)
    expect(run.command.stdout).toMatch(reason)
    expect(run.requests).toHaveLength(0)
    expect(existsSync(run.out)).toBe(false)
  }
})

it('compares both target views through the mounted-deployment preview CLI', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f)
  const out = join(f.root, 'preview')
  const command = deploymentPreview(f, evidence, out)
  expect(command.status, command.stderr || command.stdout).toBe(0)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({
    observation: 'uat-evidence', status: 'preview', page: 'first',
    deployment: { status: 'record-validated', record: evidence.release, recordSha256: expect.stringMatching(/^[0-9a-f]{64}$/) },
    comparison: { status: 'matched', deployedNext: f.b, views: [{ manual: 'guides' }, { manual: 'guides-byoc' }] },
    imageLabels: { status: 'pending' }, operatorAcceptance: { status: 'pending' }, openUpdatePrs: { status: 'unobserved' },
  })
  for (const view of report.comparison.views) expect(view.uatViewSha256).toBe(view.candidateProdViewSha256)
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
  const nested = join(evidence.root, '..output')
  const invalid = deploymentPreview(f, evidence, nested)
  expect(invalid.status).toBe(2)
  expect(invalid.stdout).toContain('overlaps input data')
  expect(existsSync(nested)).toBe(false)
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  expect(git(f.dev, 'status', '--porcelain')).toBe('')
  const replay = prepare(f, 'first')
  expect(replay.command.status).toBe(1)
  expect(existsSync(replay.patch)).toBe(false)
})

it('holds a deployment preview for a page whose next pin advanced after deployment', async () => {
  const f = await fixture()
  const out = join(f.root, 'stale')
  const command = deploymentPreview(f, deploymentFixture(f), out, 'third')
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ observation: 'uat-evidence', status: 'paused', page: 'third',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/locked next changed/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('holds a deployment preview when BYOC evidence is missing', async () => {
  const f = await fixture({ omittedTarget: true })
  const out = join(f.root, 'missing-target')
  const command = deploymentPreview(f, deploymentFixture(f), out)
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ observation: 'uat-evidence', status: 'paused',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/cover every configured/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('keeps repositories and output paths separate from the mounted deployment evidence', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f, join(f.master, 'trusted'))
  const out = join(f.root, 'overlapping-root')
  expect(deploymentPreview(f, evidence, out).status).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused', deployment: { status: 'unavailable', reason: expect.stringMatching(/must not overlap/i) } })
  expect(readdirSync(join(evidence.root, 'evidence')).sort()).toEqual(['prod-records.json', 'resolved-images.json', 'uat-records.json'])
})

it('protects the whole Git worktree when the request names a subdirectory', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f, join(f.dev, 'trusted'))
  const devSubdirectory = { ...f, dev: join(f.dev, 'content') }

  const insideWorktree = join(f.dev, 'preview')
  const outputOverlap = deploymentPreview(devSubdirectory, evidence, insideWorktree)
  expect(outputOverlap.status).toBe(2)
  expect(outputOverlap.stdout).toContain('overlaps input data')
  expect(existsSync(insideWorktree)).toBe(false)

  const outsideWorktree = join(f.root, 'preview')
  const evidenceOverlap = deploymentPreview(devSubdirectory, evidence, outsideWorktree)
  expect(evidenceOverlap.status).toBe(1)
  const report = JSON.parse(readFileSync(join(outsideWorktree, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused', deployment: { status: 'unavailable', reason: expect.stringMatching(/must not overlap/i) } })
})

it('holds a deployment preview before using a local Git history overlay', async () => {
  const f = await fixture()
  put(f.dev, '.git/info/grafts', '')
  const out = join(f.root, 'grafted')
  const command = deploymentPreview(f, deploymentFixture(f), out)
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/Git grafts/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('protects a worktree with a trailing space in its canonical path', async () => {
  const f = await fixture()
  const dev = f.dev + ' '
  renameSync(f.dev, dev)
  mkdirSync(f.dev)
  const evidence = deploymentFixture(f)
  const out = join(dev, 'preview')
  const command = deploymentPreview({ ...f, dev: join(dev, 'content') }, evidence, out)
  expect(command.status).toBe(2)
  expect(command.stdout).toContain('overlaps input data')
  expect(existsSync(out)).toBe(false)
})

it('checks grafts in spaced Git and common directories even when a lookalike exists', async () => {
  const f = await fixture()
  const gitDir = join(f.root, 'metadata ')
  git(f.dev, 'init', '--separate-git-dir', gitDir)
  mkdirSync(gitDir.trimEnd())
  const linked = join(f.root, 'linked')
  git(f.dev, 'worktree', 'add', '--detach', linked)
  put(gitDir, 'info/grafts', '')
  const evidence = deploymentFixture(f)
  for (const [name, dev] of [['separate', f.dev], ['linked', linked]]) {
    const out = join(f.root, `${name}-preview`)
    const command = deploymentPreview({ ...f, dev }, evidence, out)
    expect(command.status, command.stderr || command.stdout).toBe(1)
    const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
    expect(report).toMatchObject({ status: 'paused', comparison: { status: 'blocked', reason: expect.stringMatching(/Git grafts/i) } })
  }
})

it('prepares one selected page and the fixed eligible group as exact patches', async () => {
  const f = await fixture({ secondEligible: true })
  const reviewed = preview(f)
  expect(reviewed.pages.filter((page: { status: string }) => page.status === 'eligible').map((page: { page: string }) => page.page)).toEqual(['first', 'second'])
  const before = readFileSync(join(f.dev, 'content/en/guides/tutorials/first.mdx'), 'utf8')
  expect(before).toContain('<NextChannel action="exclude">')
  expect(before).toContain('<NextChannel action="include">')
  expect(before).toContain('Version A.')
  expect(before).toContain('Version B.')

  const single = prepare(f, 'first')
  expect(single.command.status, single.command.stderr || single.command.stdout).toBe(0)
  expect(single.report).toMatchObject({ observation: 'replay', status: 'prepared', selected: ['first'],
    pages: [{ page: 'first', lock: { from: { current: f.a, next: f.b }, to: { current: f.b, next: f.b } },
      views: [{ manual: 'guides' }, { manual: 'guides-byoc' }] }] })
  expect(single.report.patchSha256).toBe(sha256(readFileSync(single.patch)))
  for (const view of single.report.pages[0].views) expect(view.uatViewSha256).toBe(view.candidateProdViewSha256)

  const isolated = join(f.root, 'isolated')
  git(f.root, 'clone', '-q', f.master, isolated)
  git(isolated, 'apply', '--check', single.patch)
  git(isolated, 'apply', single.patch)
  expect(git(isolated, 'diff', '--name-only').trim()).toBe(`${group}/pages/first/lock.yaml`)
  expect(readFileSync(join(isolated, group, 'pages/first/lock.yaml'), 'utf8')).toBe(lock(f.b, f.b))
  const built = await buildFixture(isolated, f.upstream, f.dev, 'first', join(f.root, 'candidate-built'))
  for (const output of built.values()) {
    expect(output).toContain('Version B.')
    expect(output).toContain('version = "B"')
    expect(output).toContain('{#setup}')
    expect(output).toContain('[setup](#setup)')
    expect(output).toContain(`${imageBase}/${imageObject}`)
    expect(output).not.toMatch(/Version A\.|NextChannel/)
  }

  const all = prepare(f, 'all-eligible', 'all')
  expect(all.command.status, all.command.stderr || all.command.stdout).toBe(0)
  expect(all.report).toMatchObject({ status: 'prepared', selected: ['first', 'second'] })
  git(f.master, 'apply', '--check', all.patch)
  expect(readFileSync(all.patch, 'utf8').match(/^diff --git.*$/gm)).toEqual(['first', 'second'].map(page =>
    `diff --git a/${group}/pages/${page}/lock.yaml b/${group}/pages/${page}/lock.yaml`))
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  const preload = join(f.root, 'fail-report-link.cjs')
  writeFileSync(preload, [
    'const fs = require("node:fs/promises")',
    'const link = fs.link',
    'fs.link = async (from, to) => {',
    '  if (to.endsWith("/promotion-result.json")) throw new Error("Injected report publication failure")',
    '  return link(from, to)',
    '}',
    'require("node:module").syncBuiltinESMExports()',
  ].join('\n'))
  const failed = prepare(f, 'first', 'publication-failed', ['--require', preload])
  expect(failed.command.status).toBe(1)
  expect(failed.report).toMatchObject({ status: 'paused', reasons: [expect.stringMatching(/Injected report publication failure/)] })
  expect(existsSync(failed.patch)).toBe(false)
  if (process.env.ZDOC_KEEP_PROMOTION_REPLAY === '1') {
    scratch.splice(scratch.indexOf(f.root), 1)
    process.stdout.write(`WP13 replay sample: ${f.root}\n`)
  }
})

it('holds every pick when one deployed artifact cannot be independently reproduced', async () => {
  const f = await fixture({ secondEligible: true, mismatchedOutput: 'second' })
  preview(f)
  const outcome = prepare(f, 'all-eligible')
  expect(outcome.command.status).toBe(1)
  expect(outcome.report).toMatchObject({ observation: 'replay', status: 'paused', selected: ['first', 'second'], pages: [
    { page: 'first', views: expect.any(Array) }, { page: 'second', reason: expect.stringMatching(/differs from deployed UAT/) },
  ] })
  expect(existsSync(outcome.patch)).toBe(false)
})

it('holds stale or altered preview input and reports empty or rejected picks without a patch', async () => {
  const f = await fixture()
  const original = preview(f)
  const empty = prepare(f, '', 'empty')
  expect(empty.command.status).toBe(0)
  expect(empty.report).toMatchObject({ status: 'empty', selected: [], pages: [] })
  expect(existsSync(empty.patch)).toBe(false)

  const blocked = prepare(f, 'first,third', 'blocked')
  expect(blocked.command.status).toBe(1)
  expect(blocked.report.reasons).toEqual([expect.stringMatching(/^third: Locked next changed/)])
  expect(existsSync(blocked.patch)).toBe(false)

  const file = join(f.root, 'preview/promotion-preview.json')
  original.pages[1].status = 'eligible'
  writeFileSync(file, json(original))
  const edited = prepare(f, 'all-eligible', 'edited')
  expect(edited.command.status).toBe(1)
  expect(edited.report.reasons[0]).toMatch(/preview no longer matches/i)
  expect(existsSync(edited.patch)).toBe(false)
  original.pages[1].status = 'unnecessary'
  writeFileSync(file, json(original))

  const envelope = JSON.parse(readFileSync(f.recordPath, 'utf8'))
  envelope.release.jenkinsBuildIdentity = 'vdc-jenkins/english-uat/2'
  writeFileSync(f.recordPath, json(envelope))
  const swapped = prepare(f, 'all-eligible', 'swapped')
  expect(swapped.command.status).toBe(1)
  expect(existsSync(swapped.patch)).toBe(false)
  envelope.release.jenkinsBuildIdentity = 'vdc-jenkins/english-uat/1'
  writeFileSync(f.recordPath, json(envelope))

  put(f.master, `${group}/pages/first/lock.yaml`, lock(f.a, f.c))
  commit(f.master, 'Move a selected lock after preview')
  const stale = prepare(f, 'all-eligible', 'stale')
  expect(stale.command.status).toBe(1)
  expect(stale.report.reasons[0]).toMatch(/preview no longer matches/i)
  expect(existsSync(stale.patch)).toBe(false)
})

it('edits only the selected lock and channel rule lines, and holds when Cloud content drifts', async () => {
  const f = await fixture({ channelRules: true })
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(0)
  const isolated = join(f.root, 'rules-candidate')
  git(f.root, 'clone', '-q', f.master, isolated)
  git(isolated, 'apply', '--check', result.patch)
  git(isolated, 'apply', result.patch)
  expect(git(isolated, 'diff', '--name-only').trim().split('\n')).toEqual(['lock.yaml', 'page.yaml'].map(file => `${group}/pages/first/${file}`))
  const config = readFileSync(join(isolated, group, 'pages/first/page.yaml'), 'utf8')
  expect(config).toContain('# Review note outside both rules.')
  expect(config).toContain('    content: {file: new.md}')
  expect(config).not.toMatch(/channel:|old\.md/)
  const rebuilt = await buildFixture(isolated, f.upstream, f.dev, 'first', join(f.root, 'rule-output'))
  for (const output of rebuilt.values()) expect(output).toContain('Accepted Cloud settings.')

  put(f.master, `${group}/pages/first/new.md`, 'Changed after UAT.\n')
  commit(f.master, 'Alter the accepted Cloud dependency')
  const stale = prepare(f, 'first', 'cloud-drift')
  expect(stale.command.status).toBe(1)
  expect(existsSync(stale.patch)).toBe(false)
  const out = join(f.root, 'cloud-drift-preview')
  expect(cli(f, ['--mode', 'preview', '--out', out]).status).toBe(0)
  const fresh = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(fresh.pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringMatching(/Cloud content changed after UAT/) })
})

it('holds an entire release group when an absolute cross-manual link targets a NEXT route', async () => {
  const url = 'https://docs.zilliz.com/docs/byoc/other?from=guides'
  const f = await fixture({ secondEligible: true, dependencyHref: url })
  expect(git(f.dev, 'show', `${f.devBaseline}:content/en/byoc/tutorials/other.md`)).toContain('Historical page.')
  expect(git(f.dev, 'show', `${f.deployed}:content/en/byoc/tutorials/other.md`)).toContain('channel: next')
  expect(git(f.dev, 'show', `${f.deployed}:content/en/guides/tutorials/first.mdx`)).toContain(url)
  preview(f)

  const result = prepare(f, 'all-eligible')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', selected: ['first', 'second'], pages: [
    { page: 'first', reason: expect.stringContaining(`Unproved current page dependency: guides ${url}`) },
    { page: 'second', views: expect.any(Array) },
  ] })
  expect(existsSync(result.patch)).toBe(false)
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  expect(git(f.dev, 'status', '--porcelain')).toBe('')
  const externalOnly = prepare(f, 'second', 'external-only')
  expect(externalOnly.command.status, externalOnly.command.stderr || externalOnly.command.stdout).toBe(0)
  expect(externalOnly.report).toMatchObject({ status: 'prepared', selected: ['second'] })
})

it('holds a Cloud link to a current page whose BYOC copy shares a NEXT token', async () => {
  const url = 'https://docs.zilliz.com/docs/other'
  const f = await fixture({ dependencyHref: url })
  const cloud = git(f.dev, 'show', `${f.deployed}:content/en/guides/tutorials/other.md`)
  const byoc = git(f.dev, 'show', `${f.deployed}:content/en/byoc/tutorials/other.md`)
  expect(cloud).toContain('token: feishu-old-other')
  expect(cloud).not.toContain('channel: next')
  expect(byoc).toContain('token: feishu-old-other')
  expect(byoc).toContain('channel: next')
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining(`Unproved current page dependency: guides ${url} (NEXT route)`) },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it('holds selected routes that share their token with a NEXT Reference page', async () => {
  const f = await fixture({ nextAliasForSelected: true })
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining('Selected route is gated on English Prod: /docs/first') },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it.each(['missing', 'mismatched'] as const)('holds a selected page with %s historical dev inventory', async devInventory => {
  const f = await fixture({ devInventory })
  expect(preview(f).pages[0].status).toBe('eligible')
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining('Historical dev inventory missing or mismatched: content/en/byoc/tutorials/other.md') },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it.each([
  ['targets', /snapshot publication targets do not match receipt renditions/],
  ['navigation', /receipt navigation differs from effective snapshot/],
] as const)('holds a page when committed snapshot %s disagrees with its receipt', async (snapshotMismatch, reason) => {
  const f = await fixture({ snapshotMismatch })
  expect(preview(f).pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringMatching(reason) })
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(existsSync(result.patch)).toBe(false)
})

it.each(['lock.yaml', 'page.yaml'] as const)('holds the page when committed %s contains invalid UTF-8', async malformedYaml => {
  const f = await fixture({ malformedYaml })
  expect(preview(f).pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringContaining(`Editable ${malformedYaml} must round-trip as UTF-8`) })
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(existsSync(result.patch)).toBe(false)
})
