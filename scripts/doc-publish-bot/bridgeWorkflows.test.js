const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const {
  BRIDGE_ROOT,
  SDK_ALLOWLIST,
  assertBridgeDecisionAllowed,
  buildBridgeWorkflowPlan,
  firstDocLink,
  renderBridgePlan,
} = require('./bridgeWorkflows')

const DOC = 'https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'
const DOCX = 'https://zilliverse.feishu.cn/docx/ABC123'

test('BRIDGE_ROOT resolves to the sibling feishu-markdown-bridge checkout', () => {
  assert.equal(BRIDGE_ROOT, path.resolve(__dirname, '../../../feishu-markdown-bridge'))
})

test('verify_doc_code plans the read-only scenario verifier for the first validated link', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'verify_doc_code',
    docLinks: [DOC, DOCX],
  })

  const reportPath = plan.commands[0][plan.commands[0].indexOf('--report') + 1]
  const tempDir = plan.tempDirs[0]
  const scenarioOutDir = path.join(tempDir, 'scenarios')

  assert.deepEqual(plan, {
    intent: 'verify_doc_code',
    mode: 'read-only',
    cwd: BRIDGE_ROOT,
    requiresApproval: false,
    commands: [[
      'node',
      '.claude/skills/feishu-code-verify/scripts/verify-feishu-doc-code.js',
      '--doc',
      DOC,
      '--scenario',
      '--scenario-out-dir',
      scenarioOutDir,
      '--report',
      reportPath,
    ]],
    stdin: null,
    tempDirs: [tempDir],
    envAllowlist: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET', 'LARK_APP_ID', 'LARK_APP_SECRET'],
    env: {},
  })
  assert.equal(Object.hasOwn(plan, 'command'), false)
  assert.equal(path.dirname(reportPath), tempDir)
  assert.equal(path.dirname(scenarioOutDir), tempDir)
  assert.equal(path.basename(reportPath), 'feishu-code-verify.json')
  assert.equal(path.dirname(tempDir), os.tmpdir())
  assert.match(
    path.basename(tempDir),
    /^doc-publish-bot-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  )
  assert.equal(fs.existsSync(tempDir), false)
})

test('verify_doc_code plans unique report directories without creating them', () => {
  const first = buildBridgeWorkflowPlan({ intent: 'verify_doc_code', targetDoc: DOC })
  const second = buildBridgeWorkflowPlan({ intent: 'verify_doc_code', targetDoc: DOC })

  assert.notEqual(first.tempDirs[0], second.tempDirs[0])
  assert.notEqual(first.commands[0].at(-1), second.commands[0].at(-1))

  for (const tempDir of [...first.tempDirs, ...second.tempDirs]) {
    assert.match(tempDir, new RegExp(`^${os.tmpdir().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/doc-publish-bot-`))
    assert.equal(fs.existsSync(tempDir), false)
  }
})

test('sync_sdk_docs uses an immutable allowlisted SDK repo and required dry-run arguments', () => {
  assert.ok(Object.isFrozen(SDK_ALLOWLIST))
  assert.ok(Object.isFrozen(SDK_ALLOWLIST.python))

  const plan = buildBridgeWorkflowPlan({
    intent: 'sync_sdk_docs',
    language: 'python',
    sdkVersion: 'v2.6.x',
  })

  assert.equal(plan.mode, 'dry-run')
  assert.equal(plan.requiresApproval, true)
  assert.deepEqual(plan.commands, [[
    'node',
    '.claude/skills/sdk-doc-sync/bin/sdk-doc-sync.js',
    '--sdk-dir',
    'repos/pymilvus',
    '--sdk-name',
    'pymilvus',
    '--sdk-version',
    'v2.6.x',
    '--language',
    'python',
    '--dry-run',
  ]])
  assert.equal(Object.hasOwn(plan, 'command'), false)
})

