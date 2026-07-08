const fs = require('node:fs')
const vm = require('node:vm')

function loadLarkDocsConfig(configPath = 'config/lark-docs.config.ts') {
  let source = fs.readFileSync(configPath, 'utf8')
  source = source
    .replace(/^[\s\S]*?\/\/ guides/m, '// guides')
    .replace(/const\s+(\w+)\s*:\s*Manual\s*=/g, 'const $1 =')
    .replace(/const\s+(\w+)\s*:\s*Targets\s*=/g, 'const $1 =')
    .replace(/export\s+default\s+/, 'module.exports = ')
  const sandbox = { module: { exports: {} }, exports: {} }
  vm.runInNewContext(source, sandbox, { filename: configPath })
  return sandbox.module.exports
}

module.exports = {
  loadLarkDocsConfig,
}
