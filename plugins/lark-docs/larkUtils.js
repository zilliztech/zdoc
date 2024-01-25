const fs = require('node:fs')
const path = require('node:path')

class larkUtils {
    constructor(rootToken, docSourceDir, outputDir) {
        this.docSourceDir = docSourceDir
        this.rootToken = rootToken
        this.outputDir = outputDir
        this.file_path = ''
    }

    determine_file_path(token) {
        const path = fs.readdirSync(this.outputDir, {recursive: true}).filter(file => file.endsWith('.md')).filter(file => {
            const regex = new RegExp(/token: (.*)/g)
            const content = fs.readFileSync(`${this.outputDir}/${file}`, {encoding: 'utf-8', flag: 'r'})
            const file_token = regex.exec(content)[1]

            return file_token === token
        })

        if (path.length > 0) {
            return path[0]
        } else {
            throw new Error(`Cannot find file for token ${token} in ${this.outputDir}`)
        }
    }

    pre_process_file_paths() {
        const paths = fs.readdirSync(this.outputDir, {recursive: true})
        const folders = paths.filter(path => fs.statSync(`${this.outputDir}/${path}`).isDirectory())   

        for (const folder of folders) {
            fs.rmSync(`${this.outputDir}/${folder}`, {recursive: true, force: true})
        }
    }

    post_process_file_paths() {
        const paths = fs.readdirSync(this.outputDir, {recursive: true})
        const folders = paths.filter(path => fs.statSync(`${this.outputDir}/${path}`).isDirectory())

        for (const folder of folders) {
            const files = fs.readdirSync(`${this.outputDir}/${folder}`)

            if (files.length === 1 && files[0] === folder.split('/').slice(-1)[0] + '.md') {
                fs.rmSync(`${this.outputDir}/${folder}`, {recursive: true, force: true})
            }   
        }
    }

    __fetch_doc_source (type, value) {
        const file = fs.readdirSync(this.docSourceDir).filter(file => {
            const page = JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file}`, {encoding: 'utf-8', flag: 'r'}))
            return page[type] === value
        })

        if (file.length > 0) {
            return JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file[0]}`, {encoding: 'utf-8', flag: 'r'}))
        } else {
            throw new Error(`Cannot find ${title} in ${this.docSourceDir}`)
        }
    }

    __iterate_path(parent_token) {
        if (parent_token != this.rootToken) {
            const source = this.__fetch_doc_source('node_token', parent_token)
            this.file_path = source.slug + '/' + this.file_path
            this.__iterate_path(source.parent_node_token)
        }
    }
}

module.exports = larkUtils;
