import { capitalize } from 'lodash';
import { i18n } from './i18n.js'
import { renderMarkdownHtml } from '../../markdown/renderMarkdownHtml.js'
import { normalizeDocsLinkLocale, rewriteHtmlHrefAttributes } from '../../links/rewriteDocLinks.ts'
// planeConfig is passed from callers that read it via useDocusaurusContext

export const getBaseUrl = (endpoint, lang, pubTarget, planeConfig) => {
    const condition = isControlPlane(endpoint, pubTarget, planeConfig)

    var server = "https://api.cloud.zilliz.com";
    var children = `export BASE_URL="${server}"`
    var prompt = isBeta(endpoint) ? i18n[lang]["admonition.control.plane.v2"] + i18n[lang]["admonition.beta.warning"] : i18n[lang]["admonition.control.plane.v2"]

    if (condition && endpoint.includes('v1')) {
        server = lang === "zh-CN" ? "https://controller.api.${CLOUD_REGION}.zilliz.com.cn" : "https://controller.api.${CLOUD_REGION}.zillizcloud.com"
        children = lang === "zh-CN" ? `export CLOUD_REGION="ali-cn-hangzhou"\nexport BASE_URL="${server}"` : `export CLOUD_REGION="gcp-us-west1"\nexport BASE_URL="${server}"`
        prompt = i18n[lang]["admonition.cloud.region"]
    }

    if (!condition) {
        server = "https://${CLUSTER_ENDPOINT}"
        children = `export CLUSTER_ENDPOINT=""`
        prompt = endpoint.includes('v2') ? i18n[lang]["admonition.cluster.endpoint.v2"] : i18n[lang]["admonition.cluster.endpoint.v1"]
    }

    if (pubTarget === 'milvus') {
        server = "http://localhost:19530"
        children = `export BASE_URL="${server}"`
    }

    return {
        server,
        children,
        prompt
    }
}

export const textFilter =  (text, targets, lang) => {
    const matches = text ? matchFilterTags(text) : []

    if (matches.length > 0) {
        var preText = text.slice(0, matches[0].startIndex)
        var matchText = text.slice(matches[0].startIndex, matches[0].endIndex)
        var postText = text.slice(matches[0].endIndex)
        var isTargetValid = targets.split('.').includes(matches[0].target.trim())
        var startTagLength = `<${matches[0].tag} target="${matches[0].target}">`.length
        var endTagLength = `</${matches[0].tag}>`.length

        if (matches[0].tag == 'include' && isTargetValid || matches[0].tag == 'exclude' && !isTargetValid) {
            matchText = matchText.slice(startTagLength, -endTagLength)
        }

        if (matches[0].tag == 'include' && !isTargetValid || matches[0].tag == 'exclude' &&  isTargetValid) {
            matchText = ""
        }

        text = textFilter(preText + matchText + postText, targets, lang)
    }

    text = renderMarkdownHtml(text);

    // Rendered descriptions carry absolute docs.zilliz.com(.cn)/milvus.io links
    // authored against the English site; keep readers in their own language.
    return rewriteHtmlHrefAttributes(sanitizeHtmlBlockParagraphs(text), normalizeDocsLinkLocale(lang));
}

export const getLocalizedDescription = (value, lang) => {
    return value?.["x-i18n"]?.[lang]?.description ?? value?.description ?? ''
}

// Fragments may cut an operation description in two with this marker (an HTML
// comment, so a runtime that predates the convention renders it invisibly).
// Everything before it stays in the intro slot above the method/endpoint
// header; everything after it renders in the collapsible panel directly below
// that header (above the Connection Endpoint section). Large reference tables
// use this so they do not push the endpoint details off the first screen —
// author the tail as a collapsible <details> block. The generator validates
// marker usage (refGen validateSpec); refGen.js carries its own copy of the
// constant because the tooling/runtime boundary forbids sharing this module.
export const AFTER_ENDPOINT_MARKER = '<!-- zdoc:after-endpoint -->'

