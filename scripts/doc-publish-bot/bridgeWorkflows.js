const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

const BRIDGE_ROOT = path.resolve(__dirname, '../../../feishu-markdown-bridge')

const SDK_ALLOWLIST = Object.freeze({
  python: Object.freeze({ sdkDir: 'repos/pymilvus', sdkName: 'pymilvus' }),
  java: Object.freeze({ sdkDir: 'repos/milvus-sdk-java', sdkName: 'milvus-sdk-java' }),
  node: Object.freeze({ sdkDir: 'repos/milvus-sdk-node', sdkName: 'milvus-sdk-node' }),
  go: Object.freeze({ sdkDir: 'repos/milvus-sdk-go', sdkName: 'milvus-sdk-go' }),
  cpp: Object.freeze({ sdkDir: 'repos/milvus-sdk-cpp', sdkName: 'milvus-sdk-cpp' }),
  'zilliz-cli': Object.freeze({
    sdkDir: 'repos/zilliz-cloud/vdc/zilliz-cli',
    sdkName: 'zilliz-cli',
  }),
})

const BRIDGE_INTENTS = new Set([
  'verify_doc_code',
  'sync_sdk_docs',
  'patch_doc_code_examples',
  'draft_verified_doc',
])
const FEISHU_READ_ENV_ALLOWLIST = Object.freeze([
  'FEISHU_APP_ID',
  'FEISHU_APP_SECRET',
  'LARK_APP_ID',
  'LARK_APP_SECRET',
])

function assertBridgeDecisionAllowed(decision) {
  if (!decision || !BRIDGE_INTENTS.has(decision.intent)) {
    throw new Error(`unsupported bridge intent: ${decision?.intent || ''}`)
  }
  if (decision.live === true) {
    throw new Error('live bridge workflows are not allowed')
  }
}

function isFeishuDocUrl(value) {
  try {
    const url = new URL(value)
    const isHttps = url.protocol === 'https:'
    const isFeishuHost = url.hostname === 'feishu.cn' || url.hostname.endsWith('.feishu.cn')
    const isDocPath = /^\/(?:wiki|docx)\/[^/]+/.test(url.pathname)
    return isHttps && isFeishuHost && isDocPath && !url.username && !url.password
  } catch {
    return false
  }
}

function firstDocLink(decision) {
  const value = Array.isArray(decision?.docLinks) && decision.docLinks.length
    ? decision.docLinks[0]
    : decision?.targetDoc

  if (typeof value !== 'string' || !isFeishuDocUrl(value)) {
    throw new Error('bridge workflow requires a valid Feishu doc/wiki URL')
  }
  return value
}

function basePlan(intent, mode, requiresApproval, command, stdin = null, tempDirs = [], envAllowlist = []) {
  return {
    intent,
    mode,
    cwd: BRIDGE_ROOT,
    requiresApproval,
    commands: [command],
    stdin,
    tempDirs,
    envAllowlist,
    env: {},
  }
}

function planVerifyDocCode(decision) {
  const docLink = firstDocLink(decision)
  const tempDir = path.join(os.tmpdir(), `doc-publish-bot-${randomUUID()}`)
  const reportPath = path.join(tempDir, 'feishu-code-verify.json')
  const scenarioOutDir = path.join(tempDir, 'scenarios')

  return basePlan('verify_doc_code', 'read-only', false, [
    'node',
    '.claude/skills/feishu-code-verify/scripts/verify-feishu-doc-code.js',
    '--doc',
    docLink,
    '--scenario',
    '--scenario-out-dir',
    scenarioOutDir,
    '--report',
    reportPath,
  ], null, [tempDir], FEISHU_READ_ENV_ALLOWLIST)
}

function planSdkDocSync(decision) {
  if (Object.prototype.hasOwnProperty.call(decision, 'sdkDir')) {
    throw new Error('sdkDir must not be supplied; SDK paths are selected from the allowlist')
  }
  if (Object.prototype.hasOwnProperty.call(decision, 'sdkName')) {
    throw new Error('sdkName must not be supplied; SDK names are selected from the allowlist')
  }

  const language = typeof decision.language === 'string' ? decision.language : ''
  const sdk = SDK_ALLOWLIST[language]
  if (!sdk) throw new Error(`unsupported SDK language: ${language}`)

  if (!decision.sdkVersion) throw new Error('sdkVersion is required for SDK sync')
  const sdkVersion = String(decision.sdkVersion)
  if (!/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(sdkVersion)) {
    throw new Error(`invalid sdkVersion: ${sdkVersion}`)
  }

  return basePlan('sync_sdk_docs', 'dry-run', true, [
    'node',
    '.claude/skills/sdk-doc-sync/bin/sdk-doc-sync.js',
    '--sdk-dir',
    sdk.sdkDir,
    '--sdk-name',
    sdk.sdkName,
    '--sdk-version',
    sdkVersion,
    '--language',
    language,
    '--dry-run',
  ], null, [], FEISHU_READ_ENV_ALLOWLIST)
}

