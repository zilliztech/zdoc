// Dedicated read-only CLI boundary. Do not expose reader factories, transport seams or writers.
import { collectBatchDiscovery as collect, type BatchDiscoveryOptions } from '../../../packages/docs-tooling/src/shared-docs/adapters/updates/batch-discovery'
import type { BatchDiscoveryReport } from '../../../packages/docs-tooling/src/shared-docs/core/updates/batch-discovery'

export { batchDiscoveryFailureCode } from '../../../packages/docs-tooling/src/shared-docs/adapters/updates/batch-discovery'
export { canonicalBytes, parseStrictJson } from '../../../packages/docs-tooling/src/shared-docs/core/updates/canonical'
export { BatchDiscoveryInputSchema, BatchDiscoveryReportSchema, discoverBatches } from '../../../packages/docs-tooling/src/shared-docs/core/updates/batch-discovery'

export function collectBatchDiscovery(options: BatchDiscoveryOptions): Promise<BatchDiscoveryReport> {
  return collect(options)
}
