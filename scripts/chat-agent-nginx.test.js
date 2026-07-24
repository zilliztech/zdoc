const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const nginx = fs.readFileSync('nginx.conf', 'utf8');
const entrypoint = fs.readFileSync('docker-entrypoint.d/40-zdoc-env.sh', 'utf8');
const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
const docusaurusConfig = fs.readFileSync('docusaurus.config.ts', 'utf8');

function tokenizeNginx(config) {
  let statement = '';
  let quote;
  let escaped = false;
  let comment = false;
  const statements = [];
  const rootBlock = { blocks: [], statements: [] };
  const blockStack = [rootBlock];

  for (const character of config) {
    if (comment) {
      if (character === '\n') {
        comment = false;
        statement += character;
      }
      continue;
    }

    if (!quote && !escaped && character === '#') {
      comment = true;
      continue;
    }

    if (escaped) {
      statement += character;
      escaped = false;
    } else if (character === '\\') {
      statement += character;
      escaped = true;
    } else if (quote) {
      statement += character;
      if (character === quote) quote = undefined;
    } else if (character === '"' || character === "'") {
      statement += character;
      quote = character;
    } else if (character === ';') {
      const activeStatement = statement.trim();
      if (activeStatement) {
        statements.push(activeStatement);
        blockStack.at(-1).statements.push(activeStatement);
      }
      statement = '';
    } else if (character === '{') {
      const block = { opening: statement.trim(), blocks: [], statements: [] };
      blockStack.at(-1).blocks.push(block);
      blockStack.push(block);
      statement = '';
    } else if (character === '}') {
      if (blockStack.length > 1) blockStack.pop();
      statement = '';
    } else {
      statement += character;
    }
  }

  return { blocks: rootBlock.blocks, statements };
}

function tokenizeNginxArguments(statement) {
  let raw = '';
  let value = '';
  let quote;
  let escaped = false;
  let started = false;
  const args = [];

  const finishArgument = () => {
    if (!started) return;
    args.push({ raw, value });
    raw = '';
    value = '';
    started = false;
  };

  for (const character of statement) {
    if (escaped) {
      raw += character;
      value += character;
      escaped = false;
    } else if (character === '\\') {
      raw += character;
      escaped = true;
      started = true;
    } else if (quote) {
      raw += character;
      if (character === quote) {
        quote = undefined;
      } else {
        value += character;
      }
    } else if (character === '"' || character === "'") {
      raw += character;
      quote = character;
      started = true;
    } else if (/\s/.test(character)) {
      finishArgument();
    } else {
      raw += character;
      value += character;
      started = true;
    }
  }

  finishArgument();
  return args;
}

function findAuthorizationHeaders(statements) {
  return statements
    .map(tokenizeNginxArguments)
    .filter(
      (args) =>
        args[0]?.value.toLowerCase() === 'proxy_set_header' &&
        args[1]?.value.toLowerCase() === 'authorization',
    )
    .map((args) => args.slice(2).map(({ raw }) => raw).join(' '));
}

function findExactLocations(blocks, path) {
  const locations = [];

  for (const block of blocks) {
    const args = tokenizeNginxArguments(block.opening);
    if (
      args.length === 3 &&
      args[0].value === 'location' &&
      args[1].value === '=' &&
      args[2].value === path
    ) {
      locations.push(block);
    }
    locations.push(...findExactLocations(block.blocks, path));
  }

  return locations;
}

function findDirectivesInBlock(block, directiveName) {
  const directives = block.statements
    .map(tokenizeNginxArguments)
    .filter((args) => args[0]?.value.toLowerCase() === directiveName.toLowerCase());

  for (const childBlock of block.blocks) {
    directives.push(...findDirectivesInBlock(childBlock, directiveName));
  }

  return directives;
}

function assertAuthorizationPolicy(config) {
  const parsedConfig = tokenizeNginx(config);
  const authorizationHeaders = findAuthorizationHeaders(parsedConfig.statements);
  assert.equal(
    authorizationHeaders.length,
    2,
    'expected exactly two active Authorization proxy_set_header directives',
  );
  assert.deepEqual(
    authorizationHeaders,
    ['""', '""'],
    'expected every active Authorization proxy_set_header directive to suppress the header',
  );

  for (const path of ['/api/chat', '/api/chat/interrupt']) {
    const locations = findExactLocations(parsedConfig.blocks, path);
    assert.equal(locations.length, 1, `expected exactly one real exact ${path} location`);
    assert.deepEqual(
      findAuthorizationHeaders(locations[0].statements),
      ['""'],
      `expected exactly one active Authorization suppression in ${path}`,
    );
    assert.equal(
      findDirectivesInBlock(locations[0], 'include').length,
      0,
      `expected no active include directives in ${path}`,
    );
  }
}

