const fetch = require('node-fetch')
const Bottleneck = require('bottleneck')
const tokenFetcher = require('./larkTokenFetcher.js')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST

class larkTranslator {
    constructor({source, target, cache}) {
        this.source = source
        this.target = target
        this.cache = cache || []
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 100
        })
    }

    async translate(text) {
        if (!this.token) {
            const fetcher = new tokenFetcher()
            await fetcher.fetchToken()
            this.token = await fetcher.token()
        }

        const throttledTranslator = this.limiter.wrap(this.__translateText.bind(this))
        return throttledTranslator(text)
    }

    async __translateText(source, glossary = []) {
        var target = ''

        if (this.cache.some(item => item.source === source)) {
            target = this.cache.find(item => item.source === source).target
        } else {
            const url = `${FEISHU_HOST}/open-apis/translation/v1/text/translate`

            const headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this.token}`
            }

            const body = {
                source_language: this.source,
                target_language: this.target,
                text: source,
                glossary: glossary
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (data.code !== 0) {
                throw new Error(`Lark translation error: ${data.msg}`)
            }

            target = data.data.text
        }

        this.cache.push({
            source,
            target
        })

        return target
    }
}

module.exports = larkTranslator
