// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { load } from 'js-yaml'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

type Step = { name: string; run?: string; if?: string; with?: Record<string, unknown>; env?: Record<string, string> }
type Workflow = {
  concurrency: { group: string; 'cancel-in-progress': boolean }
  jobs: Record<string, { steps: Step[]; if?: string; permissions?: Record<string, string>; 'timeout-minutes': number }>
}
const root = process.cwd()
const detectorPath = 'packages/docs-tooling/src/shared-docs/adapters/detect-groups.cjs'
const lock = load(readFileSync('.github/workflows/shared-docs-lock.yml', 'utf8')) as Workflow
const validate = load(readFileSync('.github/workflows/shared-docs-validate.yml', 'utf8')) as Workflow
const directories: string[] = []
const gitBinary = execFileSync('which', ['git'], { encoding: 'utf8' }).trim()
function temporary() { const dir = mkdtempSync(join(tmpdir(), 'shared-docs-workflow-')); directories.push(dir); return dir }
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }) })
function git(cwd: string, ...args: string[]) {
  return execFileSync(gitBinary, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' } }).trim()
}
function put(cwd: string, name: string, text = 'input\n') { mkdirSync(resolve(cwd, name, '..'), { recursive: true }); writeFileSync(join(cwd, name), text) }
function commit(cwd: string) { git(cwd, 'add', '--all'); git(cwd, 'commit', '-qm', 'Fixture'); return git(cwd, 'rev-parse', 'HEAD') }
function fixture() {
  const dir = temporary(), repo = join(dir, 'repo'), remote = join(dir, 'remote.git'), bin = join(dir, 'bin')
  mkdirSync(repo); mkdirSync(bin)
  git(repo, 'init', '-q', '-b', 'onboarding'); git(repo, 'config', 'user.name', 'Workflow Test'); git(repo, 'config', 'user.email', 'test@example.invalid')
  put(repo, 'shared-docs/guides/source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs.git\ntrack: v3.0.x\n')
  put(repo, 'shared-docs/guides/pages/example/page.yaml')
  put(repo, detectorPath, readFileSync(join(root, detectorPath), 'utf8'))
  const sha = commit(repo)
  git(dir, 'init', '-q', '--bare', remote); git(repo, 'remote', 'add', 'origin', remote); git(repo, 'push', '-q', 'origin', 'HEAD:refs/heads/onboarding')
  git(repo, 'config', `url.${remote}.insteadOf`, 'https://github.com/test-owner/zdoc.git')
  writeFileSync(join(dir, 'shared-docs-groups'), 'guides\n')
  return { dir, repo, remote, bin, sha }
}
let sequence = 0
function execute(workflow: Workflow, job: string, name: string, setup: ReturnType<typeof fixture>, env: Record<string, string> = {}) {
  const step = workflow.jobs[job].steps.find(item => item.name === name)
  if (!step?.run) throw new Error(`No shell step: ${name}`)
  const output = join(setup.dir, `output-${sequence++}`), summary = join(setup.dir, `summary-${sequence++}`)
  writeFileSync(output, ''); writeFileSync(summary, '')
  const result = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail'], {
    cwd: setup.repo, input: step.run, encoding: 'utf8', timeout: 120_000,
    env: { ...process.env, PATH: `${setup.bin}:${process.env.PATH}`, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
      GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary, RUNNER_TEMP: setup.dir, SOURCE_SHA: setup.sha, BASE_SHA: setup.sha,
      PR_NUMBER: '9', PR_HEAD_BRANCH: 'onboarding', GITHUB_REPOSITORY: 'test-owner/zdoc', GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_EVENT_NAME: 'pull_request', GITHUB_SHA: setup.sha, GITHUB_RUN_ID: '1234', GITHUB_RUN_ATTEMPT: '2', GH_TOKEN: 'test-token', ...env },
  })
  if (result.error) throw result.error
  return { ...result, outputs: Object.fromEntries(readFileSync(output, 'utf8').trim().split('\n').filter(Boolean).map(line => {
    const equal = line.indexOf('='); return [line.slice(0, equal), line.slice(equal + 1)]
  })), summary: readFileSync(summary, 'utf8') }
}
function stub(setup: ReturnType<typeof fixture>, name: string, body: string) { const file = join(setup.bin, name); writeFileSync(file, body); chmodSync(file, 0o755) }
function pnpmStub(setup: ReturnType<typeof fixture>, status: number) {
  stub(setup, 'pnpm', `#!/bin/sh\nprintf '%s\\n' "$*" > "$RUNNER_TEMP/pnpm-args"\nprintf '%s\\n' 'shared-docs/guides/pages/example/page.yaml:7 [example/current] CONFIG_FIELD_MISSING: fixture diagnostic'\nexit ${status}\n`)
}
function githubStub(setup: ReturnType<typeof fixture>) {
  stub(setup, 'gh', `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2), mode = process.env.GH_STUB_MODE || 'success';
fs.appendFileSync(process.env.RUNNER_TEMP + '/gh-calls', JSON.stringify(args) + '\\n');
if (!args.includes('--repo') || args[args.indexOf('--repo') + 1] !== process.env.GITHUB_REPOSITORY) process.exit(90);
if (args[0] === 'workflow') {
  if (mode === 'dispatch-error') { console.error('HTTP 422: workflow is not registered on the default branch'); process.exit(1); }
  process.exit(0);
}
if (args[1] === 'list') {
  const run = { databaseId: 2345, headSha: process.env.SOURCE_SHA, displayTitle: 'shared-docs-validate lock-1234-2', event: 'workflow_dispatch', headBranch: 'onboarding' };
  const decoys = [{...run, databaseId: 10, headSha: 'a'.repeat(40)}, {...run, databaseId: 11, event: 'pull_request'}, {...run, databaseId: 12, headBranch: 'other'}, {...run, databaseId: 13, displayTitle: 'shared-docs-validate lock-older'}];
  console.log(JSON.stringify(mode === 'wrong-sha' ? decoys : mode === 'ambiguous' ? [run, run] : [...decoys, run]));
} else if (args[1] === 'watch') {
  if (mode !== 'success') { console.error('fixture watch failure'); process.exit(1); }
} else if (args[1] === 'view') {
  if (mode === 'view-error') { console.error('fixture GitHub API outage'); process.exit(2); }
  console.log(JSON.stringify(mode === 'watch-infrastructure' ? {status:'in_progress', conclusion:null}
    : {status:'completed', conclusion:mode === 'cancelled' ? 'cancelled' : 'failure'}));
} else process.exit(91);
`)
  stub(setup, 'sleep', '#!/bin/sh\nexit 0\n')
}
const pushName = 'Push only new regular lock files', dispatchName = 'Dispatch and wait for exact pushed validation'

