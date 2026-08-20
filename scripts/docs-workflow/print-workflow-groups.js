#!/usr/bin/env node
'use strict'

const {loadTypeScript} = require('../lib/load-typescript')
const workflow = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')

const mode = process.argv[2]
if (mode === '--sdk-groups') process.stdout.write(workflow.sdkGroupIds().join(' '))
else if (mode === '--sdk-snapshot-groups') process.stdout.write(workflow.sdkSnapshotGroupIds().join(' '))
else if (mode === '--groups-json') process.stdout.write(JSON.stringify(workflow.sourcePublicationGroups()))
else if (mode === '--sdk-groups-json') process.stdout.write(JSON.stringify(workflow.sdkGroupIds()))
else if (mode === '--validate-groups') {
  try {
    workflow.parseSelectedGroups(process.argv[3] || '')
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exit(2)
  }
}
else throw new Error('Usage: print-workflow-groups.js --sdk-groups|--sdk-snapshot-groups|--groups-json|--sdk-groups-json|--validate-groups <value>')
