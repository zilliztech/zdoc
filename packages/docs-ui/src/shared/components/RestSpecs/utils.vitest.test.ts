import {describe, expect, it} from 'vitest';
import {AFTER_ENDPOINT_MARKER, chooseParamExample, getBaseUrl, getDefaultResponseStatus, getLocalizedDescription, getResponseEntries, getTokenPlaceholder, textFilter, isRenderableExample, mergeAllOf, splitAfterEndpoint} from './utils.js';

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

describe('splitAfterEndpoint', () => {
  it('keeps descriptions without the marker whole so legacy pages render unchanged', () => {
    expect(splitAfterEndpoint('Creates a role.')).toEqual({intro: 'Creates a role.', afterEndpoint: ''});
    expect(splitAfterEndpoint(undefined)).toEqual({intro: '', afterEndpoint: ''});
  });

  it('splits at the marker so the tail can move below the endpoint header', () => {
    const description = `Creates a role.\n\n${AFTER_ENDPOINT_MARKER}\n\n<details>\n<summary>Policy reference</summary>\n\n| a | b |\n|---|---|\n\n</details>`;
    expect(splitAfterEndpoint(description)).toEqual({
      intro: 'Creates a role.\n\n',
      afterEndpoint: '\n\n<details>\n<summary>Policy reference</summary>\n\n| a | b |\n|---|---|\n\n</details>',
    });
  });

  it('localizes before splitting: the marker must be present per language', () => {
    const operation = {
      description: `Creates a role.\n\n${AFTER_ENDPOINT_MARKER}\n\n<details>`,
      'x-i18n': {'zh-CN': {description: '创建角色。'}},
    };
    expect(splitAfterEndpoint(getLocalizedDescription(operation, 'en-US')).afterEndpoint).toContain('<details>');
    expect(splitAfterEndpoint(getLocalizedDescription(operation, 'zh-CN'))).toEqual({intro: '创建角色。', afterEndpoint: ''});
  });

  it('keeps the tail textFilter-renderable, including a markdown table inside details', () => {
    const tail = `\n\n<details>\n<summary>Policy reference</summary>\n\n| resourceType | Privileges |\n|---|---|\n| \`project_member\` | view |\n\n</details>`;
    const html = textFilter(tail, 'zilliz', 'en-US');
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>Policy reference</summary>');
    expect(html).toContain('<table>');
    expect(html).toContain('<code>project_member</code>');
    expect(html).toContain('</details>');
    expect(html).not.toContain('|---|');
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

describe('isRenderableExample', () => {
  it('rejects object and array examples that would crash SSG as React children', () => {
    // Run 42171207106: the upstream spec ships `example: {}` on the on-demand
    // cluster date fields; rendering it as a child failed static generation
    // for describe-on-demand-cluster-v2 and list-on-demand-clusters-v2.
    expect(isRenderableExample({})).toBe(false);
    expect(isRenderableExample({value: 'x'})).toBe(false);
    expect(isRenderableExample([])).toBe(false);
  });

  it('keeps the exact scalar behavior the render guards always had', () => {
    expect(isRenderableExample(0)).toBe(true);
    expect(isRenderableExample('my-cluster')).toBe(true);
    expect(isRenderableExample(42)).toBe(true);
    expect(isRenderableExample('')).toBe(false);
    expect(isRenderableExample(false)).toBe(false);
    expect(isRenderableExample(null)).toBe(false);
    expect(isRenderableExample(undefined)).toBe(false);
  });
});

describe('mergeAllOf', () => {
  it('unwraps a single-element allOf while the wrapper description wins', () => {
    const merged = mergeAllOf({
      allOf: [{type: 'object', description: 'component', properties: {roleArn: {type: 'string'}}}],
      description: 'usage site',
    });
    expect(merged).toMatchObject({type: 'object', description: 'usage site', properties: {roleArn: {type: 'string'}}});
    expect(merged).not.toHaveProperty('allOf');
  });

  it('merges object parts, unions required, and keeps wrapper required', () => {
    const merged = mergeAllOf({
      allOf: [
        {type: 'object', properties: {name: {type: 'string'}}, required: ['name']},
        {type: 'object', properties: {region: {type: 'string'}}, required: ['region']},
      ],
      required: ['name'],
    });
    expect(merged.properties).toEqual({name: {type: 'string'}, region: {type: 'string'}});
    expect(merged.required).toEqual(['name', 'region']);
  });

  it('unwraps a lone non-object part with wrapper metadata layered on top', () => {
    const merged = mergeAllOf({
      allOf: [{type: 'string', enum: ['a', 'b']}],
      description: 'kind',
    });
    expect(merged).toMatchObject({type: 'string', enum: ['a', 'b'], description: 'kind'});
    expect(merged).not.toHaveProperty('allOf');
  });

  it('returns heterogeneous multi-part allOf untouched', () => {
    const schema = {
      allOf: [{type: 'object', properties: {a: {type: 'string'}}}, {type: 'string'}],
      description: 'mixed',
    };
    expect(mergeAllOf(schema)).toBe(schema);
  });

  it('returns schemas without allOf by reference', () => {
    const schema = {type: 'object', properties: {}};
    expect(mergeAllOf(schema)).toBe(schema);
    expect(mergeAllOf(undefined)).toBeUndefined();
  });
});
