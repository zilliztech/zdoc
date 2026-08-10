'use strict'

const assert = require('node:assert/strict')
const yaml = require('js-yaml')
const {validateMdxStructure} = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const {loadLocaleContract} = require('./localeContract')
const {protectTranslationInput, validateProtectedContent} = require('./protectedContent')
const {parseRestDocument, removeLocale} = require('./restSpecLocalization')
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

function validateRestIdentity(sourceContent, targetContent, locale) {
  const source = parseRestDocument(sourceContent)
  if (!source) return []
  const target = parseRestDocument(targetContent)
  if (!target) return ['REST revalidation could not parse the retained target document']
  try {
    assert.deepEqual(removeLocale(target.sourceSpecs, locale), source.sourceSpecs)
    return []
  } catch {
    return ['REST revalidation found changed non-locale specification data']
  }
}

function validateRecoveryLocale(sourceContent, targetContent, localeContract, protectedOptions) {
  const sourceUnits = protectSemanticUnits(collectSemanticUnitsSync(sourceContent), unit => unit.source, protectedOptions)
  const targetUnits = protectSemanticUnits(collectSemanticUnitsSync(targetContent), unit => unit.source, protectedOptions)
  const targetById = new Map(targetUnits.map(unit => [unit.id, unit]))
  const alignedTargetUnits = sourceUnits.map(sourceUnit => targetById.get(sourceUnit.id) || {
    id: sourceUnit.id,
    protection: protectTranslationInput('', {...protectedOptions, reorderWithin: sourceUnit.id}),
  })
  return deterministicSemanticIssues(sourceUnits, alignedTargetUnits, localeContract).issues
}

function validateRecoveryCandidate({sourceContent, targetContent, sourcePath, targetPath, target, locale}) {
  const localeContract = loadLocaleContract(target)
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const protectedErrors = validateProtectedContent(sourceContent, targetContent, {
    sourcePath,
    targetPath,
    allowAdditionalLiteralTokens: true,
    ...protectedOptions,
  })
  const localeIssues = validateRecoveryLocale(sourceContent, targetContent, localeContract, protectedOptions)
  return Object.freeze([
    ...protectedErrors.map(error => `protected: ${error}`),
    ...localeIssues.map(issue => `locale: ${issue.location}: ${issue.comment}`),
    ...validateFrontmatter(targetContent),
    ...validateMdxStructure(targetContent).map(error => `MDX structure: ${error}`),
    ...validateRestIdentity(sourceContent, targetContent, locale),
  ])
}

module.exports = {validateRecoveryCandidate}
