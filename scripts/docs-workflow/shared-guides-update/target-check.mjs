// Trusted two-run target Check driver. All candidate/archive bytes remain data. Only the
// production constructor reads the installed registry and creates real GitHub transports.
// Fixture construction is explicit code injection for subprocess tests, never a CLI/env flag.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { verifyArchive } from './report.mjs'
import { gitReader } from './write.mjs'
import { createOperationHistory } from './target-check-history.mjs'

const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')
const repository = 'zilliztech/zdoc',
  repositoryId = 660446555
const page = 'json-field-overview',
  lockPath = 'shared-docs/guides/pages/' + page + '/lock.yaml'
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const need = (ok, code) => {
  if (!ok) throw new Error(code)
}
const oid = (value) =>
  typeof value === 'string' &&
  /^[a-f0-9]{40}$/.test(value) &&
  !/^0+$/.test(value)
const positive = (value) => {
  const n = Number(value)
  need(
    Number.isSafeInteger(n) && n > 0 && String(n) === String(value),
    'INPUT_ID'
  )
  return n
}
const request = (value) => {
  need(
    typeof value === 'string' &&
      /^[A-Za-z0-9][A-Za-z0-9/_.:-]{0,199}$/.test(value),
    'INPUT_REQUEST'
  )
  return value
}
const found = (result) => {
  need(result.kind === 'found', 'REMOTE_STATE_UNKNOWN')
  return result.value
}
const same = (c, a, b) =>
  Buffer.from(c.canonicalBytes(a)).equals(Buffer.from(c.canonicalBytes(b)))
const b64 = (bytes) => Buffer.from(bytes).toString('base64')
const errorCode = (error) =>
  error instanceof Error && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.message)
    ? error.message
    : 'INVALID_EVIDENCE'

export async function loadTargetCheckContract() {
  const bundle = join(
    mkdtempSync(join(realpathSync(tmpdir()), 'shared-guides-check-bundle-')),
    'writer-contract.mjs'
  )
  execFileSync(
    join(
      repoRoot,
      'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'
    ),
    [
      join(moduleRoot, 'writer-contract.ts'),
      '--bundle',
      '--platform=node',
      '--format=esm',
      '--target=node22',
      '--log-level=error',
      '--outfile=' + bundle
    ],
    { timeout: 120000, maxBuffer: 1024 * 1024 }
  )
  return import(pathToFileURL(bundle))
}

function context(c, registration, env, git, phase) {
  const m = git.head
  const loaded = c.loadTargetCheckRegistration(registration, m)
  if (loaded.status === 'held') return loaded
  const { policy, finalizer } = loaded
  need(
    policy.repositoryId === repositoryId &&
      policy.repositoryFullName === repository &&
      policy.host === 'github.com' &&
      policy.baseRef === 'master' &&
      policy.writerActorId === 41898282 &&
      [policy.producer, policy.validator, finalizer].every(
        (identity) => identity.actorId !== policy.writerActorId
      ) &&
      policy.sealIdentity.platformSignerActorId === 19864447 &&
      policy.checkAppId === 15368 &&
      policy.checkName === 'shared-update-exact-validation' &&
      policy.producerArtifactName === 'shared-guides-update-producer' &&
      policy.validatorArtifactName === 'shared-guides-validation' &&
      policy.producer.workflowPath ===
        '.github/workflows/shared-guides-update.yml' &&
      policy.validator.workflowPath ===
        '.github/workflows/shared-guides-validate.yml' &&
      finalizer.workflowPath === '.github/workflows/shared-guides-finalize.yml',
    'REGISTRATION_IDENTITY'
  )
  const identity = phase === 'finalize' ? finalizer : policy.validator
  need(
    identity.event === 'workflow_dispatch' &&
      oid(m) &&
      env.GITHUB_ACTIONS === 'true' &&
      env.GITHUB_SERVER_URL === 'https://github.com' &&
      env.GITHUB_API_URL === 'https://api.github.com' &&
      env.GITHUB_REPOSITORY === repository &&
      env.GITHUB_REPOSITORY_ID === String(repositoryId) &&
      env.GITHUB_REF === 'refs/heads/master' &&
      env.GITHUB_SHA === m &&
      env.GITHUB_WORKFLOW_SHA === m &&
      env.GITHUB_WORKFLOW_REF ===
        repository + '/' + identity.workflowPath + '@refs/heads/master' &&
      env.GITHUB_JOB === phase &&
      env.GITHUB_EVENT_NAME === identity.event &&
      env.GITHUB_ACTOR_ID === String(identity.actorId) &&
      env.GITHUB_RUN_ATTEMPT === '1',
    'RUNTIME_CONTEXT'
  )
  need(
    hash(git.baseFile(m, identity.workflowPath)) ===
      identity.workflowDefinitionSha256,
    'RUNTIME_DEFINITION'
  )
  return {
    ...loaded,
    master: m,
    runId: positive(env.GITHUB_RUN_ID),
    attempt: 1,
    identity
  }
}

