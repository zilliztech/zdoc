#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFile, spawn} = require('node:child_process')
const {randomUUID} = require('node:crypto')
const {promisify} = require('node:util')
const {createPublicationGitHubClient} = require('./publication-github-client')
const {findExactFile} = require('./github-artifact-archive')
const {
  approvalReceiptFromReview,
  buildProcessedCard,
  parseCardActionTrigger,
  parseReviewActionValue,
  rejectionEvidenceFromReview,
  retirementReviewArtifactName,
  reviewStateArtifactName,
  validateRejectionEvidence,
} = require('./reconciliation-card-action')
const {createDurablePolicyExceptionPullRequest} = require('./reconciliation-policy-exception-pr')
const {validateReviewArtifact} = require('./reconciliation-review-pr')
const {validateReviewState} = require('../translation/reconciliation-review-state')
const DIGEST = /^sha256:[0-9a-f]{64}$/u
const execFileAsync = promisify(execFile)
const DEFAULT_LARK_UPDATE_TIMEOUT_MS = 30_000

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`)
  return value.trim()
}

function boundedLog(message) {
  return String(message || '').replace(/[\r\n]+/g, ' ').slice(0, 240)
}

function atomicWrite(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {mode: 0o600})
  fs.renameSync(temporary, file)
}

function safeFileName(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 160) || 'event'
}

function readReviewFile(archive, fileName, validate) {
  const file = findExactFile(archive.directory, fileName)
  return validate(JSON.parse(fs.readFileSync(file, 'utf8')))
}

function assertStateMatchesPayload(state, payload) {
  if (state.planSha256 !== payload.planSha256 || state.target !== payload.target || state.group !== payload.group ||
      state.runId !== payload.runId || state.runAttempt !== payload.runAttempt ||
      state.batchNumber !== payload.batchNumber || state.reviewArtifactSha256 !== payload.reviewArtifactSha256) {
    throw new Error('Review state artifact does not match the button callback identity')
  }
  return state
}

function assertReviewMatchesState(review, state) {
  if (review.planSha256 !== state.planSha256 || review.target !== state.target || review.group !== state.group ||
      review.reviewArtifactSha256 !== state.reviewArtifactSha256) {
    throw new Error('Review artifact does not match the review state identity')
  }
  return review
}

function createSerialQueue() {
  let tail = Promise.resolve()
  return function enqueue(task) {
    const next = tail.then(task, task)
    tail = next.catch(() => {})
    return next
  }
}

function createLarkCardUpdater({
  environment = process.env,
  execute = execFileAsync,
  timeoutMs = environment.LARK_CARD_UPDATE_TIMEOUT_MS || DEFAULT_LARK_UPDATE_TIMEOUT_MS,
} = {}) {
  return async ({token, cardContent, decision, operatorId}) => {
    const card = buildProcessedCard(cardContent, decision, operatorId)
    await execute('lark-cli', [
      'api', 'POST', '/open-apis/interactive/v1/card/update', '--as', 'bot',
      '--data', JSON.stringify({token, card}),
    ], {
      env: {
        ...environment,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
      },
      timeout: Number.isFinite(Number(timeoutMs)) ? Number(timeoutMs) : DEFAULT_LARK_UPDATE_TIMEOUT_MS,
      killSignal: 'SIGKILL',
    })
  }
}

function createReconciliationCardActionConsumer({
  repository,
  createClient,
  evidenceRoot,
  now = () => new Date(),
  log = message => process.stdout.write(`${message}\n`),
  persist = async () => {},
  updateCard = async () => {},
  createPullRequest = async () => null,
}) {
  if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('repository is invalid')
  if (typeof createClient !== 'function') throw new Error('createClient must be a function')
  const evidence = path.resolve(evidenceRoot || path.join(process.cwd(), 'tmp', 'reconciliation-card-actions'))

  async function loadReviewState(payload) {
    const client = createClient({runId: payload.runId, runAttempt: payload.runAttempt})
    const archive = await client.downloadArtifactArchive(reviewStateArtifactName(payload))
    try {
      return assertStateMatchesPayload(readReviewFile(archive, 'translation-reconciliation-review-state.json', validateReviewState), payload)
    } finally {
      fs.rmSync(archive.directory, {recursive: true, force: true})
    }
  }

  async function loadReviewArtifact(payload, state) {
    const client = createClient({runId: payload.runId, runAttempt: payload.runAttempt})
    const archive = await client.downloadArtifactArchive(retirementReviewArtifactName(payload))
    try {
      return assertReviewMatchesState(readReviewFile(archive, 'translation-reconciliation-review.json', validateReviewArtifact), state)
    } finally {
      fs.rmSync(archive.directory, {recursive: true, force: true})
    }
  }

  function decisionFile(payload, eventId) {
    return path.join(evidence, payload.target, payload.group, String(payload.runId), String(payload.batchNumber), `${payload.action}-${safeFileName(eventId)}.json`)
  }

  function buildDecision({payload, eventId, operatorId, state, reviewArtifact}) {
    const issuedAt = now().toISOString()
    if (payload.action === 'approve') {
      const receipt = approvalReceiptFromReview({
        reviewArtifact,
        reviewer: operatorId,
        issuedAt,
        expiresAt: new Date(Date.parse(issuedAt) + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      return {action: 'approve', receipt}
    }
    return {
      action: 'reject',
      rejection: rejectionEvidenceFromReview({
        reviewArtifact,
        reviewState: state,
        reviewer: operatorId,
        issuedAt,
      }),
    }
  }

  async function handleEvent(event) {
    const trigger = parseCardActionTrigger(event)
    const payload = parseReviewActionValue(trigger.actionValue)
    const file = decisionFile(payload, trigger.eventId)
    if (fs.existsSync(file)) {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (existing.action === 'approve') {
        if (!existing.receipt || !DIGEST.test(existing.receipt.receiptSha256 || '')) throw new Error('Retained approval decision is invalid')
      } else {
        validateRejectionEvidence(existing.rejection)
      }
      log(`reconciliation card action already processed event=${trigger.eventId} action=${payload.action}`)
      return {alreadyProcessed: true, ...existing, operatorId: trigger.operatorId, token: trigger.token, messageId: trigger.messageId, chatId: trigger.chatId}
    }
    const state = await loadReviewState(payload)
    const reviewArtifact = await loadReviewArtifact(payload, state)
    const decision = buildDecision({payload, eventId: trigger.eventId, operatorId: trigger.operatorId, state, reviewArtifact})
    atomicWrite(file, decision)
    await persist(decision)
    let pullRequest = null
    if (decision.action === 'approve' && createPullRequest) {
      try {
        pullRequest = await createPullRequest({
          reviewArtifact,
          sourceRunId: state.runId,
          reviewer: trigger.operatorId,
          approvedAt: decision.receipt.issuedAt,
        })
      } catch (error) {
        log(`durable policy exception PR unavailable; approval receipt retained event=${trigger.eventId} error=${boundedLog(error?.message || error)}`)
      }
    }
    if (trigger.cardContent && trigger.token) {
      try {
        await updateCard({
          token: trigger.token,
          cardContent: trigger.cardContent,
          decision,
          operatorId: trigger.operatorId,
        })
      } catch (error) {
        log(`reconciliation card update unavailable; evidence retained event=${trigger.eventId} error=${boundedLog(error?.message || error)}`)
      }
    }
    log(`reconciliation card action processed event=${trigger.eventId} action=${payload.action} plan=${payload.planSha256}`)
    return {
      alreadyProcessed: false,
      ...decision,
      operatorId: trigger.operatorId,
      token: trigger.token,
      messageId: trigger.messageId,
      chatId: trigger.chatId,
      pullRequest,
    }
  }

  return {handleEvent}
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    return {help: true}
  }
  const args = {
    repository: process.env.GITHUB_REPOSITORY || '',
    token: process.env.GITHUB_TOKEN || '',
    evidenceRoot: path.join(process.cwd(), 'tmp', 'reconciliation-card-actions'),
    runnerTemp: process.env.RUNNER_TEMP || os.tmpdir(),
    durablePr: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (flag === '--durable-pr') {
      args.durablePr = true
      continue
    }
    if (!flag?.startsWith('--')) throw new Error(`Invalid argument: ${flag}`)
    const value = argv[++index]
    if (value === undefined) throw new Error(`Invalid argument: ${flag}`)
    const key = flag.slice(2)
    if (!['repository', 'token-env', 'evidence-root', 'runner-temp'].includes(key) || Object.hasOwn(args, key)) throw new Error(`Invalid or duplicated argument: ${flag}`)
    if (key === 'token-env') args.token = process.env[value] || ''
    else args[key] = value
  }
  return args
}

function usage() {
  return `Usage:
  node scripts/docs-workflow/reconciliation-card-action-consumer.js \
    --repository zilliztech/zdoc \
    --token-env GITHUB_TOKEN \
    [--evidence-root tmp/reconciliation-card-actions] \
    [--runner-temp /tmp] \
    [--durable-pr]

