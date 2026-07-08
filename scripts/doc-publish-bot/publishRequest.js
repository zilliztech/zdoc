const DEFAULT_JENKINS_BASE_URL = 'https://jenkins-3.zilliz.cc/job/zilliz-docs'

const CURRENT_SDK_MANUALS = new Set([
  'pymilvus30',
  'javaV230',
  'nodejs30',
  'gov230',
  'cliv14',
])

function unique(items) {
  return [...new Set(items)]
}

function decodeLoose(text) {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

function extractDocTokens(text) {
  return extractDocRefs(text).map(ref => ref.token)
}

function extractDocRefs(text) {
  const decoded = decodeLoose(String(text || ''))
  const refs = []
  const pattern = /((?:https?:\/\/[^\s<>"'，。；、)]+)?\/(?:wiki|docx|doc)\/([A-Za-z0-9]+))/g
  let match
  while ((match = pattern.exec(decoded)) !== null) {
    refs.push({ link: match[1], token: match[2] })
  }
  const seen = new Set()
  return refs.filter(ref => {
    if (seen.has(ref.token)) return false
    seen.add(ref.token)
    return true
  })
}

function parsePublishRequest(text) {
  const raw = String(text || '')
  const lower = raw.toLowerCase()
  const docRefs = extractDocRefs(raw)
  if (!docRefs.length) {
    throw new Error('publish request must include at least one Feishu doc/wiki link')
  }

  const wantsProduction = /\bprod(?:uction)?\b|生产|正式|上线/.test(lower)
  const environment = wantsProduction ? 'production' : 'uat'
  const releaseBranch = raw.match(/\bv\d+\.\d+\.\d+(?:[-.\w]*)?\b/)?.[0]
  if (environment === 'production' && !releaseBranch) {
    throw new Error('production publish requires a release branch like vX.X.X')
  }

  return {
    environment,
    branch: environment === 'production' ? releaseBranch : 'dev',
    docTokens: docRefs.map(ref => ref.token),
    docRefs,
    approved: /approved|approve|批准|同意|确认上线|可以上线/.test(lower),
    rawText: raw,
  }
}

function fieldValue(record, names) {
  const fields = record?.fields || {}
  for (const name of names) {
    if (fields[name] !== undefined && fields[name] !== null) return fields[name]
  }
  return null
}

function valueText(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(valueText).join(',')
  if (typeof value === 'object') {
    if (value.text) return String(value.text)
    if (value.name) return String(value.name)
    if (value.value) return valueText(value.value)
    return JSON.stringify(value)
  }
  return String(value)
}

function assertCanonicalRecord(record) {
  const placement = valueText(fieldValue(record, ['Placement Type', 'PlacementType', 'placement_type'])).toLowerCase()
  if (placement && placement !== 'canonical') {
    throw new Error(`refusing to publish non-canonical Base record: ${placement}`)
  }
}

function targetsForRecord(manualName, record) {
  if (manualName === 'guides') {
    const targetText = valueText(fieldValue(record, ['Targets', 'Publish Targets', 'Target'])).toLowerCase()
    const targets = []
    if (/saas/.test(targetText)) targets.push('zilliz.saas')
    if (/paas|byoc/.test(targetText)) targets.push('zilliz.paas')
    return targets.length ? targets : ['zilliz.saas']
  }

  return ['zilliz']
}

function postFlagsForTarget(target) {
  return target === 'zilliz.saas' || target === 'zilliz.paas' ? ['-post', '-skipS'] : ['-post']
}

function planDocusaurusCommands({ manualName, docToken, record }) {
  if (!manualName) throw new Error('manualName is required')
  if (!docToken) throw new Error('docToken is required')
  assertCanonicalRecord(record)

  const targets = targetsForRecord(manualName, record)
  return targets.flatMap(target => [
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manualName, '-tar', target, '-token', docToken, '-s3'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manualName, '-tar', target, ...postFlagsForTarget(target)],
  ])
}

function planBuildCommands() {
  return [
    ['node', 'scripts/run-doc-build-stage.js', '--build', 'pnpm run build'],
  ]
}

function planBranchCommands({ environment, branch }) {
  const targetBranch = environment === 'production' ? branch : 'dev'
  if (environment === 'production' && !/^v\d+\.\d+\.\d+/.test(targetBranch || '')) {
    throw new Error('production branch checkout requires a vX.X.X release branch')
  }
  return [
    ['git', 'fetch', 'origin', targetBranch],
    ['git', 'switch', targetBranch],
  ]
}

function planJenkinsTrigger({ environment, branch, imageTag, jenkinsBaseUrl = DEFAULT_JENKINS_BASE_URL }) {
  const base = jenkinsBaseUrl.replace(/\/+$/, '')
  if (environment === 'uat') {
    return {
      url: `${base}/job/zilliz-docs-dev/buildWithParameters`,
      params: { BRANCH: branch || 'dev' },
    }
  }
  if (environment === 'dev-test') {
    return {
      url: `${base}/job/zilliz-docs-dev-test/buildWithParameters`,
      params: { BRANCH: branch, REPO: 'zdoc', ENVIRONMENT: 'development' },
    }
  }
  if (environment === 'production') {
    if (!/^v\d+\.\d+\.\d+/.test(branch || '')) {
      throw new Error('production Jenkins trigger requires a vX.X.X release branch')
    }
    return {
      url: `${base}/job/zilliz-docs-prod/buildWithParameters`,
      params: imageTag ? { BRANCH: branch, image_tag: imageTag } : { BRANCH: branch },
    }
  }
  throw new Error(`unsupported Jenkins environment: ${environment}`)
}

function currentPublishManuals() {
  return ['guides', 'agents', ...CURRENT_SDK_MANUALS]
}

module.exports = {
  DEFAULT_JENKINS_BASE_URL,
  currentPublishManuals,
  extractDocTokens,
  extractDocRefs,
  parsePublishRequest,
  planBranchCommands,
  planBuildCommands,
  planDocusaurusCommands,
  planJenkinsTrigger,
  targetsForRecord,
}
