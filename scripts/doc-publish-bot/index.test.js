const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const {
  assertPlanAllowedForExecution,
  assertWorkingTreeClean,
  buildJenkinsCommand,
  buildReactionCommand,
  createSerialQueue,
  errorReplyText,
  executeBridgePlan,
  handleEvent,
  isRelevantBotMessage,
  createSdkMessageHandler,
  positiveIntegerEnv,
  runBoundedShellCommand,
  runCommand,
} = require('./index')

test('runCommand passes cwd and stdin to the child process', async () => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'doc-publish-run-command-'))
  try {
    const { stdout } = await runCommand([
      process.execPath,
      '-e',
      "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>process.stdout.write(process.cwd()+'\\n'+input))",
    ], { cwd, stdin: 'bridge input' })

    assert.equal(stdout, `${await fs.realpath(cwd)}\nbridge input`)
  } finally {
    await fs.rm(cwd, { recursive: true, force: true })
  }
})

test('runCommand can replace the inherited environment', async () => {
  const previous = process.env.DOC_PUBLISH_SECRET_TEST
  process.env.DOC_PUBLISH_SECRET_TEST = 'must-not-leak'
  try {
    const { stdout } = await runCommand([
      process.execPath,
      '-e',
      "process.stdout.write(JSON.stringify({secret:process.env.DOC_PUBLISH_SECRET_TEST,path:process.env.PATH}))",
    ], { env: { PATH: process.env.PATH }, replaceEnv: true })

    assert.deepEqual(JSON.parse(stdout), { path: process.env.PATH })
  } finally {
    if (previous === undefined) delete process.env.DOC_PUBLISH_SECRET_TEST
    else process.env.DOC_PUBLISH_SECRET_TEST = previous
  }
})

test('runCommand pipes provided stdin while preserving explicit stdout and stderr stdio', async () => {
  const { stdout } = await runCommand([
    process.execPath,
    '-e',
    "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>process.stdout.write(input))",
  ], { stdin: Buffer.from('buffer input'), stdio: ['ignore', 'pipe', 'pipe'] })

  assert.equal(stdout, 'buffer input')
})

test("runCommand pipes stdin when stdio is 'inherit' while inheriting stdout and stderr", async () => {
  await assert.doesNotReject(() => runCommand([
    process.execPath,
    '-e',
    "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>process.exit(input==='inherited input'?0:2))",
  ], { stdin: 'inherited input', stdio: 'inherit' }))
})

test('runCommand rejects output beyond its configured bound', async () => {
  await assert.rejects(
    () => runCommand([
      process.execPath,
      '-e',
      "process.stdout.write('x'.repeat(128))",
    ], { maxOutputBytes: 16 }),
    /exceeded output limit/
  )
})

test('runCommand times out and rejects only after the child closes', async () => {
  const started = Date.now()
  await assert.rejects(
    () => runCommand([
      process.execPath,
      '-e',
      "process.on('SIGTERM',()=>setTimeout(()=>process.exit(0),60));setTimeout(()=>process.exit(0),300)",
    ], { timeoutMs: 80, terminationGraceMs: 150 }),
    /timed out after 80ms/
  )
  assert.ok(Date.now() - started >= 120)
})

test('runCommand output cap waits for child close before rejecting', async () => {
  const started = Date.now()
  await assert.rejects(
    () => runCommand([
      process.execPath,
      '-e',
      "process.on('SIGTERM',()=>setTimeout(()=>process.exit(0),60));process.stdout.write('x'.repeat(128));setInterval(()=>{},1000)",
    ], { maxOutputBytes: 16, terminationGraceMs: 150 }),
    /exceeded output limit/
  )
  assert.ok(Date.now() - started >= 50)
})

