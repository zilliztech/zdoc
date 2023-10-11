const Translator = require('../lark-docs/baiduTranslator')

class restI18n {
    constructor() {
        this.t = new Translator('en', 'zh')
        this.result = []
    }

    async localize(specifications, strings) {
        await this.__iterate_object(specifications["paths"], '["paths"]', strings)

        return strings.concat(this.result).join('\n')
    }

    async __iterate_object(d, path, strings) {
        for (const key of Object.keys(d)) {
            if (key.startsWith('x-')) {
                continue
            }

            if (typeof(d[key]) == 'object' && !Array.isArray(d)) {
                await this.__iterate_object(d[key], `${path}["${key}"]`, strings)
            } else if (Array.isArray(d)) {
                await this.__iterate_object(d[key], `${path}[${key}]`, strings)
            } else if (!this.__is_translated(`${path}["${key}"]`, strings)) {
                if (['summary', 'description'].indexOf(key) > -1) {
                    const dst = await this.t.translate(d[key])
                    this.result.push(`${path}["${key}"]="${dst}"`)
                }
            }
        }
    }

    __is_translated(path, strings) {
        return strings.map(x => x.split('=')[0]).indexOf(path) > -1
    }
}

module.exports = restI18n