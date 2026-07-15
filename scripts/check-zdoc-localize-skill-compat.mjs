import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'packages/zdoc-localize/package.json'), 'utf8'));
const compatibility = JSON.parse(await readFile(resolve(root, 'skills/zdoc-localization/references/compatibility.json'), 'utf8'));
const skill = await readFile(resolve(root, 'skills/zdoc-localization/SKILL.md'), 'utf8');
const program = await readFile(resolve(root, 'packages/zdoc-localize/src/cli/program.ts'), 'utf8');

function versionTuple(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (!match) throw new Error(`Invalid semantic version: ${value}`);
  return match.slice(1).map(Number);
}

function inInitialRange(version, range) {
  const [major, minor] = versionTuple(version);
  const lower = />=(\d+\.\d+\.\d+)/.exec(range)?.[1];
  const upper = /<(\d+\.\d+\.\d+)/.exec(range)?.[1];
  if (!lower || !upper) return false;
  const [lowerMajor, lowerMinor] = versionTuple(lower);
  const [upperMajor, upperMinor] = versionTuple(upper);
  return major === lowerMajor && minor >= lowerMinor && (major < upperMajor || minor < upperMinor);
}

const missingCommands = compatibility.requiredCommands.filter((command) =>
  !program.includes(`'${command}'`) && !program.includes(`"${command}"`),
);
const missingFeatures = compatibility.requiredFeatures.filter((feature) => !program.includes(`'${feature}'`));
const safetyStatements = [
  'Never run a write without explicit document-level approval',
  'Never retry `confirmation_required` with a confirmation flag automatically',
];
const unsafeRoutes = safetyStatements.filter((statement) => !skill.includes(statement));
const compatible = inInitialRange(packageJson.version, compatibility.cliRange)
  && missingCommands.length === 0
  && missingFeatures.length === 0
  && unsafeRoutes.length === 0;

process.stdout.write(`${JSON.stringify({
  compatible,
  missingCommands,
  missingFeatures,
  unsafeRoutes,
  cliVersion: packageJson.version,
  acceptedRange: compatibility.cliRange,
})}\n`);
