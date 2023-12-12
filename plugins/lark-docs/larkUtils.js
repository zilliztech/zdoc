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
        const source = this.__fetch_doc_source('node_token', token)
        this.__iterate_path(source.parent_node_token)

        return this.file_path
    }

    post_process_file_paths() {
        const paths = fs.readdirSync(this.outputDir, {recursive: true})
        const folders = paths.filter(path => fs.statSync(`${this.outputDir}/${path}`).isDirectory())

        for (const folder of folders) {
            const files = fs.readdirSync(`${this.outputDir}/${folder}`)

            if (files.length === 1 && files[0] === folder.split('/').slice(-1)[0] + '.md') {
                fs.rmdirSync(`${this.outputDir}/${folder}`)
            }   

            if (files.length > 1) {
                const index_file = `${this.outputDir}/${folder}/${folder.split('/').slice(-1)[0]}.md`
                const original = fs.readFileSync(index_file, {encoding: 'utf-8', flag: 'r'})
                const new_lines = "import DocCardList from '@theme/DocCardList';\n\n<DocCardList />"
                fs.writeFileSync(index_file, original + '\n\n' + new_lines, {encoding: 'utf-8', flag: 'w'})
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