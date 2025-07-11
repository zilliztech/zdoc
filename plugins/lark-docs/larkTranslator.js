const fetch = require('node-fetch')
const Bottleneck = require('bottleneck')
const sentencize = require('@stdlib/nlp-sentencize')
const tokenFetcher = require('./larkTokenFetcher.js')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST
const MAX_RETRY_WAIT_SECONDS = 0
const MAX_RETRIES = 0

class larkTranslator {
    constructor({source, target, cache}) {
        this.source = source
        this.target = target
        this.cache = cache || []
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 100
        })
        this.token_fetcher = new tokenFetcher()
        this.exceed_rate_limit_counts = 0
    }

    async translate(text, glossary = []) {
        if (!this.token) {
            await this.token_fetcher.fetchToken()
        }

        this.token = await this.token_fetcher.token()

        const throttledTranslator = this.limiter.wrap(this.__translateText.bind(this))

        if (text.length > 1000) {
            const sentences = sentencize(text);
            const promises = sentences.map(sentence => throttledTranslator(sentence, glossary));
            const results = await Promise.all(promises);
            return results.join(' ');
        }

        return throttledTranslator(text, glossary)
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

            if (data.code === 2200) {
                // Exponential backoff with jitter to handle rate limiting
                const waitTime = Math.min(
                    Math.pow(2, this.exceed_rate_limit_counts) + Math.random(),
                    MAX_RETRY_WAIT_SECONDS || 30
                );
                
                console.warn(`Lark translation rate limit exceeded, retry #${this.exceed_rate_limit_counts + 1}, waiting ${waitTime.toFixed(2)} seconds...`);
                
                await this.__wait(waitTime * 1000);
                this.exceed_rate_limit_counts += 1;
                
                if (this.exceed_rate_limit_counts > (MAX_RETRIES || 5)) {
                    throw new Error(`Max retry attempts (${MAX_RETRIES || 5}) exceeded for rate limited request`);
                }
                
                return this.__translateText(source, glossary);
            }


            if (data.code !== 0) {
                throw new Error(`Lark translation error: ${data.code} - ${data.msg}`)
            }

            target = data.data.text
        }

        this.cache.push({
            source,
            target
        })

        return target
    }

    async __wait(n) {
        return new Promise(resolve => setTimeout(resolve, n * 1000))
    }
}

module.exports = larkTranslator