// A fixture supplies fake socket/transport and a local bare-object reader, with no real token
// or fallback network. Its registry still exercises the exact production identity checks.
export async function createTargetCheckFixture({
  c,
  registration,
  env,
  git,
  transport,
  sourceTransport,
  socketRequest,
  phase,
  evidenceRoot
}) {
  need(
    typeof transport === 'function' &&
      typeof sourceTransport === 'function' &&
      typeof socketRequest === 'function',
    'FIXTURE_TRANSPORT_REQUIRED'
  )
  return createSession({
    c,
    registration,
    env,
    git,
    transport,
    sourceTransport,
    socketRequest,
    phase,
    evidenceRoot,
    token: 'fixture-only-token'
  })
}

export async function createTargetCheckProduction(c, env, phase, evidenceRoot) {
  const registration = c.parseStrictJson(
    readFileSync(join(moduleRoot, 'reviewed-check.json'))
  )
  // Bootstrap holds before Git acquisition, credentials, or any network/mutation.
  const readiness = c.loadTargetCheckRegistration(registration, env.GITHUB_SHA)
  if (readiness.status === 'held') return readiness
  need(
    env.GITHUB_WORKSPACE === repoRoot &&
      process.cwd() === repoRoot &&
      env.RUNNER_TEMP &&
      resolve(env.RUNNER_TEMP) === env.RUNNER_TEMP,
    'RUNTIME_PATHS'
  )
  const git = gitReader(
    repoRoot,
    mkdtempSync(join(env.RUNNER_TEMP, 'shared-guides-check-objects-'))
  )
  return createSession({
    c,
    registration,
    env,
    git,
    phase,
    evidenceRoot,
    transport: c.createRemoteTransport({ repositoryFullName: repository }),
    sourceTransport: c.createRemoteTransport({
      repositoryFullName: 'milvus-io/milvus-docs'
    })
  })
}

