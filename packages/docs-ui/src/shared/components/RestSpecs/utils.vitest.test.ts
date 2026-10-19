import {describe, expect, it} from 'vitest';
import {chooseParamExample, getBaseUrl, getDefaultResponseStatus, getLocalizedDescription, getResponseEntries, getTokenPlaceholder, textFilter} from './utils.js';

const planeConfig = {
  dataPlaneKeywords: {
    zilliz: ['cluster-role-operations-v2', '/v2/vectordb/roles', '/v2/vectordb/users'],
    milvus: [],
  },
  controlPlaneKeywords: {
    zilliz: ['cluster', 'import', 'volume', '/v2/roles', '/v2/members', '/v2/groups', '/v2/api-keys'],
    milvus: [],
  },
};

describe('RestSpecs plane configuration', () => {
  it('uses profile-provided plane keywords for control-plane endpoint and token branches', () => {
    expect(getBaseUrl('/v2/clusters', 'en-US', 'zilliz', planeConfig)).toMatchObject({
      server: 'https://api.cloud.zilliz.com',
    });
    expect(getTokenPlaceholder('/v2/clusters', 'zilliz', planeConfig)).toBe('YOUR_API_KEY');
  });

  it('uses data-plane endpoint and token branches when no configured keyword matches', () => {
    expect(getBaseUrl('/v2/vectordb/entities/search', 'en-US', 'zilliz', planeConfig)).toMatchObject({
      server: 'https://${CLUSTER_ENDPOINT}',
      children: 'export CLUSTER_ENDPOINT=""',
    });
    expect(getTokenPlaceholder('/v2/vectordb/entities/search', 'zilliz', planeConfig)).toBe('db_admin:xxxxxxxxxxxxx');
  });

  it('gives explicit data-plane overrides precedence over control-plane keywords', () => {
    expect(getBaseUrl('/v2/vectordb/roles/list', 'en-US', 'zilliz', planeConfig)).toMatchObject({
      server: 'https://${CLUSTER_ENDPOINT}',
    });
    expect(getTokenPlaceholder('/v2/vectordb/users/list', 'zilliz', planeConfig)).toBe('db_admin:xxxxxxxxxxxxx');
  });

  it('classifies Cloud ACL and API Key paths as control-plane endpoints', () => {
    for (const endpoint of ['/v2/roles', '/v2/members/alice@example.com/roles', '/v2/groups', '/v2/api-keys']) {
      expect(getBaseUrl(endpoint, 'en-US', 'zilliz', planeConfig)).toMatchObject({
        server: 'https://api.cloud.zilliz.com',
      });
      expect(getTokenPlaceholder(endpoint, 'zilliz', planeConfig)).toBe('YOUR_API_KEY');
    }
  });

  it('keeps target-specific examples on the same publication branch', () => {
    const parameter = chooseParamExample({
      examples: {
        milvus: {value: 'milvus-value', 'x-include-target': ['milvus']},
        zilliz: {value: 'zilliz-value', 'x-include-target': ['zilliz']},
      },
    }, 'en-US', 'zilliz');
    expect(parameter.example).toBe('zilliz-value');
  });
});

describe('RestSpecs response selection', () => {
  it('uses the declared 2xx response instead of assuming HTTP 200', () => {
    const responses = {
      '201': {description: 'Created', content: {'application/json': {schema: {type: 'object'}}}},
    };

    expect(getDefaultResponseStatus(responses)).toBe('201');
    expect(getResponseEntries(responses)).toEqual([
      expect.objectContaining({status: '201', label: 'Created'}),
    ]);
  });

  it('keeps no-content responses renderable without inventing a response body', () => {
    const responses = {'204': {description: 'Canceled'}};

    expect(getDefaultResponseStatus(responses)).toBe('204');
    expect(getResponseEntries(responses)[0]).toMatchObject({
      status: '204',
      label: 'No Content',
      response: {description: 'Canceled'},
    });
  });

  it('sorts multiple response statuses and selects the first success response', () => {
    const responses = {
      default: {description: 'Fallback'},
      '500': {description: 'Failure'},
      '202': {description: 'Accepted'},
      '200': {description: 'OK'},
    };

    expect(getResponseEntries(responses).map(({status}) => status)).toEqual(['200', '202', '500', 'default']);
    expect(getDefaultResponseStatus(responses)).toBe('200');
  });
});

describe('RestSpecs localized operation description', () => {
  const operation = {
    description: 'Import prepared data files into a collection.',
    'x-i18n': {
      'zh-CN': {description: '将准备好的数据文件导入 Collection。'},
      'ja-JP': {description: '準備済みのデータファイルをコレクションにインポートします。'},
    },
  };

  it('selects the Chinese and Japanese descriptions for the page intro', () => {
    expect(getLocalizedDescription(operation, 'zh-CN')).toBe('将准备好的数据文件导入 Collection。');
    expect(getLocalizedDescription(operation, 'ja-JP')).toBe('準備済みのデータファイルをコレクションにインポートします。');
  });

  it('falls back to the source description when the locale is absent', () => {
    expect(getLocalizedDescription(operation, 'en-US')).toBe('Import prepared data files into a collection.');
  });
});

describe('RestSpecs textFilter link localization', () => {
  const markdownDescription = '关于 CU 大小的增量规则，请参阅 [详细计划对比](https://docs.zilliz.com/docs/select-zilliz-cloud-service-plans#deployment)。';

  it('keeps Chinese pages on the Chinese site and routes Milvus links to the Chinese tree', () => {
    const html = textFilter(markdownDescription, 'zilliz', 'zh-CN');
    expect(html).toContain('href="/docs/select-zilliz-cloud-service-plans#deployment"');
    expect(html).toContain('详细计划对比');
  });

  it('prefixes Japanese pages with /ja-JP and localizes Milvus doc links', () => {
    const html = textFilter('詳細は[パターンマッチング](https://milvus.io/docs/pattern-matching.md)を参照。', 'zilliz', 'ja-JP');
    expect(html).toContain('href="https://milvus.io/docs/ja/pattern-matching.md"');
  });

  it('rewrites inline HTML anchors and keeps English links on the English site', () => {
    const html = textFilter('<ul><li><a href="https://docs.zilliz.com/docs/data-import-parquet#import-data">Parquet</a></li></ul>', 'zilliz', 'en-US');
    expect(html).toContain('href="/docs/data-import-parquet#import-data"');
  });

  it('drops include blocks for other targets before rewriting the remaining links', () => {
    const text = '<include target="milvus">see [guide](https://milvus.io/docs/index.md)</include><exclude target="milvus">see [guide](https://docs.zilliz.com/docs/limits)</exclude>';
    expect(textFilter(text, 'zilliz', 'zh-CN')).toContain('href="/docs/limits"');
    expect(textFilter(text, 'zilliz', 'zh-CN')).not.toContain('milvus.io');
  });

  it('keeps enum rendering and unknown locales on English behavior', () => {
    const html = textFilter('Supported values: `CU_1`', 'zilliz', undefined);
    expect(html).toContain('CU_1');
  });
});
