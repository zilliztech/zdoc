const assert = require('node:assert/strict');
const Module = require('node:module');

async function testFeishuJsonFetchesAreThrottled() {
  const originalLoad = Module._load;
  let activeFetches = 0;
  let maxActiveFetches = 0;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return async function mockedFetch() {
        activeFetches += 1;
        maxActiveFetches = Math.max(maxActiveFetches, activeFetches);

        await new Promise(resolve => setTimeout(resolve, 20));

        activeFetches -= 1;
        return {
          status: 200,
          headers: { get: () => null },
          text: async () => '{"code":0,"data":{}}',
        };
      };
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./larkDocScraper')];
  const larkDocScraper = require('./larkDocScraper');
  Module._load = originalLoad;

  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');
  scraper.token = 'tenant-token';

  await Promise.all([
    scraper.__fetchFeishuJson('https://open.feishu.cn/a', {}, 'a'),
    scraper.__fetchFeishuJson('https://open.feishu.cn/b', {}, 'b'),
    scraper.__fetchFeishuJson('https://open.feishu.cn/c', {}, 'c'),
  ]);

  assert.equal(maxActiveFetches, 1);
}

async function run() {
  await testFeishuJsonFetchesAreThrottled();
  console.log('lark-docs scraper tests passed');
}

run();
