const docScraper = require('./larkDocScraper.js')
const docWriter = require('./larkDocWriter.js')
const driveWriter = require('./larkDriveWriter.js')
const { runCanonicalLinkAudit } = require('./canonicalLinkAuditor')
const { canonicalAuditRequestForPlan } = require('./incrementalCanonicalAudit')
const { planIncrementalFetch, writeIncrementalFetchPlanReports } = require('./incrementalFetchPlanner')
const { createSourceSnapshot, readSnapshot, validateCandidateSnapshot, writeSnapshot } = require('./sourceSnapshot')
const { validateSourceCompleteness, assertSourceCompleteness } = require('./sourceCompleteness')
const { cleanupRemovedIncrementalRecords } = require('./incrementalReconciliation')
const { createOfflineMediaResolver } = require('./offlineMediaResolver')
const LarkSourceIndex = require('./larkSourceIndex')
const Utils = require('./larkUtils.js')
const fs = require('node:fs')
const path = require('node:path')
const inquirer = require('inquirer')
require('dotenv/config');

function validateOfflineOptions(opts) {
    if (!opts.offline) return
    if (!opts.skipSourceDown) throw new Error('--offline requires --skipSourceDown')
    if (!opts.mediaManifest) throw new Error('--offline requires --mediaManifest')
}

const GUIDES_SIDEBAR_TARGETS = Object.freeze(['zilliz.saas', 'zilliz.paas'])

function resolveConfiguredTarget(targets, targetName) {
    return targetName.split('.').reduce((value, key) => value?.[key], targets)
}

function parseSidebarTargets(value) {
    if (typeof value !== 'string' || value.length === 0) throw new Error('--sidebarTargets requires targets')
    return value.split(',')
}

function validateSidebarTargetRequest({
    manualName, manual, targetNames, sidebarOnly, skipSourceDown, offline, mediaManifest,
    skipSidebar=false, pubTarget=null, incrementalPlanOnly=false,
}) {
    if (manualName !== 'guides' || manual?.sourceType !== 'wiki') {
        throw new Error('--sidebarTargets is only supported for the Guides wiki manual')
    }
    if (!sidebarOnly) throw new Error('--sidebarTargets requires --sidebarOnly')
    if (!skipSourceDown) throw new Error('--sidebarTargets requires --skipSourceDown')
    if (!offline) throw new Error('--sidebarTargets requires --offline')
    if (!mediaManifest) throw new Error('--sidebarTargets requires --mediaManifest')
    if (skipSidebar) throw new Error('--sidebarTargets cannot be combined with --skipSidebar')
    if (pubTarget) throw new Error('--sidebarTargets cannot be combined with --pubTarget')
    if (incrementalPlanOnly) throw new Error('--incrementalPlanOnly cannot be combined with --sidebarTargets')
    if (!Array.isArray(targetNames)) throw new Error('--sidebarTargets requires targets')
    if (new Set(targetNames).size !== targetNames.length) throw new Error('--sidebarTargets contains duplicate targets')
    const unknown = targetNames.filter(target => !GUIDES_SIDEBAR_TARGETS.includes(target))
    if (unknown.length > 0) throw new Error(`--sidebarTargets contains unknown targets: ${unknown.join(', ')}`)
    if (targetNames.length !== GUIDES_SIDEBAR_TARGETS.length ||
        GUIDES_SIDEBAR_TARGETS.some(target => !targetNames.includes(target))) {
        throw new Error(`--sidebarTargets requires exactly ${GUIDES_SIDEBAR_TARGETS.join(',')}`)
    }
    for (const targetName of GUIDES_SIDEBAR_TARGETS) {
        const targetConfig = resolveConfiguredTarget(manual.targets, targetName)
        if (!targetConfig?.outputDir) throw new Error(`Missing Guides target configuration: ${targetName}`)
        if (!(targetConfig.sidebarPath ?? manual.sidebarPath)) {
            throw new Error(`Missing Guides sidebar path for target: ${targetName}`)
        }
    }
    return [...GUIDES_SIDEBAR_TARGETS]
}

function sidebarModuleContents(sidebarItems) {
    return `module.exports = ${JSON.stringify(sidebarItems, null, 2)}\n`
}

