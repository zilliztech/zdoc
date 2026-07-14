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

function cleanupRemovedIncrementalRecords({
  plan,
  docSourceDir,
  targetOutputDir,
  cwd = process.cwd(),
  determineFilePath = null,
}) {
  const root = path.resolve(cwd);
  const sourceRoot = path.resolve(docSourceDir);
  const outputRoot = path.resolve(targetOutputDir);
  if (!isInsideOrEqual(root, sourceRoot) || !isInsideOrEqual(root, outputRoot)) {
    throw new Error('Incremental reconciliation directories must stay inside the workspace');
  }

  const removedSources = [];
  const removedOutputs = [];
  for (const record of plan?.removed_records || []) {
    const sourceCandidates = [
      record.source_file,
      record.doc_token ? `${record.doc_token}.json` : null,
      record.node_token ? `${record.node_token}.json` : null,
      record.origin_node_token ? `${record.origin_node_token}.json` : null,
      record.obj_token ? `${record.obj_token}.json` : null,
    ].map(safeSourceFileName).filter(Boolean);

    for (const fileName of new Set(sourceCandidates)) {
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