describe('read-only validation shell contracts', () => {
  it('shares the dependency-free detector before dependency installation', () => {
    for (const [workflow, job] of [[validate, 'validate'], [lock, 'lock']] as const) {
      const steps = workflow.jobs[job].steps
      expect(steps.find(step => step.name === 'Detect shared input changes')?.run?.trim()).toBe(`node ${detectorPath}`)
      expect(steps.findIndex(step => step.name === 'Detect shared input changes')).toBeLessThan(steps.findIndex(step => step.name === 'Install pnpm'))
    }
  })
  it('separates PR and dispatch concurrency while allowing cancellation within each event', () => {
    expect(validate.concurrency.group).toBe('shared-docs-validate-${{ github.event.pull_request.number || inputs.pr_number }}-${{ github.event_name }}')
    expect(validate.concurrency['cancel-in-progress']).toBe(true)
    expect(lock.concurrency.group).toBe('shared-docs-lock-${{ github.event.pull_request.number }}')
    expect(lock.concurrency['cancel-in-progress']).toBe(false)
  })
  it.each(['pull_request', 'workflow_dispatch'])('accepts valid exact identities for %s', event => {
    const setup = fixture(), result = execute(validate, 'validate', 'Validate immutable PR identities', setup, { GITHUB_EVENT_NAME: event })
    expect(result.status).toBe(0); expect(result.outputs).toEqual({ source_sha: setup.sha, base_sha: setup.sha })
  })
  it.each([{ PR_NUMBER: '9; echo injected' }, { SOURCE_SHA: 'main' }, { BASE_SHA: 'a'.repeat(39) }, { GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_SHA: 'b'.repeat(40) }])('rejects unsafe or unbound identities %j', env => {
    const result = execute(validate, 'validate', 'Validate immutable PR identities', fixture(), env)
    expect(result.status).not.toBe(0); expect(result.outputs).toEqual({})
  })
  it('[3-3] skips install, external reads and generation when no shared input changes', () => {
    const setup = fixture(); put(setup.repo, 'ordinary.md'); const head = commit(setup.repo)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, { SOURCE_SHA: head })
    expect(result.status).toBe(0); expect(result.outputs.changed).toBe('false')
    const guarded = validate.jobs.validate.steps.filter(step => /Install|Set up|source configuration|tracking history|dev snapshot|Generate/.test(step.name))
    expect(guarded.length).toBe(8)
    for (const step of guarded) expect(step.if).toBe("steps.changes.outputs.changed == 'true'")
    expect(execute(validate, 'validate', 'Report unchanged shared inputs', setup).summary).toContain('without dependency installation or generation')
  })
  it.each(['shared-docs/guides/input\nwith-newline.yaml', 'shared-docs/guides/pages/example/page.yaml'])('[3-3] detects deleted or newline-containing shared inputs: %s', file => {
    const setup = fixture(); put(setup.repo, file, 'version two\n'); const base = commit(setup.repo); rmSync(join(setup.repo, file)); const head = commit(setup.repo)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, { BASE_SHA: base, SOURCE_SHA: head })
    expect(result.status).toBe(0); expect(result.outputs.changed).toBe('true'); expect(result.outputs.groups).toBe('["guides"]')
  })
  it('[3-3] treats a rename out of shared-docs as a shared input deletion', () => {
    const setup = fixture(); git(setup.repo, 'mv', 'shared-docs/guides/pages/example/page.yaml', 'moved.yaml'); const head = commit(setup.repo)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, { SOURCE_SHA: head })
    expect(result.status).toBe(0); expect(result.outputs.changed).toBe('true'); expect(result.outputs.groups).toBe('["guides"]')
  })
  it('[3-3] deduplicates affected groups across page and group configuration changes', () => {
    const setup = fixture(); put(setup.repo, 'shared-docs/guides/pages/example/page.yaml', 'changed'); put(setup.repo, 'shared-docs/guides/Variables.json', '{}'); const head = commit(setup.repo)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, { SOURCE_SHA: head })
    expect(result.status).toBe(0); expect(result.outputs.groups).toBe('["guides"]')
    expect(readFileSync(join(setup.dir, 'shared-docs-groups'), 'utf8')).toBe('guides\n')
  })
  it.each(['shared-docs/source.yaml', 'shared-docs/pages/old/page.yaml', 'shared-docs/rest/pages/new/page.yaml', 'shared-docs/guides'])('rejects unsupported or ungrouped shared input before external reads: %s', file => {
    const setup = fixture()
    if (file === 'shared-docs/guides') rmSync(join(setup.repo, file), { recursive: true })
    put(setup.repo, file); const head = commit(setup.repo)
    for (const [workflow, job, name] of [[validate, 'validate', 'Detect shared input changes'], [lock, 'lock', 'Detect shared input changes']] as const) {
      const result = execute(workflow, job, name, setup, { SOURCE_SHA: head })
      expect(result.status).toBe(1); expect(result.outputs.failure_class).toBe('content')
      expect(result.stderr).toContain('Only the guides group is supported')
      const names = workflow.jobs[job].steps.map(step => step.name)
      expect(names.indexOf(name)).toBeLessThan(names.indexOf('Clone complete tracking history'))
    }
  })
  it.each([['shared-docs/guides/pages/example/page.yaml', 'shared-docs/rest/pages/example/page.yaml'], ['shared-docs/rest/pages/old/page.yaml', 'shared-docs/guides/pages/renamed/page.yaml']])('rejects either unsupported side of a rename: %s -> %s', (from, to) => {
    const setup = fixture(); put(setup.repo, from, 'rename input\n'); const base = commit(setup.repo)
    mkdirSync(resolve(setup.repo, to, '..'), { recursive: true }); git(setup.repo, 'mv', from, to); const head = commit(setup.repo)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, { BASE_SHA: base, SOURCE_SHA: head })
    expect(result.status).toBe(1); expect(result.outputs.failure_class).toBe('content')
  })
  it.each([1, 128])('fails closed when merge-base exits %s', status => {
    const setup = fixture(); stub(setup, 'git', `#!/bin/sh\nif [ "$1" = merge-base ]; then exit ${status}; fi\nexec '${gitBinary}' "$@"\n`)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup)
    expect(result.status).toBe(status); expect(result.outputs.changed).toBeUndefined()
  })
  it.each([{ SOURCE_SHA: 'main' }, { BASE_SHA: 'a'.repeat(39) }, { BASE_SHA: 'A'.repeat(40) }])('rejects malformed detector identities before any Git command: %j', env => {
    const setup = fixture(); stub(setup, 'git', '#!/bin/sh\nprintf called > "$RUNNER_TEMP/git-called"\nexit 99\n')
    const result = execute(validate, 'validate', 'Detect shared input changes', setup, env)
    expect(result.status).toBe(1); expect(result.outputs).toEqual({})
    expect(result.stderr).toContain('complete lowercase SHA-1')
    expect(() => readFileSync(join(setup.dir, 'git-called'))).toThrow()
  })
  it.each(['fetch', 'diff'])('preserves infrastructure failure from detector Git %s', command => {
    const setup = fixture(); stub(setup, 'git', `#!/bin/sh\nif [ "$1" = ${command} ]; then echo 'fixture Git failure' >&2; exit 42; fi\nexec '${gitBinary}' "$@"\n`)
    const result = execute(lock, 'lock', 'Detect shared input changes', setup)
    expect(result.status).toBe(42); expect(result.outputs).toEqual({})
    expect(result.stderr).toContain('fixture Git failure')
  })
  it('rejects malformed merge-base output before recording success', () => {
    const setup = fixture(); stub(setup, 'git', `#!/bin/sh\nif [ "$1" = merge-base ]; then echo main; exit 0; fi\nexec '${gitBinary}' "$@"\n`)
    const result = execute(validate, 'validate', 'Detect shared input changes', setup)
    expect(result.status).toBe(1); expect(result.outputs).toEqual({})
    expect(result.stderr).toContain('Merge base must be a complete lowercase SHA-1')
  })
  it('preserves the raw NUL-delimited changed-path artifact without dependencies', () => {
    const setup = fixture(), file = 'shared-docs/guides/new\ninput.yaml'; put(setup.repo, file); const head = commit(setup.repo)
    const result = execute(lock, 'lock', 'Detect shared input changes', setup, { SOURCE_SHA: head })
    expect(result.status).toBe(0); expect(result.outputs).toEqual({ changed: 'true', groups: '["guides"]' })
    expect(readFileSync(join(setup.dir, 'shared-docs-paths'))).toEqual(Buffer.from(`${file}\0`))
    expect(readFileSync(join(setup.repo, detectorPath), 'utf8')).toBe(readFileSync(join(root, detectorPath), 'utf8'))
  })
  it('rejects checkout SHA drift before comparing paths', () => {
    const setup = fixture(), result = execute(validate, 'validate', 'Detect shared input changes', setup, { SOURCE_SHA: 'a'.repeat(40) })
    expect(result.status).not.toBe(0); expect(result.outputs).toEqual({})
  })
  it.each([0, 1])('[3-3] runs all-page generation and preserves status %s with file/line summary diagnostics', status => {
    const setup = fixture(); pnpmStub(setup, status)
    const result = execute(validate, 'validate', 'Generate all shared pages', setup)
    expect(result.status).toBe(status); expect(result.summary).toContain('shared-docs/guides/pages/example/page.yaml:7')
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toContain('shared-docs build --shared-docs shared-docs/guides')
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).not.toContain('--page')
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toContain(`--out ${setup.dir}/shared-docs-output/guides`)
  })
  it('[3-3] rebuilds the whole group after a configuration-only change', () => {
    const setup = fixture(); put(setup.repo, 'shared-docs/guides/pages/unchanged/page.yaml'); const base = commit(setup.repo)
    put(setup.repo, 'shared-docs/guides/Variables.json', '{}'); const head = commit(setup.repo)
    const detected = execute(validate, 'validate', 'Detect shared input changes', setup, { BASE_SHA: base, SOURCE_SHA: head })
    expect(detected.status).toBe(0); expect(detected.outputs.groups).toBe('["guides"]')
    stub(setup, 'pnpm', '#!/bin/sh\nset -eu\ntest "$5" = shared-docs/guides\ntest -f "$5/pages/example/page.yaml"\ntest -f "$5/pages/unchanged/page.yaml"\nprintf "%s\\n" "$*" > "$RUNNER_TEMP/pnpm-args"\n')
    expect(execute(validate, 'validate', 'Generate all shared pages', setup).status).toBe(0)
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).not.toContain('--page')
  })
  it('bounds untrusted generation diagnostics in the summary', () => {
    const setup = fixture(); stub(setup, 'pnpm', '#!/usr/bin/env node\nconsole.log("x".repeat(100000)); console.log("```broken fence");\n')
    const result = execute(validate, 'validate', 'Generate all shared pages', setup)
    expect(result.status).toBe(0); expect(result.summary.length).toBeLessThan(32200); expect(result.summary).toContain('[code fence]broken fence')
  })
})

