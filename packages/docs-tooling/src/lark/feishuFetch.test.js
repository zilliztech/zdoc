const assert = require('node:assert/strict');
const Module = require('node:module');

async function withMockedFetch(mockedFetch, callback) {
  const originalLoad = Module._load;
  const originalRetryDelay = process.env.FEISHU_RETRY_DELAY_MS;
  const originalRateLimitFallback = process.env.FEISHU_RATE_LIMIT_FALLBACK_MS;
  process.env.FEISHU_RETRY_DELAY_MS = '1';
  process.env.FEISHU_RATE_LIMIT_FALLBACK_MS = '20';

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return mockedFetch;
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./feishuFetch')];

  try {
    await callback(require('./feishuFetch'));
  } finally {
    Module._load = originalLoad;
    if (originalRetryDelay === undefined) {
      delete process.env.FEISHU_RETRY_DELAY_MS;
    } else {
      process.env.FEISHU_RETRY_DELAY_MS = originalRetryDelay;
    }
    if (originalRateLimitFallback === undefined) {
      delete process.env.FEISHU_RATE_LIMIT_FALLBACK_MS;
    } else {
      process.env.FEISHU_RATE_LIMIT_FALLBACK_MS = originalRateLimitFallback;
    }
    delete require.cache[require.resolve('./feishuFetch')];
  }
}

async function testFetchFeishuBufferRetriesPrematureCloseWhileReadingBody() {
  let attempts = 0;

  await withMockedFetch(async () => {
    attempts += 1;
    if (attempts === 1) {
      return {
        status: 200,
        headers: { get: () => null },
        buffer: async () => {
          const err = new Error('Premature close');
          err.code = 'ERR_STREAM_PREMATURE_CLOSE';
          err.type = 'system';
          throw err;
        },
      };
    }

    return {
      status: 200,
      headers: { get: () => null },
      buffer: async () => Buffer.from('ok'),
    };
  }, async ({ fetchFeishuBufferWithRetry }) => {
    const buffer = await fetchFeishuBufferWithRetry('https://open.feishu.cn/media', {}, 'download media');

    assert.equal(attempts, 2);
    assert.equal(buffer.toString(), 'ok');
  });
}

async function testFetchJsonRetriesPrematureCloseWhileReadingBody() {
  let attempts = 0;

  await withMockedFetch(async () => {
    attempts += 1;
    if (attempts === 1) {
      return {
        status: 200,
        headers: { get: () => null },
        text: async () => {
          const err = new Error('Premature close');
          err.code = 'ERR_STREAM_PREMATURE_CLOSE';
          err.type = 'system';
          throw err;
        },
      };
    }

    return {
      status: 200,
      headers: { get: () => null },
      text: async () => '{"ok":true}',
    };
  }, async ({ fetchJsonWithRetry }) => {
    const json = await fetchJsonWithRetry('https://api.figma.com/v1/files/a', {}, 'fetch figma json');

    assert.equal(attempts, 2);
    assert.equal(json.ok, true);
  });
}

async function testFetchTextRetriesPrematureCloseWhileReadingBody() {
  let attempts = 0;

  await withMockedFetch(async () => {
    attempts += 1;
    if (attempts === 1) {
      return {
        status: 200,
        headers: { get: () => null },
        text: async () => {
          const err = new Error('Premature close');
          err.code = 'ERR_STREAM_PREMATURE_CLOSE';
          err.type = 'system';
          throw err;
        },
      };
    }

    return {
      status: 200,
      headers: { get: () => null },
      text: async () => '<html>ok</html>',
    };
  }, async ({ fetchTextWithRetry }) => {
    const html = await fetchTextWithRetry('https://github.com/milvus-io/pymilvus/releases', {}, 'fetch releases');

    assert.equal(attempts, 2);
    assert.equal(html, '<html>ok</html>');
  });
}

async function testFetchJsonRetryLogIncludesParsedResponseDetails() {
  let attempts = 0;
  const stderrWrite = process.stderr.write;
  const logs = [];
  process.stderr.write = (message) => {
    logs.push(String(message));
    return true;
  };

  try {
    await withMockedFetch(async () => {
      attempts += 1;
      return {
        status: 400,
        headers: { get: () => null },
        text: async () => JSON.stringify({
          code: 99991400,
          msg: 'Too many requests',
          status: 429,
        }),
      };
    }, async ({ fetchFeishuJsonWithRetry }) => {
      await assert.rejects(
        () => fetchFeishuJsonWithRetry('https://open.feishu.cn/wiki', {}, 'get wiki node token'),
        /retryable response 400/
      );

      assert.equal(attempts, 5);
      assert.match(logs.join(''), /code=99991400/);
      assert.match(logs.join(''), /status=429/);
      assert.match(logs.join(''), /msg=Too many requests/);
    });
  } finally {
    process.stderr.write = stderrWrite;
  }
}

async function testFeishuFrequencyLimitUsesConservativeFallbackWhenResetHeaderIsMissing() {
  let attempts = 0;
  const stderrWrite = process.stderr.write;
  const logs = [];
  process.stderr.write = (message) => {
    logs.push(String(message));
    return true;
  };

  try {
    await withMockedFetch(async () => {
      attempts += 1;
      if (attempts === 1) {
        return {
          status: 400,
          headers: { get: () => null },
          text: async () => JSON.stringify({
            code: 99991400,
            msg: 'request trigger frequency limit',
          }),
        };
      }

      return {
        status: 200,
        headers: { get: () => null },
        text: async () => '{"code":0,"data":{"ok":true}}',
      };
    }, async ({ fetchFeishuJsonWithRetry }) => {
      const json = await fetchFeishuJsonWithRetry('https://open.feishu.cn/wiki', {}, 'get wiki node token');

      assert.equal(attempts, 2);
      assert.equal(json.data.ok, true);
      assert.match(logs.join(''), /retrying in 20ms/);
    });
  } finally {
    process.stderr.write = stderrWrite;
  }
}

async function run() {
  await testFetchFeishuBufferRetriesPrematureCloseWhileReadingBody();
  await testFetchJsonRetriesPrematureCloseWhileReadingBody();
  await testFetchTextRetriesPrematureCloseWhileReadingBody();
  await testFetchJsonRetryLogIncludesParsedResponseDetails();
  await testFeishuFrequencyLimitUsesConservativeFallbackWhenResetHeaderIsMissing();
  console.log('feishuFetch tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