test('sync_sdk_docs rejects router-supplied SDK paths and names', () => {
  assert.throws(
    () => buildBridgeWorkflowPlan({
      intent: 'sync_sdk_docs',
      language: 'python',
      sdkVersion: 'v2.6.x',
      sdkDir: '/tmp/attacker-controlled',
    }),
    /sdkDir must not be supplied/
  )
  assert.throws(
    () => buildBridgeWorkflowPlan({
      intent: 'sync_sdk_docs',
      language: 'python',
      sdkVersion: 'v2.6.x',
      sdkName: '--auto-approve',
    }),
    /sdkName must not be supplied/
  )
})

test('sync_sdk_docs rejects unsupported languages', () => {
  assert.throws(
    () => buildBridgeWorkflowPlan({ intent: 'sync_sdk_docs', language: 'ruby', sdkVersion: '1.0.0' }),
    /unsupported SDK language: ruby/
  )
})

test('sync_sdk_docs requires a safe SDK version', () => {
  assert.throws(
    () => buildBridgeWorkflowPlan({ intent: 'sync_sdk_docs', language: 'python' }),
    /sdkVersion is required/
  )
  assert.throws(
    () => buildBridgeWorkflowPlan({ intent: 'sync_sdk_docs', language: 'python', sdkVersion: '--auto-approve' }),
    /invalid sdkVersion/
  )
})

test('patch_doc_code_examples reuses the existing tested patch-code-blocks CLI', () => {
  const plan = buildBridgeWorkflowPlan({ intent: 'patch_doc_code_examples', targetDoc: DOCX })

  assert.equal(plan.mode, 'dry-run')
  assert.equal(plan.requiresApproval, true)
  assert.deepEqual(plan.commands, [[
    'node',
    '.claude/skills/patch-code-blocks/bin/patch-code-blocks.js',
    '--target',
    DOCX,
    '--product',
    'zilliz-saas',
    '--reference',
    path.join(BRIDGE_ROOT, 'repos'),
    '--apply',
    'false',
  ]])
  assert.doesNotMatch(plan.commands[0].join(' '), /plan-patch-feishu-code/)
})

test('draft_verified_doc invokes codex with bounded JSON stdin that forbids Feishu writes', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'draft_verified_doc',
    docLinks: [DOC],
    references: ['repos/pymilvus/pyproject.toml'],
  })
  const payload = JSON.parse(plan.stdin)

  assert.equal(plan.mode, 'dry-run')
  assert.equal(plan.requiresApproval, true)
  assert.deepEqual(plan.commands, [[
    'codex',
    'exec',
    '--sandbox',
    'read-only',
    '--ephemeral',
    '-',
  ]])
  assert.equal(Object.hasOwn(plan, 'command'), false)
  assert.equal(payload.skill, 'draft-verified-docs')
  assert.equal(payload.targetDoc, DOC)
  assert.deepEqual(payload.references, ['repos/pymilvus/pyproject.toml'])
  assert.equal(payload.writePolicy.feishu, 'forbidden')
  assert.equal(payload.mode, 'dry-run')
  assert.match(payload.instructions, /source verification against referenced sources/i)
  assert.match(payload.instructions, /do not .*Feishu.*(?:patch|write)/i)
})

test('draft_verified_doc validates references before passing them to Codex', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'draft_verified_doc',
    targetDoc: DOC,
    references: [
      'https://github.com/milvus-io/milvus/blob/master/README.md',
      'repos/pymilvus/pyproject.toml',
    ],
  })
  assert.deepEqual(JSON.parse(plan.stdin).references, [
    'https://github.com/milvus-io/milvus/blob/master/README.md',
    'repos/pymilvus/pyproject.toml',
  ])

  for (const reference of [
    'http://example.com/source',
    '/tmp/source.md',
    '../repos/pymilvus/source.py',
    'repos/pymilvus/../secrets.txt',
    'docs/source.md',
    '--help',
    'repos/pymilvus/definitely-missing-source.py',
  ]) {
    assert.throws(
      () => buildBridgeWorkflowPlan({ intent: 'draft_verified_doc', targetDoc: DOC, references: [reference] }),
      /invalid reference/
    )
  }
})

