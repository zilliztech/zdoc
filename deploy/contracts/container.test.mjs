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
      if (character === '*' && candidate[index + 1] === '*') {
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

    assert.equal(occurrences(contents, /RUN\s+pnpm install --frozen-lockfile\b/g), 1);
    assert.equal(occurrences(contents, /RUN\s+pnpm run build:(?:en|zh-CN)\b/g), 1);
    assert.match(contents, new RegExp(`RUN\\s+pnpm run build:${site.replace('-', '\\-')}\\b`));
    assert.doesNotMatch(contents, new RegExp(`pnpm run build:${otherSite.replace('-', '\\-')}\\b`));

    assert.match(contents, new RegExp(`COPY --from=build /app/build/${site.replace('-', '\\-')}/? /usr/share/nginx/html/?`));
    assert.doesNotMatch(contents, /COPY --from=build \/app\/build\/?\s/);
    assert.doesNotMatch(contents, new RegExp(`/app/build/${otherSite.replace('-', '\\-')}\\b`));
    assert.match(contents, new RegExp(`COPY deploy/${site.replace('-', '\\-')}/nginx\\.conf /etc/nginx/conf\\.d/default\\.conf`));
  });

  test(`${site} build and runtime validation reject malformed revision identities`, () => {
    const validations = dockerInstructions(dockerfile(site))
      .filter(instruction => instruction.startsWith('RUN ') && instruction.includes('${#ZDOC_SHA}'))
      .map(instruction => instruction.slice('RUN '.length));
    assert.equal(validations.length, 2);
    const execute = (command, sha) => spawnSync('sh', ['-c', command], {
      env: {...process.env, ZDOC_SHA: sha, ZDOC_SITE: site, JENKINS_BUILD_ID: 'test-build'},
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

  test(`${site} image declares the required OCI and release labels`, () => {
    const contents = dockerfile(site);
    assert.match(contents, new RegExp(`${labelNames.source}=\\\"${sourceRepository.replaceAll('/', '\\/')}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.revision}=\\\"\\$\\{ZDOC_SHA\\}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.site}=\\\"\\$\\{ZDOC_SITE\\}\\\"`));
    assert.match(contents, new RegExp(`${labelNames.jenkinsBuildId}=\\\"\\$\\{JENKINS_BUILD_ID\\}\\\"`));
  });
}

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
  assert.match(nginx, /location \/api\/\s*\{/);
  assert.match(nginx, /proxy_pass http:\/\/\$chat_proxy_upstream/);
  assert.match(nginx, /chat-proxy\.zdocs\.svc\.cluster\.local:9000/);
});

test('package scripts expose the container contract without changing the default site build', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts['test:containers'], 'node --test deploy/contracts/container.test.mjs');
  assert.equal(packageJson.scripts.build, 'pnpm run build:en');
});

test('the Docker context excludes generated and mutable repository state', () => {
  const entries = dockerignoreEntries();
  assert.ok(entries.includes('build'), 'build output must not enter a clean image build context');
  assert.ok(entries.includes('.git'), 'mutable Git state must not enter a clean image build context');
  assert.ok(entries.includes('node_modules'), 'host dependencies must not enter the image build context');
  assert.ok(!entries.includes('deploy'), 'site-owned packaging must remain in the image build context');
  for (const sensitive of ['.env.*', '.npmrc', '*.pem', '*.key']) {
    assert.ok(entries.includes(sensitive), `missing sensitive-input exclusion: ${sensitive}`);
  }
  for (const ignored of ['chat-proxy/package.json', '.env.production', 'secrets/tls.pem', 'private/signing.key']) {
    assert.equal(isIgnored(ignored), true, `dockerignore matcher did not exclude: ${ignored}`);
  }
});