describe('source and snapshot setup shell contracts', () => {
  function sourceSetup() {
    const setup = fixture(); symlinkSync(join(root, 'scripts'), join(setup.repo, 'scripts')); symlinkSync(join(root, 'packages/docs-tooling/src/shared-docs/core'), join(setup.repo, 'packages/docs-tooling/src/shared-docs/core')); return setup
  }
  it.each([lock, validate])('parses source configuration through the existing parser', workflow => {
    const setup = sourceSetup(), job = workflow === lock ? 'lock' : 'validate'
    const result = execute(workflow, job, 'Read public source configuration', setup)
    expect(result.status).toBe(0); expect(result.outputs).toEqual({ repository: 'https://github.com/milvus-io/milvus-docs.git', track: 'v3.0.x' })
  })
  it.each(['git@github.com:owner/repo', 'https://token@github.com/owner/repo', 'https://github.com.evil.test/owner/repo', 'https://github.com/owner/repo?token=x', '--upload-pack=evil', 'file:///tmp/repo', 'https://github.com/owner/..'])('rejects a non-public or unsafe source URL: %s', url => {
    const setup = sourceSetup(); put(setup.repo, 'shared-docs/guides/source.yaml', `schema_version: 1\nrepository: ${JSON.stringify(url)}\ntrack: v3.0.x\n`)
    const result = execute(lock, 'lock', 'Read public source configuration', setup)
    expect(result.status).toBe(1); expect(result.outputs.failure_class).toBe('content')
  })
  it('rejects newline-bearing tracking refs before writing step outputs', () => {
    const setup = sourceSetup(); put(setup.repo, 'shared-docs/guides/source.yaml', 'schema_version: 1\nrepository: https://github.com/owner/repo\ntrack: "main\\nrepository=evil"\n')
    const result = execute(lock, 'lock', 'Read public source configuration', setup)
    expect(result.status).toBe(1); expect(result.outputs.repository).toBeUndefined()
  })
  it('clones a single local tracking branch with complete history', () => {
    const setup = fixture(); git(setup.repo, 'branch', 'v3.0.x'); put(setup.repo, 'second'); commit(setup.repo); git(setup.repo, 'branch', 'other')
    const result = execute(lock, 'lock', 'Clone complete tracking history', setup, { SOURCE_REPOSITORY: setup.repo, TRACK: 'v3.0.x' })
    expect(result.status).toBe(0)
    const clone = join(setup.dir, 'milvus-docs'); expect(git(clone, 'rev-parse', '--is-shallow-repository')).toBe('false')
    expect(git(clone, 'branch', '--format=%(refname)')).toBe('refs/heads/v3.0.x')
    expect(git(clone, 'rev-parse', 'HEAD')).toBe(setup.sha)
    expect(lock.jobs.lock.steps.find(step => step.name === 'Clone complete tracking history')?.run).toBe(validate.jobs.validate.steps.find(step => step.name === 'Clone complete tracking history')?.run)
  })
  it.each(['missing-branch', 'shallow'])('rejects an incomplete tracking checkout: %s', mode => {
    const setup = fixture()
    stub(setup, 'git', `#!/bin/sh\nif [ "$1" = clone ]; then exit 0; fi\nif [ "$3" = show-ref ]; then ${mode === 'missing-branch' ? 'exit 1' : 'exit 0'}; fi\nif [ "$3" = rev-parse ]; then echo true; fi\n`)
    expect(execute(lock, 'lock', 'Clone complete tracking history', setup, { SOURCE_REPOSITORY: setup.repo, TRACK: 'v3.0.x' }).status).not.toBe(0)
  })
  it('authenticates exact upstream dev SHA and uses only approved sparse paths', () => {
    const setup = fixture(); stub(setup, 'git', `#!/bin/sh\nprintf '%s\\trefs/heads/dev\\n' '${setup.sha}'\n`)
    const result = execute(validate, 'validate', 'Resolve exact upstream dev snapshot', setup)
    expect(result.status).toBe(0); expect(result.outputs.sha).toBe(setup.sha)
    const checkout = validate.jobs.validate.steps.find(step => step.name === 'Check out read-only upstream dev snapshot')!
    expect(checkout.with?.repository).toBe('zilliztech/zdoc'); expect(checkout.with?.ref).toBe('${{ steps.dev.outputs.sha }}')
    expect(checkout.with?.['sparse-checkout-cone-mode']).toBe(false)
    expect(String(checkout.with?.['sparse-checkout']).trim().split('\n')).toEqual(['/content/en/guides/', '/content/en/byoc/', '/packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'])
  })
  it.each(['', 'invalid\trefs/heads/dev\n', 'a'.repeat(40) + '\trefs/heads/master\n'])('fails closed on malformed upstream identity %j', text => {
    const setup = fixture(); put(setup.dir, 'ref-response', text); stub(setup, 'git', '#!/bin/sh\ncat "$RUNNER_TEMP/ref-response"\n')
    expect(execute(validate, 'validate', 'Resolve exact upstream dev snapshot', setup).status).not.toBe(0)
  })
})

