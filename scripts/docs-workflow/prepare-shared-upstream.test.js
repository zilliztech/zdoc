'use strict';

const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { prepareSharedUpstream, readTopLevelScalar } = require('./prepare-shared-upstream')

const gitEnv = Object.freeze({
  ...process.env,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_AUTHOR_NAME: 'Prep Fixture',
  GIT_AUTHOR_EMAIL: 'prep@example.test',
  GIT_COMMITTER_NAME: 'Prep Fixture',
  GIT_COMMITTER_EMAIL: 'prep@example.test',
})

const git = (repo, ...args) => execFileSync('git', ['-C', repo, '-c', 'commit.gpgsign=false', ...args], { encoding: 'utf8', env: gitEnv }).trim()

function temp(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `prep-shared-upstream-${label}-`))
}

/** A two-commit upstream "origin" and a workspace whose shared-docs/node pins both. */
function fixture(label) {
  const origin = temp(label)
  fs.writeFileSync(path.join(origin, 'page.md'), '# page\n')
  git(origin, 'init', '--quiet', '--initial-branch=master')
  git(origin, 'add', '.')
  git(origin, 'commit', '--quiet', '-m', 'first')
  const current = git(origin, 'rev-parse', 'HEAD')
  fs.writeFileSync(path.join(origin, 'page.md'), '# page v2\n')
  git(origin, 'add', '.')
  git(origin, 'commit', '--quiet', '-m', 'second')
  const next = git(origin, 'rev-parse', 'HEAD')

  const workspace = temp(label)
  fs.mkdirSync(path.join(workspace, 'shared-docs/node'), { recursive: true })
  fs.writeFileSync(path.join(workspace, 'shared-docs/node/source.yaml'),
    `schema_version: 1\nrepository: ${origin}\ntrack: master\npresentation:\n  node:\n    title_suffix: Node.js\n`)
  fs.writeFileSync(path.join(workspace, 'shared-docs/node/lock.yaml'),
    `schema_version: 1\ncurrent: ${current}\nnext: ${next}\n`)
  return { origin, workspace, current, next }
}

test('clones the pinned upstream and verifies both lock commits', () => {
  const f = fixture('ok')
  const output = path.join(os.tmpdir(), `prep-shared-upstream-checkout-${path.basename(f.workspace)}`)
  try {
    const result = prepareSharedUpstream({ group: 'node', output, cwd: f.workspace })
    assert.equal(result.group, 'node')
    assert.equal(result.repository, f.origin)
    assert.equal(result.track, 'master')
    assert.equal(result.current, f.current)
    assert.equal(result.next, f.next)
    assert.equal(result.output, path.resolve(output))
    assert.equal(git(output, 'rev-parse', 'HEAD'), f.next)
    for (const commit of [f.current, f.next]) {
      git(output, 'cat-file', '-e', `${commit}^{commit}`)
    }
  } finally {
    fs.rmSync(output, { recursive: true, force: true })
    fs.rmSync(f.origin, { recursive: true, force: true })
    fs.rmSync(f.workspace, { recursive: true, force: true })
  }
})

test('refuses non-shared groups, workspace-rooted outputs, reused outputs, and missing pins', () => {
  const f = fixture('guards')
  const guardCases = []
  try {
    assert.throws(() => prepareSharedUpstream({ group: 'guides', output: path.join(f.workspace, 'out'), cwd: f.workspace }),
      /does not produce through shared-docs/)
    assert.throws(() => prepareSharedUpstream({ group: 'node', output: path.join(f.workspace, 'checkout'), cwd: f.workspace }),
      /must not live inside the repository workspace/)
    const occupied = temp('occupied')
    guardCases.push(occupied)
    assert.throws(() => prepareSharedUpstream({ group: 'node', output: occupied, cwd: f.workspace }), /already exists/)
    const missing = 'f'.repeat(40)
    fs.writeFileSync(path.join(f.workspace, 'shared-docs/node/lock.yaml'),
      `schema_version: 1\ncurrent: ${f.current}\nnext: ${missing}\n`)
    const ghost = path.join(os.tmpdir(), `prep-shared-upstream-ghost-${path.basename(f.workspace)}`)
    guardCases.push(ghost)
    assert.throws(() => prepareSharedUpstream({ group: 'node', output: ghost, cwd: f.workspace }),
      new RegExp(`lock next commit ${missing} is missing from the cloned upstream`))
    assert.ok(!fs.existsSync(ghost), 'a failed preparation must not leave a checkout behind')
  } finally {
    for (const dir of [f.origin, f.workspace, ...guardCases]) fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('reads top-level scalars without nested shadows and rejects empty values', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prep-shared-upstream-scalar-'))
  try {
    const file = path.join(dir, 'source.yaml')
    fs.writeFileSync(file, 'repository: https://example.test/web-content\npresentation:\n  node:\n    repository: shadowed\n')
    assert.equal(readTopLevelScalar(file, 'repository', 'fixture'), 'https://example.test/web-content')
    fs.writeFileSync(file, 'track: master\nrepository:   \n')
    assert.throws(() => readTopLevelScalar(file, 'repository', 'fixture'), /empty "repository" value/)
    fs.writeFileSync(file, 'repository: "https://example.test/web-content"\n')
    assert.throws(() => readTopLevelScalar(file, 'repository', 'fixture'), /unquoted scalar/)
    fs.writeFileSync(file, 'repository: https://example.test/web-content # pinned mirror\n')
    assert.throws(() => readTopLevelScalar(file, 'repository', 'fixture'), /trailing comment/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
