# On-Demand Cluster OpenAPI Segment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move five supported on-demand cluster operations into their own OpenAPI segment, remove the obsolete modify operation, rename both cluster PATCH pages, and add `autoSuspend` to the supported on-demand PATCH request.

**Architecture:** Keep the existing directory-based OpenAPI merge unchanged. Introduce one self-contained per-tag fragment whose operations use `On-Demand Cluster Operations (V2)`, retain general and dedicated operations in the existing cluster fragment, and cover the boundary with a focused regression test that also exercises generated English and Chinese routes.

**Tech Stack:** OpenAPI 3.0.1 JSON, Node.js CommonJS, `node:assert/strict`, existing `specLoader` and `refGen` modules.

---

## File Map

- Create `plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json`: self-contained specification for the five supported on-demand operations.
- Modify `plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json`: remove moved and obsolete paths; rename the dedicated PATCH operation.
- Create `plugins/apifox-docs/on-demand-cluster-segment.test.js`: structural, schema, merge, metadata, link, and generated-route regression coverage.
- Modify `plugins/apifox-docs/issues-10717-10802.test.js`: point the existing create-on-demand regression test at the new fragment.
- Modify `plugins/apifox-docs/meta/descriptions.json`: describe the new documentation group.
- Modify `plugins/apifox-docs/meta/titles.json`: map the two renamed Chinese summaries to their new slugs.
- Modify `docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md`: update two links and labels that target the renamed on-demand PATCH page.

### Task 1: Add a failing segment contract test

**Files:**
- Create: `plugins/apifox-docs/on-demand-cluster-segment.test.js`

- [ ] **Step 1: Create the regression test**

Create the file with this content:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { loadSpecifications } = require('./specLoader')
const RefGen = require('./refGen')

const openapiDir = path.join(__dirname, 'meta/openapi')
const clusterPath = path.join(openapiDir, '22-cluster-operations-v2.json')
const onDemandPath = path.join(openapiDir, '33-on-demand-cluster-operations-v2.json')
const descriptionsPath = path.join(__dirname, 'meta/descriptions.json')
const titlesPath = path.join(__dirname, 'meta/titles.json')
const tutorialPath = path.join(
  __dirname,
  '../../docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md',
)

const movedOperations = [
  ['post', '/v2/clusters/createOnDemandCluster'],
  ['get', '/v2/clusters/onDemandClusters'],
  ['get', '/v2/clusters/onDemandClusters/{CLUSTER_ID}'],
  ['patch', '/v2/clusters/onDemandClusters/{CLUSTER_ID}'],
  ['delete', '/v2/clusters/onDemandClusters/{CLUSTER_ID}'],
]

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function testSegmentBoundary() {
  const cluster = loadJson(clusterPath)
  const onDemand = loadJson(onDemandPath)
  const merged = loadSpecifications(openapiDir)

  assert.deepEqual(onDemand.tags.map(tag => tag.name), ['On-Demand Cluster Operations (V2)'])

  for (const [method, endpointPath] of movedOperations) {
    assert.ok(onDemand.paths[endpointPath]?.[method], `Missing ${method.toUpperCase()} ${endpointPath} from on-demand segment`)
    assert.deepEqual(
      onDemand.paths[endpointPath][method].tags,
      ['On-Demand Cluster Operations (V2)'],
    )
    assert.equal(cluster.paths[endpointPath]?.[method], undefined)
    assert.ok(merged.paths[endpointPath]?.[method])
  }

  assert.equal(
    onDemand.paths['/v2/clusters/onDemandClusters/{CLUSTER_ID}']?.post,
    undefined,
  )
  assert.equal(
    cluster.paths['/v2/clusters/onDemandClusters/{CLUSTER_ID}/modify'],
    undefined,
  )
  assert.equal(
    merged.paths['/v2/clusters/onDemandClusters/{CLUSTER_ID}/modify'],
    undefined,
  )

  assert.equal(
    cluster.paths['/v2/clusters/{CLUSTER_ID}'].patch.tags[0],
    'Cluster Operations (V2)',
  )
  assert.ok(cluster.paths['/v2/clusters/createDedicated'].post)
}

