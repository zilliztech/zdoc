const fs = require('node:fs')
const fetch = require('node-fetch')
const { URL } = require('node:url')
const xml2js = require('xml2js')
require('dotenv/config')

module.exports = function (context, options) {
    return {
        name: "check external links",
        extendCli(cli) {
            cli
                .command('check-links', 'check external links in markdown files')
                .option('--compare-range <range>', 'define a range in days to compare the sitemaps')
                .action(async (opts) => {
                    const plugin_meta_folder = 'plugins/link-checks/meta'
                    const build_folder = 'build'

                    if (!fs.existsSync(`${plugin_meta_folder}/reports`)) {
                        fs.mkdirSync(`${plugin_meta_folder}/reports`)
                    }

                    if (!fs.existsSync(`${plugin_meta_folder}/sitemaps`)) {
                        fs.mkdirSync(`${build_folder}/sitemaps`)
                    }

                    var report = ''

                    // 1. Check external links from the cloud platform

                    const source = fs.readFileSync(`${plugin_meta_folder}/Link.ts`, 'utf-8')
                    var external_links = [...source.matchAll(/ZILLIZ_DOC_PREFIX\}\/(([\w\d]*[-/])*[\w\d]*)/g)].map(a => '/docs/' + a[1])
                    external_links.concat([[...source.matchAll(/ZILLIZ_DOC_BASE_URL\}\/(([\w\d]*[-/])*[\w\d]*)/g)].map(a => a[1])])

                    external_links = [... new Set(external_links)]
                    
                    const xml_file = fs.readFileSync(`${build_folder}/sitemap.xml`, 'utf-8')
                    const parser = new xml2js.Parser()
                    const xml = await parser.parseStringPromise(xml_file)
                    var sitemap_links = xml.urlset.url.map(a => {
                        const url = new URL(a.loc[0])
                        return url.pathname
                    })

                    report += '# External Link Checks\n\n## External Links from the Cloud Platform\n\nThe following links are not included in the sitemap:\n\n'

                    external_links.filter(link => !sitemap_links.includes(link)).forEach(link => {
                        console.log(`Link not found in sitemap: ${link}`)
                        report += `- ${link}\n\n  - Status: Not Found\n\n  - Should be replaced with:\n\n`
                    })

                    report += 'Fill in the replaced links and submit a ticket to the front-end team to update the links.:\n\n'

                    //2. Check external links from the built files

                    report += '## External Links from the Built Files\n\nThe following external links may not be accessible or broken:\n\n'

                    const files = fs.readdirSync(build_folder, {recursive: true})
                    const html_files = files.filter(file => file.endsWith('.html'))
                    var links_on_pages = html_files.map(file => {
                        const content = fs.readFileSync(`${build_folder}/${file}`, 'utf-8')
                        return { "page": file, "links": [...content.matchAll(/href="(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g)].map(a => a[1]) }
                    })

                    var links = links_on_pages.map(page => page.links).flat()

                    links = [... new Set(links)].filter(link => !link.includes('zilliz.com')).filter(link => !link.includes('colab')).filter(link => !link.includes('zilliz_universe'))

                    var broken_links = await Promise.all(links.map(async link => {
                        try {
                            const res = await fetch(link, {method: 'HEAD', headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}})
                            if (res.status >= 400) {
                                console.log(`Link not accessible: ${link}`)
                                return {link, status: res.status}
                            }                            
                        } catch (error) {
                            console.log(`Link not accessible: ${link}`)
                            return {link, status: 500 }
                        }
                    }))

                    broken_links = broken_links.filter(link => link !== undefined)

                    broken_links.forEach(link => {
                        if (link.status >= 400) {
                            links_on_pages.forEach(page => {
                                if (page.links.includes(link.link)) {
                                    report += `- ${link.link}\n\n  - Status: ${link.status}\n\n  - On page: ${page.page}\n\n`
                                }
                            })
                        }
                    })

                    report += 'Please check the broken links and fix them.\n\n'

                    // 3. Check changed pages compared with the previous release

                    report += '## Slug Changes\n\n'
                    
                    var sitemaps = fs.readdirSync(`${plugin_meta_folder}/sitemaps`)
                    const range = opts.compareRange ?  opts.compareRange : 7 * 24 * 60 * 60 * 1000

                    if (sitemaps.length === 0) {
                        report += 'No sitemap found. Check skipped.\n\n'
                    } else {
                        report += `External links to the following pages may be broken after this release:\n\n`

                        sitemaps.sort((a, b) => parseInt(b.split('_')[1]) - parseInt(a.split('_')[1]))
                        sitemaps = sitemaps.filter(sitemap => parseInt(sitemap.split('_')[1]) >= (Date.now() - range))

                        sitemaps.forEach(sitemap => {
                            report += `- Compared with sitemap generated at ${new Date(parseInt(sitemap.split('_')[1])).toLocaleString()}\n\n`
                            const xml_file = fs.readFileSync(`${plugin_meta_folder}/sitemaps/${sitemap}`, 'utf-8')
                            const parser = new xml2js.Parser()
                            var old_lnks

                            parser.parseString(xml_file, (err, result) => {
                                old_lnks = result.urlset.url.map(a => {
                                    const url = new URL(a.loc[0]) 
                                    return url.pathname
                                })
                            })

                            const added = sitemap_links.filter(link => !old_lnks.includes(link))
                            const removed = old_lnks.filter(link => !sitemap_links.includes(link))

                            report += `  - Added links: ${added.length}\n\n`

                            if (added.length > 0) {
                                added.forEach(link => {
                                    report += `    - ${link}\n\n`
                                })
                            }

                            report += `  - Removed links: ${removed.length}\n\n`

                            if (removed.length > 0) {
                                removed.forEach(link => {
                                    report += `    - ${link}\n\n`
                                })
                            }

                            report += `Please check the broken links and fix them.\n\n`
                            
                        })
                    }

                    fs.copyFileSync(`${build_folder}/sitemap.xml`, `${plugin_meta_folder}/sitemaps/sitemap_${Date.now()}.xml`)

                    fs.writeFileSync(`${plugin_meta_folder}/reports/report_${Date.now()}.md`, report)
                 })
        }
    }
}