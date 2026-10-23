// @vitest-environment node
import { expect, it } from 'vitest'
import { countPilotProductNames } from './pilots'

it('reports all three pilots after WP3 reading/preprocessing without freezing alignment counts', async () => {
  const rows = await countPilotProductNames()
  expect(new Set(rows.map(row => row.page))).toEqual(new Set(['delete-entities', 'filtered-search', 'openai']))
  for (const page of ['delete-entities', 'filtered-search', 'openai']) {
    expect(new Set(rows.filter(row => row.page === page).map(row => row.channel))).toEqual(new Set(['current', 'next']))
    const manuals = page === 'openai' ? ['guides'] : ['guides', 'guides-byoc']
    for (const channel of ['current', 'next']) {
      expect(rows.filter(row => row.page === page && row.channel === channel).map(row => row.manual)).toEqual(manuals)
    }
  }
  for (const row of rows) {
    expect(Object.keys(row.mdxHits)).toEqual(['Milvus', 'localhost:19530', 'root:Milvus'])
    expect(Object.keys(row.inputDiagnostics)).toEqual(Object.keys(row.mdxHits))
  }
  console.info('Product-name pilot counts (before site adaptation):', JSON.stringify(rows))
}, 30_000)
