'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const applyOverrides = require('./applyOverrides')

function withOverrides(overrides, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apply-overrides-'))
  const file = path.join(dir, 'overrides.json')
  fs.writeFileSync(file, JSON.stringify(overrides))
  try {
    fn(file)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

withOverrides({}, (overridePath) => {
  const result = applyOverrides([
    { type: 'category', label: 'Completion', items: [] },
    {
      type: 'category',
      label: 'MilvusClient',
      items: [
        { type: 'category', label: 'Empty nested', items: [] },
        { type: 'doc', id: 'reference/api/python/python/MilvusClient/Create', label: 'Create' },
      ],
    },
  ], overridePath)

  assert.deepEqual(result, [
    {
      type: 'category',
      label: 'MilvusClient',
      items: [
        { type: 'doc', id: 'reference/api/python/python/MilvusClient/Create', label: 'Create' },
      ],
    },
  ])
})

withOverrides({
  hide: ['reference/api/python/python/MilvusClient/Create'],
}, (overridePath) => {
  const result = applyOverrides([
    {
      type: 'category',
      label: 'MilvusClient',
      items: [
        { type: 'doc', id: 'reference/api/python/python/MilvusClient/Create', label: 'Create' },
      ],
    },
  ], overridePath)

  assert.deepEqual(result, [])
})

withOverrides({}, (overridePath) => {
  const result = applyOverrides([
    {
      type: 'category',
      label: 'Overview',
      link: { type: 'doc', id: 'reference/api/python/python/Overview' },
      items: [],
    },
  ], overridePath)

  assert.deepEqual(result, [
    {
      type: 'category',
      label: 'Overview',
      link: { type: 'doc', id: 'reference/api/python/python/Overview' },
      items: [],
    },
  ])
})

{
  const result = applyOverrides([
    { type: 'category', label: 'Completion', items: [] },
  ], path.join(os.tmpdir(), 'missing-overrides.json'))

  assert.deepEqual(result, [])
}
