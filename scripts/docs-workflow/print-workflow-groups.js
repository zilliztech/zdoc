#!/usr/bin/env node
'use strict'

const {loadTypeScript} = require('../lib/load-typescript')
const workflow = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')

const mode = process.argv[2]
if (mode === '--sdk-groups') process.stdout.write(workflow.sdkGroupIds().join(' '))
else if (mode === '--sdk-snapshot-groups') process.stdout.write(workflow.sdkSnapshotGroupIds().join(' '))
else throw new Error('Usage: print-workflow-groups.js --sdk-groups|--sdk-snapshot-groups')

