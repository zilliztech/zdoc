'use strict'

// Surgical incremental-update lane for the agentic provider. When an English
// source changes but its structure is mostly intact, the published target
// translation is updated in place against the source delta instead of being
// retranslated: unchanged bytes pass through untouched, which preserves the
// published translation's own voice and keeps the published diff minimal.
//
// Routing is deterministic: classifyIncrementalChange compares section-level
// hashes between the old and new source and picks the surgical lane only when
// enough unchanged sections survive. A missed-update guard requires that any
// source change is reflected by a target change; the full deterministic
// validator (validate-translation-file.js) remains the final arbiter.

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {loadLocaleContract, formatLocaleContract} = require('./localeContract')
const {promptNamesFor} = require('./prompts')
const {successfulReview} = require('./reviewEvidence')
const {classifyFailure} = require('./failureClassification')
const {validateWithRuntimeChecks} = require('./validate-translation-file')
const {stylePromptPathFor, protectedBytesRules, validatorCommandFor} = require('./agenticProvider')

const DEFAULT_SURGICAL_THRESHOLD = 0.5
const DEFAULT_MAX_REPAIR_TURNS = 4
const MAX_FAILURE_ERROR_LENGTH = 2000
const MAX_SOURCE_DIFF_CHARS = 12000

function sha256(text) {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex')
}

