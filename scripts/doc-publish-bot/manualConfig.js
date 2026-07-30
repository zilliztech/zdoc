const fs = require('node:fs')
const vm = require('node:vm')
const { resolveBootstrapSite } = require('../../packages/site-config/src/resolve.ts')

function loadLarkDocsConfig(configPath = 'config/lark-docs.config.ts', explicitSite) {
  let source = fs.readFileSync(configPath, 'utf8')
  source = source
    .replace(/^[\s\S]*?\/\/ guides/m, '// guides')
    .replace(/const\s+(\w+)\s*:\s*Manual\s*=/g, 'const $1 =')
    .replace(/const\s+(\w+)\s*:\s*Targets\s*=/g, 'const $1 =')
    .replace(/export\s+default\s+/, 'module.exports = ')
  const sandbox = { module: { exports: {} }, exports: {}, site: resolveBootstrapSite(explicitSite) }
  vm.runInNewContext(source, sandbox, { filename: configPath })
  return sandbox.module.exports
}

module.exports = {
  loadLarkDocsConfig,
}
