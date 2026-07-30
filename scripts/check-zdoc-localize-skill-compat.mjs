import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'packages/zdoc-localize/package.json'), 'utf8'));
const compatibility = JSON.parse(await readFile(resolve(root, 'skills/zdoc-localization/references/compatibility.json'), 'utf8'));
const skill = await readFile(resolve(root, 'skills/zdoc-localization/SKILL.md'), 'utf8');
const workflow = await readFile(resolve(root, 'skills/zdoc-localization/references/workflow.md'), 'utf8');
const errors = await readFile(resolve(root, 'skills/zdoc-localization/references/errors.md'), 'utf8');
const program = await readFile(resolve(root, 'packages/zdoc-localize/src/cli/program.ts'), 'utf8');
const engine = await import(pathToFileURL(resolve(
  root, 'packages/zdoc-localize/node_modules/feishu-docx-engine/dist/index.js',
)).href);
const declaredCliVersion = /export const CLI_VERSION = ['"]([^'"]+)['"]/.exec(program)?.[1];
const skillDeclaration = /Skill version: `([^`]+)`\. Compatible CLI: `([^`]+)`\./.exec(skill);
const declaredSkillVersion = skillDeclaration?.[1];
const declaredRange = skillDeclaration?.[2];

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
const missingSkillFeatures = compatibility.requiredSkillFeatures.filter((feature) => !skill.includes(`\`${feature}\``));
const missingEngineCapabilities = compatibility.requiredEngineCapabilities.filter(
  (capability) => !engine.ENGINE_CAPABILITIES.includes(capability),
);
const safetyStatements = [
  'Never run a write without explicit document-level approval',
  'Never retry `confirmation_required` with a confirmation flag automatically',
];
const workflowContracts = [
  ['remote-baseline', skill, 'Remote English and remote Chinese are the localization inputs'],
  ['structured-slots', workflow, 'structured slots'],
  ['engine-fingerprint', workflow, 'exact Engine batch fingerprint'],
  ['engine-recovery', errors, 'Engine recovery assessment'],
  ['legacy-routing', errors, 'legacy plan'],
  ['separate-markdown-routing', skill, 'Only route a separate English Markdown publishing task to `$feishu-md-sync`'],
  ['no-internal-feishu-md-sync', skill, 'The localization workflow never invokes the `feishu-md-sync` executable internally'],
];
const unsafeRoutes = [
  ...safetyStatements.filter((statement) => !skill.includes(statement)),
  ...workflowContracts
    .filter(([, document, statement]) => !document.toLowerCase().includes(statement.toLowerCase()))
    .map(([id]) => id),
];
const contractMismatches = [
  ...(declaredCliVersion === packageJson.version ? [] : ['package-cli-version']),
  ...(declaredSkillVersion === compatibility.skillVersion ? [] : ['skill-version']),
  ...(declaredRange === compatibility.cliRange ? [] : ['skill-cli-range']),
  ...(packageJson.dependencies?.['feishu-docx-engine'] === '0.2.1' ? [] : ['engine-version']),
  ...(engine.ENGINE_VERSION === packageJson.dependencies?.['feishu-docx-engine'] ? [] : ['installed-engine-version']),
];
const compatible = inInitialRange(packageJson.version, compatibility.cliRange)
  && missingCommands.length === 0
  && missingFeatures.length === 0
  && missingSkillFeatures.length === 0
  && missingEngineCapabilities.length === 0
  && unsafeRoutes.length === 0
  && contractMismatches.length === 0;

process.stdout.write(`${JSON.stringify({
  compatible,
  missingCommands,
  missingFeatures,
  missingSkillFeatures,
  missingEngineCapabilities,
  unsafeRoutes,
  contractMismatches,
  cliVersion: packageJson.version,
  declaredCliVersion,
  skillVersion: compatibility.skillVersion,
  declaredSkillVersion,
  acceptedRange: compatibility.cliRange,
  declaredRange,
  engineVersion: engine.ENGINE_VERSION,
})}\n`);
