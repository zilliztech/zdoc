import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import {alignChanges, rebaseCorrespondences} from '../src/domain/alignment.js';
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
  it('treats a new leading sibling as one insertion without rewriting shifted siblings', () => {
    const baseline = parseFeishuDocument(
      '<p id="a">Alpha</p><p id="b">Beta</p>',
      {documentId: 'en', revisionId: 1},
    );
    const current = parseFeishuDocument(
      '<p id="x">New</p><p id="a">Alpha</p><p id="b">Beta</p>',
      {documentId: 'en', revisionId: 2},
    );

    const changes = diffDocuments(baseline, current);

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({kind: 'insert', after: {text: 'New'}});
  });

  it('emits a writable replacement for a title-only change', () => {
    const baseline = parseFeishuDocument('<title id="title">Old title</title><p id="p1">Body</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<title id="title">New title</title><p id="p1">Body</p>', {documentId: 'en', revisionId: 2});

    const changes = diffDocuments(baseline, current);

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({kind: 'replace', before: {kind: 'title'}, after: {text: 'New title', writable: true}});
  });

  it('rebases historical correspondence when a leading insertion shifts positional node IDs', () => {
    const baseline = parseFeishuDocument('<p id="a">Alpha</p><p id="b">Beta</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<p id="x">New</p><p id="a">Alpha</p><p id="b">Beta</p>', {documentId: 'en', revisionId: 2});
    const rebased = rebaseCorrespondences([
      {sourceNodeId: '$root:paragraph:0', targetNodeId: '$root:paragraph:0'},
      {sourceNodeId: '$root:paragraph:1', targetNodeId: '$root:paragraph:1'},
    ], baseline, current);

    expect(rebased).toEqual([
      {sourceNodeId: '$root:paragraph:1', targetNodeId: '$root:paragraph:0'},
      {sourceNodeId: '$root:paragraph:2', targetNodeId: '$root:paragraph:1'},
    ]);
  });

  it('assigns unique operation IDs to identical nodes at different locations', () => {
    const baseline = parseFeishuDocument('<h1 id="h1">Start</h1>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<h1 id="h1">Start</h1><p id="a">Same</p><p id="b">Same</p>', {documentId: 'en', revisionId: 2});

    const changes = diffDocuments(baseline, current);

    expect(changes).toHaveLength(2);
    expect(new Set(changes.map((change) => change.changeId)).size).toBe(2);
  });

  it('uses stable remote block IDs when rebasing identical siblings', () => {
    const baseline = parseFeishuDocument('<p id="a">Same</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<p id="x">Same</p><p id="a">Same</p>', {documentId: 'en', revisionId: 2});

    const rebased = rebaseCorrespondences([
      {sourceNodeId: '$root:paragraph:0', targetNodeId: '$root:paragraph:0'},
    ], baseline, current);

    expect(rebased).toEqual([{sourceNodeId: '$root:paragraph:1', targetNodeId: '$root:paragraph:0'}]);
  });

  it('uses stable remote block IDs when diffing identical siblings', () => {
    const baseline = parseFeishuDocument('<p id="a">Same</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<p id="x">Same</p><p id="a">Same</p>', {documentId: 'en', revisionId: 2});

    const changes = diffDocuments(baseline, current);

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({kind: 'insert', after: {remote: {blockId: 'x'}}});
  });

  it('keeps baseline replacement history separate from rebased insertion-anchor history', () => {
    const baseline = parseFeishuDocument('<p id="a">Alpha</p><p id="b">Beta</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<p id="x">New</p><p id="a">Alpha</p><p id="b">Beta changed</p>', {documentId: 'en', revisionId: 2});
    const target = parseFeishuDocument('<p id="ta">甲</p><p id="tb">乙</p>', {documentId: 'zh', revisionId: 1});
    const history = [
      {sourceNodeId: '$root:paragraph:0', targetNodeId: '$root:paragraph:0'},
      {sourceNodeId: '$root:paragraph:1', targetNodeId: '$root:paragraph:1'},
    ];
    const currentHistory = rebaseCorrespondences(history, baseline, current);

    const aligned = alignChanges(diffDocuments(baseline, current), target, history, currentHistory);

    expect(aligned.find((item) => item.change.after?.text === 'Beta changed')).toMatchObject({
      confidence: 'high', targetNodeId: '$root:paragraph:1',
    });
    expect(aligned.find((item) => item.change.after?.text === 'New')).toMatchObject({confidence: 'low'});
  });

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

  it('blocks deletion of the first target block because it has no reversible insertion anchor', () => {
    const baseline = parseFeishuDocument('<title id="title">Old</title><p id="p">Body</p>', {documentId: 'en', revisionId: 1});
    const current = parseFeishuDocument('<p id="p">Body</p>', {documentId: 'en', revisionId: 2});
    const target = parseFeishuDocument('<title id="zh-title">旧</title><p id="zh-p">正文</p>', {documentId: 'zh', revisionId: 1});
    const deletion = diffDocuments(baseline, current).find((change) => change.kind === 'delete')!;

    const aligned = alignChanges([deletion], target, [{sourceNodeId: deletion.before!.nodeId, targetNodeId: target.nodes[0]!.nodeId}]);

    expect(aligned[0]).toMatchObject({confidence: 'low', blocker: expect.stringContaining('first target block')});
  });
});
