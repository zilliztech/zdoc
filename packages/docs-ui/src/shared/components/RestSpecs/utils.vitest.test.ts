import {describe, expect, it} from 'vitest';
import {chooseParamExample, getBaseUrl, getDefaultResponseStatus, getResponseEntries, getTokenPlaceholder} from './utils.js';

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
