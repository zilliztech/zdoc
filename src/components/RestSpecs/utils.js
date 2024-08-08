import { i18n } from './i18n'
import Showdown from 'showdown';

export const getBaseUrl = (endpoint, lang, pubTarget) => {
    const condition = (endpoint.includes('cloud') || endpoint.includes('cluster') || endpoint.includes('import') || endpoint.includes('pipeline')) || endpoint.includes('project') || endpoint.includes('metrics');
    
    var server = "https://api.cloud.zilliz.com";
    var children = `export BASE_URL="${server}"`
    var prompt = ''

    if (condition && endpoint.includes('v1')) {
        server = lang === "zh-CN" ? "https://controller.${CLOUD_REGION}.vectordb.zilliz.com.cn" : "https://controller.${CLOUD_REGION}.vectordb.zillizcloud.com"
        children = lang === "zh-CN" ? `export CLOUD_REGION="ali-cn-hangzhou"\nexport BASE_URL="${server}"` : `export CLOUD_REGION="gcp-us-west1"\nexport BASE_URL="${server}"`
        prompt = i18n[lang]["admonition.cloud.region"]
    }

    if (!condition && endpoint.includes('v2')) {
        server = lang === "zh-CN" ? "https://${CLUSTER_ID}.${CLOUD_REGION}.vectordb.zilliz.com.cn:19530" : "https://${CLUSTER_ID}.${CLOUD_REGION}.vectordb.zillizcloud.com:19530"
        children = lang === "zh-CN" ? `export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"\nexport CLOUD_REGION="ali-cn-hangzhou"\nexport BASE_URL="${server}"` : `export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"\nexport CLOUD_REGION="gcp-us-west1"\nexport BASE_URL="${server}"`
        prompt = i18n[lang]["admonition.region.and.id"]
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

export const textFilter =  (text, targets) => {
    const matches = matchFilterTags(text)

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

        text = textFilter(preText + matchText + postText, targets)
    }

    const converter = new Showdown.Converter();
    text = converter.makeHtml(text);

    return text
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