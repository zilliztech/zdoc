#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const slugify = require('slugify')
const { guidesCanonicalIsPublishable, guidesRecordPublishTargets } = require('../../plugins/lark-docs/guidesBaseRecordSemantics')

const TARGETS = ['zilliz.paas', 'zilliz.saas']

function normalizeTarget(target) {
  const value = String(target || '').trim().toLowerCase()
  if (value === 'saas') return 'zilliz.saas'
  if (value === 'paas' || value === 'byoc' || value === 'zilliz.byoc') return 'zilliz.paas'
  return value
}

function targetName(target) {
  return target === 'zilliz.paas' ? 'byoc' : 'saas'
}

function currentOwnership(snapshot) {
  const targets = new Map()
  const names = new Map()
  for (const record of snapshot.navigation_records || []) {
    if (record.table_id && record.table_name) names.set(record.table_id, record.table_name)
    if (!record.table_id || !guidesCanonicalIsPublishable(record)) continue
    const configured = guidesRecordPublishTargets(record).map(normalizeTarget).filter(target => TARGETS.includes(target))
    const effective = configured.length > 0 ? configured : TARGETS
    if (!targets.has(record.table_id)) targets.set(record.table_id, new Set())
    effective.forEach(target => targets.get(record.table_id).add(target))
  }
  return { targets, names }
}

function buildGuidesTableMatrix({ plan, snapshot }) {
  if (!plan || !['full', 'incremental'].includes(plan.mode)) throw new Error('Guides fetch plan mode must be full or incremental')
  if (!snapshot || snapshot.manual !== 'guides' || snapshot.schema_version !== 3 || !Array.isArray(snapshot.navigation_records)) throw new Error('Guides snapshot schema v3 navigation records are required')
  const current = currentOwnership(snapshot)
  const affected = new Set(plan.mode === 'full'
    ? [...current.targets.keys(), ...Object.keys(plan.previous_table_targets || {})]
    : (plan.affected_tables || []))
  const entries = []

  for (const tableId of affected) {
    const currentTargets = current.targets.get(tableId) || new Set()
    const previousTargets = new Set(plan.previous_table_targets?.[tableId] || [])
    const tableName = current.names.get(tableId) || plan.current_table_names?.[tableId] || plan.previous_table_names?.[tableId]
    if (!tableName && (currentTargets.size > 0 || previousTargets.size > 0)) throw new Error(`Missing Guides table name for ${tableId}`)
    for (const target of new Set([...currentTargets, ...previousTargets])) {
      const normalizedTarget = normalizeTarget(target)
      if (!TARGETS.includes(normalizedTarget)) continue
      entries.push({
        table_id: tableId,
        table_name: tableName,
        table_slug: slugify(tableName, { lower: true, strict: true }),
        target: normalizedTarget,
        target_name: targetName(normalizedTarget),
        cleanup: !currentTargets.has(normalizedTarget),
      })
    }
  }

  return entries.sort((a, b) => a.table_name.localeCompare(b.table_name) || a.target.localeCompare(b.target))
}

function argValue(args, name) {
  const index = args.indexOf(name)
  return index === -1 ? null : args[index + 1]
}

function main(argv) {
  const [command, ...args] = argv
  if (command !== 'matrix') throw new Error('Usage: guides-tables.js matrix --plan <plan.json> --snapshot <snapshot.json>')
  const planFile = argValue(args, '--plan')
  const snapshotFile = argValue(args, '--snapshot')
  if (!planFile || !snapshotFile) throw new Error('--plan and --snapshot are required')
  const matrix = buildGuidesTableMatrix({
    plan: JSON.parse(fs.readFileSync(planFile, 'utf8')),
    snapshot: JSON.parse(fs.readFileSync(snapshotFile, 'utf8')),
  })
  process.stdout.write(JSON.stringify(matrix))
}

if (require.main === module) {
  try { main(process.argv.slice(2)) } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { buildGuidesTableMatrix, normalizeTarget }
