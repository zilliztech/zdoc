import {readFile} from 'node:fs/promises';

import {describe, expect, it} from 'vitest';

import {CLI_VERSION, SCHEMA_VERSION} from '../src/cli/program.js';

describe('0.2.1 release contract', () => {
  it('pins package, CLI, Skill, Engine, registry, and artifact identities together', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      version: string;
      files: string[];
      dependencies: Record<string, string>;
    };
    const compatibility = JSON.parse(await readFile(new URL('../../../skills/zdoc-localization/references/compatibility.json', import.meta.url), 'utf8')) as {
      skillVersion: string;
      cliRange: string;
    };
    const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
    const checklist = await readFile(new URL('../../../docs/superpowers/plans/2026-07-30-zdoc-localize-0.2.1-release-checklist.md', import.meta.url), 'utf8');
    const artifactVerifier = await readFile(new URL('../../../scripts/verify-zdoc-localize-release-artifacts.mjs', import.meta.url), 'utf8');

    expect({packageVersion: packageJson.version, cliVersion: CLI_VERSION, schemaVersion: SCHEMA_VERSION}).toEqual({
      packageVersion: '0.2.1', cliVersion: '0.2.1', schemaVersion: 1,
    });
    expect(packageJson.dependencies['feishu-docx-engine']).toBe('0.2.1');
    expect(packageJson.files).toContain('CHANGELOG.md');
    expect(compatibility).toMatchObject({skillVersion: '1.2.0', cliRange: '>=0.2.1 <0.3.0'});
    expect(changelog).toContain('## [0.2.1] - 2026-07-30');
    for (const value of [
      'sha512-wycMsyTiJSzZBDV8Ze0iYmHpt933lU279/0Ab9T4evHxDIYdZlX56Ika3A08mLmfClQdRTQFPzss3tC55iWg1A==',
      '792285b9e93a2f1459c8c18e532b5a5a1e395a9fa6f0769419b4e3544899a657',
      '46e2f24e19e8edda1ac8d75351bf24abfdbe6ba0a1a942c4b288a085bb0ee11a',
      'cc4f433b8ef732be7d740db12239331d8f5e34c11de1aff3604660d73d4baad6',
      'lark-cli version 1.0.73',
    ]) expect(checklist).toContain(value);
    expect(checklist).toContain('node scripts/verify-zdoc-localize-release-artifacts.mjs');
    expect(artifactVerifier).toContain("node: 'v24.15.0'");
    expect(artifactVerifier).toContain("pnpm: '10.11.0'");
    expect(artifactVerifier).toContain("npm: '11.18.0'");
    expect(artifactVerifier).toContain("packageVersion: '0.2.1'");
    expect(artifactVerifier).toContain('Independent release packs are not byte-identical.');
  });
});
