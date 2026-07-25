export const ZDOC_CN_COMMIT = 'b1900473dddf8db2d56c11387211a7014b54c160';

export const markdownNormalizerFixture = Object.freeze({
  sourcePaths: Object.freeze([
    'plugins/cn-publish-normalizer/normalizeCnContent.test.js',
    'plugins/cn-publish-normalizer/remarkCnPublishNormalizer.test.js',
  ]),
  sourceBlobIds: Object.freeze([
    '079654e4720106e87793c1cf46232cdd84a3e456',
    'babaf500979e6efb9112d0fc01fd50ebd0375e93',
  ]),
  input: [
    '---',
    'slug: https://support.zilliz.com/hc/en-us',
    'support_url: https://support.zilliz.com/hc/en-us',
    'provider_note: aws',
    '---',
    '',
    '| kind | value |',
    '| :--- | ---: |',
    '| support | https://support.zilliz.com/hc/en-us |',
    '| sales | https://zilliz.com/contact-sales?from=footer |',
    '| pricing | https://zilliz.com/pricing#calculator |',
    '',
  ].join('\n'),
  output: [
    '---',
    'slug: https://support.zilliz.com/hc/en-us',
    'support_url: https://support.zilliz.com/hc/en-us',
    'provider_note: aws',
    '---',
    '',
    '| kind | value |',
    '| :--- | ---: |',
    '| support | https://support.zilliz.com.cn/hc/zh-cn |',
    '| sales | https://zilliz.com.cn/contact-sales?from=footer |',
    '| pricing | https://zilliz.com.cn/pricing#calculator |',
    '',
  ].join('\n'),
});

export const compactMarkdownTableFixture = Object.freeze({
  input: [
    '|kind|value|',
    '|---|---|',
    '|support|https://support.zilliz.com/hc/en-us|',
    '|sales|https://zilliz.com/contact-sales?from=footer|',
    '|pricing|https://zilliz.com/pricing#calculator|',
    '',
  ].join('\n'),
  output: [
    '|kind|value|',
    '|---|---|',
    '|support|https://support.zilliz.com.cn/hc/zh-cn|',
    '|sales|https://zilliz.com.cn/contact-sales?from=footer|',
    '|pricing|https://zilliz.com.cn/pricing#calculator|',
    '',
  ].join('\n'),
});

export const restReplacementFixture = Object.freeze({
  sourcePaths: Object.freeze([
    'config/cn-publish-replacements.js',
    'scripts/docs-workflow/rest-reconciliation.test.js',
  ]),
  sourceBlobIds: Object.freeze([
    'b91fd06bcf19272bd07af2524c12a5f28451ff57',
    '7d0bfb11e07d7a4aff93afdbc8c302fb096dd9ae',
  ]),
  input: [
    '---',
    'slug: https://support.zilliz.com/hc/en-us',
    'cloudId: aws',
    'regionId: aws-us-west-2',
    '---',
    '',
    '| field | example |',
    '| :--- | ---: |',
    '| cloudId | aws |',
    '| regionId | aws-us-west-2 |',
    '| endpoint | https://YOUR_CLUSTER_ENDPOINT |',
    '| object_url | ://your/data/path/in/external/storage.json |',
    '',
  ].join('\n'),
  output: [
    '---',
    'slug: https://support.zilliz.com/hc/en-us',
    'cloudId: aws',
    'regionId: aws-us-west-2',
    '---',
    '',
    '| field | example |',
    '| :--- | ---: |',
    '| cloudId | ali |',
    '| regionId | ali-cn-hangzhou |',
    '| endpoint | https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530 |',
    '| object_url | oss://{bucket_name}/you/data/in/storage.json |',
    '',
  ].join('\n'),
});

export const compactRestTableFixture = Object.freeze({
  input: [
    '|kind|value|',
    '|---|---|',
    '|cluster|https://YOUR_CLUSTER_ENDPOINT|',
    '|project|https://YOUR_PROJECT_ENDPOINT|',
    '|legacy|https://{project-id}.{region}.api.zillizcloud.com/v2/jobs|',
    '|object_url|://your/data/path/in/external/storage.json|',
    '',
  ].join('\n'),
  output: [
    '|kind|value|',
    '|---|---|',
    '|cluster|https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530|',
    '|project|https://{project-id}.{region}.api.cloud.zilliz.com.cn|',
    '|legacy|https://{project-id}.{region}.api.cloud.zilliz.com.cn/v2/jobs|',
    '|object_url|oss://{bucket_name}/you/data/in/storage.json|',
    '',
  ].join('\n'),
});