test('draft_verified_doc rejects bridge repo references that resolve outside canonical repos root', () => {
  const realpathSync = fs.realpathSync
  fs.realpathSync = candidate => {
    if (candidate === path.join(BRIDGE_ROOT, 'repos/pymilvus/symlink-escape')) {
      return path.join(os.tmpdir(), 'outside-bridge-repos')
    }
    return realpathSync(candidate)
  }

  try {
    assert.throws(
      () => buildBridgeWorkflowPlan({
        intent: 'draft_verified_doc',
        targetDoc: DOC,
        references: ['repos/pymilvus/symlink-escape'],
      }),
      /invalid reference/
    )
  } finally {
    fs.realpathSync = realpathSync
  }
})

test('buildBridgeWorkflowPlan rejects unsupported intents', () => {
  assert.throws(
    () => buildBridgeWorkflowPlan({ intent: 'delete_docs' }),
    /unsupported bridge intent: delete_docs/
  )
})

test('all initial bridge workflows reject live execution', () => {
  for (const decision of [
    { intent: 'verify_doc_code', docLinks: [DOC], live: true },
    { intent: 'sync_sdk_docs', language: 'go', sdkVersion: 'v2.6.x', live: true },
    { intent: 'patch_doc_code_examples', targetDoc: DOC, live: true },
    { intent: 'draft_verified_doc', docLinks: [DOC], live: true },
  ]) {
    assert.throws(() => assertBridgeDecisionAllowed(decision), /live bridge workflows are not allowed/)
    assert.throws(() => buildBridgeWorkflowPlan(decision), /live bridge workflows are not allowed/)
  }
})

test('firstDocLink accepts docLinks[0] or targetDoc and rejects invalid URLs', () => {
  assert.equal(firstDocLink({ docLinks: [DOC], targetDoc: DOCX }), DOC)
  assert.equal(firstDocLink({ targetDoc: DOCX }), DOCX)

  for (const decision of [
    {},
    { docLinks: ['--help'] },
    { targetDoc: 'http://zilliverse.feishu.cn/wiki/ABC' },
    { targetDoc: 'https://example.com/wiki/ABC' },
    { targetDoc: 'file:///tmp/doc' },
    { targetDoc: 'https://zilliverse.feishu.cn/download/ABC' },
  ]) {
    assert.throws(() => firstDocLink(decision), /valid Feishu doc\/wiki URL/)
  }
})

test('renderBridgePlan shows plan metadata, quoted command, and stdin presence without content', () => {
  const plan = buildBridgeWorkflowPlan({ intent: 'draft_verified_doc', targetDoc: DOC })
  const rendered = renderBridgePlan(plan)

  assert.match(rendered, /Intent: draft_verified_doc/)
  assert.match(rendered, /Mode: dry-run/)
  assert.match(rendered, new RegExp(`Cwd: ${BRIDGE_ROOT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  assert.match(rendered, /Approval required: yes/)
  assert.match(rendered, /Commands:\n- codex exec --sandbox read-only --ephemeral -/)
  assert.match(rendered, /Stdin: JSON payload present/)
  assert.doesNotMatch(rendered, /writePolicy|docs\/source|forbidden/)

  const verifyPlan = buildBridgeWorkflowPlan({
    intent: 'verify_doc_code',
    targetDoc: 'https://zilliverse.feishu.cn/wiki/ABC?title=two%20words&x=1',
  })
  const quoted = renderBridgePlan(verifyPlan)
  assert.match(quoted, /'https:\/\/zilliverse\.feishu\.cn\/wiki\/ABC\?title=two%20words&x=1'/)
  assert.match(quoted, /Stdin: none/)
  assert.equal(fs.existsSync(verifyPlan.tempDirs[0]), false)

  const multiple = renderBridgePlan({
    intent: 'test',
    mode: 'dry-run',
    cwd: BRIDGE_ROOT,
    requiresApproval: false,
    commands: [['node', 'one.js'], ['node', 'two.js']],
    stdin: null,
    tempDirs: [],
  })
  assert.match(multiple, /Commands:\n- node one\.js\n- node two\.js/)
})