describe('initial-lock writer shell contracts', () => {
  it('reports forks successfully with the exact review instruction and no checkout', () => {
    const setup = fixture(), result = execute(lock, 'fork_notice', 'Explain fork onboarding boundary', setup)
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('::warning title=LOCK_FORK_PR::Please submit this onboarding PR from a branch in this repository')
    expect(result.summary).toBe('LOCK_FORK_PR: Please submit this onboarding PR from a branch in this repository\n')
    expect(lock.jobs.fork_notice.steps).toHaveLength(1)
    expect(lock.jobs.lock.if).toBe('github.event.pull_request.head.repo.full_name == github.repository')
  })
  it.each([0, 1, 2, 127])('preserves lock command exit %s with the correct failure class', status => {
    const setup = fixture(); pnpmStub(setup, status)
    const result = execute(lock, 'lock', 'Create missing initial locks', setup)
    expect(result.status).toBe(status); expect(result.outputs.failure_class).toBe(status === 0 ? undefined : status === 1 ? 'content' : 'infrastructure')
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toContain('shared-docs lock --shared-docs shared-docs/guides --repo')
  })
  it('[T12] pushes only the initial lock candidate, then dispatches and authenticates its exact validation', () => {
    const setup = fixture(); put(setup.repo, 'shared-docs/guides/pages/example/lock.yaml', `current: ${setup.sha}\nnext: ${setup.sha}\n`)
    const pushed = execute(lock, 'lock', pushName, setup)
    expect(pushed.status).toBe(0); expect(pushed.outputs.pushed).toBe('true'); expect(pushed.outputs.pushed_sha).toMatch(/^[a-f0-9]{40}$/)
    const head = pushed.outputs.pushed_sha
    expect(git(setup.remote, 'rev-parse', 'refs/heads/onboarding')).toBe(head)
    expect(git(setup.repo, 'diff', '--name-status', setup.sha, head)).toBe('A\tshared-docs/guides/pages/example/lock.yaml')
    expect(git(setup.repo, 'config', '--local', '--list')).not.toMatch(/extraheader|test-token|credential/)
    githubStub(setup)
    const dispatch = execute(lock, 'lock', dispatchName, setup, { SOURCE_SHA: head })
    expect(dispatch.status).toBe(0); expect(dispatch.outputs.run_id).toBe('2345')
    expect(dispatch.summary).toContain(head); expect(dispatch.summary).toContain('https://github.com/test-owner/zdoc/actions/runs/2345')
    const calls = readFileSync(join(setup.dir, 'gh-calls'), 'utf8').trim().split('\n').map(line => JSON.parse(line) as string[])
    expect(calls[0]).toContain(`source_sha=${head}`); expect(calls[0]).toContain(`base_sha=${setup.sha}`); expect(calls[0]).toContain('request_id=lock-1234-2')
    expect(calls.find(args => args[1] === 'watch')).toContain('2345')
  })
  it('does not commit or dispatch when all locks already exist', () => {
    const setup = fixture(); const result = execute(lock, 'lock', pushName, setup)
    expect(result.status).toBe(0); expect(result.outputs.pushed).toBe('false'); expect(git(setup.repo, 'rev-parse', 'HEAD')).toBe(setup.sha)
    expect(lock.jobs.lock.steps.find(step => step.name === dispatchName)?.if).toBe("steps.push.outputs.pushed == 'true'")
  })
  it.each(['tracked-modification', 'unrelated-staged', 'unexpected-untracked', 'newline-path', 'symlink', 'executable', 'unsupported-group', 'legacy-layout'])('rejects unsafe staging: %s', kind => {
    const setup = fixture(), lockPath = 'shared-docs/guides/pages/example/lock.yaml'
    put(setup.repo, lockPath)
    if (kind === 'tracked-modification') put(setup.repo, 'shared-docs/guides/pages/example/page.yaml', 'modified\n')
    if (kind === 'unrelated-staged') { put(setup.repo, 'unrelated.txt'); git(setup.repo, 'add', 'unrelated.txt') }
    if (kind === 'unexpected-untracked') put(setup.repo, 'shared-docs/guides/pages/example/other.yaml')
    if (kind === 'newline-path') put(setup.repo, 'shared-docs/guides/pages/example/lock.yaml\nother')
    if (kind === 'symlink') { rmSync(join(setup.repo, lockPath)); symlinkSync('page.yaml', join(setup.repo, lockPath)) }
    if (kind === 'unsupported-group') put(setup.repo, 'shared-docs/rest/pages/example/lock.yaml')
    if (kind === 'legacy-layout') put(setup.repo, 'shared-docs/pages/example/lock.yaml')
    if (kind === 'executable') chmodSync(join(setup.repo, lockPath), 0o755)
    const result = execute(lock, 'lock', pushName, setup)
    expect(result.status).not.toBe(0); expect(result.outputs.pushed).toBeUndefined(); expect(git(setup.repo, 'rev-parse', 'HEAD')).toBe(setup.sha)
    expect(git(setup.remote, 'rev-parse', 'refs/heads/onboarding')).toBe(setup.sha)
  })
  it('safe-stops on a moved PR branch before committing or pushing', () => {
    const setup = fixture(); put(setup.repo, 'remote-update'); const newer = commit(setup.repo); git(setup.repo, 'push', '-q', 'origin', 'HEAD:refs/heads/onboarding')
    git(setup.repo, 'checkout', '--detach', setup.sha); put(setup.repo, 'shared-docs/guides/pages/example/lock.yaml')
    const result = execute(lock, 'lock', pushName, setup)
    expect(result.status).not.toBe(0); expect(git(setup.repo, 'rev-parse', 'HEAD')).toBe(setup.sha); expect(git(setup.remote, 'rev-parse', 'refs/heads/onboarding')).toBe(newer)
  })
  it('safe-stops when the remote query fails', () => {
    const setup = fixture(); put(setup.repo, 'shared-docs/guides/pages/example/lock.yaml')
    stub(setup, 'git', `#!/bin/sh\nif [ "$1" = ls-remote ]; then echo 'remote unavailable' >&2; exit 2; fi\nexec '${gitBinary}' "$@"\n`)
    const result = execute(lock, 'lock', pushName, setup)
    expect(result.status).toBe(2); expect(result.stderr).toContain('remote unavailable'); expect(git(setup.repo, 'rev-parse', 'HEAD')).toBe(setup.sha)
  })
})

