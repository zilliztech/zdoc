import {describe, expect, it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {manualRegistry} from '../registry';
import {generateLarkDocsConfig} from './larkConfig';

describe('generateLarkDocsConfig', () => {
  it('produces a committed config that is byte-identical to the registry source of truth', () => {
    const repositoryRoot = path.resolve(process.cwd());
    const committedPath = path.join(repositoryRoot, 'config/lark-docs.config.ts');
    const committed = fs.readFileSync(committedPath, 'utf8');
    const generated = generateLarkDocsConfig(manualRegistry);
    expect(generated).toBe(committed);
  });

  it('does not emit retired javaV1 or gov1 manuals', () => {
    const generated = generateLarkDocsConfig(manualRegistry);
    expect(generated).not.toMatch(/javaV1/);
    expect(generated).not.toMatch(/gov1\b/);
  });

  it('does not emit the retired milvus target', () => {
    const generated = generateLarkDocsConfig(manualRegistry);
    expect(generated).not.toMatch(/milvus:/);
  });
});
