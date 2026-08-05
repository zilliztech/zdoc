'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {publishCheckpointTransaction} = require('./checkpoint-publication')

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim()
}

function put(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, value)
}

function copy(from, to) {
  fs.cpSync(from, to, {recursive: true})
}

function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checkpoint-publication-'))
  const remote = path.join(root, 'remote.git')
  const repository = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  git(root, 'init', '--bare', remote)
  git(root, 'init', repository)
  git(repository, 'config', 'user.name', 'Test')
  git(repository, 'config', 'user.email', 'test@example.com')
  put(repository, 'content/en/guides/tutorials/home.md', '# Guides home\n')
  put(repository, 'content/en/guides/tutorials/a.md', 'old\n')
  put(repository, 'content/zh-CN/guides/tutorials/home.md', '# Chinese Guides home\n')
  put(repository, 'content/zh-CN/guides/tutorials/a.md', 'old\n')
  git(repository, 'add', '.')
  git(repository, 'commit', '-m', 'seed')
  git(repository, 'branch', '-M', 'dev')
  git(repository, 'remote', 'add', 'origin', remote)
  git(repository, 'push', '-u', 'origin', 'dev')
  return {root, remote, repository, runnerTemp}
}

function checkpoint(fixture, mutate = () => {}, options = {}) {
  const baseline = path.join(fixture.root, `baseline-${Math.random()}`)
  const workspace = path.join(fixture.root, `workspace-${Math.random()}`)
  const artifactDir = path.join(fixture.root, `artifact-${Math.random()}`)
  copy(fixture.repository, baseline)
  copy(fixture.repository, workspace)
  mutate(workspace)
  const baselineSha = git(baseline, 'rev-parse', 'HEAD')
  execFileSync(process.execPath, [
    path.join(__dirname, 'create-checkpoint-artifact.js'),
    '--group', 'guides',
    '--master-sha', baselineSha,
    '--dev-baseline-sha', baselineSha,
    '--baseline-dir', baseline,
    '--workspace', workspace,
    '--output', artifactDir,
  ], {env: {...process.env, ...(options.environment || {})}})
  return {artifactDir, baselineDir: baseline, baselineSha}
}

function unit(checkpointFacts, overrides = {}) {
  return {
    unitKey: 'source/guides-en',
    group: 'guides',
    toolingSha: checkpointFacts.baselineSha,
    sourceBaselineSha: checkpointFacts.baselineSha,
    targetBranch: 'dev',
    commitMessage: 'publish guides checkpoint',
    validationCommands: ['test -f content/en/guides/tutorials/a.md'],
    environment: {},
    ...overrides,
  }
}

async function publish(fixture, checkpointFacts, overrides = {}) {
  return publishCheckpointTransaction({
    repositoryRoot: fixture.repository,
    artifactDir: checkpointFacts.artifactDir,
    baselineDir: null,
    unit: unit(checkpointFacts),
    remote: 'origin',
    maxAttempts: 3,
    runnerTemp: fixture.runnerTemp,
    ...overrides,
  })
}

function push(worktree, remote, branch) {
  git(worktree, 'push', remote, `HEAD:refs/heads/${branch}`)
}

test('publishes against the latest target tip with scoped staging and structured facts', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))
  put(fixture.repository, 'remote.txt', 'keep\n')
  git(fixture.repository, 'add', 'remote.txt')
  git(fixture.repository, 'commit', '-m', 'remote move')
  git(fixture.repository, 'push', 'origin', 'dev')
  const prior = git(fixture.repository, 'rev-parse', 'HEAD')

  const result = await publish(fixture, facts)

  assert.equal(result.status, 'published')
  assert.equal(result.baseSha, prior)
  assert.match(result.resultSha, /^[0-9a-f]{40}$/)
  assert.deepEqual(result.commitShas, [result.resultSha])
  assert.equal(result.attempts, 1)
  assert.equal(result.failure, null)
  assert.equal(result.remoteState, 'known')
  assert.equal(git(fixture.remote, 'rev-parse', 'refs/heads/dev'), result.resultSha)
  assert.equal(git(fixture.remote, 'show', 'refs/heads/dev:remote.txt'), 'keep')
  assert.equal(git(fixture.remote, 'show', 'refs/heads/dev:content/en/guides/tutorials/a.md'), 'new')
  assert.deepEqual(fs.readdirSync(fixture.runnerTemp), [])
})

