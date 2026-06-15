const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { processManifestItem } = require('./agentRunner')

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-agent-'))
  try {
    return callback(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

async function testCorrectionRunsWhenReviewFails() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/test.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/test.md'
    write(path.join(siteDir, sourcePath), '---\ntitle: Test\n---\n# Hello\n\nUse `client.search()`.\n')

    const calls = []
    const callModel = async ({ agent }) => {
      calls.push(agent)
      if (agent === 'translation') return '---\ntitle: テスト\n---\n# こんにちは\n\n`client.search()` を使用します。\n'
      if (agent === 'review') {
        return calls.filter(name => name === 'review').length === 1
          ? '{"pass":false,"issues":[{"severity":"high","type":"style","comment":"Use more natural Japanese."}]}'
          : '{"pass":true,"issues":[]}'
      }
      if (agent === 'correction') return '---\ntitle: テスト\n---\n# こんにちは\n\n`client.search()` を使用します。\n'
      throw new Error(`unexpected agent ${agent}`)
    }

    const result = await processManifestItem({
      siteDir,
      item: {
        sourcePath,
        targetPath,
        sourceHash: 'abc123',
        locale: 'ja-JP',
        type: 'docs',
      },
      callModel,
      maxReviewRounds: 2,
      validate: async () => [],
    })

    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
    assert.equal(fs.readFileSync(path.join(siteDir, targetPath), 'utf8').includes('client.search()'), true)
  })
}

async function run() {
  await testCorrectionRunsWhenReviewFails()
  console.log('translation agent runner tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
