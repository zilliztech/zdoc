import {spawnSync} from 'node:child_process';
import {readdirSync, readFileSync} from 'node:fs';
import {builtinModules} from 'node:module';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const packageRoot = path.join(repositoryRoot, 'packages/docs-tooling');

function runtimeSourceFiles(root: string): string[] {
  return readdirSync(root, {withFileTypes: true}).flatMap(entry => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return runtimeSourceFiles(absolute);
    if (!entry.isFile() || !/\.(?:js|ts)$/.test(entry.name) || /\.test\.(?:js|ts)$/.test(entry.name)) return [];
    return [absolute];
  });
}

function packageName(specifier: string): string | null {
  if (specifier.includes('${') || specifier.startsWith('@site/') || specifier.startsWith('@theme/')) return null;
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) return null;
  if (builtinModules.includes(specifier) || builtinModules.includes(specifier.replace(/^node:/, ''))) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

describe('docs-tooling runtime contract', () => {
  it('points the root docs-tooling command at the executable composition root', () => {
    const rootManifest = JSON.parse(readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(rootManifest.scripts?.['docs-tooling']).toBe('node scripts/docs-tooling.js');
  });

  it('declares every direct runtime package in the owning workspace package', () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      engines?: {node?: string};
    };
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual([
      '@aws-sdk/client-s3',
      '@mdx-js/mdx',
      '@smithy/node-http-handler',
      '@zilliz/publication-adapters',
      '@zilliz/site-config',
      'ali-oss',
      'bottleneck',
      'cheerio',
      'commander',
      'dotenv',
      'fast-xml-parser',
      'inquirer',
      'js-yaml',
      'lodash',
      'node-fetch',
      'nunjucks',
      'remark-math',
      'sharp',
      'showdown',
      'slugify',
      'zod',
    ]);
    expect(manifest.engines?.node).toBe('>=22.6.0');
  });

  it('declares every statically or dynamically imported runtime package', () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const imports = new Set<string>();
    const patterns = [
      /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /\bfrom\s+['"]([^'"]+)['"]/g,
      /^\s*import\s+['"]([^'"]+)['"]/gm,
    ];
    for (const file of runtimeSourceFiles(path.join(packageRoot, 'src'))) {
      const source = readFileSync(file, 'utf8');
      for (const pattern of patterns) {
        for (const match of source.matchAll(pattern)) {
          const dependency = packageName(match[1]);
          if (dependency) imports.add(dependency);
        }
      }
    }
    const declared = new Set(Object.keys(manifest.dependencies ?? {}));
    expect([...imports].filter(dependency => !declared.has(dependency)).sort()).toEqual([]);
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
