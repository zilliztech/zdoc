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

export function syncedReferencePlaceholder(operation: PlanOperation, sourceUrl: string): string {
  const marker = manualSyncMarker(operation.operationId);
  const sourceBlockUrl = `${sourceUrl.split('#')[0]}#${operation.sourceBlockId}`;
  return `<callout emoji="🧩" background-color="light-yellow" border-color="yellow">`
    + '<p><b>需要人工插入飞书同步块</b></p>'
    + `<p><code>${escapeXml(marker)}</code></p>`
    + `<p><a href="${escapeXml(sourceBlockUrl)}">打开英文同步源</a></p>`
    + `<p>Source document: <code>${escapeXml(operation.sourceDocumentId ?? '')}</code><br/>`
    + `Source block: <code>${escapeXml(operation.sourceBlockId ?? '')}</code></p>`
    + '</callout>';
}
