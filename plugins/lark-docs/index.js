const docScraper = require('./larkDocScraper.js')
const docWriter = require('./larkDocWriter.js')
const driveWriter = require('./larkDriveWriter.js')
const Utils = require('./larkUtils.js')
const fs = require('node:fs')
const inquirer = require('inquirer')
require('dotenv/config');

module.exports = function (context, options) {
    return {
        name: "fetch-lark-docs",
        extendCli(cli) {
            cli
                .command('fetch-lark-docs')
                .option('-man, --manual <manual>', 'Name of the manual to fetch')
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
                    process.env.REPO_BRANCH = fs.readFileSync('.git/HEAD', 'utf8').split(': ')[1].trim().split('/').slice(-1)[0]
                    const manuals = Object.keys(options)
                    const utils = new Utils()

                    // Determine the manual to fetch
                    var manual;

                    if (opts.manual === undefined) {
                        manual = options[manuals[0]]
                        console.log(`Fetching ${manuals[0]} ...`)
                    } else if (manuals.includes(opts.manual)) {
                        manual = options[opts.manual]
                        console.log(`Fetching ${opts.manual} ...`)
                    } else {
                        throw new Error(`Please provide a valid manual tag... \nAvailable manual tags: \n- ${manuals.join('\n- ')}`)
                    }

                    const { root, base, sourceType, displayedSidebar, docSourceDir, targets } = manual

                    // Intialize scraper and writer
                    const scraper = new docScraper(root, base, sourceType, docSourceDir)
                    
                    if (!fs.existsSync(docSourceDir)) {
                        fs.mkdirSync(docSourceDir, { recursive: true })
                    }

                    if (opts.pubTarget === undefined) {
                        // Only pull source files from Feishu iteratively
                        if (opts.sourceOnly) {
                            // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                            await scraper.fetch(true)
                        // Pull specific source file from Feishu
                        } else if (opts.docToken !== undefined) {
                            // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                            await scraper.fetch(false, opts.docToken)
                        } else {
                            throw new Error('Please provide a target')
                        }
                    } else {
                        try {
                            var { outputDir, imageDir } = eval(`targets.${opts.pubTarget}`)
                        } catch (e) {
                            throw new Error(`Please provide a valid target... \n\nAvailable targets: \n- ${utils.list_valid_targets(targets).join('\n- ')}\n`)
                        }

                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true })
                        }

                        if (!fs.existsSync(imageDir)) {
                            fs.mkdirSync(imageDir, { recursive: true })
                        }

                        const writer = sourceType === 'wiki' || sourceType === 'onePager' ? 
                            new docWriter(root, base, displayedSidebar, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown) : 
                            new driveWriter(root, base, displayedSidebar, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown, opts.manual)

                        // Add necessary imports to category pages
                        if (opts.postProcess) {
                            console.log('Post processing file paths')
                            utils.post_process_file_paths(outputDir)
                        }

                        // Generate doc pages iteratively
                        if (opts.docTitle === undefined && !opts.faq && !opts.postProcess) {
                            console.log('Fetching docs from Feishu...')
                            utils.pre_process_file_paths(outputDir)
                            
                            if (!opts.skipSourceDown) {
                                // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                                await scraper.fetch(true)
                            }
                            
                            // const writer = new docWriter(root, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
                            await writer.write_docs(outputDir, root)

                            utils.post_process_file_paths(outputDir)
                        }
        
                        // Generate a specific doc page
                        if (opts.docTitle !== undefined) {
                            var paths = fs.readdirSync(docSourceDir).filter(file => {
                                var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + file, 'utf8'))
                                if (Object.keys(source).includes('title')) {
                                    return source.title === opts.docTitle
                                } else {
                                    return source.name === opts.docTitle
                                }
                            })
    
                            if (paths.length === 0) {
                                console.log('Please provide a valid doc token or title')
                                return
                            }

                            var token;
                            var source_type;

                            if (paths.length === 1) {
                                var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + paths[0], 'utf8'))
                                token = source.node_token ? source.node_token : source.token
                                source_type = source.node_type ? source.node_type : source.type
                                await scraper.fetch(false, token) 
                            }

                            if (paths.length > 1) {
                                const sources = paths.map(path => {
                                    var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + path, 'utf8'))
                                    return source
                                })

                                const type = sources.map(source => source.obj_type ? source.obj_type : source.type).filter((value, index, array) => {
                                    return array.indexOf(value) === index
                                }).length === 1 ? 'docx' : 'folder'

                                if (type === 'docx') {
                                    const slugs = paths.map(path => {
                                        var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + path, 'utf8'))
                                        return `${source.slug} (${source.node_token ? source.node_token : source.token})`
                                    })

                                    const answers = await inquirer.prompt([
                                        {
                                            type: 'list',
                                            name: 'token',
                                            message: 'Multiple docs with the same title found. \nPlease select a doc slug:',
                                            choices: slugs
                                        }
                                    ])

                                    var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + paths[slugs.indexOf(answers.token)], 'utf8'))
                                    token = source.node_token ? source.node_token : source.token
                                    source_type = source.node_type ? source.node_type : source.type
                                    console.log(token)
                                    
                                    // const scraper = new docScraper(root, base)
                                    await scraper.fetch(false, token)                                    
                                } else {
                                    for (source of sources) {
                                        await scraper.fetch(false, source.token)
                                    }

                                    var source = sources.filter(source => Object.keys(source).includes('children'))[0]
                                    source.blocks = sources.filter(source => Object.keys(source).includes('blocks'))[0].blocks
                                    token = source.token
                                    source_type = source.type
                                    console.log(token)
                                }
                            }
    
                            // const writer = new docWriter(root, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
                            const meta = await writer.__is_to_publish(opts.docTitle, source.slug)

                            var file_path = outputDir + '/' + utils.determine_file_path(token, outputDir)

                            const doc_card_list = Object.keys(source).includes('children') ? true : false
    
                            if (meta['publish']) {
                                const page_slug = source.slug
                                const page_beta = meta['beta']
                                const notebook = meta['notebook']
                                const labels = meta['labels']
                                const keywords = meta['keywords']
                                const parent = Object.keys(source).includes('parent_node_token') ? source.parent_node_token : source.parent_token
                                var sidebarPos = 0
                                try {
                                    const parent_source = JSON.parse(fs.readFileSync(docSourceDir + '/' + parent + '.json', 'utf8'))
                                    parent_source.children.map((child, index) => {
                                        const child_token = child.node_token ? child.node_token : child.token
                                        if (child_token === token) {
                                            sidebarPos = index+1
                                        }
                                    }).filter(index => index !== undefined)[0]
                                } catch (e) {
                                    fs.readdirSync(docSourceDir).forEach(file => {
                                        var source = JSON.parse(fs.readFileSync(docSourceDir + '/' + file, 'utf8'))
                                        if (Object.keys(source).includes('children') && source.children.map(child => child.node_token ? child.node_token : child.token).includes(token)) {
                                            source.children.map((child, index) => {
                                                const child_token = child.node_token ? child.node_token : child.token
                                                if (child_token === token) {
                                                    sidebarPos = index+1
                                                }
                                            }).filter(index => index !== undefined)[0]
                                        }
                                    })
                                }
                                
                                const req = {
                                    path: file_path.split('/').slice(0, -1).join('/'),
                                    page_title: opts.docTitle,
                                    page_slug: page_slug,
                                    page_beta: page_beta ? page_beta : false,
                                    notebook: notebook ? notebook : false,
                                    page_type: source_type,
                                    page_token: token,
                                    sidebar_position: sidebarPos,
                                    sidebar_label: labels,
                                    keywords: keywords,
                                    doc_card_list: doc_card_list,
                                }
    
                                await writer.write_doc(req)
                            } else {
                                console.log('The doc is not ready to publish!')
                                return
                            }
                        }
                                    
                        if (opts.faq) {
                            // const scraper = new docScraper(root, base)
                            var source
    
                            var token = fs.readdirSync(docSourceDir).filter(file => {
                                source = JSON.parse(fs.readFileSync(docSourceDir + '/' + file, 'utf8'))
                                return source.title === 'FAQs'
                            }).map(file => {
                                source = JSON.parse(fs.readFileSync(docSourceDir + '/' + file, 'utf8'))
                                return source.node_token
                            })[0]
    
                            await scraper.fetch(false, token)
    
                            // const writer = new docWriter(root, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown)
    
                            const path = outputDir + '/faqs'
                            
                            if (!fs.existsSync(path)) {
                                fs.mkdirSync(path)
                            }
    
                            await writer.write_faqs(path)
                        }

                        if (opts.pubTarget === "milvus") {
                            utils.postprocess_for_milvus(outputDir, docSourceDir)
                        }
                    }
                })
        }
    }
}
