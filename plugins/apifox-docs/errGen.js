const fs = require('node:fs')


class errGen {
    constructor() {
        this.errors = this.__prepare_errorcode()
        this.groups = this.__prepare_grouping()
    }

    get_errorcode_desc(error_code) {
        return this.errors[error_code]
    }

    __prepare_errorcode() {
        const errors = {}
        fs.readFileSync('plugins/apifox-docs/errors/errcode.csv', 'utf-8').split('\n').slice(1).forEach(x => errors[this.__trim(x.split(',')[0])] = this.__trim(x.split(',')[1]))
        return errors
    }

    __prepare_grouping() {
        const groups = {}
        fs.readFileSync('plugins/apifox-docs/errors/grouping.csv', 'utf-8').split('\n').slice(1).forEach(x => {
            const [tag, code] = x.split(',')
            if (Object.keys(groups).indexOf(this.__trim(tag)) == -1) {
                groups[this.__trim(tag)] = []
            }
            groups[this.__trim(tag)].push(this.__trim(code))
        })

        return groups
    }

    __trim(value) {
        if (value) {
            return value.trim()
        } else {
            return ''
        }
    }

}

module.exports = errGen