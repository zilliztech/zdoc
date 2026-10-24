'use strict'

// Dispatch plan for the hourly translation dispatcher. The plan is the
// operator-visible task list; git state is the only truth. Every cycle the
// dispatcher recomputes pending counts per translation unit and merges them
// into the plan: new work appends, completed work checks off, and bookkeeping
// (run ids, timestamps) only links evidence — it never decides work.

const PLAN_SCHEMA_VERSION = 1
const HISTORY_PER_UNIT = 3

function createDispatchPlan({generatedAt}) {
  return {schemaVersion: PLAN_SCHEMA_VERSION, generatedAt, units: {}}
}

// Cycle-scoped caches (the build-gate verdict and the alert dedup ledger)
// ride through merges untouched: they key on dev HEADs and event identities,
// not on unit observations, so a merge must never drop them.
function carryCycleCaches({from, onto}) {
  if (from.buildGate !== undefined) onto.buildGate = from.buildGate
  if (from.alerts !== undefined) onto.alerts = from.alerts
  return onto
}

function assertObservation(observation) {
  if (!observation || typeof observation !== 'object') throw new Error('Dispatch observation must be an object')
  if (typeof observation.unitKey !== 'string' || !observation.unitKey.startsWith('translation/')) throw new Error(`Dispatch observation has an invalid unit key: ${observation.unitKey}`)
  if (!/^[0-9a-f]{40}$/.test(observation.sourceCheckpointSha || '')) throw new Error(`Dispatch observation for ${observation.unitKey} needs a 40-character source checkpoint SHA`)
  if (!Number.isInteger(observation.pendingCount) || observation.pendingCount < 0) throw new Error(`Dispatch observation for ${observation.unitKey} needs a non-negative integer pending count`)
}

function isOpenStatus(status) {
  return status === 'open' || status === 'dispatched'
}

// One active entry per unit plus a bounded history of closed entries.
// Statuses: open (needs a dispatch), dispatched (a producer run was started;
// still counts as open work until pending reaches zero), blocked (the
// per-checkpoint dispatch-attempt budget was exhausted; not open work — the
// dispatcher stops re-dispatching it until the checkpoint moves), cleared
// (checked off — pending hit zero at this checkpoint), superseded (a newer
// source checkpoint replaced this entry while it was still open).
function mergeDispatchPlan({plan, observations, now}) {
  if (plan.schemaVersion !== PLAN_SCHEMA_VERSION) throw new Error(`Unsupported dispatch plan schema version: ${plan.schemaVersion}`)
  if (typeof now !== 'string' || !now) throw new Error('A merge timestamp is required')
  const observed = new Map(observations.map(observation => {
    assertObservation(observation)
    return [observation.unitKey, observation]
  }))
  const merged = carryCycleCaches({from: plan, onto: createDispatchPlan({generatedAt: now})})
  for (const [unitKey, unit] of Object.entries(plan.units || {})) {
    merged.units[unitKey] = {current: unit.current ? {...unit.current} : null, history: [...(unit.history || [])]}
  }
  for (const [unitKey, observation] of observed) {
    const unit = merged.units[unitKey] || {current: null, history: []}
    const current = unit.current
    const next = {
      unitKey,
      sourceCheckpointSha: observation.sourceCheckpointSha,
      pendingCount: observation.pendingCount,
      firstSeenAt: current && current.sourceCheckpointSha === observation.sourceCheckpointSha && isOpenStatus(current.status) ? current.firstSeenAt : now,
      lastCheckedAt: now,
    }
    if (observation.pendingCount === 0) {
      // Checked off. Keep the cleared identity so the same checkpoint cannot
      // be re-added as new work unless it genuinely goes stale again.
      if (current && isOpenStatus(current.status)) {
        unit.current = {...next, status: 'cleared', clearedAt: now, lastDispatch: current.lastDispatch || null}
      } else if (current && current.status === 'cleared') {
        unit.current = {...current, lastCheckedAt: now}
      } else if (current && current.status === 'blocked') {
        unit.current = {...next, status: 'cleared', clearedAt: now, lastDispatch: current.lastDispatch || null}
      }
    } else if (current && isOpenStatus(current.status) && current.sourceCheckpointSha === observation.sourceCheckpointSha) {
      // dispatchFailures and stalledCycles are the backoff budgets for THIS
      // checkpoint; merges must carry them (a fresh merge shape would
      // otherwise reset the budgets every cycle) and any newer checkpoint
      // naturally starts without them.
      unit.current = {...next, status: current.status, lastDispatch: current.lastDispatch || null, dispatchFailures: current.dispatchFailures || 0, stalledCycles: current.stalledCycles || 0}
    } else if (current && current.status === 'blocked' && current.sourceCheckpointSha === observation.sourceCheckpointSha) {
      // A blocked entry is carried verbatim except for the refreshed count:
      // firstSeenAt and the backoff budgets belong to the blocked checkpoint's
      // story and must not drift while the block stands.
      unit.current = {...next, firstSeenAt: current.firstSeenAt, dispatchFailures: current.dispatchFailures || 0, stalledCycles: current.stalledCycles || 0, status: 'blocked', blockedAt: current.blockedAt, blockedReason: current.blockedReason || null, blockedKind: current.blockedKind || null, lastDispatch: current.lastDispatch || null}
    } else {
      if (current && (isOpenStatus(current.status) || current.status === 'blocked')) {
        unit.history.push({...current, status: 'superseded', supersededAt: now})
      } else if (current && current.status === 'cleared') {
        // A newer checkpoint is new work; the checkpoint that cleared went
        // stale again — either way the closed entry moves to history.
        unit.history.push(current.sourceCheckpointSha === observation.sourceCheckpointSha
          ? {...current, status: 'superseded', supersededAt: now}
          : current)
      }
      unit.current = {...next, status: 'open', lastDispatch: null}
    }
    if (unit.history.length > HISTORY_PER_UNIT) unit.history = unit.history.slice(-HISTORY_PER_UNIT)
    merged.units[unitKey] = unit
  }
  return merged
}

