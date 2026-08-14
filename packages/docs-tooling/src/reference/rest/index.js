#!/usr/bin/env node
const { Command, program } = require('commander')
const RefGen = require('./refGen')
const S3Uploader = require('./s3Uploader')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { loadSpecifications } = require('./specLoader')
const { publishIntegratedSpecs } = require('./integratedSpecPublisher')

async function uploadLegacyPageSpecs(specifications, target, lang) {
    const uploader = new S3Uploader({})
    const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-rest-legacy-upload-'))
    const uploaded = []

    try {
        if (target === 'milvus') {
            const result = await publishIntegratedSpecs({
                specifications,
                publicationPolicy: 'latest',
                target,
                language: lang,
                apiSurface: 'v1',
                outputDirectory,
                uploader,
                enableCompatibilityAliases: true,
            })
            uploaded.push(...result.uploads)
            return uploaded
        }

        for (const apiSurface of ['v1', 'v2']) {
            const result = await publishIntegratedSpecs({
                specifications,
                publicationPolicy: 'latest',
                target,
                language: lang,
                apiSurface,
                outputDirectory,
                uploader,
                enableCompatibilityAliases: true,
            })
            uploaded.push(...result.uploads)
        }
        return uploaded
    } finally {
        fs.rmSync(outputDirectory, { recursive: true, force: true })
    }
}

function registerFetchCommand(command) {
    command
        .description('Fetch and generate API reference docs from Apifox')
        .option('-s, --specifications <specifications>', 'Specifications of the API')
        .option('-l, --lang <lang>', 'Language of the API Reference', 'en-US')
        .option('-o, --output_path <target_path>', 'Target path of the API Reference', 'content/en/reference/api/restful/restful')
        .option('-i, --strings <strings>', 'Localization strings for Chinese docs')
        .option('-t, --target <string>', 'Publication target of the API Reference', 'zilliz')
        .option('--upload-s3', 'Upload merged OpenAPI specs to S3 and update about page', false)
        .action(async (opts) => {
            let lang = opts.lang
            let target = opts.target
            let target_path = opts.output_path
            let specifications
            let strings

            console.log('Fetching docs from Apifox...')

            if (opts.specifications === undefined) {
                throw new Error('Please provide specifications')
            } else {
                try {
                    specifications = loadSpecifications(opts.specifications)
                } catch (err) {
                    throw new Error(`Failed to read OpenAPI spec from "${opts.specifications}": ${err.message}`, { cause: err })
                }
            }

            if (opts.lang === 'zh-CN' && opts.strings === undefined) {
                throw new Error('Please provide the localization strings for Chinese docs')
            }

            if (opts.lang === 'zh-CN') {
                try {
                    strings = fs.readFileSync(opts.strings, 'utf-8').split('\n')
                } catch (err) {
                    throw new Error(`Failed to read localization strings from "${opts.strings}": ${err.message}`, { cause: err })
                }
            }

            const refGen = new RefGen({
                specifications,
                lang,
                target,
                target_path,
                strings,
            })

            fs.mkdirSync(target_path, { recursive: true })
            const folders = fs.readdirSync(target_path, { recursive: true }).filter(f => fs.statSync(target_path + '/' + f).isDirectory())
            for (let folder of folders.filter(f => !f.endsWith('v1') && !f.endsWith('v2'))) {
                fs.rmSync(target_path + '/' + folder, { recursive: true, force: true })
            }

            refGen.make_groups()
            refGen.write_refs()

            if (opts.upload_s3) {
                try {
                    await uploadLegacyPageSpecs(specifications, target, lang)
                } catch (err) {
                    throw new Error(`S3 upload failed: ${err.message}`, { cause: err })
                }
            }
        })
}

function registerGenerateIntegratedSpecCommand(command) {
    command
        .description('Generate localized integrated OpenAPI specs for latest or track publication')
        .option('-s, --specifications <specifications>', 'Path to a canonical fragment directory, snapshot file, or spec directory')
        .option('-p, --publication-policy <publicationPolicy>', 'Publication policy: latest or track')
        .option('-t, --target <target>', 'Publication target', 'zilliz')
        .option('--api-version <apiVersion>', 'API surface for latest publication: v1 or v2')
        .option('--release-track <releaseTrack>', 'Minor track for track publication: 2.6.x or 3.0.x')
        .option('-l, --lang <lang>', 'Language of the generated spec', 'en-US')
        .option('--integrated-spec-output <integratedSpecOutput>', 'Output directory for local artifacts')
        .option('--upload-s3', 'Upload the prepared artifacts to S3', false)
        .option('--enable-compatibility-aliases', 'Write legacy unqualified aliases from the same prepared bytes', false)
        .option('--generator-git-sha <generatorGitSha>', 'Generator Git SHA recorded in the manifest')
        .action(async (opts) => {
            if (!opts.specifications) {
                throw new Error('Please provide specifications')
            }
            if (!opts.publicationPolicy) {
                throw new Error('Please provide --publication-policy (latest or track)')
            }
            if (!opts.integratedSpecOutput) {
                throw new Error('Please provide --integrated-spec-output')
            }

            const uploader = opts.uploadS3 ? new S3Uploader({}) : null

            const result = await publishIntegratedSpecs({
                specifications: opts.specifications,
                publicationPolicy: opts.publicationPolicy,
                target: opts.target,
                language: opts.lang,
                apiSurface: opts.apiVersion,
                releaseTrack: opts.releaseTrack,
                outputDirectory: opts.integratedSpecOutput,
                uploader,
                enableCompatibilityAliases: opts.enableCompatibilityAliases,
                generatorGitSha: opts.generatorGitSha || null,
            })

            for (const artifact of result.localArtifacts) {
                console.log(`Wrote ${artifact.path}`)
            }
            for (const upload of result.uploads) {
                console.log(`Uploaded ${upload.filename} -> ${upload.url}`)
            }
        })
}

module.exports = function () {
    return {
        name: 'fetch-apifox-docs',
        extendCli(cli) {
            registerFetchCommand(cli.command('fetch-apifox-docs'))
            registerGenerateIntegratedSpecCommand(cli.command('generate-integrated-spec'))
        },
    }
}

if (require.main === module) {
    if (process.argv[2] === 'generate-integrated-spec') {
        const cli = new Command()
            .name('fetch-apifox-docs')
        registerGenerateIntegratedSpecCommand(cli.command('generate-integrated-spec'))
        cli.parseAsync(process.argv).catch(error => {
            console.error(error instanceof Error ? error.message : String(error))
            process.exitCode = 1
        })
    } else {
        program
            .name('fetch-apifox-docs')
        registerFetchCommand(program)
        program.parseAsync(process.argv).catch(error => {
            console.error(error instanceof Error ? error.message : String(error))
            process.exitCode = 1
        })
    }
}
