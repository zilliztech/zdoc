'use strict'

const fs = require('node:fs')
const path = require('node:path')

const envPath = path.join(process.cwd(), 'static', 'env.js')
const content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''

const leakedKeys = [
  'INKEEP_API_KEY',
  'INKEEP_INTEGRATION_ID',
  'INKEEP_ORGANIZATION_ID',
].filter(key => new RegExp(`${key}\\s*:\\s*["'][^"']+["']`).test(content))

if (leakedKeys.length > 0) {
  console.error(`static/env.js contains populated runtime values: ${leakedKeys.join(', ')}`)
  console.error('Keep static/env.js as a placeholder and inject runtime values outside source control.')
  process.exit(1)
}

console.log('static/env.js placeholder check passed')