function splitHeadingSections(content) {
  const lines = String(content).split('\n')
  const sections = []
  let current = null
  let inFence = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const heading = !inFence && line.match(/^(#{1,4})\s+(.+?)(?:\s*\{#([^}]+)\})?\s*$/)
    if (heading) {
      if (current) sections.push(current)
      current = {level: heading[1].length, text: heading[2].trim(), anchor: heading[3] || null, body: []}
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) sections.push(current)
  return sections.map(section => ({...section, id: `${section.level}:${section.text}`, bodyHash: sha256(section.body.join('\n'))}))
}

function classifyIncrementalChange({oldSource, newSource, threshold = DEFAULT_SURGICAL_THRESHOLD}) {
  if (typeof oldSource !== 'string' || typeof newSource !== 'string') {
    throw new Error('classifyIncrementalChange requires string old and new sources')
  }
  if (oldSource === newSource) return {lane: 'unchanged', totalSections: 0, unchangedSections: 0, unchangedRatio: 1}
  const oldSections = splitHeadingSections(oldSource)
  const newSections = splitHeadingSections(newSource)
  if (!newSections.length) return {lane: 'full', totalSections: 0, unchangedSections: 0, unchangedRatio: 0}
  const oldById = new Map(oldSections.map(section => [section.id, section.bodyHash]))
  let unchanged = 0
  for (const section of newSections) {
    if (oldById.get(section.id) === section.bodyHash) unchanged += 1
  }
  const ratio = unchanged / newSections.length
  return {
    lane: ratio >= threshold ? 'surgical' : 'full',
    totalSections: newSections.length,
    unchangedSections: unchanged,
    unchangedRatio: Number(ratio.toFixed(4)),
  }
}

function unifiedParagraphDiff(oldText, newText) {
  // Lightweight deterministic paragraph-level diff used for the missed-update
  // guard and for prompting. Returns changed paragraph counts per side.
  const oldParagraphs = new Map()
  for (const paragraph of String(oldText).split(/\n\n+/)) oldParagraphs.set(paragraph, (oldParagraphs.get(paragraph) || 0) + 1)
  let added = 0
  let removed = 0
  for (const paragraph of String(newText).split(/\n\n+/)) {
    const count = oldParagraphs.get(paragraph) || 0
    if (count > 0) oldParagraphs.set(paragraph, count - 1)
    else added += 1
  }
  for (const count of oldParagraphs.values()) removed += count
  return {added, removed}
}

function protectedTokensFromDiff(oldSource, newSource) {
  // The concrete update obligation of an incremental edit is carried by its
  // protected tokens: link destinations, inline code, and anchors. Extract
  // them from the removed/added source lines so the guard can check the real
  // requirement instead of demanding an arbitrary target change.
  const preview = unifiedSourceDiffPreview(oldSource, newSource)
  const removed = []
  const added = []
  for (const line of preview.split('\n')) {
    if (line.startsWith('- ')) removed.push(line.slice(2))
    if (line.startsWith('+ ')) added.push(line.slice(2))
  }
  const tokens = text => [...text.matchAll(/\]\(([^)]+)\)|`([^`]+)`|(\{#[^}]+\})/g)]
    .map(match => match[1] || match[2] || match[3])
    .filter(token => token && token.length >= 3)
  return {removedTokens: [...new Set(removed.flatMap(tokens))], addedTokens: [...new Set(added.flatMap(tokens))]}
}

function assertChangeCoverage({oldSource, newSource, oldTarget, newTarget}) {
  const sourceChange = unifiedParagraphDiff(oldSource, newSource)
  const sourceChanged = sourceChange.added + sourceChange.removed
  if (!sourceChanged) return []
  const {removedTokens, addedTokens} = protectedTokensFromDiff(oldSource, newSource)
  const violations = []
  for (const token of addedTokens) {
    if (!oldTarget.includes(token) && !newTarget.includes(token)) violations.push(`source added protected token "${token}" but the target does not contain it (possible missed update)`)
  }
  for (const token of removedTokens) {
    if (newTarget.includes(token) && token.split('/').pop() !== newTarget.split('/').pop()) violations.push(`source removed protected token "${token}" but the target still contains it (possible stale update)`)
  }
  if (removedTokens.length || addedTokens.length) return violations
  // Pure-prose edits carry no extractable tokens: fall back to requiring some
  // target change so silent no-ops cannot pass.
  const targetChange = unifiedParagraphDiff(oldTarget, newTarget)
  if (targetChange.added + targetChange.removed === 0) {
    return ['source changed but the target translation is byte-identical to the published baseline (possible missed update)']
  }
  return []
}

function buildSurgicalTaskPrompt({item, target, siteDir, oldSource, newSource, oldTargetPath, validatorCommand, stylePromptPath}) {
  const contract = formatLocaleContract(loadLocaleContract(target))
  const styleLine = stylePromptPath
    ? `The workspace file ${path.join(siteDir, '.github', 'prompts', stylePromptPath)} is the authoritative ${target} house style guide. Read it before editing and follow it.`
    : `No ${target} style guide is registered; follow the locale contract and the existing translation's own voice.`
  const oldSourcePath = `${item.sourcePath}.surgical-old`
  const sourceDiff = unifiedSourceDiffPreview(oldSource, newSource)
  return `${contract}

${styleLine}

A published ${target} translation exists and the English source has changed. Update the translation in place to match the new source — this is a surgical edit, not a retranslation.

- New source of truth (read-only): ${item.sourcePath}
- Previous English source (read-only, for reference): ${oldSourcePath}
- Published translation to update: ${oldTargetPath}

Source changes (deterministic diff of previous -> new English):
${sourceDiff}

Editing rules:
- Update ONLY the parts of the translation affected by the source changes. Every sentence whose source is unchanged must remain byte-identical — same wording, same punctuation, same position.
- For changed source passages, revise the existing translation minimally: keep its established terminology and phrasing unless the source change requires otherwise.
- Match the surrounding document's style; new sentences follow the style guide.
${protectedBytesRules()}

Verification loop (best effort — the external validator gates this file either way):
1. After editing ${oldTargetPath}, try to run: ${validatorCommand}
2. If the command runs, fix every VIOLATIONS entry and repeat until it prints OK, then reply with exactly: DONE.
3. If you cannot run commands in this environment, do NOT stop: applying your best surgical edit to ${oldTargetPath} is mandatory. Reply with exactly: DRAFT_COMPLETE. An external deterministic validator will check the file and send corrections back if needed. Never leave the file unedited, and never fabricate a validator result.`
}

function unifiedSourceDiffPreview(oldSource, newSource) {
  const oldLines = String(oldSource).split('\n')
  const newLines = String(newSource).split('\n')
  const oldSet = new Map()
  for (const line of oldLines) oldSet.set(line, (oldSet.get(line) || 0) + 1)
  const added = []
  for (const line of newLines) {
    const count = oldSet.get(line) || 0
    if (count > 0) oldSet.set(line, count - 1)
    else if (line.trim()) added.push(line)
  }
  const removed = []
  for (const [line, count] of oldSet) {
    if (count > 0 && line.trim()) removed.push(...Array(count).fill(line))
  }
  const preview = [
    ...(removed.length ? ['REMOVED from source:'].concat(removed.slice(0, 80).map(line => `- ${line}`)) : []),
    ...(added.length ? ['ADDED to source:'].concat(added.slice(0, 80).map(line => `+ ${line}`)) : []),
  ]
  const text = preview.length ? preview.join('\n') : '(no line-level changes detected; the change may be within a line)'
  return text.slice(0, MAX_SOURCE_DIFF_CHARS)
}

