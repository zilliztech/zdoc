#!/usr/bin/env node

const { spawn } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const { realpathSync } = require('node:fs')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { loadEnv } = require('./env')
const { loadLarkDocsConfig } = require('./manualConfig')
const { resolveDocToken } = require('./baseResolver')
const { buildPublishJobPlan, renderPlan, shellQuote } = require('./publishJob')
const {
  buildRouterPayload,
  normalizeRouterDecision,
  textFromRouterDecision,
} = require('./routerAgent')
const { buildBridgeWorkflowPlan, renderBridgePlan } = require('./bridgeWorkflows')

loadEnv()

function parseArgs(argv) {
  const args = { dryRun: true, listen: null }
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i]
    if (item === '--message') args.message = argv[++i]
    else if (item === '--stdin') args.stdin = true
    else if (item === '--listen') args.listen = argv[++i] || 'local'
    else if (item === '--execute') args.dryRun = false
    else if (item === '--dry-run') args.dryRun = true
    else if (item === '--config') args.config = argv[++i]
    else if (item === '--sdk') args.listen = 'sdk'
    else if (item === '--local') args.listen = 'local'
    else if (item === '--help' || item === '-h') args.help = true
  }
  return args
}

function usage() {
  return `Usage:
  node scripts/doc-publish-bot/index.js --message "<Feishu request>" [--dry-run]
  node scripts/doc-publish-bot/index.js --stdin [--dry-run]
  node scripts/doc-publish-bot/index.js --listen local [--execute]
  node scripts/doc-publish-bot/index.js --listen sdk

Default mode is dry-run. Use --execute only after the bot host has git, lark-cli, pnpm, Jenkins credentials, and agent tooling configured.`
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let text = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', chunk => { text += chunk })
    process.stdin.on('end', () => resolve(text))
    process.stdin.on('error', reject)
  })
}

function runCommand(argv, options = {}) {
  const hasStdin = options.stdin !== undefined
  let stdio = options.stdio || ['ignore', 'pipe', 'pipe']
  if (hasStdin) {
    stdio = Array.isArray(stdio)
      ? ['pipe', ...stdio.slice(1)]
      : ['pipe', stdio, stdio]
  }
  return runSubprocess({
    file: argv[0],
    args: argv.slice(1),
    spawnOptions: {
      stdio,
      cwd: options.cwd,
      env: options.replaceEnv ? { ...(options.env || {}) } : { ...process.env, ...(options.env || {}) },
    },
    input: hasStdin ? options.stdin : undefined,
    label: shellQuote(argv),
    timeoutMs: options.timeoutMs,
    maxOutputBytes: options.maxOutputBytes,
    terminationGraceMs: options.terminationGraceMs,
  })
}

function signalProcess(child, signal, detached) {
  try {
    if (process.platform !== 'win32' && detached && child.pid) process.kill(-child.pid, signal)
    else child.kill(signal)
  } catch (error) {
    if (error.code !== 'ESRCH') throw error
  }
}

