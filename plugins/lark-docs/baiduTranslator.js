const fetch = require('node-fetch')
const process = require('node:process')
const crypto = require('node:crypto')
const path = require('node:path')
const fs = require('node:fs')
const querystring = require('node:querystring')
const Bottleneck = require('bottleneck')
require('dotenv').config()

const BAIDU_APP_ID = process.env.BAIDU_TRANS_APP_ID
const BAIDU_SECRET = process.env.BAIDU_TRANS_SECRET

class baiduTranslator {

    constructor (source, target, cache) {
        this.salt = crypto.createHash('sha512').update(Math.random().toString()).digest('hex')
        this.appId = BAIDU_APP_ID
        this.secretKey = BAIDU_SECRET
        this.source = source
        this.target = target
        this.cache = cache
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 33
        })
    }

    __signature() {
        let raw = this.appId + this.query + this.salt + this.secretKey
        return crypto.createHash('md5').update(raw).digest('hex')
    }

    __quickPeek() {
        if (!this.cache) {
            return 
        }

        let cacheFile = path.join(this.cache, 'plugins/lark-docs/meta/translated.json')
        let cache = {}
        try {
            cache = JSON.parse(fs.readFileSync(cacheFile))
        } catch (e) {
            console.log(e)
        }

        if (cache[this.query]) {
            return cache[this.query]
        }
        return null
    }

    __saveCache(src, dst) {
        if (!this.cache) {
            return
        }
        
        let cacheFile = path.join(this.cache, 'plugins/lark-docs/meta/translated.json')
        let cache = {}
        try {
            cache = JSON.parse(fs.readFileSync(cacheFile))
        } catch (e) {
            console.log(e)
        }
        cache[src] = dst
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 4))
    }

    async translate(query) {
        this.query = query
        let res = this.__quickPeek()

        if (res) {
            return res
        }

        this.sign = this.__signature()
        let qstr = querystring.encode({
            'q': this.query,
            'from': this.source,
            'to': this.target,
            'appid': this.appId,
            'salt': this.salt,
            'sign': this.sign
        })

        let url = 'http://api.fanyi.baidu.com/api/trans/vip/translate?' + qstr

        const throttled_get = this.limiter.wrap(fetch)

        res = await throttled_get(url)

        res = await res.json()

        if (res.error_code) {
            console.log(res.error_msg)
            return
        } else {
            this.__saveCache(res.trans_result[0].src, res.trans_result[0].dst)          
            return res.trans_result[0].dst
        }
    }
}

module.exports = baiduTranslator