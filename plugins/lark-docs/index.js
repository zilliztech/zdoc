const docScraper = require('./larkDocScraper.js')
const docWriter = require('./larkDocWriter.js')
const utils = require('./larkUtils.js')
const Slugify = require('./larkSlugify.js')
const fs = require('node:fs')
require('dotenv/config')

module.exports = function (context, options) {
    return {
        name: "fetch-lark-docs",
        extendCli(cli) {
            cli
                .command('fetch-lark-docs')
                .option('-r, --rootToken <rootToken>', 'Token of a root Lark doc')
                .option('-d, --docToken <docToken>', 'Token of a child Lark doc')
                .option('-t, --docTitle <docTitle>', 'Title of a child Lark doc')
                .option('-s, --sidebarPos <sidebarPos>', 'Order of the child doc in the sidebar', 0)
                .option('-o, --outputDir <outputDir>', 'Output Directory', 'docs/tutorials')
                .option('-i, --imageDir <imageDir>', 'Image Directory', 'static/img')
                .option('-f, --faq', 'Write FAQs')
                .action(async (opts) => {
                    console.log('Fetching docs from Feishu...')

                    if (opts.rootToken === undefined) {
                        console.log('Please provide a root token')
                        return
                    }
                    
                    const scraper = new docScraper(opts.rootToken)
                    await scraper.fetch()
                    let docs = scraper.docs
                    const slugify = new Slugify(docs)
                    docs = await slugify.slugify()
                    let pages = new utils(docs, 'title', 'obj.obj_type === "docx"', true).instances

                    const writer = new docWriter(pages, null, opts.imageDir)

                    if (opts.docToken !== undefined || opts.docTitle !== undefined) {
                        const page = pages.filter(page => page.obj_token === opts.docToken || page.title === opts.docTitle)[0]

                        if (page === undefined) {
                            console.log('Please provide a valid doc token or title')
                            return
                        }

                        const page_slug = page.slug
                        const file_path = opts.outputDir + '/' + page_slug + '.md'
                        let sidebarPos = opts.sidebarPos

                        if (fs.existsSync(file_path)) {
                            const page = fs.readFileSync(file_path, 'utf8')
                            sidebarPos = page.split('\n').filter(line => line.startsWith('sidebar_position'))[0]

                            if (sidebarPos !== undefined) {
                                sidebarPos = sidebarPos.split(':')[1].trim()
                            } else if (opts.sidebarPos !== undefined) {
                                console.log('Please provide a valid sidebar position for this doc')
                                return
                            }
                        }

                        const req = {
                            path: opts.outputDir,
                            page_title: opts.docTitle,
                            page_token: opts.docToken,
                            sidebar_position: sidebarPos,
                        }

                        writer.write_doc(req)
                    } else if (opts.faq) {
                        const path = opts.outputDir + '/faqs'
                        if (!fs.existsSync(path)) {
                            fs.mkdirSync(path)
                        }

                        await writer.write_faqs(path)
                    } else {
                        fs.readdirSync(opts.outputDir, {recursive: true}).forEach(file => {
                            fs.unlinkSync(opts.outputDir + '/' + file)
                        })
                        await writer.write_docs({
                            path: opts.outputDir, 
                            children: docs.children,
                        })
                    }
                })
        }
    }
}
