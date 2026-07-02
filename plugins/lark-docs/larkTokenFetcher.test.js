const assert = require('node:assert/strict');
const Module = require('node:module');

async function testFetchTokenRetriesPrematureClose() {
  const originalLoad = Module._load;
  const originalRetryDelay = process.env.FEISHU_RETRY_DELAY_MS;
  process.env.FEISHU_RETRY_DELAY_MS = '1';
  process.env.FEISHU_HOST = 'https://open.feishu.cn';
  process.env.APP_ID = 'app-id';
  process.env.APP_SECRET = 'app-secret';

  let attempts = 0;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return async function mockedFetch() {
        attempts += 1;
        if (attempts === 1) {
          const err = new Error('Premature close');
          err.code = 'ERR_STREAM_PREMATURE_CLOSE';
          err.type = 'system';
          throw err;
        }

        return {
          status: 200,
          headers: { get: () => null },
          text: async () => JSON.stringify({
            code: 0,
            tenant_access_token: 'tenant-token',
            expire: 7200,
          }),
        };
      };
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./larkTokenFetcher')];
  delete require.cache[require.resolve('./feishuFetch')];

  try {
    const LarkTokenFetcher = require('./larkTokenFetcher');
    const fetcher = new LarkTokenFetcher();
    await fetcher.fetchToken();

    assert.equal(attempts, 2);
    assert.equal(await fetcher.token(), 'tenant-token');
  } finally {
    Module._load = originalLoad;
    if (originalRetryDelay === undefined) {
      delete process.env.FEISHU_RETRY_DELAY_MS;
    } else {
      process.env.FEISHU_RETRY_DELAY_MS = originalRetryDelay;
    }
    delete require.cache[require.resolve('./larkTokenFetcher')];
    delete require.cache[require.resolve('./feishuFetch')];
  }
}

async function run() {
  await testFetchTokenRetriesPrematureClose();
  console.log('larkTokenFetcher tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
