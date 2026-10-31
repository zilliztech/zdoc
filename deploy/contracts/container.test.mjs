import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRepository = 'https://github.com/zilliztech/zdoc';
const labelNames = {
  source: 'org.opencontainers.image.source',
  revision: 'org.opencontainers.image.revision',
  site: 'com.zilliz.zdoc.site',
  jenkinsBuildId: 'com.zilliz.jenkins.build-id',
};

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

function dockerfile(site) {
  return read(`deploy/${site}/Dockerfile`);
}

function occurrences(contents, pattern) {
  return [...contents.matchAll(pattern)].length;
}

function dockerignoreEntries() {
  return read('.dockerignore')
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function isIgnored(relativePath, entries = dockerignoreEntries()) {
  const normalized = relativePath.replace(/^\.\//u, '').replace(/\/$/u, '');
  if (normalized === '.' || normalized === '') return false;
  let ignored = false;
  for (const entry of entries) {
    const negated = entry.startsWith('!');
    const candidate = (negated ? entry.slice(1) : entry).replace(/^\//u, '').replace(/\/$/u, '');
    let pattern = '';
    for (let index = 0; index < candidate.length; index += 1) {
      const character = candidate[index];
      if (character === '*' && candidate[index + 1] === '*' && candidate[index + 2] === '/') {
        pattern += '(?:.*/)?';
        index += 2;
      } else if (character === '*' && candidate[index + 1] === '*') {
        pattern += '.*';
        index += 1;
      } else if (character === '*') pattern += '[^/]*';
      else if (character === '?') pattern += '[^/]';
      else pattern += character.replace(/[\\^$.*+?()[\]{}|]/u, '\\$&');
    }
    const expression = candidate.includes('/')
      ? new RegExp(`^${pattern}(?:/|$)`, 'u')
      : new RegExp(`(?:^|/)${pattern}(?:/|$)`, 'u');
    if (expression.test(normalized)) ignored = !negated;
  }
  return ignored;
}

function dockerInstructions(contents) {
  return contents
    .replace(/\\\r?\n[ \t]*/gu, ' ')
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function finalDockerStage(contents) {
  const instructions = dockerInstructions(contents);
  const finalFrom = instructions.map((instruction, index) =>
    instruction.startsWith('FROM ') ? index : -1).filter(index => index >= 0).at(-1);
  assert.notEqual(finalFrom, undefined, 'Dockerfile must declare a final stage');
  return instructions.slice(finalFrom);
}

function localCopySources(contents) {
  return dockerInstructions(contents).flatMap(line => {
    const tokens = line.split(/\s+/u);
    if (tokens[0]?.toUpperCase() !== 'COPY' || tokens.some(token => token.startsWith('--from='))) return [];
    const operands = tokens.slice(1).filter(token => !token.startsWith('--'));
    return operands.slice(0, -1);
  });
}

for (const site of ['en', 'zh-CN']) {
  test(`${site} image has an isolated build and immutable site identity`, () => {
    const contents = dockerfile(site);
    const activeContents = dockerInstructions(contents).join('\n');
    const otherSite = site === 'en' ? 'zh-CN' : 'en';

    assert.match(activeContents, /^ARG ZDOC_SHA(?:=.*)?$/m);
    assert.match(activeContents, new RegExp(`^ARG ZDOC_SITE=${site.replace('-', '\\-')}$`, 'm'));
    assert.match(activeContents, /^ARG JENKINS_BUILD_ID(?:=.*)?$/m);
    assert.match(activeContents, new RegExp(`test \\\"?\\$ZDOC_SITE\\\"? = \\\"?${site.replace('-', '\\-')}\\\"?`));
    assert.match(activeContents, /test -n "?\$ZDOC_SHA"?/);
    assert.match(activeContents, /test -n "?\$JENKINS_BUILD_ID"?/);
    assert.match(activeContents, /test "?\$\{#ZDOC_SHA\}"? -eq 40/);
    assert.match(activeContents, /ZDOC_SHA#\*\[!0-9a-f\]/);
    assert.match(activeContents, /ZDOC_PROVENANCE_COMMIT=\$\{ZDOC_SHA\}/);
    assert.match(activeContents, /ZDOC_PROVENANCE_WORKTREE=external-snapshot/);
    assert.match(activeContents, /ZDOC_PROVENANCE_TRACKED_INPUTS=deploy\/contracts\/localization-inputs\.inventory\.json/);
    assert.doesNotMatch(activeContents, /ZDOC_REFERENCE_SOURCE_SHA/);

    assert.equal(occurrences(contents, /RUN\s+pnpm install --frozen-lockfile\b/g), 1);
    assert.equal(occurrences(contents, /RUN\s+pnpm run build:(?:en|zh-CN)\b/g), 1);
    assert.match(contents, new RegExp(`RUN\\s+pnpm run build:${site.replace('-', '\\-')}\\b`));
    assert.doesNotMatch(contents, new RegExp(`pnpm run build:${otherSite.replace('-', '\\-')}\\b`));

    assert.match(contents, new RegExp(`COPY --from=build /app/build/${site.replace('-', '\\-')}/? /usr/share/nginx/html/?`));
    assert.doesNotMatch(contents, /COPY --from=build \/app\/build\/?\s/);
    assert.doesNotMatch(contents, new RegExp(`/app/build/${otherSite.replace('-', '\\-')}\\b`));
    assert.match(contents, new RegExp(`COPY deploy/${site.replace('-', '\\-')}/nginx\\.conf /etc/nginx/conf\\.d/default\\.conf`));
    assert.match(contents, /COPY deploy\/runtime\/40-zdoc-env\.sh \/docker-entrypoint\.d\/40-zdoc-env\.sh/);
    assert.match(contents, /RUN chmod 755 \/docker-entrypoint\.d\/40-zdoc-env\.sh/);
    assert.doesNotMatch(contents, /COPY\s+--chmod=/);
  });

  test(`${site} build and runtime validation reject malformed revision identities`, () => {
    const validations = dockerInstructions(dockerfile(site))
      .filter(instruction => instruction.startsWith('RUN ') && instruction.includes('${#ZDOC_SHA}'))
      .map(instruction => instruction.slice('RUN '.length));
    assert.equal(validations.length, 2);
    const execute = (command, sha) => spawnSync('sh', ['-c', command], {
      env: {
        ...process.env,
        ZDOC_SHA: sha,
        ZDOC_SITE: site,
        JENKINS_BUILD_ID: 'test-build',
      },
    }).status;
    for (const validation of validations) {
      assert.equal(execute(validation, 'a'.repeat(40)), 0);
      for (const invalid of ['', 'a'.repeat(39), 'a'.repeat(41), 'A'.repeat(40), `${'a'.repeat(39)}g`]) {
        assert.notEqual(execute(validation, invalid), 0, `accepted malformed revision: ${invalid}`);
      }
    }
  });

  test(`${site} Dockerfile only copies available build-context sources`, () => {
    for (const source of localCopySources(dockerfile(site))) {
      assert.equal(fs.existsSync(path.join(repositoryRoot, source)), true, `missing COPY source: ${source}`);
      assert.equal(isIgnored(source), false, `COPY source excluded by .dockerignore: ${source}`);
    }
  });

  test(`${site} copies pnpm patch inputs before installing dependencies`, () => {
    const packageJson = JSON.parse(read('package.json'));
    const patchRoots = new Set(Object.values(packageJson.pnpm?.patchedDependencies ?? {})
      .map(patchPath => patchPath.split('/')[0]));
    const instructions = dockerInstructions(dockerfile(site));
    const installIndex = instructions.indexOf('RUN pnpm install --frozen-lockfile');

    assert.ok(patchRoots.size > 0, 'fixture must declare at least one patched dependency');
    assert.ok(installIndex >= 0, 'Dockerfile must install dependencies');
    for (const patchRoot of patchRoots) {
      const copyIndex = instructions.indexOf(`COPY ${patchRoot} ${patchRoot}`);
      assert.ok(copyIndex >= 0, `Dockerfile must copy ${patchRoot}`);
      assert.ok(copyIndex < installIndex, `Dockerfile must copy ${patchRoot} before pnpm install`);
    }
  });

  test(`${site} copies the pnpmfile before installing a checksummed lockfile`, () => {
    const lockfile = read('pnpm-lock.yaml');
    const instructions = dockerInstructions(dockerfile(site));
    const installIndex = instructions.indexOf('RUN pnpm install --frozen-lockfile');

    assert.match(lockfile, /^pnpmfileChecksum:/mu);
    assert.ok(installIndex >= 0, 'Dockerfile must install dependencies');
    const copyIndex = instructions.indexOf('COPY .pnpmfile.cjs .pnpmfile.cjs');
    assert.ok(copyIndex >= 0, 'Dockerfile must copy .pnpmfile.cjs');
    assert.ok(copyIndex < installIndex, 'Dockerfile must copy .pnpmfile.cjs before pnpm install');
  });

  test(`${site} image declares the required OCI and release labels`, () => {
    const contents = dockerfile(site);
    assert.match(contents, new RegExp(`${labelNames.source}=\\\"${sourceRepository.replaceAll('/', '\\/')}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.revision}=\\\"\\$\\{ZDOC_SHA\\}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.site}=\\\"\\$\\{ZDOC_SITE\\}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.jenkinsBuildId}=\\\"\\$\\{JENKINS_BUILD_ID\\}\\\"`));
  });

  test(`${site} runtime stage contains only nginx, site output, and required runtime configuration`, () => {
    const runtime = finalDockerStage(dockerfile(site));
    assert.equal(runtime[0], 'FROM nginx:1.28-alpine');
    assert.equal(runtime.filter(instruction => instruction.startsWith('FROM ')).length, 1);
    assert.equal(runtime.filter(instruction => instruction.startsWith('COPY --from=build ')).length, 1);
    assert.ok(runtime.includes(`COPY --from=build /app/build/${site}/ /usr/share/nginx/html/`));
    assert.ok(runtime.includes(`COPY deploy/${site}/nginx.conf /etc/nginx/conf.d/default.conf`));
    assert.ok(runtime.includes('COPY deploy/runtime/nginx.main.conf /etc/nginx/nginx.conf'));
    assert.ok(runtime.includes('COPY deploy/runtime/40-zdoc-env.sh /docker-entrypoint.d/40-zdoc-env.sh'));
    assert.ok(runtime.includes('COPY deploy/njs/cloud.js /etc/nginx/njs/cloud.js'));
    for (const module of ['adapter.js', 'render.js', 'strings.js', 'vocab.js']) {
      assert.ok(runtime.includes(`COPY packages/docs-ui/src/shared/cloud-data/${module} /etc/nginx/njs/${module}`),
        `runtime image must ship the njs cloud-data module: ${module}`);
    }
    assert.ok(runtime.includes(`COPY packages/docs-ui/src/shared/cloud-data/snapshots/${site}.json /etc/nginx/njs/snapshots/${site}.json`),
      'runtime image must ship the site snapshot for the njs degradation tier');
    assert.ok(runtime.includes('RUN chmod 755 /docker-entrypoint.d/40-zdoc-env.sh'));
    assert.equal(runtime.filter(instruction => instruction.startsWith('COPY ')).length, 10);
    assert.doesNotMatch(runtime.join('\n'), /(?:node|pnpm|npm|yarn|node_modules|package\.json|pnpm-lock|COPY \.)/i);
    assert.doesNotMatch(runtime.join('\n'), /localization-inputs\.inventory\.json/);
  });
}

test('the Docker build uses a fresh bounded localization input inventory', () => {
  const inventory = JSON.parse(read('deploy/contracts/localization-inputs.inventory.json'));
  assert.equal(inventory.schemaVersion, 1);
  assert.ok(Array.isArray(inventory.paths));
  assert.ok(inventory.paths.length > 0);
  assert.ok(inventory.paths.every(relativePath =>
    relativePath === '.translation-cache/ja-JP.json' ||
    relativePath.startsWith('generated/en/sidebars/') ||
    relativePath.startsWith('generated/zh-CN/sidebars/tools.') ||
    relativePath.startsWith('i18n/ja-JP/') ||
    relativePath.startsWith('content/zh-CN/guides/tutorials/tools/')));
  const result = spawnSync('node', ['scripts/build/write-localization-input-inventory.mjs', '--check'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('every localization provenance input is tracked and available in the Docker build context', () => {
  const inventory = JSON.parse(read('deploy/contracts/localization-inputs.inventory.json'));
  const trackedResult = spawnSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  assert.equal(trackedResult.status, 0, trackedResult.stderr || trackedResult.stdout);
  const trackedPaths = new Set(trackedResult.stdout.split('\0').filter(Boolean));

  for (const relativePath of inventory.paths) {
    assert.equal(fs.existsSync(path.join(repositoryRoot, relativePath)), true,
      `missing localization provenance input: ${relativePath}`);
    assert.equal(trackedPaths.has(relativePath), true,
      `untracked localization provenance input: ${relativePath}`);
    assert.equal(isIgnored(relativePath), false,
      `localization provenance input excluded by .dockerignore: ${relativePath}`);
  }
  for (const mutableCachePath of [
    '.translation-cache/zh-CN.json',
    '.translation-cache/ja-JP.json.backup',
    '.translation-cache/archive/ja-JP.json',
    'apps/probe/.translation-cache/secret.txt',
    'apps/probe/.translation-cache/archive/cache.json',
    'packages/example/nested/.translation-cache/session',
  ]) {
    assert.equal(isIgnored(mutableCachePath), true,
      `mutable translation cache must remain excluded from the Docker build context: ${mutableCachePath}`);
  }
});

test('the image-label schema defines the complete inspectable label contract', () => {
  const schema = JSON.parse(read('deploy/contracts/image-labels.schema.json'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.type, 'object');
  assert.equal(schema.additionalProperties, true);
  assert.deepEqual(schema.required, Object.values(labelNames));
  assert.equal(schema.properties[labelNames.source].const, sourceRepository);
  assert.equal(schema.properties[labelNames.revision].pattern, '^[0-9a-f]{40}$');
  assert.deepEqual(schema.properties[labelNames.site].enum, ['en', 'zh-CN']);
  assert.equal(schema.properties[labelNames.jenkinsBuildId].minLength, 1);
});

test('smoke script verifies labels, health, representative routes, rejection, and cleanup', () => {
  const contents = read('deploy/contracts/smoke.sh');
  assert.match(contents, /^set -euo pipefail$/m);
  assert.match(contents, /docker image inspect/);
  assert.match(contents, /with index \.Config\.Labels/);
  for (const label of Object.values(labelNames)) assert.match(contents, new RegExp(label.replaceAll('.', '\\.')));
  assert.match(contents, /\/healthz/);
  assert.match(contents, /\/docs\/home/);
  assert.match(contents, /en\)[\s\S]*\/ja-JP\/docs\/home/);
  assert.match(contents, /zh-CN\)[\s\S]*\/ja-JP\/docs\/home[\s\S]*404/);
  assert.doesNotMatch(contents, /zh-CN\) REPRESENTATIVE_ROUTE=\/home\//);
  assert.match(contents, /curl[^\n]*--location[^\n]*--fail/);
  assert.match(contents, /http_code/);
  assert.match(contents, /\[\[ "\$status" == 200 && -s "\$output" \]\]/);
  assert.match(contents, /<no value>/);
  assert.match(contents, /unexpected site|site mismatch/i);
  assert.match(contents, /trap cleanup EXIT INT TERM/);
  assert.match(contents, /cleanup\(\)\s*\{[^}]*docker rm -f "\$CONTAINER"/s);
});

test('smoke label validation rejects missing, placeholder, whitespace, and wrong-site values', () => {
  const smoke = path.join(repositoryRoot, 'deploy/contracts/smoke.sh');
  const valid = ['https://github.com/zilliztech/zdoc', 'a'.repeat(40), 'en', 'jenkins-1', 'en'];
  const invoke = values => spawnSync('bash', ['-c', 'source "$1"; validate_labels "${@:2}"', 'bash', smoke, ...values], {
    encoding: 'utf8',
  });
  assert.equal(invoke(valid).status, 0);
  for (const invalid of [
    ['', valid[1], 'en', valid[3], 'en'],
    [valid[0], '<no value>', 'en', valid[3], 'en'],
    [valid[0], valid[1], 'en', '   ', 'en'],
    [valid[0], valid[1], 'zh-CN', valid[3], 'en'],
  ]) assert.notEqual(invoke(invalid).status, 0);
});

test('Chinese chat uses the same-site API proxy required by the frontend endpoint', () => {
  assert.match(read('packages/docs-ui/src/shared/components/ChatPanel/endpoints.ts'), /DEFAULT_CHAT_ENDPOINT\s*=\s*['"]\/api\/chat['"]/);
  const nginx = read('deploy/zh-CN/nginx.conf');
  assert.match(nginx, /location = \/api\/chat\s*\{/);
  assert.doesNotMatch(nginx, /location \/api\/\s*\{/);
  assert.doesNotMatch(nginx, /chat-proxy/);
});

test('Chinese nginx redirects retired standalone Agents routes to translated Guides pages', () => {
  const nginx = read('deploy/zh-CN/nginx.conf');
  assert.match(nginx, /location\s+=\s+\/docs\/agents\s*\{[\s\S]*?return\s+301\s+\/docs\/agents-and-prompts;/);
  assert.match(nginx, /location\s+~\s+\^\/docs\/agents\/\(\.\+\)\$\s*\{[\s\S]*?return\s+301\s+\/docs\/\$1;/);
  assert.doesNotMatch(nginx, /return\s+301\s+\$scheme:\/\/\$host\/agents\$1;/);
});

test('English nginx preserves active REST role operation routes while redirecting category and legacy aliases', () => {
  const nginx = read('deploy/en/nginx.conf');
  assert.doesNotMatch(nginx, /location\s+=\s+\/reference\/restful\/(?:create|drop)-role-v2\s*\{/);
  assert.match(nginx, /location\s+=\s+\/reference\/restful\/role-operations-v2\s*\{[\s\S]*?return\s+301\s+\/reference\/restful\/cluster-role-operations-v2;/);
  assert.match(nginx, /location\s+=\s+\/reference\/restful\/grant-privilege-to-role-v2-v2\s*\{[\s\S]*?return\s+301\s+\/reference\/restful\/grant-privilege-to-role-v2;/);
});

test('English nginx redirect targets resolve to published routes, redirect chains, or the reviewed allowlist', () => {
  // A `return 301` that points at a retired or renamed page chains users
  // straight into a 404. Every local target must therefore resolve against
  // the production sitemap snapshot (CURRENT-channel truth: a redirect may
  // only target a page that is already published, which also blocks
  // shadowing next-channel pages before promotion), against another
  // exact-match redirect source in the same file (chain), or against the
  // reviewed allowlist for paths that only exist in the ja-JP build. The
  // ja-JP locale falls back to English content, so /ja-JP targets resolve
  // against the same English routes after the prefix is stripped. Targets
  // with request variables ($1, $ja_path, ...) and external URLs are out of
  // scope. The Chinese configuration serves a different route space and is
  // not covered by this snapshot.
  const snapshot = JSON.parse(read('deploy/contracts/en-redirect-target-routes.json'));
  assert.equal(snapshot.schemaVersion, 1);
  assert.match(snapshot.source, /^https:\/\/docs\.zilliz\.com\/sitemap\.xml$/u);
  assert.match(snapshot.capturedAt, /^\d{4}-\d{2}-\d{2}$/u);
  assert.ok(snapshot.refresh.includes('docs.zilliz.com/sitemap.xml'), 'snapshot must document its refresh command');
  const routes = new Set(snapshot.routes);
  assert.ok(snapshot.routes.length > 1000, 'route snapshot looks truncated');
  for (const route of snapshot.routes) assert.match(route, /^\//u, `route snapshot entry is not an absolute path: ${route}`);
  const allowlist = new Map(Object.entries(snapshot.allowlist ?? {}));
  for (const [allowed, reason] of allowlist) {
    assert.match(allowed, /^\//u, `allowlist entry is not an absolute path: ${allowed}`);
    assert.ok(reason.length > 0, `allowlist entry ${allowed} must document why it cannot appear in the sitemap`);
    assert.ok(!routes.has(allowed), `allowlist entry ${allowed} already exists in the route snapshot; remove the allowlist entry`);
  }

  const nginx = read('deploy/en/nginx.conf');
  const exactSources = new Set([...nginx.matchAll(/location = ([^ {]+) \{/gu)].map(match => match[1]));
  const unresolved = [];
  let checked = 0;
  for (const match of nginx.matchAll(/return 301\s+([^;\s]+);/gu)) {
    let target = match[1].split('#', 1)[0];
    if (/^https?:\/\//u.test(target) || target.includes('$')) continue;
    if (target.startsWith('/ja-JP/')) {
      target = target.slice('/ja-JP'.length);
      // The prefix strip reduces a bare locale root to '/', which the route
      // snapshot happens to contain; redirecting users to the bare locale
      // root is always a mapping mistake, so judge it unresolved.
      if (target === '/') {
        unresolved.push('/ja-JP/ (bare locale root is not a redirect target)');
        continue;
      }
    }
    checked += 1;
    if (routes.has(target) || exactSources.has(target) || allowlist.has(target)) continue;
    unresolved.push(target);
  }
  assert.ok(checked > 700, `only ${checked} redirect targets were parsed; the location/return extraction is broken`);
  assert.deepEqual(unresolved, [], [
    'dead nginx redirect targets (fix the redirect, refresh the snapshot after a release,',
    `or verify the path returns 200 on production before allowlisting): ${[...new Set(unresolved)].sort().join(', ')}`,
    `snapshot refresh: ${snapshot.refresh}`,
  ].join('\n'));
});

test('Chinese nginx redirect targets resolve to published routes, redirect chains, or the reviewed allowlist', () => {
  // Same contract as the English lint, against the Chinese production
  // sitemap. The Chinese configuration carries legacy targets that predate
  // this lint; they are allowlisted in the snapshot with their reason and
  // must be removed from the allowlist as soon as the page reappears on
  // production. Targets are percent-decoded before comparison because the
  // sitemap percent-encodes characters such as parentheses.
  const snapshot = JSON.parse(read('deploy/contracts/zh-CN-redirect-target-routes.json'));
  assert.equal(snapshot.schemaVersion, 1);
  assert.match(snapshot.source, /^https:\/\/docs\.zilliz\.com\.cn\/sitemap\.xml$/u);
  assert.match(snapshot.capturedAt, /^\d{4}-\d{2}-\d{2}$/u);
  assert.ok(snapshot.refresh.includes('docs.zilliz.com.cn/sitemap.xml'), 'snapshot must document its refresh command');
  const routes = new Set(snapshot.routes);
  assert.ok(snapshot.routes.length > 1000, 'route snapshot looks truncated');
  for (const route of snapshot.routes) assert.match(route, /^\//u, `route snapshot entry is not an absolute path: ${route}`);
  const allowlist = new Map(Object.entries(snapshot.allowlist ?? {}));
  for (const [allowed, reason] of allowlist) {
    assert.match(allowed, /^\//u, `allowlist entry is not an absolute path: ${allowed}`);
    assert.ok(reason.length > 0, `allowlist entry ${allowed} must document why it cannot appear in the sitemap`);
    assert.ok(!routes.has(allowed), `allowlist entry ${allowed} already exists in the route snapshot; remove the allowlist entry`);
  }

  const decode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const nginx = read('deploy/zh-CN/nginx.conf');
  const exactSources = new Set([...nginx.matchAll(/location = ([^ {]+) \{/gu)].map(match => decode(match[1])));
  const unresolved = [];
  let checked = 0;
  for (const match of nginx.matchAll(/return 301\s+([^;\s]+);/gu)) {
    let target = match[1].split('#', 1)[0];
    if (/^https?:\/\//u.test(target) || target.includes('$')) continue;
    target = decode(target);
    checked += 1;
    if (routes.has(target) || exactSources.has(target) || allowlist.has(target)) continue;
    unresolved.push(target);
  }
  assert.ok(checked > 700, `only ${checked} redirect targets were parsed; the location/return extraction is broken`);
  assert.deepEqual(unresolved, [], [
    'dead nginx redirect targets (fix the redirect, refresh the snapshot after a release,',
    `or verify the path returns 200 on production before allowlisting): ${[...new Set(unresolved)].sort().join(', ')}`,
    `snapshot refresh: ${snapshot.refresh}`,
  ].join('\n'));
});

const CLOUD_DATA_CMS_HOSTS = {en: 'cms.zilliz.cc', 'zh-CN': 'cms-cn.zilliz.cc'};

for (const site of ['en', 'zh-CN']) {
  test(`${site} nginx wires the cloud-data SSI chain with the correct CMS instance`, () => {
    const nginx = read(`deploy/${site}/nginx.conf`);
    const cmsHost = CLOUD_DATA_CMS_HOSTS[site];
    const otherHost = CLOUD_DATA_CMS_HOSTS[site === 'en' ? 'zh-CN' : 'en'];

    // Main context: the njs module is loaded by the shipped main config (the
    // stock image has no /etc/nginx/modules include and load_module is
    // main-context only).
    const mainConf = read('deploy/runtime/nginx.main.conf');
    assert.match(mainConf, /^load_module \/etc\/nginx\/modules\/ngx_http_js_module\.so;$/m);
    assert.match(mainConf, /include \/etc\/nginx\/conf\.d\/\*\.conf;/);

    // http context: renderer import, subrequest buffer, cache zone.
    assert.match(nginx, /^js_path \/etc\/nginx\/njs;$/m);
    assert.match(nginx, /^js_import cloudData from \/etc\/nginx\/njs\/cloud\.js;$/m);
    assert.match(nginx, /^subrequest_output_buffer_size 1m;$/m);
    assert.match(nginx, /proxy_cache_path \/var\/cache\/nginx\/cloud_data [^;]*keys_zone=cloud_data:/);

    // Server context: SSI for markdown responses only.
    assert.match(nginx, /    ssi on;\n    ssi_types text\/markdown;/);
    assert.match(nginx, /types \{\n        text\/markdown md mdx mdwn;\n    \}/);

    // JSON layer: per-instance CMS proxy with 60s cache, stale-on-error, and
    // intercepted upstream errors (a Strapi 5xx JSON body must never reach njs).
    for (const endpoint of ['regions', 'features']) {
      const location = nginx.match(new RegExp(`location = /api/cloud-json/${endpoint} \\{[\\s\\S]*?\\n    \\}`));
      assert.ok(location, `missing /api/cloud-json/${endpoint} location`);
      assert.match(location[0], new RegExp(`proxy_pass https://${cmsHost.replaceAll('.', '\\.')}/api/cloud-${endpoint};`));
      assert.doesNotMatch(location[0], new RegExp(otherHost.replaceAll('.', '\\.')));
      assert.match(location[0], /proxy_ssl_server_name on;/);
      assert.match(location[0], /proxy_cache cloud_data;/);
      assert.match(location[0], /proxy_cache_valid 200 60s;/);
      assert.match(location[0], /proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;/);
      assert.match(location[0], /proxy_intercept_errors on;/);
      assert.match(location[0], /error_page 400 401 403 404 429 500 502 503 504 = @cloud_json_failed;/);
    }
    assert.match(nginx, /location @cloud_json_failed \{\s*\n\s*return 503 "";\s*\n\s*\}/);

    // Fragment layer: loopback proxy hop (an njs location cannot be an SSI
    // include target directly) whose failure mode is an empty 200 so SSI uses
    // the baked stub block.
    assert.match(nginx, /location \/api\/cloud-data\/ \{[\s\S]*?proxy_pass http:\/\/127\.0\.0\.1:80\/_njs\/;[\s\S]*?error_page 400 401 403 404 429 500 502 503 504 = @cloud_fragment_failed;/);
    assert.match(nginx, /location @cloud_fragment_failed \{\s*\n\s*return 200 "";\s*\n\s*\}/);
    assert.match(nginx, /location = \/_njs\/fragment\.md \{\s*\n\s*js_content cloudData\.fragment;\s*\n\s*\}/);

    // The renderer degrades in two tiers: first to the committed snapshot
    // shipped in the image (keeping the include non-empty, because nginx's SSI
    // stub path has a rare double-emission race on empty include responses),
    // then to the empty 200 that lets SSI use the baked stub block.
    const cloudJs = read('deploy/njs/cloud.js');
    assert.match(cloudJs, /import fs from 'fs';/);
    assert.match(cloudJs, /renderFromSnapshot\(site, section, provider\)/);
    assert.match(cloudJs, /SNAPSHOT_DIR \+ site \+ '\.json'/);
    assert.match(cloudJs, /r\.return\(200, ''\)/);
    assert.match(cloudJs, /export default \{ ?fragment ?\};/);
    const dockerfile = read(`deploy/${site}/Dockerfile`);
    assert.match(
      dockerfile,
      new RegExp(`COPY packages/docs-ui/src/shared/cloud-data/snapshots/${site}\\.json /etc/nginx/njs/snapshots/${site}\\.json`),
      'the image must ship the site snapshot for the njs degradation tier',
    );
  });
}

test('the retired /docs/free-trials page redirects to the registration guide on both sites and ja', () => {
  const en = read('deploy/en/nginx.conf');
  assert.match(en, /location = \/docs\/free-trials \{ return 301 \/docs\/register-with-zilliz-cloud; \}/);
  assert.match(en, /location = \/ja-JP\/docs\/free-trials \{ return 301 \/ja-JP\/docs\/register-with-zilliz-cloud; \}/);
  const zh = read('deploy/zh-CN/nginx.conf');
  assert.match(zh, /location = \/docs\/free-trials \{ return 301 \/docs\/register-with-zilliz-cloud; \}/);
});

test('the 2026-10 GA4 search-origin cleanup mirrors retired slugs to ja and retargets SemanticHighlighter', () => {
  const en = read('deploy/en/nginx.conf');
  assert.match(en, /location = \/ja-JP\/docs\/access-control \{ return 301 \/ja-JP\/docs\/access-control-overview; \}/);
  assert.match(en, /location = \/ja-JP\/search \{ return 301 \/ja-JP\/docs\/home; \}/);
  assert.match(en, /location = \/ja-JP\/docs\/authentication \{ return 301 \/ja-JP\/docs\/email-accounts; \}/);
  assert.match(en, /location = \/docs\/semantic-highlighter \{ return 301 \/reference\/python\/python\/Highlighter-LexicalHighlighter; \}/);
  assert.match(en, /location = \/reference\/python\/python\/Highlighter-SemanticHighlighter \{ return 301 \/reference\/python\/python\/Highlighter-LexicalHighlighter; \}/);
});

// English rules whose /ja-JP/<source> is a live ja page on production: adding
// the twin would shadow a page real users can still reach, so the mirror is
// withheld on purpose. Everything else in the English map must be mirrored.
const JA_MIRROR_EXEMPTIONS = [];

test('every English nginx 301 rule is mirrored to ja-JP or recorded as an exemption', () => {
  const en = read('deploy/en/nginx.conf');
  const exactSources = new Set();
  const enRules = [];
  for (const match of en.matchAll(/location = ([^ {]+) \{([^}]*)\}/gu)) {
    const source = match[1].trim();
    exactSources.add(source);
    const returns = [...match[2].matchAll(/return 301\s+([^;\s]+);/gu)];
    if (returns.length !== 1 || source.startsWith('/ja-JP/')) continue;
    const target = returns[0][1].trim();
    if (target.includes('$')) continue; // nginx variable rewrites cannot be locale-prefixed
    enRules.push(source);
  }
  // Mirror completeness and mirror target quality are separate contracts: any
  // exact ja location satisfies this test (hand-authored twins sometimes send
  // ja users to a deliberate different or locale-stripped target), while the
  // redirect-target lint above proves whatever each twin targets actually
  // resolves. A gap here is exactly what grew the 2026-10 GA 404 backlog.
  // Scope note: regex `location ~` sources are intentionally outside this
  // contract (they cannot be mirrored mechanically without risking shadows of
  // live ja pages) — the whole-version ^/reference/{java,go}/v1 retirements
  // carry hand-authored ja twins instead, and future regex rules need the
  // same manual treatment.
  const exemptions = new Map(JA_MIRROR_EXEMPTIONS.map(entry => [entry.from, entry.reason]));
  const missing = [];
  const redundantExemptions = [];
  // Every `return 301` must be a terminated directive. The extraction regexes
  // only see semicolon-terminated ones, so a dropped semicolon would make a
  // rule silently vanish from every contract (and abort nginx at container
  // start) instead of failing here — this pair of counts closes that hole.
  const bareReturns = (en.match(/return 301\s+\S+/gu) ?? []).length;
  const terminatedReturns = (en.match(/return 301\s+[^;]+;/gu) ?? []).length;
  assert.equal(bareReturns, terminatedReturns, 'every `return 301` directive must end with a semicolon');
  for (const from of enRules) {
    const twin = `/ja-JP${from}`;
    if (exactSources.has(twin)) {
      if (exemptions.has(twin)) redundantExemptions.push(twin);
      continue;
    }
    if (!exemptions.has(twin)) missing.push(twin);
  }
  assert.deepEqual(
    redundantExemptions,
    [],
    'exemption entries whose ja location exists anyway are stale and must be removed',
  );
  assert.deepEqual(
    missing,
    [],
    'every English nginx 301 must carry a ja-JP location (new retirement gaps are exactly what drove the 2026-10 GA 404 backlog) or be exempted as a live ja page',
  );
});

test('the 2026-10-31 GA-derived cleanup fixes wrong targets and sends dead CLI leaves to the live CLI hub', () => {
  const en = read('deploy/en/nginx.conf');
  // /reference/api/go/Vector/Insert() used to target the Query successor page.
  assert.match(en, /location = \/reference\/api\/go\/Vector\/Insert\(\) \{\s*return 301 \/reference\/go\/go\/v2-Vector-Insert;\s*\}/);
  // The CLI reference was PARTIALLY retired: the section root /reference/cli and
  // a leaf set (Completion-*, MilvusStandalone-*) are gone, but the
  // /reference/cli/cli/overview hub and most leaves are still published (verified
  // against production and the 2026-10-31 route snapshot). GA-evidenced dead
  // leaves therefore go to the live hub, and the hub itself must never become a
  // redirect source (it would shadow a live page).
  assert.doesNotMatch(en, /location = \/reference\/cli\/cli\/overview \{/);
  assert.match(en, /location = \/reference\/cli\/CloudManagement-Import \{\s*return 301 \/reference\/cli\/cli\/overview;\s*\}/);
  assert.match(en, /location = \/reference\/cli\/cli\/Completion-show \{ return 301 \/reference\/cli\/cli\/overview; \}/);
  assert.match(en, /location = \/reference\/cli\/cli\/MilvusStandalone-install \{ return 301 \/reference\/cli\/cli\/overview; \}/);
  assert.match(en, /location = \/ja-JP\/reference\/cli\/DataOperations \{ return 301 \/ja-JP\/reference\/cli\/cli\/overview; \}/);
  assert.match(en, /location = \/ja-JP\/reference\/cli\/CloudManagement \{ return 301 \/ja-JP\/reference\/cli\/cli\/overview; \}/);
  // GA-evidenced retired SDK reference paths, targets verified live 2026-10-31.
  assert.match(en, /location = \/reference\/go\/v2-Vector-Query \{ return 301 \/reference\/go\/go\/v2-Vector-Query; \}/);
  assert.match(en, /location = \/reference\/go\/v2-Vector-Search \{ return 301 \/reference\/go\/go\/v2-Vector-Search; \}/);
  assert.match(en, /location = \/reference\/go\/v1-Collection-Insert \{ return 301 \/reference\/go; \}/);
  assert.match(en, /location = \/reference\/python\/Rerankers \{ return 301 \/reference\/python; \}/);
  assert.match(en, /location = \/reference\/python\/Vector-GroupBy \{ return 301 \/reference\/python; \}/);
  assert.match(en, /location = \/reference\/node\/Collections \{ return 301 \/reference\/nodejs; \}/);
  assert.match(en, /location = \/reference\/java\/v1-Authentication \{ return 301 \/reference\/java; \}/);
  assert.match(en, /location = \/reference\/java\/java\/v2-Volume-VolumeFileManager\/v2-VolumeFileManager-uploadFilesAsync \{ return 301 \/reference\/java\/java\/v2-Volume-VolumeFileManager; \}/);
  // The ja mirrors of the top GA 404 sources (docs.zilliz.com ja traffic).
  assert.match(en, /location = \/ja-JP\/docs\/agents\/zilliz-import-prompts \{ return 301 \/ja-JP\/docs\/zilliz-import-prompts; \}/);
  assert.match(en, /location = \/ja-JP\/docs\/zilliz-mcp-server \{ return 301 \/ja-JP\/docs\/zilliz-skill; \}/);
  assert.match(en, /location = \/ja-JP\/docs\/connect-to-cluster \{ return 301 \/ja-JP\/docs\/connect-to-serving-cluster; \}/);
  // Whole-version SDK retirements use regex locations on the English site;
  // their ja twins mirror the same catch, while the exact section-index twin
  // (location =) wins over the regex with the same destination.
  assert.match(en, /location ~ \^\/reference\/java\/v1 \{\s*return 301 \/reference\/java;\s*\}/);
  assert.match(en, /location ~ \^\/ja-JP\/reference\/java\/v1 \{\s*return 301 \/ja-JP\/reference\/java;\s*\}/);
  assert.match(en, /location ~ \^\/ja-JP\/reference\/go\/v1 \{\s*return 301 \/ja-JP\/reference\/go;\s*\}/);
  assert.match(en, /location = \/ja-JP\/reference\/java\/v1 \{ return 301 \/ja-JP\/reference\/java; \}/);
  assert.match(en, /location = \/ja-JP\/docs\/security \{ return 301 \/ja-JP\/docs\/setup-console-ip-allowlist; \}/);
});

test('both site-owned images route chat directly to the private agent runtime', () => {  const entrypoint = read('deploy/runtime/40-zdoc-env.sh');
  assert.match(entrypoint, /upstream docs_agent\s*\{/);
  assert.ok(entrypoint.includes('hash \\$http_x_conversation_id consistent;'));
  assert.match(entrypoint, /zone docs_agent 64k;/);
  for (const pod of [0, 1, 2]) {
    assert.match(entrypoint, new RegExp(`cloud-ai-assistant-${pod}\\.cloud-ai-assistant-hs\\.vdc\\.svc\\.cluster\\.local:9000 resolve`));
  }

  for (const site of ['en', 'zh-CN']) {
    const nginx = read(`deploy/${site}/nginx.conf`);
    assert.match(nginx, /include \/etc\/nginx\/chat-agent-runtime\.conf;/);
    assert.match(nginx, /location = \/api\/chat\s*\{[\s\S]*?proxy_pass http:\/\/docs_agent\/api\/chat\/stream;/);
    assert.match(nginx, /location = \/api\/chat\/interrupt\s*\{[\s\S]*?proxy_pass http:\/\/docs_agent\/api\/chat\/interrupt;/);
    assert.equal((nginx.match(/proxy_set_header Authorization "";/g) ?? []).length, 2);
    // The retired chat-proxy catch-all is gone: only the two exact agent
    // locations above may proxy anything under /api/.
    assert.doesNotMatch(nginx, /location \/api\/\s*\{/);
    assert.doesNotMatch(nginx, /chat-proxy/);
  }
});

test('release-channel route gate is generated into server context, never into http-level conf.d', () => {
  // conf.d/*.conf is included at http level by the base image's nginx.conf,
  // where a bare `location` directive is a configuration error that aborts
  // startup. The gate must be written to its own directory that the site
  // nginx.conf files include inside their server block.
  const entrypoint = read('deploy/runtime/40-zdoc-env.sh');
  assert.match(entrypoint, /gate_dir="\/etc\/nginx\/release-channel-gate"/);
  assert.match(entrypoint, /mkdir -p "\$gate_dir"/);
  assert.doesNotMatch(entrypoint, /gate_conf="\/etc\/nginx\/conf\.d\//);
  // NEXT routes gate CURRENT deployments (unreleased pages); RETIRE-IN-NEXT
  // routes gate NEXT deployments (pages staged for removal by the upcoming
  // release, the mirror direction).
  assert.match(entrypoint, /"\$gate_dir\/blocked-routes\.conf"/);
  assert.match(entrypoint, /"\$gate_dir\/blocked-retired-routes\.conf"/);
  assert.match(entrypoint, /if \[ "\$release_channel" != "next" \] &&/);
  assert.match(entrypoint, /if \[ "\$release_channel" = "next" \] &&/);
  assert.match(entrypoint, /release-channel-retired-routes\.txt/);

  for (const site of ['en', 'zh-CN']) {
    const nginx = read(`deploy/${site}/nginx.conf`);
    const serverStart = nginx.indexOf('server {');
    const includeAt = nginx.indexOf('include /etc/nginx/release-channel-gate/*.conf;');
    assert.ok(serverStart >= 0, `${site}: server block not found`);
    assert.ok(includeAt > serverStart, `${site}: release-channel-gate include missing or outside the server block`);
    const between = nginx.slice(serverStart + 'server {'.length, includeAt);
    assert.ok(!/[{}]/.test(between), `${site}: release-channel-gate include must sit directly inside the server block, not in a nested block`);
  }
});

test('the runtime entrypoint generates matching nginx 404 gates from both channel listings', () => {
  const entrypoint = read('deploy/runtime/40-zdoc-env.sh');
  // Both gate branches share one writer that emits exact-match locations with
  // and without the trailing slash, each serving the styled 404 page.
  assert.match(entrypoint, /write_release_channel_gate\(\) \{/);
  const writerBody = entrypoint.slice(
    entrypoint.indexOf('write_release_channel_gate() {'),
    entrypoint.indexOf('if [ "$release_channel" != "next" ]'),
  );
  assert.match(writerBody, /error_page 404 \/404\.html; return 404;/);
  assert.match(writerBody, /location = %s \{ error_page 404 \/404\.html; return 404; \}\\n/);
  assert.match(writerBody, /location = %s\/ \{ error_page 404 \/404\.html; return 404; \}\\n/);
  // Each branch cleans its own conf file when its channel direction is not
  // active, so flipping the deployment channel never serves a stale gate.
  assert.match(entrypoint, /rm -f "\$gate_dir\/blocked-routes\.conf"/);
  assert.match(entrypoint, /rm -f "\$gate_dir\/blocked-retired-routes\.conf"/);
});

test('browser chat assets keep UI and SSE ownership in docs-ui without server-only configuration', () => {
  const chatRoot = path.join(repositoryRoot, 'packages/docs-ui/src/shared/components/ChatPanel');
  const sources = fs.readdirSync(chatRoot)
    .filter(file => /\.(?:ts|tsx)$/u.test(file) && !file.includes('.test.'))
    .map(file => read(`packages/docs-ui/src/shared/components/ChatPanel/${file}`))
    .join('\n');
  assert.match(sources, /DEFAULT_CHAT_ENDPOINT\s*=\s*['"]\/api\/chat['"]/);
  assert.match(sources, /Accept:\s*['"]text\/event-stream['"]/);
  assert.match(sources, /ReadableStream|getReader\(/);
  assert.doesNotMatch(sources, /\.svc\.cluster\.local|cloud-ai-assistant-|Bearer\s+[A-Za-z0-9._-]+|CHAT_AGENT_AUTH_TOKEN|DATABASE_PASSWORD/);
  const appWrappers = fs.readdirSync(path.join(repositoryRoot, 'apps/docs/src/components/ChatPanel'))
    .map(file => read(`apps/docs/src/components/ChatPanel/${file}`))
    .join('\n');
  assert.match(appWrappers, /@zilliz\/docs-ui\/runtime/);
  assert.doesNotMatch(appWrappers, /fetch\(|ReadableStream|getReader\(|text\/event-stream/);
});

test('package scripts expose the container contract without changing the default site build', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts['test:containers'], 'node --test deploy/contracts/container.test.mjs');
  assert.equal(packageJson.scripts['check:localization-input-inventory'], 'node scripts/build/write-localization-input-inventory.mjs --check');
  assert.equal(packageJson.scripts.build, 'pnpm run build:en');
});

test('the public Chinese build entrypoint allocates an 8 GiB Node heap', () => {
  const packageJson = JSON.parse(read('apps/docs/package.json'));
  assert.match(packageJson.scripts['build:zh-CN'], /NODE_OPTIONS=--max-old-space-size=8192\b/u);
});

test('the Docker context excludes generated and mutable repository state', () => {
  const entries = dockerignoreEntries();
  assert.ok(entries.includes('build'), 'build output must not enter a clean image build context');
  assert.ok(entries.includes('.git'), 'mutable Git state must not enter a clean image build context');
  assert.ok(entries.includes('node_modules'), 'host dependencies must not enter the image build context');
  assert.ok(entries.includes('**/node_modules'), 'nested workspace dependencies must not enter the image build context');
  assert.ok(entries.includes('**/.docusaurus'), 'nested Docusaurus caches must not enter the image build context');
  assert.ok(entries.includes('tmp'), 'temporary publication state must not enter the image build context');
  assert.ok(!entries.includes('deploy'), 'site-owned packaging must remain in the image build context');
  for (const sensitive of ['.env.*', '.npmrc', '*.pem', '*.key']) {
    assert.ok(entries.includes(sensitive), `missing sensitive-input exclusion: ${sensitive}`);
  }
  for (const ignored of ['chat-proxy/package.json', '.env.production', 'secrets/tls.pem', 'private/signing.key']) {
    assert.equal(isIgnored(ignored), true, `dockerignore matcher did not exclude: ${ignored}`);
  }
  for (const ignored of ['apps/docs/node_modules/.cache/webpack/client-production/0.pack', 'apps/docs/.docusaurus/client-manifest.json', 'tmp/docs-tooling/en/staging.json']) {
    assert.equal(isIgnored(ignored), true, `dockerignore matcher did not exclude nested generated state: ${ignored}`);
  }
});