test('runCommand escalates to SIGKILL after the termination grace period', async () => {
  const started = Date.now()
  await assert.rejects(
    () => runCommand([
      process.execPath,
      '-e',
      "process.on('SIGTERM',()=>{});setTimeout(()=>process.exit(0),400)",
    ], { timeoutMs: 80, terminationGraceMs: 25 }),
    /timed out after 80ms/
  )
  const elapsed = Date.now() - started
  assert.ok(elapsed >= 95, `expected grace period before close, got ${elapsed}ms`)
  assert.ok(elapsed < 300, `expected forced kill before natural exit, got ${elapsed}ms`)
})

test('runCommand handles early child exit while writing stdin without an uncaught EPIPE', async () => {
  await assert.doesNotReject(() => runCommand([
    process.execPath,
    '-e',
    'process.exit(0)',
  ], { stdin: Buffer.alloc(4 * 1024 * 1024, 'x') }))
})

test('runBoundedShellCommand handles early child exit while writing stdin', async () => {
  await assert.doesNotReject(() => runBoundedShellCommand({
    command: `${JSON.stringify(process.execPath)} -e "process.exit(0)"`,
    input: Buffer.alloc(4 * 1024 * 1024, 'x'),
    label: 'early-shell-exit',
    timeoutMs: 1000,
    maxOutputBytes: 1024,
    terminationGraceMs: 20,
  }))
})

test('executeBridgePlan creates temp dirs immediately before commands and cleans them on success', async () => {
  const tempDir = path.join(os.tmpdir(), `doc-publish-execute-${Date.now()}-${Math.random()}`)
  const events = []
  const result = await executeBridgePlan({
    cwd: '/bridge',
    commands: [['node', 'first'], ['node', 'second']],
    stdin: 'payload',
    tempDirs: [tempDir],
  }, {
    mkdir: async (dir, options) => { events.push(['mkdir', dir, options]) },
    run: async (argv, options) => {
      events.push(['run', argv, options])
      return { stdout: argv[1], stderr: '' }
    },
    cleanup: async (dir) => { events.push(['cleanup', dir]) },
  })

  assert.deepEqual(result.stdout, ['first', 'second'])
  assert.deepEqual(events[0], ['mkdir', tempDir, { mode: 0o700 }])
  assert.equal(events[1][0], 'run')
  assert.equal(events.at(-1)[0], 'cleanup')
  assert.equal(events[1][2].cwd, '/bridge')
  assert.equal(events[1][2].stdin, 'payload')
  assert.equal(events[2][2].stdin, undefined)
  assert.ok(Number.isInteger(events[1][2].maxOutputBytes))
  assert.ok(events[1][2].maxOutputBytes > 0)
  assert.equal(events[1][2].timeoutMs, 10 * 60 * 1000)
})

