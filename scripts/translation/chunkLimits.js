'use strict'

const {DEFAULT_MAX_CHARS, DEFAULT_TARGET_CHARS} = require('./chunker')

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function loadChunkLimits(env = process.env) {
  const targetChars = parsePositiveInteger(env.TRANSLATION_CHUNK_TARGET_CHARS, DEFAULT_TARGET_CHARS)
  const maxChars = parsePositiveInteger(env.TRANSLATION_CHUNK_MAX_CHARS, DEFAULT_MAX_CHARS)
  if (maxChars < targetChars) {
    throw new Error('TRANSLATION_CHUNK_MAX_CHARS must be greater than or equal to TRANSLATION_CHUNK_TARGET_CHARS')
  }
  return {targetChars, maxChars}
}

module.exports = {loadChunkLimits, parsePositiveInteger}