export const splitAfterEndpoint = (description) => {
    const text = typeof description === 'string' ? description : ''
    const index = text.indexOf(AFTER_ENDPOINT_MARKER)
    if (index === -1) {
        return { intro: text, afterEndpoint: '' }
    }
    return {
        intro: text.slice(0, index),
        afterEndpoint: text.slice(index + AFTER_ENDPOINT_MARKER.length),
    }
}

export const sanitizeHtmlBlockParagraphs = (html = '') => {
    return String(html)
        .replace(/<p>([^<]*?)(\s*<(?:ul|ol|table|div|pre|blockquote)(?:\s|>))/gi, '<p>$1</p>$2')
        .replace(/(<\/(?:ul|ol|table|div|pre|blockquote)>\s*)([^<][\s\S]*?)<\/p>/gi, '$1<p>$2</p>')
        .replace(/<p>(\s*<(?:ul|ol|table|div|pre|blockquote)(?:\s|>))/gi, '$1')
        .replace(/(<\/(?:ul|ol|table|div|pre|blockquote)>\s*)<\/p>/gi, '$1')
}

const matchFilterTags = (text) => {
    const startTagRegex = /<(include|exclude) target="(.+?)"/gm
    const endTagRegex = /<\/(include|exclude)>/gm
    const matches = [... text.matchAll(startTagRegex)]
    var returns = []

    matches.forEach(match => {
        var tag = match[1]
        var rest = text.slice(match.index)
        
        var closeTagRegex = new RegExp(`</${tag}>`, 'gm')
        var closeTagMatch = [... rest.matchAll(closeTagRegex)]
        
        var startIndex = match.index
        var endIndex = 0
        
        for (let i = 0; i < closeTagMatch.length; i++) {
            var t = text.slice(startIndex, startIndex+closeTagMatch[i].index+closeTagMatch[i][0].length)
        
            var startCount = t.match(startTagRegex) ? t.match(startTagRegex).length : 0
            var endCount = t.match(endTagRegex) ? t.match(endTagRegex).length : 0
    
            if (startCount === endCount) {
                endIndex = startIndex + closeTagMatch[i].index + closeTagMatch[i][0].length
                break
            }
        }
        
        returns.push({
            tag: tag,
            target: match[2],
            startIndex: startIndex,
            endIndex: endIndex
        })           
    })

    return returns
}

let _tabIdCounter = 0;
export const getRandomString = () => {
    return `tid${++_tabIdCounter}`;
}

export const chooseParamExample = (param, lang, target) => {
    // Check x-i18n first (consistent with Primitive component)
    if (param["x-i18n"]?.[lang]?.example !== undefined) {
        param.example = param["x-i18n"][lang].example
        return param
    }

    if (param.examples) {
        const validkey = Object.keys(param.examples).filter(key => {
            const ex = param.examples[key]
            const langMatch = !ex?.["x-target-lang"] || ex["x-target-lang"] === lang
            const targetMatch = !ex?.["x-include-target"] || ex["x-include-target"].includes(target)
            return langMatch && targetMatch
        })[0]

        if (validkey) {
            param.example = param.examples[validkey].value
        }
    }

    return param
}

export const filterSchemaOptions = (arr, lang, target) => {
    return arr
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ item }) => {
            const langMatch = !item?.["x-target-lang"] || item["x-target-lang"] === lang
            const targetMatch = !item?.["x-include-target"] || item["x-include-target"].includes(target)
            return langMatch && targetMatch
        })
}

const isObjectSchema = (schema) => schema.type === 'object' || (schema.type === undefined && Boolean(schema.properties))

