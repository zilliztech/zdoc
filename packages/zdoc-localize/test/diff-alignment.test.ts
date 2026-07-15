import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import {alignChanges} from '../src/domain/alignment.js';
import {diffDocuments} from '../src/domain/diff.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function documents() {
  const [baselineXml, currentXml, targetXml] = await Promise.all([
    readFile(fixture('source-baseline.xml'), 'utf8'),
    readFile(fixture('source-current.xml'), 'utf8'),
    readFile(fixture('target-current.xml'), 'utf8'),
  ]);
  return {
    baseline: parseFeishuDocument(baselineXml, {documentId: 'en', revisionId: 1}),
    current: parseFeishuDocument(currentXml, {documentId: 'en', revisionId: 2}),
    target: parseFeishuDocument(targetXml, {documentId: 'zh', revisionId: 8}),
  };
}

describe('semantic diff and alignment', () => {
  it('classifies replacements, insertion, and deletion without treating shifted nodes as moves', async () => {
    const {baseline, current} = await documents();
    const changes = diffDocuments(baseline, current);

    expect(changes.map((change) => change.kind).sort()).toEqual([
      'delete',
      'insert',
      'replace',
      'replace',
    ]);
    expect(changes.find((change) => change.kind === 'insert')?.after?.text).toContain('Review alert delivery');
    expect(changes.find((change) => change.kind === 'delete')?.before?.kind).toBe('image');
  });

  it('uses historical correspondence for a high-confidence replacement', async () => {
    const {baseline, current, target} = await documents();
    const changes = diffDocuments(baseline, current);
    const sourceParagraph = baseline.nodes.find((node) => node.remote.blockId === 'p-intro');
    const targetParagraph = target.nodes.find((node) => node.remote.blockId === 'zh-overview-p1');
    expect(sourceParagraph).toBeDefined();
    expect(targetParagraph).toBeDefined();

    const aligned = alignChanges(changes, target, [{
      sourceNodeId: sourceParagraph!.nodeId,
      targetNodeId: targetParagraph!.nodeId,
    }]);
    const replacement = aligned.find((item) => item.change.before?.nodeId === sourceParagraph!.nodeId);

    expect(replacement).toMatchObject({
      confidence: 'high',
      targetNodeId: targetParagraph!.nodeId,
    });
  });

  it('anchors an insertion after the historically corresponding previous source block', async () => {
    const {baseline, current, target} = await documents();
    const changes = diffDocuments(baseline, current);
    const sourceCallout = baseline.nodes.find((node) => node.remote.blockId === 'callout-note');
    const targetCallout = target.nodes.find((node) => node.remote.blockId === 'zh-callout');

    const aligned = alignChanges(changes, target, [{
      sourceNodeId: sourceCallout!.nodeId,
      targetNodeId: targetCallout!.nodeId,
    }]);
    const insertion = aligned.find((item) => item.change.kind === 'insert');

    expect(insertion).toMatchObject({
      confidence: 'high',
      anchorNodeId: targetCallout!.nodeId,
    });
  });

  it('blocks alignment when two structural candidates tie', async () => {
    const {baseline, current, target} = await documents();
    const changes = diffDocuments(baseline, current);
    const sourceParagraph = baseline.nodes.find((node) => node.remote.blockId === 'p-intro');
    const duplicate = target.nodes.find((node) => node.remote.blockId === 'zh-overview-p1')!;
    const ambiguousTarget = {
      ...target,
      nodes: [...target.nodes, {...duplicate, nodeId: `${duplicate.nodeId}:duplicate`}],
    };

    const aligned = alignChanges(changes, ambiguousTarget, []);
    const replacement = aligned.find((item) => item.change.before?.nodeId === sourceParagraph!.nodeId);

    expect(replacement?.confidence).toBe('low');
    expect(replacement?.blocker).toContain('multiple candidates');
  });
});