Environment:
  GITHUB_TOKEN       GitHub token with actions:read for the repository.
  RUNNER_TEMP        Safe temporary directory for authenticated artifact extraction.`
}

async function listenLocal({repository, token, evidenceRoot, runnerTemp, durablePr}) {
  const makeClient = ({runId, runAttempt}) => createPublicationGitHubClient({
    repository,
    token,
    runId,
    runAttempt,
    artifactTransport: 'rest',
    runnerTemp,
  })
  const consumer = createReconciliationCardActionConsumer({
    repository,
    evidenceRoot,
    createClient: makeClient,
    updateCard: createLarkCardUpdater({environment: process.env}),
    createPullRequest: durablePr
      ? ({reviewArtifact, sourceRunId, reviewer, approvedAt}) => createDurablePolicyExceptionPullRequest({
          reviewArtifact,
          sourceRunId,
          repository,
          token,
          reviewer,
          approvedAt,
        })
      : async () => null,
  })
  const child = spawn('lark-cli', ['event', 'consume', 'card.action.trigger', '--as', 'bot'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
      LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
    },
  })
  child.stdin.write('\n')
  child.stderr.on('data', chunk => process.stderr.write(chunk))
  const enqueue = createSerialQueue()
  let buffer = ''
  child.stdout.on('data', chunk => {
    buffer += chunk.toString('utf8')
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      Promise.resolve()
        .then(async () => {
          const event = JSON.parse(line)
          await enqueue(async () => {
            try {
              await consumer.handleEvent(event)
            } catch (error) {
              process.stderr.write(`[reconciliation-card-action] ${boundedLog(error?.message || error)}\n`)
            }
          })
        })
        .catch(error => {
          process.stderr.write(`[reconciliation-card-action] ${boundedLog(error?.message || error)}\n`)
        })
    }
  })
  return new Promise((resolve, reject) => {
    const stop = signal => {
      if (!child.killed) {
        try { child.kill(signal) } catch (_) {}
      }
    }
    process.once('SIGTERM', () => stop('SIGTERM'))
    process.once('SIGINT', () => stop('SIGINT'))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`lark-cli event consume exited with code ${code}`))
    })
  })
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (args.help) {
    process.stdout.write(`${usage()}\n`)
    return
  }
  const repository = required(args.repository, 'repository')
  const token = required(args.token, 'GITHUB_TOKEN')
  await listenLocal({repository, token, evidenceRoot: args.evidenceRoot, runnerTemp: args.runnerTemp, durablePr: args.durablePr})
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  createReconciliationCardActionConsumer,
  createLarkCardUpdater,
  createSerialQueue,
  parseArgs,
  required,
  safeFileName,
}