test('selects the agent at browser runtime instead of image build time', () => {
  assert.doesNotMatch(dockerfile, /CHAT_AGENT_CONFIG_CODE/);
  assert.doesNotMatch(docusaurusConfig, /chatAgentConfigCode/);
  assert.doesNotMatch(docusaurusConfig, /CHAT_AGENT_CONFIG_CODE/);
});

test('routes chat and interrupt directly to the private agent with affinity', () => {
  assert.match(nginx, /include \/etc\/nginx\/chat-agent-runtime\.conf;/);
  assert.match(nginx, /location = \/api\/chat\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/stream;/);
  assert.match(nginx, /location = \/api\/chat\/interrupt\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/interrupt;/);
  assert.ok(nginx.indexOf('location = /api/chat') < nginx.indexOf('location /api/'));
  assert.ok(entrypoint.includes('hash \\$http_x_conversation_id consistent;'));
  assert.match(entrypoint, /zone docs_agent 64k;/);
  for (const pod of [0, 1, 2]) {
    assert.match(
      entrypoint,
      new RegExp(`cloud-ai-assistant-${pod}\\.cloud-ai-assistant-hs\\.vdc\\.svc\\.cluster\\.local:9000 resolve`),
    );
  }
});

test('keeps streaming unbuffered and does not require client authentication', () => {
  assert.match(nginx, /proxy_buffering off;/);
  assert.match(nginx, /proxy_cache off;/);
  assert.match(nginx, /proxy_read_timeout 300s;/);
  assert.doesNotMatch(entrypoint, /CHAT_AGENT_AUTH_TOKEN/);
  assert.doesNotMatch(entrypoint, /chat_agent_authorization/);
  assertAuthorizationPolicy(nginx);
  assert.doesNotMatch(nginx, /Bearer /);
});

test('does not count commented-out Authorization stripping directives', () => {
  const commentedAuthorization = nginx.replace(
    /^(\s*)proxy_set_header Authorization "";/gm,
    '$1# proxy_set_header Authorization "";',
  );

  assert.throws(
    () => assertAuthorizationPolicy(commentedAuthorization),
    /active Authorization/,
  );
});

test('rejects lowercase non-empty Authorization forwarding directives', () => {
  const forwardedAuthorization = `${nginx}\nproxy_set_header authorization $http_authorization;\n`;

  assert.throws(
    () => assertAuthorizationPolicy(forwardedAuthorization),
    /active Authorization/,
  );
});

test('rejects same-line lowercase Authorization forwarding directives', () => {
  const forwardedAuthorization = nginx.replace(
    'proxy_set_header Accept text/event-stream;',
    'proxy_set_header Accept text/event-stream; proxy_set_header authorization $http_authorization;',
  );

  assert.throws(
    () => assertAuthorizationPolicy(forwardedAuthorization),
    /active Authorization/,
  );
});

test('rejects quoted Authorization header-name forwarding directives', () => {
  const forwardedAuthorization = nginx.replace(
    'proxy_set_header Accept text/event-stream;',
    'proxy_set_header Accept text/event-stream; proxy_set_header "Authorization" $http_authorization;',
  );

  assert.throws(
    () => assertAuthorizationPolicy(forwardedAuthorization),
    /active Authorization/,
  );
});

test('rejects escaped Authorization header-name forwarding directives', () => {
  const forwardedAuthorization = nginx.replace(
    'proxy_set_header Accept text/event-stream;',
    'proxy_set_header Accept text/event-stream; proxy_set_header Authoriza\\tion $http_authorization;',
  );

  assert.throws(
    () => assertAuthorizationPolicy(forwardedAuthorization),
    /active Authorization/,
  );
});

test('rejects quoted text impersonating exact chat location blocks', () => {
  const fakeLocations = `map $http_user_agent $fake_chat_locations {
    default 'location = /api/chat {
        proxy_set_header Authorization "";
    }
    location = /api/chat/interrupt {
        proxy_set_header Authorization "";
    }';
}

`;
  const impersonatedLocations = `${fakeLocations}${nginx
    .replace(/^\s*proxy_set_header Authorization "";\n/gm, '')
    .replace(
      '    location /api/ {',
      '    location /api/ {\n        proxy_set_header Authorization "";',
    )
    .replace(
      '    location / {',
      '    location / {\n        proxy_set_header Authorization "";',
    )}`;

  assert.throws(
    () => assertAuthorizationPolicy(impersonatedLocations),
    /suppression in \/api\/chat/,
  );
});

test('rejects include directives inside protected chat locations', () => {
  const includedAuthorization = nginx.replace(
    'proxy_set_header Accept text/event-stream;',
    'proxy_set_header Accept text/event-stream; include /tmp/forward.inc;',
  );

  assert.throws(
    () => assertAuthorizationPolicy(includedAuthorization),
    /include.*\/api\/chat/,
  );
});
