import type {PlanOperation} from '../domain/review.js';

export interface ManualSyncedReferenceAction {
  operationId: string;
  marker: string;
  placeholderBlockId: string;
  sourceNodeId: string;
  sourceDocumentId: string;
  sourceBlockId: string;
  sourceUrl: string;
  predecessorBlockId?: string;
  successorBlockId?: string;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function manualSyncMarker(operationId: string): string {
  return `ZDOC-MANUAL-SYNC:${operationId}`;
}

export function manualSyncPlaceholderDetails(operation: PlanOperation, sourceUrl: string): {
  marker: string;
  sourceBlockUrl: string;
  sourceDocumentId: string;
  sourceBlockId: string;
} {
  return {
    marker: manualSyncMarker(operation.operationId),
    sourceBlockUrl: `${sourceUrl.split('#')[0]}#${operation.sourceBlockId}`,
    sourceDocumentId: operation.sourceDocumentId ?? '',
    sourceBlockId: operation.sourceBlockId ?? '',
  };
}

export function syncedReferencePlaceholder(operation: PlanOperation, sourceUrl: string): string {
  const details = manualSyncPlaceholderDetails(operation, sourceUrl);
  return `<callout emoji="🧩" background-color="light-yellow" border-color="yellow">`
    + '<p><b>需要人工插入飞书同步块</b></p>'
    + `<p><code>${escapeXml(details.marker)}</code></p>`
    + `<p><a href="${escapeXml(details.sourceBlockUrl)}">打开英文同步源</a></p>`
    + `<p>Source document: <code>${escapeXml(details.sourceDocumentId)}</code><br/>`
    + `Source block: <code>${escapeXml(details.sourceBlockId)}</code></p>`
    + '</callout>';
}
