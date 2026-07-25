import type {GeneratedDocument, PublicationAdapter} from '../types.ts';

export const ZH_CN_REST_REPLACEMENTS_ID = 'zh-CN.rest-replacements';

const CLUSTER_ENDPOINT = 'https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530';
const PROJECT_ENDPOINT = 'https://{project-id}.{region}.api.cloud.zilliz.com.cn';
const GLOBAL_ENDPOINT = 'https://glo-xxxx.global-cluster.vectordb.zilliz.com.cn';
const PRIVATE_ENDPOINT = 'https://{cluster-id}-privatelink.{region}.vectordb.zilliz.com.cn';

function normalizeRestExamples(contents: string): string {
  return contents
    .replace(/<[^>]+>http<\/[^>]+>s:\/\//giu, 'https://')
    .replace(/(?:https?:\/\/)?YOUR_CLUSTER_(?:PUBLIC_)?ENDPOINT/gu, CLUSTER_ENDPOINT)
    .replace(/(?:https?:\/\/)?YOUR_ZILLIZ_CLOUD_ENDPOINT/gu, PROJECT_ENDPOINT)
    .replace(/(?:https?:\/\/)?YOUR_PROJECT_ENDPOINT/gu, PROJECT_ENDPOINT)
    .replace(/(?:https?:\/\/)?YOUR_GLOBAL_ENDPOINT/gu, GLOBAL_ENDPOINT)
    .replace(/(?:https?:\/\/)?YOUR_PRIVATE_ENDPOINT/gu, PRIVATE_ENDPOINT)
    .replace(/https?:\/\/api\.cloud\.zilliz\.com(?:\.cn)?/giu, 'https://api.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.([\w{}-]+)\.api\.zillizcloud\.com(?:\.cn)?/giu, 'https://$1.$2.api.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.([\w{}-]+)\.api\.zilliz\.com\.cn/giu, 'https://$1.$2.api.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.([\w{}-]+)\.api\.cloud\.zilliz\.com(?!\.cn)/giu, 'https://$1.$2.api.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.serverless\.([\w{}-]+)\.vectordb\.zillizcloud\.com(?:\.cn)?/giu, 'https://$1.serverless.$2.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.serverless\.([\w{}-]+)\.vectordb\.zilliz\.com\.cn(?:\.cn)?/giu, 'https://$1.serverless.$2.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.serverless\.([\w{}-]+)\.cloud\.zilliz\.com(?!\.cn)/giu, 'https://$1.serverless.$2.cloud.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.api\.([\w{}-]+)\.zillizcloud\.com(?:\.cn)?/giu, 'https://$1.$2.vectordb.zilliz.com.cn')
    .replace(/https?:\/\/([\w{}-]+)\.([\w{}-]+)\.vectordb\.zillizcloud\.com(?:\.cn)?/giu, 'https://$1.$2.vectordb.zilliz.com.cn')
    .replace(/vectordb\.zilliz\.com\.cn\.cn/giu, 'vectordb.zilliz.com.cn')
    .replace(/(^|[\n|]\s*(?:cloudId|cloud_id)\s*(?::|=|\|)\s*["']?)(?:aws|gcp|azure)(?=["']?\s*(?:\||,|$))/gimu, '$1ali')
    .replace(/(^|[\n|]\s*(?:regionId|region_id)\s*(?::|=|\|)\s*["']?)(?:aws-us-east-1|aws-us-west-2|gcp-us-west1|az-eastus|az-westus3)(?=["']?\s*(?:\||,|$))/gimu, '$1ali-cn-hangzhou')
    .replace(/(STORAGE_PATH\s*=\s*["'])s3:\/\/your\/data\/path\/in\/external\/storage(?:\/)?(["'])/giu, '$1oss://{bucket_name}/your/data/in/storage/$2')
    .replace(/(^|\n\|\s*object_url\s*\|\s*)(?::\/\/|s3:\/\/)?your\/data\/path\/in\/external\/storage\.json(\s*\|)/gimu, '$1oss://{bucket_name}/you/data/in/storage.json$2')
    .replace(/((?:object_url|objectUrl)["']?\s*(?::|=)\s*["'])(?::\/\/|s3:\/\/)?your\/data\/path\/in\/external\/storage\.json(["'])/giu, '$1oss://{bucket_name}/you/data/in/storage.json$2');
}

export const zhCnRestReplacements: PublicationAdapter = Object.freeze({
  id: ZH_CN_REST_REPLACEMENTS_ID,
  transformDocument(document, context): GeneratedDocument {
    if (context.site !== 'zh-CN' || context.manual !== 'rest') return document;
    return {...document, contents: normalizeRestExamples(document.contents)};
  },
  async validatePublication() {},
});
