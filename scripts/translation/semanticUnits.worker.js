'use strict'

const fs = require('node:fs')
const {collectSemanticUnits} = require('./semanticUnits')

async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'))
  const units = await collectSemanticUnits(input.sourceContent, input.options)
  process.stdout.write(JSON.stringify(units))
}

main().catch(error => {
  process.stderr.write(`${String(error?.stack || error)}\n`)
  process.exit(1)
})
