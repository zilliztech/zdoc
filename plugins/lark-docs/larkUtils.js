const fs = require('node:fs')
const path = require('node:path')

class larkUtils {
    constructor() {
        this.file_path = ''
        this.key_paths = []
    }

    determine_file_path(token, outputDir) {
        const path = fs.readdirSync(outputDir, {recursive: true}).filter(file => file.endsWith('.md')).filter(file => {
            const regex = new RegExp(/token: (.*)/g)
            const content = fs.readFileSync(`${outputDir}/${file}`, {encoding: 'utf-8', flag: 'r'})
            const match = regex.exec(content)

            if (match) {
                return match[1].trim() === token
            } else {
                return false
            }
        })

        if (path.length > 0) {
            return path[0]
        } else {
            throw new Error(`Cannot find file for token ${token} in ${outputDir}`)
        }
    }

    pre_process_file_paths(outputDir) {
        const paths = fs.readdirSync(outputDir, {recursive: true})
        const folders = paths.filter(path => fs.statSync(`${outputDir}/${path}`).isDirectory())   

        for (const folder of folders) {
            fs.rmSync(`${outputDir}/${folder}`, {recursive: true, force: true})
        }
    }

    post_process_file_paths(outputDir) {
        const paths = fs.readdirSync(outputDir, {recursive: true})
        const folders = paths.filter(path => fs.statSync(`${outputDir}/${path}`).isDirectory())

        for (const folder of folders) {
            const files = fs.readdirSync(`${outputDir}/${folder}`)

            if (files.length === 1 && files[0] === folder.split('/').slice(-1)[0] + '.md') {
                fs.rmSync(`${outputDir}/${folder}`, {recursive: true, force: true})
            }   
        }
    }

    list_valid_targets(targets, root='') {
        if (targets instanceof Object) {
            for (const key of Object.keys(targets)) {
                if (targets[key] instanceof Object && !targets[key].hasOwnProperty('outputDir')) {
                    this.list_valid_targets(targets[key], `${root}.${key}`)
                } else {
                    this.key_paths.push(`${root}.${key}`.slice(1))
                }
            }
        }

        return this.key_paths
    }

    locate_drive_source_pair(source_dir, token, slug) {
        var files = fs.readdirSync(source_dir)
        files = files.map(file => {
            return JSON.parse(fs.readFileSync(`${source_dir}/${file}`, {encoding: 'utf-8', flag: 'r'}))
        }).filter(source => source.slug === slug)

        if (files.length > 1 && files.map(file=> file.token).includes(token)) {
            return files.filter(files => files.token !== token)[0].token
        } else {
            return null
        }
    }

    postprocess_for_milvus(outputDir, docSourceDir) {
        const paths = fs.readdirSync(outputDir, {recursive: true})
        const files = paths.filter(path => path.endsWith('.md'))

        for (const file of files) {
            var content = fs.readFileSync(`${outputDir}/${file}`, {encoding: 'utf-8', flag: 'r'})

            // Change frontmatters
            if (outputDir.includes('reference')) {
                for (const path of paths) {
                    if (path.endsWith('.md')) {
                        var page = fs.readFileSync(`${outputDir}/${path}`, {encoding: 'utf-8', flag: 'r'})
                        page = page.replace(/^---(.*\n)*---$/gm, '').replace(/^\n{2,}/g, '')
                        fs.writeFileSync(`${outputDir}/${path}`, page, {encoding: 'utf-8', flag: 'w'})
                    }
                }
            }
            
            // remove docusaurus imports
            content = content.replace(/import .* from .*/g, '')

            // remove title slugs
            content = content.replace(/\{#.*\}$/g, '')

            // add multi-code block
            var matches = [... (content.matchAll(/([^\n\r]*)<Tabs .*values=(\{(\[.*\])\}).*>/g))]
            matches.forEach(match => {
                var codes = JSON.parse(match[3])
                var indent = match[1]
                var milvus_multi_code = `${indent}<div class="multipleCode">\n`
                for (const code of codes) {
                    milvus_multi_code += `${indent}    <a href="#${code.value}">${code.label}</a>\n`
                }
                milvus_multi_code += `${indent}</div>\n\n`
                content = content.replace(match[0].replace(/\n/g, ''), `${milvus_multi_code}`)
            })

            // remove tabs and tab items
            content = content.replace(/([^\n\r]*)<\/*(TabItem|Tabs).*>/g, '')

            // add admonitions
            matches = [... content.matchAll(/([^\n\r]*)<Admonition .* title="(.*)">/g)]
            matches.forEach(match => {
                var indent = match[1]
                var admonition_label = match[2].toLowerCase()
                var type = admonition_label === 'Notes' ? 'note' : admonition_label === 'Warning' ? 'warning' : 'note'
                var start = `${indent}<div class="admonition ${type}">`

                if (!['Notes', 'Warning'].includes(admonition_label)) {
                    start += `\n\n${indent}<p><b>${admonition_label}</b></p>\n\n`
                }

                content = content.replace(match[0], start)
            })

            content = content.replace(/([^\n\r]*)<\/Admonition>/g, (_, b) => {
                return `${b}</div>`
            })

            // TODO: change image path to relative path

            // remove abundant line breaks
            content = content.replace(/\n{3,}/g, '\n\n')

            fs.writeFileSync(`${outputDir}/${file}`, content, {encoding: 'utf-8', flag: 'w'})
        }

        // rename folders
        if (outputDir.includes('reference')) {
            this.__rename_file_path(outputDir)
        }
    }

    __rename_file_path(outputDir) {
        const paths = fs.readdirSync(outputDir, {recursive: true})
        const mods = paths.filter(path => path.includes('-'))

        if (mods.length > 0) {
            const o = mods[0]
            const n = o.split('/').map(part => part.includes('-') ? part.split('-')[1] : part).join('/');
            fs.renameSync(`${outputDir}/${o}`, `${outputDir}/${n}`, {recursive: true})
            this.__rename_file_path(outputDir)
        }
    }

    __fetch_doc_source (type, value, docSourceDir) {
        const file = fs.readdirSync(docSourceDir).filter(file => {
            const page = JSON.parse(fs.readFileSync(`${docSourceDir}/${file}`, {encoding: 'utf-8', flag: 'r'}))
            return page[type] === value
        })

        if (file.length > 0) {
            return JSON.parse(fs.readFileSync(`${docSourceDir}/${file[0]}`, {encoding: 'utf-8', flag: 'r'}))
        } else {
            throw new Error(`Cannot find ${title} in ${docSourceDir}`)
        }
    }

    __iterate_path(parentToken, rootToken, docSourceDir) {
        if (parentToken != rootToken) {
            const source = this.__fetch_doc_source('node_token', parentToken, docSourceDir)
            this.file_path = source.slug + '/' + this.file_path
            this.__iterate_path(source.parent_node_token)
        }
    }
}

module.exports = larkUtils;
