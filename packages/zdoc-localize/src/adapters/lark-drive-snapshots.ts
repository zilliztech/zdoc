import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, posix} from 'node:path';

import type {SnapshotBundle, SnapshotReference, SnapshotStore} from '../application/ports.js';
import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export interface LarkDriveSnapshotOptions {
  cwd: string;
  folderToken: string;
}

export class LarkDriveSnapshotStore implements SnapshotStore {
  constructor(
    private readonly runner: ProcessRunner,
    private readonly options: LarkDriveSnapshotOptions,
  ) {}

  async putBundle(bundle: SnapshotBundle): Promise<SnapshotReference> {
    const hash = canonicalHash(bundle);
    const relativePath = posix.join('.zdoc-localize', 'outbox', `${hash}.json`);
    await mkdir(join(this.options.cwd, '.zdoc-localize', 'outbox'), {recursive: true});
    await writeFile(join(this.options.cwd, relativePath), `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
    const data = await runJsonCommand<{file_token?: string; file?: {file_token?: string}}>(this.runner, {
      executable: 'lark-cli',
      args: [
        'drive', '+upload', '--file', relativePath, '--folder-token', this.options.folderToken,
        '--name', `${hash}.json`, '--format', 'json', '--as', 'user',
      ],
      cwd: this.options.cwd,
      env: larkMachineEnv,
    });
    const token = data.file_token ?? data.file?.file_token;
    if (!token) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'snapshot_upload_missing_token',
        message: 'Drive upload did not return a file token.',
      });
    }
    return {kind: 'drive', path: `${hash}.json`, hash, token};
  }

  async getBundle(reference: SnapshotReference): Promise<SnapshotBundle> {
    if (!reference.token) {
      throw new LocalizeError({type: 'validation', subtype: 'snapshot_token_missing', message: 'Drive snapshot reference has no file token.'});
    }
    const relativePath = posix.join('.zdoc-localize', 'inbox', `${reference.hash}.json`);
    await mkdir(join(this.options.cwd, '.zdoc-localize', 'inbox'), {recursive: true});
    await runJsonCommand(this.runner, {
      executable: 'lark-cli',
      args: [
        'drive', '+download', '--file-token', reference.token, '--output', relativePath,
        '--overwrite', '--format', 'json', '--as', 'user',
      ],
      cwd: this.options.cwd,
      env: larkMachineEnv,
    });
    const bundle = JSON.parse(await readFile(join(this.options.cwd, relativePath), 'utf8')) as SnapshotBundle;
    if (canonicalHash(bundle) !== reference.hash) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'snapshot_hash_mismatch',
        message: 'Downloaded Drive snapshot does not match its recorded hash.',
      });
    }
    return bundle;
  }
}
