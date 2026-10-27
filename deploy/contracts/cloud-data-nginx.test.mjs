// Live nginx verification for the cloud-data SSI chain, wired into the
// site-validation workflow's cloud_data_nginx job (it skips itself when
// Docker is unavailable; the static contract lives in container.test.mjs).
// This harness proves the real nginx:1.28-alpine behavior with the real
// deploy/runtime/nginx.main.conf, the real deploy/en/nginx.conf (CMS origin
// substituted to a stub) and the real deploy/njs renderer modules.
//
//   pnpm test:cloud-data-nginx
//
// Scenarios (spec §4.6): live path renders the CMS JSON as a live-page-shaped
// table; upstream 404 and upstream 503-with-JSON-body both degrade to the
// snapshot renderer inside njs (the image's committed snapshot, substituted
// here with a synthetic fixture) so the include still returns content with
// the page 200 text/markdown — the baked SSI stub block only answers when the
// image's snapshot tier is itself broken; a JSON body far beyond the stock
// subrequest buffer renders completely under the configured 1m buffer.

import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function dockerAvailable() {
  const probe = spawnSync('docker', ['info', '--format', 'ok'], {encoding: 'utf8'});
  return probe.status === 0 && probe.stdout.includes('ok');
}

function sh(command, args) {
  return execFileSync(command, args, {encoding: 'utf8'});
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

const NJS_MODULES = ['cloud.js', 'adapter.js', 'render.js', 'strings.js', 'vocab.js'];

// Small CMS-shaped payload: 4 listed AWS regions (two continents, one of them
// with two regions → rowspan HTML table) + 1 BYOC-only region + a text-cell
// feature row.
const REGIONS_JSON = JSON.stringify({
  data: [
    {attributes: {
      region_name: 'us-west-2', location: 'Oregon, USA', ip: null, updatedAt: '2026-10-26T00:00:00Z',
      provider: {data: {attributes: {name: 'AWS'}}},
      continent: {data: {attributes: {name: 'North America'}}},
      supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]},
      supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]},
    }},
    {attributes: {
      region_name: 'eu-west-9', location: 'Testville, Europe', ip: null, updatedAt: '2026-10-26T00:00:00Z',
      provider: {data: {attributes: {name: 'AWS'}}},
      continent: {data: {attributes: {name: 'Europe'}}},
      supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]},
      supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]},
    }},
    {attributes: {
      region_name: 'eu-west-10', location: 'Othertown, Europe', ip: null, updatedAt: '2026-10-26T00:00:00Z',
      provider: {data: {attributes: {name: 'AWS'}}},
      continent: {data: {attributes: {name: 'Europe'}}},
      supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]},
      supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]},
    }},
    {attributes: {
      region_name: 'ap-east-1', location: 'Hong Kong SAR', ip: null, updatedAt: '2026-10-26T00:00:00Z',
      provider: {data: {attributes: {name: 'AWS'}}},
      continent: {data: {attributes: {name: 'Asia'}}},
      supported_deployments: {data: [{attributes: {name: 'BYOC'}}]},
      supported_compute_types: {data: []},
    }},
  ],
});

const FEATURES_JSON = JSON.stringify({
  data: [
    {attributes: {
      name: 'CMEK', links: null, updatedAt: '2026-10-26T00:00:00Z',
      region_availability: [
        {cloud_provider: {data: {attributes: {name: 'AWS'}}}, supported_regions: '✅ All listed regions'},
        {cloud_provider: {data: {attributes: {name: 'Google Cloud'}}}, supported_regions: 'Not available'},
        {cloud_provider: {data: {attributes: {name: 'Microsoft Azure'}}}, supported_regions: 'Not available'},
      ],
    }},
  ],
});

function bigRegionsJson(targetBytes) {
  const payload = JSON.parse(REGIONS_JSON);
  const template = payload.data[0];
  let index = 0;
  while (JSON.stringify(payload).length < targetBytes) {
    payload.data.push({
      attributes: {
        ...template.attributes,
        region_name: `xx-region-${index}`, location: `Filler location ${index}, Somewhere`,
        continent: {data: {attributes: {name: `Continent ${index % 7}`}}},
      },
    });
    index += 1;
  }
  return payload;
}

async function loadRenderer() {
  const adapter = await import(path.join(repositoryRoot, 'packages/docs-ui/src/shared/cloud-data/adapter.js'));
  const resolveMarkdown = await import(path.join(repositoryRoot, 'packages/docs-ui/src/shared/cloud-data/resolveMarkdown.js'));
  return {buildModel: adapter.default.buildModel, resolveCloudDataMarkers: resolveMarkdown.resolveCloudDataMarkers};
}