async function createSession(options) {
  const {
    c,
    registration,
    env,
    git,
    phase,
    evidenceRoot,
    transport,
    sourceTransport
  } = options
  const ctx = context(c, registration, env, git, phase)
  if (ctx.status === 'held') return ctx
  const { policy, master } = ctx
  const evidence = await c.initializeEvidence({
    root: evidenceRoot,
    repositories: [],
    owner: 'target-check-' + phase
  })
  const reads = c.createRemoteReads({
    policy,
    evidence,
    transport,
    approvedProducers: ctx.producers
  })
  need(c.remoteReadContext(reads), 'REMOTE_ADAPTER_REQUIRED')
  const finalizerReads = c.createRemoteReads({
    policy: { ...policy, validator: ctx.finalizer },
    evidence,
    transport,
    approvedProducers: ctx.producers
  })
  const history = createOperationHistory({
    c,
    reads,
    finalizerReads,
    policy,
    finalizer: ctx.finalizer,
    master,
    runId: ctx.runId,
    attempt: ctx.attempt
  })

  // No general mutation client is exposed to callers.
  const writer = c.createCheckWriter({
    repositoryFullName: repository,
    checkAppId: policy.checkAppId,
    checkName: policy.checkName,
    ...(options.socketRequest
      ? { socketRequest: options.socketRequest, token: options.token }
      : {})
  })
  const objects = {
    read: async (id, type) => {
      try {
        const bytes = await git.source.read(id, type)
        await evidence.writeBlob(bytes)
        return { kind: 'found', value: bytes }
      } catch {
        return { kind: 'unknown', reasons: ['OBJECT_READ'] }
      }
    }
  }
  const ownRun = async () => {
    const path =
      '/repos/' +
      repository +
      '/actions/runs/' +
      ctx.runId +
      '/attempts/' +
      ctx.attempt
    const observed = []
    for (let i = 0; i < 2; i++) {
      const response = await transport({
        method: 'GET',
        path,
        maximum: 1024 * 1024,
        signal: AbortSignal.timeout(30000)
      })
      need(response.status === 200, 'RUNTIME_RUN_READ')
      const run = c.parseStrictJson(response.body)
      need(
        run.id === ctx.runId &&
          run.run_attempt === ctx.attempt &&
          run.repository?.id === repositoryId &&
          run.head_repository?.id === repositoryId &&
          run.head_sha === master &&
          run.head_branch === 'master' &&
          run.workflow_id === ctx.identity.workflowId &&
          run.path === ctx.identity.workflowPath &&
          run.actor?.id === ctx.identity.actorId &&
          run.event === 'workflow_dispatch' &&
          run.status === 'in_progress',
        'RUNTIME_RUN_IDENTITY'
      )
      observed.push(run)
      await evidence.writeBlob(response.body)
    }
    need(same(c, observed[0], observed[1]), 'RUNTIME_RUN_RACE')
  }
  const sourceHead = async () => {
    const observed = []
    for (let i = 0; i < 2; i++) {
      const response = await sourceTransport({
        method: 'GET',
        path: '/repos/milvus-io/milvus-docs/git/ref/heads/v3.0.x',
        maximum: 1024 * 1024,
        signal: AbortSignal.timeout(30000)
      })
      need(response.status === 200, 'SOURCE_READ')
      const ref = c.parseStrictJson(response.body)
      need(
        ref.ref === 'refs/heads/v3.0.x' &&
          ref.object?.type === 'commit' &&
          oid(ref.object.sha),
        'SOURCE_REF'
      )
      observed.push(ref.object.sha)
      await evidence.writeBlob(response.body)
    }
    need(observed[0] === observed[1], 'SOURCE_RACE')
    return observed[0]
  }
  const live = async (material) => {
    const pull = found(await reads.readPull(material.pull.number))
    need(
      same(c, { ...pull, evidence: [] }, { ...material.pull, evidence: [] }),
      'PR_CHANGED'
    )
    need(
      found(await reads.readRef(material.intent.targetRef)).oid ===
        material.provenance.seal,
      'PR_HEAD_CHANGED'
    )
    const observed = {
      master: found(await reads.readRef('master')).oid,
      dev: found(await reads.readRef('dev')).oid,
      source: await sourceHead()
    }
    for (const key of ['master', 'dev', 'source'])
      need(observed[key] === material.pins[key], 'STALE_' + key.toUpperCase())
    return observed
  }
  const authenticate = async (input, requestId) => {
    await ownRun()
    const producerId = positive(input.producerRunId),
      producerAttempt = positive(input.producerAttempt),
      prNumber = positive(input.prNumber)
    const run = found(
      await reads.readRun({
        id: producerId,
        attempt: producerAttempt,
        role: 'producer'
      })
    )
    need(run.toolingHead === master, 'PRODUCER_M_BINDING')
    const archive = found(
      await reads.readArtifact({
        runId: producerId,
        attempt: producerAttempt,
        name: policy.producerArtifactName
      })
    )
    const material = verifyArchive(
      c,
      { runId: producerId, runAttempt: producerAttempt, repositoryId },
      ctx.producers[0],
      archive.members
    )
    const { provenance: p, plan, report, pins } = material
    const get = (name) => {
      const bytes = archive.members.get(name)
      need(bytes, 'PRODUCER_MEMBER')
      return Buffer.from(bytes)
    }
    const proofBytes = get('proof.json'),
      proof = c.parseStrictJson(proofBytes)
    need(
      proofBytes.equals(c.canonicalBytes(proof)) &&
        plan.nextEdits.length === 1 &&
        plan.reports.length === 1 &&
        plan.nextEdits[0].before.path === lockPath &&
        plan.nextEdits[0].target === pins.source &&
        p.master === master &&
        p.tools === master &&
        p.preparedBase === master &&
        p.previousSeal === null &&
        p.preservedHumanHeads.length === 0 &&
        p.candidate === proof.candidate &&
        p.candidateTree === proof.candidateTree,
      'PRODUCER_BINDING'
    )
    const expectedNames = [
      'provenance.json',
      'plan.json',
      'proof.json',
      'patch.raw',
      'reports/' + plan.reports[0].sha256 + '.json',
      'locks/' + plan.nextEdits[0].afterBlob.sha256 + '.yaml'
    ].sort()
    need(
      same(c, [...archive.members.keys()].sort(), expectedNames),
      'PRODUCER_INVENTORY'
    )
    const targetRef =
      'shared-update/' +
      hash(c.canonicalBytes({ kind: 'remote-unit', unitKey: plan.unitKey }))
    const pull = found(await reads.readPull(prNumber))
    need(pull.headRef === targetRef, 'PR_TARGET_REF')
    need(
      pull.base === master &&
        pull.head === p.seal &&
        pull.state === 'open' &&
        pull.draft &&
        pull.actorId === policy.writerActorId,
      'PR_BINDING'
    )
    const planRef = await evidence.writeBlob(get('plan.json')),
      proofRef = await evidence.writeBlob(proofBytes)
    const intent = {
      kind: 'shared-update-remote-intent',
      schemaVersion: 1,
      repositoryId,
      repositoryFullName: repository,
      master,
      dev: p.dev,
      transactionId: p.transactionId,
      unitKey: p.unitKey,
      planSha256: p.planSha256,
      proofSha256: p.proofSha256,
      plan: planRef,
      proof: proofRef,
      preparedBase: p.preparedBase,
      candidate: p.candidate,
      candidateTree: p.candidateTree,
      previousSeal: p.previousSeal,
      preservedHumanHeads: p.preservedHumanHeads,
      targetRef,
      expectedHead: null,
      stagingRef: 'shared-update-staging/' + p.transactionId,
      pulls: [],
      producerRunId: producerId,
      producerRunAttempt: producerAttempt,
      producerRequestId: p.requestId,
      requestId
    }
    // Fetch only into isolated object storage. No checkout, hook, candidate process, or candidate import.
    await git.readSeal(p.seal)
    await c.verifiedSeal(reads, objects, intent, p.seal)
    const delta = await c.planNewGuidesObjectTransfer({
      master,
      dev: p.dev,
      plan,
      proof,
      source: git.source,
      baseline: git.baseline
    })
    await evidence.writeBlob(delta.base.bytes)
    await evidence.writeBlob(delta.rawDiff)
    for (const object of delta.objects) await evidence.writeBlob(object.bytes)
    need(
      hash(delta.rawDiff) === hash(get('patch.raw')) &&
        report.pins.trustedTools === master &&
        report.pins.configSnapshot === master &&
        report.pins.configTreeOid === delta.baseTree &&
        report.pins.toolsetSha256 === proof.trustedToolsetSha256 &&
        report.authority.provider === 'guides-retained-source' &&
        report.authority.updateState === 'eligible-to-propose',
      'PRODUCER_REPORT_BINDING'
    )
    const result = { ...material, pull, intent, archive, proof, get }
    await live(result)
    return result
  }
  const correlation = (runId, attempt, requestId) =>
    'shared-guides/v1/' +
    runId +
    '/' +
    attempt +
    '/' +
    hash(c.canonicalBytes({ requestId }))
  const reserved = async (material, runId, attempt, requestId) => {
    const checks = found(await reads.readChecks(material.provenance.seal))
    const matches = checks.filter(
      (ch) => ch.name === policy.checkName && ch.appId === policy.checkAppId
    )
    need(matches.length === 1, 'CHECK_AMBIGUOUS_OR_MISSING')
    const check = matches[0]
    need(
      check.head === material.provenance.seal &&
        check.externalId === correlation(runId, attempt, requestId),
      'CHECK_REQUEST_BINDING'
    )
    return check
  }
  const formalArgs = (material, output, observed) => ({
    planBase64: b64(material.get('plan.json')),
    outputBase64: b64(output),
    reportsBase64: material.plan.reports.map((ref) => ({
      name: 'reports/' + ref.sha256 + '.json',
      bytesBase64: b64(material.get('reports/' + ref.sha256 + '.json'))
    })),
    observed
  })
  return {
    status: 'ready',
    evidence,
    async reserve(input, journal) {
      const requestId = request(input.requestId),
        material = await authenticate(input, requestId)
      const checks = found(await reads.readChecks(material.provenance.seal))
      // Existing/partial/unknown reservations hold. A later invocation never retries POST.
      need(
        !checks.some((ch) => ch.name === policy.checkName),
        'CHECK_ALREADY_EXISTS'
      )
      await history.beforeReserve(material.provenance.seal)
      await live(material)
      const latestChecks = found(
        await reads.readChecks(material.provenance.seal)
      )
      need(
        !latestChecks.some((check) => check.name === policy.checkName),
        'CHECK_ALREADY_EXISTS'
      )
      journal({
        action: 'reserve',
        phase: 'before',
        head: material.provenance.seal,
        runId: ctx.runId,
        attempt: ctx.attempt,
        requestId
      })
      const check = await writer.reserve({
        headSha: material.provenance.seal,
        externalId: correlation(ctx.runId, ctx.attempt, requestId)
      })
      journal({
        action: 'reserve',
        phase: 'after',
        id: check.id,
        suiteId: check.suiteId
      })
      const readback = await reserved(
        material,
        ctx.runId,
        ctx.attempt,
        requestId
      )
      need(
        readback.id === check.id &&
          readback.suiteId === check.suiteId &&
          readback.status === 'in_progress' &&
          readback.conclusion === 'pending',
        'CHECK_READBACK'
      )
      return {
        status: 'reserved',
        id: check.id,
        suiteId: check.suiteId,
        head: check.head,
        producerRunId: positive(input.producerRunId),
        producerAttempt: positive(input.producerAttempt),
        prNumber: material.pull.number,
        requestId
      }
    },
    async validate(input) {
      const requestId = request(input.requestId),
        material = await authenticate(input, requestId)
      const check = await reserved(material, ctx.runId, ctx.attempt, requestId)
      need(
        check.id === positive(input.checkId) &&
          check.suiteId === positive(input.suiteId) &&
          check.status === 'in_progress' &&
          check.conclusion === 'pending',
        'CHECK_RESERVATION_BINDING'
      )
      const observed = await live(material)
      const output = c.canonicalBytes({
        kind: 'shared-guides-exact-output',
        schemaVersion: 1,
        pins: material.pins,
        producerRunId: positive(input.producerRunId),
        producerAttempt: positive(input.producerAttempt),
        prNumber: material.pull.number,
        producerArchiveSha256: material.archive.archive.sha256,
        requestId,
        validatorRunId: ctx.runId,
        validatorAttempt: ctx.attempt,
        seal: material.provenance.seal,
        checkId: check.id,
        suiteId: check.suiteId
      })
      const receipt = {
        kind: 'shared-update-exact-validation',
        schemaVersion: 1,
        repositoryId,
        prNumber: material.pull.number,
        head: material.provenance.seal,
        seal: material.provenance.seal,
        master,
        dev: material.pins.dev,
        tools: master,
        unitKey: material.plan.unitKey,
        planSha256: c.digest('plan', material.plan),
        requestId,
        runId: ctx.runId,
        runAttempt: ctx.attempt,
        workflowPath: policy.validator.workflowPath,
        workflowDefinitionSha256: policy.validator.workflowDefinitionSha256,
        targetCheckId: check.id,
        targetSuiteId: check.suiteId,
        targetCheckAppId: check.appId,
        targetCheckHead: check.head,
        outputDigest: hash(output),
        conclusion: 'success'
      }
      const encoded = c.formalValidation(
        { op: 'receipt', receipt, ...formalArgs(material, output, observed) },
        { repositoryId }
      )
      need(encoded.status === 'encoded', 'FORMAL_RECEIPT_HELD')
      return {
        status: 'prepared',
        files: new Map([
          ['receipt.json', Buffer.from(encoded.bytesBase64, 'base64')],
          ['output.json', output]
        ]),
        id: check.id,
        suiteId: check.suiteId,
        head: check.head,
        requestId
      }
    },
    async finalize(input, journal) {
      await ownRun()
      const runId = positive(input.validatorRunId),
        attempt = positive(input.validatorAttempt),
        requestId = request(input.requestId)
      need(runId !== ctx.runId, 'INDEPENDENT_RUN_REQUIRED')
      const run = found(
        await reads.readRun({ id: runId, attempt, role: 'validator' })
      )
      need(run.toolingHead === master, 'VALIDATOR_M_BINDING')
      const archive = found(
        await reads.readArtifact({
          runId,
          attempt,
          name: policy.validatorArtifactName
        })
      )
      need(
        same(c, [...archive.members.keys()].sort(), [
          'output.json',
          'receipt.json'
        ]),
        'VALIDATOR_INVENTORY'
      )
      const output = archive.members.get('output.json'),
        receiptBytes = archive.members.get('receipt.json')
      const data = c.parseStrictJson(output),
        receipt = c.parseStrictJson(receiptBytes)
      need(
        Buffer.from(output).equals(c.canonicalBytes(data)) &&
          Buffer.from(receiptBytes).equals(c.canonicalBytes(receipt)) &&
          data.kind === 'shared-guides-exact-output' &&
          data.schemaVersion === 1 &&
          data.validatorRunId === runId &&
          data.validatorAttempt === attempt &&
          data.requestId === requestId &&
          receipt.runId === runId &&
          receipt.runAttempt === attempt &&
          receipt.requestId === requestId &&
          receipt.outputDigest === hash(output),
        'VALIDATOR_OUTPUT_BINDING'
      )
      const material = await authenticate(data, requestId)
      need(
        data.producerArchiveSha256 === material.archive.archive.sha256 &&
          data.seal === material.provenance.seal &&
          data.prNumber === receipt.prNumber &&
          data.checkId === receipt.targetCheckId &&
          data.suiteId === receipt.targetSuiteId,
        'VALIDATOR_ASSOCIATION'
      )
      const authenticated = await c.authenticateValidationMaterial(
        reads,
        evidence,
        material.intent,
        material.provenance.seal,
        material.pull,
        { id: runId, attempt },
        objects
      )
      need(
        Buffer.from(authenticated.receiptBytes).equals(
          Buffer.from(receiptBytes)
        ) && Buffer.from(authenticated.output).equals(Buffer.from(output)),
        'VALIDATOR_ARCHIVE_RACE'
      )
      // A later successful read cannot erase an earlier unknown or conflicting inventory.
      const initialChecks = found(authenticated.facts.checks)
      const initialTargets = initialChecks.filter(
        (check) =>
          check.appId === policy.checkAppId &&
          check.name === policy.checkName &&
          check.head === material.provenance.seal
      )
      need(initialTargets.length === 1, 'CHECK_OBSERVATION_AMBIGUOUS')
      const check = await reserved(material, runId, attempt, requestId)
      const { externalId: _initialCorrelation, ...checkFact } = check
      need(
        same(
          c,
          { ...initialTargets[0], evidence: [] },
          { ...checkFact, evidence: [] }
        ),
        'CHECK_OBSERVATION_CONFLICT'
      )
      need(
        check.id === receipt.targetCheckId &&
          check.suiteId === receipt.targetSuiteId,
        'CHECK_RECEIPT_BINDING'
      )
      const observed = await live(material)
      const args = {
        ...formalArgs(material, output, observed),
        expected: authenticated.expected,
        facts: authenticated.facts,
        receiptBase64: b64(receiptBytes),
        policy
      }
      const successful = (target, accepted, reused = false) => ({
        status: 'accepted',
        reused,
        id: target.id,
        suiteId: target.suiteId,
        evidence: accepted.evidence,
        operation: c.canonicalBytes({
          kind: 'shared-guides-finalization',
          schemaVersion: 1,
          repositoryId,
          master,
          runId: ctx.runId,
          runAttempt: ctx.attempt,
          workflowPath: ctx.identity.workflowPath,
          workflowDefinitionSha256: ctx.identity.workflowDefinitionSha256,
          status: 'accepted',
          validatorRunId: runId,
          validatorAttempt: attempt,
          requestId,
          receiptSha256: hash(receiptBytes),
          outputDigest: hash(output),
          target: {
            id: target.id,
            suiteId: target.suiteId,
            appId: target.appId,
            name: target.name,
            head: target.head
          }
        })
      })
      // A repeated finalization is read-only and must authenticate the prior success completely.
      if (check.status === 'completed') {
        const accepted = c.formalValidation(
          { op: 'accept', ...args },
          { repositoryId }
        )
        need(accepted.status === 'accepted', 'PRIOR_CHECK_NOT_ACCEPTED')
        return successful(check, accepted, true)
      }
      need(
        check.status === 'in_progress' && check.conclusion === 'pending',
        'CHECK_NOT_RESERVED'
      )
      const prepublish = c.formalValidation(
        { op: 'prepublish', ...args },
        { repositoryId }
      )
      if (prepublish.status !== 'ready-to-publish')
        return {
          status: 'held',
          reasons: prepublish.reasons,
          mutationRequested: false
        }
      // The same live Check is passed to prepublish and the writer. Re-read PR/refs last.
      await history.beforeComplete(check)
      const latest = await reserved(material, runId, attempt, requestId)
      need(
        same(c, { ...latest, evidence: [] }, { ...check, evidence: [] }),
        'CHECK_CHANGED'
      )
      await live(material)
      journal({
        action: 'complete',
        phase: 'before',
        id: latest.id,
        suiteId: latest.suiteId,
        head: latest.head
      })
      const completed = await writer.complete({
        reservation: latest,
        headSha: material.provenance.seal
      })
      journal({
        action: 'complete',
        phase: 'after',
        id: completed.id,
        suiteId: completed.suiteId
      })
      const after = await reserved(material, runId, attempt, requestId)
      need(
        after.id === latest.id &&
          after.suiteId === latest.suiteId &&
          after.status === 'completed' &&
          after.conclusion === 'success',
        'CHECK_READBACK'
      )
      await live(material)
      const { externalId: _externalId, ...frozen } = after
      const accepted = c.formalValidation(
        {
          op: 'accept',
          ...args,
          facts: {
            ...authenticated.facts,
            checks: { kind: 'found', value: [frozen] }
          }
        },
        { repositoryId }
      )
      if (accepted.status !== 'accepted')
        return {
          status: 'unknown',
          reasons: accepted.reasons,
          mutationRequested: true
        }
      return successful(after, accepted)
    }
  }
}

