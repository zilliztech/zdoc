#!/usr/bin/env node
'use strict'

// Single-turn REST refresh agent runner (design §8.1/§8.6). The codex thread
// is anchored in the prepared staging directory: its working context is the
// staged diff, fragment copies, ruleset, and instruction pack only. The agent
// produces a schema'd change-set.json; it never edits fragment files and never
// sees the repository. Sandbox mode is danger-full-access because codex
// workspace-write needs a bubblewrap network namespace that GitHub-hosted
// runners reject (translation pipeline run 37935550408) — this is context
// isolation, not a write barrier; the deterministic applier is the gate.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const TOOLING_ROOT = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest')
const {loadChangeSet, verifyAgainstDiff} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'changeSet'))

const REASONING_EFFORTS = Object.freeze(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'ultra', 'max'])
const DEFAULT_REASONING_EFFORT = 'medium'
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000

function usage() {
    return 'Usage: node scripts/rest-upstream/rest-refresh-agent.js --staging <dir> --model <id> --base-url <url> [--api-key-env AGENTIC_PROVIDER_API_KEY] [--reasoning-effort medium] [--codex-home <dir>] [--timeout-ms 1200000] [--fresh]'
}

function fail(message) {
    throw new Error(message)
}

function parseArgs(argv) {
    const args = new Map()
    let index = 0
    while (index < argv.length) {
        const key = argv[index]
        const next = argv[index + 1]
        if (!key.startsWith('--')) fail(usage())
        // Boolean flags (--fresh) have no value token.
        if (next === undefined || next.startsWith('--')) {
            args.set(key.slice(2), 'true')
            index += 1
        } else {
            args.set(key.slice(2), next)
            index += 2
        }
    }
    return args
}

function codexThreadConfig({baseUrl, reasoningEffort}) {
    if (!REASONING_EFFORTS.includes(reasoningEffort)) fail(`reasoning effort must be one of ${REASONING_EFFORTS.join(', ')}`)
    return {
        model_provider: 'agenticgateway',
        model_reasoning_effort: reasoningEffort,
        model_reasoning_summary: 'none',
        model_providers: {
            agenticgateway: {name: 'agentic gateway', base_url: baseUrl, env_key: 'AGENTIC_PROVIDER_KEY', wire_api: 'responses', query_params: {}},
        },
    }
}

// The composed prompt names staging-relative paths only; the isolation sweep in
// rest-upstream-prepare guarantees no repository path exists in any staged
// file, and this prompt adds none of its own.
function agentPrompt() {
    return [
        'You are operating inside a prepared staging directory for a REST documentation refresh.',
        'Read INSTRUCTIONS.md in the current working directory and execute it exactly.',
        'Write the completed change set to change-set.json in the current working directory.',
        'Do not read, write, or reference anything outside the current working directory.',
    ].join(' ')
}

async function runRefreshAgent({staging, model, baseUrl, apiKey, reasoningEffort = DEFAULT_REASONING_EFFORT, codexHome = null, timeoutMs = DEFAULT_TIMEOUT_MS, fresh = false, loadSdk = () => import('@openai/codex-sdk')}) {
    const stagingDir = path.resolve(staging)
    if (!fs.existsSync(path.join(stagingDir, 'INSTRUCTIONS.md'))) fail(`REST_UPSTREAM_AGENT_STAGING_INCOMPLETE: ${stagingDir} has no INSTRUCTIONS.md; run rest-upstream-prepare first`)
    const diffPath = path.join(stagingDir, 'diff', 'diff.json')
    if (!fs.existsSync(diffPath)) fail(`REST_UPSTREAM_AGENT_STAGING_INCOMPLETE: ${stagingDir} has no diff/diff.json`)
    const changeSetPath = path.join(stagingDir, 'change-set.json')
    if (fs.existsSync(changeSetPath) && !fresh) fail('REST_UPSTREAM_AGENT_STALE_OUTPUT: change-set.json already exists; pass --fresh to overwrite it')

    const {Codex} = await loadSdk()
    if (codexHome) fs.mkdirSync(path.resolve(codexHome), {recursive: true})
    const codex = new Codex({
        config: codexThreadConfig({baseUrl, reasoningEffort}),
        env: Object.fromEntries(Object.entries({
            PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
            HOME: process.env.HOME || path.join(os.tmpdir(), 'rest-refresh-agent-home'),
            LANG: process.env.LANG || 'en_US.UTF-8',
            TMPDIR: process.env.TMPDIR || os.tmpdir(),
            ...(codexHome ? {CODEX_HOME: codexHome} : {}),
            AGENTIC_PROVIDER_KEY: apiKey,
        }).filter(([, value]) => value !== undefined)),
    })
    const thread = codex.startThread({model, sandboxMode: 'danger-full-access', workingDirectory: stagingDir, approvalPolicy: 'never', skipGitRepoCheck: true})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('REST_UPSTREAM_AGENT_TIMEOUT: agent turn exceeded --timeout-ms')), timeoutMs)
    let finalResponse = ''
    try {
        const turn = await thread.run(agentPrompt(), {signal: controller.signal})
        finalResponse = String(turn.finalResponse || '')
    } finally {
        clearTimeout(timer)
    }

    if (!fs.existsSync(changeSetPath)) fail(`REST_UPSTREAM_AGENT_NO_OUTPUT: agent did not write change-set.json; final message: ${finalResponse.slice(0, 600)}`)
    const changeSet = loadChangeSet(changeSetPath)
    const diffDocument = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
    verifyAgainstDiff(changeSet, diffDocument)

    const report = {
        schemaVersion: '1.0',
        source: changeSet.source,
        diffDigest: changeSet.diffDigest,
        entryCount: changeSet.entries.length,
        finalResponse,
    }
    fs.writeFileSync(path.join(stagingDir, 'agent-report.json'), `${JSON.stringify(report, null, 2)}\n`)
    return report
}

async function main(argv) {
    const args = parseArgs(argv)
    const staging = args.get('staging')
    const model = args.get('model')
    const baseUrl = args.get('base-url')
    if (!staging || !model || !baseUrl) fail(usage())
    const apiKeyEnv = args.get('api-key-env') || 'AGENTIC_PROVIDER_API_KEY'
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_AGENT_KEY_MISSING: ${apiKeyEnv} is not set`)
    const report = await runRefreshAgent({
        staging,
        model,
        baseUrl,
        apiKey,
        reasoningEffort: args.get('reasoning-effort') || DEFAULT_REASONING_EFFORT,
        codexHome: args.get('codex-home'),
        timeoutMs: args.get('timeout-ms') ? Number(args.get('timeout-ms')) : DEFAULT_TIMEOUT_MS,
        fresh: args.get('fresh') === 'true',
    })
    console.log(`agent change-set accepted: ${report.entryCount} entr(ies), diff ${report.diffDigest}`)
}

if (require.main === module) {
    main(process.argv.slice(2)).catch(error => {
        console.error(String(error?.message || error))
        process.exitCode = 1
    })
}

module.exports = {runRefreshAgent, agentPrompt, codexThreadConfig, parseArgs, usage}
