'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { normalizeLarkMarkdown } = require('./larkMarkdown')

test('converts unsupported markdown tables to compact labeled rows', () => {
  const source = [
    '# Workflow summary',
    '',
    '| Group | Source | Translation |',
    '| --- | --- | --- |',
    '| rest | source_published | translation_published |',
    '| guides | failed | skipped |',
    '',
    'Report file: [full report](https://example.com/report.md)',
  ].join('\n')
  const output = normalizeLarkMarkdown(source)
  assert.match(output, /- \*\*rest\*\* · Source: source_published · Translation: translation_published/)
  assert.match(output, /- \*\*guides\*\* · Source: failed · Translation: skipped/)
  assert.match(output, /\[full report\]\(https:\/\/example.com\/report.md\)/)
  assert.doesNotMatch(output, /^\|/m)
})

test('preserves supported headings, bullets, links, and inline code', () => {
  const source = '# Report\n\n- Broken: 0\n- Command: `pnpm build`\n\n[Open](https://example.com)'
  assert.equal(normalizeLarkMarkdown(source), source)
})
