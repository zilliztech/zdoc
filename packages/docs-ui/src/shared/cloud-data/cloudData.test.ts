import {describe, expect, it} from 'vitest';
import renderModule from './render.js';
import adapterModule from './adapter.js';

const {renderFragment, escapeText} = renderModule;
const {buildModel} = adapterModule;

// Golden fixtures transcribed from the LIVE dev pages (the merged regions
// tables of content/en + content/zh-CN cloud-providers-and-regions and the
// feature/IP tables). Any diff here is a visible change to the live table
// layout. The fixtures carry the PAGE's availability values: this suite locks
// the renderer grammar, not the CMS data (known data drift is spec §6-10).

function regionRow(continent: string, id: string, name: string, deployments: string[], computeTypes: string[], byocOnly = false) {
  return {continent, id, name, deployments, computeTypes, byocOnly};
}

const enAwsRegions = [
      {continent: 'North America', id: 'us-west-2', name: 'Oregon, USA', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'North America', id: 'us-east-1', name: 'N. Virginia, USA', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'North America', id: 'us-east-2', name: 'Ohio, USA', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'North America', id: 'ca-central-1', name: 'Canada (Central)', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Europe', id: 'eu-central-1', name: 'Frankfurt, Germany', deployments: ['Free & Serverless', 'Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Europe', id: 'eu-west-1', name: 'Ireland', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Europe', id: 'eu-west-2', name: 'London, United Kingdom', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Asia', id: 'ap-northeast-1', name: 'Tokyo, Japan', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Asia', id: 'ap-southeast-1', name: 'Singapore', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Asia', id: 'ap-northeast-2', name: 'Seoul, South Korea', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: 'Asia', id: 'ap-east-1', name: 'Hong Kong SAR', deployments: ['BYOC'], computeTypes: [], byocOnly: true},
      {continent: 'Asia', id: 'ap-southeast-7', name: 'Thailand', deployments: ['BYOC'], computeTypes: [], byocOnly: true},
      {continent: 'Oceania', id: 'ap-southeast-2', name: 'Sydney, Australia', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
];

const zhAlibabaRegions = [
      {continent: '中国内地', id: 'cn-hangzhou', name: '华东1（杭州）', deployments: ['Free & Serverless', 'Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '中国内地', id: 'cn-shanghai', name: '华东2（上海）', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '中国内地', id: 'cn-beijing', name: '华北2（北京）', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '中国内地', id: 'cn-shenzhen', name: '华南1（深圳）', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '北美', id: 'us-east-1', name: '美国（弗吉尼亚）', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '亚太', id: 'ap-southeast-1', name: '新加坡', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
      {continent: '中东', id: 'me-central-1', name: '沙特（利雅得-合作伙伴运营）', deployments: ['Dedicated', 'BYOC'], computeTypes: ['Serving cluster', 'On-demand compute'], byocOnly: false},
];

const en = {
  site: 'en', locale: 'en', updatedAt: '2026-10-26T00:00:00Z',
  providers: [
    {key: 'aws', name: 'AWS', anchor: 'aws', regions: enAwsRegions, ipRows: [
      {region: 'us-west-2', location: 'Oregon, USA', cidrs: ['54.200.111.111', '34.218.171.123']},
    ]},
    {key: 'gcp', name: 'Google Cloud', anchor: 'google-cloud', regions: [
      regionRow('North America', 'us-west1', 'Oregon, USA', ['Dedicated', 'BYOC'], ['Serving cluster', 'On-demand compute']),
    ], ipRows: []},
    {key: 'azure', name: 'Microsoft Azure', anchor: 'azure', regions: [
      regionRow('North America', 'East US', 'Virginia, USA', ['Dedicated', 'BYOC'], ['Serving cluster', 'On-demand compute']),
    ], ipRows: []},
  ],
  serviceIps: [{region: 'us-west-2', location: 'Oregon, USA', cidrs: ['54.200.111.111']}],
  matrices: {
    'compute-types': {
      key: 'compute-types', rowHeader: 'Compute type',
      rows: [
        {labelHtml: 'Always-on compute (<a href="./manage-cluster">Serving cluster</a>)', label: 'Always-on compute (Serving cluster)', cells: {aws: {kind: 'all'}, gcp: {kind: 'all'}, azure: {kind: 'all'}}},
        {label: 'On-demand compute', href: './on-demand-cluster', cells: {aws: {kind: 'all'}, gcp: {kind: 'none'}, azure: {kind: 'partial', regions: ['East US']}}},
      ],
    },
    'deployment-options': {
      key: 'deployment-options', rowHeader: 'Deployment option',
      rows: [
        {label: 'SaaS (Free & Serverless)', cells: {aws: {kind: 'partial', regions: ['eu-central-1']}, gcp: {kind: 'partial', regions: ['us-west1']}, azure: {kind: 'none'}}},
        {label: 'SaaS (Dedicated)', cells: {aws: {kind: 'all'}, gcp: {kind: 'all'}, azure: {kind: 'all'}}},
        {label: 'BYOC', cells: {aws: {kind: 'all', extra: 'ap-east-1 (Hong Kong SAR)'}, gcp: {kind: 'all'}, azure: {kind: 'all'}}},
      ],
    },
    features: {
      key: 'features', rowHeader: 'Feature',
      rows: [
        {label: 'Volume', href: './managed-volume', cells: {aws: {kind: 'all'}, gcp: {kind: 'all'}, azure: {kind: 'none'}}},
        {label: 'Global cluster', href: './global-cluster-explained', cells: {aws: {kind: 'all'}, gcp: {kind: 'partial', regions: ['us-central1', 'us-east4'], note: '[Contact us](http://support.zilliz.com) if you need to use this feature in Google Cloud regions.'}, azure: {kind: 'none'}}},
      ],
    },
  },
};

const zh = {
  site: 'zh-CN', locale: 'zh-CN', updatedAt: '2026-10-26T00:00:00Z',
  providers: [
    {key: 'alibaba', name: '阿里云', anchor: 'alibaba-cloud', regions: zhAlibabaRegions, ipRows: [
      {region: 'cn-hangzhou', location: '华东1（杭州）', cidrs: ['114.55.232.32']},
    ]},
    {key: 'tencent', name: '腾讯云', anchor: 'tencent-cloud', regions: [
      regionRow('中国内地', 'ap-beijing', '华北地区（北京）', ['Dedicated', 'BYOC'], ['Serving 集群']),
    ], ipRows: []},
    {key: 'amazon-cn', name: '亚马逊云科技', anchor: 'amazon-cn', regions: [
      regionRow('中国内地', 'cn-northwest-1', '中国（宁夏）', ['Dedicated', 'BYOC'], ['Serving 集群', '按需计算']),
    ], ipRows: []},
  ],
  serviceIps: [{region: 'cn-hangzhou', location: '华东1（杭州）', cidrs: ['114.55.232.32']}],
  matrices: {
    'compute-types': {
      key: 'compute-types', rowHeader: '计算类型',
      rows: [
        {label: 'Serving 集群', cells: {alibaba: {kind: 'all'}, tencent: {kind: 'all'}, 'amazon-cn': {kind: 'all'}}},
        {label: '按需计算', cells: {alibaba: {kind: 'all'}, tencent: {kind: 'none'}, 'amazon-cn': {kind: 'all'}}},
      ],
    },
    'deployment-options': {
      key: 'deployment-options', rowHeader: '部署方式',
      rows: [
        {label: 'SaaS（Free 和 Serverless）', cells: {alibaba: {kind: 'partial', regions: ['华东1（杭州）']}, tencent: {kind: 'none'}, 'amazon-cn': {kind: 'none'}}},
        {label: 'SaaS（Dedicated）', cells: {alibaba: {kind: 'all'}, tencent: {kind: 'all'}, 'amazon-cn': {kind: 'all'}}},
        {label: 'BYOC', cells: {alibaba: {kind: 'all'}, tencent: {kind: 'all'}, 'amazon-cn': {kind: 'all'}}},
      ],
    },
    features: {
      key: 'features', rowHeader: '功能',
      // The zh CMS stores every feature cell as free text — the live table is
      // therefore HTML (text cells force the HTML grammar).
      rows: [
        {label: 'Managed Volume', cells: {alibaba: {kind: 'text', text: '✅ 全部地域'}, tencent: {kind: 'text', text: '暂不支持'}, 'amazon-cn': {kind: 'text', text: '✅ 全部地域'}}},
        {label: 'Global Cluster（全球集群）', cells: {alibaba: {kind: 'text', text: 'ℹ️ 请联系我们'}, tencent: {kind: 'text', text: 'ℹ️ 请联系我们'}, 'amazon-cn': {kind: 'text', text: 'ℹ️ 请联系我们'}}},
      ],
    },
  },
};

// The en merged regions table, transcribed line for line from the dev page
// (three header rows, per-region ✅/Not available, BYOC-only rows included).
const enRegionsAwsGolden = [
"<table>",
"   <tr>",
"     <th rowspan=\"3\"><p><strong>Continent</strong></p></th>",
"     <th rowspan=\"3\"><p><strong>Region</strong></p></th>",
"     <th rowspan=\"3\"><p><strong>Location</strong></p></th>",
"     <th colspan=\"3\"><p><strong>Zilliz-Managed Cloud</strong></p></th>",
"     <th rowspan=\"3\"><p><strong>BYOC</strong></p></th>",
"   </tr>",
"   <tr>",
"     <td colspan=\"2\"><p><strong>Always-on compute (serving clusters)</strong></p></td>",
"     <td rowspan=\"2\"><p><strong>On-demand compute</strong></p></td>",
"   </tr>",
"   <tr>",
"     <td><p><strong>Free & Serverless</strong></p></td>",
"     <td><p><strong>Dedicated</strong></p></td>",
"   </tr>",
"   <tr>",
"     <td rowspan=\"4\"><p>North America</p></td>",
"     <td><p>us-west-2</p></td>",
"     <td><p>Oregon, USA</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>us-east-1</p></td>",
"     <td><p>N. Virginia, USA</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>us-east-2</p></td>",
"     <td><p>Ohio, USA</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>ca-central-1</p></td>",
"     <td><p>Canada (Central)</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td rowspan=\"3\"><p>Europe</p></td>",
"     <td><p>eu-central-1</p></td>",
"     <td><p>Frankfurt, Germany</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>eu-west-1</p></td>",
"     <td><p>Ireland</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>eu-west-2</p></td>",
"     <td><p>London, United Kingdom</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td rowspan=\"5\"><p>Asia</p></td>",
"     <td><p>ap-northeast-1</p></td>",
"     <td><p>Tokyo, Japan</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>ap-southeast-1</p></td>",
"     <td><p>Singapore</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>ap-northeast-2</p></td>",
"     <td><p>Seoul, South Korea</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>ap-east-1</p></td>",
"     <td><p>Hong Kong SAR</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>ap-southeast-7</p></td>",
"     <td><p>Thailand</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>Oceania</p></td>",
"     <td><p>ap-southeast-2</p></td>",
"     <td><p>Sydney, Australia</p></td>",
"     <td><p>Not available</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"</table>",
].join('\n');

const zhRegionsAlibabaGolden = [
"<table>",
"   <tr>",
"     <th rowspan=\"3\"><p>大洲</p></th>",
"     <th rowspan=\"3\"><p>地域 ID</p></th>",
"     <th rowspan=\"3\"><p>地域名称</p></th>",
"     <th colspan=\"3\"><p>Zilliz 托管云（SaaS）</p></th>",
"     <th rowspan=\"3\"><p>BYOC</p></th>",
"   </tr>",
"   <tr>",
"     <td colspan=\"2\"><p>Serving 集群</p></td>",
"     <td rowspan=\"2\"><p>按需计算</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>Free 和 Serverless</p></td>",
"     <td><p>Dedicated</p></td>",
"   </tr>",
"   <tr>",
"     <td rowspan=\"4\"><p>中国内地</p></td>",
"     <td><p>cn-hangzhou</p></td>",
"     <td><p>华东1（杭州）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>cn-shanghai</p></td>",
"     <td><p>华东2（上海）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>cn-beijing</p></td>",
"     <td><p>华北2（北京）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>cn-shenzhen</p></td>",
"     <td><p>华南1（深圳）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>北美</p></td>",
"     <td><p>us-east-1</p></td>",
"     <td><p>美国（弗吉尼亚）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>亚太</p></td>",
"     <td><p>ap-southeast-1</p></td>",
"     <td><p>新加坡</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"   <tr>",
"     <td><p>中东</p></td>",
"     <td><p>me-central-1</p></td>",
"     <td><p>沙特（利雅得-合作伙伴运营）</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"     <td><p>暂不支持</p></td>",
"     <td><p>✅</p></td>",
"   </tr>",
"</table>",
].join('\n');

describe('render.js merged regions table (live-page grammar)', () => {
  it('reproduces the dev en AWS table byte for byte', () => {
    expect(renderFragment(en as any, {section: 'regions', provider: 'aws'})).toBe(enRegionsAwsGolden);
  });

  it('reproduces the dev zh alibaba table byte for byte (no <strong>, zh wording)', () => {
    expect(renderFragment(zh as any, {section: 'regions', provider: 'alibaba'})).toBe(zhRegionsAlibabaGolden);
  });

  it('keeps BYOC-only regions as regular rows with not-available managed cells', () => {
    const fragment = renderFragment(en as any, {section: 'regions', provider: 'aws'});
    expect(fragment).toContain('<td><p>ap-east-1</p></td>');
    const row = fragment.slice(fragment.indexOf('ap-east-1'));
    expect(row).toContain('<td><p>Not available</p></td>');
  });
});

describe('render.js feature/IP tables', () => {
  it('renders the en features matrix with note admonition', () => {
    const fragment = renderFragment(en as any, {section: 'features'});
    expect(fragment).toContain('<th><p><strong>Feature</strong></p></th>');
    expect(fragment).toContain('<Admonition type="info" icon="📘" title="Note">');
    expect(fragment).toContain('✅ All listed regions');
    expect(fragment).toContain('Not available');
  });

  it('renders the zh features matrix with the live zh wording', () => {
    const fragment = renderFragment(zh as any, {section: 'features'});
    expect(fragment).toContain('<th><p>功能</p></th>');
    expect(fragment).toContain('<td><p>✅ 全部地域</p></td>');
    expect(fragment).toContain('<td><p>暂不支持</p></td>');
    expect(fragment).toContain('<td><p>ℹ️ 请联系我们</p></td>');
  });

  it('renders service and per-provider IP tables', () => {
    expect(renderFragment(en as any, {section: 'service-ips'})).toContain('`54.200.111.111`');
    expect(renderFragment(zh as any, {section: 'region-ips', provider: 'alibaba'})).toContain('`114.55.232.32`');
  });
});

describe('render.js guards', () => {
  it('escapes MDX-unsafe characters in text', () => {
    expect(escapeText('<a>{x}</a>')).toBe('&lt;a&gt;\\{x\\}&lt;/a&gt;');
  });

  it('fails closed when a provider has no regions', () => {
    expect(() => renderFragment({locale: 'en', site: 'en', providers: [], matrices: {}} as any, {section: 'regions', provider: 'aws'})).toThrow();
  });

  it('fails closed on an unknown section', () => {
    expect(() => renderFragment(en as any, {section: 'nope'} as any)).toThrow('Unknown section');
  });
});

describe('adapter.js over CMS JSON', () => {
  const regionsJson = {
    data: [
      {attributes: {
        region_name: 'us-west-2', location: 'Oregon, USA', ip: '54.200.111.111, 34.218.171.123',
        provider: {data: {attributes: {name: 'AWS'}}},
        continent: {data: {attributes: {name: 'North America'}}},
        supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]},
        supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]},
        updatedAt: '2026-10-26T00:00:00Z'}},
      // BYOC-only region: a regular regions row, excluded only from the
      // availability matrices and the IP tables.
      {attributes: {
        region_name: 'ap-east-1', location: 'Hong Kong SAR', ip: null,
        provider: {data: {attributes: {name: 'AWS'}}},
        continent: {data: {attributes: {name: 'Asia'}}},
        supported_deployments: {data: [{attributes: {name: 'BYOC'}}]},
        supported_compute_types: {data: []},
        updatedAt: '2026-10-26T00:00:00Z'}},
    ],
  };
  const featuresJson = {
    data: [
      {attributes: {
        name: 'CMEK',
        links: 'https://zilliverse.feishu.cn/wiki/internal-token',
        region_availability: [
          {cloud_provider: {data: {attributes: {name: 'AWS'}}}, supported_regions: '✅ All listed regions'},
          {cloud_provider: {data: {attributes: {name: 'Google Cloud'}}}, supported_regions: 'Available on [request](https://support.zilliz.com/) in:\n\n- `us-central1`'},
          {cloud_provider: {data: {attributes: {name: 'Microsoft Azure'}}}, supported_regions: 'Not available'},
        ]}},
      {attributes: {
        name: 'Volume',
        links: 'https://docs.zilliz.com/docs/managed-volume',
        region_availability: [
          {cloud_provider: {data: {attributes: {name: 'AWS'}}}, supported_regions: '✅ All listed regions'},
          {cloud_provider: {data: {attributes: {name: 'Google Cloud'}}}, supported_regions: '✅ All listed regions'},
          {cloud_provider: {data: {attributes: {name: 'Microsoft Azure'}}}, supported_regions: 'Not available'},
        ]}},
    ],
  };

  const model = buildModel('en', regionsJson as any, featuresJson as any);

  it('sorts regions by the CMS record id, not by API response order', () => {
    // CMS edits move records to the front of the response; the record id is
    // the stable authored order.
    const edited = {
      data: [
        {id: 9, attributes: {region_name: 'zz-edited', location: 'Edited Today', ip: null, provider: {data: {attributes: {name: 'AWS'}}}, continent: {data: {attributes: {name: 'Asia'}}}, supported_deployments: {data: [{attributes: {name: 'BYOC'}}]}, supported_compute_types: {data: []}}},
        {id: 2, attributes: {region_name: 'us-west-2', location: 'Oregon, USA', ip: null, provider: {data: {attributes: {name: 'AWS'}}}, continent: {data: {attributes: {name: 'North America'}}}, supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]}, supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]}}},
      ],
    };
    const model = buildModel('en', edited as any, featuresJson as any);
    const aws = model.providers.find((provider) => provider.key === 'aws');
    expect(aws?.regions.map((region) => region.id)).toEqual(['us-west-2', 'zz-edited']);
  });

  it('keeps every region as a merged-table row, BYOC-only included', () => {
    const aws = model.providers.find((provider) => provider.key === 'aws');
    expect(aws?.regions.map((region) => region.id)).toEqual(['us-west-2', 'ap-east-1']);
    expect(aws?.regions[1].byocOnly).toBe(true);
  });

  it('keeps BYOC-only regions out of the IP tables and the availability matrices', () => {
    const aws = model.providers.find((provider) => provider.key === 'aws');
    expect(aws?.ipRows.map((row) => row.region)).toEqual(['us-west-2']);
    const byocRow = model.matrices['deployment-options'].rows.find((row) => row.label === 'BYOC');
    expect(byocRow?.cells.aws).toEqual({kind: 'all', extra: 'ap-east-1 (Hong Kong SAR)'});
  });

  it('parses the comma-separated `ip` string and applies the feature link policy', () => {
    const rows = model.matrices.features.rows;
    expect(rows[0].href).toBeUndefined();
    expect(rows[1].href).toBe('/docs/managed-volume');
    expect(rows[0].cells.gcp).toEqual({kind: 'text', text: 'Available on [request](https://support.zilliz.com/) in:\n\n- `us-central1`'});
    expect(model.serviceIps.map((row) => row.region)).toEqual(['us-west-2']);
  });
});