// allOf is a conjunction, not a choice, so it renders as the one schema it
// denotes instead of a tab strip. OpenAPI 3.0 ignores siblings of $ref, so a
// fragment documents a referenced schema by wrapping it in a single-element
// allOf beside its own description; the generator inlines the $ref, leaving
// allOf: [<schema>]. Object parts merge their properties and required lists
// (a required list on the wrapper constrains the merged object too); a lone
// non-object part is unwrapped. The wrapper's own description and metadata
// document the usage site, so they win over the parts'. Any other mix has no
// single meaning and is returned untouched.
export const mergeAllOf = (schema) => {
    if (!schema || typeof schema !== 'object' || !Array.isArray(schema.allOf)) {
        return schema
    }

    const { allOf, ...wrapper } = schema
    const parts = allOf.map(mergeAllOf).filter(part => part && typeof part === 'object')
    if (parts.length === 0) {
        return schema
    }

    if (parts.every(isObjectSchema)) {
        const required = [...new Set([...parts, wrapper].flatMap(part => Array.isArray(part.required) ? part.required : []))]
        const merged = {
            ...parts[0],
            ...wrapper,
            type: 'object',
            properties: Object.assign({}, ...[...parts, wrapper].map(part => part.properties || {})),
        }
        if (required.length > 0) {
            merged.required = required
        } else {
            delete merged.required
        }
        return merged
    }

    return parts.length === 1 ? { ...parts[0], ...wrapper } : schema
}

export const getExampleLabel = (example, key) => {
    return example?.summary || example?.["x-tab-label"] || `OPTION ${key}`
}

const HTTP_STATUS_LABELS = {
    '200': 'OK',
    '201': 'Created',
    '202': 'Accepted',
    '204': 'No Content',
}

export const getResponseEntries = (responses = {}) => {
    if (!responses || typeof responses !== 'object' || Array.isArray(responses)) return []

    return Object.entries(responses)
        .filter(([status, response]) => (/^[1-5]\d\d$/.test(status) || status === 'default') && response && typeof response === 'object')
        .map(([status, response]) => ({
            status,
            label: HTTP_STATUS_LABELS[status] || '',
            response,
        }))
        .sort((left, right) => {
            if (left.status === 'default') return 1
            if (right.status === 'default') return -1
            return Number(left.status) - Number(right.status)
        })
}

export const getDefaultResponseStatus = (responses = {}) => {
    const entries = getResponseEntries(responses)
    return entries.find(({status}) => /^2\d\d$/.test(status))?.status || entries[0]?.status || ''
}

export const isControlPlane = (endpoint, target = 'zilliz', planeConfig) => {
    const normalizedEndpoint = endpoint.toLowerCase()
    const dataKeywords = planeConfig?.dataPlaneKeywords?.[target] || planeConfig?.dataPlaneKeywords?.zilliz || []
    if (dataKeywords.some(k => normalizedEndpoint.includes(k.toLowerCase()))) {
        return false
    }

    const controlKeywords = planeConfig?.controlPlaneKeywords?.[target] || planeConfig?.controlPlaneKeywords?.zilliz || []
    return controlKeywords.some(k => normalizedEndpoint.includes(k.toLowerCase()))
}

export const getTokenPlaceholder = (endpoint, target = 'zilliz', planeConfig, selectedBaseUrl) => {
    return isControlPlane(endpoint, target, planeConfig) || selectedBaseUrl?.key === 'on-demand-compute'
        ? 'YOUR_API_KEY'
        : 'db_admin:xxxxxxxxxxxxx'
}

export const isBeta = (endpoint) => {
    return endpoint.includes('etl') ||
        endpoint.includes('stage') ||
        endpoint.includes('usage') ||
        endpoint.includes('invoice')

}

// An example value renders as a bare React child, so only scalars are
// renderable: upstream specs occasionally ship `example: {}` (an empty
// object) on date/timestamp fields, and rendering it crashes static site
// generation with "Objects are not valid as a React child". Objects and
// arrays are skipped wholesale; every other value keeps the exact truthy
// behavior the render guards always had (0 renders, '' does not, false does
// not — unchanged).
export const isRenderableExample = (value) => {
    if (value === 0) return true
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'object') return false
    return Boolean(value)
}