function testPatchNamesAndAutoSuspendSchema() {
  const cluster = loadJson(clusterPath)
  const onDemand = loadJson(onDemandPath)
  const updateOnDemand = onDemand.paths['/v2/clusters/onDemandClusters/{CLUSTER_ID}'].patch
  const updateDedicated = cluster.paths['/v2/clusters/{CLUSTER_ID}'].patch
  const autoSuspend = updateOnDemand.requestBody.content['application/json']
    .schema.properties.autoSuspend

  assert.equal(updateOnDemand.summary, 'Update On-Demand Cluster')
  assert.equal(updateOnDemand['x-i18n']['zh-CN'].summary, '更新按需集群')
  assert.equal(updateDedicated.summary, 'Update Dedicated Cluster')
  assert.equal(updateDedicated['x-i18n']['zh-CN'].summary, '更新 Dedicated 集群')

  assert.equal(autoSuspend.type, 'string')
  assert.equal(autoSuspend.pattern, '^\\d+[smh]$')
  assert.equal(autoSuspend.example, '5m')
  assert.match(autoSuspend.description, /at least 60 seconds/)
  assert.equal(
    updateDedicated.requestBody.content['application/json'].schema.properties.autoSuspend,
    undefined,
  )

  const examples = updateOnDemand.requestBody.content['application/json'].examples
  assert.ok(Object.values(examples).some(example => example.value?.autoSuspend === '5m'))
  assert.ok(Object.values(examples).some(example => (
    example.value?.autoSuspend === '5m'
    && Object.keys(example.value).length === 1
  )))
}

function testMetadataAndRepositoryLinks() {
  const descriptions = loadJson(descriptionsPath)
  const titles = loadJson(titlesPath)
  const tutorial = fs.readFileSync(tutorialPath, 'utf-8')

  assert.ok(descriptions.some(entry => (
    entry.name === 'on-demand-cluster-operations-v2'
    && /manage on-demand clusters/.test(entry.description)
  )))
  assert.equal(titles['更新按需集群'], 'update-on-demand-cluster')
  assert.equal(titles['更新 Dedicated 集群'], 'update-dedicated-cluster')
  assert.doesNotMatch(tutorial, /update-on-demand-cluster-info-v2/)
  assert.match(tutorial, /Update On-Demand Cluster\]\(\/reference\/restful\/update-on-demand-cluster-v2\)/)
}

async function testGeneratedRoutes() {
  const cluster = loadJson(clusterPath)
  const onDemand = loadJson(onDemandPath)
  const specifications = {
    openapi: '3.0.1',
    info: { title: 'cluster route test', version: '1.0.0' },
    tags: [cluster.tags[0], onDemand.tags[0]],
    paths: {
      '/v2/clusters/{CLUSTER_ID}': {
        patch: cluster.paths['/v2/clusters/{CLUSTER_ID}'].patch,
      },
      '/v2/clusters/onDemandClusters/{CLUSTER_ID}': {
        patch: onDemand.paths['/v2/clusters/onDemandClusters/{CLUSTER_ID}'].patch,
      },
    },
    components: onDemand.components,
    servers: onDemand.servers,
  }

  for (const lang of ['en-US', 'zh-CN']) {
    const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), `on-demand-refgen-${lang}-`))
    try {
      const generator = new RefGen({
        specifications,
        lang,
        target: 'zilliz',
        target_path: targetPath,
      })
      generator.make_groups()
      await generator.write_refs()

      assert.equal(fs.existsSync(path.join(
        targetPath,
        'v2/control-plane/on-demand-cluster-operations-v2/update-on-demand-cluster-v2.mdx',
      )), true)
      assert.equal(fs.existsSync(path.join(
        targetPath,
        'v2/control-plane/cluster-operations-v2/update-dedicated-cluster-v2.mdx',
      )), true)
    } finally {
      fs.rmSync(targetPath, { recursive: true, force: true })
    }
  }
}

async function run() {
  testSegmentBoundary()
  testPatchNamesAndAutoSuspendSchema()
  testMetadataAndRepositoryLinks()
  await testGeneratedRoutes()
  console.log('on-demand cluster segment tests passed')
}

run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
```

- [ ] **Step 2: Run the new test and verify it fails before implementation**

Run:

```bash
node plugins/apifox-docs/on-demand-cluster-segment.test.js
```

Expected: FAIL with `ENOENT` for `33-on-demand-cluster-operations-v2.json`.

- [ ] **Step 3: Commit the failing contract test**

```bash
git add plugins/apifox-docs/on-demand-cluster-segment.test.js
git commit -m "test: define on-demand cluster spec boundary"
```

### Task 2: Split the OpenAPI fragments and remove the obsolete operation

**Files:**
- Create: `plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json`
- Modify: `plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json`

- [ ] **Step 1: Create the new self-contained fragment**

Copy the source fragment's `openapi`, `servers`, and `components.securitySchemes` values. Set its metadata to:

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "On-Demand Cluster Operations (V2)",
    "description": "",
    "version": "1.0.0"
  },
  "servers": [],
  "tags": [
    {
      "name": "On-Demand Cluster Operations (V2)",
      "x-include-target": [
        "zilliz"
      ],
      "x-i18n": {
        "zh-CN": {
          "name": "On-Demand Cluster Operations (V2)"
        }
      }
    }
  ]
}
```

