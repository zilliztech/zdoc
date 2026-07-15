import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import type {SnapshotBundle, SnapshotReference, SnapshotStore} from '../application/ports.js';

export class LocalSnapshotStore implements SnapshotStore {
  private readonly cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
  }

  async putBundle(bundle: SnapshotBundle): Promise<SnapshotReference> {
    const hash = canonicalHash(bundle);
    const relativePath = join('.zdoc-localize', 'snapshots', `${hash}.json`);
    const absolutePath = join(this.cwd, relativePath);
    const bytes = `${JSON.stringify(bundle, null, 2)}\n`;
    await mkdir(join(this.cwd, '.zdoc-localize', 'snapshots'), {recursive: true});
    try {
      const existing = await readFile(absolutePath, 'utf8');
      if (existing !== bytes) {
        throw new LocalizeError({
          type: 'verification_failed',
          subtype: 'immutable_snapshot_changed',
          message: `Snapshot ${relativePath} already exists with different content.`,
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await writeFile(absolutePath, bytes, {encoding: 'utf8', flag: 'wx'});
    }
    return {kind: 'local', path: relativePath, hash};
  }

  async getBundle(reference: SnapshotReference): Promise<SnapshotBundle> {
    const bundle = JSON.parse(await readFile(join(this.cwd, reference.path), 'utf8')) as SnapshotBundle;
    if (canonicalHash(bundle) !== reference.hash) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'snapshot_hash_mismatch',
        message: `Snapshot ${reference.path} does not match its recorded hash.`,
      });
    }
    return bundle;
  }
}
