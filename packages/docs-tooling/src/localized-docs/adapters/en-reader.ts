import { lstat, readFile, realpath } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { sharedReceiptPath, validateSharedReceipt } from '../../shared-docs/core/handoff/source-state.ts'
import { isCommit, isRepositoryPath } from '../../shared-docs/core/yaml.ts'
import type { EnProvenanceSummary, VerifiedEnSnapshot } from '../core/draft.ts'
import { computeChannelDigests } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import type { LocalizedDocsError, ManualId } from '../core/types.ts'
import { localizedError, sha256Hex } from '../core/types.ts'
import { withinPath } from './fs-reader.ts'

export interface ReadEnSnapshotOptions {
  filePath?: string
  manifestPath?: string
  devRoot?: string
  manual: ManualId
  sharedPage: string
  devCommit?: string
  requireReceipt?: boolean
}

async function assertNoSymlinksOnPath(targetPath: string, label: string): Promise<void> {
  const resolved = resolve(targetPath)
  const ancestors: string[] = []
  for (let current = resolved; ; current = dirname(current)) {
    ancestors.push(current)
    if (dirname(current) === current) break
  }
  for (const current of ancestors.reverse()) {
    const stats = await lstat(current)
    if (stats.isSymbolicLink()) {
      throw new Error(`${label} must not use symbolic links: ${current}`)
    }
    if (current !== resolved && !stats.isDirectory()) {
      throw new Error(`${label} ancestor must be a directory: ${current}`)
    }
  }
}

async function readRegularFileSafe(
  targetPath: string,
  label: string,
  realBoundary?: string,
): Promise<string> {
  const resolved = resolve(targetPath)
  await assertNoSymlinksOnPath(resolved, label)
  const stats = await lstat(resolved)
  if (!stats.isFile()) {
    throw new Error(`${label} must be a regular file: ${resolved}`)
  }
  const realTarget = await realpath(resolved)
  if (realBoundary && !withinPath(realBoundary, realTarget)) {
    throw new Error(`${label} resolves outside boundary ${realBoundary}: ${resolved}`)
  }
  return readFile(realTarget, 'utf8')
}

