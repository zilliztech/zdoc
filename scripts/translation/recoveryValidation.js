'use strict'

const assert = require('node:assert/strict')
const yaml = require('js-yaml')
const {validateMdxStructure} = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const {loadLocaleContract} = require('./localeContract')
const {validateProtectedContent} = require('./protectedContent')
const {collectSemanticUnitsSync, deterministicSemanticIssues, protectSemanticUnits} = require('./semanticUnits')

function validateFrontmatter(content) {
  const match = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return []
  try {
    yaml.load(match[1])
    return []
  } catch (error) {
    return [`YAML frontmatter error: ${String(error?.message || error).split('\n')[0]}`]
  }
}

function validateRecoveryLocale(sourceContent, targetContent, localeContract, protectedOptions) {
  const sourceStructure = collectSemanticUnitsSync(sourceContent)
  const targetStructure = collectSemanticUnitsSync(targetContent)
  if (sourceStructure.length !== targetStructure.length) {
    return Object.freeze({
      structureErrors: Object.freeze([`Semantic unit structure count mismatch: source=${sourceStructure.length}, target=${targetStructure.length}`]),
      localeIssues: Object.freeze([]),
    })
  }
  for (let index = 0; index < sourceStructure.length; index += 1) {
    const sourceUnit = sourceStructure[index]
    const targetUnit = targetStructure[index]
    if (sourceUnit.id !== targetUnit.id || sourceUnit.kind !== targetUnit.kind) {
      return Object.freeze({
        structureErrors: Object.freeze([
          `Semantic unit structure identity mismatch at position ${index + 1}: source=${sourceUnit.id}/${sourceUnit.kind}, target=${targetUnit.id}/${targetUnit.kind}`,
        ]),
        localeIssues: Object.freeze([]),
      })
    }
  }
  const sourceUnits = protectSemanticUnits(sourceStructure, unit => unit.source, protectedOptions)
  const targetUnits = protectSemanticUnits(targetStructure, unit => unit.source, protectedOptions)
  return Object.freeze({
    structureErrors: Object.freeze([]),
    localeIssues: deterministicSemanticIssues(sourceUnits, targetUnits, localeContract).issues,
  })
}

function validateRecoveryCandidate({sourceContent, targetContent, sourcePath, targetPath, target, locale}) {
  const localeContract = loadLocaleContract(target)
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const protectedErrors = validateProtectedContent(sourceContent, targetContent, {
    sourcePath,
    targetPath,
    allowAdditionalLiteralTokens: true,
    ...protectedOptions,
  }).map(error => `protected: ${error}`)
  const semanticValidation = validateRecoveryLocale(sourceContent, targetContent, localeContract, protectedOptions)
  return Object.freeze([
    ...protectedErrors,
    ...semanticValidation.structureErrors.map(error => `semantic: ${error}`),
    ...semanticValidation.localeIssues.map(issue => `locale: ${issue.location}: ${issue.comment}`),
    ...validateFrontmatter(targetContent),
    ...validateMdxStructure(targetContent).map(error => `MDX structure: ${error}`),
  ])
}

// Whole-file recovery revalidation, aligned with the publication gate
// (validate-translation-file.js). A retained translation that passes today's
// publication checks for a fresh translation must also be restorable: when
// the two gates disagree, every recovery run retranslates pages that publish
// fine and the disagreement never converges (observed with code-fenced schema
// tables that keep locale-contract column names such as "vector" in English —
// the file-level gate exempts protected spans from mandatory-term counting
// while per-unit semantic enforcement does not). Protected content,
// do-not-translate counts, mandatory terminology, and heading parity therefore
// come from validateTranslationFile; the semantic-unit structure pairing,
// frontmatter, and MDX structure checks stay because they detect
// retained-payload corruption that per-file counting cannot see. Per-unit
// locale enforcement remains in validateRecoveryCandidate for chunk and
// semantic-resume contexts, where payloads are unit-level.
function validateRecoveryFileCandidate({candidate, sourceContent, targetContent, sourcePath, targetPath, target}) {
  // Required lazily: validate-translation-file requires agentRunner, which
  // requires this module — a top-level require would create a load cycle.
  const {validateTranslationFile} = require('./validate-translation-file')
  const publication = validateTranslationFile({
    sourceContent,
    draftContent: targetContent,
    relPath: sourcePath || candidate?.sourcePath || targetPath,
    target,
  })
  const localeContract = loadLocaleContract(target)
  const semanticValidation = validateRecoveryLocale(sourceContent, targetContent, localeContract, {literalTokens: localeContract.doNotTranslate})
  return Object.freeze([
    ...publication.errors.map(error => `publication: ${error}`),
    ...semanticValidation.structureErrors.map(error => `semantic: ${error}`),
    ...validateFrontmatter(targetContent),
    ...validateMdxStructure(targetContent).map(error => `MDX structure: ${error}`),
  ])
}

module.exports = {validateRecoveryCandidate, validateRecoveryFileCandidate}
