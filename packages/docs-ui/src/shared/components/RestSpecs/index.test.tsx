import React from 'react';
import {render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

// Vitest stubs CSS modules as empty objects, which would erase every class
// name; map each key to itself so the visibility contract is assertable.
vi.mock('./index.module.css', () => ({
  default: new Proxy({}, {get: (_target, key) => (typeof key === 'string' ? key : undefined)}),
}));

// The config alias resolves into @docusaurus/core sources, which are JSX in
// .js inside node_modules; a factory mock keeps that file untransformed.
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        planeConfig: {
          dataPlaneKeywords: {zilliz: [], milvus: []},
          controlPlaneKeywords: {zilliz: [], milvus: []},
        },
      },
    },
  }),
}));

import RestSpecs from './index.js';

const paramName = (name: string) => `<span class="paramName">${name}</span>`;

const renderRequestBody = (schema: Record<string, unknown>, target = 'zilliz') => {
  const specs = {
    summary: 'Validate Storage Integration',
    description: 'Validates a storage integration.',
    parameters: [],
    requestBody: {
      content: {
        'application/json': {schema, example: {}},
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: {type: 'object', properties: {code: {type: 'integer'}}},
            example: {code: 0},
          },
        },
      },
    },
  };

  return render(<RestSpecs specs={specs} endpoint="/v2/storageIntegrations/validate" method="post" target={target} lang="en-US" />).container.innerHTML;
};

describe('RestSpecs schema combinators', () => {
  it('renders a single-element allOf property as the object it wraps', () => {
    const html = renderRequestBody({
      type: 'object',
      properties: {
        externalCred: {
          allOf: [{
            type: 'object',
            description: 'Component-level description.',
            properties: {
              roleArn: {type: 'string', description: 'The role ARN.'},
              clientId: {type: 'string', description: 'The client ID.'},
            },
          }],
          description: 'Provider-specific credential fields.',
        },
      },
    });

    expect(html).toContain(`${paramName('externalCred')}<span class="label">object</span>`);
    expect(html).not.toContain('<span class="label">undefined</span>');
    expect(html).toContain('Provider-specific credential fields.');
    expect(html).not.toContain('Component-level description.');
    expect(html).toContain(paramName('roleArn'));
    expect(html).toContain(paramName('clientId'));
    expect(html).not.toContain('tabPanel');
  });

  it('merges multi-part allOf properties and required lists', () => {
    const html = renderRequestBody({
      type: 'object',
      properties: {
        detail: {
          allOf: [
            {type: 'object', properties: {name: {type: 'string', description: 'Name.'}}},
            {type: 'object', properties: {region: {type: 'string', description: 'Region.'}}, required: ['region']},
          ],
          description: 'Merged detail.',
        },
      },
    });

    expect(html).toContain(paramName('name'));
    expect(html).toContain(`${paramName('region')}<span class="label">string</span><span class="required">`);
    expect(html).not.toContain(`${paramName('name')}<span class="label">string</span><span class="required">`);
  });

  it('keeps a combinator filtered down to one option visible outside any tab group', () => {
    const html = renderRequestBody({
      anyOf: [
        {type: 'object', properties: {clusterId: {type: 'string', description: 'Cluster ID.'}}},
        {type: 'object', properties: {dbName: {type: 'string', description: 'Database.'}}, 'x-include-target': ['milvus']},
      ],
    });

    expect(html).toContain('<div class="singleOptionPanel">');
    expect(html).toContain(paramName('clusterId'));
    expect(html).not.toContain(paramName('dbName'));
    expect(html).not.toContain('tabPanel');
  });

  it('still renders multi-option combinators as a radio tab group', () => {
    const html = renderRequestBody({
      oneOf: [
        {'x-tab-label': 'quick setup', type: 'object', properties: {dimension: {type: 'integer'}}},
        {'x-tab-label': 'custom setup', type: 'object', properties: {schema: {type: 'object', properties: {}}}},
      ],
    });

    expect(html).toContain('<div class="tabs"');
    expect(html.match(/type="radio"/g)).toHaveLength(2);
    expect(html.match(/<div class="tabPanel">/g)).toHaveLength(2);
    expect(html).not.toContain('singleOptionPanel');
  });
});
