const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  buildLinkCheckReport,
  renderLinkCheckMarkdown,
  resolveWorkflowRunUrl,
} = require('./linkCheckReporter')

test('resolveWorkflowRunUrl builds GitHub Actions run URL from environment', () => {
  assert.equal(
    resolveWorkflowRunUrl({
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'zilliztech/zdoc',
      GITHUB_RUN_ID: '28835409913',
    }),
    'https://github.com/zilliztech/zdoc/actions/runs/28835409913'
  )
})

test('buildLinkCheckReport groups broken external links with pages', () => {
  const report = buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/sitemap.xml',
    remoteUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/old/'],
    localUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/new/'],
    workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
    externalLinks: [
      { url: 'https://bad.example.com', page: 'docs/a.html', status: 404 },
      { url: 'https://bad.example.com', page: 'docs/b.html', status: 404 },
      { url: 'https://timeout.example.com', page: 'reference/c.html', error: 'timeout' },
    ],
  })

  assert.equal(report.summary.deleted_links, 1)
  assert.equal(report.summary.added_links, 1)
  assert.equal(report.summary.external_links, 2)
  assert.equal(report.summary.broken_external_links, 2)
  assert.equal(report.workflow_run_url, 'https://github.com/zilliztech/zdoc/actions/runs/1')
  assert.deepEqual(report.deleted, ['https://docs.zilliz.com/docs/old/'])
  assert.deepEqual(report.added, ['https://docs.zilliz.com/docs/new/'])
  assert.equal(report.broken_external_links[0].url, 'https://bad.example.com')
  assert.deepEqual(report.broken_external_links[0].pages, ['docs/a.html', 'docs/b.html'])
})

test('renderLinkCheckMarkdown includes compact Feishu-ready summary', () => {
  const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/sitemap.xml',
    remoteUrls: ['https://docs.zilliz.com/docs/old/'],
    localUrls: ['https://docs.zilliz.com/docs/new/'],
    workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
    externalLinks: [{ url: 'https://bad.example.com', page: 'docs/a.html', status: 404 }],
  }))

  assert.match(markdown, /Link Checks/)
  assert.match(markdown, /Workflow run: https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/1/)
  assert.match(markdown, /Deleted routes: 1/)
  assert.match(markdown, /Added routes: 1/)
  assert.match(markdown, /Broken external URLs: 1/)
  assert.match(markdown, /https:\/\/bad\.example\.com/)
})
