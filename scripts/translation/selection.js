#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const {loadTypeScript} = require('../lib/load-typescript');

// The canonical translation group set is the registry's publication groups,
// so a new manual only needs its groupOrder set in the registry to enter the
// translation pipeline (instead of hand-editing this list).
const {sourcePublicationGroups} = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts');
const GROUPS = sourcePublicationGroups();

function selectionItem(locale, group, order) {
  return {
    locale,
    target: locale === 'ja-JP' ? 'ja-JP' : 'zh-CN-reference',
    group,
    sourceGroup: group,
    order,
    publicationOrder: order,
  };
}

function targetsFor(group, locale) {
  if (locale === 'ja-JP') return group === 'reference-landings' ? [] : ['ja-JP'];
  if (locale === 'zh-CN') {
    if (group === 'reference-landings') return ['zh-CN'];
    if (group === 'rest') return [];
    return group === 'guides' ? [] : ['zh-CN'];
  }
  if (locale === 'all') {
    if (group === 'reference-landings') return [];
    if (group === 'rest') return ['ja-JP'];
    return group === 'guides' ? ['ja-JP'] : ['ja-JP', 'zh-CN'];
  }
  throw new Error(`Unsupported translation locale: ${locale}`);
}

function buildTranslationSelection({locale, group}) {
  if (!['all', 'ja-JP', 'zh-CN'].includes(locale)) throw new Error(`Unsupported translation locale: ${locale}`);
  if (group === 'reference-landings' && locale !== 'zh-CN') {
    throw new Error(`Unsupported translation selection: ${locale}/${group}`);
  }
  if (group !== 'all' && group !== 'reference-landings' && !GROUPS.includes(group)) {
    throw new Error(`Unsupported translation selection: ${locale}/${group}`);
  }

  const selected = [];
  const groups = group === 'all' ? GROUPS : [group];
  for (const selectedGroup of groups) {
    for (const selectedLocale of targetsFor(selectedGroup, locale)) {
      selected.push(selectionItem(selectedLocale, selectedGroup, selected.length));
    }
  }
  if (selected.length === 0) throw new Error(`Unsupported translation selection: ${locale}/${group}`);
  return selected;
}

function main() {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
  const selection = buildTranslationSelection({locale: args.get('--locale'), group: args.get('--group')});
  const output = args.get('--output');
  const value = `${JSON.stringify({include: selection})}\n`;
  if (output) fs.writeFileSync(output, value, 'utf8');
  else process.stdout.write(value);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = {buildTranslationSelection};
