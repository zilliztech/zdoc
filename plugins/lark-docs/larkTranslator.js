const Bottleneck = require('bottleneck')
const larkTokenFetcher = require('./larkTokenFetcher.js')
const { fetchFeishuJsonWithRetry } = require('./feishuFetch.js')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST

/**
 * @deprecated This translation helper is not used by the lark-docs fetch/write flow.
 * Keep it only for legacy callers until it can be removed cleanly.
 */
class larkTranslator {
    constructor(source, target, cache) {
        this.source = source
        this.target = target
        this.cache = cache
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 33
        })
        this.tokenFetcher = new larkTokenFetcher()
    }

    async translate(text) {
        if (!this.token) {
            const fetcher = new larkTokenFetcher()
            await fetcher.fetchToken()
            this.token = await fetcher.token()
        }

        const throttledTranslator = this.limiter.wrap(this.__translateText.bind(this))
        return throttledTranslator(text)
    }

    async __translateText(text) {
        const url = `${FEISHU_HOST}/open-apis/translation/v1/text/translate`

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${this.token}`
        }

        const body = {
            source_language: this.source,
            target_language: this.target,
            text: text
        }

        const data = await fetchFeishuJsonWithRetry(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        }, 'translate text')

        if (data.code !== 0) {
            throw new Error(`Lark translation error: ${data.msg}`)
        }

        return data.data.text
    }
}

export default larkTranslator
