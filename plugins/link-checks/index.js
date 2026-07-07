const fs = require('node:fs')
const fetch = require('node-fetch')
const { URL } = require('node:url')
const xml2js = require('xml2js')
const path = require('node:path')
const _ = require('lodash')
const dotenv = require('dotenv')
const { buildLinkCheckReport, renderLinkCheckMarkdown } = require('./linkCheckReporter')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const PRODUCTION_DOCS_URL = 'https://docs.zilliz.com/'

function normalizeUrl (value) {
    return value.replace(/\/+$/, '') + '/'
}

async function fetchTextWithRetries (url, options = {}, retries = 3) {
    var lastError

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options)

            if (!response.ok) {
                throw new Error(`Request failed with HTTP ${response.status}`)
            }

            return await response.text()
        } catch (error) {
            lastError = error

            if (attempt < retries) {
                const delay = attempt * 1000
                console.warn(`Failed to fetch ${url} (${error.message}). Retrying in ${delay}ms...`)
                await sleep(delay)
            }
        }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} attempts: ${lastError.message}`)
}

async function listUrls (baseUrl) {
    var oSitemap;
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        const sitemapUrl = baseUrl.endsWith('.xml') ? baseUrl : normalizeUrl(baseUrl) + 'sitemap.xml'
        oSitemap = await fetchTextWithRetries(sitemapUrl, {
            headers: {
                'Accept-Encoding': 'identity',
            },
            compress: false,
        })
    } else if (fs.existsSync(baseUrl)) {
        oSitemap = fs.readFileSync(baseUrl, 'utf8')
    } else {
        throw new Error(`baseUrl is not either a valid URL or a local file path: ${baseUrl}`)
    }

    const parser = new xml2js.Parser()
    const sitemap = await parser.parseStringPromise(oSitemap)
    const urls = sitemap.urlset.url.map(url => new URL(url.loc[0]).href)

    return urls
}

function htmlPagesUnder(siteDir, dir) {
    const absoluteDir = path.join(siteDir, dir)
    if (!fs.existsSync(absoluteDir)) return []
    return fs.readdirSync(absoluteDir)
        .filter(file => file.endsWith('.html'))
        .map(file => path.join(dir, file))
}

function collectExternalLinkEntries(siteDir) {
    const pages = [
        ...htmlPagesUnder(siteDir, 'build/docs'),
        ...htmlPagesUnder(siteDir, 'build/reference'),
    ]
    const entries = []
    for (const page of pages) {
        const content = fs.readFileSync(path.join(siteDir, page), 'utf8')
        for (const match of content.matchAll(/<a .* href="([^"]+)"/g)) {
            const url = match[1]
            if (url.startsWith('http')) {
                entries.push({ url, page: page.replace(/^build\//, '') })
            }
        }
    }
    return entries
}

function uniqueLinkEntries(entries) {
    const byUrl = new Map()
    for (const entry of entries) {
        const existing = byUrl.get(entry.url) || { url: entry.url, pages: [] }
        if (entry.page && !existing.pages.includes(entry.page)) existing.pages.push(entry.page)
        byUrl.set(entry.url, existing)
    }
    return [...byUrl.values()]
}

module.exports = function (context, options) {
    dotenv.config({ path: path.join(context.siteDir, '.env') })

    function resolveRemoteSitemapSource () {
        if (process.env.LINK_CHECKS_REMOTE_SITEMAP) {
            return process.env.LINK_CHECKS_REMOTE_SITEMAP
        }

        const remoteBaseUrl = process.env.LINK_CHECKS_REMOTE_BASE_URL || PRODUCTION_DOCS_URL
        return normalizeUrl(remoteBaseUrl)
    }

    function resolveLocalSitemapSource () {
        return process.env.LINK_CHECKS_LOCAL_SITEMAP || path.join(context.siteDir, 'build', 'sitemap.xml')
    }

    return {
        name: "check external links",
        extendCli(cli) {
            cli
                .command('link-checks')
                .description('check external links in markdown files')
                .action(async (opts) => {
                    const remoteSitemapSource = resolveRemoteSitemapSource()
                    const localSitemapSource = resolveLocalSitemapSource()
                    const remote = await listUrls(remoteSitemapSource)
                    const local = await listUrls(localSitemapSource)

                    const deleted = remote.filter(url =>!local.includes(url))
                    const added = local.filter(url =>!remote.includes(url))

                    console.log(`Deleted links: ${deleted.length}`)
                    if (deleted.length > 0) {
                        console.log('Deleted links:')
                        console.log(deleted)
                    }
                    console.log(`Added links: ${added.length}`)
                    if (added.length > 0) {
                        console.log('Added links:')
                        console.log(added)
                    }

                    var brokenLinks = []
                    const externalLinks = uniqueLinkEntries(collectExternalLinkEntries(context.siteDir))

                    console.log(`Total external links: ${externalLinks.length}`)

                    await Promise.all(externalLinks.map(async (link) => {
                        try {
                            const response = await fetch(link.url.split('|')[0], { method: 'HEAD'})

                            if (response.status >= 400) {
                                brokenLinks.push({ ...link, status: response.status })
                            }
                        } catch (error) {
                            brokenLinks.push({ ...link, error: error.message })
                        }
                    }))

                    console.log(`Broken links: ${brokenLinks.length}`)
                    if (brokenLinks.length > 0) {
                        console.log('Broken links:')
                        console.log(brokenLinks)
                    }

                    const report = buildLinkCheckReport({
                        remoteSitemapSource,
                        localSitemapSource,
                        remoteUrls: remote,
                        localUrls: local,
                        checkedExternalLinks: externalLinks,
                        externalLinks: brokenLinks,
                    })

                    const reportsDir = path.join(context.siteDir, 'plugins/link-checks/meta/reports')
                    fs.mkdirSync(reportsDir, { recursive: true })
                    const stamp = Date.now()
                    const json = JSON.stringify(report, null, 2)
                    const markdown = renderLinkCheckMarkdown(report)
                    const latestJson = path.join(reportsDir, 'latest.json')
                    const latestMd = path.join(reportsDir, 'latest.md')
                    fs.writeFileSync(latestJson, json)
                    fs.writeFileSync(latestMd, markdown)
                    fs.writeFileSync(path.join(reportsDir, `report_${stamp}.json`), json)
                    fs.writeFileSync(path.join(reportsDir, `report_${stamp}.md`), markdown)
                    console.log(`Link-check report written to ${latestMd}`)

                    if (report.summary.deleted_links > 0) {
                        console.warn(`Route deletion report is informational: ${report.summary.deleted_links} deleted routes will not fail the build.`)
                    }

                    if (report.summary.broken_external_links > 0) {
                        console.warn(`Broken external URL report is informational: ${report.summary.broken_external_links} broken external URLs will not fail the build.`)
                    }
                 })
        }
    }
}

module.exports._test = {
    fetchTextWithRetries,
    listUrls,
    collectExternalLinkEntries,
}
