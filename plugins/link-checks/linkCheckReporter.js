function groupBrokenExternalLinks(externalLinks) {
  const byUrl = new Map()
  for (const item of externalLinks) {
    const entry = byUrl.get(item.url) || {
      url: item.url,
      status: item.status || null,
      error: item.error || null,
      pages: [],
    }
    if (!entry.status && item.status) entry.status = item.status
    if (!entry.error && item.error) entry.error = item.error
    if (item.page && !entry.pages.includes(item.page)) entry.pages.push(item.page)
    byUrl.set(item.url, entry)
  }
  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url))
}

function buildLinkCheckReport({
  generatedAt = new Date().toISOString(),
  remoteSitemapSource,
  localSitemapSource,
  remoteUrls,
  localUrls,
  externalLinks,
  checkedExternalLinks = externalLinks,
}) {
  const deleted = remoteUrls.filter(url => !localUrls.includes(url))
  const added = localUrls.filter(url => !remoteUrls.includes(url))
  const brokenExternalLinks = groupBrokenExternalLinks(externalLinks)
  return {
    generated_at: generatedAt,
    remote_sitemap_source: remoteSitemapSource,
    local_sitemap_source: localSitemapSource,
    summary: {
      deleted_links: deleted.length,
      added_links: added.length,
      external_links: new Set(checkedExternalLinks.map(item => item.url)).size,
      broken_external_links: brokenExternalLinks.length,
    },
    deleted,
    added,
    broken_external_links: brokenExternalLinks,
  }
}

function listItems(items, renderItem, limit = 10) {
  if (!items.length) return '- None'
  const visible = items.slice(0, limit).map(renderItem)
  const hidden = items.length - visible.length
  if (hidden > 0) visible.push(`- ...and ${hidden} more`)
  return visible.join('\n')
}

function renderLinkCheckMarkdown(report) {
  const lines = []
  lines.push('# Link Checks', '')
  lines.push(`Generated: ${report.generated_at}`)
  lines.push(`Remote sitemap: ${report.remote_sitemap_source}`)
  lines.push(`Local sitemap: ${report.local_sitemap_source}`, '')
  lines.push('## Summary', '')
  lines.push(`- Deleted routes: ${report.summary.deleted_links}`)
  lines.push(`- Added routes: ${report.summary.added_links}`)
  lines.push(`- External URLs checked: ${report.summary.external_links}`)
  lines.push(`- Broken external URLs: ${report.summary.broken_external_links}`, '')
  lines.push('## Deleted Routes', '')
  lines.push(listItems(report.deleted, url => `- ${url}`), '')
  lines.push('## Added Routes', '')
  lines.push(listItems(report.added, url => `- ${url}`), '')
  lines.push('## Broken External URLs', '')
  lines.push(listItems(report.broken_external_links, item => {
    const status = item.status ? `HTTP ${item.status}` : item.error
    const pages = item.pages.slice(0, 3).join(', ')
    const suffix = item.pages.length > 3 ? `, ...and ${item.pages.length - 3} more` : ''
    return `- ${item.url} (${status}) on ${pages}${suffix}`
  }))
  return lines.join('\n')
}

module.exports = {
  buildLinkCheckReport,
  renderLinkCheckMarkdown,
}
