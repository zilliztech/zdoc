import {describe, expect, it} from 'vitest';

import {resolveGlossary} from '../src/domain/glossary.js';
import {
  type TranslationRequest,
  validateTranslations,
} from '../src/domain/translation.js';

describe('glossary resolution', () => {
  it('prefers document terminology over product and global terminology', () => {
    const resolved = resolveGlossary([
      {termId: '1', sourceTerm: 'cluster', targetTerm: '集群', disposition: 'translate', scopeType: 'global', status: 'approved'},
      {termId: '2', sourceTerm: 'cluster', targetTerm: '服务集群', disposition: 'translate', scopeType: 'product', scopeValue: 'cloud', status: 'approved'},
      {termId: '3', sourceTerm: 'cluster', targetTerm: '当前集群', disposition: 'translate', scopeType: 'document', scopeValue: 'pair-1', status: 'approved'},
    ], {pairId: 'pair-1', product: 'cloud'});

    expect(resolved.get('cluster')).toMatchObject({
      target: '当前集群',
      scopeType: 'document',
    });
  });

  it('rejects conflicting approved terms at the same priority', () => {
    expect(() => resolveGlossary([
      {termId: '1', sourceTerm: 'database', targetTerm: '数据库', disposition: 'translate', scopeType: 'product', scopeValue: 'cloud', status: 'approved'},
      {termId: '2', sourceTerm: 'database', targetTerm: '资料库', disposition: 'translate', scopeType: 'environment', scopeValue: 'cn', status: 'approved'},
    ], {pairId: 'pair-1', product: 'cloud', environment: 'cn'})).toThrowError(
      expect.objectContaining({type: 'configuration', subtype: 'glossary_conflict'}),
    );
  });
});

describe('translation response validation', () => {
  const request: TranslationRequest = {
    operationId: 'op-1',
    changeKind: 'replace',
    sourceBefore: 'Monitor cluster metrics with `curl` at https://example.com.',
    sourceAfter: 'Monitor cluster alerts with `curl` at https://example.com.',
    targetCurrent: '使用 `curl` 监控集群指标：https://example.com。',
    sectionContext: {source: 'Monitoring', target: '监控'},
    glossary: [{source: 'cluster', target: '集群', disposition: 'translate', prohibitedVariants: ['群集']}],
    memoryExamples: [],
    preserved: [
      {kind: 'inline_code', value: '`curl`', count: 1},
      {kind: 'url', value: 'https://example.com', count: 1},
    ],
    linkMappings: [],
    targetNodeKind: 'paragraph',
  };

  it('accepts a complete response that preserves protected content', () => {
    expect(validateTranslations([request], [{
      operationId: 'op-1',
      translatedText: '使用 `curl` 监控集群告警：https://example.com。',
      targetNodeKind: 'paragraph',
    }])).toEqual([{
      operationId: 'op-1',
      translatedText: '使用 `curl` 监控集群告警：https://example.com。',
      targetNodeKind: 'paragraph',
    }]);
  });

  it.each([
    ['missing code', '监控集群告警：https://example.com。'],
    ['changed URL', '使用 `curl` 监控集群告警：https://example.cn。'],
    ['prohibited variant', '使用 `curl` 监控群集告警：https://example.com。'],
  ])('rejects %s', (_label, translatedText) => {
    expect(() => validateTranslations([request], [{
      operationId: 'op-1',
      translatedText,
      targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({type: 'validation'}));
  });

  it('rejects missing and unknown operation IDs', () => {
    expect(() => validateTranslations([request], [{
      operationId: 'unknown',
      translatedText: '无关内容',
      targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'translation_operation_mismatch'}));
  });

  it('requires an explicit delete decision', () => {
    const deletion: TranslationRequest = {...request, operationId: 'op-delete', changeKind: 'delete'};
    expect(validateTranslations([deletion], [{operationId: 'op-delete', decision: 'delete'}])).toEqual([
      {operationId: 'op-delete', decision: 'delete'},
    ]);
    expect(() => validateTranslations([deletion], [{
      operationId: 'op-delete',
      translatedText: '删除',
      targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'delete_decision_required'}));
  });
});