function runSubprocess({
  file,
  args = [],
  spawnOptions,
  input,
  label,
  timeoutMs,
  maxOutputBytes,
  terminationGraceMs = 2000,
}) {
  return new Promise((resolve, reject) => {
    const detached = process.platform !== 'win32'
    const child = spawn(file, args, { ...spawnOptions, detached })
    let stdout = ''
    let stderr = ''
    let terminationError = null
    let processError = null
    let closed = false
    let timeoutTimer = null
    let killTimer = null

    const clearTimers = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer)
      if (killTimer) clearTimeout(killTimer)
    }
    const terminate = error => {
      if (terminationError || closed) return
      terminationError = error
      try {
        signalProcess(child, 'SIGTERM', detached)
      } catch (signalError) {
        processError ||= signalError
      }
      killTimer = setTimeout(() => {
        if (closed) return
        try {
          signalProcess(child, 'SIGKILL', detached)
        } catch (signalError) {
          processError ||= signalError
        }
      }, terminationGraceMs)
    }
    const collect = (current, chunk) => {
      if (!maxOutputBytes) return current + chunk.toString('utf8')
      return appendLimited(current, chunk, { maxOutputBytes, label })
    }
    child.stdout?.on('data', chunk => {
      try { stdout = collect(stdout, chunk) } catch (error) { terminate(error) }
    })
    child.stderr?.on('data', chunk => {
      try { stderr = collect(stderr, chunk) } catch (error) { terminate(error) }
    })
    child.on('error', error => { processError ||= error })
    child.on('close', (code, signal) => {
      if (closed) return
      closed = true
      clearTimers()
      if (terminationError) {
        reject(terminationError)
        return
      }
      if (processError) {
        reject(processError)
        return
      }
      if (code !== 0) {
        const result = code === null ? `signal ${signal}` : `code ${code}`
        reject(new Error(`${label} failed with ${result}: ${stderr.trim()}`))
        return
      }
      resolve({ stdout, stderr })
    })
    if (timeoutMs) {
      timeoutTimer = setTimeout(() => {
        terminate(new Error(`${label} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }
    if (input !== undefined && child.stdin) {
      child.stdin.on('error', error => {
        if (error.code !== 'EPIPE') terminate(error)
      })
      try {
        child.stdin.end(input)
      } catch (error) {
        if (error.code !== 'EPIPE') terminate(error)
      }
    }
  })
}

function appendLimited(current, chunk, { maxOutputBytes, label }) {
  const next = current + chunk.toString('utf8')
  if (Buffer.byteLength(next, 'utf8') > maxOutputBytes) {
    throw new Error(`${label} exceeded output limit of ${maxOutputBytes} bytes`)
  }
  return next
}

function positiveIntegerEnv(name, fallback) {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value > 0 ? value : fallback
}

async function runBoundedShellCommand({
  command,
  input,
  label,
  timeoutMs,
  maxOutputBytes,
  terminationGraceMs,
}) {
  const { stdout } = await runSubprocess({
    file: command,
    spawnOptions: {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    },
    input,
    label,
    timeoutMs,
    maxOutputBytes,
    terminationGraceMs,
  })
  return stdout.trim()
}

async function runAgentHook(plan) {
  const command = process.env.DOC_PUBLISH_AGENT_COMMAND
  if (!command) return null
  return runBoundedShellCommand({
    command,
    input: JSON.stringify(plan, null, 2),
    label: 'DOC_PUBLISH_AGENT_COMMAND',
    timeoutMs: positiveIntegerEnv('DOC_PUBLISH_AGENT_TIMEOUT_MS', 10 * 60 * 1000),
    maxOutputBytes: positiveIntegerEnv('DOC_PUBLISH_AGENT_MAX_OUTPUT_BYTES', 512 * 1024),
  })
}

async function runRouterAgent({ text, event }) {
  const command = process.env.DOC_PUBLISH_ROUTER_AGENT_COMMAND
  if (!command) return null
  const payload = buildRouterPayload({ text, event })
  const stdout = await runBoundedShellCommand({
    command,
    input: JSON.stringify(payload, null, 2),
    label: 'DOC_PUBLISH_ROUTER_AGENT_COMMAND',
    timeoutMs: positiveIntegerEnv('DOC_PUBLISH_ROUTER_TIMEOUT_MS', 30 * 1000),
    maxOutputBytes: positiveIntegerEnv('DOC_PUBLISH_ROUTER_MAX_OUTPUT_BYTES', 64 * 1024),
  })
  try {
    return normalizeRouterDecision(stdout)
  } catch (error) {
    throw new Error(`invalid router-agent output: ${error.message}`)
  }
}

function buildJenkinsCommand(jenkins) {
  const argv = [
    'curl', '--fail-with-body', '--silent', '--show-error', '-X', 'POST',
    jenkins.url,
    '--user', `${process.env.JENKINS_USER || ''}:${process.env.JENKINS_TOKEN || ''}`,
  ]
  for (const [key, value] of Object.entries(jenkins.params)) {
    argv.push('--data-urlencode', `${key}=${value}`)
  }
  return argv
}

async function triggerJenkins(jenkins) {
  return runCommand(buildJenkinsCommand(jenkins))
}

function assertPlanAllowedForExecution(plan) {
  if (plan.environment === 'production' && !plan.approved) {
    throw new Error('production publish requires explicit approval in the Feishu request')
  }
}

async function assertWorkingTreeClean({ run = runCommand } = {}) {
  if (process.env.DOC_PUBLISH_ALLOW_DIRTY_WORKTREE === '1') return
  const { stdout } = await run(['git', 'status', '--porcelain'])
  if (stdout.trim()) {
    throw new Error('refusing to execute publish with a dirty git worktree; commit/stash changes or set DOC_PUBLISH_ALLOW_DIRTY_WORKTREE=1')
  }
}

async function executePlan(plan) {
  assertPlanAllowedForExecution(plan)
  await assertWorkingTreeClean()
  for (const command of plan.branchCommands) await runCommand(command, { stdio: 'inherit' })
  await runAgentHook(plan)
  for (const command of plan.docusaurusCommands) await runCommand(command, { stdio: 'inherit' })
  for (const command of plan.buildCommands) {
    await runCommand(command, {
      stdio: 'inherit',
      env: { LINK_CHECKS_REMOTE_BASE_URL: 'https://docs.zilliz.com' },
    })
  }
  await triggerJenkins(plan.jenkins)
}

function validateBridgeCommands(commands) {
  if (!Array.isArray(commands)) throw new Error('bridge plan commands must be an array')
  for (const command of commands) {
    if (!Array.isArray(command) || command.length === 0) {
      throw new Error('bridge plan command must be an argv array')
    }
  }
}

async function assertTempDirCanBeCreated(tempDir) {
  const resolved = path.resolve(tempDir)
  const tmpRoot = realpathSync(os.tmpdir())
  let canonicalParent
  try {
    canonicalParent = realpathSync(path.dirname(resolved))
  } catch {
    throw new Error(`bridge temp dir must be a direct child of the system temp directory: ${tempDir}`)
  }
  if (canonicalParent !== tmpRoot) {
    throw new Error(`bridge temp dir must be a direct child of the system temp directory: ${tempDir}`)
  }
  try {
    const stats = await fs.lstat(resolved)
    if (stats.isSymbolicLink()) throw new Error(`bridge temp dir must not be a symlink: ${tempDir}`)
    throw new Error(`bridge temp dir already exists: ${tempDir}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  return resolved
}

async function executeBridgePlan(plan, {
  run = runCommand,
  mkdir = (dir, options) => fs.mkdir(dir, options),
  cleanup = dir => fs.rm(dir, { recursive: true, force: true }),
} = {}) {
  validateBridgeCommands(plan?.commands)
  const tempDirs = Array.isArray(plan.tempDirs) ? plan.tempDirs : []
  const validatedTempDirs = []
  for (const tempDir of tempDirs) validatedTempDirs.push(await assertTempDirCanBeCreated(tempDir))

  const createdTempDirs = []
  const subprocessEnv = buildBridgeSubprocessEnv(plan)
  const stdout = []
  let result
  let primaryError
  try {
    for (const tempDir of validatedTempDirs) {
      await mkdir(tempDir, { mode: 0o700 })
      createdTempDirs.push(tempDir)
    }
    for (let index = 0; index < plan.commands.length; index++) {
      const options = {
        cwd: plan.cwd,
        maxOutputBytes: positiveIntegerEnv('DOC_PUBLISH_BRIDGE_MAX_OUTPUT_BYTES', 512 * 1024),
        timeoutMs: positiveIntegerEnv('DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS', 10 * 60 * 1000),
        env: subprocessEnv,
        replaceEnv: true,
      }
      if (index === 0 && plan.stdin !== null && plan.stdin !== undefined) options.stdin = plan.stdin
      const result = await run(plan.commands[index], options)
      stdout.push(result.stdout)
    }
    result = { stdout }
  } catch (error) {
    primaryError = error
  }

  const cleanupErrors = []
  for (const tempDir of createdTempDirs.reverse()) {
    try {
      await cleanup(tempDir)
    } catch (error) {
      cleanupErrors.push(error)
    }
  }
  if (cleanupErrors.length) {
    if (primaryError) {
      throw new AggregateError(cleanupErrors, `${primaryError.message}; bridge temp dir cleanup failed`, {
        cause: primaryError,
      })
    }
    throw new AggregateError(cleanupErrors, 'bridge temp dir cleanup failed')
  }
  if (primaryError) throw primaryError
  return result
}

function buildBridgeSubprocessEnv(plan, sourceEnv = process.env) {
  const names = new Set(['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'LANG'])
  for (const name of Object.keys(sourceEnv)) {
    if (name.startsWith('LC_')) names.add(name)
  }
  for (const name of plan?.envAllowlist || []) names.add(name)

  const env = {}
  for (const name of names) {
    if (sourceEnv[name] !== undefined) env[name] = sourceEnv[name]
  }
  return { ...env, ...(plan?.env || {}) }
}

async function createPlanFromText(text, configPath) {
  const manuals = loadLarkDocsConfig(configPath)
  return buildPublishJobPlan({
    text,
    resolveDoc: (docToken, docRef) => resolveDocToken({ manuals, docToken, docLink: docRef?.link }),
  })
}

function eventText(event) {
  return event?.content ||
    event?.text ||
    event?.message?.content ||
    event?.event?.message?.content ||
    event?.event?.content ||
    ''
}

function eventMessageId(event) {
  return event?.message_id ||
    event?.message?.message_id ||
    event?.event?.message?.message_id ||
    null
}

async function replyToMessage(messageId, text) {
  if (!messageId) return
  await runCommand([
    'lark-cli', 'im', '+messages-reply',
    '--message-id', messageId,
    '--markdown', text,
    '--as', 'bot',
    '--idempotency-key', randomUUID(),
  ])
}

function errorReplyText(error) {
  return `发布请求处理失败: ${error.message}`
}

function buildReactionCommand(messageId, emojiType = process.env.DOC_PUBLISH_ACK_EMOJI_TYPE || 'Typing') {
  return [
    'lark-cli', 'im', 'reactions', 'create',
    '--message-id', messageId,
    '--data', JSON.stringify({ reaction_type: { emoji_type: emojiType } }),
    '--as', 'bot',
  ]
}

async function reactToMessage(messageId) {
  if (!messageId) return
  await runCommand(buildReactionCommand(messageId))
}

async function handleText(text, { dryRun, configPath, messageId, reply = true } = {}) {
  const plan = await createPlanFromText(text, configPath)
  if (dryRun) {
    const rendered = renderPlan(plan)
    if (reply && messageId) await replyToMessage(messageId, `Dry run:\n\n\`\`\`\n${rendered}\n\`\`\``)
    return rendered
  }
  await executePlan(plan)
  const url = plan.environment === 'production' ? plan.urls.production : plan.urls.uat
  const summary = `已触发发布:\n- URL: ${url}\n- Branch: ${plan.branch}\n- Docs: ${plan.docs.map(doc => doc.title).join(', ')}\n- Jenkins: ${plan.jenkins.url}`
  if (reply && messageId) await replyToMessage(messageId, summary)
  return summary
}

async function handleEvent(event, {
  dryRun,
  configPath,
  reply = true,
  router = runRouterAgent,
  decisionText = textFromRouterDecision,
  publish = handleText,
  buildBridgePlan = buildBridgeWorkflowPlan,
  renderBridge = renderBridgePlan,
  executeBridge = executeBridgePlan,
  react = reactToMessage,
  replyMessage = replyToMessage,
} = {}) {
  const text = eventText(event)
  const messageId = eventMessageId(event)
  try {
    await react(messageId)
  } catch (error) {
    console.error(`[doc-publish-bot] failed to add ack reaction: ${error.message}`)
  }
  const decision = await router({ text, event })
  if (decision?.intent === 'ignore') return null
  if (decision && decision.intent !== 'publish_docs') {
    const plan = buildBridgePlan(decision)
    if (dryRun) {
      const rendered = renderBridge(plan)
      if (reply && messageId) await replyMessage(messageId, `Dry run:\n\n\`\`\`\n${rendered}\n\`\`\``)
      return rendered
    }
    const result = await executeBridge(plan)
    const summary = result.stdout.map(output => output.trim()).filter(Boolean).join('\n')
    if (reply && messageId) await replyMessage(messageId, summary)
    return summary
  }
  const routedText = decision ? decisionText(decision, { originalText: text }) : text
  return publish(routedText, { dryRun, configPath, messageId, reply })
}

async function replyToEventError(event, error) {
  const messageId = eventMessageId(event)
  if (!messageId) return
  try {
    await replyToMessage(messageId, errorReplyText(error))
  } catch (replyError) {
    console.error(`[doc-publish-bot] failed to reply with error: ${replyError.message}`)
  }
}

function createSerialQueue() {
  let tail = Promise.resolve()
  return function enqueue(task) {
    const next = tail.then(task, task)
    tail = next.catch(() => {})
    return next
  }
}

function isRelevantBotMessage(text) {
  const value = String(text || '')
  return /@/.test(value) ||
    /\b(?:publish|verify|check|sync|draft|patch|sdk|docs?|code\s+examples?)\b/i.test(value) ||
    /(?:发布|验证|校验|检查|同步|起草|草拟|修复|补丁|代码示例|文档)/.test(value)
}

async function listenLocal({ dryRun, configPath }) {
  const child = spawn('lark-cli', ['event', 'consume', 'im.message.receive_v1', '--as', 'bot'], {
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
          const text = eventText(event)
          if (!isRelevantBotMessage(text)) return
          await enqueue(async () => {
            try {
              await handleEvent(event, { dryRun, configPath })
            } catch (error) {
              await replyToEventError(event, error)
              throw error
            }
          })
        })
        .catch(error => {
          console.error(`[doc-publish-bot] ${error.stack || error.message}`)
        })
    }
  })
  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`lark-cli event consume exited with code ${code}`))
    })
  })
}

