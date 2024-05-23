const fs = require('node:fs')
const fetch = require('node-fetch')
const { URL } = require('node:url')
const xml2js = require('xml2js')
const node_path = require('path')
const _ = require('lodash')
require('dotenv/config')

module.exports = function (context, options) {

    async function listUrls (baseUrl) {
        var oSitemap;
        if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
            oSitemap = await (await fetch(baseUrl + 'sitemap.xml')).text()
        } else if (fs.existsSync(baseUrl)) {
            oSitemap = fs.readFileSync(baseUrl, 'utf8')
        } else {
            throw new Error('baseUrl is not either a valid URL or a local file path')
        }

        const parser = new xml2js.Parser()
        const sitemap = await parser.parseStringPromise(oSitemap)
        const urls = sitemap.urlset.url.map(url => new URL(url.loc[0]).href)

        return urls
    }

    return {
        name: "check external links",
        extendCli(cli) {
            cli
                .command('check-links', 'check external links in markdown files')
                .action(async (opts) => {
                    const remote = await listUrls(context.siteConfig.url + context.siteConfig.baseUrl)
                    const local = await listUrls('build/sitemap.xml')

                    const deleted =remote.filter(url =>!local.includes(url))
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

                    const docPages = fs.readdirSync('build/docs').filter(file => file.endsWith('.html'))
                    const referencePages = fs.readdirSync('build/reference').filter(file => file.endsWith('.html'))
                    var externalLinks = []
                    var brokenLinks = []

                    for (const page of docPages) {
                        const content = fs.readFileSync(`build/docs/${page}`, 'utf8')
                        externalLinks = externalLinks.concat([...content.matchAll(/<a .* href="([^"]+)"/g)].map(match => match[1]).filter(link => link.startsWith('http')))
                    }

                    for (const page of referencePages) {
                        const content = fs.readFileSync(`build/reference/${page}`, 'utf8')
                        externalLinks = externalLinks.concat([...content.matchAll(/<a .* href="([^"]+)"/g)].map(match => match[1]).filter(link => link.startsWith('http')))
                    }

                    externalLinks = Array.from(new Set(externalLinks))

                    console.log(`Total external links: ${externalLinks.length}`)

                    await Promise.all(externalLinks.map(async (link) => {
                        try {
                            const response = await fetch(link.split('|')[0], { method: 'HEAD'}) 

                            if (response.status >= 400) {
                                brokenLinks.push(link)
                            }
                        } catch (error) {
                            brokenLinks.push(link)
                        }
                    }))

                    console.log(`Broken links: ${brokenLinks.length}`)
                    if (brokenLinks.length > 0) {
                        console.log('Broken links:')
                        console.log(brokenLinks)
                    }
                 })
        }
    }
}