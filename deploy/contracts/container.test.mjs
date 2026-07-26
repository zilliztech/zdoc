import assert from 'node:assert/strict';
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

for (const site of ['en', 'zh-CN']) {
  test(`${site} image has an isolated build and immutable site identity`, () => {
    const contents = dockerfile(site);
    const otherSite = site === 'en' ? 'zh-CN' : 'en';

    assert.match(contents, /^ARG ZDOC_SHA(?:=.*)?$/m);
    assert.match(contents, new RegExp(`^ARG ZDOC_SITE=${site.replace('-', '\\-')}$`, 'm'));
    assert.match(contents, /^ARG JENKINS_BUILD_ID(?:=.*)?$/m);
    assert.match(contents, new RegExp(`test \\\"?\\$ZDOC_SITE\\\"? = \\\"?${site.replace('-', '\\-')}\\\"?`));
    assert.match(contents, /test -n "?\$ZDOC_SHA"?/);
    assert.match(contents, /test -n "?\$JENKINS_BUILD_ID"?/);

    assert.equal(occurrences(contents, /RUN\s+pnpm install --frozen-lockfile\b/g), 1);
    assert.equal(occurrences(contents, /RUN\s+pnpm run build:(?:en|zh-CN)\b/g), 1);
    assert.match(contents, new RegExp(`RUN\\s+pnpm run build:${site.replace('-', '\\-')}\\b`));
    assert.doesNotMatch(contents, new RegExp(`pnpm run build:${otherSite.replace('-', '\\-')}\\b`));

    assert.match(contents, new RegExp(`COPY --from=build /app/build/${site.replace('-', '\\-')}/? /usr/share/nginx/html/?`));
    assert.doesNotMatch(contents, /COPY --from=build \/app\/build\/?\s/);
    assert.doesNotMatch(contents, new RegExp(`/app/build/${otherSite.replace('-', '\\-')}\\b`));
    assert.match(contents, new RegExp(`COPY deploy/${site.replace('-', '\\-')}/nginx\\.conf /etc/nginx/conf\\.d/default\\.conf`));
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
  for (const label of Object.values(labelNames)) assert.match(contents, new RegExp(label.replaceAll('.', '\\.')));
  assert.match(contents, /\/healthz/);
  assert.match(contents, /\/docs\/home/);
  assert.match(contents, /unexpected site|site mismatch/i);
  assert.match(contents, /trap\s+['"].*docker rm -f/);
});

test('package scripts expose the container contract without changing the default site build', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts['test:containers'], 'node --test deploy/contracts/container.test.mjs');
  assert.equal(packageJson.scripts.build, 'pnpm run build:en');
});

test('the Docker context excludes generated and mutable repository state', () => {
  const entries = read('.dockerignore')
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  assert.ok(entries.includes('build'), 'build output must not enter a clean image build context');
  assert.ok(entries.includes('.git'), 'mutable Git state must not enter a clean image build context');
  assert.ok(entries.includes('node_modules'), 'host dependencies must not enter the image build context');
  assert.ok(!entries.includes('deploy'), 'site-owned packaging must remain in the image build context');
});