test('executeBridgePlan passes only the plan allowlisted environment to subprocesses', async () => {
  const previous = {
    FEISHU_APP_ID: process.env.FEISHU_APP_ID,
    FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
    JENKINS_USER: process.env.JENKINS_USER,
    JENKINS_TOKEN: process.env.JENKINS_TOKEN,
    UNRELATED_SECRET: process.env.UNRELATED_SECRET,
  }
  Object.assign(process.env, {
    FEISHU_APP_ID: 'app-id',
    FEISHU_APP_SECRET: 'app-secret',
    JENKINS_USER: 'jenkins-user',
    JENKINS_TOKEN: 'jenkins-token',
    UNRELATED_SECRET: 'unrelated',
  })
  try {
    let options
    await executeBridgePlan({
      commands: [['node', 'verify']],
      tempDirs: [],
      envAllowlist: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
      env: { BRIDGE_MODE: 'verify' },
    }, {
      run: async (argv, received) => {
        options = received
        return { stdout: '', stderr: '' }
      },
    })

    assert.equal(options.replaceEnv, true)
    assert.equal(options.env.FEISHU_APP_ID, 'app-id')
    assert.equal(options.env.FEISHU_APP_SECRET, 'app-secret')
    assert.equal(options.env.BRIDGE_MODE, 'verify')
    assert.equal(options.env.JENKINS_USER, undefined)
    assert.equal(options.env.JENKINS_TOKEN, undefined)
    assert.equal(options.env.UNRELATED_SECRET, undefined)
    assert.equal(options.env.PATH, process.env.PATH)
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
})

test('executeBridgePlan excludes Feishu and Jenkins secrets from draft Codex plans', async () => {
  let options
  await executeBridgePlan({
    commands: [['codex', 'exec']],
    tempDirs: [],
    envAllowlist: [],
    env: { BRIDGE_MODE: 'draft' },
  }, {
    run: async (argv, received) => {
      options = received
      return { stdout: '', stderr: '' }
    },
  })

  assert.equal(options.env.FEISHU_APP_ID, undefined)
  assert.equal(options.env.FEISHU_APP_SECRET, undefined)
  assert.equal(options.env.JENKINS_USER, undefined)
  assert.equal(options.env.JENKINS_TOKEN, undefined)
})

test('executeBridgePlan passes the configured bridge command timeout', async () => {
  const previous = process.env.DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS
  process.env.DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS = '1234'
  try {
    let options
    await executeBridgePlan({ commands: [['node', 'noop']], tempDirs: [] }, {
      run: async (argv, received) => {
        options = received
        return { stdout: '', stderr: '' }
      },
    })
    assert.equal(options.timeoutMs, 1234)
  } finally {
    if (previous === undefined) delete process.env.DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS
    else process.env.DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS = previous
  }
})

test('executeBridgePlan cleans temp dirs when a command fails', async () => {
  const tempDir = path.join(os.tmpdir(), `doc-publish-failure-${Date.now()}-${Math.random()}`)
  const cleaned = []

  await assert.rejects(
    () => executeBridgePlan({
      cwd: '/bridge',
      commands: [['node', 'fail']],
      stdin: null,
      tempDirs: [tempDir],
    }, {
      mkdir: async () => {},
      run: async () => { throw new Error('command failed') },
      cleanup: async dir => { cleaned.push(dir) },
    }),
    /command failed/
  )
  assert.deepEqual(cleaned, [tempDir])
})

test('executeBridgePlan waits for the runner to settle before cleanup', async () => {
  const tempDir = path.join(os.tmpdir(), `doc-publish-settle-${Date.now()}-${Math.random()}`)
  const events = []
  await assert.rejects(
    () => executeBridgePlan({ commands: [['node', 'fail']], tempDirs: [tempDir] }, {
      mkdir: async () => {},
      run: async () => {
        events.push('run:start')
        await new Promise(resolve => setTimeout(resolve, 20))
        events.push('run:settled')
        throw new Error('runner failed')
      },
      cleanup: async () => { events.push('cleanup') },
    }),
    /runner failed/
  )
  assert.deepEqual(events, ['run:start', 'run:settled', 'cleanup'])
})

test('executeBridgePlan attempts every cleanup and preserves the primary command error', async () => {
  const tempDirs = [
    path.join(os.tmpdir(), `doc-publish-cleanup-a-${Date.now()}-${Math.random()}`),
    path.join(os.tmpdir(), `doc-publish-cleanup-b-${Date.now()}-${Math.random()}`),
  ]
  const attempts = []
  const primary = new Error('primary command failure')

  await assert.rejects(
    () => executeBridgePlan({ commands: [['node', 'fail']], tempDirs }, {
      mkdir: async () => {},
      run: async () => { throw primary },
      cleanup: async dir => {
        attempts.push(dir)
        throw new Error(`cleanup failed: ${path.basename(dir)}`)
      },
    }),
    error => {
      assert.ok(error instanceof AggregateError)
      assert.equal(error.cause, primary)
      assert.equal(error.errors.length, 2)
      return true
    }
  )
  assert.deepEqual(attempts, [...tempDirs].reverse())
})

test('executeBridgePlan reports aggregate cleanup failures after successful commands', async () => {
  const tempDirs = [
    path.join(os.tmpdir(), `doc-publish-cleanup-success-a-${Date.now()}-${Math.random()}`),
    path.join(os.tmpdir(), `doc-publish-cleanup-success-b-${Date.now()}-${Math.random()}`),
  ]
  const attempts = []

  await assert.rejects(
    () => executeBridgePlan({ commands: [['node', 'ok']], tempDirs }, {
      mkdir: async () => {},
      run: async () => ({ stdout: 'ok', stderr: '' }),
      cleanup: async dir => {
        attempts.push(dir)
        throw new Error(`cleanup failed: ${path.basename(dir)}`)
      },
    }),
    error => error instanceof AggregateError && error.errors.length === 2 && error.cause === undefined
  )
  assert.deepEqual(attempts, [...tempDirs].reverse())
})

test('executeBridgePlan rejects malformed command plans', async () => {
  await assert.rejects(() => executeBridgePlan({ commands: 'node script.js' }), /commands must be an array/)
  await assert.rejects(() => executeBridgePlan({ commands: ['node'] }), /command must be an argv array/)
})

test('executeBridgePlan rejects temp dirs outside the canonical temp root', async () => {
  await assert.rejects(
    () => executeBridgePlan({
      commands: [['node', 'noop']],
      tempDirs: [path.join(process.cwd(), 'doc-publish-outside')],
    }),
    /direct child of the system temp directory/
  )
})

test('executeBridgePlan rejects nested temp dirs', async () => {
  const nested = path.join(os.tmpdir(), 'doc-publish-parent', 'doc-publish-child')
  await assert.rejects(
    () => executeBridgePlan({ commands: [['node', 'noop']], tempDirs: [nested] }),
    /direct child of the system temp directory/
  )
})

test('executeBridgePlan rejects an existing temp directory before running commands', async () => {
  const existing = await fs.mkdtemp(path.join(os.tmpdir(), 'doc-publish-existing-'))
  let ran = false
  try {
    await assert.rejects(
      () => executeBridgePlan({ commands: [['node', 'noop']], tempDirs: [existing] }, {
        run: async () => { ran = true },
      }),
      /already exists/
    )
    assert.equal(ran, false)
  } finally {
    await fs.rm(existing, { recursive: true, force: true })
  }
})

test('executeBridgePlan rejects a direct temp-dir symlink before mkdir', async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), 'doc-publish-target-'))
  const link = path.join(os.tmpdir(), `doc-publish-link-${Date.now()}-${Math.random()}`)
  await fs.symlink(target, link)
  try {
    await assert.rejects(
      () => executeBridgePlan({ commands: [['node', 'noop']], tempDirs: [link] }),
      /must not be a symlink/
    )
  } finally {
    await fs.rm(link, { force: true })
    await fs.rm(target, { recursive: true, force: true })
  }
})