// Files are created once in an absent output directory; prior evidence is never overwritten.
// Only receipt/output enter the validator archive. Reports, journal and raw evidence are separate.
export async function runTargetCheckCLI({ session, phase, env, out }) {
  mkdirSync(out, { mode: 0o700 })
  const write = (name, bytes) =>
    writeFileSync(join(out, name), bytes, { flag: 'wx', mode: 0o600 })
  let mutationRequested = false
  const journal = (entry) => {
    if (entry.phase === 'before') mutationRequested = true
    appendFileSync(join(out, 'journal.ndjson'), JSON.stringify(entry) + '\n', {
      mode: 0o600
    })
  }
  let result
  try {
    if (session.status === 'held')
      result = {
        status: 'held',
        reasons: session.reasons,
        mutationRequested: false
      }
    else {
      const inputs = {
        producerRunId: env.PRODUCER_RUN_ID,
        producerAttempt: env.PRODUCER_ATTEMPT,
        prNumber: env.PR_NUMBER,
        requestId: env.REQUEST_ID,
        checkId: env.RESERVED_CHECK_ID,
        suiteId: env.RESERVED_SUITE_ID,
        validatorRunId: env.VALIDATOR_RUN_ID,
        validatorAttempt: env.VALIDATOR_ATTEMPT
      }
      result = await session[phase](inputs, journal)
      if (result.operation) {
        write('operation.json', result.operation)
        const { operation: _operation, ...report } = result
        result = report
      }
      if (result.files) {
        const archiveDir = join(out, 'archive')
        mkdirSync(archiveDir, { mode: 0o700 })
        for (const [name, bytes] of result.files)
          writeFileSync(join(archiveDir, name), bytes, {
            flag: 'wx',
            mode: 0o600
          })
        const { files: _files, ...report } = result
        result = report
      }
    }
  } catch (error) {
    result = {
      status: mutationRequested ? 'unknown' : 'held',
      reasons: [errorCode(error)],
      mutationRequested,
      inspection:
        'Inspect retained journal, evidence, run, PR and Checks read-only. Do not retry a writer to clear uncertainty.'
    }
  }
  write('result.json', JSON.stringify(result) + '\n')
  process.stdout.write(JSON.stringify(result) + '\n')
  return result
}

