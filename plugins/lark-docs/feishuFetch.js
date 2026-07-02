const fetch = require('node-fetch')

const FEISHU_RETRY_ATTEMPTS = parseInt(process.env.FEISHU_RETRY_ATTEMPTS || '5', 10)
const FEISHU_RETRY_DELAY_MS = parseInt(process.env.FEISHU_RETRY_DELAY_MS || '1000', 10)

function shortError(err) {
    return err?.stack || err?.message || String(err)
}

function isRetryableFetchError(err) {
    return [
        'ECONNRESET',
        'ETIMEDOUT',
        'ERR_STREAM_PREMATURE_CLOSE',
        'ERR_INVALID_CHAR',
    ].includes(err?.code) || ['system', 'request-timeout', 'body-timeout'].includes(err?.type)
}

function shouldRetryJsonResponse(res, json) {
    return res.status === 429 || res.status >= 500 || json?.code === 99991400 || json?.status === 429
}

function retryAfterMs(res, attempt) {
    const reset = res?.headers?.get?.('x-ogw-ratelimit-reset')
    const retryAfter = res?.headers?.get?.('retry-after')
    const parsed = Number(reset || retryAfter)

    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed * 1000
    }

    return FEISHU_RETRY_DELAY_MS * attempt
}

async function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    })
}

function requestOptions(options={}) {
    return {
        compress: false,
        ...options,
        headers: {
            // Avoid node-fetch Gunzip failures from truncated compressed responses.
            'Accept-Encoding': 'identity',
            ...options.headers,
        },
    }
}

function responsePreview(body) {
    if (typeof body === 'string') {
        return body ? `: ${body.slice(0, 300)}` : ''
    }

    if (body && typeof body === 'object') {
        const details = []
        if (body.code !== undefined) details.push(`code=${body.code}`)
        if (body.status !== undefined) details.push(`status=${body.status}`)
        if (body.msg !== undefined) details.push(`msg=${body.msg}`)
        if (body.message !== undefined && body.message !== body.msg) details.push(`message=${body.message}`)
        if (details.length > 0) return `: ${details.join(' ')}`
        return `: ${JSON.stringify(body).slice(0, 300)}`
    }

    return ''
}

async function retryFetchBody(url, options, label, readBody, shouldRetryResult=() => false) {
    let lastError

    for (let attempt = 1; attempt <= FEISHU_RETRY_ATTEMPTS; attempt++) {
        try {
            const res = await fetch(url, requestOptions(options))
            const body = await readBody(res)
            if (res.status === 429 || res.status >= 500 || shouldRetryResult(res, body)) {
                const err = new Error(`retryable response ${res.status}${responsePreview(body)}`)
                err.retryDelayMs = retryAfterMs(res, attempt)
                throw err
            }

            return body
        } catch (err) {
            lastError = err
            const retryable = err.retryDelayMs || isRetryableFetchError(err)

            if (!retryable || attempt === FEISHU_RETRY_ATTEMPTS) {
                break
            }

            const delay = err.retryDelayMs || (FEISHU_RETRY_DELAY_MS * attempt)
            process.stderr.write(
                `[fetch-lark-docs] ${label} failed on attempt ${attempt}/${FEISHU_RETRY_ATTEMPTS}: ${shortError(err)}\n`
            )
            await wait(delay)
        }
    }

    throw lastError
}

async function fetchTextWithRetry(url, options={}, label=url) {
    return await retryFetchBody(url, options, label, async (res) => await res.text())
}

async function fetchJsonWithRetry(url, options={}, label=url, shouldRetryJson=shouldRetryJsonResponse) {
    return await retryFetchBody(url, options, label, async (res) => {
        const text = await res.text()
        if (!text) return {}

        try {
            return JSON.parse(text)
        } catch (parseError) {
            if (!shouldRetryJsonResponse(res, null)) {
                throw parseError
            }
            return {}
        }
    }, shouldRetryJson)
}

async function fetchBufferWithRetry(url, options={}, label=url) {
    return await retryFetchBody(url, options, label, async (res) => await res.buffer())
}

async function fetchFeishuJsonWithRetry(url, options={}, label=url) {
    return await fetchJsonWithRetry(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...options.headers,
        },
    }, label, shouldRetryJsonResponse)
}

async function fetchFeishuBufferWithRetry(url, options={}, label=url) {
    return await fetchBufferWithRetry(url, options, label)
}

module.exports = {
    fetchBufferWithRetry,
    fetchFeishuBufferWithRetry,
    fetchFeishuJsonWithRetry,
    fetchJsonWithRetry,
    fetchTextWithRetry,
    isRetryableFetchError,
}