Move these complete path items from file 22 into the new fragment:

```text
/v2/clusters/createOnDemandCluster
/v2/clusters/onDemandClusters
/v2/clusters/onDemandClusters/{CLUSTER_ID}
```

For every `get`, `post`, `patch`, and `delete` operation copied into the new fragment, replace:

```json
"tags": ["Cluster Operations (V2)"]
```

with:

```json
"tags": ["On-Demand Cluster Operations (V2)"]
```

- [ ] **Step 2: Remove the moved and obsolete paths from file 22**

Delete the three moved path items listed above and delete this entire obsolete path item:

```text
/v2/clusters/onDemandClusters/{CLUSTER_ID}/modify
```

Do not move the obsolete operation into file 33.

- [ ] **Step 3: Validate both JSON fragments**

Run:

```bash
jq -e . plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json >/dev/null
jq -e . plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json >/dev/null
```

Expected: both commands exit 0 without output.

- [ ] **Step 4: Run the contract test to reach the next expected failure**

Run:

```bash
node plugins/apifox-docs/on-demand-cluster-segment.test.js
```

Expected: FAIL because the PATCH summaries, `autoSuspend`, descriptions metadata, title mappings, or tutorial links have not yet been updated.

- [ ] **Step 5: Commit the segment split**

```bash
git add plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json
git commit -m "refactor: split on-demand cluster OpenAPI segment"
```

### Task 3: Rename both PATCH operations and add `autoSuspend`

**Files:**
- Modify: `plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json`
- Modify: `plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json`

- [ ] **Step 1: Rename and extend the on-demand PATCH operation**

In `PATCH /v2/clusters/onDemandClusters/{CLUSTER_ID}`, set:

```json
"summary": "Update On-Demand Cluster",
"description": "Update the name, description, or auto-suspend idle window of an on-demand cluster in the current project.",
"x-i18n": {
  "zh-CN": {
    "summary": "更新按需集群",
    "description": "更新当前项目中一个按需集群的名称、描述或自动挂起空闲时间。"
  }
}
```

Add this property beside `clusterName` and `description`:

```json
"autoSuspend": {
  "type": "string",
  "description": "Auto-suspend idle window. The value must use the `<number><s|m|h>` format, such as `60s`, `5m`, or `1h`, and must be at least 60 seconds.",
  "pattern": "^\\d+[smh]$",
  "example": "5m",
  "x-i18n": {
    "zh-CN": {
      "description": "自动挂起空闲时间。该值必须使用 `<number><s|m|h>` 格式，例如 `60s`、`5m` 或 `1h`，且至少为 60 秒。",
      "example": "5m"
    }
  }
}
```

Change example `1` to:

```json
{
  "summary": "Name, description, and auto-suspend",
  "value": {
    "clusterName": "New Cluster Name",
    "description": "This is the new description of the cluster.",
    "autoSuspend": "5m"
  }
}
```

Add example `4`:

```json
{
  "summary": "Auto-suspend only",
  "value": {
    "autoSuspend": "5m"
  }
}
```

- [ ] **Step 2: Rename the dedicated PATCH operation**

In `PATCH /v2/clusters/{CLUSTER_ID}`, change only these fields:

```json
"summary": "Update Dedicated Cluster",
"x-i18n": {
  "zh-CN": {
    "summary": "更新 Dedicated 集群",
    "description": "更新当前项目中一个 Dedicated 集群的名称或描述。"
  }
}
```

Do not add `autoSuspend` to this operation.

- [ ] **Step 3: Re-run the contract test**

```bash
node plugins/apifox-docs/on-demand-cluster-segment.test.js
```

Expected: the schema and summary assertions pass; the test may still fail on missing metadata or old tutorial links.

- [ ] **Step 4: Commit the PATCH operation changes**

```bash
git add plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json
git commit -m "docs: update cluster PATCH operations"
```

### Task 4: Register the new group and update renamed routes

