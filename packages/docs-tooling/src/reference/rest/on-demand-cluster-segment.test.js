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

const sidebarMovedSlugs = [
  'create-on-demand-cluster-v2',
  'list-on-demand-clusters-v2',
  'delete-on-demand-cluster-v2',
]

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function collectSidebarIds(items, ids = new Set()) {
  for (const item of items || []) {
    if ((item.type === 'doc' || item.type === 'ref') && item.id) ids.add(item.id)
    if (item.link?.type === 'doc' && item.link.id) ids.add(item.link.id)
    if (Array.isArray(item.items)) collectSidebarIds(item.items, ids)
  }
  return ids
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

function testSidebarUsesOnDemandSegment() {
  const sidebar = require('../../../../../config/generated/restful.sidebar.js')
  const sidebarIds = collectSidebarIds(sidebar)
  for (const slug of sidebarMovedSlugs) {
    assert.equal(
      sidebarIds.has(`api/restful/restful/v2/control-plane/cluster-operations-v2/${slug}`),
      false,
      `Sidebar must not keep stale Cluster Operations path for ${slug}`,
    )
    assert.equal(
      sidebarIds.has(`api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/${slug}`),
      true,
      `Sidebar must point ${slug} at the On-Demand Cluster Operations segment`,
    )
  }
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
  testSidebarUsesOnDemandSegment()
  testPatchNamesAndAutoSuspendSchema()
  testMetadataAndRepositoryLinks()
  await testGeneratedRoutes()
  console.log('on-demand cluster segment tests passed')
}

run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
