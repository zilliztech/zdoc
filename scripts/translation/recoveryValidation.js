'use strict'

const assert = require('node:assert/strict')
const yaml = require('js-yaml')
const {validateMdxStructure} = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const {loadLocaleContract} = require('./localeContract')
const {validateProtectedContent} = require('./protectedContent')
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
  let source
  try {
    source = parseRestDocument(sourceContent)
  } catch (error) {
    return [`REST revalidation source parse error: ${String(error?.message || error)}`]
  }
  if (!source) return []
  let target
  try {
    target = parseRestDocument(targetContent)
  } catch (error) {
    return [`REST revalidation target parse error: ${String(error?.message || error)}`]
  }
  if (!target) return ['REST revalidation could not parse the retained target document']
  try {
    assert.deepEqual(removeLocale(target.sourceSpecs, locale), source.sourceSpecs)
    return []
  } catch {
    return ['REST revalidation found changed non-locale specification data']
  }
}

function restProtectedValidation({sourceContent, targetContent, sourcePath, targetPath, locale, localeContract}) {
  let source
  try {
    source = parseRestDocument(sourceContent)
  } catch (error) {
    return [`REST recovery source parse error: ${String(error?.message || error)}`]
  }
  if (!source) return null

  let target
  try {
    target = parseRestDocument(targetContent)
  } catch (error) {
    return [`REST recovery target parse error: ${String(error?.message || error)}`]
  }
  if (!target) return ['REST revalidation could not parse the retained target document']

  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const normalizedSourcePrefix = source.prefix.replace(/lang=(['"])en-US\1/g, `lang="${locale}"`)
  return Object.freeze([
    ...validateProtectedContent(normalizedSourcePrefix, target.prefix, {
      sourcePath: `${sourcePath}#prefix`,
      targetPath: `${targetPath}#prefix`,
      allowAdditionalLiteralTokens: true,
      ...protectedOptions,
    }).map(error => `protected: ${error}`),
    ...validateProtectedContent(source.suffix, target.suffix, {
      sourcePath: `${sourcePath}#suffix`,
      targetPath: `${targetPath}#suffix`,
      allowAdditionalLiteralTokens: true,
      ...protectedOptions,
    }).map(error => `protected: ${error}`),
  ])
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
  const restErrors = restProtectedValidation({
    sourceContent,
    targetContent,
    sourcePath,
    targetPath,
    locale,
    localeContract,
  })
  const protectedErrors = restErrors === null
    ? validateProtectedContent(sourceContent, targetContent, {
        sourcePath,
        targetPath,
        allowAdditionalLiteralTokens: true,
        ...protectedOptions,
      }).map(error => `protected: ${error}`)
    : restErrors
  const semanticValidation = validateRecoveryLocale(sourceContent, targetContent, localeContract, protectedOptions)
  return Object.freeze([
    ...protectedErrors,
    ...semanticValidation.structureErrors.map(error => `semantic: ${error}`),
    ...semanticValidation.localeIssues.map(issue => `locale: ${issue.location}: ${issue.comment}`),
    ...validateFrontmatter(targetContent),
    ...validateMdxStructure(targetContent).map(error => `MDX structure: ${error}`),
    ...validateRestIdentity(sourceContent, targetContent, locale),
  ])
}

module.exports = {validateRecoveryCandidate}
