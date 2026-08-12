'use strict'

const fs = require('node:fs')
const path = require('node:path')

function dependencyRoots(dependencyRoot) {
  return [
    path.join(dependencyRoot, 'node_modules'),
    ...['apps', 'packages'].flatMap(directory => {
      const root = path.join(dependencyRoot, directory)
      if (!fs.existsSync(root)) return []
      return fs.readdirSync(root, {withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(root, entry.name, 'node_modules'))
    }),
  ]
}

function linkResolved(source, destination, validationRoot, linked) {
  const resolvedSource = fs.realpathSync(source)
  if (!fs.statSync(resolvedSource).isDirectory()) return
  if (fs.existsSync(destination)) {
    const destinationStat = fs.lstatSync(destination)
    if (!destinationStat.isSymbolicLink() || fs.realpathSync(destination) !== resolvedSource) {
      throw new Error(`Validation dependency destination does not match the installed package: ${path.relative(validationRoot, destination)}`)
    }
    linked.push(Object.freeze({
      relative: path.relative(validationRoot, destination).split(path.sep).join('/'),
      source: resolvedSource,
      destination,
    }))
    return
  }
  fs.mkdirSync(path.dirname(destination), {recursive: true})
  fs.symlinkSync(resolvedSource, destination)
  linked.push(Object.freeze({
    relative: path.relative(validationRoot, destination).split(path.sep).join('/'),
    source: resolvedSource,
    destination,
  }))
}

function linkWorkspaceDependencies(dependencyRoot, validationRoot) {
  const linked = []
  for (const sourceRoot of dependencyRoots(dependencyRoot)) {
    if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) continue
    const destinationRoot = path.join(validationRoot, path.relative(dependencyRoot, sourceRoot))
    fs.mkdirSync(destinationRoot, {recursive: true})
    for (const entry of fs.readdirSync(sourceRoot, {withFileTypes: true})) {
      const source = path.join(sourceRoot, entry.name)
      if (entry.name.startsWith('@') && fs.statSync(source).isDirectory()) {
        const destinationScope = path.join(destinationRoot, entry.name)
        fs.mkdirSync(destinationScope, {recursive: true})
        for (const scoped of fs.readdirSync(source)) {
          linkResolved(path.join(source, scoped), path.join(destinationScope, scoped), validationRoot, linked)
        }
      } else {
        linkResolved(source, path.join(destinationRoot, entry.name), validationRoot, linked)
      }
    }
  }
  return Object.freeze(linked)
}

module.exports = {linkWorkspaceDependencies}