async function runSurgicalUpdate({item, target, siteDir, oldSourceContent, oldTargetContent, newSourceContent, callCodex, validate, maxRepairTurns = DEFAULT_MAX_REPAIR_TURNS, model = null, now = () => Date.now()}) {
  if (!item || typeof item.sourcePath !== 'string' || typeof item.targetPath !== 'string') {
    throw new Error('Surgical update requires manifest item source and target paths')
  }
  const draftPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(draftPath), {recursive: true})
  fs.writeFileSync(draftPath, oldTargetContent)
  const oldSourcePath = path.join(siteDir, `${item.sourcePath}.surgical-old`)
  fs.mkdirSync(path.dirname(oldSourcePath), {recursive: true})
  fs.writeFileSync(oldSourcePath, oldSourceContent)
  const validatorCommand = validatorCommandFor(siteDir, target, item)
  const stylePromptPath = stylePromptPathFor(target)
  // Fast path: when the published target already satisfies the new source
  // (validator clean and every protected-token obligation met), there is no
  // surgical work — return it byte-identical without invoking the agent. This
  // also prevents the agent from inventing edits (and mistranslating inside
  // anchors or URLs) when the manifest carries a stale source pairing.
  const preflight = await validateWithRuntimeChecks({sourceContent: newSourceContent, draftContent: oldTargetContent, relPath: item.sourcePath, target, validate})
  const {removedTokens, addedTokens} = protectedTokensFromDiff(oldSourceContent, newSourceContent)
  const tokenCharacterized = Boolean(removedTokens.length || addedTokens.length)
  if (tokenCharacterized && !preflight.errors.length &&
      !assertChangeCoverage({oldSource: oldSourceContent, newSource: newSourceContent, oldTarget: oldTargetContent, newTarget: preflight.repaired}).length) {
    fs.writeFileSync(draftPath, preflight.repaired)
    return {
      ...item, target, attempts: ['verified-current'], lane: 'surgical',
      status: 'translated', review: successfulReview(), validationErrors: [],
      ...(model ? {model} : {}),
    }
  }
  const attempts = []
  const callOptions = {
    phase: 'surgical-translate',
    prompt: buildSurgicalTaskPrompt({item, target, siteDir, oldSource: oldSourceContent, newSource: newSourceContent, oldTargetPath: item.targetPath, validatorCommand, stylePromptPath}),
    item,
  }
  await callCodex(callOptions)
  attempts.push('surgical-translate')
  let violations = []
  let repaired = oldTargetContent
  for (;;) {
    const draft = fs.readFileSync(draftPath, 'utf8')
    const outcome = await validateWithRuntimeChecks({sourceContent: newSourceContent, draftContent: draft, relPath: item.sourcePath, target, validate})
    repaired = outcome.repaired
    violations = [...outcome.errors, ...assertChangeCoverage({oldSource: oldSourceContent, newSource: newSourceContent, oldTarget: oldTargetContent, newTarget: repaired})]
    if (!violations.length || attempts.length > maxRepairTurns) break
    await callCodex({
      phase: `surgical-repair${attempts.length}`,
      prompt: `${buildSurgicalTaskPrompt({item, target, siteDir, oldSource: oldSourceContent, newSource: newSourceContent, oldTargetPath: item.targetPath, validatorCommand, stylePromptPath})}\n\nThe validator reported these violations after your last edit:\n${violations.slice(0, 20).map(violation => `- ${violation}`).join('\n')}\n\nIf you cannot run commands in this environment, still apply your best fix and reply with exactly: DRAFT_COMPLETE — the external validator will re-check the file. Never fabricate a validator result.`,
      item,
    })
    attempts.push(`surgical-repair${attempts.length}`)
  }
  fs.writeFileSync(draftPath, repaired)
  const base = {...item, target, attempts, lane: 'surgical', ...(model ? {model} : {})}
  if (!violations.length) {
    return {...base, status: 'translated', review: successfulReview(), validationErrors: []}
  }
  const error = violations.join('; ').slice(0, MAX_FAILURE_ERROR_LENGTH)
  return {
    ...base,
    status: 'failed',
    failureCategory: classifyFailure(new Error(violations[0])),
    error,
    validationErrors: violations.slice(0, 10).map(violation => String(violation).slice(0, 400)),
  }
}

module.exports = {
  DEFAULT_MAX_REPAIR_TURNS,
  protectedTokensFromDiff,
  DEFAULT_SURGICAL_THRESHOLD,
  assertChangeCoverage,
  buildSurgicalTaskPrompt,
  classifyIncrementalChange,
  runSurgicalUpdate,
  splitHeadingSections,
  unifiedParagraphDiff,
  unifiedSourceDiffPreview,
}
