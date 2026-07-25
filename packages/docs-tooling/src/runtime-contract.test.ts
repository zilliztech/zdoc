import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const packageRoot = path.join(repositoryRoot, 'packages/docs-tooling');

describe('docs-tooling runtime contract', () => {
  it('declares every direct runtime package in the owning workspace package', () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      engines?: {node?: string};
    };
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual([
      '@aws-sdk/client-s3',
      '@smithy/node-http-handler',
      'bottleneck',
      'cheerio',
      'commander',
      'dotenv',
      'inquirer',
      'js-yaml',
      'lodash',
      'node-fetch',
      'nunjucks',
      'sharp',
      'showdown',
      'slugify',
      'zod',
    ]);
    expect(manifest.engines?.node).toBe('>=22.6.0');
  });

  it('loads moved generator boundaries without resolving packages from the user home node_modules', () => {
    const probe = String.raw`
      const Module = require('node:module');
      const path = require('node:path');
      const packageRoot = process.argv[1];
      const forbidden = path.join(require('node:os').homedir(), 'node_modules') + path.sep;
      const original = Module._resolveFilename;
      Module._resolveFilename = function(request, parent, isMain, options) {
        const resolved = original.call(this, request, parent, isMain, options);
        if (typeof resolved === 'string' && resolved.startsWith(forbidden)) {
          throw new Error('forbidden home dependency resolution: ' + request + ' -> ' + resolved);
        }
        return resolved;
      };
      require(path.join(packageRoot, 'src/lark/cli.js'));
      require(path.join(packageRoot, 'src/reference/rest/index.js'));
    `;
    const result = spawnSync(process.execPath, ['-e', probe, packageRoot], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: {...process.env, NODE_PATH: ''},
    });
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });
});
