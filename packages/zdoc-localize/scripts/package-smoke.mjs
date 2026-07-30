import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(packageDir, '../..');
const temp = mkdtempSync(join(tmpdir(), 'zdoc-localize-package-'));
const packDir = join(temp, 'pack');
const consumer = join(temp, 'consumer');
const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
const expectedCliVersion = packageJson.version;
const expectedEngineVersion = packageJson.dependencies['feishu-docx-engine'];

try {
  mkdirSync(packDir, {recursive: true});
  mkdirSync(consumer, {recursive: true});
  execFileSync('pnpm', ['run', 'build'], {cwd: packageDir, stdio: 'inherit'});
  execFileSync('pnpm', ['pack', '--pack-destination', packDir], {cwd: packageDir, stdio: 'inherit'});
  const archiveName = readdirSync(packDir).find((name) => name.endsWith('.tgz'));
  if (!archiveName) throw new Error('pnpm pack did not produce a tarball.');
  const archive = join(packDir, archiveName);
  const entries = execFileSync('tar', ['-tf', archive], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
  for (const retired of [
    'package/dist/adapters/feishu-md-sync-adapter.js',
    'package/dist/adapters/lark-docs-adapter.js',
    'package/dist/adapters/lark-whiteboard-adapter.js',
  ]) {
    if (entries.includes(retired)) throw new Error(`Packed CLI retained retired adapter ${retired}.`);
  }
  writeFileSync(join(consumer, 'package.json'), '{"private":true}\n');
  writeFileSync(
    join(consumer, '.npmrc'),
    `fund=false\naudit=false\ncache=${join(temp, 'npm-cache')}\n`,
  );
  const npmEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    !key.toLowerCase().startsWith('npm_config_') && !key.startsWith('npm_package_')));
  execFileSync('npm', ['install', '--ignore-scripts=false', '--loglevel=error', archive], {
    cwd: consumer,
    env: npmEnv,
    stdio: 'inherit',
  });
  const bin = join(consumer, 'node_modules', '.bin', 'zdoc-localize');
  const version = execFileSync(bin, ['--version'], {cwd: consumer, encoding: 'utf8'}).trim();
  const capabilities = JSON.parse(execFileSync(bin, ['capabilities', '--format', 'json'], {cwd: consumer, encoding: 'utf8'}));
  const doctor = JSON.parse(execFileSync(bin, ['doctor', '--offline', '--format', 'json'], {cwd: consumer, encoding: 'utf8'}));
  const installedEngine = JSON.parse(readFileSync(join(consumer, 'node_modules', 'feishu-docx-engine', 'package.json'), 'utf8'));
  const skillCompatibility = JSON.parse(execFileSync(process.execPath, [join(root, 'scripts', 'check-zdoc-localize-skill-compat.mjs')], {cwd: root, encoding: 'utf8'}));
  if (version !== expectedCliVersion || capabilities.ok !== true ||
    expectedEngineVersion !== '0.2.1' || installedEngine.version !== expectedEngineVersion ||
    capabilities.data?.docxEngine?.version !== expectedEngineVersion ||
    capabilities.data?.docxEngine?.schemaVersion !== 2 ||
    !['partial-write-evidence-v1', 'native-table-layout-v1', 'rich-inline-composition-v1',
      'typed-snapshot-decode-v1', 'native-callout-create-v1'].every((capability) =>
      capabilities.data?.docxEngine?.capabilities?.includes(capability)) ||
    !capabilities.data?.features?.includes('native-callout-localization-v1') ||
    doctor.ok !== true || skillCompatibility.compatible !== true) {
    throw new Error('Packed CLI smoke checks did not return the expected contracts.');
  }
  process.stdout.write(`${JSON.stringify({
    ok: true,
    version,
    engineVersion: installedEngine.version,
    engineSchemaVersion: capabilities.data.docxEngine.schemaVersion,
    archive: archiveName,
    checks: ['artifact-contents', 'dependency-resolution', 'capabilities', 'doctor-offline', 'skill-compatibility'],
  })}\n`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
