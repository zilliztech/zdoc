import {chmodSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {scanIntegrity as scanSharedIntegrity} from './integrity.mjs';
import {scanIntegrity as scanMigrationIntegrity} from '../../../../scripts/migration/integrity.mjs';

function parityFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-integrity-parity-'));
  mkdirSync(path.join(root, 'docs/sub'), {recursive: true});
  writeFileSync(path.join(root, 'Readme.md'), 'one\n');
  writeFileSync(path.join(root, 'README.md'), 'two\n');
  writeFileSync(path.join(root, 'docs/caf\u00e9.md'), 'nfc\n');
  writeFileSync(path.join(root, 'docs/cafe\u0301.md'), 'nfd\n');
  writeFileSync(path.join(root, 'docs/sub/unsafe.mdx'), '[escape](../../.env)\n');
  writeFileSync(path.join(root, '.env.production'), 'placeholder\n');
  writeFileSync(path.join(root, 'docs/token.txt'), 'ghp_123456789012345678901234567890123456\n');
  writeFileSync(path.join(root, 'docs/key.pem'), '-----BEGIN PRIVATE KEY-----\nplaceholder\n');
  writeFileSync(path.join(root, 'docs/crlf.txt'), 'line\r\n');
  writeFileSync(path.join(root, 'docs/run.js'), 'console.log(1)\n');
  chmodSync(path.join(root, 'docs/run.js'), 0o755);
  writeFileSync(path.join(root, 'docs/large.bin'), Buffer.alloc(2048));
  symlinkSync('token.txt', path.join(root, 'docs/link'));
  return root;
}

describe('shared integrity core parity', () => {
  it('returns the same findings and policy through the migration wrapper', async () => {
    const root = parityFixture();
    const options = {
      repository: 'zdoc',
      maxFileSize: 1024,
      contentRoots: ['docs'],
      allowedRoutePrefixes: ['/docs'],
      allowedExactRoutes: ['/'],
    };

    expect(await scanMigrationIntegrity(root, options)).toEqual(await scanSharedIntegrity(root, options));
  });
});