test('executeBridgePlan rejects temp dirs whose parent symlink escapes the canonical temp root', async () => {
  const outside = await fs.mkdtemp(path.join(process.cwd(), 'doc-publish-escape-target-'))
  const parentLink = path.join(os.tmpdir(), `doc-publish-parent-link-${Date.now()}-${Math.random()}`)
  await fs.symlink(outside, parentLink)
  try {
    await assert.rejects(
      () => executeBridgePlan({
        commands: [['node', 'noop']],
        tempDirs: [path.join(parentLink, 'doc-publish-child')],
      }),
      /direct child of the system temp directory/
    )
    await assert.rejects(() => fs.lstat(path.join(outside, 'doc-publish-child')), { code: 'ENOENT' })
  } finally {
    await fs.rm(parentLink, { force: true })
    await fs.rm(outside, { recursive: true, force: true })
  }
})

test('handleEvent bridge dry-run replies with the rendered plan without executing or creating temp dirs', async () => {
  const calls = []
  const result = await handleEvent({ content: 'verify this', message_id: 'om_1' }, {
    dryRun: true,
    router: async () => ({ intent: 'verify_doc_code' }),
    buildBridgePlan: () => ({ commands: [['node', 'verify']], tempDirs: ['/should/not/exist'] }),
    renderBridge: () => 'rendered bridge plan',
    executeBridge: async () => { calls.push('execute') },
    react: async () => {},
    replyMessage: async (messageId, text) => { calls.push(['reply', messageId, text]) },
  })

  assert.equal(result, 'rendered bridge plan')
  assert.deepEqual(calls, [['reply', 'om_1', 'Dry run:\n\n```\nrendered bridge plan\n```']])
})

