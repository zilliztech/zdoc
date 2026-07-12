'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { validateWorkflowPolicies } = require('./validate-workflow-policy')

test('GitHub Actions workflows satisfy documentation production safety policy', () => {
  assert.deepEqual(validateWorkflowPolicies(), [])
})
