'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {sidebarModuleContents, withReferenceLandingEntry} = require('./index')

function fixtureWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reference-landing-sidebar-'))
  fs.mkdirSync(path.join(root, 'config'), {recursive: true})
  fs.writeFileSync(path.join(root, 'config/reference-navigation.json'), JSON.stringify({
    targets: [
      {sidebar: 'python', landingPage: 'api/python/python/python.md'},
      {sidebar: 'cli', landingPage: 'cli/cli/Overview.md'},
      {sidebar: 'go', landingPage: 'api/go/go/go.md'},
      {sidebar: 'node', landingPage: 'api/nodejs/nodejs/nodejs.md'},
    ],
  }))
  const writeLanding = (relative, contents) => {
    const target = path.join(root, 'content/en/reference', relative)
    fs.mkdirSync(path.dirname(target), {recursive: true})
    fs.writeFileSync(target, contents)
  }
  // The Python landing page carries no sidebar_label or title; its label is
  // the first H1, exactly like readMetadata derives it on the reconcile side.
  writeLanding('api/python/python/python.md', `---

# Python SDK Reference

Body.
`)
  writeLanding('cli/cli/Overview.md', `---
title: "Zilliz CLI | Cloud"
sidebar_label: "Overview"
sidebar_position: 0
---

# Zilliz CLI
`)
  writeLanding('api/go/go/go.md', `---
title: Go SDK Reference
---

# Ignored Heading
`)
  writeLanding('api/nodejs/nodejs/nodejs.md', `---
sidebar_position: 1
---
`)
  return root
}

test('the fetch sidebar write prepends the configured Reference landing entry with the reconcile label precedence', () => {
  const root = fixtureWorkspace()
  const previous = process.cwd()
  process.chdir(root)
  try {
    const items = [{type: 'category', label: 'DataImport', items: []}]
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/python.sidebar.js', items), [
      {type: 'doc', id: 'api/python/python/python', label: 'Python SDK Reference'},
      {type: 'category', label: 'DataImport', items: []},
    ])
    // sidebar_label wins over title and the H1.
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/cli.sidebar.js', items)[0],
      {type: 'doc', id: 'cli/cli/Overview', label: 'Overview'})
    // title wins over the H1.
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/go.sidebar.js', items)[0],
      {type: 'doc', id: 'api/go/go/go', label: 'Go SDK Reference'})
    // The serialized shape matches the module format both writers use.
    assert.equal(
      sidebarModuleContents(withReferenceLandingEntry('generated/en/sidebars/python.sidebar.js', items)),
      `module.exports = ${JSON.stringify([
        {type: 'doc', id: 'api/python/python/python', label: 'Python SDK Reference'},
        {type: 'category', label: 'DataImport', items: []},
      ], null, 2)}\n`,
    )
  } finally {
    process.chdir(previous)
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('the landing entry stays idempotent and untouched sidebars pass through', () => {
  const root = fixtureWorkspace()
  const previous = process.cwd()
  process.chdir(root)
  try {
    const withLanding = [
      {type: 'doc', id: 'api/python/python/python', label: 'Python SDK Reference'},
      {type: 'category', label: 'DataImport', items: []},
    ]
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/python.sidebar.js', withLanding), withLanding)
    const guidesItems = [{type: 'category', label: 'Get Started', items: []}]
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/guides.sidebar.js', guidesItems), guidesItems)
    // A landing page without any label source fails loudly instead of
    // writing an unlabeled entry that the reconcile would rewrite.
    assert.throws(() => withReferenceLandingEntry('generated/en/sidebars/node.sidebar.js', []),
      /no sidebar_label, title, or first H1: api\/nodejs\/nodejs\/nodejs\.md/u)
  } finally {
    process.chdir(previous)
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('a missing Reference navigation config leaves sidebar items unchanged', () => {
  const root = fixtureWorkspace()
  fs.rmSync(path.join(root, 'config/reference-navigation.json'))
  const previous = process.cwd()
  process.chdir(root)
  try {
    const items = [{type: 'category', label: 'DataImport', items: []}]
    assert.deepEqual(withReferenceLandingEntry('generated/en/sidebars/python.sidebar.js', items), items)
  } finally {
    process.chdir(previous)
    fs.rmSync(root, {recursive: true, force: true})
  }
})
