'use strict';

const fs = require('node:fs');
const path = require('node:path');

function isInsideOrEqual(parent, candidate) {
  return candidate === parent || candidate.startsWith(`${parent}${path.sep}`);
}

function removeEmptyDirs(directory, root = directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirs(path.join(directory, entry.name), root);
  }
  if (directory !== root && fs.existsSync(directory) && fs.readdirSync(directory).length === 0) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function safeSourceFileName(value) {
  return typeof value === 'string' && value !== '' && path.basename(value) === value ? value : null;
}

function drivePlacementAncestryTokens(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) return new Set();
  const structuralTokens = new Set();
  const referencedTokens = new Set();
  for (const file of fs.readdirSync(sourceRoot).filter(file => file.endsWith('.json')).sort()) {
    let source;
    try {
      source = JSON.parse(fs.readFileSync(path.join(sourceRoot, file), 'utf8'));
    } catch (error) {
      throw new Error(`Cannot parse incremental Drive source ${file}: ${error.message}`, { cause: error });
    }
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
    if (typeof source.token === 'string' && source.token && (source.type === 'folder' || Array.isArray(source.children))) {
      structuralTokens.add(source.token);
    }
    if (typeof source.parent_token === 'string' && source.parent_token) referencedTokens.add(source.parent_token);
    for (const child of Array.isArray(source.children) ? source.children : []) {
      if (typeof child?.token === 'string' && child.token) referencedTokens.add(child.token);
    }
  }
  return new Set([...structuralTokens].filter(token => referencedTokens.has(token)));
}

function cleanupRemovedIncrementalRecords({
  plan,
  docSourceDir,
  targetOutputDir,
  cwd = process.cwd(),
  determineFilePath = null,
  preservePlacementAncestry = false,
}) {
  const root = path.resolve(cwd);
  const sourceRoot = path.resolve(docSourceDir);
  const outputRoot = path.resolve(targetOutputDir);
  if (!isInsideOrEqual(root, sourceRoot) || !isInsideOrEqual(root, outputRoot)) {
    throw new Error('Incremental reconciliation directories must stay inside the workspace');
  }

  const removedSources = [];
  const removedOutputs = [];
  const placementAncestryTokens = preservePlacementAncestry ? drivePlacementAncestryTokens(sourceRoot) : new Set();
  for (const record of plan?.removed_records || []) {
    const recordTokens = [record.doc_token, record.node_token, record.origin_node_token, record.obj_token].filter(Boolean);
    const preserveSource = recordTokens.some(token => placementAncestryTokens.has(token));
    const sourceCandidates = [
      record.source_file,
      record.doc_token ? `${record.doc_token}.json` : null,
      record.node_token ? `${record.node_token}.json` : null,
      record.origin_node_token ? `${record.origin_node_token}.json` : null,
      record.obj_token ? `${record.obj_token}.json` : null,
    ].map(safeSourceFileName).filter(Boolean);

    for (const fileName of new Set(sourceCandidates)) {
      if (preserveSource) continue;
      const sourcePath = path.join(sourceRoot, fileName);
      if (!fs.existsSync(sourcePath)) continue;
      fs.rmSync(sourcePath, { force: true });
      removedSources.push(path.relative(root, sourcePath).split(path.sep).join('/'));
    }

    const recordedOutputs = record.output_paths || [];
    if (recordedOutputs.length > 0) {
      for (const relativePath of recordedOutputs) {
        const outputPath = path.resolve(root, ...String(relativePath).split('/'));
        if (!isInsideOrEqual(outputRoot, outputPath)) {
          throw new Error(`Snapshot output path is outside selected output directory: ${relativePath}`);
        }
        if (!fs.existsSync(outputPath)) continue;
        fs.rmSync(outputPath, { force: true });
        removedOutputs.push(path.relative(root, outputPath).split(path.sep).join('/'));
      }
    } else if (record.doc_token && determineFilePath && fs.existsSync(outputRoot)) {
      try {
        const relativePath = determineFilePath(record.doc_token, outputRoot);
        const outputPath = path.resolve(outputRoot, relativePath);
        if (!isInsideOrEqual(outputRoot, outputPath)) throw new Error('Token lookup escaped output directory');
        if (fs.existsSync(outputPath)) {
          fs.rmSync(outputPath, { force: true });
          removedOutputs.push(path.relative(root, outputPath).split(path.sep).join('/'));
        }
      } catch (error) {
        if (!/Cannot find file for token/.test(error.message)) throw error;
      }
    }
  }

  removeEmptyDirs(outputRoot);
  return {
    removedSources: [...new Set(removedSources)].sort(),
    removedOutputs: [...new Set(removedOutputs)].sort(),
  };
}

module.exports = { cleanupRemovedIncrementalRecords, removeEmptyDirs };
