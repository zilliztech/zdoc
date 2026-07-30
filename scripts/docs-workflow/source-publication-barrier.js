#!/usr/bin/env node
'use strict';

const GROUPS = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);
const ACCEPTABLE_STATUSES = new Set(['published', 'no_changes']);

function verifySourcePublicationBarrier({ selectedGroup, results, statuses }) {
  if (selectedGroup !== 'all' && !GROUPS.includes(selectedGroup)) throw new Error(`Invalid selected source group: ${selectedGroup}`);
  const required = selectedGroup === 'all' ? GROUPS : [selectedGroup];
  const failures = [];
  for (const group of required) {
    if (results?.[group] !== 'success') failures.push(`${group}=${results?.[group] || 'missing'}`);
    else if (!ACCEPTABLE_STATUSES.has(statuses?.[group])) failures.push(`${group}=${statuses?.[group] || 'missing'}`);
  }
  if (failures.length) throw new Error(`Source publication barrier rejected paid translation: ${failures.join(', ')}`);
  return true;
}

function main() {
  const upper = group => group.toUpperCase().replaceAll('-', '_');
  verifySourcePublicationBarrier({
    selectedGroup: process.env.SELECTED_GROUP,
    results: Object.fromEntries(GROUPS.map(group => [group, process.env[`${upper(group)}_RESULT`]])),
    statuses: Object.fromEntries(GROUPS.map(group => [group, process.env[`${upper(group)}_STATUS`]])),
  });
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { GROUPS, verifySourcePublicationBarrier };
