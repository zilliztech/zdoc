'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

function loadWorkflow(file) {
  return yaml.load(fs.readFileSync(file, 'utf8'))
}

test('Translation producers use workload-aware worker and chunk limits without operator inputs', () => {
  const workflow = loadWorkflow('.github/workflows/_translate-content-group.yml')
  const inputs = workflow.on.workflow_call.inputs
  const preflight = workflow.jobs.translate.steps.find(step => step.name === 'Resolve current recovery compatibility')
  const agents = workflow.jobs.translate.steps.find(step => step.name === 'Run translation agents')

  for (const unsafeInput of ['concurrency', 'chunk_target_chars', 'chunk_max_chars']) {
    assert.equal(inputs[unsafeInput], undefined, `${unsafeInput} must not be operator-controlled`)
  }
  assert.equal(
    agents.env.TRANSLATION_CONCURRENCY,
    "${{ inputs.group == 'guides' && '1' || inputs.target == 'zh-CN-reference' && '2' || '4' }}",
  )
  assert.equal(
    agents.env.TRANSLATION_CHUNK_TARGET_CHARS,
    "${{ inputs.group == 'guides' && '8000' || '16000' }}",
  )
  assert.equal(
    agents.env.TRANSLATION_CHUNK_MAX_CHARS,
    "${{ inputs.group == 'guides' && '12000' || '24000' }}",
  )
  for (const name of ['TRANSLATION_CHUNK_TARGET_CHARS', 'TRANSLATION_CHUNK_MAX_CHARS']) {
    assert.equal(preflight.env[name], agents.env[name], `recovery preflight and Agent Runner must share ${name}`)
  }
  assert.equal(agents.if, "${{ inputs.should_translate && steps.manifest.outputs.count != '0' }}")
  const result = workflow.jobs.translate.steps.find(step => step.name === 'Emit translation result')
  assert.match(result.run, /steps\.agents\.outcome .*== skipped/)
})

test('Translation producer matrices bound model parallelism and retain the single Ready-FIFO writer', () => {
  const workflow = loadWorkflow('.github/workflows/translate-codex.yml')

  assert.equal(workflow.jobs.translate_guides_batches.strategy['max-parallel'], 1)
  assert.equal(workflow.jobs.translate_sdk.strategy['max-parallel'], 3)
  assert.deepEqual(workflow.jobs.publish_ready.needs, ['prepare'])
  assert.equal(workflow.jobs.publish_ready.permissions.contents, 'write')
  assert.match(JSON.stringify(workflow.jobs.publish_ready), /publication-coordinator\.js/)
  for (const producer of ['translate_guides_batches', 'translate_sdk', 'prepare_guides_publication_ready']) {
    assert.doesNotMatch(JSON.stringify(workflow.jobs[producer]), /publication-coordinator\.js|git push/)
  }
})