async function listenSdk({ dryRun, configPath } = {}) {
  let lark
  try {
    lark = require('@larksuiteoapi/node-sdk')
  } catch {
    throw new Error('SDK mode requires @larksuiteoapi/node-sdk. Install it before running --listen sdk.')
  }
  if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
    throw new Error('SDK mode requires FEISHU_APP_ID and FEISHU_APP_SECRET')
  }
  if (typeof lark.createLarkChannel !== 'function') {
    throw new Error('@larksuiteoapi/node-sdk does not expose createLarkChannel; use SDK version 1.24.0 or later')
  }

  const channel = lark.createLarkChannel({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
  })
  const onMessage = createSdkMessageHandler({
    dryRun,
    configPath,
    send: (...args) => channel.send(...args),
  })
  channel.on('message', onMessage)
  await channel.connect()
}

function createSdkMessageHandler({
  dryRun,
  configPath,
  enqueue = createSerialQueue(),
  handle = handleEvent,
  send,
} = {}) {
  return async function handleSdkMessage(message) {
    const text = message.content || ''
    if (!isRelevantBotMessage(text)) return null
    return enqueue(async () => {
      try {
        const result = await handle({
          content: text,
          message_id: message.messageId,
          chat_id: message.chatId,
        }, { dryRun, configPath, reply: false })
        if (!result) return null
        const prefix = dryRun ? 'Dry run:' : '已处理发布请求:'
        await send(message.chatId, { markdown: `${prefix}\n\n\`\`\`\n${result}\n\`\`\`` }, { replyTo: message.messageId })
        return result
      } catch (error) {
        await send(message.chatId, { markdown: `发布请求解析失败: ${error.message}` }, { replyTo: message.messageId })
        return null
      }
    })
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(usage())
    return
  }
  if (args.listen === 'local') {
    await listenLocal({ dryRun: args.dryRun, configPath: args.config })
    return
  }
  if (args.listen === 'sdk') {
    await listenSdk({ dryRun: args.dryRun, configPath: args.config })
    return
  }

  const text = args.stdin ? await readStdin() : args.message
  if (!text) throw new Error(`missing request text\n\n${usage()}`)
  const result = await handleText(text, { dryRun: args.dryRun, configPath: args.config })
  console.log(result)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message)
    process.exit(1)
  })
}

module.exports = {
  assertWorkingTreeClean,
  assertPlanAllowedForExecution,
  buildBridgeSubprocessEnv,
  buildJenkinsCommand,
  buildReactionCommand,
  createSerialQueue,
  createSdkMessageHandler,
  errorReplyText,
  executeBridgePlan,
  eventMessageId,
  eventText,
  handleEvent,
  handleText,
  isRelevantBotMessage,
  listenSdk,
  listenLocal,
  runAgentHook,
  runBoundedShellCommand,
  runCommand,
  runRouterAgent,
  positiveIntegerEnv,
}
