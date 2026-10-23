import { createRequire } from 'node:module'
import type { Md2md } from './types'

const require = createRequire(import.meta.url)
const blocks = require('@zilliz/mdtomd/blocks.js') as Pick<Md2md, 'parseBlocks' | 'stripBlockMarkers'>
const preprocessing = require('@zilliz/mdtomd/preprocess.js') as Pick<Md2md, 'preprocess'>

/** Only the public CommonJS subpaths; the legacy goover entrypoint is never loaded. */
export class RealMd2md implements Md2md {
  parseBlocks: Md2md['parseBlocks'] = (...args) => blocks.parseBlocks(...args)
  stripBlockMarkers: Md2md['stripBlockMarkers'] = content => blocks.stripBlockMarkers(content)
  preprocess: Md2md['preprocess'] = input => preprocessing.preprocess(input)
}
