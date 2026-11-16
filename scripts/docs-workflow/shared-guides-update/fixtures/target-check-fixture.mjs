// Local Git, archive and HTTP fixture for the actual two-run CLI subprocesses.
import { execFile, execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { loadTargetCheckContract } from '../target-check.mjs'
const exec = promisify(execFile)
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const production = 660446555,
  repo = 'zilliztech/zdoc',
  lock = 'shared-docs/guides/pages/json-field-overview/lock.yaml'
const signer = 19864447,
  writer = 41898282
const h = 'a'.repeat(64),
  current = 'a'.repeat(40),
  target = 'b'.repeat(40)
const identity = 'Shared update local <shared-update-local@localhost>'
export function zip(files) {
  const chunks = [],
    entries = []
  let offset = 0
  for (const [name, data] of files) {
    const bytes = Buffer.from(data),
      nameBytes = Buffer.from(name)
    let crc = 0xffffffff
    for (const byte of bytes) {
      crc ^= byte
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    crc = (crc ^ 0xffffffff) >>> 0
    const local = Buffer.alloc(30),
      central = Buffer.alloc(46)
    local.writeUInt32LE(0x04034b50)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(bytes.length, 18)
    local.writeUInt32LE(bytes.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    central.writeUInt32LE(0x02014b50)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(bytes.length, 20)
    central.writeUInt32LE(bytes.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)
    chunks.push(local, nameBytes, bytes)
    entries.push(central, nameBytes)
    offset += 30 + nameBytes.length + bytes.length
  }
  const directory = Buffer.concat(entries),
    end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50)
  end.writeUInt16LE(files.size, 8)
  end.writeUInt16LE(files.size, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, directory, end])
}
export async function targetFixture({
  inject = false,
  sealNonce = 'fixture',
  checkId = 41
} = {}) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'target-check-cli-')),
    gitPath = join(root, 'fixture.git')
  execFileSync('/usr/bin/git', ['init', '--bare', '--quiet', gitPath])
  const git = (args, input) =>
    execFileSync(
      '/usr/bin/git',
      ['--no-replace-objects', '-C', gitPath, ...args],
      {
        input,
        env: {
          PATH: '/usr/bin:/bin',
          GIT_CONFIG_GLOBAL: '/dev/null',
          GIT_CONFIG_NOSYSTEM: '1'
        },
        maxBuffer: 16 * 1024 * 1024
      }
    )
  const object = (type, bytes) =>
    git(['hash-object', '--literally', '-w', '-t', type, '--stdin'], bytes)
      .toString()
      .trim()
  const tree = (files) => {
    const root = {}
    for (const [path, bytes] of files) {
      const parts = path.split('/')
      let at = root
      for (const part of parts.slice(0, -1)) at = at[part] ??= {}
      at[parts.at(-1)] = object('blob', bytes)
    }
    const build = (node) =>
      object(
        'tree',
        Buffer.concat(
          Object.entries(node)
            .map(([name, value]) => ({
              name,
              type: typeof value === 'string' ? 'blob' : 'tree',
              oid: typeof value === 'string' ? value : build(value)
            }))
            .sort((a, b) =>
              Buffer.compare(
                Buffer.from(a.name + (a.type === 'tree' ? '/' : '')),
                Buffer.from(b.name + (b.type === 'tree' ? '/' : ''))
              )
            )
            .map((v) =>
              Buffer.concat([
                Buffer.from(
                  (v.type === 'tree' ? '40000' : '100644') + ' ' + v.name + '\0'
                ),
                Buffer.from(v.oid, 'hex')
              ])
            )
        )
      )
    return build(root)
  }
  const rawCommit = (tree, parents, message, time = 1) =>
    Buffer.from(
      `tree ${tree}\n${parents.map((p) => 'parent ' + p + '\n').join('')}author ${identity} ${time} +0000\ncommitter ${identity} ${time} +0000\n\n${message}`
    )
  const defs = {
    producer: Buffer.from('fixture-only producer workflow\n'),
    validator: Buffer.from('fixture-only validator workflow\n'),
    finalizer: Buffer.from('fixture-only finalizer workflow\n')
  }
  const identityFor = (role, id, actor) => ({
    workflowId: id,
    actorId: actor,
    event: role === 'producer' ? 'schedule' : 'workflow_dispatch',
    workflowPath:
      '.github/workflows/shared-guides-' +
      (role === 'producer'
        ? 'update'
        : role === 'validator'
          ? 'validate'
          : 'finalize') +
      '.yml',
    workflowDefinitionSha256: hash(defs[role])
  })
  const policy = {
    host: 'github.com',
    repositoryId: production,
    repositoryFullName: repo,
    baseRef: 'master',
    writerActorId: writer,
    sealIdentity: {
      scheme: 'github-app-author-v1',
      platformSignerActorId: signer
    },
    allowedHeadPrefixes: ['shared-update/'],
    checkAppId: 15368,
    checkName: 'shared-update-exact-validation',
    producerArtifactName: 'shared-guides-update-producer',
    validatorArtifactName: 'shared-guides-validation',
    producer: identityFor('producer', 8, 7),
    validator: identityFor('validator', 18, 17)
  }
  const registration = {
    status: 'registered',
    policy,
    finalizer: identityFor('finalizer', 28, 18)
  }
  const before = Buffer.from(
      `schema_version: 1\ncurrent: ${current}\nnext: ${current}\n`
    ),
    after = Buffer.from(
      before.toString().replace('next: ' + current, 'next: ' + target)
    )
  const baseFiles = new Map([
    [lock, before],
    ...[
      ['producer', policy.producer],
      ['validator', policy.validator],
      ['finalizer', registration.finalizer]
    ].map(([role, i]) => [i.workflowPath, defs[role]])
  ])
  const masterTree = tree(baseFiles),
    master = object('commit', rawCommit(masterTree, [], 'master\n')),
    dev = object('commit', rawCommit(masterTree, [master], 'dev\n'))
  git(['update-ref', 'refs/heads/master', master])
  git(['update-ref', 'refs/heads/dev', dev])
  const c = await loadTargetCheckContract(),
    canonical = (value) => Buffer.from(c.canonicalBytes(value)),
    blob = (bytes) => ({
      path: 'blobs/' + hash(bytes),
      sha256: hash(bytes),
      bytes: bytes.length
    })
  const { loadTypeScript } = createRequire(import.meta.url)(
    '../../../lib/load-typescript.js'
  )
  const { fixtureMaterial } = loadTypeScript(
    resolve(
      'packages/docs-tooling/src/shared-docs/testing/updates/fixtures/manual-provider.ts'
    )
  )
  const subject = {
    kind: 'guides-page',
    group: 'guides',
    pageId: 'json-field-overview'
  }
  const members = [
    {
      logicalId: 'json-field-overview',
      manualId: 'guides',
      token: 'shared-json-field-overview',
      outputPath: 'content/en/guides/json-field-overview.mdx',
      origin: 'upstream',
      current: true,
      next: true
    }
  ]
  const report = structuredClone(
    fixtureMaterial({ subject, master, current, target, members })
      .collectedReport
  )
  Object.assign(report.pins, { dev, configTreeOid: masterTree })
  Object.assign(report.pins.source, {
    repository: 'https://github.com/milvus-io/milvus-docs',
    track: 'v3.0.x'
  })
  Object.assign(report.semanticProjection.source, {
    repository: 'https://github.com/milvus-io/milvus-docs',
    track: 'v3.0.x'
  })
  report.semanticInputSha256 = c.digest('semantic', report.semanticProjection)
  const reportBytes = canonical(report),
    reportRef = blob(reportBytes)
  const plan = {
    kind: 'shared-update-unit',
    schemaVersion: 1,
    unitKey: 'guides:' + hash(canonical([subject])),
    subjects: [subject],
    membersSha256: c.digest('unit-members', [
      { subject, memberSetSha256: report.memberSetSha256 }
    ]),
    reports: [reportRef],
    nextEdits: [
      {
        subject,
        before: { path: lock, sha256: hash(before), current, next: current },
        target,
        afterBlob: blob(after)
      }
    ],
    disposition: 'candidate',
    holdReasons: [],
    semanticInputSha256: c.digest('unit-semantic', [
      { subject, semanticInputSha256: report.semanticInputSha256 }
    ])
  }
  const revision = {
    kind: 'shared-update-revision',
    schemaVersion: 1,
    unitKey: plan.unitKey,
    subjects: [subject],
    parentHead: master,
    master,
    dev,
    tools: master,
    memberSetSha256: plan.membersSha256,
    planSha256: c.digest('plan', plan),
    previousBotCommit: null,
    lockDeltas: [{ path: lock, current, oldNext: current, next: target }],
    preservedHumanHeads: []
  }
  const { encodeRevisionMessage } = loadTypeScript(
    resolve('packages/docs-tooling/src/shared-docs/core/updates/metadata.ts')
  )
  const candidateFiles = new Map(baseFiles)
  candidateFiles.set(lock, after)
  if (inject)
    candidateFiles.set(
      'scripts/injected.mjs',
      Buffer.from('process.exit(99)\n')
    )
  const candidateTree = tree(candidateFiles),
    candidate = object(
      'commit',
      rawCommit(
        candidateTree,
        [master],
        encodeRevisionMessage(revision).commitMessage,
        2
      )
    )
  const patch = git([
    'diff-tree',
    '--raw',
    '-r',
    '-z',
    '--no-abbrev',
    '--no-commit-id',
    master,
    candidate
  ])
  const proof = {
    prepared: { kind: 'new', master, base: master, tree: masterTree },
    candidate,
    candidateTree,
    patch: blob(patch),
    preservedHumanHeads: [],
    trustedToolsetSha256: report.pins.toolsetSha256,
    executableClosure: blob(Buffer.alloc(0)),
    nextEdits: plan.nextEdits
  }
  const planBytes = canonical(plan),
    proofBytes = canonical(proof)
  const sealMetadata = {
    kind: 'shared-update-seal',
    schemaVersion: 1,
    repositoryId: production,
    transactionId: h,
    unitKey: plan.unitKey,
    planSha256: c.digest('plan', plan),
    proofSha256: hash(proofBytes),
    master,
    dev,
    preparedBase: master,
    candidate,
    candidateTree,
    previousSeal: null,
    preservedHumanHeads: [],
    runId: 30,
    runAttempt: 1
  }
  const sealMessage =
    'Seal shared update\n\nShared-Update-Seal: v1.' +
    canonical(sealMetadata).toString('base64url') +
    '\n'
  const payload = rawCommit(candidateTree, [candidate], sealMessage),
    signature =
      '-----BEGIN PGP SIGNATURE-----\n' +
      sealNonce +
      '\n-----END PGP SIGNATURE-----'
  const rawSeal = Buffer.from(
      payload
        .toString()
        .replace(
          '\n\n',
          '\ngpgsig ' + signature.split('\n').join('\n ') + '\n\n'
        )
    ),
    seal = object('commit', rawSeal)
  git(['update-ref', 'refs/heads/shared-update/unit', seal])
  const producerFiles = new Map([
    ['plan.json', planBytes],
    ['proof.json', proofBytes],
    ['patch.raw', patch],
    ['reports/' + reportRef.sha256 + '.json', reportBytes],
    ['locks/' + hash(after) + '.yaml', after]
  ])
  const { kind: _kind, schemaVersion: _version, ...sealFields } = sealMetadata
  const provenance = {
    kind: 'shared-update-producer',
    schemaVersion: 1,
    ...sealFields,
    seal,
    requestId: 'produce-30',
    tools: master,
    workflowDefinitionSha256: policy.producer.workflowDefinitionSha256,
    members: [...producerFiles].map(([name, bytes]) => ({
      name,
      sha256: hash(bytes),
      bytes: bytes.length
    }))
  }
  producerFiles.set('provenance.json', canonical(provenance))
  const state = {
    producerFiles,
    validatorFiles: null,
    checks: [],
    writes: [],
    reads: [],
    changes: {},
    run31: 'in_progress',
    run31Conclusion: null,
    runs: new Map(),
    extraArtifacts: new Map()
  }
  const runRecord = (id) => {
    const recorded = state.runs.get(id)
    const identity =
      id === 30
        ? policy.producer
        : recorded?.role === 'finalizer'
          ? registration.finalizer
          : policy.validator
    return {
      id,
      run_attempt: 1,
      repository: { id: production },
      head_repository: { id: production },
      head_sha: master,
      head_branch: 'master',
      actor: { id: identity.actorId },
      event: identity.event,
      workflow_id: identity.workflowId,
      path: identity.workflowPath,
      status:
        id === 30
          ? 'completed'
          : id === 31
            ? state.run31
            : (recorded?.status ?? 'in_progress'),
      conclusion:
        id === 30
          ? 'success'
          : id === 31
            ? state.run31Conclusion
            : (recorded?.conclusion ?? null),
      check_suite_id: identity === policy.validator ? 50 : 49,
      display_title: 'Shared update exact request-' + id
    }
  }
  const artifact = (id) => {
    const extra = state.extraArtifacts.get(id)
    const files =
      extra?.files ??
      (id === 61
        ? state.producerFiles
        : id === 62
          ? state.validatorFiles
          : null)
    if (!files) return null
    const archive = zip(files),
      runId = extra?.runId ?? (id === 61 ? 30 : 31)
    return {
      archive,
      metadata: {
        id,
        name:
          extra?.name ??
          (id === 61
            ? policy.producerArtifactName
            : policy.validatorArtifactName),
        expired: false,
        size_in_bytes: archive.length,
        digest: 'sha256:' + hash(archive),
        workflow_run: {
          id: runId,
          repository_id: production,
          head_repository_id: production,
          head_sha: master,
          head_branch: 'master'
        }
      }
    }
  }
  const server = createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(Buffer.from(chunk))
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : undefined
    const path = new URL(req.url, 'http://fixture.invalid').pathname,
      short = path.replace('/repos/' + repo, '')
    let status = 200,
      value
    const mutation =
      req.method === 'PATCH' || (req.method === 'POST' && short !== '/graphql')
    if (mutation) {
      state.writes.push({ method: req.method, path, body })
      if (state.changes.rejectWrite) {
        res.writeHead(500)
        res.end('{}')
        return
      }
      if (req.method === 'POST' && short === '/check-runs') {
        const check = {
          id: checkId,
          name: body.name,
          head_sha: body.head_sha,
          external_id: body.external_id,
          app: { id: 15368 },
          check_suite: { id: 51 },
          status: 'in_progress',
          conclusion: null
        }
        state.checks.push(check)
        value = check
        status = 201
      } else if (req.method === 'PATCH' && short === '/check-runs/' + checkId) {
        Object.assign(state.checks[0], {
          status: body.status,
          conclusion: body.conclusion
        })
        value = state.checks[0]
      } else {
        status = 404
        value = {}
      }
      if (state.changes.lostWrite) {
        req.socket.destroy()
        return
      }
      if (state.changes.badWriteSuite)
        value = { ...value, check_suite: { id: 999 } }
    } else {
      state.reads.push(path)
      state.onRead?.(path)
      if (state.changes.unknownRead) {
        res.writeHead(500)
        res.end('{}')
        return
      }
      if (path === '/repos/milvus-io/milvus-docs/git/ref/heads/v3.0.x')
        value = {
          ref: 'refs/heads/v3.0.x',
          object: { type: 'commit', sha: state.changes.source ?? target }
        }
      else if (short === '')
        value = { id: production, node_id: 'R_fixture', full_name: repo }
      else if (/^\/actions\/runs\/\d+\/attempts\/\d+$/.test(short)) {
        const id = Number(short.split('/')[3])
        value = runRecord(id)
        if (id === 31 && state.changes.attempt)
          value = { ...value, run_attempt: 2 }
        if (id === 30 && state.changes.producerActor) value.actor = { id: 999 }
        if (id === 30 && state.changes.producerM) value.head_sha = current
      } else if (/^\/actions\/workflows\/\d+\/runs$/.test(short)) {
        const workflowId = Number(short.split('/')[3])
        const values = [...state.runs.keys()]
          .map(runRecord)
          .filter((run) => run.workflow_id === workflowId)
        value = {
          total_count: values.length,
          workflow_runs: state.changes.missingHistory ? [] : values
        }
        if (state.changes.unknownHistory) {
          status = 500
          value = {}
        }
      } else if (short.startsWith('/actions/workflows/')) {
        const id = Number(short.split('/').at(-1)),
          identity = [
            policy.producer,
            policy.validator,
            registration.finalizer
          ].find((i) => i.workflowId === id)
        value = { id, path: identity?.workflowPath }
      } else if (short.startsWith('/contents/')) {
        const path = short.slice('/contents/'.length),
          role = Object.entries({
            producer: policy.producer,
            validator: policy.validator,
            finalizer: registration.finalizer
          }).find(([, i]) => i.workflowPath === path)?.[0]
        value = {
          type: 'file',
          path,
          encoding: 'base64',
          content: defs[role].toString('base64')
        }
      } else if (
        short.endsWith('/artifacts') &&
        short.startsWith('/actions/runs/')
      ) {
        const id = Number(short.split('/')[3]),
          items = [61, 62, ...state.extraArtifacts.keys()]
            .map(artifact)
            .filter((a) => a && a.metadata.workflow_run.id === id)
        value = {
          total_count: items.length,
          artifacts: items.map((a) => a.metadata)
        }
      } else if (short.startsWith('/actions/artifacts/')) {
        const a = artifact(Number(short.split('/')[3]))
        value = short.endsWith('/zip') ? a?.archive : a?.metadata
        if (state.changes.archiveDigest && short.endsWith('/zip'))
          value = Buffer.from('invalid ZIP')
      } else if (short === '/pulls/20')
        value = {
          number: 20,
          id: 20,
          created_at: '2026-01-01T00:00:00Z',
          base: { repo: { id: production }, ref: 'master', sha: master },
          head: {
            repo: { id: production },
            ref: 'shared-update/unit',
            sha: state.changes.prHead ?? seal
          },
          user: { id: writer },
          state: 'open',
          draft: true,
          merged_at: null
        }
      else if (short.startsWith('/git/ref/heads/')) {
        const name = short.slice('/git/ref/heads/'.length)
        value = {
          ref: 'refs/heads/' + name,
          object: {
            type: 'commit',
            sha:
              name === 'master'
                ? (state.changes.master ?? master)
                : name === 'dev'
                  ? (state.changes.dev ?? dev)
                  : seal
          }
        }
      } else if (short === '/commits/' + seal)
        value = {
          sha: seal,
          author: { id: writer },
          committer: { id: signer },
          parents: [{ sha: candidate }],
          commit: {
            tree: { sha: candidateTree },
            verification: {
              verified: true,
              reason: 'valid',
              payload: payload.toString(),
              signature:
                (state.changes.signature ? 'different-signature' : signature) +
                '\n'
            }
          }
        }
      else if (short === '/graphql')
        value = {
          data: {
            repository: {
              databaseId: production,
              object: {
                oid: seal,
                author: { user: { databaseId: writer } },
                committer: { user: { databaseId: signer } },
                signature: {
                  isValid: true,
                  state: 'VALID',
                  wasSignedByGitHub: true,
                  signer: { databaseId: state.changes.signer ?? signer },
                  payload: payload.toString(),
                  signature:
                    (state.changes.signature
                      ? 'different-signature'
                      : signature) + '\n'
                }
              }
            }
          }
        }
      else if (short === '/commits/' + seal + '/check-runs')
        value = {
          total_count: (state.changes.hiddenChecks ?? state.checks).length,
          check_runs: (state.changes.hiddenChecks ?? state.checks).map(
            (ch) => ({
              ...ch,
              ...(state.changes.check ?? {})
            })
          )
        }
      else {
        status = 404
        value = {}
      }
    }
    res.writeHead(status, { 'content-type': 'application/json' })
    res.end(value instanceof Uint8Array ? value : JSON.stringify(value))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const env = {
    GITHUB_ACTIONS: 'true',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_API_URL: 'https://api.github.com',
    GITHUB_REPOSITORY: repo,
    GITHUB_REPOSITORY_ID: String(production),
    GITHUB_REF: 'refs/heads/master',
    GITHUB_SHA: master,
    GITHUB_WORKFLOW_SHA: master,
    GITHUB_WORKFLOW_REF:
      repo + '/' + policy.validator.workflowPath + '@refs/heads/master',
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_ACTOR_ID: '17',
    GITHUB_RUN_ATTEMPT: '1'
  }
  let sequence = 0
  const invoke = async (phase, inputs = {}) => {
    const runtimeRunId = Number(
      inputs.GITHUB_RUN_ID ?? (phase === 'finalize' ? 32 : 31)
    )
    state.runs.set(runtimeRunId, {
      role: phase === 'finalize' ? 'finalizer' : 'validator',
      status: 'in_progress',
      conclusion: null
    })
    if (runtimeRunId === 31) {
      state.run31 = 'in_progress'
      state.run31Conclusion = null
    }
    const manifest = join(root, 'manifest-' + ++sequence + '.json'),
      out = join(root, phase + '-' + sequence)
    const runtimeEnv =
      phase === 'finalize'
        ? {
            ...env,
            GITHUB_WORKFLOW_REF:
              repo +
              '/' +
              registration.finalizer.workflowPath +
              '@refs/heads/master',
            GITHUB_ACTOR_ID: '18'
          }
        : env
    writeFileSync(
      manifest,
      JSON.stringify({
        git: gitPath,
        master,
        port: server.address().port,
        registration,
        env: runtimeEnv,
        inputs: {
          PRODUCER_RUN_ID: '30',
          PRODUCER_ATTEMPT: '1',
          PR_NUMBER: '20',
          REQUEST_ID: 'request-31',
          RESERVED_CHECK_ID: String(checkId),
          RESERVED_SUITE_ID: '51',
          VALIDATOR_RUN_ID: '31',
          VALIDATOR_ATTEMPT: '1',
          ...inputs
        }
      })
    )
    let code = 0,
      stdout = '',
      stderr = ''
    try {
      ;({ stdout, stderr } = await exec(
        process.execPath,
        [
          resolve(
            'scripts/docs-workflow/shared-guides-update/fixtures/target-check-driver.mjs'
          ),
          manifest,
          phase,
          out
        ],
        {
          timeout: 30000,
          env: {
            PATH: '/opt/homebrew/bin:/usr/bin:/bin',
            HOME: process.env.HOME
          },
          maxBuffer: 1024 * 1024
        }
      ))
    } catch (error) {
      code = error.code
      stdout = error.stdout
      stderr = error.stderr
    }
    const result = JSON.parse(readFileSync(join(out, 'result.json'), 'utf8'))
    if (phase === 'finalize' || ['held', 'unknown'].includes(result.status)) {
      state.runs.set(runtimeRunId, {
        role: phase === 'finalize' ? 'finalizer' : 'validator',
        status: 'completed',
        conclusion: code === 0 ? 'success' : 'failure'
      })
      if (runtimeRunId === 31) {
        state.run31 = 'completed'
        state.run31Conclusion = code === 0 ? 'success' : 'failure'
      }
    }
    if (phase === 'finalize' && result.status === 'accepted') {
      state.extraArtifacts.set(1000 + runtimeRunId, {
        runId: runtimeRunId,
        name: 'shared-guides-finalization',
        files: new Map([
          ['operation.json', readFileSync(join(out, 'operation.json'))]
        ])
      })
    }
    return {
      code,
      stdout,
      stderr,
      out,
      result: JSON.parse(readFileSync(join(out, 'result.json'), 'utf8'))
    }
  }
  const validate = async () => {
    const reserve = await invoke('reserve')
    if (reserve.result.status !== 'reserved') return reserve
    const validated = await invoke('validate')
    if (validated.result.status === 'prepared') {
      state.validatorFiles = new Map(
        readdirSync(join(validated.out, 'archive')).map((name) => [
          name,
          readFileSync(join(validated.out, 'archive', name))
        ])
      )
      state.run31 = 'completed'
      state.run31Conclusion = 'success'
    }
    return validated
  }
  return {
    root,
    state,
    invoke,
    validate,
    registration,
    master,
    dev,
    target,
    seal,
    candidate,
    c,
    canonical,
    git,
    object,
    zip,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve)
        server.closeAllConnections()
      })
  }
}