test('handleEvent routes bridge execution and replies with collected stdout', async () => {
  const calls = []
  const plan = { intent: 'verify_doc_code', commands: [['node', 'verify']], tempDirs: [] }
  const result = await handleEvent({ content: 'verify this', message_id: 'om_2' }, {
    dryRun: false,
    router: async () => ({ intent: 'verify_doc_code' }),
    buildBridgePlan: decision => {
      calls.push(['build', decision.intent])
      return plan
    },
    executeBridge: async received => {
      calls.push(['execute', received])
      return { stdout: ['verification complete'] }
    },
    react: async () => {},
    replyMessage: async (messageId, text) => { calls.push(['reply', messageId, text]) },
  })

  assert.equal(result, 'verification complete')
  assert.deepEqual(calls, [
    ['build', 'verify_doc_code'],
    ['execute', plan],
    ['reply', 'om_2', 'verification complete'],
  ])
})

test('handleEvent preserves publish routing and only converts router decisions for publish', async () => {
  const calls = []
  const decision = { intent: 'publish_docs' }
  const result = await handleEvent({ content: 'publish', message_id: 'om_3' }, {
    dryRun: true,
    router: async () => decision,
    decisionText: (received, options) => {
      calls.push(['decisionText', received, options])
      return 'routed publish text'
    },
    publish: async (text, options) => {
      calls.push(['publish', text, options.messageId])
      return 'publish result'
    },
    buildBridgePlan: () => { throw new Error('bridge planner must not run') },
    react: async () => {},
  })

  assert.equal(result, 'publish result')
  assert.deepEqual(calls, [
    ['decisionText', decision, { originalText: 'publish' }],
    ['publish', 'routed publish text', 'om_3'],
  ])
})

test('handleEvent rejects router-injected production approval without raw approval wording', async () => {
  await assert.rejects(
    () => handleEvent({ content: 'publish production v2.6.0', message_id: 'om_approval_1' }, {
      dryRun: true,
      router: async () => ({
        intent: 'publish_docs',
        environment: 'production',
        branch: 'v2.6.0',
        docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
        approved: true,
      }),
      publish: async text => {
        assert.doesNotMatch(text, /approved/)
        throw new Error('production publish requires explicit approval')
      },
      react: async () => {},
    }),
    /production publish requires explicit approval/
  )
})

test('handleEvent accepts explicit production approval from the raw message', async () => {
  const result = await handleEvent({ content: 'approved for production', message_id: 'om_approval_2' }, {
    dryRun: true,
    router: async () => ({
      intent: 'publish_docs',
      environment: 'production',
      branch: 'v2.6.0',
      docLinks: ['https://zilliverse.feishu.cn/wiki/ABC123'],
      approved: false,
    }),
    publish: async text => {
      assert.match(text, /approved/)
      return 'accepted'
    },
    react: async () => {},
  })

  assert.equal(result, 'accepted')
})

test('isRelevantBotMessage admits bridge requests and rejects unrelated chat', () => {
  for (const text of [
    '@docbot can you help?',
    'verify these code examples',
    '检查 SDK 文档示例',
    'sync python SDK docs',
    'draft a verified doc',
    'patch code examples',
    '发布到 UAT',
  ]) {
    assert.equal(isRelevantBotMessage(text), true, text)
  }
  for (const text of ['lunch at noon', 'approved', '生产事故复盘']) {
    assert.equal(isRelevantBotMessage(text), false, text)
  }
})

