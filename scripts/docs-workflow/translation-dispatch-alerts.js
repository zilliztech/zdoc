'use strict'

// Guard alerts for the hourly translation dispatcher. The events are rare,
// high-signal operator decisions (a blocked group, a backoff engagement, an
// unattributable red build, a broken translated file with no automated
// repair path), so they are deduplicated by event identity in the persisted
// plan: the dispatcher emits only unseen events, and the workflow's alert
// step marks them notified in the plan ONLY after Feishu delivery succeeds —
// a failed send leaves the plan unmarked and the next cycle retries.

const fs = require('node:fs')
const path = require('node:path')

const ALERT_LEDGER_LIMIT = 100

function assertEvent(event) {
  if (!event || typeof event !== 'object') throw new Error('A guard alert must be an object')
  if (typeof event.key !== 'string' || !/^[\w.:+\/-]+$/.test(event.key)) throw new Error(`A guard alert has an invalid key: ${event.key}`)
  if (typeof event.title !== 'string' || !event.title) throw new Error(`Guard alert ${event.key} needs a title`)
  if (typeof event.body !== 'string' || !event.body) throw new Error(`Guard alert ${event.key} needs a body`)
}

// The note is the card body; each event renders as a titled section.
function composeGuardNote(events) {
  if (!Array.isArray(events) || events.length === 0) throw new Error('Guard alerts are required')
  events.forEach(assertEvent)
  return events.map(event => `### ${event.title}\n\n${event.body}`).join('\n\n')
}

// Dedup ledger update: keys the alert step reports as delivered enter the
// ledger with the delivery time; the oldest entries drop past the bound so
// the plan cannot grow without limit.
function markAlertsNotified({plan, keys, now, limit = ALERT_LEDGER_LIMIT}) {
  if (!plan || typeof plan !== 'object') throw new Error('A dispatch plan is required')
  if (!Array.isArray(keys) || keys.some(key => typeof key !== 'string')) throw new Error('Delivered alert keys must be strings')
  if (typeof now !== 'string' || !now) throw new Error('A delivery timestamp is required')
  const notified = {...(plan.alerts && plan.alerts.notified || {})}
  for (const key of keys) notified[key] = now
  const bounded = Object.entries(notified)
    .sort((left, right) => String(left[1]).localeCompare(String(right[1])))
    .slice(-limit)
  return {...plan, alerts: {notified: Object.fromEntries(bounded)}}
}

function readAlerts(file) {
  const document = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!document || !Array.isArray(document.events)) throw new Error('Guard alerts file must carry an events array')
  document.events.forEach(assertEvent)
  return document
}

function main(argv) {
  const command = argv[0]
  if (!['note', 'mark'].includes(command)) throw new Error('Usage: translation-dispatch-alerts.js <note|mark> [options]')
  const args = new Map()
  for (let index = 1; index < argv.length; index += 2) args.set(argv[index], argv[index + 1])
  if (command === 'note') {
    if (!args.get('--alerts') || !args.get('--output')) throw new Error('note requires --alerts and --output')
    const document = readAlerts(args.get('--alerts'))
    fs.mkdirSync(path.dirname(path.resolve(args.get('--output'))), {recursive: true})
    fs.writeFileSync(args.get('--output'), `${composeGuardNote(document.events)}\n`)
    return
  }
  if (!args.get('--alerts') || !args.get('--plan')) throw new Error('mark requires --alerts and --plan')
  const document = readAlerts(args.get('--alerts'))
  const plan = require('./translation-dispatch-plan').parseDispatchPlan(JSON.parse(fs.readFileSync(args.get('--plan'), 'utf8')))
  const marked = markAlertsNotified({plan, keys: document.events.map(event => event.key), now: new Date().toISOString()})
  fs.writeFileSync(args.get('--plan'), `${JSON.stringify(marked)}\n`)
}

module.exports = {ALERT_LEDGER_LIMIT, composeGuardNote, markAlertsNotified}

if (require.main === module) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(String(error && error.message || error))
    process.exitCode = 1
  }
}
