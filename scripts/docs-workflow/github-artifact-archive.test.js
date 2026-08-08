'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {inspectZipArchive, validateArchiveEntries} = require('./github-artifact-archive')

test('zip metadata inspection classifies symlinks before extraction', async () => {
  const execute = async (_command, args) => args[0] === '-Z1'
    ? {stdout: 'publication-results.json\n'}
    : {stdout: 'Archive: fixture.zip\nlrwxrwxrwx  3.0 unx 12 bl 12 stor 20260809.010000 publication-results.json\n'}
  const entries = await inspectZipArchive('fixture.zip', execute)
  assert.deepEqual(entries, [{path: 'publication-results.json', type: 'symlink'}])
  assert.throws(() => validateArchiveEntries(entries, ['publication-results.json']), /symlink/i)
})

test('zip metadata inspection fails closed when names and entry modes are ambiguous', async () => {
  const execute = async (_command, args) => args[0] === '-Z1'
    ? {stdout: 'publication-results.json\nextra.json\n'}
    : {stdout: '-rw----  2.0 fat 2 bl 2 stor 20260809.010000 publication-results.json\n'}
  await assert.rejects(() => inspectZipArchive('fixture.zip', execute), /metadata is ambiguous/i)
})