**Files:**
- Modify: `plugins/apifox-docs/meta/descriptions.json`
- Modify: `plugins/apifox-docs/meta/titles.json`
- Modify: `docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md`
- Modify: `plugins/apifox-docs/issues-10717-10802.test.js`

- [ ] **Step 1: Add the group description**

Add this entry near the other cluster and on-demand metadata entries:

```json
{
  "name": "on-demand-cluster-operations-v2",
  "description": "This set of APIs provides a way to manage on-demand clusters in Zilliz Cloud."
}
```

- [ ] **Step 2: Add Chinese slug mappings**

Add these properties to `titles.json`:

```json
"更新按需集群": "update-on-demand-cluster",
"更新 Dedicated 集群": "update-dedicated-cluster"
```

- [ ] **Step 3: Update both tutorial references**

Replace both occurrences of:

```markdown
[Update On-Demand Cluster Info](/reference/restful/update-on-demand-cluster-info-v2)
```

with:

```markdown
[Update On-Demand Cluster](/reference/restful/update-on-demand-cluster-v2)
```

- [ ] **Step 4: Point the existing regression test at file 33**

In `issues-10717-10802.test.js`, replace:

```js
const clusterSpecPath = path.join(__dirname, 'meta/openapi/22-cluster-operations-v2.json')
```

with:

```js
const onDemandClusterSpecPath = path.join(__dirname, 'meta/openapi/33-on-demand-cluster-operations-v2.json')
```

Then change the first line of `testCreateOnDemandClusterHasZhCnSuccessResponseExample` to:

```js
const spec = loadJson(onDemandClusterSpecPath)
```

- [ ] **Step 5: Run focused tests**

```bash
node plugins/apifox-docs/on-demand-cluster-segment.test.js
node plugins/apifox-docs/issues-10717-10802.test.js
```

Expected:

```text
on-demand cluster segment tests passed
apifox issues 10717 and 10802 regression tests passed
```

- [ ] **Step 6: Commit metadata and link updates**

```bash
git add plugins/apifox-docs/meta/descriptions.json plugins/apifox-docs/meta/titles.json docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md plugins/apifox-docs/issues-10717-10802.test.js
git commit -m "docs: register on-demand cluster reference group"
```

### Task 5: Full verification and final review

**Files:**
- Verify all files changed in Tasks 1–4.

- [ ] **Step 1: Parse every OpenAPI fragment**

```bash
for file in plugins/apifox-docs/meta/openapi/*.json; do jq -e . "$file" >/dev/null || exit 1; done
```

Expected: exit 0 with no output.

- [ ] **Step 2: Run the complete Apifox plugin regression suite**

```bash
node plugins/apifox-docs/specLoader.test.js
node plugins/apifox-docs/refGen.lang-filter.test.js
node plugins/apifox-docs/issues-10717-10802.test.js
node plugins/apifox-docs/sync-candidates-volume-and-vector.test.js
node plugins/apifox-docs/on-demand-cluster-segment.test.js
```

Expected: all five commands exit 0 and print their respective success messages.

- [ ] **Step 3: Confirm exact endpoint ownership**

```bash
jq -r '.paths | to_entries[] | .key as $path | (.value | to_entries[]) | select(.key == "get" or .key == "post" or .key == "patch" or .key == "delete") | [(.key | ascii_upcase), $path, .value.summary, (.value.tags | join(","))] | @tsv' plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json
```

Expected: exactly five rows, all tagged `On-Demand Cluster Operations (V2)`, with no `POST .../{CLUSTER_ID}/modify` row.

- [ ] **Step 4: Scan for stale names and links**

```bash
rg -n 'Update (On-Demand|Dedicated) Cluster Info|更新按需集群信息|更新 Dedicated 集群信息|update-(on-demand|dedicated)-cluster-info-v2' plugins/apifox-docs/meta docs/tutorials/management/clusters/on-demand-cluster
```

Expected: no matches.

- [ ] **Step 5: Review the final diff**

```bash
git diff --check
git status --short
git diff --stat HEAD~4..HEAD
git diff HEAD~4..HEAD -- plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json plugins/apifox-docs/meta/descriptions.json plugins/apifox-docs/meta/titles.json docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md plugins/apifox-docs/*.test.js
```

Expected: no whitespace errors; only the planned specification, metadata, tutorial, and test changes appear.

- [ ] **Step 6: Commit any final verification-only corrections**

If verification required a correction, stage only the affected planned files and commit:

```bash
git commit -m "test: verify on-demand cluster spec split"
```

If no correction was needed, do not create an empty commit.
