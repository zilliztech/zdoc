const docScraper = require('./larkDocScraper.js')
const docWriter = require('./larkDocWriter.js')
const Utils = require('./larkUtils.js')
const fs = require('node:fs')
require('dotenv/config')

module.exports = function (context, options) {
    return {
        name: "fetch-lark-docs",
        extendCli(cli) {
            cli
                .command('fetch-lark-docs')
                .option('-doc, --docTitle <docTitle>', 'Title of a child Lark doc')
                .option('-token, --docToken <docToken>', 'Token of a child Lark doc')
                .option('-src-only, --sourceOnly', 'Only fetch doc sources')
                .option('-tar, --pubTarget <pubTarget>', 'Target of the doc')
                .option('-faq, --faq', 'Generate FAQ pages')
                .option('-skipS, --skipSourceDown', 'Skip fetching document sources')
                .option('-skipI, --skipImageDown', 'Skip fetching images')
                .option('-post, --postProcess', 'Post process file paths')
                .action(async (opts) => {

                    const options = context.siteConfig.plugins.filter(plugin => plugin[0].includes('lark-docs'))[0][1]
                    
                    if (opts.pubTarget === undefined) {
                        // Only pull source files from Feishu iteratively
                        if (opts.sourceOnly) {
                            const scraper = new docScraper(options.root, options.base)
                            await scraper.fetch(recursive=true)
                        // Pull specific source file from Feishu
                        } else if (opts.docToken !== undefined) {
                            const scraper = new docScraper(options.root, options.base)
                            await scraper.fetch(recursive=false, page_token=opts.docToken)
                        } else {
                            throw new Error('Please provide a target')
                        }
                    } else {
                        const { outputDir, imageDir } = options.targets.filter(target => target[0] === opts.pubTarget)[0][1]
                        const utils = new Utils(options.root, options.docSourceDir, outputDir)

                        // Add necessary imports to category pages
                        if (opts.postProcess) {
                            console.log('Post processing file paths')
                            utils.post_process_file_paths()
                        }

                        // Generate doc pages iteratively
                        if (opts.docTitle === undefined && !opts.faq && !opts.postProcess) {
                            console.log('Fetching docs from Feishu...')
                            utils.pre_process_file_paths()
                            
                            if (!opts.skipSourceDown) {
                                const scraper = new docScraper(options.root, options.base)
                                await scraper.fetch(recursive=true)
                            }
                            
                            const writer = new docWriter(options.root, options.docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
                            await writer.write_docs(outputDir, options.root)

                            utils.post_process_file_paths()
                        }
        
                        // Generate a specific doc page
                        if (opts.docTitle !== undefined) {
                            var source
    
                            var token = fs.readdirSync(options.docSourceDir).filter(file => {
                                source = JSON.parse(fs.readFileSync(options.docSourceDir + '/' + file, 'utf8'))
                                return source.title === opts.docTitle
                            }).map(file => {
                                source = JSON.parse(fs.readFileSync(options.docSourceDir + '/' + file, 'utf8'))
                                return source.node_token
                            })[0]
    
                            if (token === undefined) {
                                console.log('Please provide a valid doc token or title')
                                return
                            }

                            const scraper = new docScraper(options.root, options.base)
                            await scraper.fetch(recursive=false, page_token=token)
    
                            const writer = new docWriter(options.root, options.docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
                            const meta = await writer.__is_to_publish(opts.docTitle)

                            var file_path = outputDir + '/' + utils.determine_file_path(token, options.docSourceDir)
    
                            if (meta['publish']) {
                                const page_slug = source.slug
                                const page_beta = meta['beta']
                                const notebook = meta['notebook']
                                const labels = meta['labels']
                                const keywords = meta['keywords']
                                const sidebarPos = JSON.parse(fs.readFileSync(options.docSourceDir + '/' + source.parent_node_token + '.json', 'utf8')).children.map((child, index) => {
                                    if (child.node_token === token) {
                                        return index+1
                                    }
                                }).filter(index => index !== undefined)[0]
                                
                                const req = {
                                    path: file_path.split('/').slice(0, -1).join('/'),
                                    page_title: opts.docTitle,
                                    page_slug: page_slug,
                                    page_beta: page_beta,
                                    notebook: notebook,
                                    page_token: token,
                                    sidebar_position: sidebarPos,
                                    sidebar_label: labels,
                                    keywords: keywords,
                                }
    
                                await writer.write_doc(req)
                            } else {
                                console.log('The doc is not ready to publish!')
                                return
                            }
                        }
                                    
                        if (opts.faq) {
                            const scraper = new docScraper(options.root, options.base)
    
                            var source
    
                            var token = fs.readdirSync(options.docSourceDir).filter(file => {
                                source = JSON.parse(fs.readFileSync(options.docSourceDir + '/' + file, 'utf8'))
                                return source.title === 'FAQs'
                            }).map(file => {
                                source = JSON.parse(fs.readFileSync(options.docSourceDir + '/' + file, 'utf8'))
                                return source.node_token
                            })[0]
    
                            await scraper.fetch(recursive=false, page_token=token)
    
                            const writer = new docWriter(options.root, options.docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
    
                            const path = outputDir + '/faqs'
                            if (!fs.existsSync(path)) {
                                fs.mkdirSync(path)
                            }
    
                            await writer.write_faqs(path)
                        }
    
                    }                    
                })
        }
    }
}