test('returns no_changes without creating or reporting a commit', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture)

  const result = await publish(fixture, facts)

  assert.deepEqual(result, {
    status: 'no_changes',
    baseSha: facts.baselineSha,
    resultSha: facts.baselineSha,
    commitShas: [],
    attempts: 1,
    failure: null,
    remoteState: 'known',
    completedAt: result.completedAt,
  })
  assert.match(result.completedAt, /^\d{4}-\d{2}-\d{2}T/)
})

test('runs every trusted validation command with the Chinese Guides environment', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(
    fixture,
    workspace => put(workspace, 'content/zh-CN/guides/tutorials/a.md', 'new\n'),
    {environment: {ZDOC_SITE: 'zh-CN'}},
  )
  const chinese = unit(facts, {
    unitKey: 'source/guides-zh-CN',
    environment: {ZDOC_SITE: 'zh-CN'},
    validationCommands: [
      'test "$ZDOC_SITE" = zh-CN',
      'test "$(cat content/zh-CN/guides/tutorials/a.md)" = new',
    ],
  })

  const result = await publish(fixture, facts, {unit: chinese})

  assert.equal(result.status, 'published')
})

test('uses the Chinese Guides site for every checkpoint operation', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture)
  const observed = []
  const chinese = unit(facts, {
    unitKey: 'source/guides-zh-CN',
    environment: {ZDOC_SITE: 'zh-CN'},
    validationCommands: ['true'],
  })

  const result = await publish(fixture, facts, {
    unit: chinese,
    dependencies: {
      validateCheckpointArtifact(artifactDir, expected) {
        observed.push(['validate', expected.site])
        return {group: 'guides', stage: 'source', masterSha: facts.baselineSha, devBaselineSha: facts.baselineSha}
      },
      applyCheckpointArtifact(options) { observed.push(['apply', options.site]) },
      writeStagePathFile(options) {
        observed.push(['stage', options.site])
        fs.writeFileSync(options.output, '')
      },
      verifyStagedCheckpointPaths(options) { observed.push(['verify', options.site]) },
    },
  })

  assert.equal(result.status, 'no_changes', JSON.stringify(result.failure))
  assert.deepEqual(observed, [
    ['validate', 'zh-CN'],
    ['apply', 'zh-CN'],
    ['apply', 'zh-CN'],
    ['stage', 'zh-CN'],
    ['verify', 'zh-CN'],
  ])
})

test('links validation dependencies from an explicit installed dependency root', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))
  const dependencyRoot = path.join(fixture.root, 'installed-dependencies')
  put(dependencyRoot, 'node_modules/replay-only-package/index.js', 'module.exports = 42\n')

  const result = await publish(fixture, facts, {
    dependencyRoot,
    unit: unit(facts, {validationCommands: [
      'node -e "if (require(\'replay-only-package\') !== 42) process.exit(1)"',
    ]}),
  })

  assert.equal(result.status, 'published', JSON.stringify(result.failure))
})

test('a validation failure is a known publish_failed result and does not push', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))
  const before = git(fixture.remote, 'rev-parse', 'refs/heads/dev')

  const result = await publish(fixture, facts, {
    unit: unit(facts, {validationCommands: ['exit 7']}),
  })

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.baseSha, before)
  assert.equal(result.resultSha, null)
  assert.deepEqual(result.commitShas, [])
  assert.equal(result.remoteState, 'known')
  assert.equal(result.failure.phase, 'validation')
  assert.equal(git(fixture.remote, 'rev-parse', 'refs/heads/dev'), before)
  assert.deepEqual(fs.readdirSync(fixture.runnerTemp), [])
})

