#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

const GROUPS = Object.freeze({
  'ja-JP': Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']),
  'zh-CN': Object.freeze(['python', 'java', 'node', 'go', 'cli', 'rest', 'tools']),
});

function selectionItem(locale, group, order) {
  return {
    locale,
    target: locale === 'ja-JP' ? 'ja-JP' : group === 'tools' ? 'zh-CN-tools' : 'zh-CN-reference',
    group,
    sourceGroup: group === 'tools' ? 'guides' : group,
    order,
  };
}

function buildTranslationSelection({locale, group}) {
  const locales = locale === 'all' ? ['ja-JP', 'zh-CN'] : [locale];
  if (locales.some(value => !Object.hasOwn(GROUPS, value))) throw new Error(`Unsupported translation locale: ${locale}`);
  const selected = [];
  for (const selectedLocale of locales) {
    const groups = group === 'all' ? GROUPS[selectedLocale] : [group];
    for (const selectedGroup of groups) {
      if (!GROUPS[selectedLocale].includes(selectedGroup)) throw new Error(`Unsupported translation selection: ${selectedLocale}/${selectedGroup}`);
      selected.push(selectionItem(selectedLocale, selectedGroup, selected.length));
    }
  }
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