function safeWorkspacePath(workspace, relativePath, fsImpl) {
    if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
        throw new Error(`Unsafe sidebar path: ${relativePath}`)
    }
    const normalized = path.normalize(relativePath)
    if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
        throw new Error(`Unsafe sidebar path: ${relativePath}`)
    }
    const root = fsImpl.realpathSync(workspace)
    const target = path.resolve(root, normalized)
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Sidebar path escapes workspace: ${relativePath}`)
    return { root, target }
}

function ensureSafeDirectory(root, directory, fsImpl) {
    const relative = path.relative(root, directory)
    let current = root
    for (const segment of relative.split(path.sep).filter(Boolean)) {
        current = path.join(current, segment)
        let stat
        try {
            stat = fsImpl.lstatSync(current)
        } catch (error) {
            if (error.code !== 'ENOENT') throw error
            fsImpl.mkdirSync(current)
            stat = fsImpl.lstatSync(current)
        }
        if (stat.isSymbolicLink()) throw new Error(`Sidebar ancestor must not be a symlink: ${current}`)
        if (!stat.isDirectory()) throw new Error(`Sidebar ancestor must be a directory: ${current}`)
    }
}

function uniqueSiblingPath(finalPath, kind, fsImpl) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const candidate = `${finalPath}.${kind}-${process.pid}-${Date.now()}-${attempt}`
        try {
            fsImpl.lstatSync(candidate)
        } catch (error) {
            if (error.code === 'ENOENT') return candidate
            throw error
        }
    }
    throw new Error(`Cannot allocate sidebar ${kind} path for ${finalPath}`)
}

function removePathIfPresent(target, fsImpl) {
    try {
        const stat = fsImpl.lstatSync(target)
        fsImpl.rmSync(target, { recursive: stat.isDirectory(), force: true })
    } catch (error) {
        if (error.code !== 'ENOENT') throw error
    }
}

function transactionOperationError(operation, target, error) {
    return new Error(`${operation} (${target}): ${error.message}`, { cause: error })
}

function aggregateTransactionError(label, primaryError, recoveryErrors) {
    if (recoveryErrors.length === 0) return primaryError
    const errors = [primaryError, ...recoveryErrors]
    return new AggregateError(errors, `${label}: ${errors.map(error => error.message).join('; ')}`, { cause: primaryError })
}

function recordDirectoryIdentity(root, directory, fsImpl) {
    const stat = fsImpl.lstatSync(directory)
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Sidebar output parent must be a real directory: ${directory}`)
    const realDirectory = fsImpl.realpathSync(directory)
    if (realDirectory !== directory || (realDirectory !== root && !realDirectory.startsWith(`${root}${path.sep}`))) {
        throw new Error(`Sidebar output parent escapes workspace: ${directory}`)
    }
    return Object.freeze({ directory, realDirectory, device: stat.dev, inode: stat.ino })
}

function verifyDirectoryIdentity(identity, fsImpl) {
    let stat
    let realDirectory
    try {
        stat = fsImpl.lstatSync(identity.directory)
        realDirectory = fsImpl.realpathSync(identity.directory)
    } catch (error) {
        throw new Error(`Sidebar output directory identity unavailable for ${identity.directory}: ${error.message}`, { cause: error })
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()
        || stat.dev !== identity.device || stat.ino !== identity.inode || realDirectory !== identity.realDirectory) {
        throw new Error(`Sidebar output directory identity changed: ${identity.directory}`)
    }
}

function attemptTransactionOperation(errors, operation, target, callback) {
    try {
        callback()
        return true
    } catch (error) {
        errors.push(transactionOperationError(operation, target, error))
        return false
    }
}

function removeEntryPathIfPresent(entry, target, fsImpl) {
    verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
    removePathIfPresent(target, fsImpl)
    verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
}

