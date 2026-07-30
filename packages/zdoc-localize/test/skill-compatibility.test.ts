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
      missingEngineCapabilities: string[];
      unsafeRoutes: string[];
      contractMismatches: string[];
      cliVersion: string;
      declaredCliVersion: string;
      skillVersion: string;
      declaredSkillVersion: string;
      acceptedRange: string;
      declaredRange: string;
      engineVersion: string;
    };

    expect(report).toEqual({
      compatible: true,
      missingCommands: [],
      missingFeatures: [],
      missingSkillFeatures: [],
      missingEngineCapabilities: [],
      unsafeRoutes: [],
      contractMismatches: [],
      cliVersion: '0.2.1',
      declaredCliVersion: '0.2.1',
      skillVersion: '1.2.0',
      declaredSkillVersion: '1.2.0',
      acceptedRange: '>=0.2.1 <0.3.0',
      declaredRange: '>=0.2.1 <0.3.0',
      engineVersion: '0.2.1',
    });
  });
});
