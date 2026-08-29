'use strict'

const fs = require('node:fs')
const path = require('node:path')

// Prompt filenames per translation target. The REST spec localization prompts
// lived alongside these but are retired — REST is spec-generated, not translated.
const PROMPTS_BY_TARGET = Object.freeze({
  'ja-JP': Object.freeze({
    translation: 'codex-translation-agent.ja-JP.md',
    review: 'codex-review-agent.ja-JP.md',
    correction: 'codex-correction-agent.md',
    polish: 'codex-polish-agent.ja-JP.md',
  }),
  'zh-CN-reference': Object.freeze({
    translation: 'codex-translation-agent.zh-CN-reference.md',
    review: 'codex-review-agent.zh-CN-reference.md',
    correction: 'codex-correction-agent.zh-CN-reference.md',
    polish: 'codex-polish-agent.zh-CN-reference.md',
  }),
})

function promptNamesFor(target) {
  const prompts = PROMPTS_BY_TARGET[target]
  if (!prompts) throw new Error(`Unsupported translation target: ${target}`)
  return prompts
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(process.cwd(), '.github', 'prompts', name), 'utf8')
}

module.exports = {loadPrompt, promptNamesFor}
