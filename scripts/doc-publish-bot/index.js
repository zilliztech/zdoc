#!/usr/bin/env node

const { spawn } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const { loadEnv } = require('./env')
const { loadLarkDocsConfig } = require('./manualConfig')
const { resolveDocToken } = require('./baseResolver')
const { buildPublishJobPlan, renderPlan, shellQuote } = require('./publishJob')
const {
  buildRouterPayload,
  normalizeRouterDecision,
  textFromRouterDecision,
} = require('./routerAgent')

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
  return new Promise((resolve, reject) => {
    const child = spawn(argv[0], argv.slice(1), {
      stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...(options.env || {}) },
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', chunk => { stdout += chunk })
    child.stderr?.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`${shellQuote(argv)} failed with code ${code}: ${stderr.trim()}`))
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

async function runAgentHook(plan) {
  const command = process.env.DOC_PUBLISH_AGENT_COMMAND
  if (!command) return null
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`DOC_PUBLISH_AGENT_COMMAND failed with code ${code}: ${stderr.trim()}`))
        return
      }
      resolve(stdout.trim())
    })
    child.stdin.end(JSON.stringify(plan, null, 2))
  })
}

async function runRouterAgent({ text, event }) {
  const command = process.env.DOC_PUBLISH_ROUTER_AGENT_COMMAND
  if (!command) return null
  const payload = buildRouterPayload({ text, event })
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`DOC_PUBLISH_ROUTER_AGENT_COMMAND failed with code ${code}: ${stderr.trim()}`))
        return
      }
      try {
        resolve(normalizeRouterDecision(stdout))
      } catch (error) {
        reject(new Error(`invalid router-agent output: ${error.message}`))
      }
    })
    child.stdin.end(JSON.stringify(payload, null, 2))
  })
}

async function triggerJenkins(jenkins) {
  const argv = [
    'curl', '-X', 'POST',
    jenkins.url,
    '--user', `${process.env.JENKINS_USER || ''}:${process.env.JENKINS_TOKEN || ''}`,
  ]
  for (const [key, value] of Object.entries(jenkins.params)) {
    argv.push('--data-urlencode', `${key}=${value}`)
  }
  return runCommand(argv)
}

async function executePlan(plan) {
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

async function handleText(text, { dryRun, configPath, messageId } = {}) {
  const plan = await createPlanFromText(text, configPath)
  if (dryRun) {
    const rendered = renderPlan(plan)
    if (messageId) await replyToMessage(messageId, `Dry run:\n\n\`\`\`\n${rendered}\n\`\`\``)
    return rendered
  }
  await executePlan(plan)
  const url = plan.environment === 'production' ? plan.urls.production : plan.urls.uat
  const summary = `已触发发布:\n- URL: ${url}\n- Branch: ${plan.branch}\n- Docs: ${plan.docs.map(doc => doc.title).join(', ')}\n- Jenkins: ${plan.jenkins.url}`
  if (messageId) await replyToMessage(messageId, summary)
  return summary
}

async function handleEvent(event, { dryRun, configPath } = {}) {
  const text = eventText(event)
  const messageId = eventMessageId(event)
  try {
    await reactToMessage(messageId)
  } catch (error) {
    console.error(`[doc-publish-bot] failed to add ack reaction: ${error.message}`)
  }
  const decision = await runRouterAgent({ text, event })
  if (decision?.intent === 'ignore') return null
  const routedText = decision ? textFromRouterDecision(decision) : text
  return handleText(routedText, { dryRun, configPath, messageId })
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
          if (!/@|发布|publish/i.test(text)) return
          await handleEvent(event, { dryRun, configPath })
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
  channel.on('message', async (message) => {
    const text = message.content || ''
    if (!/@|发布|publish/i.test(text)) return
    try {
      const result = await handleEvent({
        content: text,
        message_id: message.messageId,
        chat_id: message.chatId,
      }, { dryRun, configPath })
      if (!result) return
      const prefix = dryRun ? 'Dry run:' : '已处理发布请求:'
      await channel.send(message.chatId, { markdown: `${prefix}\n\n\`\`\`\n${result}\n\`\`\`` }, { replyTo: message.messageId })
    } catch (error) {
      await channel.send(message.chatId, { markdown: `发布请求解析失败: ${error.message}` }, { replyTo: message.messageId })
    }
  })
  await channel.connect()
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
  buildReactionCommand,
  eventMessageId,
  eventText,
  handleEvent,
  handleText,
  listenSdk,
  listenLocal,
}
