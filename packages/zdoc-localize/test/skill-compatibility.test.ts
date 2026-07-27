import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

const checker = fileURLToPath(new URL('../../../scripts/check-zdoc-localize-skill-compat.mjs', import.meta.url));

describe('Codex Skill compatibility', () => {
  it('matches the packaged CLI version and command surface', () => {
    const report = JSON.parse(execFileSync(process.execPath, [checker], {encoding: 'utf8'})) as {
      compatible: boolean;
      missingCommands: string[];
      missingFeatures: string[];
      missingSkillFeatures: string[];
      unsafeRoutes: string[];
      cliVersion: string;
      acceptedRange: string;
    };

    expect(report).toEqual({
      compatible: true,
      missingCommands: [],
      missingFeatures: [],
      missingSkillFeatures: [],
      unsafeRoutes: [],
      cliVersion: '0.1.1',
      acceptedRange: '>=0.1.0 <0.2.0',
    });
  });
});
