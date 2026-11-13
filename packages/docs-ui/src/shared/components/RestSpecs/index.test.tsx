import React from 'react';
import {render} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

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
import {AFTER_ENDPOINT_MARKER} from './utils.js';

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

  it('nests a named single-option combinator under its parameter like a plain object', () => {
    const html = renderRequestBody({
      type: 'object',
      properties: {
        dbName: {type: 'string', description: 'Database.'},
        schema: {
          oneOf: [{type: 'object', properties: {autoID: {type: 'boolean', description: 'Auto ID.'}}}],
          description: 'The collection schema.',
        },
      },
    });

    // Its fields sit inside the same 2rem indent a plain object property gets,
    // so they read as children of the parameter rather than as its siblings.
    expect(html).toMatch(/<span class="paramName">schema<\/span><span class="label">object<\/span>[\s\S]*?<div style="margin: 0px 0px 0px 2rem;"><div class="singleOptionPanel">[\s\S]*?<span class="paramName">autoID<\/span>/);
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

describe('RestSpecs after-endpoint description split', () => {
  const baseSpecs = (description: string) => ({
    summary: 'Create Cloud Role',
    description,
    parameters: [
      {
        name: 'Authorization',
        in: 'header',
        required: true,
        example: 'Bearer {{TOKEN}}',
        description: 'The authentication token.',
        schema: {type: 'string'},
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {type: 'object', properties: {roleName: {type: 'string', description: 'The role name.'}}},
        },
      },
    },
    responses: {},
  });

  const markerTail = `<details>\n<summary>Policy reference</summary>\n\n| resourceType | Privileges |\n|---|---|\n| \`project_member\` | view |\n\n</details>`;

  const renderSpecs = (description: string) =>
    render(<RestSpecs specs={baseSpecs(description)} endpoint="/v2/roles" method="post" target="zilliz" lang="en-US" />).container;

  it('renders the tail in a panel directly below the method/endpoint header', () => {
    const container = renderSpecs(`Creates a custom Cloud ACL role.\n\n${AFTER_ENDPOINT_MARKER}\n\n${markerTail}`);
    const html = container.innerHTML;

    // The collapsed reference renders as authored, and the marker itself never leaks.
    expect(html).toContain('<summary>Policy reference</summary>');
    expect(html).toContain('<table>');
    expect(html).toContain('class="afterEndpoint"');
    // The tail's details carries the alert classes so the site-wide .markdown
    // details system gives it the guides-side banner card chrome.
    expect(html).toContain('<details class="alert alert--info">');
    expect(html).not.toContain('zdoc:after-endpoint');

    // Intro block children: description, method/endpoint header, then the tail panel.
    const introBlock = container.querySelector('.introBlock') as HTMLElement;
    const blocks = Array.from(introBlock.children) as HTMLElement[];
    const headerIndex = blocks.findIndex(block => block.className.includes('introEndpoint'));
    const tailIndex = blocks.findIndex(block => block.className.includes('afterEndpoint'));
    expect(headerIndex).toBeGreaterThan(-1);
    expect(tailIndex).toBe(headerIndex + 1);
    expect(introBlock.innerHTML).toContain('Creates a custom Cloud ACL role.');

    // The second specLayout keeps its original grid flow (the tail must NOT
    // become a grid cell there — that auto-placement pushed Parameters into
    // the right column in production).
    const gridBlocks = Array.from(container.querySelectorAll('.specLayout')[1].children) as HTMLElement[];
    expect(gridBlocks.some(block => block.innerHTML.includes('<details>'))).toBe(false);
    expect(gridBlocks.findIndex(block => block.innerHTML.includes(paramName('roleName')))).toBe(2);
  });

  it('keeps descriptions without the marker rendering exactly as before', () => {
    const container = renderSpecs('Creates a custom Cloud ACL role.');
    expect(container.innerHTML).not.toContain('<details>');
    expect(container.innerHTML).not.toContain('<table>');
    expect((container.querySelector('.introBlock') as HTMLElement).innerHTML).toContain('Creates a custom Cloud ACL role.');
  });
});

describe('RestSpecs parameter availability badges', () => {
  const AVAILABILITY_KEY = 'x-zilliz-availability';

  it('renders the Public Preview chip for PUBLIC_PREVIEW properties', () => {
    const html = renderRequestBody({
      type: 'object',
      properties: {
        fieldName: {type: 'string', description: 'The field to drop.', [AVAILABILITY_KEY]: 'PUBLIC_PREVIEW'},
        collectionName: {type: 'string', description: 'The target collection.'},
      },
    });

    expect(html).toContain('class="availabilityBadge"');
    expect(html).toContain('>Public Preview</span>');
    // The unmarked sibling stays chip-free.
    const badges = html.match(/class="availabilityBadge"/g) ?? [];
    expect(badges.length).toBe(1);
  });

  it('renders nothing for GA, unknown tiers, or missing marks', () => {
    const html = renderRequestBody({
      type: 'object',
      properties: {
        gaField: {type: 'string', [AVAILABILITY_KEY]: 'GA'},
        unknownField: {type: 'string', [AVAILABILITY_KEY]: 'SOON'},
        plainField: {type: 'string'},
      },
    });

    expect(html).not.toContain('availabilityBadge');
    expect(html).not.toContain('Public Preview');
  });

  it('localizes the chip caption for zh-CN', () => {
    const specs = {
      summary: 'Validate Storage Integration',
      description: 'Validates a storage integration.',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                fieldName: {type: 'string', [AVAILABILITY_KEY]: 'PUBLIC_PREVIEW'},
              },
            },
            example: {},
          },
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

    const html = render(<RestSpecs specs={specs} endpoint="/v2/storageIntegrations/validate" method="post" target="zilliz" lang="zh-CN" />).container.innerHTML;
    expect(html).toContain('class="availabilityBadge"');
    expect(html).toContain('公测版');
  });

  it('renders the chip on header/query parameters', () => {
    const specs = {
      summary: 'List Clusters',
      description: 'Lists clusters.',
      parameters: [
        {name: 'Authorization', in: 'header', required: true, schema: {type: 'string'}},
        {name: 'PreviewOnly', in: 'query', schema: {type: 'string', [AVAILABILITY_KEY]: 'PUBLIC_PREVIEW'}},
      ],
      requestBody: {
        content: {
          'application/json': {schema: {type: 'object', properties: {}}, example: {}},
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

    const html = render(<RestSpecs specs={specs} endpoint="/v2/clusters" method="get" target="zilliz" lang="en-US" />).container.innerHTML;
    expect(html).toContain('class="availabilityBadge"');
    expect(html).toContain('>Public Preview</span>');
  });
});

describe('RestSpecs parameter next/current channel gating', () => {
  const ENV_KEY = '__ZDOC_ENV__';
  const setChannel = (channel: string | undefined) => {
    const envWindow = window as unknown as Record<string, unknown>;
    if (channel === undefined) delete envWindow[ENV_KEY];
    else envWindow[ENV_KEY] = { RELEASE_CHANNEL: channel };
  };
  afterEach(() => setChannel(undefined));

  const renderWithProps = (properties: Record<string, unknown>, parameters: unknown[] = [], channel?: string) => {
    setChannel(channel);
    const specs = {
      summary: 'Validate Storage Integration',
      description: 'Validates a storage integration.',
      parameters,
      requestBody: {
        content: {
          'application/json': {
            schema: {type: 'object', properties},
            example: {},
          },
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
    return render(<RestSpecs specs={specs} endpoint="/v2/storageIntegrations/validate" method="post" target="zilliz" lang="en-US" />).container.innerHTML;
  };

  it('hides include-staged properties on CURRENT and shows them on NEXT', () => {
    const properties = {
      stagedField: {type: 'string', 'x-next-channel': 'include'},
      plainField: {type: 'string'},
    };

    // No runtime injection resolves to CURRENT (fail-closed) — same as SSR.
    expect(renderWithProps(properties)).not.toContain(paramName('stagedField'));
    expect(renderWithProps(properties)).toContain(paramName('plainField'));
    // An unknown channel value must behave exactly like CURRENT.
    expect(renderWithProps(properties, [], 'bogus')).not.toContain(paramName('stagedField'));

    const nextHtml = renderWithProps(properties, [], 'next');
    expect(nextHtml).toContain(paramName('stagedField'));
    expect(nextHtml).toContain(paramName('plainField'));
  });

  it('keeps exclude-staged properties on CURRENT and removes them on NEXT', () => {
    const properties = {
      retiringField: {type: 'string', 'x-next-channel': 'exclude'},
    };

    expect(renderWithProps(properties)).toContain(paramName('retiringField'));
    expect(renderWithProps(properties, [], 'next')).not.toContain(paramName('retiringField'));
    expect(renderWithProps(properties, [], 'bogus')).toContain(paramName('retiringField'));
  });

  it('gates staged request parameters through the same runtime channel', () => {
    const parameters = [
      {name: 'PlainQuery', in: 'query', schema: {type: 'string'}},
      {name: 'StagedQuery', in: 'query', schema: {type: 'string'}, 'x-next-channel': 'include'},
    ];
    const properties = {bodyField: {type: 'string'}};

    expect(renderWithProps(properties, parameters)).not.toContain(paramName('StagedQuery'));
    expect(renderWithProps(properties, parameters)).toContain(paramName('PlainQuery'));

    const nextHtml = renderWithProps(properties, parameters, 'next');
    expect(nextHtml).toContain(paramName('StagedQuery'));
  });
});

describe('RestSpecs staged field flip pairs', () => {
  const setChannel = (channel: string | undefined) => {
    const envWindow = window as unknown as Record<string, unknown>;
    if (channel === undefined) delete envWindow['__ZDOC_ENV__'];
    else envWindow['__ZDOC_ENV__'] = { RELEASE_CHANNEL: channel };
  };
  afterEach(() => setChannel(undefined));

  it('renders exactly one side of an exclude/include flip pair per channel', () => {
    setChannel('current');
    const currentHtml = renderRequestBody({
      type: 'object',
      properties: {
        cron: {type: 'string', 'x-next-channel': 'exclude'},
        daysOfWeek: {type: 'array', 'x-next-channel': 'include', items: {type: 'integer'}},
      },
    });
    expect(currentHtml).toContain(paramName('cron'));
    expect(currentHtml).not.toContain(paramName('daysOfWeek'));

    setChannel('next');
    const nextHtml = renderRequestBody({
      type: 'object',
      properties: {
        cron: {type: 'string', 'x-next-channel': 'exclude'},
        daysOfWeek: {type: 'array', 'x-next-channel': 'include', items: {type: 'integer'}},
      },
    });
    expect(nextHtml).not.toContain(paramName('cron'));
    expect(nextHtml).toContain(paramName('daysOfWeek'));
  });

  it('keeps operation-level and parameter-level marks independent', () => {
    setChannel('next');
    const specs = {
      summary: 'Refresh External Collection',
      description: 'Refreshes an external collection.',
      parameters: [
        {name: 'StagedQuery', in: 'query', schema: {type: 'string'}, 'x-next-channel': 'include'},
        {name: 'RetiredQuery', in: 'query', schema: {type: 'string'}, 'x-next-channel': 'exclude'},
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                plainField: {type: 'string'},
              },
            },
            example: {},
          },
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

    // Operation-level marks ride in the specs JSON untouched — the page-level
    // frontmatter gate owns them; the per-field gate only evaluates fields.
    const html = render(<RestSpecs specs={specs} endpoint="/v2/vectordb/jobs/external_collection/refresh" method="post" target="zilliz" lang="en-US" />).container.innerHTML;
    expect(html).toContain(paramName('StagedQuery'));
    expect(html).not.toContain(paramName('RetiredQuery'));
    expect(html).toContain(paramName('plainField'));
  });
});
