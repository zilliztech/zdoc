// Cross-invocation write veto. Apparent Check absence or an old in-progress view never
// resolves a prior writer. Only authenticated successful different-target archives exclude it.
const need = (value, code) => {
  if (!value) throw new Error(code)
}
const found = (value, code) => {
  need(value.kind === 'found', code)
  return value.value
}
const b = (value) => Buffer.from(value)
const same = (c, a, d) => b(c.canonicalBytes(a)).equals(b(c.canonicalBytes(d)))
const positive = (value) => Number.isSafeInteger(value) && value > 0
const oid = (value) => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)
const hashPattern = (value) =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)

export function createOperationHistory({
  c,
  reads,
  finalizerReads,
  policy,
  finalizer,
  master,
  runId,
  attempt
}) {
  need(
    c.remoteReadContext(reads) && c.remoteReadContext(finalizerReads),
    'REMOTE_ADAPTER_REQUIRED'
  )
  async function history(reader, code) {
    const values = found(
      await reader.readOperationRuns({ master }),
      code + '_HISTORY_UNKNOWN'
    )
    // Bound work before authenticating each retained original archive.
    need(values.length <= 16, code + '_HISTORY_BUDGET')
    const own = values.filter((value) => value.id === runId)
    need(
      own.length === 1 &&
        own[0].attempt === attempt &&
        own[0].status === 'in_progress' &&
        own[0].conclusion === null,
      code + '_HISTORY_INCOMPLETE'
    )
    return values.filter((value) => value.id !== runId)
  }
  async function validatorArchive(run, code = 'PRIOR_VALIDATOR') {
    const authenticated = found(
      await reads.readRun({
        id: run.id,
        attempt: run.attempt,
        role: 'validator'
      }),
      code + '_RUN_UNKNOWN'
    )
    need(authenticated.toolingHead === master, code + '_M_BINDING')
    const artifact = found(
      await reads.readArtifact({
        runId: run.id,
        attempt: run.attempt,
        name: policy.validatorArtifactName
      }),
      code + '_ARCHIVE_UNKNOWN'
    )
    need(
      artifact.toolingHead === master &&
        same(c, [...artifact.members.keys()].sort(), [
          'output.json',
          'receipt.json'
        ]),
      code + '_INVENTORY'
    )
    const receiptBytes = artifact.members.get('receipt.json'),
      outputBytes = artifact.members.get('output.json')
    const receipt = c.ExactValidationReceiptV1Schema.parse(
        c.parseStrictJson(receiptBytes)
      ),
      output = c.parseStrictJson(outputBytes)
    need(
      b(receiptBytes).equals(c.canonicalBytes(receipt)) &&
        b(outputBytes).equals(c.canonicalBytes(output)) &&
        receipt.repositoryId === policy.repositoryId &&
        receipt.master === master &&
        receipt.tools === master &&
        receipt.runId === run.id &&
        receipt.runAttempt === run.attempt &&
        receipt.workflowPath === policy.validator.workflowPath &&
        receipt.workflowDefinitionSha256 ===
          policy.validator.workflowDefinitionSha256 &&
        receipt.conclusion === 'success' &&
        receipt.head === receipt.seal &&
        receipt.targetCheckHead === receipt.seal &&
        receipt.targetCheckAppId === policy.checkAppId &&
        output.kind === 'shared-guides-exact-output' &&
        output.schemaVersion === 1 &&
        output.validatorRunId === run.id &&
        output.validatorAttempt === run.attempt &&
        output.requestId === receipt.requestId &&
        output.seal === receipt.seal &&
        output.prNumber === receipt.prNumber &&
        output.checkId === receipt.targetCheckId &&
        output.suiteId === receipt.targetSuiteId &&
        c.rawSha256(outputBytes) === receipt.outputDigest,
      code + '_ASSOCIATION'
    )
    return { receipt, receiptSha256: c.rawSha256(receiptBytes) }
  }
  return {
    async beforeReserve(seal) {
      for (const run of await history(reads, 'VALIDATOR')) {
        need(
          run.status === 'completed' && run.conclusion === 'success',
          'PRIOR_VALIDATOR_OUTCOME_UNKNOWN'
        )
        const { receipt } = await validatorArchive(run)
        need(receipt.seal !== seal, 'PRIOR_VALIDATOR_SAME_TARGET')
      }
    },
    async beforeComplete(check) {
      for (const run of await history(finalizerReads, 'FINALIZER')) {
        need(
          run.status === 'completed' && run.conclusion === 'success',
          'PRIOR_FINALIZER_OUTCOME_UNKNOWN'
        )
        const authenticated = found(
          await finalizerReads.readRun({
            id: run.id,
            attempt: run.attempt,
            role: 'validator'
          }),
          'PRIOR_FINALIZER_RUN_UNKNOWN'
        )
        need(authenticated.toolingHead === master, 'PRIOR_FINALIZER_M_BINDING')
        const artifact = found(
          await finalizerReads.readArtifact({
            runId: run.id,
            attempt: run.attempt,
            name: 'shared-guides-finalization'
          }),
          'PRIOR_FINALIZER_ARCHIVE_UNKNOWN'
        )
        need(
          artifact.toolingHead === master &&
            same(c, [...artifact.members.keys()], ['operation.json']),
          'PRIOR_FINALIZER_INVENTORY'
        )
        const bytes = artifact.members.get('operation.json'),
          operation = c.parseStrictJson(bytes)
        need(
          b(bytes).equals(c.canonicalBytes(operation)) &&
            operation.kind === 'shared-guides-finalization' &&
            operation.schemaVersion === 1 &&
            operation.repositoryId === policy.repositoryId &&
            operation.master === master &&
            operation.runId === run.id &&
            operation.runAttempt === run.attempt &&
            operation.workflowPath === finalizer.workflowPath &&
            operation.workflowDefinitionSha256 ===
              finalizer.workflowDefinitionSha256 &&
            operation.status === 'accepted' &&
            positive(operation.validatorRunId) &&
            positive(operation.validatorAttempt) &&
            hashPattern(operation.receiptSha256) &&
            hashPattern(operation.outputDigest),
          'PRIOR_FINALIZER_ASSOCIATION'
        )
        const prior = await validatorArchive(
          { id: operation.validatorRunId, attempt: operation.validatorAttempt },
          'PRIOR_FINALIZER_VALIDATOR'
        )
        const target = operation.target,
          receipt = prior.receipt
        need(
          target &&
            positive(target.id) &&
            positive(target.suiteId) &&
            oid(target.head) &&
            target.appId === policy.checkAppId &&
            target.name === policy.checkName &&
            target.id === receipt.targetCheckId &&
            target.suiteId === receipt.targetSuiteId &&
            target.head === receipt.targetCheckHead &&
            operation.requestId === receipt.requestId &&
            operation.receiptSha256 === prior.receiptSha256 &&
            operation.outputDigest === receipt.outputDigest,
          'PRIOR_FINALIZER_TARGET_BINDING'
        )
        // Same S or Check ID cannot be excluded by a stale current status or another request ID.
        need(
          target.head !== check.head && target.id !== check.id,
          'PRIOR_FINALIZER_SAME_TARGET'
        )
      }
    }
  }
}
