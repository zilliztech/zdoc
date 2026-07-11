'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const { validateAllGeneratedSidebars, validateSidebar } = require('./validate-generated-sidebars')

test('rejects duplicate document ids and keys recursively', () => {
  const sidebar = [{
    type: 'category',
    label: 'Collections',
    items: [
      { type: 'doc', id: 'api/java/add-field', key: 'doc:api/java/add-field' },
      { type: 'doc', id: 'api/java/add-field', key: 'doc:api/java/add-field' },
    ],
  }]
  assert.throws(() => validateSidebar(sidebar, 'fixture.sidebar.js'), /duplicate doc id.*duplicate key/is)
})

test('all tracked generated sidebars have unique document identities and translation keys', () => {
  assert.doesNotThrow(() => validateAllGeneratedSidebars(path.join(process.cwd(), 'config/generated')))
})