function writeStagedFile(entry, fsImpl) {
    const { tempPath: target, contents, directoryIdentity } = entry
    const noFollow = fsImpl.constants.O_NOFOLLOW
    if (typeof noFollow !== 'number') throw new Error('Secure sidebar staging requires O_NOFOLLOW support')
    const flags = fsImpl.constants.O_WRONLY | fsImpl.constants.O_CREAT | fsImpl.constants.O_EXCL | noFollow
    let descriptor
    let primaryError = null
    try {
        verifyDirectoryIdentity(directoryIdentity, fsImpl)
        descriptor = fsImpl.openSync(target, flags, 0o644)
        verifyDirectoryIdentity(directoryIdentity, fsImpl)
        fsImpl.writeFileSync(descriptor, contents, 'utf8')
        fsImpl.fsyncSync(descriptor)
        verifyDirectoryIdentity(directoryIdentity, fsImpl)
    } catch (error) {
        primaryError = error
    }
    if (descriptor !== undefined) {
        try {
            fsImpl.closeSync(descriptor)
        } catch (error) {
            if (!primaryError) primaryError = error
            else primaryError = aggregateTransactionError('Sidebar staged file close failed', primaryError, [
                transactionOperationError('close staged sidebar', target, error),
            ])
        }
    }
    if (primaryError) throw primaryError
}

