'use strict';

function resolveTarget(targets, targetName) {
  return targetName.split('.').reduce((value, key) => value?.[key], targets);
}

function outputDirsForTargets(manual, targetNames) {
  return [...new Set((targetNames || []).map((targetName) => {
    const target = resolveTarget(manual.targets, targetName);
    if (!target) throw new Error(`Unknown snapshot target: ${targetName}`);
    if (typeof target.outputDir !== 'string' || !target.outputDir) {
      throw new Error(`Snapshot target ${targetName} has no output directory`);
    }
    return target.outputDir.replace(/^\.\//, '');
  }))];
}

module.exports = { outputDirsForTargets, resolveTarget };
