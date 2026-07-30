import {describe, expect, it} from 'vitest';
import {chooseParamExample, getBaseUrl, getTokenPlaceholder} from './utils.js';

const planeConfig = {
  controlPlaneKeywords: {
    zilliz: ['cluster', 'import', 'volume'],
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
