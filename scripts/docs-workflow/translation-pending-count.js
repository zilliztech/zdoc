'use strict'

// Per-unit pending-file counter for the translation dispatcher. It replays
// exactly the materialization the Guides producer performs in
// _prepare-translation-batches (restore exact source state, materialize the
// target baseline, derive source changes, resolve the effective mode) and then
// runs the same manifest selection with --count-only, so dispatcher counts
// and producer manifests come from one mechanism. Two deliberate deviations,
// both safe for admission control: no reconciliation plan is built (its ops
// mutate target state, not the candidate count) and nothing is uploaded.
//
// The script must run with --repository pointing at a throwaway worktree of
// the tooling SHA: it mutates the working tree (restore/materialize/tmp), and
// nested node_modules resolution walks up to the dispatcher workspace.

const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

function run(command, args, options) {
  const result = spawnSync(command, args, {encoding: 'utf8', ...options})
  if (result.status !== 0) {
    throw new Error(`command failed (${result.status}): ${command} ${args.join(' ')}\n${(result.stderr || result.stdout || '').slice(-2000)}`)
  }
  return result.stdout
}

function parseArguments(argv) {
  const args = new Map()
  for (let i = 0; i < argv.length; i += 2) args.set(argv[i], argv[i + 1])
  const required = ['--repository', '--target', '--group', '--source-baseline-sha', '--source-checkpoint-sha', '--target-baseline-sha']
  for (const flag of required) {
    if (!args.has(flag)) throw new Error(`Usage: translation-pending-count.js ${required.join(' ')} [--mode auto]`)
  }
  const sha = /^[0-9a-f]{40}$/
  for (const flag of ['--source-baseline-sha', '--source-checkpoint-sha', '--target-baseline-sha']) {
    if (!sha.test(args.get(flag))) throw new Error(`${flag} must be a 40-character SHA`)
  }
  return args
}

function restoreExceptForTarget(target) {
  if (target === 'zh-CN-reference') return 'content/zh-CN,generated/zh-CN'
  if (target === 'ja-JP') return 'i18n,.translation-cache'
  throw new Error(`Unsupported translation target: ${target}`)
}

function countPendingUnit({repository, target, group, sourceBaselineSha, sourceCheckpointSha, targetBaselineSha, mode = 'auto'}) {
  const repositoryRoot = path.resolve(repository)
  // The baseline worktree must live OUTSIDE the counting repository —
  // materialize-translation-baseline refuses overlapping trees (the producer
  // keeps it in RUNNER_TEMP for the same reason).
  const baselineWorktree = `${repositoryRoot}-baseline`
  const node = (script, scriptArgs) => run('node', [script, ...scriptArgs], {cwd: repositoryRoot})
  // Units count sequentially inside one dedicated counting worktree, so each
  // unit starts from a clean slate: untracked translation state from the
  // previous unit would change candidate selection. The repository is the
  // dispatcher's throwaway worktree; restore --exact handles tracked files.
  for (const untracked of ['.translation-cache', 'tmp']) {
    fs.rmSync(path.join(repositoryRoot, untracked), {recursive: true, force: true})
  }
  try {
    run('git', ['fetch', '--no-tags', 'origin', sourceBaselineSha, sourceCheckpointSha, targetBaselineSha], {cwd: repositoryRoot})
    run('git', ['merge-base', '--is-ancestor', sourceBaselineSha, sourceCheckpointSha], {cwd: repositoryRoot})
    run('git', ['worktree', 'add', '--detach', baselineWorktree, targetBaselineSha], {cwd: repositoryRoot})
    run('bash', ['scripts/restore-generated-state.sh', '--exact', '--ref', sourceCheckpointSha, '--except', restoreExceptForTarget(target)], {cwd: repositoryRoot})
    node('scripts/translation/materialize-translation-baseline.js', [
      '--repository', repositoryRoot,
      '--baseline', baselineWorktree,
      '--target', target,
      '--group', group,
    ])
    fs.mkdirSync(path.join(repositoryRoot, 'tmp'), {recursive: true})
    // Mirror prepare exactly: only the ja-JP cache file is bootstrapped; the
    // zh-CN-reference counting path reads generated manifests, not this cache.
    if (target === 'ja-JP') {
      fs.mkdirSync(path.join(repositoryRoot, '.translation-cache'), {recursive: true})
      const cacheFile = path.join(repositoryRoot, '.translation-cache', 'ja-JP.json')
      if (!fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, '{"files":{}}\n')
    }
    node('scripts/translation/sourceChanges.js', [
      '--repository', repositoryRoot,
      '--source-baseline-sha', sourceBaselineSha,
      '--source-checkpoint-sha', sourceCheckpointSha,
      '--target', target,
      '--group', group,
      '--output', 'tmp/dispatch-source-changes.json',
    ])
    const effectiveMode = node('scripts/translation/bootstrap-state.js', [
      'resolve', '--target', target, '--group', group, '--mode', mode, '--summary-file', 'tmp/dispatch-bootstrap-decision.json',
    ]).trim()
    const countLine = node('scripts/translation/manifest.js', [
      '--target', target,
      '--group', group,
      '--source-checkpoint-sha', sourceCheckpointSha,
      '--source-changes', 'tmp/dispatch-source-changes.json',
      '--mode', effectiveMode,
      '--count-only', 'true',
    ]).trim().split('\n').filter(line => line.startsWith('[translation-manifest-count] ')).pop()
    if (!countLine) throw new Error('manifest --count-only produced no count line')
    const summary = JSON.parse(countLine.slice('[translation-manifest-count] '.length))
    return {unitKey: `translation/${target}/${group}`, target, group, effectiveMode, pendingCount: summary.pendingCount, candidateCounts: summary.candidateCounts}
  } finally {
    run('git', ['worktree', 'remove', '--force', baselineWorktree], {cwd: repositoryRoot})
  }
}

function main() {
  const args = parseArguments(process.argv.slice(2))
  const summary = countPendingUnit({
    repository: args.get('--repository'),
    target: args.get('--target'),
    group: args.get('--group'),
    sourceBaselineSha: args.get('--source-baseline-sha'),
    sourceCheckpointSha: args.get('--source-checkpoint-sha'),
    targetBaselineSha: args.get('--target-baseline-sha'),
    mode: args.get('--mode') || 'auto',
  })
  console.log(`[translation-pending-count] ${JSON.stringify(summary)}`)
}

module.exports = {countPendingUnit, restoreExceptForTarget}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(String(error && error.message || error))
    process.exitCode = 1
  }
}
