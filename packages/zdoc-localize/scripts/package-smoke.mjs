import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(packageDir, '../..');
const temp = mkdtempSync(join(tmpdir(), 'zdoc-localize-package-'));
const packDir = join(temp, 'pack');
const consumer = join(temp, 'consumer');

try {
  mkdirSync(packDir, {recursive: true});
  mkdirSync(consumer, {recursive: true});
  execFileSync('pnpm', ['run', 'build'], {cwd: packageDir, stdio: 'inherit'});
  execFileSync('pnpm', ['pack', '--pack-destination', packDir], {cwd: packageDir, stdio: 'inherit'});
  const archive = join(packDir, readdirSync(packDir).find((name) => name.endsWith('.tgz')));
  writeFileSync(join(consumer, 'package.json'), '{"private":true}\n');
  writeFileSync(join(consumer, '.npmrc'), 'fund=false\naudit=false\n');
  execFileSync('npm', ['install', '--ignore-scripts=false', archive], {cwd: consumer, stdio: 'inherit'});
  const bin = join(consumer, 'node_modules', '.bin', 'zdoc-localize');
  const version = execFileSync(bin, ['--version'], {cwd: consumer, encoding: 'utf8'}).trim();
  const capabilities = JSON.parse(execFileSync(bin, ['capabilities', '--format', 'json'], {cwd: consumer, encoding: 'utf8'}));
  const doctor = JSON.parse(execFileSync(bin, ['doctor', '--offline', '--format', 'json'], {cwd: consumer, encoding: 'utf8'}));
  const skillCompatibility = JSON.parse(execFileSync(process.execPath, [join(root, 'scripts', 'check-zdoc-localize-skill-compat.mjs')], {cwd: root, encoding: 'utf8'}));
  if (version !== '0.1.1' || capabilities.ok !== true || doctor.ok !== true || skillCompatibility.compatible !== true) {
    throw new Error('Packed CLI smoke checks did not return the expected contracts.');
  }
  process.stdout.write(`${JSON.stringify({ok: true, version, archive, checks: ['capabilities', 'doctor-offline', 'skill-compatibility']})}\n`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
