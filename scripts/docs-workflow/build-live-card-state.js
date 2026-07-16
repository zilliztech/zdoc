'use strict'

const fs = require('node:fs')
const { deriveDocsProgressState } = require('./docs-progress-state')

function parseJobsResponse(value) {
  if (Array.isArray(value)) return value.flatMap(page => Array.isArray(page?.jobs) ? page.jobs : [])
  return Array.isArray(value?.jobs) ? value.jobs : []
}

function buildLiveCardState(input) {
  const reports = (input.notes || [])
    .filter(note => typeof note === 'string' && note.trim())
    .map(markdown => ({ markdown: markdown.trim() }))
  return deriveDocsProgressState({
    requestedGroups: input.requestedGroups,
    jobs: input.jobs,
    publishEnabled: input.publishEnabled,
    reports,
  })
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid arguments')
    result[flag.slice(2)] = value
  }
  return result
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const jobs = [
      ...parseJobsResponse(JSON.parse(fs.readFileSync(args['jobs-file'], 'utf8'))),
      ...(args['override-job'] ? [{
        name: args['override-job'],
        status: 'completed',
        conclusion: args['override-conclusion'] || 'success',
      }] : []),
    ]
    const state = buildLiveCardState({
      requestedGroups: JSON.parse(args['groups-json']),
      jobs,
      publishEnabled: args.publish === 'true',
      notes: args['notes-json'] ? JSON.parse(args['notes-json']) : [],
    })
    fs.writeFileSync(args.output, `${JSON.stringify(state, null, 2)}\n`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { buildLiveCardState, parseJobsResponse }
