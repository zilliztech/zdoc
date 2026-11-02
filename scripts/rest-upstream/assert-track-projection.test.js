// Release-track projection drift gate.
//
// The track projections (buildIntegratedSpec --publication-policy track) have
// no production workflow consumer of their own: their audience is milvus.io's
// RESTful reference through milvus-io/web-content, so a broken projection
// surfaces downstream, not here — that silence is exactly how the track path
// stayed broken until zdoc#1032. This gate projects the committed fragment
// set onto both managed release tracks and pins the published path counts, so
// a tooling regression in the tag cascade or the lifecycle filter, or a
// fragment edit that silently drops or adds endpoints, fails before the
// change lands.
//
// The pinned counts are product-visible decisions. A deliberate surface
// change (an upstream release adding or retiring endpoints) updates
// EXPECTED_TRACK_PATH_COUNTS in this file in the same change; the failure
// message names the numbers to reconcile.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {loadSpecifications} = require('../../packages/docs-tooling/src/reference/rest/specLoader');
const {buildIntegratedSpec} = require('../../packages/docs-tooling/src/reference/rest/integratedSpecBuilder');

const FRAGMENT_DIR = path.join(__dirname, '../../packages/docs-tooling/src/reference/rest/meta/openapi');

const EXPECTED_TRACK_PATH_COUNTS = {
  '2.6.x': 102,
  '3.0.x': 115,
};

const HTTP_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace']);

function countOperations(spec) {
  let count = 0;
  for (const pathItem of Object.values(spec.paths || {})) {
    for (const method of Object.keys(pathItem || {})) {
      if (HTTP_METHODS.has(method)) count++;
    }
  }
  return count;
}

for (const [releaseTrack, expectedPaths] of Object.entries(EXPECTED_TRACK_PATH_COUNTS)) {
  test(`release-track ${releaseTrack} projection pins ${expectedPaths} paths`, () => {
    const specifications = loadSpecifications(FRAGMENT_DIR);
    const {spec, stats} = buildIntegratedSpec(specifications, {
      publicationPolicy: 'track',
      target: 'milvus',
      language: 'en-US',
      apiSurface: 'data-plane',
      releaseTrack,
    });

    const actualPaths = Object.keys(spec.paths || {}).length;
    assert.equal(
      actualPaths,
      expectedPaths,
      `release-track ${releaseTrack} projects ${actualPaths} paths, expected ${expectedPaths}. ` +
        'If the surface change is deliberate, update EXPECTED_TRACK_PATH_COUNTS in ' +
        'scripts/rest-upstream/assert-track-projection.test.js in the same change; otherwise a ' +
        'cascade, lifecycle, or fragment regression dropped or added endpoints.',
    );

    // The operation stats must reconcile against the merged fragment set, so
    // nothing vanishes outside the accounting.
    assert.equal(
      stats.operations.retained + stats.operations.omitted,
      countOperations(specifications),
      `release-track ${releaseTrack} operation accounting (retained ${stats.operations.retained} + omitted ` +
        `${stats.operations.omitted}) does not reconcile with the merged fragment set`,
    );
  });
}