export async function readVerifiedEnSnapshot(
  options: ReadEnSnapshotOptions,
): Promise<{ snapshot: VerifiedEnSnapshot } | { errors: LocalizedDocsError[] }> {
  const location = { file: options.filePath ?? options.manifestPath ?? options.sharedPage, page: options.sharedPage }
  const needsReceipt = Boolean(options.manifestPath || options.devRoot || options.requireReceipt)

  let realDevRoot: string | undefined
  if (options.devRoot) {
    try {
      const resolvedDev = resolve(options.devRoot)
      await assertNoSymlinksOnPath(resolvedDev, 'EN dev root')
      const devStat = await lstat(resolvedDev)
      if (!devStat.isDirectory()) {
        return {
          errors: [
            localizedError(
              'EN_PROVENANCE_INVALID',
              `EN dev root must be a directory: ${resolvedDev}`,
              location,
              1,
            ),
          ],
        }
      }
      realDevRoot = await realpath(resolvedDev)
    } catch (error) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            error instanceof Error ? error.message : String(error),
            location,
            1,
          ),
        ],
      }
    }
  }

  if (needsReceipt) {
    const expectedManifestRel = sharedReceiptPath('guides', options.sharedPage)
    const manifestAbs = options.manifestPath
      ? resolve(options.manifestPath)
      : realDevRoot
        ? join(realDevRoot, expectedManifestRel)
        : undefined

    if (!manifestAbs) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            'SharedReceipt manifest path or devRoot is required to verify EN provenance',
            location,
            1,
          ),
        ],
      }
    }

    let receiptRaw: string
    try {
      receiptRaw = await readRegularFileSafe(
        manifestAbs,
        'EN SharedReceipt manifest',
        options.manifestPath ? undefined : realDevRoot,
      )
    } catch (error) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            error instanceof Error ? error.message : String(error),
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(receiptRaw)
    } catch (error) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            `Malformed SharedReceipt JSON: ${error instanceof Error ? error.message : String(error)}`,
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    let receipt
    try {
      receipt = validateSharedReceipt(parsedJson, {
        group: 'guides',
        page: options.sharedPage,
      })
    } catch (error) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            `SharedReceipt validation failed: ${error instanceof Error ? error.message : String(error)}`,
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    const output = receipt.outputs.find(o => o.manual === options.manual)
    if (!output) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            `SharedReceipt does not contain output for manual "${options.manual}"`,
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    const enFileAbs = options.filePath
      ? resolve(options.filePath)
      : realDevRoot
        ? join(realDevRoot, output.path)
        : undefined

    if (!enFileAbs) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            'EN MDX file path or devRoot is required',
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    let rawMdx: string
    try {
      rawMdx = await readRegularFileSafe(
        enFileAbs,
        'EN MDX file',
        options.filePath ? undefined : realDevRoot,
      )
    } catch (error) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            error instanceof Error ? error.message : String(error),
            { file: enFileAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    const actualSha = sha256Hex(rawMdx)
    if (actualSha !== output.sha256) {
      return {
        errors: [
          localizedError(
            'EN_DIGEST_MISMATCH',
            `EN file SHA-256 (${actualSha}) does not match SharedReceipt output digest (${output.sha256})`,
            { file: enFileAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    const stripped = stripEnShell(rawMdx, { file: output.path, page: options.sharedPage })
    if ('errors' in stripped) {
      return { errors: stripped.errors }
    }

    const devCommit = options.devCommit
      ? options.devCommit
      : receipt.inputs.dev.commit
    if (!isCommit(devCommit)) {
      return {
        errors: [
          localizedError(
            'EN_PROVENANCE_INVALID',
            `Invalid dev_commit SHA: ${devCommit}`,
            { file: manifestAbs, page: options.sharedPage },
            1,
          ),
        ],
      }
    }

    const provenance: EnProvenanceSummary = {
      manual: options.manual,
      sharedPage: options.sharedPage,
      devCommit,
      enPath: output.path,
      manifestPath: expectedManifestRel,
      fileSha256: output.sha256,
      channels: computeChannelDigests(stripped.body),
      receiptChannel: receipt.channel,
      provenanceMode: 'shared-receipt',
      verified: true,
      verificationErrors: [],
    }

    return {
      snapshot: {
        rawMdx,
        stripped,
        provenance,
      },
    }
  }

  // File-direct mode (offline CLI without manifestPath or devRoot)
  if (!options.filePath) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          'EN MDX file path is required in file-direct mode',
          location,
          1,
        ),
      ],
    }
  }

  let rawMdx: string
  try {
    rawMdx = await readRegularFileSafe(resolve(options.filePath), 'EN MDX file')
  } catch (error) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          error instanceof Error ? error.message : String(error),
          { file: options.filePath, page: options.sharedPage },
          1,
        ),
      ],
    }
  }

  const devCommit = options.devCommit ?? '0'.repeat(40)
  if (!isCommit(devCommit)) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `devCommit must be a 40-char lowercase hex SHA, got: ${devCommit}`,
          { file: options.filePath, page: options.sharedPage },
          1,
        ),
      ],
    }
  }

  const enPath = `content/en/guides/${options.sharedPage}.md`
  if (!isRepositoryPath(enPath)) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `Invalid derived EN repository path: ${enPath}`,
          location,
          1,
        ),
      ],
    }
  }

  const stripped = stripEnShell(rawMdx, { file: enPath, page: options.sharedPage })
  if ('errors' in stripped) {
    return { errors: stripped.errors }
  }

  const provenance: EnProvenanceSummary = {
    manual: options.manual,
    sharedPage: options.sharedPage,
    devCommit,
    enPath,
    manifestPath: sharedReceiptPath('guides', options.sharedPage),
    fileSha256: sha256Hex(rawMdx),
    channels: computeChannelDigests(stripped.body),
    receiptChannel: null,
    provenanceMode: 'file-direct',
    verified: true,
    verificationErrors: [],
  }

  return {
    snapshot: {
      rawMdx,
      stripped,
      provenance,
    },
  }
}
