import {spawnSync} from 'node:child_process';
import {readdirSync, readFileSync} from 'node:fs';
import {builtinModules} from 'node:module';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import ts from 'typescript';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const packageRoot = path.join(repositoryRoot, 'packages/docs-tooling');

function sourceFiles(root: string): string[] {
  return readdirSync(root, {withFileTypes: true}).flatMap(entry => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    if (!entry.isFile() || !/\.(?:js|ts)$/.test(entry.name)) return [];
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

const sourceRoot = path.join(packageRoot, 'src');

function isTestSupport(file: string): boolean {
  const relative = path.relative(sourceRoot, file).split(path.sep).join('/');
  return /\.test\.(?:js|ts)$/.test(relative)
    || relative.startsWith('shared-docs/testing/')
    || relative === 'shared-docs/adapters/contract/suites.ts';
}

function literalModuleReferences(file: string, source: string): string[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const references = new Set<string>();
  const add = (node: ts.Node | undefined) => {
    if (node && ts.isStringLiteralLike(node)) references.add(node.text);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      add(node.moduleReference.expression);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node.argument.literal);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return [...references].sort();
}

// Resolve only the relative/absolute literal paths and JS/TS/index forms used
// by these sources. This is not a computed-import or package-exports resolver.
function localSource(file: string, specifier: string, files: ReadonlySet<string>): string | undefined {
  if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) return undefined;
  const target = path.resolve(path.dirname(file), specifier);
  const extension = path.extname(target);
  const candidates = extension === '.js' ? [target, target.slice(0, -3) + '.ts']
    : extension === '.ts' ? [target]
      : [target, target + '.ts', target + '.js', path.join(target, 'index.ts'), path.join(target, 'index.js')];
  return candidates.find(candidate => files.has(candidate));
}

function runtimeImportViolations(file: string, source: string, files: ReadonlySet<string>, declared: ReadonlySet<string>) {
  const undeclared = new Set<string>();
  const testSupportImports: string[] = [];
  for (const specifier of literalModuleReferences(file, source)) {
    const dependency = packageName(specifier);
    if (dependency && !declared.has(dependency)) undeclared.add(dependency);
    const target = localSource(file, specifier, files);
    if (target && isTestSupport(target)) testSupportImports.push(`${specifier} -> ${path.relative(sourceRoot, target)}`);
  }
  return {undeclared: [...undeclared].sort(), testSupportImports: testSupportImports.sort()};
}

describe('docs-tooling runtime contract', () => {
  it('extracts real literal imports, reexports, import-equals and type imports', () => {
    expect(literalModuleReferences('runtime.ts', `
      import value from 'static-package';
      import "side-effect-package";
      import type {Type} from 'type-package';
      export {value} from "reexport-package";
      export * from 'export-all-package';
      import legacy = require('import-equals-package');
      const required = require("required-package/subpath");
      const dynamic = import('dynamic-package', {with: {type: 'json'}});
      type Imported = import('import-type-package').Value;
      const computed = import(variable);
    `)).toEqual([
      'dynamic-package', 'export-all-package', 'import-equals-package', 'import-type-package',
      'reexport-package', 'required-package/subpath', 'side-effect-package', 'static-package', 'type-package',
    ]);
  });

  it('ignores regex literals, comments and generated-code text without hiding template expressions', () => {
    const source = [
      String.raw`const match = /^import (Admonition|Tabs|TabItem) from '@theme\/\1';$/.exec(line);`,
      `const single = 'import "not-a-package"';`,
      `const double = "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';";`,
      '`const generated = "import(\'not-executed\')"`;',
      '// import hidden from "comment-package";',
      '/* require("comment-require") */',
      'const template = `generated import("text-only") ${import("executed-expression")}`;',
    ].join('\n');
    expect(literalModuleReferences('runtime.ts', source)).toEqual(['executed-expression']);
  });

  it('rejects undeclared packages and runtime Vitest while retaining builtin and alias handling', () => {
    const file = path.join(sourceRoot, 'ordinary-runtime.ts');
    const result = runtimeImportViolations(file, `
      import {describe} from 'vitest';
      import type {Missing} from 'undeclared-package';
      const declared = require('@zilliz/mdtomd/blocks.js');
      import fs from 'node:fs';
      import path from 'path';
      import view from '@theme/Admonition';
      import site from '@site/config';
    `, new Set([file]), new Set(['@zilliz/mdtomd']));
    expect(result).toEqual({undeclared: ['undeclared-package', 'vitest'], testSupportImports: []});
  });

  it('classifies only explicit test support and test suffixes, keeping other contract files in runtime coverage', () => {
    for (const file of ['shared-docs/testing/reader-fixture.ts', 'shared-docs/testing/merge/helpers.ts',
      'shared-docs/adapters/contract/suites.ts', 'ordinary.test.ts', 'nested/ordinary.test.js']) {
      expect(isTestSupport(path.join(sourceRoot, file)), file).toBe(true);
    }
    for (const file of ['shared-docs/adapters/contract/index.ts', 'shared-docs/adapters/contract/suites-extra.ts',
      'shared-docs/core/merge/index.ts', 'shared-docs/testing-extra/runtime.ts', 'ordinary-runtime.ts']) {
      expect(isTestSupport(path.join(sourceRoot, file)), file).toBe(false);
    }
  });

  it('rejects runtime edges to excluded support and tests using literal extension and index forms', () => {
    const file = path.join(sourceRoot, 'ordinary-runtime.ts');
    const files = new Set(['ordinary-runtime.ts', 'shared-docs/testing/helper.ts', 'shared-docs/testing/index.ts',
      'shared-docs/adapters/contract/suites.ts', 'nested/ordinary.test.ts', 'ordinary.ts', 'folder/index.js']
      .map(relative => path.join(sourceRoot, relative)));
    const result = runtimeImportViolations(file, `
      import {helper} from './shared-docs/testing/helper';
      export * from './shared-docs/testing/index.js';
      const suites = require('./shared-docs/adapters/contract/suites.ts');
      const test = import('./nested/ordinary.test');
      import './shared-docs/testing';
      export {ordinary} from './ordinary';
      import './folder';
    `, files, new Set());
    expect(result).toEqual({undeclared: [], testSupportImports: [
      './nested/ordinary.test -> nested/ordinary.test.ts',
      './shared-docs/adapters/contract/suites.ts -> shared-docs/adapters/contract/suites.ts',
      './shared-docs/testing -> shared-docs/testing/index.ts',
      './shared-docs/testing/helper -> shared-docs/testing/helper.ts',
      './shared-docs/testing/index.js -> shared-docs/testing/index.ts',
    ]});
  });

  it('points the root docs-tooling command at the executable composition root', () => {
    const rootManifest = JSON.parse(readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(rootManifest.scripts?.['docs-tooling']).toBe('node scripts/docs-tooling.js');
  });

  it('keeps the report-card entrypoint compatible with Node 22.6 type stripping', () => {
    const source = readFileSync(path.join(packageRoot, 'src/reporting/lark.ts'), 'utf8');
    expect(source).not.toMatch(/export function executeReportCard\([\s\S]*?\): Promise<[^;\n]+>;/u);
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
      '@zilliz/mdtomd',
      '@zilliz/publication-adapters',
      '@zilliz/site-config',
      'ajv',
      'ali-oss',
      'bottleneck',
      'cheerio',
      'commander',
      'dotenv',
      'fast-xml-parser',
      'inquirer',
      'js-yaml',
      'katex',
      'lodash',
      'markdown-it',
      'node-fetch',
      'nunjucks',
      'remark-math',
      'sharp',
      'slugify',
      'typescript',
      'zod',
    ]);
    expect(manifest.engines?.node).toBe('>=22.6.0');
  });

  it('declares every statically or dynamically imported runtime package', () => {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const files = new Set(sourceFiles(sourceRoot));
    const declared = new Set(Object.keys(manifest.dependencies ?? {}));
    for (const file of files) {
      if (isTestSupport(file)) continue;
      const violations = runtimeImportViolations(file, readFileSync(file, 'utf8'), files, declared);
      expect(violations, path.relative(sourceRoot, file)).toEqual({undeclared: [], testSupportImports: []});
    }
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
