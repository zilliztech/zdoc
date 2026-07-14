const docScraper = require('./larkDocScraper.js')
const docWriter = require('./larkDocWriter.js')
const driveWriter = require('./larkDriveWriter.js')
const { runCanonicalLinkAudit } = require('./canonicalLinkAuditor')
const { canonicalAuditRequestForPlan } = require('./incrementalCanonicalAudit')
const { planIncrementalFetch, writeIncrementalFetchPlanReports } = require('./incrementalFetchPlanner')
const { createSourceSnapshot, readSnapshot, validateCandidateSnapshot, writeSnapshot } = require('./sourceSnapshot')
const Utils = require('./larkUtils.js')
const fs = require('node:fs')
const path = require('node:path')
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
                .option('--auditCanonicalLinks', 'Write file-centric canonical mention_doc and Feishu link audit reports')
                .option('--canonicalLinkReportPrefix <path>', 'Output prefix for canonical link audit reports')
                .option('--failOnBrokenCanonicalLinks', 'Fail when canonical link audit finds links or mention_docs outside the current Base')
                .option('--incremental', 'Fetch only changed Base docs and cross-reference neighbors when a last-success snapshot exists')
                .option('--incrementalPlanOnly', 'Write the incremental fetch plan and exit without fetching')
                .option('--incrementalMaxReferenceDepth <n>', 'Reference expansion depth for --incremental', '1')
                .option('--snapshotPath <path>', 'Override last-success snapshot path')
                .option('--snapshotCandidatePath <path>', 'Write a source snapshot candidate after an incremental source-only fetch')
                .option('--buildEnv <env>', 'Build environment for snapshot scoping: uat or production', process.env.DOCS_BUILD_ENV || 'local')
                .option('--forceFullFetch', 'Ignore incremental planning and force a full source fetch')
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

                    const auditCanonicalLinks = async ({ fresh=false, sourceTokens=null, failOnBroken=!!opts.failOnBrokenCanonicalLinks } = {}) => {
                        if (!opts.auditCanonicalLinks && !opts.failOnBrokenCanonicalLinks) return null
                        const auditScraper = fresh ? new docScraper(root, base, sourceType, docSourceDir) : scraper
                        if (!auditScraper.records) {
                            await auditScraper.__base()
                        }
                        const prefix = opts.canonicalLinkReportPrefix ||
                            `./plugins/lark-docs/meta/reports/${manualName}-canonical-link-audit`
                        const { report, paths } = runCanonicalLinkAudit({
                            manualName,
                            docSourceDir,
                            records: auditScraper.records,
                            target: opts.pubTarget || null,
                            outputPrefix: prefix,
                            failOnBroken,
                            sourceTokens,
                        })
                        console.log(`[canonical-links] Report written to ${paths.markdownPath}`)
                        return report
                    }

                    const fullSourceFetch = async () => {
                        fs.rmSync(docSourceDir, { recursive: true })
                        fs.mkdirSync(docSourceDir, { recursive: true })
                        await scraper.fetch(true)
                        if (fallbackSourceDir !== undefined) {
                            utils.fetch_fallback_sources(docSourceDir, fallbackSourceDir, sourceType, root)
                        }
                    }

                    let currentNodeMetadataByToken = new Map()

                    const planIncrementalSourceFetch = async () => {
                        if (!scraper.records) {
                            await scraper.__base({ progressLabel: '[incremental-fetch] Base scan' })
                        }
                        const snapshotEnv = opts.buildEnv || 'local'
                        const snapshotPath = opts.snapshotPath ||
                            path.join('.', 'plugins', 'lark-docs', 'meta', 'snapshots', `${manualName}-${snapshotEnv}-last-success.json`)
                        currentNodeMetadataByToken = await scraper.fetch_wiki_node_metadata(scraper.records, {
                            progressLabel: '[incremental-fetch] Wiki metadata',
                        })
                        const plan = planIncrementalFetch({
                            manualName,
                            docSourceDir,
                            records: scraper.records,
                            previousSnapshot: readSnapshot(snapshotPath),
                            buildEnv: snapshotEnv,
                            maxReferenceDepth: Number(opts.incrementalMaxReferenceDepth || 1),
                            forceFull: !!opts.forceFullFetch,
                            currentNodeMetadataByToken,
                        })
                        const prefix = path.join('.', 'plugins', 'lark-docs', 'meta', 'reports', `${manualName}-incremental-fetch-plan`)
                        const paths = writeIncrementalFetchPlanReports(plan, prefix)
                        console.log(`[incremental-fetch] Plan written to ${paths.markdownPath}`)
                        return plan
                    }

                    const readRecentIncrementalPlanForSkippedSources = () => {
                        if (!opts.skipSourceDown) return null
                        const reportPath = path.join('.', 'plugins', 'lark-docs', 'meta', 'reports', `${manualName}-incremental-fetch-plan.json`)
                        if (!fs.existsSync(reportPath)) return null
                        let plan
                        try {
                            plan = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
                        } catch (e) {
                            console.warn(`[incremental-fetch] Cannot reuse incremental plan ${reportPath}: ${e.message}`)
                            return null
                        }
                        if (plan.manual !== manualName || plan.mode !== 'incremental') return null
                        const planSourceDir = path.resolve(plan.source_dir || '')
                        if (planSourceDir !== path.resolve(docSourceDir)) return null
                        const expectedBuildEnv = opts.buildEnv || process.env.DOCS_BUILD_ENV || 'local'
                        if ((plan.build_env || null) !== (expectedBuildEnv || null)) return null
                        const generatedAt = Date.parse(plan.generated_at || '')
                        const maxPlanAgeMs = 6 * 60 * 60 * 1000
                        if (!Number.isFinite(generatedAt) || Date.now() - generatedAt > maxPlanAgeMs) return null
                        console.log(`[incremental-fetch] Reusing recent incremental plan for skipped sources: ${reportPath}`)
                        return plan
                    }

                    const fetchSources = async () => {
                        if (opts.incremental || opts.incrementalPlanOnly) {
                            if (sourceType !== 'wiki' || !base.endsWith(':*')) {
                                console.warn('[incremental-fetch] Incremental fetch is only supported for wiki manuals backed by all Base tables. Falling back to full fetch.')
                                if (opts.incrementalPlanOnly) return
                                await fullSourceFetch()
                                return null
                            }
                            const plan = await planIncrementalSourceFetch()
                            if (opts.incrementalPlanOnly) return
                            if (plan.mode === 'incremental') {
                                await scraper.fetch_source_tokens(plan.expanded_tokens)
                                if (fallbackSourceDir !== undefined) {
                                    utils.fetch_fallback_sources(docSourceDir, fallbackSourceDir, sourceType, root)
                                }
                                return plan
                            }
                        }
                        await fullSourceFetch()
                        return null
                    }

                    const removeEmptyDirs = (dir) => {
                        if (!fs.existsSync(dir)) return
                        const entries = fs.readdirSync(dir, { withFileTypes: true })
                        for (const entry of entries) {
                            if (entry.isDirectory()) removeEmptyDirs(path.join(dir, entry.name))
                        }
                        if (dir !== outputDir && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
                            fs.rmSync(dir, { recursive: true, force: true })
                        }
                    }

                    const cleanupRemovedIncrementalRecords = (plan, targetOutputDir) => {
                        const removedRecords = plan?.removed_records || []
                        if (!removedRecords.length) return
                        for (const record of removedRecords) {
                            const sourceCandidates = [
                                record.source_file,
                                record.doc_token ? `${record.doc_token}.json` : null,
                                record.node_token ? `${record.node_token}.json` : null,
                                record.origin_node_token ? `${record.origin_node_token}.json` : null,
                                record.obj_token ? `${record.obj_token}.json` : null,
                            ].filter(Boolean)
                            for (const file of sourceCandidates) {
                                fs.rmSync(path.join(docSourceDir, file), { force: true })
                            }

                            if (record.doc_token && fs.existsSync(targetOutputDir)) {
                                try {
                                    const relPath = utils.determine_file_path(record.doc_token, targetOutputDir)
                                    fs.rmSync(path.join(targetOutputDir, relPath), { force: true })
                                } catch (_) {}
                            }
                        }
                        removeEmptyDirs(targetOutputDir)
                    }

                    const hasFullSourceContent = (plan) => !plan || plan.mode !== 'incremental'

                    const maybeValidateContentLinks = async ({ plan=null, force=false } = {}) => {
                        if (!hasFullSourceContent(plan)) {
                            console.log('[incremental-fetch] Skipping full content link validation because only incremental sources were fetched.')
                            return null
                        }
                        return validateContentLinks({ force })
                    }

                    const maybeAuditCanonicalLinks = async ({ plan=null } = {}) => {
                        if (!hasFullSourceContent(plan)) {
                            const request = canonicalAuditRequestForPlan(plan)
                            if (request.reason === 'zero-change-full-audit') {
                                console.log('[incremental-fetch] No sources changed; running a full canonical link audit in report-only mode.')
                            } else {
                                console.log(`[incremental-fetch] Running canonical link audit for ${request.sourceTokens.length} incremental source(s) in report-only mode.`)
                            }
                            return auditCanonicalLinks({ sourceTokens: request.sourceTokens, failOnBroken: false })
                        }
                        return auditCanonicalLinks()
                    }

                    const writeSourceSnapshotCandidate = () => {
                        if (!opts.snapshotCandidatePath) return
                        if (!opts.sourceOnly || !opts.incremental) {
                            throw new Error('--snapshotCandidatePath requires --sourceOnly and --incremental')
                        }
                        const candidate = createSourceSnapshot({
                            manualName,
                            targetsBuilt: [],
                            buildEnv: opts.buildEnv || 'local',
                            sourceBranch: null,
                            publishUrl: null,
                            linkCheckRemote: 'https://docs.zilliz.com',
                            docSourceDir,
                            baseAppToken: scraper.base_app_token,
                            records: scraper.records,
                            nodeMetadataByToken: currentNodeMetadataByToken,
                        })
                        validateCandidateSnapshot(candidate, {
                            manual: manualName,
                            buildEnv: opts.buildEnv || 'local',
                            sourceDir: docSourceDir,
                            baseAppToken: scraper.base_app_token,
                        })
                        writeSnapshot(opts.snapshotCandidatePath, candidate)
                        console.log(`[snapshot] Candidate written to ${opts.snapshotCandidatePath}`)
                    }

                    const injectedDocFilesToPreserve = (targetConfig) => {
                        const effectiveOverridePath = targetConfig.overridePath ?? overridePath
                        if (!effectiveOverridePath || !fs.existsSync(effectiveOverridePath)) return []
                        let overrides
                        try {
                            overrides = JSON.parse(fs.readFileSync(effectiveOverridePath, 'utf8'))
                        } catch (e) {
                            console.warn(`[fetch-lark-docs] Cannot read sidebar override file ${effectiveOverridePath}: ${e.message}`)
                            return []
                        }
                        const root = contentRoot || targetConfig.outputDir.split('/')[0]
                        return (overrides.inject || [])
                            .map(injection => injection.item)
                            .filter(item => item?.type === 'doc' && item.id)
                            .map(item => path.join(root, `${item.id}.md`))
                            .filter(file => file.startsWith(`${targetConfig.outputDir}/`) && fs.existsSync(file))
                    }

                    if (opts.validateLinks && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await validateContentLinks({ force: true })
                        return
                    }

                    if (opts.incrementalPlanOnly && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await planIncrementalSourceFetch()
                        return
                    }

                    if ((opts.auditCanonicalLinks || opts.failOnBrokenCanonicalLinks) && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await auditCanonicalLinks()
                        return
                    }

                    // Sidebar-only mode: regenerate sidebar from existing sources without re-fetching
                    if (opts.sidebarOnly) {
                        if (opts.validateLinks) {
                            await validateContentLinks({ force: true })
                        }
                        await auditCanonicalLinks()
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
                                await auditCanonicalLinks()
                            } else {
                                // const scraper = new docScraper(root, base, sourceType, docSourceDir)
                                const sourcePlan = await fetchSources()
                                if (opts.incrementalPlanOnly) return
                                await maybeValidateContentLinks({ plan: sourcePlan, force: !!opts.validateLinks })
                                await maybeAuditCanonicalLinks({ plan: sourcePlan })
                                writeSourceSnapshotCandidate()
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
                                let sourcePlan = readRecentIncrementalPlanForSkippedSources()
                                if (!opts.skipSourceDown) {
                                    sourcePlan = await fetchSources()
                                    if (opts.incrementalPlanOnly) {
                                        writerCleanup()
                                        return
                                    }
                                }

                                if (sourcePlan?.mode === 'incremental') {
                                    cleanupRemovedIncrementalRecords(sourcePlan, outputDir)
                                } else if (targetConfig.preserveOutput) {
                                    console.log(`Preserving existing output files in ${outputDir}`)
                                } else {
                                    utils.pre_process_file_paths(outputDir, injectedDocFilesToPreserve(targetConfig))
                                }

                                if (!opts.skipSourceDown || opts.validateLinks) {
                                    await maybeValidateContentLinks({ plan: sourcePlan, force: !!opts.validateLinks })
                                }

                                await maybeAuditCanonicalLinks({ plan: sourcePlan })

                                if (opts.sourceOnly) {
                                    writerCleanup()
                                    return
                                }

                                if (sourcePlan?.mode === 'incremental') {
                                    const tokensToWrite = sourcePlan.expanded_tokens || []
                                    if (tokensToWrite.length === 0) {
                                        console.log('[incremental-fetch] No changed or expanded docs to write.')
                                    } else {
                                        for (const token of tokensToWrite) {
                                            await writer.write_subtree(outputDir, token)
                                        }
                                    }
                                } else {
                                    await writer.write_docs(outputDir, root)
                                }

                                const effectiveSidebarPath = targetConfig.sidebarPath ?? sidebarPath
                                const shouldUpdateSidebar = !sourcePlan || sourcePlan.mode !== 'incremental' ||
                                    (sourcePlan.expanded_tokens || []).length > 0 ||
                                    (sourcePlan.removed_records || []).length > 0
                                if (effectiveSidebarPath && !opts.skipSidebar && shouldUpdateSidebar) {
                                    console.log('Generating sidebar...')
                                    const sidebarItems = await writer.generate_sidebar(outputDir, outputDir.split('/')[0])
                                    const sidebarDir = require('node:path').dirname(effectiveSidebarPath)
                                    if (!fs.existsSync(sidebarDir)) fs.mkdirSync(sidebarDir, { recursive: true })
                                    fs.writeFileSync(effectiveSidebarPath, `module.exports = ${JSON.stringify(sidebarItems, null, 2)}\n`)
                                    console.log(`Sidebar written to ${effectiveSidebarPath}`)
                                }

                                if (!sourcePlan || sourcePlan.mode !== 'incremental' || (sourcePlan.expanded_tokens || []).length > 0) {
                                    utils.post_process_file_paths(outputDir)
                                }
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