function writeSidebarPairTransactional({ workspace=process.cwd(), outputs, fsImpl=fs }) {
    if (!Array.isArray(outputs) || outputs.length !== 2) throw new Error('Exactly two sidebar outputs are required')
    const entries = outputs.map(output => {
        const { root, target } = safeWorkspacePath(workspace, output.sidebarPath, fsImpl)
        const directory = path.dirname(target)
        ensureSafeDirectory(root, directory, fsImpl)
        const directoryIdentity = recordDirectoryIdentity(root, directory, fsImpl)
        let hadOriginal = false
        try {
            const stat = fsImpl.lstatSync(target)
            if (stat.isSymbolicLink()) throw new Error(`Sidebar target must not be a symlink: ${target}`)
            if (!stat.isFile()) throw new Error(`Sidebar target must be a regular file: ${target}`)
            hadOriginal = true
        } catch (error) {
            if (error.code !== 'ENOENT') throw error
        }
        return {
            finalPath: target,
            tempPath: uniqueSiblingPath(target, 'tmp', fsImpl),
            backupPath: hadOriginal ? uniqueSiblingPath(target, 'backup', fsImpl) : null,
            hadOriginal,
            backupMade: false,
            committed: false,
            directoryIdentity,
            contents: sidebarModuleContents(output.sidebarItems),
        }
    })
    if (new Set(entries.map(entry => entry.finalPath)).size !== entries.length) {
        throw new Error('Sidebar output paths must be distinct')
    }

    let transactionCommitted = false
    try {
        for (const entry of entries) writeStagedFile(entry, fsImpl)
        for (const entry of entries) {
            if (!entry.hadOriginal) continue
            verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
            const stat = fsImpl.lstatSync(entry.finalPath)
            if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Unsafe sidebar target: ${entry.finalPath}`)
            fsImpl.renameSync(entry.finalPath, entry.backupPath)
            entry.backupMade = true
            verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
        }
        for (const entry of entries) {
            verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
            fsImpl.renameSync(entry.tempPath, entry.finalPath)
            entry.committed = true
            verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
        }
        transactionCommitted = true
    } catch (primaryError) {
        const recoveryErrors = []
        for (const entry of entries) {
            if (entry.backupMade) {
                const removed = attemptTransactionOperation(recoveryErrors, 'remove uncommitted sidebar', entry.finalPath, () => {
                    removeEntryPathIfPresent(entry, entry.finalPath, fsImpl)
                })
                if (removed) {
                    const restored = attemptTransactionOperation(recoveryErrors, 'restore sidebar backup', `${entry.backupPath} -> ${entry.finalPath}`, () => {
                        verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
                        fsImpl.renameSync(entry.backupPath, entry.finalPath)
                        entry.backupMade = false
                        verifyDirectoryIdentity(entry.directoryIdentity, fsImpl)
                    })
                    if (restored) entry.committed = false
                }
            } else if (entry.committed) {
                attemptTransactionOperation(recoveryErrors, 'remove new sidebar', entry.finalPath, () => {
                    removeEntryPathIfPresent(entry, entry.finalPath, fsImpl)
                    entry.committed = false
                })
            }
        }
        for (const entry of entries) {
            attemptTransactionOperation(recoveryErrors, 'remove staged sidebar residue', entry.tempPath, () => {
                removeEntryPathIfPresent(entry, entry.tempPath, fsImpl)
            })
        }
        throw aggregateTransactionError('Sidebar pair transaction and recovery failed', primaryError, recoveryErrors)
    }

    if (!transactionCommitted) throw new Error('Sidebar pair transaction did not reach commit')
    const cleanupErrors = []
    for (const entry of entries) {
        if (!entry.backupMade) continue
        const removed = attemptTransactionOperation(cleanupErrors, 'remove committed sidebar backup residue', entry.backupPath, () => {
            removeEntryPathIfPresent(entry, entry.backupPath, fsImpl)
        })
        if (removed) entry.backupMade = false
    }
    if (cleanupErrors.length > 0) {
        throw new AggregateError(cleanupErrors, `Sidebar pair committed but backup cleanup failed: ${cleanupErrors.map(error => error.message).join('; ')}`)
    }
    return outputs
}

async function generateSidebarTargets(options) {
    const targetNames = validateSidebarTargetRequest(options)
    const { manual, sourceIndex, writerFactory, writeSidebarPair, linkShim=null, mediaResolver=null } = options
    if (!sourceIndex || !Object.isFrozen(sourceIndex)) throw new Error('--sidebarTargets requires one immutable source index')
    for (const method of ['find', 'findAnyToken', 'findBaseSourceMeta']) {
        if (typeof sourceIndex[method] !== 'function') throw new Error(`Immutable source index requires ${method}`)
    }
    if (typeof writerFactory !== 'function') throw new Error('writerFactory is required')
    if (typeof writeSidebarPair !== 'function') throw new Error('writeSidebarPair is required')

    const writers = []
    const generated = []
    let primaryError = null
    try {
        for (const targetName of targetNames) {
            const targetConfig = resolveConfiguredTarget(manual.targets, targetName)
            const writer = writerFactory(
                manual.root,
                manual.base,
                manual.displayedSidebar,
                manual.docSourceDir,
                targetConfig.imageDir ?? null,
                targetName,
                true,
                false,
                linkShim,
                mediaResolver,
                sourceIndex,
            )
            if (!writer || writers.some(entry => entry.writer === writer)) {
                throw new Error('Each Guides sidebar target requires a distinct writer instance')
            }
            writers.push({ writer, targetName, targetConfig })
        }

        for (const { writer, targetName, targetConfig } of writers) {
            const sidebarItems = await writer.generate_sidebar(targetConfig.outputDir, targetConfig.outputDir.split('/')[0])
            generated.push({
                targetName,
                sidebarPath: targetConfig.sidebarPath ?? manual.sidebarPath,
                sidebarItems,
            })
        }
        await writeSidebarPair(generated)
        return generated
    } catch (error) {
        primaryError = error
        throw error
    } finally {
        let cleanupError = null
        for (const { writer } of writers) {
            try {
                writer.destroy()
            } catch (error) {
                cleanupError ||= error
            }
        }
        if (!primaryError && cleanupError) throw cleanupError
    }
}

function larkDocsPlugin(context, options) {
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
                .option('--sidebarTargets <targets>', 'Generate the fixed combined Guides sidebar target set')
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
                .option('--offline', 'Render only from local source metadata and prefetched media')
                .option('--mediaManifest <path>', 'Prefetched media manifest used by --offline')
                .action(async (opts) => {
                    validateOfflineOptions(opts)
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

                    const sidebarTargetNames = opts.sidebarTargets === undefined
                        ? null
                        : parseSidebarTargets(opts.sidebarTargets)
                    if (sidebarTargetNames) {
                        validateSidebarTargetRequest({
                            manualName,
                            manual,
                            targetNames: sidebarTargetNames,
                            sidebarOnly: !!opts.sidebarOnly,
                            skipSourceDown: !!opts.skipSourceDown,
                            offline: !!opts.offline,
                            mediaManifest: opts.mediaManifest,
                            skipSidebar: !!opts.skipSidebar,
                            pubTarget: opts.pubTarget,
                            incrementalPlanOnly: !!opts.incrementalPlanOnly,
                        })
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

                    const planIncrementalSourceFetch = async ({ sourceCacheIsFresh = false } = {}) => {
                        if (!scraper.records) {
                            await scraper.__base({ progressLabel: '[incremental-fetch] Base scan' })
                        }
                        const snapshotEnv = opts.buildEnv || 'local'
                        const snapshotPath = opts.snapshotPath ||
                            path.join('.', 'plugins', 'lark-docs', 'meta', 'snapshots', `${manualName}-${snapshotEnv}-last-success.json`)
                        currentNodeMetadataByToken = sourceType === 'wiki'
                            ? await scraper.fetch_wiki_node_metadata(scraper.records, {
                                progressLabel: '[incremental-fetch] Wiki metadata',
                            })
                            : new Map()
                        const previousSnapshot = readSnapshot(snapshotPath)
                        const sourceCompleteness = previousSnapshot && !sourceCacheIsFresh ? validateSourceCompleteness({
                            manual: manualName,
                            buildEnv: snapshotEnv,
                            rootToken: root,
                            sourceDir: docSourceDir,
                            snapshot: previousSnapshot,
                        }) : null
                        if (sourceCompleteness && !sourceCompleteness.complete) {
                            console.warn(`[incremental-fetch] Source cache incomplete (${sourceCompleteness.validCanonicalSources}/${sourceCompleteness.expectedCanonicalSources}); selecting full fetch.`)
                        }
                        const plan = planIncrementalFetch({
                            manualName,
                            docSourceDir,
                            records: scraper.records,
                            previousSnapshot,
                            buildEnv: snapshotEnv,
                            maxReferenceDepth: Number(opts.incrementalMaxReferenceDepth || 1),
                            forceFull: !!opts.forceFullFetch,
                            currentNodeMetadataByToken,
                            sourceCompleteness,
                        })
                        plan.source_scope = sourceCacheIsFresh || plan.mode === 'full' ? 'full' : 'partial'
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
                            if (sourceType === 'wiki' && base.endsWith(':*')) {
                                const plan = await planIncrementalSourceFetch()
                                if (opts.incrementalPlanOnly) return plan
                                if (plan.mode === 'incremental') {
                                    await scraper.fetch_source_tokens(plan.expanded_tokens)
                                    if (fallbackSourceDir !== undefined) {
                                        utils.fetch_fallback_sources(docSourceDir, fallbackSourceDir, sourceType, root)
                                    }
                                    return plan
                                }
                            } else if (sourceType === 'drive') {
                                console.log('[incremental-fetch] Refreshing complete Drive source cache before planning the render delta.')
                                await fullSourceFetch()
                                return planIncrementalSourceFetch({ sourceCacheIsFresh: true })
                            } else {
                                console.warn('[incremental-fetch] Incremental planning is unsupported for this manual; selecting full fetch and render.')
                                if (opts.incrementalPlanOnly) return null
                            }
                        }
                        await fullSourceFetch()
                        return null
                    }

                    const hasFullSourceContent = (plan) => !plan || plan.mode !== 'incremental' || plan.source_scope === 'full'

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
                        assertSourceCompleteness({
                            manual: manualName,
                            buildEnv: opts.buildEnv || 'local',
                            rootToken: root,
                            sourceDir: docSourceDir,
                            snapshot: candidate,
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

                    if (opts.validateLinks && !opts.sidebarOnly && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await validateContentLinks({ force: true })
                        return
                    }

                    if (opts.incrementalPlanOnly && !opts.sidebarOnly && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await planIncrementalSourceFetch()
                        return
                    }

                    if ((opts.auditCanonicalLinks || opts.failOnBrokenCanonicalLinks) && !opts.sidebarOnly && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
                        await auditCanonicalLinks()
                        return
                    }

                    // Sidebar-only mode: regenerate sidebar from existing sources without re-fetching
                    if (opts.sidebarOnly) {
                        if (opts.sidebarTargets !== undefined) {
                            if (opts.validateLinks) {
                                await validateContentLinks({ force: true })
                            }
                            await auditCanonicalLinks()
                            const mediaResolver = createOfflineMediaResolver({
                                manifestPath: opts.mediaManifest,
                                imageBedUrl: process.env.IMAGE_BED_URL || 'https://zdoc-images.s3.us-west-2.amazonaws.com',
                            })
                            const sourceIndex = LarkSourceIndex.load(docSourceDir)
                            await generateSidebarTargets({
                                manualName,
                                manual,
                                targetNames: sidebarTargetNames,
                                sourceIndex,
                                sidebarOnly: true,
                                skipSourceDown: true,
                                offline: true,
                                mediaManifest: opts.mediaManifest,
                                skipSidebar: false,
                                pubTarget: null,
                                incrementalPlanOnly: false,
                                linkShim: opts.linkShim,
                                mediaResolver,
                                writerFactory: (...args) => new docWriter(...args),
                                writeSidebarPair: async outputs => {
                                    writeSidebarPairTransactional({ outputs })
                                    for (const output of outputs) console.log(`Sidebar written to ${output.sidebarPath}`)
                                },
                            })
                            return
                        }
                        if (opts.validateLinks) {
                            await validateContentLinks({ force: true })
                        }
                        await auditCanonicalLinks()
                        const targetConfig = resolveTarget(targets, opts.pubTarget) ?? resolveTarget(targets, utils.list_valid_targets(targets)[0])
                        const { outputDir } = targetConfig
                        const effectiveSidebarPath = targetConfig.sidebarPath ?? sidebarPath
                        if (!effectiveSidebarPath) throw new Error('sidebarPath is not configured for this manual or target')
                        const mediaResolver = opts.offline
                            ? createOfflineMediaResolver({ manifestPath: opts.mediaManifest, imageBedUrl: process.env.IMAGE_BED_URL || 'https://zdoc-images.s3.us-west-2.amazonaws.com' })
                            : null
                        const writer = sourceType === 'wiki' || sourceType === 'onePager'
                            ? new docWriter(root, base, displayedSidebar, docSourceDir, null, opts.pubTarget ?? Object.keys(targets)[0], true, false, opts.linkShim, mediaResolver)
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

                        if (manualName === 'guides' && opts.skipSourceDown && !opts.postProcess) {
                            const candidatePath = opts.snapshotCandidatePath || path.join('.', 'plugins', 'lark-docs', 'meta', 'reports', 'guides-source-snapshot-candidate.json')
                            if (!fs.existsSync(candidatePath)) throw new Error(`Complete guides source candidate is required before rendering: ${candidatePath}`)
                            assertSourceCompleteness({
                                manual: 'guides',
                                buildEnv: opts.buildEnv || 'uat',
                                rootToken: root,
                                sourceDir: docSourceDir,
                                snapshot: readSnapshot(candidatePath),
                            })
                        }

                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true })
                        }

                        if (!fs.existsSync(imageDir)) {
                            fs.mkdirSync(imageDir, { recursive: true })
                        }

                        const mediaResolver = opts.offline
                            ? createOfflineMediaResolver({ manifestPath: opts.mediaManifest, imageBedUrl: process.env.IMAGE_BED_URL || 'https://zdoc-images.s3.us-west-2.amazonaws.com' })
                            : null
                        const writer = sourceType === 'wiki' || sourceType === 'onePager' ?
                            new docWriter(root, base, displayedSidebar, docSourceDir, imageDir, opts.pubTarget, opts.skipImageDown, opts.uploadToS3, opts.linkShim, mediaResolver) :
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
                                    cleanupRemovedIncrementalRecords({
                                        plan: sourcePlan,
                                        docSourceDir,
                                        targetOutputDir: outputDir,
                                        determineFilePath: (token, targetDir) => utils.determine_file_path(token, targetDir),
                                    })
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

module.exports = larkDocsPlugin
module.exports.validateOfflineOptions = validateOfflineOptions
module.exports.generateSidebarTargets = generateSidebarTargets
module.exports.writeSidebarPairTransactional = writeSidebarPairTransactional
module.exports.sidebarModuleContents = sidebarModuleContents
module.exports.parseSidebarTargets = parseSidebarTargets
module.exports.validateSidebarTargetRequest = validateSidebarTargetRequest
