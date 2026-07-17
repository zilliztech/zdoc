const fs = require('node:fs')
const path = require('node:path')

const CONSTRUCTOR_TOKEN = Symbol('LarkSourceIndex constructor')
const REQUIRED_SECURE_OPEN_FLAGS = ['O_NOFOLLOW', 'O_NONBLOCK']
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

function secureOpenFlags() {
  const missingFlags = REQUIRED_SECURE_OPEN_FLAGS.filter(flag => typeof fs.constants[flag] !== 'number')
  if (missingFlags.length > 0) {
    throw new Error(`Secure Lark source loading requires filesystem support for ${missingFlags.join(', ')}`)
  }
  return fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK
}

function freezeIteratively(value) {
  if (!value || typeof value !== 'object') return value

  const objects = []
  const pending = [value]
  const seen = new Set()
  while (pending.length > 0) {
    const current = pending.pop()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)
    objects.push(current)
    for (const child of Object.values(current)) pending.push(child)
  }
  for (let index = objects.length - 1; index >= 0; index -= 1) {
    Object.freeze(objects[index])
  }
  return value
}

function readRegularSourceFile(sourcePath, openFlags) {
  let fileDescriptor
  try {
    fileDescriptor = fs.openSync(sourcePath, openFlags)
  } catch (error) {
    const detail = error.code === 'ELOOP'
      ? 'symlink source files are not allowed'
      : error.message
    throw new Error(`Cannot open Lark source file ${sourcePath}: ${detail}`)
  }

  let sourceJson
  let primaryError = null
  try {
    let fileStat
    try {
      fileStat = fs.fstatSync(fileDescriptor)
    } catch (error) {
      throw new Error(`Cannot read Lark source file ${sourcePath}: ${error.message}`)
    }
    if (!fileStat.isFile()) {
      throw new Error(`Cannot read Lark source file ${sourcePath}: not a regular file`)
    }
    try {
      sourceJson = fs.readFileSync(fileDescriptor, 'utf8')
    } catch (error) {
      throw new Error(`Cannot read Lark source file ${sourcePath}: ${error.message}`)
    }
  } catch (error) {
    primaryError = error
  }
  try {
    fs.closeSync(fileDescriptor)
  } catch (error) {
    if (!primaryError) {
      primaryError = new Error(`Cannot close Lark source file ${sourcePath}: ${error.message}`)
    }
  }
  if (primaryError) throw primaryError
  return sourceJson
}

function ambiguousLookupError(value, entries) {
  const files = entries.map(entry => entry.sourcePath).sort().join(', ')
  return new Error(`Ambiguous Lark source lookup for "${value}": ${files}`)
}

class LarkSourceIndex {
  #sourceDir
  #byType

  constructor(constructorToken, sourceDir, byType) {
    if (constructorToken !== CONSTRUCTOR_TOKEN) {
      throw new Error('LarkSourceIndex instances must be created with LarkSourceIndex.load')
    }
    this.#sourceDir = sourceDir
    this.#byType = byType
    Object.freeze(this)
  }

  static load(sourceDir, options = {}) {
    const resolvedDir = path.resolve(sourceDir)
    let directoryStat
    try {
      directoryStat = fs.lstatSync(resolvedDir)
    } catch (error) {
      throw new Error(`Cannot access Lark source directory ${resolvedDir}: ${error.message}`)
    }
    if (directoryStat.isSymbolicLink()) {
      throw new Error(`Lark source directory must not be a symlink: ${resolvedDir}`)
    }
    if (!directoryStat.isDirectory()) {
      throw new Error(`Lark source path is not a directory: ${resolvedDir}`)
    }

    const realSourceDir = fs.realpathSync(resolvedDir)
    const openFlags = secureOpenFlags()
    const directoryEntries = fs.readdirSync(realSourceDir, { withFileTypes: true })
      .filter(entry => entry.name.endsWith('.json'))
      .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
    const byType = new Map()

    for (const directoryEntry of directoryEntries) {
      const sourcePath = path.join(realSourceDir, directoryEntry.name)
      if (directoryEntry.isDirectory()) continue
      if (directoryEntry.isSymbolicLink()) {
        throw new Error(`Cannot open Lark source file ${sourcePath}: symlink source files are not allowed`)
      }

      const sourceJson = readRegularSourceFile(sourcePath, openFlags)
      if (options.onRead) options.onRead(sourcePath)
      let source
      try {
        source = JSON.parse(sourceJson)
      } catch (_) {
        throw new Error(`Cannot parse Lark source JSON ${sourcePath}`)
      }
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        throw new Error(`Invalid Lark source JSON shape in ${sourcePath}`)
      }
      freezeIteratively(source)

      const indexedEntry = Object.freeze({ source, sourcePath })
      for (const [type, value] of Object.entries(source)) {
        let values = byType.get(type)
        if (!values) {
          values = new Map()
          byType.set(type, values)
        }
        let candidates = values.get(value)
        if (!candidates) {
          candidates = []
          values.set(value, candidates)
        }
        candidates.push(indexedEntry)
      }
    }

    for (const values of byType.values()) {
      for (const candidates of values.values()) Object.freeze(candidates)
    }
    return new LarkSourceIndex(CONSTRUCTOR_TOKEN, realSourceDir, byType)
  }

  find(typeOrTypes, value, options = {}) {
    const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]
    const candidates = this.#findCandidates(types, value)
    if (candidates.length === 0) {
      throw new Error(`Cannot find ${value} in ${this.#sourceDir}`)
    }

    if (options.slug) {
      const slugMatches = candidates.filter(entry => entry.source.slug === options.slug)
      if (slugMatches.length === 0) return undefined
      return this.#selectUnique(value, slugMatches)
    }
    return this.#selectUnique(value, candidates)
  }

  findAnyToken(token) {
    const entries = new Set()
    for (const type of ['node_token', 'origin_node_token', 'obj_token', 'token']) {
      for (const entry of this.#candidatesFor(type, token)) entries.add(entry)
    }
    if (entries.size === 0) return null
    return this.#selectUnique(token, [...entries])
  }

  findBaseSourceMeta({ title, slug, token = null }) {
    const isBaseSource = entry => entry.source.base_record_id || entry.source.base_nav_virtual
    if (token) {
      const tokenEntries = new Set()
      for (const type of ['node_token', 'origin_node_token', 'token']) {
        for (const entry of this.#candidatesFor(type, token)) {
          if (isBaseSource(entry)) tokenEntries.add(entry)
        }
      }
      if (tokenEntries.size > 0) return this.#selectUnique(token, [...tokenEntries])
    }

    const matches = this.#candidatesFor('slug', slug).filter(entry =>
      isBaseSource(entry) &&
      (entry.source.title === title || entry.source.name === title),
    )
    if (matches.length === 0) return null
    return this.#selectUnique(slug, matches)
  }

  #findCandidates(types, value) {
    if (types.length === 1) return this.#candidatesFor(types[0], value)

    const candidates = new Set()
    for (const type of types) {
      for (const entry of this.#candidatesFor(type, value)) candidates.add(entry)
    }
    return [...candidates].filter(entry => {
      const selectedType = types.find(type => hasOwn(entry.source, type))
      return selectedType && entry.source[selectedType] === value
    })
  }

  #candidatesFor(type, value) {
    return this.#byType.get(type)?.get(value) || []
  }

  #selectUnique(value, entries) {
    if (entries.length > 1) throw ambiguousLookupError(value, entries)
    return entries[0].source
  }
}

module.exports = LarkSourceIndex
