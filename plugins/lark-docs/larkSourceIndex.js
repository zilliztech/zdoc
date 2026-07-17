const fs = require('node:fs')
const path = require('node:path')

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

function freezeRecursively(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) freezeRecursively(child)
  return Object.freeze(value)
}

function ambiguousLookupError(value, entries) {
  const files = entries.map(entry => entry.sourcePath).sort().join(', ')
  return new Error(`Ambiguous Lark source lookup for "${value}": ${files}`)
}

class LarkSourceIndex {
  #sourceDir
  #byType

  constructor(sourceDir, byType) {
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
    const directoryEntries = fs.readdirSync(realSourceDir, { withFileTypes: true })
      .filter(entry => entry.name.endsWith('.json'))
      .sort((left, right) => left.name.localeCompare(right.name))
    const entries = []
    const byType = new Map()

    for (const directoryEntry of directoryEntries) {
      const sourcePath = path.join(realSourceDir, directoryEntry.name)
      const fileStat = fs.lstatSync(sourcePath)
      if (directoryEntry.isSymbolicLink() || fileStat.isSymbolicLink()) {
        throw new Error(`Lark source file must not be a symlink: ${sourcePath}`)
      }
      if (!directoryEntry.isFile() || !fileStat.isFile()) continue

      if (options.onRead) options.onRead(sourcePath)
      let source
      try {
        source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
      } catch (error) {
        throw new Error(`Cannot parse Lark source JSON ${sourcePath}: ${error.message}`)
      }
      freezeRecursively(source)

      const indexedEntry = Object.freeze({ source, sourcePath })
      entries.push(indexedEntry)
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
    return new LarkSourceIndex(realSourceDir, byType)
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