test('SDK message handler serializes relevant message processing', async () => {
  let active = 0
  let maxActive = 0
  const sent = []
  const handler = createSdkMessageHandler({
    dryRun: true,
    enqueue: createSerialQueue(),
    handle: async event => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
      return event.content
    },
    send: async (...args) => { sent.push(args) },
  })

  await Promise.all([
    handler({ content: 'verify SDK docs', messageId: 'om_1', chatId: 'oc_1' }),
    handler({ content: 'patch code examples', messageId: 'om_2', chatId: 'oc_1' }),
  ])

  assert.equal(maxActive, 1)
  assert.equal(sent.length, 2)
})

test('buildReactionCommand attaches the Feishu typing keyboard emoji by default', () => {
  assert.deepEqual(buildReactionCommand('om_123'), [
    'lark-cli', 'im', 'reactions', 'create',
    '--message-id', 'om_123',
    '--data', '{"reaction_type":{"emoji_type":"Typing"}}',
    '--as', 'bot',
  ])
})

test('buildJenkinsCommand makes curl fail on HTTP error responses', () => {
  process.env.JENKINS_USER = 'user'
  process.env.JENKINS_TOKEN = 'token'
  assert.deepEqual(buildJenkinsCommand({
    url: 'https://jenkins.example/job/docs/buildWithParameters',
    params: { BRANCH: 'dev' },
  }), [
    'curl', '--fail-with-body', '--silent', '--show-error', '-X', 'POST',
    'https://jenkins.example/job/docs/buildWithParameters',
    '--user', 'user:token',
    '--data-urlencode', 'BRANCH=dev',
  ])
})

test('runBoundedShellCommand rejects excessive agent output', async () => {
  await assert.rejects(
    () => runBoundedShellCommand({
      command: `${JSON.stringify(process.execPath)} -e "process.stdout.write('x'.repeat(128))"`,
      input: '',
      label: 'test-agent',
      timeoutMs: 1000,
      maxOutputBytes: 16,
    }),
    /exceeded output limit/
  )
})

test('assertPlanAllowedForExecution blocks unapproved production plans', () => {
  assert.throws(
    () => assertPlanAllowedForExecution({ environment: 'production', approved: false }),
    /production publish requires explicit approval/
  )
  assert.doesNotThrow(() => assertPlanAllowedForExecution({ environment: 'production', approved: true }))
  assert.doesNotThrow(() => assertPlanAllowedForExecution({ environment: 'uat', approved: false }))
})

test('assertWorkingTreeClean rejects dirty worktrees before execute mode mutates branches', async () => {
  await assert.rejects(
    () => assertWorkingTreeClean({
      run: async (argv) => {
        assert.deepEqual(argv, ['git', 'status', '--porcelain'])
        return { stdout: ' M docs/example.md\n', stderr: '' }
      },
    }),
    /dirty git worktree/
  )

  await assert.doesNotReject(() => assertWorkingTreeClean({
    run: async () => ({ stdout: '', stderr: '' }),
  }))
})

test('createSerialQueue runs publish jobs one at a time', async () => {
  const enqueue = createSerialQueue()
  const events = []
  const first = enqueue(async () => {
    events.push('first:start')
    await new Promise(resolve => setTimeout(resolve, 15))
    events.push('first:end')
  })
  const second = enqueue(async () => {
    events.push('second:start')
    events.push('second:end')
  })

  await Promise.all([first, second])
  assert.deepEqual(events, ['first:start', 'first:end', 'second:start', 'second:end'])
})

test('errorReplyText builds a Feishu-visible failure message', () => {
  assert.equal(errorReplyText(new Error('Base record not found')), '发布请求处理失败: Base record not found')
})

test('positiveIntegerEnv falls back for invalid bounded-command settings', () => {
  process.env.DOC_PUBLISH_TEST_LIMIT = 'not-a-number'
  assert.equal(positiveIntegerEnv('DOC_PUBLISH_TEST_LIMIT', 123), 123)
  process.env.DOC_PUBLISH_TEST_LIMIT = '456'
  assert.equal(positiveIntegerEnv('DOC_PUBLISH_TEST_LIMIT', 123), 456)
})