export async function targetCheckMain(kind) {
  need(process.argv.length === 2, 'INPUT_ARGUMENTS')
  const env = process.env,
    phase = kind === 'finalize' ? 'finalize' : env.GITHUB_JOB
  need(
    ['reserve', 'validate', 'finalize'].includes(phase) &&
      (kind === 'finalize') === (phase === 'finalize'),
    'INPUT_PHASE'
  )
  const c = await loadTargetCheckContract()
  const out = env[kind === 'finalize' ? 'FINALIZE_OUTPUT' : 'VALIDATE_OUTPUT']
  need(typeof out === 'string' && resolve(out) === out, 'OUTPUT_PATH')
  const evidenceRoot = out + '-evidence'
  let session
  try {
    session = await createTargetCheckProduction(c, env, phase, evidenceRoot)
  } catch (error) {
    session = { status: 'held', reasons: [errorCode(error)] }
  }
  const result = await runTargetCheckCLI({ session, phase, env, out })
  if (phase === 'reserve' && env.GITHUB_OUTPUT) {
    appendFileSync(env.GITHUB_OUTPUT, 'status=' + result.status + '\n')
    if (result.status === 'reserved')
      appendFileSync(
        env.GITHUB_OUTPUT,
        'check_id=' + result.id + '\nsuite_id=' + result.suiteId + '\n'
      )
  }
  if (['held', 'unknown'].includes(result.status)) process.exitCode = 1
}
