import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {validateTranslationCoverage} from './validate.ts';

function write(repositoryRoot: string, relativePath: string, contents: string): void {
  const absolutePath = path.join(repositoryRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, contents);
}

describe('translation coverage validation', () => {
  it('validates only candidates owned by the requested publication group', () => {
    const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'translation-coverage-'));
    const restSource = 'content/en/reference/api/restful/restful/restful.md';
    const restTarget = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/restful.md';
    const goSource = 'content/en/reference/api/go/go/v2/client.md';
    const restContents = '# REST\n';

    write(repositoryRoot, restSource, restContents);
    write(repositoryRoot, restTarget, '# REST Japanese\n');
    write(repositoryRoot, goSource, '# Go\n');
    write(repositoryRoot, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {
      [restSource]: {
        sourceHash: createHash('sha256').update(restContents).digest('hex'),
        targetPath: restTarget,
      },
    }})}\n`);

    expect(() => validateTranslationCoverage({repositoryRoot, targetId: 'ja-JP', group: 'rest'})).not.toThrow();
    expect(() => validateTranslationCoverage({repositoryRoot, targetId: 'ja-JP', group: 'go'}))
      .toThrow(/ja-JP\/go.*content\/en\/reference\/api\/go/u);
  });
});