// The baked stub must be textually distinguishable from the live upstream
// data, so the page stub is baked from a snapshot-only payload while the stub
// upstream serves REGIONS_JSON.
const SNAPSHOT_REGIONS_JSON = JSON.stringify({
  data: [
    {attributes: {
      region_name: 'us-snap-1', location: 'Snapshotville, USA', ip: null, updatedAt: '2026-10-26T00:00:00Z',
      provider: {data: {attributes: {name: 'AWS'}}},
      continent: {data: {attributes: {name: 'North America'}}},
      supported_deployments: {data: [{attributes: {name: 'Dedicated'}}, {attributes: {name: 'BYOC'}}]},
      supported_compute_types: {data: [{attributes: {name: 'Serving cluster'}}]},
    }},
  ],
});

async function main() {
  const {buildModel, resolveCloudDataMarkers} = await loadRenderer();

  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-data-nginx-'));
  const stubModel = buildModel('en', JSON.parse(SNAPSHOT_REGIONS_JSON), JSON.parse(FEATURES_JSON));
  // The mounted snapshot carries one feature row the baked stub block lacks,
  // so the assertions can tell the njs snapshot tier (correct degradation)
  // apart from the SSI stub block (the racy last-resort path).
  const probeFeatures = JSON.parse(FEATURES_JSON);
  probeFeatures.data.push({attributes: {
    name: 'SNAPSHOT-TIER-PROBE', links: null, updatedAt: '2026-10-26T00:00:00Z',
    region_availability: [
      {cloud_provider: {data: {attributes: {name: 'AWS'}}}, supported_regions: '✅ All listed regions'},
      {cloud_provider: {data: {attributes: {name: 'Google Cloud'}}}, supported_regions: 'Not available'},
      {cloud_provider: {data: {attributes: {name: 'Microsoft Azure'}}}, supported_regions: 'Not available'},
    ],
  }});
  const snapshotModel = buildModel('en', JSON.parse(SNAPSHOT_REGIONS_JSON), probeFeatures);
  // The image ships the committed snapshot for the njs degradation tier; the
  // harness mounts this synthetic one in its place so the fallback content
  // stays distinguishable from the live upstream payload.
  fs.mkdirSync(path.join(workdir, 'snapshots'), {recursive: true});
  fs.writeFileSync(path.join(workdir, 'snapshots', 'en.json'), JSON.stringify({
    schemaVersion: 1,
    site: 'en',
    generatedAt: '2026-10-26T00:00:00Z',
    source: 'cloud-data-nginx harness fixture',
    model: snapshotModel,
  }, null, 2) + '\n');
  const page = resolveCloudDataMarkers(
    '## Supported regions\n\n<CloudRegions provider="aws" />\n\n## Features\n\n<CloudFeatures matrix="features" />\n',
    stubModel,
    {mode: 'ssi'},
  ).content;

  // html root: the baked `.md` artifact plus the styled 404 page.
  fs.mkdirSync(path.join(workdir, 'html/docs'), {recursive: true});
  fs.writeFileSync(path.join(workdir, 'html/docs/page.md'), page);
  fs.writeFileSync(path.join(workdir, 'html/404.html'), '<html><body>404</body></html>');
  fs.writeFileSync(path.join(workdir, 'html/index.html'), '<html><body>home</body></html>');

  // stub upstream data
  const stubData = path.join(workdir, 'stub-data');
  fs.mkdirSync(stubData);
  fs.writeFileSync(path.join(stubData, 'regions.json'), REGIONS_JSON);
  fs.writeFileSync(path.join(stubData, 'features.json'), FEATURES_JSON);

  fs.writeFileSync(path.join(workdir, 'stub.conf'), `
server {
    listen 8901;
    location = /api/cloud-regions { alias /data/regions.json; default_type application/json; }
    location = /api/cloud-features { alias /data/features.json; default_type application/json; }
}
server {
    listen 8902;
    location = /api/cloud-regions { return 503 '{"error":"boom"}'; }
    location = /api/cloud-features { return 503 '{"error":"boom"}'; }
}
`);

  fs.writeFileSync(path.join(workdir, 'chat-agent-runtime.conf'), 'upstream docs_agent { server 127.0.0.1:1; }\n');
  fs.mkdirSync(path.join(workdir, 'release-channel-gate'));

  // The real site conf with the CMS origin pointed at the stub upstream.
  const enConf = fs.readFileSync(path.join(repositoryRoot, 'deploy/en/nginx.conf'), 'utf8');
  const siteConf = (cmsOrigin) => enConf.replaceAll('https://cms.zilliz.cc', cmsOrigin);
  fs.writeFileSync(path.join(workdir, 'site-8901.conf'), siteConf('http://cloudstub:8901'));
  fs.writeFileSync(path.join(workdir, 'site-8902.conf'), siteConf('http://cloudstub:8902'));

  const network = 'cloud-data-nginx-test';
  const portBase = 20000 + (process.pid % 20000);
  let port = portBase;
  const containers = [];

  function docker(args) {
    return sh('docker', args);
  }

  function runSite(confName) {
    const httpPort = String(port += 1);
    const name = `cloud-data-site-${httpPort}`;
    const njsMounts = NJS_MODULES.flatMap((module) => {
      const source = module === 'cloud.js'
        ? path.join(repositoryRoot, 'deploy/njs/cloud.js')
        : path.join(repositoryRoot, 'packages/docs-ui/src/shared/cloud-data', module);
      return ['-v', `${source}:/etc/nginx/njs/${module}:ro`];
    });
    docker([
      'run', '-d', '--name', name, '--network', network,
      '-p', `127.0.0.1:${httpPort}:80`,
      '-v', `${path.join(repositoryRoot, 'deploy/runtime/nginx.main.conf')}:/etc/nginx/nginx.conf:ro`,
      '-v', `${path.join(workdir, confName)}:/etc/nginx/conf.d/default.conf:ro`,
      '-v', `${path.join(workdir, 'chat-agent-runtime.conf')}:/etc/nginx/chat-agent-runtime.conf:ro`,
      '-v', `${path.join(workdir, 'release-channel-gate')}:/etc/nginx/release-channel-gate:ro`,
      '-v', `${workdir}/html:/usr/share/nginx/html:ro`,
      '-v', `${path.join(workdir, 'snapshots')}:/etc/nginx/njs/snapshots:ro`,
      ...njsMounts,
      'nginx:1.28-alpine',
    ]);
    containers.push(name);
    return httpPort;
  }

  function fetch(port, target) {
    const result = spawnSync('curl', ['-s', '-i', `http://127.0.0.1:${port}${target}`], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
    assert.equal(result.status, 0, `curl failed: ${result.stderr}`);
    const separator = result.stdout.indexOf('\r\n\r\n');
    return {head: result.stdout.slice(0, separator), body: result.stdout.slice(separator + 4)};
  }

  function waitFor(target, expectation) {
    let last = null;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        last = fetch(target.split('|')[0], target.split('|')[1]);
        if (expectation(last)) return last;
      } catch {
        // container not up yet
      }
      sleep(250);
    }
    const sitePort = target.split('|')[0];
    const logs = spawnSync('docker', ['logs', `cloud-data-site-${sitePort}`], {encoding: 'utf8', maxBuffer: 1024 * 1024});
    throw new Error(
      `target never became ready: ${target}\n` +
      `last response head: ${last ? last.head.split('\r\n')[0] : 'none'}\n` +
      `last body head: ${last ? JSON.stringify(last.body.slice(0, 200)) : 'none'}\n` +
      `container logs: ${logs.stdout.slice(-800)} ${logs.stderr.slice(-800)}`,
    );
  }

  const scenarios = [];
  function scenario(name, run) {
    scenarios.push({name, run});
  }

  scenario('live path renders the CMS JSON as a live-page-shaped markdown fragment', async () => {
    const port = runSite('site-8901.conf');
    waitFor(`${port}|/docs/page.md`, (response) => response.body.includes('eu-west-10'));
    const response = fetch(port, '/docs/page.md');
    assert.match(response.head, /HTTP\/1\.1 200/);
    assert.match(response.head, /content-type: text\/markdown/i);
    assert.match(response.body, /<td><p>us-west-2<\/p><\/td>/);
    assert.match(response.body, /<td><p>eu-west-9<\/p><\/td>/, 'live fragment carries CMS data that is not in the snapshot stub');
    assert.match(response.body, /rowspan="2"/, 'continent grouping keeps the live rowspan grammar');
    assert.equal(response.body.split('us-west-2').length - 1, 1, 'the stub table must not be duplicated below the live fragment');
    assert.doesNotMatch(response.body, /us-snap-1/, 'the snapshot stub stays suppressed on the live path');
    assert.match(response.body, /<td><p>ap-east-1<\/p><\/td>/, 'BYOC-only regions are ordinary rows in the merged region table');
  });

  scenario('upstream 404 falls back to the snapshot stub, page stays 200 markdown', async () => {
    // The 60s proxy_cache must start empty: delete the upstream payload before
    // the site container exists (a fresh container has a cold cache).
    fs.unlinkSync(path.join(stubData, 'regions.json'));
    const port = runSite('site-8901.conf');
    try {
      const response = waitFor(`${port}|/docs/page.md`, (candidate) =>
        candidate.head.includes('200') && candidate.body.includes('us-snap-1'));
      assert.match(response.head, /content-type: text\/markdown/i);
      assert.match(response.body, /<td><p>us-snap-1<\/p><\/td>/, 'stub table is served');
      // nginx SSI has a rare race where a stub block is emitted twice when the
      // empty-200 include completes during the final output flush; pin the
      // single-render invariant so the gate catches it if it ever fires.
      assert.equal(response.body.split('us-snap-1').length - 1, 1, 'the stub region row must not be duplicated on the fallback path');
      assert.equal(response.body.split('| Feature |').length - 1, 1, 'the stub features table must not be duplicated on the fallback path');
      assert.match(response.body, /SNAPSHOT-TIER-PROBE/, 'the fallback is served by the njs snapshot tier, not the SSI stub block');
      assert.doesNotMatch(response.body, /eu-west-9/, 'live-only data must be absent in stub mode');
      assert.doesNotMatch(response.body, /an error occurred while processing/, 'no SSI error text may leak');
    } finally {
      fs.writeFileSync(path.join(stubData, 'regions.json'), REGIONS_JSON);
    }
  });

  scenario('upstream 503 with a JSON body is intercepted — the body never reaches the page', async () => {
    const port = runSite('site-8902.conf');
    waitFor(`${port}|/docs/page.md`, (response) => response.body.includes('us-snap-1'));
    const response = fetch(port, '/docs/page.md');
    assert.match(response.head, /HTTP\/1\.1 200/);
    assert.doesNotMatch(response.body, /boom/, 'upstream error body must not be spliced into markdown');
    assert.doesNotMatch(response.body, /an error occurred while processing/, 'no SSI error text may leak');
    assert.match(response.body, /<td><p>us-snap-1<\/p><\/td>/, 'stub table is served');
    assert.equal(response.body.split('us-snap-1').length - 1, 1, 'the stub region row must not be duplicated on the fallback path');
    assert.equal(response.body.split('| Feature |').length - 1, 1, 'the stub features table must not be duplicated on the fallback path');
    assert.match(response.body, /SNAPSHOT-TIER-PROBE/, 'the fallback is served by the njs snapshot tier, not the SSI stub block');
  });

  scenario('a 64 KiB CMS JSON renders completely under the 1m subrequest buffer', async () => {
    // Install the big payload before the site container starts so the cold
    // proxy_cache fills with it (the 60s TTL would otherwise serve the small
    // payload for the rest of the run).
    const payload = bigRegionsJson(64 * 1024);
    fs.writeFileSync(path.join(stubData, 'regions.json'), JSON.stringify(payload));
    const port = runSite('site-8901.conf');
    try {
      const lastRegion = payload.data[payload.data.length - 1].attributes.region_name;
      const response = waitFor(`${port}|/docs/page.md`, (candidate) =>
        candidate.head.includes('200') && candidate.body.includes(lastRegion));
      assert.match(response.head, /content-type: text\/markdown/i);
      assert.match(response.body, /Filler location 0/, 'the rendered table carries the full payload');
      assert.doesNotMatch(response.body, /us-snap-1/, 'live path suppresses the stub');
    } finally {
      fs.writeFileSync(path.join(stubData, 'regions.json'), REGIONS_JSON);
    }
  });

  if (!dockerAvailable()) {
    test('cloud-data nginx live harness [docker unavailable, skipped]', {skip: true}, () => {});
    return;
  }

  docker(['network', 'create', network]);
  docker([
    'run', '-d', '--name', 'cloudstub', '--network', network, '--network-alias', 'cloudstub',
    '-p', `127.0.0.1:${portBase}:8901`,
    '-v', `${path.join(workdir, 'stub.conf')}:/etc/nginx/conf.d/default.conf:ro`,
    '-v', `${stubData}:/data:rw`,
    'nginx:1.28-alpine',
  ]);
  containers.push('cloudstub');
  waitFor(`${portBase}|/api/cloud-regions`, (response) => response.head.includes('200'));

  for (const {name, run} of scenarios) {
    test(`cloud-data nginx: ${name}`, {timeout: 120_000}, run);
  }

  test.after(() => {
    for (const name of containers) {
      spawnSync('docker', ['rm', '-f', name], {stdio: 'ignore'});
    }
    spawnSync('docker', ['network', 'rm', network], {stdio: 'ignore'});
    fs.rmSync(workdir, {recursive: true, force: true});
  });
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  await main();
}