function planPatchDocCodeExamples(decision) {
  return basePlan('patch_doc_code_examples', 'dry-run', true, [
    'node',
    '.claude/skills/patch-code-blocks/bin/patch-code-blocks.js',
    '--target',
    firstDocLink(decision),
    '--product',
    'zilliz-saas',
    '--reference',
    path.join(BRIDGE_ROOT, 'repos'),
    '--apply',
    'false',
  ])
}

function planDraftVerifiedDoc(decision) {
  const references = validateReferences(decision.references)
  const payload = {
    skill: 'draft-verified-docs',
    mode: 'dry-run',
    targetDoc: firstDocLink(decision),
    references,
    writePolicy: {
      feishu: 'forbidden',
    },
    instructions: [
      'Draft locally with source verification against referenced sources.',
      'Do not perform any Feishu patch or write operation.',
    ].join(' '),
  }

  return basePlan(
    'draft_verified_doc',
    'dry-run',
    true,
    ['codex', 'exec', '--sandbox', 'read-only', '--ephemeral', '-'],
    JSON.stringify(payload)
  )
}

function validateReferences(references) {
  if (references === undefined) return []
  if (!Array.isArray(references)) throw new Error('invalid references: expected an array')

  return references.map(reference => {
    if (typeof reference !== 'string' || !reference) {
      throw new Error(`invalid reference: ${reference}`)
    }

    try {
      const url = new URL(reference)
      if (url.protocol === 'https:' && !url.username && !url.password) return reference
      throw new Error('not an allowed URL')
    } catch (error) {
      if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(reference)) {
        throw new Error(`invalid reference: ${reference}`)
      }
    }

    const normalized = path.posix.normalize(reference)
    const isBridgeRepoPath = reference.startsWith('repos/')
      && normalized === reference
      && !path.posix.isAbsolute(reference)
      && !reference.includes('\\')
      && !reference.split('/').includes('..')
      && reference.length > 'repos/'.length

    if (!isBridgeRepoPath) throw new Error(`invalid reference: ${reference}`)

    try {
      const reposRoot = fs.realpathSync(path.join(BRIDGE_ROOT, 'repos'))
      const candidate = fs.realpathSync(path.resolve(BRIDGE_ROOT, reference))
      if (!candidate.startsWith(`${reposRoot}${path.sep}`)) {
        throw new Error('reference resolves outside bridge repos')
      }
    } catch {
      throw new Error(`invalid reference: ${reference}`)
    }
    return reference
  })
}

function buildBridgeWorkflowPlan(decision) {
  assertBridgeDecisionAllowed(decision)

  switch (decision.intent) {
    case 'verify_doc_code':
      return planVerifyDocCode(decision)
    case 'sync_sdk_docs':
      return planSdkDocSync(decision)
    case 'patch_doc_code_examples':
      return planPatchDocCodeExamples(decision)
    case 'draft_verified_doc':
      return planDraftVerifiedDoc(decision)
  }
}

function shellQuote(argv) {
  return argv.map(arg => {
    const value = String(arg)
    return /^[A-Za-z0-9_./:=@+-]+$/.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`
  }).join(' ')
}

function renderBridgePlan(plan) {
  const lines = [
    `Intent: ${plan.intent}`,
    `Mode: ${plan.mode}`,
    `Cwd: ${plan.cwd}`,
    `Approval required: ${plan.requiresApproval ? 'yes' : 'no'}`,
    'Commands:',
  ]
  for (const command of plan.commands) lines.push(`- ${shellQuote(command)}`)
  lines.push(`Stdin: ${plan.stdin ? 'JSON payload present' : 'none'}`)
  return lines.join('\n')
}

module.exports = {
  BRIDGE_ROOT,
  FEISHU_READ_ENV_ALLOWLIST,
  SDK_ALLOWLIST,
  assertBridgeDecisionAllowed,
  buildBridgeWorkflowPlan,
  firstDocLink,
  renderBridgePlan,
}
