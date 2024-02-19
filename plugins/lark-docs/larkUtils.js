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
