const {
  parsePublishRequest,
  planBranchCommands,
  planBuildCommands,
  planDocusaurusCommands,
  planJenkinsTrigger,
} = require('./publishRequest')

async function buildPublishJobPlan({ text, resolveDoc, imageTag }) {
  if (typeof resolveDoc !== 'function') {
    throw new Error('resolveDoc function is required')
  }

  const request = parsePublishRequest(text)
  const docs = []
  const docusaurusCommands = []

  for (const docToken of request.docTokens) {
    const resolved = await resolveDoc(docToken)
    if (!resolved) {
      throw new Error(`doc token ${docToken} was not found in the manual root Base`)
    }
    const manualName = resolved.manualName
    const commands = planDocusaurusCommands({
      manualName,
      docToken,
      record: resolved.record,
    })
    docs.push({
      token: docToken,
      title: resolved.title || docToken,
      manualName,
      recordId: resolved.record?.record_id || resolved.record?.recordId || null,
    })
    docusaurusCommands.push(...commands)
  }

  const buildCommands = planBuildCommands()
  const branchCommands = planBranchCommands({
    environment: request.environment,
    branch: request.branch,
  })
  const jenkins = planJenkinsTrigger({
    environment: request.environment,
    branch: request.branch,
    imageTag,
  })

  return {
    environment: request.environment,
    branch: request.branch,
    approved: request.approved,
    docs,
    branchCommands,
    docusaurusCommands,
    buildCommands,
    jenkins,
    urls: {
      uat: 'https://docs.cloud-uat3.zilliz.com',
      devTest: 'https://docs-test.cloud-uat3.zilliz.com',
      production: 'https://docs.zilliz.com',
    },
  }
}

function shellQuote(argv) {
  return argv.map(arg => {
    const value = String(arg)
    return /^[A-Za-z0-9_./:=@+-]+$/.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`
  }).join(' ')
}

function renderPlan(plan) {
  const lines = []
  lines.push(`Environment: ${plan.environment}`)
  lines.push(`Branch: ${plan.branch}`)
  lines.push(`Docs: ${plan.docs.map(doc => `${doc.title} (${doc.token}, ${doc.manualName})`).join(', ')}`)
  lines.push('')
  lines.push('Branch:')
  for (const command of plan.branchCommands) lines.push(`- ${shellQuote(command)}`)
  lines.push('')
  lines.push('Docusaurus:')
  for (const command of plan.docusaurusCommands) lines.push(`- ${shellQuote(command)}`)
  lines.push('')
  lines.push('Build:')
  for (const command of plan.buildCommands) lines.push(`- ${shellQuote(command)}`)
  lines.push('')
  lines.push('Jenkins:')
  lines.push(`- POST ${plan.jenkins.url}`)
  for (const [key, value] of Object.entries(plan.jenkins.params)) {
    lines.push(`  ${key}=${value}`)
  }
  return lines.join('\n')
}

module.exports = {
  buildPublishJobPlan,
  renderPlan,
  shellQuote,
}
