#!/usr/bin/env node
'use strict';

const { changedPaths, isDevOwned, loadContract } = require('./master-tooling-sync.js');

const SHA = /^[0-9a-f]{40}$/;

function devOwnedChanges(cwd, base, head, contract) {
  return changedPaths(cwd, base, head).filter((relativePath) => isDevOwned(relativePath, contract));
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) {
      throw new Error('Usage: ownership-gate.js --base <sha> --head <sha> [--contract <path>]');
    }
    const key = flag.slice(2);
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate option: ${flag}`);
    values[key] = value;
  }
  return values;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!SHA.test(args.base || '')) throw new Error('--base must be an exact lowercase 40-character SHA');
  if (!SHA.test(args.head || '')) throw new Error('--head must be an exact lowercase 40-character SHA');

  const cwd = process.cwd();
  const contract = args.contract
    ? loadContract({ cwd, contractPath: args.contract })
    : loadContract({ cwd });

  const forbidden = devOwnedChanges(cwd, args.base, args.head, contract);
  if (forbidden.length > 0) {
    throw new Error(`Changes modify dev-owned paths: ${forbidden.join(', ')}`);
  }
  process.stdout.write(`Ownership gate passed: ${changedPaths(cwd, args.base, args.head).length} changed path(s), none dev-owned.\n`);
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`Ownership gate failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { devOwnedChanges };