function markDispatched({plan, unitKeys, runId, requestId, dispatchedAt}) {
  const merged = {...plan, units: {}}
  const wanted = new Set(unitKeys)
  for (const [unitKey, unit] of Object.entries(plan.units)) {
    if (wanted.has(unitKey)) {
      // Re-dispatch (a producer run ended with work remaining) replaces the
      // previous dispatch evidence but keeps the per-checkpoint attempt count
      // growing, so the backoff budget survives evidence replacement; cleared
      // units are never re-marked.
      if (!unit.current || !isOpenStatus(unit.current.status)) throw new Error(`Cannot mark unit dispatched that has no open work: ${unitKey}`)
      merged.units[unitKey] = {...unit, current: {...unit.current, status: 'dispatched', lastDispatch: {runId, requestId, dispatchedAt, attempts: (unit.current.lastDispatch?.attempts || 0) + 1}}}
      wanted.delete(unitKey)
    } else {
      merged.units[unitKey] = unit
    }
  }
  if (wanted.size) throw new Error(`Cannot mark unknown units dispatched: ${[...wanted].join(', ')}`)
  return merged
}

// Backoff terminal state: the unit keeps its dispatch evidence for triage but
// stops counting as open work. Any newer source checkpoint reopens the unit
// through the normal merge (supersede), which is the budget reset — the
// dispatcher never unblocks a unit on its own. The optional kind separates
// failure-budget blocks from no-progress (stall) blocks so alert and summary
// text can name the right remediation.
function markBlocked({plan, unitKeys, blockedAt, reason, kind}) {
  const merged = {...plan, units: {}}
  const wanted = new Set(unitKeys)
  for (const [unitKey, unit] of Object.entries(plan.units)) {
    if (wanted.has(unitKey)) {
      if (!unit.current || unit.current.status !== 'dispatched') throw new Error(`Cannot block a unit that has no dispatched work: ${unitKey}`)
      merged.units[unitKey] = {...unit, current: {...unit.current, status: 'blocked', blockedAt, blockedReason: reason || null, blockedKind: kind || null}}
      wanted.delete(unitKey)
    } else {
      merged.units[unitKey] = unit
    }
  }
  if (wanted.size) throw new Error(`Cannot mark unknown units blocked: ${[...wanted].join(', ')}`)
  return merged
}

// Admission control: pending files are budgeted per producer run, largest
// backlog first (stateless rotation — completed units drop to zero). A single
// unit larger than the whole budget still dispatches alone so progress never
// stalls, and SDK groups stay additionally bounded by the producer's own
// max_files cap.
function selectDispatchUnits({plan, budget}) {
  if (!Number.isInteger(budget) || budget <= 0) throw new Error('A positive integer dispatch budget is required')
  const open = Object.values(plan.units)
    .map(unit => unit.current)
    .filter(current => current && isOpenStatus(current.status))
    .sort((left, right) => right.pendingCount - left.pendingCount || left.unitKey.localeCompare(right.unitKey))
  const selected = []
  let total = 0
  for (const current of open) {
    if (selected.length > 0 && total + current.pendingCount > budget) continue
    selected.push(current.unitKey)
    total += current.pendingCount
    if (total >= budget) break
  }
  return {selected, totalPending: total, openCount: open.length}
}

function summarizePlan(plan) {
  const rows = Object.values(plan.units || {})
    .map(unit => unit.current)
    .filter(Boolean)
    .sort((left, right) => right.pendingCount - left.pendingCount || left.unitKey.localeCompare(right.unitKey))
  return {
    open: rows.filter(row => row.status === 'open').length,
    dispatched: rows.filter(row => row.status === 'dispatched').length,
    blocked: rows.filter(row => row.status === 'blocked').length,
    cleared: rows.filter(row => row.status === 'cleared').length,
    rows: rows.map(row => ({unitKey: row.unitKey, status: row.status, pendingCount: row.pendingCount, lastDispatch: row.lastDispatch ? row.lastDispatch.runId : null, blockedKind: row.blockedKind || null})),
  }
}

function parseDispatchPlan(value) {
  if (!value || typeof value !== 'object') throw new Error('Dispatch plan must be an object')
  if (value.schemaVersion !== PLAN_SCHEMA_VERSION) throw new Error(`Unsupported dispatch plan schema version: ${value.schemaVersion}`)
  if (!value.units || typeof value.units !== 'object' || Array.isArray(value.units)) throw new Error('Dispatch plan must carry a units map')
  return value
}

module.exports = {
  PLAN_SCHEMA_VERSION,
  createDispatchPlan,
  isOpenStatus,
  mergeDispatchPlan,
  markDispatched,
  markBlocked,
  selectDispatchUnits,
  summarizePlan,
  parseDispatchPlan,
}
