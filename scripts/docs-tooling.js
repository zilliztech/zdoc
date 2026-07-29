#!/usr/bin/env node
'use strict'

const path = require('node:path')
const { loadTypeScript } = require('./lib/load-typescript')

global.__DOCS_TOOLING_REVISION_INVENTORY__ = loadTypeScript(path.join(__dirname, '../packages/docs-tooling/src/lark/revisionInventory.ts'))
loadTypeScript(path.join(__dirname, '../packages/docs-tooling/src/cli-main.ts'))