test('a push error after the remote reaches the exact candidate reports published', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))

  const result = await publish(fixture, facts, {
    dependencies: {
      pushCandidate({worktree, remote, branch}) {
        push(worktree, remote, branch)
        throw new Error('connection closed after update')
      },
    },
  })

  assert.equal(result.status, 'published')
  assert.equal(result.remoteState, 'known')
  assert.equal(git(fixture.remote, 'rev-parse', 'refs/heads/dev'), result.resultSha)
})

test('a push error after a descendant reaches the remote reports published', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))

  const result = await publish(fixture, facts, {
    dependencies: {
      pushCandidate({worktree, remote, branch}) {
        push(worktree, remote, branch)
        git(fixture.repository, 'fetch', 'origin', 'dev')
        git(fixture.repository, 'reset', '--hard', 'origin/dev')
        put(fixture.repository, 'after-candidate.txt', 'descendant\n')
        git(fixture.repository, 'add', 'after-candidate.txt')
        git(fixture.repository, 'commit', '-m', 'remote descendant')
        git(fixture.repository, 'push', 'origin', 'dev')
        throw new Error('connection closed after descendant update')
      },
    },
  })

  assert.equal(result.status, 'published')
  assert.notEqual(git(fixture.remote, 'rev-parse', 'refs/heads/dev'), result.resultSha)
  assert.equal(git(fixture.repository, 'merge-base', '--is-ancestor', result.resultSha, 'origin/dev'), '')
})

test('one target advance recomposes and succeeds without reporting the abandoned commit', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))
  let pushes = 0

  const result = await publish(fixture, facts, {
    dependencies: {
      pushCandidate({worktree, remote, branch}) {
        pushes += 1
        if (pushes === 1) {
          put(fixture.repository, 'remote-race.txt', 'keep\n')
          git(fixture.repository, 'add', 'remote-race.txt')
          git(fixture.repository, 'commit', '-m', 'remote race')
          git(fixture.repository, 'push', 'origin', 'dev')
          throw new Error('non-fast-forward')
        }
        push(worktree, remote, branch)
      },
    },
  })

  assert.equal(result.status, 'published')
  assert.equal(result.attempts, 2)
  assert.deepEqual(result.commitShas, [result.resultSha])
  assert.equal(git(fixture.remote, 'show', 'refs/heads/dev:remote-race.txt'), 'keep')
})

test('a known unchanged remote after push failure is terminal for the unit', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))

  const result = await publish(fixture, facts, {
    dependencies: {pushCandidate() { throw new Error('permission denied') }},
  })

  assert.equal(result.status, 'publish_failed')
  assert.equal(result.remoteState, 'known')
  assert.equal(result.resultSha, null)
  assert.deepEqual(result.commitShas, [])
  assert.equal(result.failure.phase, 'push')
})

test('bounded probe failure reports unknown remote state and stops retrying', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const facts = checkpoint(fixture, workspace => put(workspace, 'content/en/guides/tutorials/a.md', 'new\n'))
  let probes = 0

  const result = await publish(fixture, facts, {
    maxProbeAttempts: 3,
    dependencies: {
      pushCandidate() { throw new Error('transport failed') },
      probeRemoteCandidate() {
        probes += 1
        throw new Error('probe unavailable')
      },
    },
  })

  assert.equal(probes, 3)
  assert.equal(result.status, 'publish_failed')
  assert.equal(result.remoteState, 'unknown')
  assert.equal(result.resultSha, null)
  assert.deepEqual(result.commitShas, [])
  assert.equal(result.failure.code, 'REMOTE_STATE_UNKNOWN')
  assert.equal(result.failure.phase, 'push_probe')
})
