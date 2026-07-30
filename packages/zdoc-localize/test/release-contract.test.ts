import {readFile} from 'node:fs/promises';

import {describe, expect, it} from 'vitest';

import {CLI_VERSION, SCHEMA_VERSION} from '../src/cli/program.js';

describe('0.2.0 release contract', () => {
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
    const checklist = await readFile(new URL('../../../docs/superpowers/plans/2026-07-20-zdoc-localize-engine-release-checklist.md', import.meta.url), 'utf8');
    const artifactVerifier = await readFile(new URL('../../../scripts/verify-zdoc-localize-release-artifacts.mjs', import.meta.url), 'utf8');

    expect({packageVersion: packageJson.version, cliVersion: CLI_VERSION, schemaVersion: SCHEMA_VERSION}).toEqual({
      packageVersion: '0.2.0', cliVersion: '0.2.0', schemaVersion: 1,
    });
    expect(packageJson.dependencies['feishu-docx-engine']).toBe('0.2.1');
    expect(packageJson.files).toContain('CHANGELOG.md');
    expect(compatibility).toMatchObject({skillVersion: '1.1.0', cliRange: '>=0.2.0 <0.3.0'});
    expect(changelog).toContain('## [0.2.0] - 2026-07-27');
    for (const value of [
      'sha512-gwPzPTPj2/uZqo+pft9Az5hUb+66Aapg/9dP/IB7MTScALtKpGtcSzPRDRUUUbPpQcNDHgBYF6s85D2Ao0R2iQ==',
      '792285b9e93a2f1459c8c18e532b5a5a1e395a9fa6f0769419b4e3544899a657',
      '74d66198476bb69dfcb78398bcabe381e8593b2d46d8f33af2bf915368ff475c',
      'd5d6b46f8eb1fd96a0f2ca515d3760d45079b7d6d6ea9796b02f0ce29c004f53',
      'lark-cli version 1.0.73',
    ]) expect(checklist).toContain(value);
    expect(checklist).toContain('node scripts/verify-zdoc-localize-release-artifacts.mjs');
    expect(artifactVerifier).toContain("node: 'v24.15.0'");
    expect(artifactVerifier).toContain("pnpm: '10.11.0'");
    expect(artifactVerifier).toContain("npm: '11.18.0'");
    expect(artifactVerifier).toContain('Independent release packs are not byte-identical.');
  });
});
