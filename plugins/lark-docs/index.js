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
                .option('--table <table>', 'Only fetch/update source files and navigation for one Base table by name or table_id')
                .option('-tar, --pubTarget <pubTarget>', 'Target of the doc')
                .option('-faq, --faq', 'Generate FAQ pages')
                .option('-skipS, --skipSourceDown', 'Skip fetching document sources')
                .option('-skipI, --skipImageDown', 'Skip fetching images')
                .option('-post, --postProcess', 'Post process file paths')
                .option('-s3, --uploadToS3', 'Upload images to S3 instead of local storage')
                .option('-sidebar, --sidebarOnly', 'Only regenerate sidebar file from existing sources')
                .option('-skipSidebar, --skipSidebar', 'Skip sidebar generation (preserve manual edits)')
                .option('--validateLinks', 'Validate Feishu doc links in existing sources against canonical Base records')
                .option('--skipLinkValidation', 'Skip content link validation report generation')
                .option('--failOnBrokenContentLinks', 'Fail when content link validation finds missing canonical records')
                .option('--linkShim <path>', 'Apply approved Feishu doc link replacements from a shim JSON file during export')
                .action(async (opts) => {
                    try {
                        process.env.REPO_BRANCH = fs.readFileSync('.git/HEAD', 'utf8').split(': ')[1].trim().split('/').slice(-1)[0]
                    } catch (e) {
                        process.env.REPO_BRANCH = 'main'
                    }
                    const manuals = Object.keys(options)
                    const utils = new Utils()
                    const resolveTarget = (targets, path) =>
                        path ? path.split('.').reduce((obj, key) => obj?.[key], targets) : undefined

                    // Determine the manual to fetch
                    var manual;
                    var manualName;

                    if (opts.manual === undefined) {
                        manual = options[manuals[0]]
                        manualName = manuals[0]
                        console.log(`Fetching ${manuals[0]} ...`)
                    } else if (manuals.includes(opts.manual)) {
                        manual = options[opts.manual]
                        manualName = opts.manual
                        console.log(`Fetching ${opts.manual} ...`)
                    } else {
                        throw new Error(`Please provide a valid manual tag... \nAvailable manual tags: \n- ${manuals.join('\n- ')}`)
                    }

                    const { root, base, sourceType, displayedSidebar, docSourceDir, fallbackSourceDir, targets, sidebarPath, overridePath, contentRoot } = manual

                    // Intialize scraper and writer
                    const scraper = new docScraper(root, base, sourceType, docSourceDir)
                    
                    if (!fs.existsSync(docSourceDir)) {
                        fs.mkdirSync(docSourceDir, { recursive: true })
                    }

                    const contentLinkReportPath = `./plugins/lark-docs/meta/reports/${manualName}-broken-content-links.json`
                    const shouldAutoValidateContentLinks = () => sourceType === 'wiki' && base.endsWith(':*')
                    const validateContentLinks = async ({ force=false, fresh=false } = {}) => {
                        if (opts.skipLinkValidation) return null
                        if (!force && !shouldAutoValidateContentLinks()) return null
                        const validationScraper = fresh ? new docScraper(root, base, sourceType, docSourceDir) : scraper
                        return validationScraper.validate_content_links({
                            reportPath: contentLinkReportPath,
                            failOnBroken: !!opts.failOnBrokenContentLinks,
                        })
                    }

                    if (opts.validateLinks && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await validateContentLinks({ force: true })
                        return
                    }

                    // Sidebar-only mode: regenerate sidebar from existing sources without re-fetching
                    if (opts.sidebarOnly) {
                        if (opts.validateLinks) {
                            await validateContentLinks({ force: true })
                        }
                        const targetConfig = resolveTarget(targets, opts.pubTarget) ?? resolveTarget(targets, utils.list_valid_targets(targets)[0])
                        const { outputDir } = targetConfig
                        const effectiveSidebarPath = targetConfig.sidebarPath ?? sidebarPath
                        if (!effectiveSidebarPath) throw new Error('sidebarPath is not configured for this manual or target')
                        const writer = sourceType === 'wiki' || sourceType === 'onePager'
                            ? new docWriter(root, base, displayedSidebar, docSourceDir, null, opts.pubTarget ?? Object.keys(targets)[0], true, false, opts.linkShim)
                            : new driveWriter(root, base, displayedSidebar, docSourceDir, null, opts.pubTarget ?? Object.keys(targets)[0], true, false, opts.manual)
                        console.log('Generating sidebar from existing sources...')
                        const sidebarItems = await writer.generate_sidebar(outputDir, outputDir.split('/')[0])
                        const sidebarDir = require('node:path').dirname(effectiveSidebarPath)
                        if (!fs.existsSync(sidebarDir)) fs.mkdirSync(sidebarDir, { recursive: true })
                        fs.writeFileSync(effectiveSidebarPath, `module.exports = ${JSON.stringify(sidebarItems, null, 2)}\n`)
                        console.log(`Sidebar written to ${effectiveSidebarPath}`)
                        return
                    }

                    if (opts.pubTarget === undefined) {
                        // Only pull source files from Feishu iteratively
                        if (opts.sourceOnly) {
                            if (opts.table) {
                                if (sourceType !== 'wiki' || !base.endsWith(':*')) {
                                    throw new Error('--table is only supported for wiki manuals backed by all Base tables')
                                }
                                await scraper.fetch_base_table_sources(opts.table)
                                await validateContentLinks({ force: !!opts.validateLinks, fresh: true })
                            } else {
                                // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                                fs.rmSync(docSourceDir, { recursive: true })
                                fs.mkdirSync(docSourceDir, { recursive: true })
                                await scraper.fetch(true)
                                if (fallbackSourceDir !== undefined) {
                                    utils.fetch_fallback_sources(docSourceDir, fallbackSourceDir, sourceType)
                                }
                                await validateContentLinks({ force: !!opts.validateLinks })
                            }
                        // Pull specific source file from Feishu
                        } else if (opts.docToken !== undefined) {
                            // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                            await scraper.fetch(false, opts.docToken)
                        } else {
                            throw new Error('Please provide a target')
                        }
                    } else {
                        try {
                            var targetConfig = resolveTarget(targets, opts.pubTarget)
                            var { outputDir, imageDir } = targetConfig
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
                            new docWriter(root, base, displayedSidebar, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown, opts.uploadToS3, opts.linkShim) :
                            new driveWriter(root, base, displayedSidebar, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown, opts.uploadToS3, opts.manual)

                        // Ensure S3 connections are always closed, even on error or Ctrl+C
                        const writerCleanup = () => { try { writer.destroy() } catch (_) {} }
                        process.once('SIGINT', writerCleanup)
                        process.once('SIGTERM', writerCleanup)

                        // Pull and write a specific subtree (node + descendants)
                        if (opts.docToken !== undefined) {
                            try {
                                console.log(`Pulling subtree starting from ${opts.docToken}...`)
                                if (!opts.skipSourceDown) {
                                    await scraper.fetch(true, opts.docToken)
                                }
                                await writer.write_subtree(outputDir, opts.docToken)
                                console.log('Subtree pull complete.')
                            } finally {
                                writerCleanup()
                            }
                            return
                        }

                        // Add necessary imports to category pages
                        if (opts.postProcess) {
                            console.log('Post processing file paths')
                            utils.post_process_file_paths(outputDir)
                        }

                        // Generate doc pages iteratively
                        if (opts.docTitle === undefined && !opts.faq && !opts.postProcess) {
                            try {
                                console.log('Fetching docs from Feishu...')
                                utils.pre_process_file_paths(outputDir)

                                if (!opts.skipSourceDown) {
                                    fs.rmSync(docSourceDir, { recursive: true })
                                    fs.mkdirSync(docSourceDir, { recursive: true })
                                    await scraper.fetch(true)
                                    if (fallbackSourceDir !== undefined) {
                                        utils.fetch_fallback_sources(docSourceDir, fallbackSourceDir, sourceType)
                                    }
                                }

                                if (!opts.skipSourceDown || opts.validateLinks) {
                                    await validateContentLinks({ force: !!opts.validateLinks })
                                }

                                if (opts.sourceOnly) {
                                    writerCleanup()
                                    return
                                }

                                await writer.write_docs(outputDir, root)

                                const effectiveSidebarPath = targetConfig.sidebarPath ?? sidebarPath
                                if (effectiveSidebarPath && !opts.skipSidebar) {
                                    console.log('Generating sidebar...')
                                    const sidebarItems = await writer.generate_sidebar(outputDir, outputDir.split('/')[0])
                                    const sidebarDir = require('node:path').dirname(effectiveSidebarPath)
                                    if (!fs.existsSync(sidebarDir)) fs.mkdirSync(sidebarDir, { recursive: true })
                                    fs.writeFileSync(effectiveSidebarPath, `module.exports = ${JSON.stringify(sidebarItems, null, 2)}\n`)
                                    console.log(`Sidebar written to ${effectiveSidebarPath}`)
                                }

                                utils.post_process_file_paths(outputDir)
                            } finally {
                                writerCleanup()
                            }
                        }

                        // Generate a specific doc page
                        if (opts.docTitle !== undefined) {
                            console.log(opts.docTitle)
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
                                process.exit(1)
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
                                const description = meta['description']
                                const addedSince = meta['addSince']
                                const lastModified = meta['lastModified']
                                const deprecateSince = meta['deprecateSince']
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
                                    addedSince: addedSince ? addedSince : false,
                                    lastModified: lastModified ? lastModified : false,
                                    deprecateSince: deprecateSince ? deprecateSince : false,
                                    page_type: source_type,
                                    page_token: token,
                                    sidebar_position: sidebarPos,
                                    sidebar_label: labels,
                                    keywords: keywords,
                                    doc_card_list: doc_card_list,
                                    page_description: description ? description : false,
                                }
    
                                await writer.write_doc(req)
                            } else {
                                console.log('The doc is not ready to publish!')
                            }
                            writerCleanup()
                        }
                                    
                        if (opts.faq) {
                            // const scraper = new docScraper(root, base)
                            var source
    
                            var token = fs.readdirSync(docSourceDir).filter(file => {
                                source = JSON.parse(fs.readFileSync(docSourceDir + '/' + file, 'utf8'))
                                return source.slug === 'faqs'
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
                            writerCleanup()
                        }

                        if (opts.pubTarget === "milvus") {
                            utils.postprocess_for_milvus(outputDir, docSourceDir)
                        }
                    }
                })
        }
    }
}
