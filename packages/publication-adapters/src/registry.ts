import {lstatSync, realpathSync} from 'node:fs';
import path from 'node:path';

import type {GeneratedDocument, PublicationAdapter, PublicationContext} from './types.ts';

const ADAPTER_ID = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/u;

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

export interface PublicationAdapterRegistry {
  readonly ids: readonly string[];
  resolve(id: string): PublicationAdapter;
  transformDocument(adapterIds: readonly string[], document: GeneratedDocument, context: PublicationContext): GeneratedDocument;
  validatePublication(adapterIds: readonly string[], context: PublicationContext): Promise<void>;
}

function canonicalPublicationRoot(rootInput: string): string {
  if (typeof rootInput !== 'string' || rootInput.length === 0) throw new Error('Publication root is required');
  const root = path.resolve(rootInput);
  if (!pathEntryExists(root)) throw new Error(`Publication root does not exist: ${root}`);
  const stats = lstatSync(root);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`Publication root must be a non-symlink directory: ${root}`);
  return realpathSync(root);
}

function assertRelativeDocumentPath(value: string): string {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value !== value.trim()
    || value.includes('\\')
    || value.includes('\0')
    || path.posix.isAbsolute(value)
    || /^[A-Za-z]:\//u.test(value)
    || path.posix.normalize(value) !== value
    || value.split('/').some(segment => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`Generated document path is unsafe: ${JSON.stringify(value)}`);
  }
  return value;
}

function assertDocumentWithinRoot(root: string, documentPath: string): void {
  assertRelativeDocumentPath(documentPath);
  const target = path.resolve(root, ...documentPath.split('/'));
  if (target === root || !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Generated document path escapes the publication root: ${documentPath}`);
  }
  let current = root;
  for (const segment of documentPath.split('/')) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) continue;
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`Generated document path has a symlink ancestor: ${documentPath}`);
    const resolved = realpathSync(current);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Generated document path escapes the publication root through an ancestor: ${documentPath}`);
    }
    if (current !== target && !stats.isDirectory()) {
      throw new Error(`Generated document path has a non-directory ancestor: ${documentPath}`);
    }
  }
}

function immutableContext(context: PublicationContext): PublicationContext {
  const publicationRoot = canonicalPublicationRoot(context.publicationRoot);
  const sourceIdentity = Object.freeze({...context.sourceIdentity});
  return Object.freeze({...context, publicationRoot, sourceIdentity});
}

function immutableDocument(document: GeneratedDocument, root: string): GeneratedDocument {
  if (typeof document?.contents !== 'string') throw new Error('Generated document contents must be a string');
  assertDocumentWithinRoot(root, document.path);
  return Object.freeze({path: document.path, contents: document.contents});
}

function adapterCopy(adapter: PublicationAdapter): PublicationAdapter {
  if (!adapter || typeof adapter !== 'object') throw new Error('Publication adapter must be an object');
  if (!ADAPTER_ID.test(adapter.id)) throw new Error(`Publication adapter ID is invalid: ${JSON.stringify(adapter.id)}`);
  if (typeof adapter.transformDocument !== 'function' || typeof adapter.validatePublication !== 'function') {
    throw new Error(`Publication adapter ${adapter.id} must implement transformDocument and validatePublication`);
  }
  return Object.freeze({
    id: adapter.id,
    transformDocument: adapter.transformDocument,
    validatePublication: adapter.validatePublication,
  });
}

export function createPublicationAdapterRegistry(adapters: readonly PublicationAdapter[]): PublicationAdapterRegistry {
  const byId = new Map<string, PublicationAdapter>();
  for (const candidate of adapters) {
    const adapter = adapterCopy(candidate);
    if (byId.has(adapter.id)) throw new Error(`Duplicate publication adapter ID: ${adapter.id}`);
    byId.set(adapter.id, adapter);
  }
  const ids = Object.freeze([...byId.keys()].sort((left, right) => left.localeCompare(right, 'en')));

  function resolve(id: string): PublicationAdapter {
    const adapter = byId.get(id);
    if (!adapter) throw new Error(`Unknown or undeclared publication adapter ID: ${id}`);
    return adapter;
  }

  return Object.freeze({
    ids,
    resolve,
    transformDocument(adapterIds: readonly string[], document: GeneratedDocument, context: PublicationContext): GeneratedDocument {
      const safeContext = immutableContext(context);
      let transformed = immutableDocument(document, safeContext.publicationRoot);
      for (const id of adapterIds) {
        transformed = immutableDocument(resolve(id).transformDocument(transformed, safeContext), safeContext.publicationRoot);
      }
      return transformed;
    },
    async validatePublication(adapterIds: readonly string[], context: PublicationContext): Promise<void> {
      const safeContext = immutableContext(context);
      for (const id of adapterIds) await resolve(id).validatePublication(safeContext.publicationRoot, safeContext);
    },
  });
}