describe('validation dispatch and failure reporting shell contracts', () => {
  it('gives the lock job headroom beyond the validation child timeout', () => {
    expect(validate.jobs.validate['timeout-minutes']).toBe(30)
    expect(lock.jobs.lock['timeout-minutes']).toBe(45)
    expect(lock.jobs.lock['timeout-minutes']).toBeGreaterThan(validate.jobs.validate['timeout-minutes'])
  })
  it('classifies a completed cancelled child as infrastructure through reporting', () => {
    const setup = fixture(); githubStub(setup)
    const result = execute(lock, 'lock', dispatchName, setup, { GH_STUB_MODE: 'cancelled' })
    expect(result.status).toBe(1); expect(result.outputs.run_id).toBe('2345')
    expect(result.outputs.failure_class).toBe('infrastructure')
    const classified = execute(lock, 'lock', 'Classify failure for isolated reporting', setup,
      { JOB_STATUS: 'failure', VALIDATION_FAILURE: result.outputs.failure_class })
    expect(classified.status).toBe(0); expect(classified.outputs.failure_class).toBe('infrastructure')
  })
  it.each(['failed', 'watch-infrastructure', 'view-error', 'dispatch-error', 'wrong-sha', 'ambiguous'])('propagates %s without accepting an unrelated child run', mode => {
    const setup = fixture(); githubStub(setup)
    const result = execute(lock, 'lock', dispatchName, setup, { GH_STUB_MODE: mode })
    expect(result.status).not.toBe(0)
    expect(result.outputs.failure_class).toBe(mode === 'failed' ? 'validation' : 'infrastructure')
    if (mode === 'dispatch-error') expect(result.stderr).toContain('HTTP 422: workflow is not registered on the default branch')
    if (['wrong-sha', 'ambiguous'].includes(mode)) expect(result.outputs.run_id).toBeUndefined()
    if (mode === 'wrong-sha') expect(readFileSync(join(setup.dir, 'gh-calls'), 'utf8')).not.toContain('"watch"')
  })
  it.each([
    [{ JOB_STATUS: 'success' }, ''],
    [{ JOB_STATUS: 'failure' }, 'infrastructure'],
    [{ JOB_STATUS: 'failure', GROUP_FAILURE: 'content' }, 'content'],
    [{ JOB_STATUS: 'failure', SOURCE_FAILURE: 'content' }, 'content'],
    [{ JOB_STATUS: 'failure', COMMAND_FAILURE: 'content' }, 'content'],
    [{ JOB_STATUS: 'failure', COMMAND_FAILURE: 'infrastructure' }, 'infrastructure'],
    [{ JOB_STATUS: 'failure', VALIDATION_FAILURE: 'validation' }, 'validation'],
  ] as const)('classifies actual failures %j as %s', (env, expected) => {
    const result = execute(lock, 'lock', 'Classify failure for isolated reporting', fixture(), env)
    expect(result.status).toBe(0); expect(result.outputs.failure_class).toBe(expected)
  })
  it('creates a repository-relative card note accepted by report-card', () => {
    const setup = fixture(); pnpmStub(setup, 0)
    expect(execute(lock, 'infrastructure_report', 'Prepare infrastructure failure note', setup).status).toBe(0)
    expect(readFileSync(join(setup.repo, 'tmp/shared-docs-infrastructure-failure.md'), 'utf8')).toContain('https://github.com/test-owner/zdoc/actions/runs/1234')
    expect(execute(lock, 'infrastructure_report', 'Attach infrastructure failure note', setup).status).toBe(0)
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toBe('docs-tooling report-card note --file tmp/shared-docs-infrastructure-failure.md\n')
  })
  it('calls the supported card finish interface with failure status', () => {
    const setup = fixture(); pnpmStub(setup, 0)
    const result = execute(lock, 'infrastructure_report', 'Finish infrastructure failure card', setup,
      { CARD_ID: 'card-123', CARD_STARTED_AT: '1000', CARD_STAGES: 'Create initial locks', CARD_TITLE: 'Shared docs lock infrastructure failure' })
    expect(result.status).toBe(0)
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toContain('report-card finish --message-id card-123')
    expect(readFileSync(join(setup.dir, 'pnpm-args'), 'utf8')).toContain('--status failure')
  })
  it('isolates infrastructure cards behind same-repository and failure-class gates', () => {
    const report = lock.jobs.infrastructure_report
    expect(report.if).toBe("always() && github.event.pull_request.head.repo.full_name == github.repository && needs.lock.outputs.failure_class == 'infrastructure'")
    expect(report.permissions).toEqual({ contents: 'read' })
    expect(report.steps[0].with?.ref).toBe('${{ github.event.pull_request.base.sha }}')
    expect(report.steps.find(step => step.name === 'Finish infrastructure failure card')?.run).toContain('--status failure')
    for (const step of report.steps.filter(step => /report-card/.test(step.run || ''))) expect(step.env?.FEISHU_NOTIFICATIONS_DISABLED).toBe("${{ vars.FEISHU_NOTIFICATIONS_DISABLED || '' }}")
  })
})

describe('grouped workflow test selection', () => {
  it.each(['shared-docs/guides/source.yaml', 'shared-docs/guides/pages/example/page.yaml', 'shared-docs/source.yaml', 'shared-docs/rest/pages/example/page.yaml'])('keeps valid and invalid shared layouts mapped to master tooling: %s', file => {
    const selection = JSON.parse(execFileSync(process.execPath, ['scripts/docs-workflow/select-tests-for-changes.js', '--json', file], { cwd: root, encoding: 'utf8' }))
    expect(selection.branchPolicies[0]).toMatchObject({ owner: 'master-tooling', targetBranch: 'master' })
    expect(selection.areas.map((area: { id: string }) => area.id)).toContain('shared-docs')
    expect(selection.commands).toContain('pnpm test:shared-docs')
  })
})
