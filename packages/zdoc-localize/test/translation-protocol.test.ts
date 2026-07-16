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
    warnings: [],
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

  it('requires registered internal links to use their Chinese document mapping', () => {
    const internal = {
      ...request,
      glossary: [],
      preserved: [{kind: 'url' as const, value: 'https://docs.example.com/en/setup', count: 1}],
      linkMappings: [{sourceUrl: 'https://docs.example.com/en/setup', targetUrl: 'https://docs.example.com/zh/setup'}],
    };

    expect(validateTranslations([internal], [{
      operationId: 'op-1', translatedText: '查看[配置指南](https://docs.example.com/zh/setup)。', targetNodeKind: 'paragraph',
    }])).toHaveLength(1);
    expect(() => validateTranslations([internal], [{
      operationId: 'op-1', translatedText: '查看[配置指南](https://docs.example.com/en/setup)。', targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'internal_link_not_localized'}));
  });

  it('requires an exact registered Chinese block mapping for internal anchors', () => {
    const anchored = {
      ...request,
      glossary: [],
      preserved: [{kind: 'url' as const, value: 'https://docs.example.com/en/setup#install', count: 1}],
      linkMappings: [
        {sourceUrl: 'https://docs.example.com/en/setup', targetUrl: 'https://docs.example.com/zh/setup'},
        {sourceUrl: 'https://docs.example.com/en/setup#install', targetUrl: 'https://docs.example.com/zh/setup#blk-install'},
      ],
      warnings: [],
    };
    expect(validateTranslations([anchored], [{
      operationId: 'op-1', translatedText: '查看[安装](https://docs.example.com/zh/setup#blk-install)。', targetNodeKind: 'paragraph',
    }])).toHaveLength(1);

    const unresolved = {...anchored, linkMappings: anchored.linkMappings.slice(0, 1)};
    expect(() => validateTranslations([unresolved], [{
      operationId: 'op-1', translatedText: '查看[安装](https://docs.example.com/en/setup#install)。', targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'unresolved_internal_anchor'}));
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

  it('preserves inline-code structure, not only the token text', () => {
    const rawCodeToken = {
      ...request,
      glossary: [],
      preserved: [{kind: 'inline_code' as const, value: 'curl', count: 1}],
      linkMappings: [],
    };

    expect(() => validateTranslations([rawCodeToken], [{
      operationId: 'op-1', translatedText: '运行 curl。', targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'preserved_token_mismatch'}));
  });

  it('requires bold spans to remain structurally marked', () => {
    const boldRequest = {
      ...request,
      glossary: [],
      preserved: [{kind: 'bold_span' as const, value: 'Zilliz Cloud', count: 1}],
      linkMappings: [],
    };

    expect(() => validateTranslations([boldRequest], [{
      operationId: 'op-1', translatedText: '使用 Zilliz Cloud。', targetNodeKind: 'paragraph',
    }])).toThrowError(expect.objectContaining({subtype: 'preserved_token_mismatch'}));
    expect(validateTranslations([boldRequest], [{
      operationId: 'op-1', translatedText: '使用 **Zilliz Cloud**。', targetNodeKind: 'paragraph',
    }])).toHaveLength(1);
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

  it('requires a translated nested list to preserve the source outline', () => {
    const nestedList: TranslationRequest = {
      ...request,
      operationId: 'op-list',
      changeKind: 'insert',
      sourceBefore: undefined,
      sourceAfter: '1. Scan the remote English document.\n2. Review the proposed Chinese changes.\n   - Preserve URLs.\n   - Apply approved writes.',
      targetCurrent: undefined,
      glossary: [],
      preserved: [],
      linkMappings: [],
      targetNodeKind: 'list',
    };

    expect(validateTranslations([nestedList], [{
      operationId: 'op-list',
      translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL。\n   - 应用获批的写入。',
      targetNodeKind: 'list',
    }])).toHaveLength(1);

    expect(() => validateTranslations([nestedList], [{
      operationId: 'op-list',
      translatedText: '- 扫描远端英文文档。\n- 审核建议的中文变更。\n- 保留 URL。\n- 应用获批的写入。',
      targetNodeKind: 'list',
    }])).toThrowError(expect.objectContaining({subtype: 'list_structure_mismatch'}));
  });
});
