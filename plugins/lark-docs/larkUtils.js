const fs = require('node:fs')

class larkUtils {
    constructor(rootToken, docSourceDir) {
        this.docSourceDir = docSourceDir
        this.rootToken = rootToken
        this.file_path = ''
    }

    determine_file_path(token) {
        const source = this.__fetch_doc_source('node_token', token)
        this.__iterate_path(source.parent_node_token)

        return this.file_path
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