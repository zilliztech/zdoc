#!/usr/bin/env node
'use strict'

const path = require('node:path')
const { loadTypeScript } = require('./lib/load-typescript')

loadTypeScript(path.join(__dirname, '../packages/docs-tooling/src/cli-main.ts'))
