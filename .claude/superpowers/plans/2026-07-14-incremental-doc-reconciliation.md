# 增量文档对账 Implementation Plan

**Execution status:** Implemented and verified through `cb11c2298` on 2026-07-14.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 让文档生产流程在恢复 `dev` 基线后，对本次选中的内容组执行可靠的 added/modified/deleted/renamed 对账；REST 每次完整生成；Feishu 文档继续增量拉取；日文 `i18n` 与翻译缓存跟随英文 source checkpoint 删除和移动。

**Architecture:** `dev` 只作为未选中内容组的已发布基线。source producer 先恢复 `dev`，再为选中组执行准备和对账；REST 清空可重建的 operation trees、保留手工 scaffolding、从当前 `master` 恢复 REST sidebar 后完整生成；Feishu 组先从当前 `master` 恢复 SDK/CLI landing page，再使用 incremental planner 决定 token 级工作范围并把删除/移动落实到源 JSON、英文输出和 sidebar。translation job 从 source checkpoint diff 推导 `i18n` 删除和重命名，以当前变化优先并保留 cache/hash 发现的历史 backlog，支持 deletion-only checkpoint。

**实施修正：** 原计划假设 Apifox 命令会重建整个 REST owned root 和 `restful.sidebar.js`，dry run 证明该假设不成立。最终实现只删除 `v1/v2` 下的 control-plane/data-plane operation trees，并从当前 `master` 恢复 sidebar。原计划“manifest 只包含 changedEnglish”也会让失败或超限文件永久无法重试，最终实现改为 changedEnglish 优先、历史 pending backlog 继续入队。SDK/CLI landing page 同样从当前 `master` 恢复；Java/Go landing 额外纳入 content group ownership，5 个 landing page 都由最终 validator 强制检查。

**Tech Stack:** Node.js 20, `node:test`, GitHub Actions reusable workflows, Docusaurus, existing checkpoint artifact scripts, existing Lark incremental planner, existing translation artifact merge.

---

### Task 1: 定义内容组路径与对账元数据

**Files:**
- Modify: `scripts/docs-workflow/content-groups.js`
- Create: `scripts/docs-workflow/group-paths.js`
- Create: `scripts/docs-workflow/group-paths.test.js`
- Modify: `scripts/docs-workflow/content-groups.test.js`

- [x] **Step 1: 写失败测试，覆盖每个 group 的英文和日文路径**

在 `scripts/docs-workflow/group-paths.test.js` 中创建测试，导入：

```js
const test = require('node:test')
const assert = require('node:assert/strict')
const { getGroupPaths } = require('./group-paths')
```

断言 REST 路径：

```js
test('rest group paths include English outputs and translated reference root', () => {
  const paths = getGroupPaths('rest')
  assert.deepEqual(paths.englishOutputs, [
    'reference/api/restful/restful',
    'config/generated/restful.sidebar.js',
  ])
  assert.deepEqual(paths.translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful',
  ])
  assert.deepEqual(paths.sidebars, ['config/generated/restful.sidebar.js'])
  assert.equal(paths.snapshot, null)
})
```

断言 guides 路径：

```js
test('guides group paths include SaaS, BYOC, and translated docs roots', () => {
  const paths = getGroupPaths('guides')
  assert.ok(paths.englishOutputs.includes('docs'))
  assert.ok(paths.englishOutputs.includes('docs-byoc'))
  assert.ok(paths.englishOutputs.includes('config/generated/guides.sidebar.js'))
  assert.ok(paths.englishOutputs.includes('config/generated/guides-byoc.sidebar.js'))
  assert.ok(paths.translationOutputs.includes('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'))
  assert.ok(paths.translationOutputs.includes('i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'))
  assert.equal(paths.snapshot, 'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json')
})
```

断言 SDK/CLI reference 映射：

```js
test('reference groups map reference outputs into docs-reference i18n', () => {
  assert.deepEqual(getGroupPaths('python').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python',
  ])
  assert.deepEqual(getGroupPaths('java').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2',
  ])
  assert.deepEqual(getGroupPaths('node').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/nodejs/nodejs',
  ])
  assert.deepEqual(getGroupPaths('go').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/go/go/v2',
  ])
  assert.deepEqual(getGroupPaths('cli').translationOutputs, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/cli/cli',
  ])
})
```

- [x] **Step 2: 运行测试确认失败**

Run:

```bash
node --test scripts/docs-workflow/group-paths.test.js
```

Expected: FAIL，错误为 `Cannot find module './group-paths'`。

- [x] **Step 3: 实现 `group-paths.js`**

实现并导出：

```js
'use strict'

const { getContentGroup } = require('./content-groups')

const TRANSLATION_ROOT = 'i18n/ja-JP'
const REFERENCE_I18N_ROOT = `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-reference/current`

const SNAPSHOTS = Object.freeze({
  guides: 'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json',
  python: 'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json',
  java: 'plugins/lark-docs/meta/snapshots/javaV230-uat-last-success.json',
  node: 'plugins/lark-docs/meta/snapshots/nodejs30-uat-last-success.json',
  go: 'plugins/lark-docs/meta/snapshots/gov230-uat-last-success.json',
  cli: 'plugins/lark-docs/meta/snapshots/cliv14-uat-last-success.json',
  rest: null,
})

function referenceTranslationPath(ownedPath) {
  if (!ownedPath.startsWith('reference/')) return null
  return `${REFERENCE_I18N_ROOT}/${ownedPath.slice('reference/'.length)}`
}

function getGroupPaths(groupName) {
  const group = getContentGroup(groupName)
  const translationOutputs = groupName === 'guides'
    ? [
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs/current/tutorials`,
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-byoc/current/tutorials`,
      ]
    : group.ownedPaths.map(referenceTranslationPath).filter(Boolean)
  return {
    group: groupName,
    englishOutputs: [...group.ownedPaths],
    translationOutputs,
    sidebars: group.ownedPaths.filter((owned) => owned.startsWith('config/generated/') && owned.endsWith('.sidebar.js')),
    snapshot: SNAPSHOTS[groupName],
    translate: Boolean(group.translate),
  }
}

module.exports = { getGroupPaths, referenceTranslationPath }
```

- [x] **Step 4: 运行路径测试**

Run:

```bash
node --test scripts/docs-workflow/group-paths.test.js scripts/docs-workflow/content-groups.test.js
```

Expected: PASS。

- [x] **Step 5: Commit**

```bash
git add scripts/docs-workflow/content-groups.js scripts/docs-workflow/group-paths.js scripts/docs-workflow/group-paths.test.js scripts/docs-workflow/content-groups.test.js
git commit -m "feat: define docs group reconciliation paths"
```

### Task 2: REST producer 改为恢复基线后完整重建 REST owned paths

**Files:**
- Create: `scripts/docs-workflow/prepare-content-group-workspace.js`
- Create: `scripts/docs-workflow/prepare-content-group-workspace.test.js`
- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [x] **Step 1: 写失败测试，确认 REST 清理英文输出但不动 i18n**

在 `scripts/docs-workflow/prepare-content-group-workspace.test.js` 中创建 fixture：

```js
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')
const { prepareContentGroupWorkspace } = require('./prepare-content-group-workspace')

function write(file, text = 'x') {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

test('rest preparation removes restored English REST outputs and preserves i18n', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-rest-prepare-'))
  write(path.join(root, 'reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'))
  write(path.join(root, 'config/generated/restful.sidebar.js'), 'module.exports=[]\n')
  write(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md'))

  const result = prepareContentGroupWorkspace({ group: 'rest', cwd: root })

  assert.equal(fs.existsSync(path.join(root, 'reference/api/restful/restful')), false)
  assert.equal(fs.existsSync(path.join(root, 'config/generated/restful.sidebar.js')), false)
  assert.equal(fs.existsSync(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md')), true)
  assert.deepEqual(result.removed.sort(), [
    'config/generated/restful.sidebar.js',
    'reference/api/restful/restful',
  ])
})
```

- [x] **Step 2: 写非 REST 测试，确认默认不清空 Feishu 输出**

```js
test('non-rest groups keep restored outputs before incremental reconciliation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-python-prepare-'))
  write(path.join(root, 'reference/api/python/python/old.md'))
  write(path.join(root, 'config/generated/python.sidebar.js'), 'module.exports=[]\n')

  const result = prepareContentGroupWorkspace({ group: 'python', cwd: root })

  assert.equal(fs.existsSync(path.join(root, 'reference/api/python/python/old.md')), true)
  assert.equal(fs.existsSync(path.join(root, 'config/generated/python.sidebar.js')), true)
  assert.deepEqual(result.removed, [])
})
```

- [x] **Step 3: 运行测试确认失败**

Run:

```bash
node --test scripts/docs-workflow/prepare-content-group-workspace.test.js
```

Expected: FAIL，错误为 `Cannot find module './prepare-content-group-workspace'`。

- [x] **Step 4: 实现 REST prepare 脚本**

实现：

```js
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('./group-paths')

function assertSafeRelative(rel) {
  if (!rel || rel.startsWith('/') || rel.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error(`Unsafe group path: ${rel}`)
  }
}

function prepareContentGroupWorkspace({ group, cwd = process.cwd() }) {
  const paths = getGroupPaths(group)
  const removed = []
  if (group !== 'rest') return { group, removed }
  for (const rel of paths.englishOutputs) {
    assertSafeRelative(rel)
    const full = path.join(cwd, ...rel.split('/'))
    if (fs.existsSync(full)) {
      fs.rmSync(full, { recursive: true, force: true })
      removed.push(rel)
    }
  }
  return { group, removed }
}

function main() {
  const group = process.argv[2]
  if (!group) throw new Error('Usage: node scripts/docs-workflow/prepare-content-group-workspace.js <group>')
  const result = prepareContentGroupWorkspace({ group })
  console.log(`[prepare-content-group] ${group}: removed ${result.removed.length} restored path(s)`)
  for (const rel of result.removed) console.log(`- ${rel}`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { prepareContentGroupWorkspace }
```

- [x] **Step 5: 在 producer workflow 中插入 prepare 步骤**

在 `.github/workflows/_fetch-content-group.yml` 的 `Restore generated state from dev baseline` 后、`Fetch content group` 前加入：

```yaml
      - name: Prepare selected content group workspace
        run: node scripts/docs-workflow/prepare-content-group-workspace.js "$GROUP"
```

- [x] **Step 6: 加 workflow policy 测试**

在 `scripts/validate-workflow-policy.test.js` 中断言：

```js
assert.match(workflow, /Restore generated state from dev baseline[\s\S]*Prepare selected content group workspace[\s\S]*Fetch content group/)
assert.match(workflow, /prepare-content-group-workspace\.js "\$GROUP"/)
```

- [x] **Step 7: 运行测试**

Run:

```bash
node --test scripts/docs-workflow/group-paths.test.js scripts/docs-workflow/prepare-content-group-workspace.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS。

- [x] **Step 8: Commit**

```bash
git add scripts/docs-workflow/prepare-content-group-workspace.js scripts/docs-workflow/prepare-content-group-workspace.test.js .github/workflows/_fetch-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix: rebuild REST outputs from master specs"
```

### Task 3: 将 Feishu incremental plan 落实为英文源和输出删除

**Files:**
- Modify: `plugins/lark-docs/canonicalLinkAuditor.js`
- Modify: `plugins/lark-docs/canonicalLinkAuditor.test.js`
- Modify: `plugins/lark-docs/sourceSnapshot.js`
- Modify: `plugins/lark-docs/sourceSnapshot.test.js`
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`
- Modify: `plugins/lark-docs/regression.test.js`

**实施说明:** `guides` 仍按 wiki metadata 做 source 增量拉取；SDK/CLI 的 Drive source 每次完整刷新 source JSON，再基于新 source hash 与 snapshot 计算增量渲染和 removed record 清理。SDK/CLI 不能假设存在可靠的远端 revision metadata。

- [x] **Step 1: 写 canonical record 推导失败测试**

在 `plugins/lark-docs/canonicalLinkAuditor.test.js` 增加测试，覆盖 guides 的显式分类和 SDK 无显式分类时的推导：

```js
test('canonicalRecordsFrom respects explicit placement and infers Feishu docs without requiring slug', () => {
  const records = [
    {
      record_id: 'guide-section',
      fields: {
        'Placement Type': 'section',
        Doc: { text: 'Guide section', link: 'https://example.feishu.cn/wiki/guide-section-token' },
      },
    },
    {
      record_id: 'sdk-doc',
      fields: {
        Doc: { text: 'SDK method', link: 'https://example.feishu.cn/docx/sdk-doc-token' },
      },
    },
    {
      record_id: 'sdk-section',
      fields: { Title: 'Collection operations' },
    },
    {
      record_id: 'external-link',
      fields: {
        Doc: { text: 'External', link: 'https://example.com/reference' },
      },
    },
  ]

  assert.deepEqual(
    canonicalRecordsFrom(records).map(record => record.record_id),
    ['sdk-doc'],
  )
})
```

该测试特别确认 SDK 飞书文档记录即使没有 `Slug` 也属于 canonical；显式为 `section` 的 guides 记录、没有文档的 SDK section 和外部链接记录均不属于 canonical。

- [x] **Step 2: 运行 canonical 判定测试确认失败**

Run:

```bash
node --test plugins/lark-docs/canonicalLinkAuditor.test.js
```

Expected: FAIL，因为当前 fallback 要求 `Slug`，且可能把非飞书 URL 的最后一段误判为 token。

- [x] **Step 3: 实现统一的 canonical record 判定**

在 `plugins/lark-docs/canonicalLinkAuditor.js` 中保留显式 `Placement Type` 的优先级，并把缺省分类改成只识别有效 Feishu/Lark 文档链接：

```js
function isFeishuDocumentRecord(record) {
  const link = docLink(docField(record.fields || {}))
  return Boolean(contentLinkTarget(link))
}

function placementType(record) {
  const value = plainValue(record.fields?.['Placement Type'])
  const normalized = value ? value.trim().toLowerCase() : ''
  if (['canonical', 'ref', 'section', 'link'].includes(normalized)) return normalized
  return isFeishuDocumentRecord(record) ? 'canonical' : 'section'
}
```

`guides` 已填写的 `Placement Type` 继续作为权威值。SDK 手册没有该字段时，`Doc`/`Docs` 指向 `feishu.cn` 或 `larksuite.com` 下的 `wiki`、`doc`、`docs`、`docx` 文档才推导为 canonical；`Slug` 不参与判定。

- [x] **Step 4: 运行 canonical 判定测试**

Run:

```bash
node --test plugins/lark-docs/canonicalLinkAuditor.test.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/sourceSnapshot.test.js
```

Expected: PASS，并确认 planner 与 snapshot 继续共用 `canonicalRecordsFrom(records)` 的同一分类结果。

- [x] **Step 5: 给 snapshot 增加输出路径字段测试**

在 `plugins/lark-docs/sourceSnapshot.test.js` 增加断言：`createSourceSnapshot` 为每个 canonical record 写入 `output_paths` 数组。测试 fixture 中传入：

```js
const snapshot = createSourceSnapshot({
  manualName: 'pymilvus30',
  buildEnv: 'uat',
  docSourceDir: dir,
  records,
  outputPathsByToken: new Map([
    ['doc-token-a', ['reference/api/python/python/Collection/create.md']],
  ]),
})

assert.deepEqual(snapshot.records[0].output_paths, ['reference/api/python/python/Collection/create.md'])
```

- [x] **Step 6: 运行测试确认失败**

Run:

```bash
node --test plugins/lark-docs/sourceSnapshot.test.js
```

Expected: FAIL，因为 `output_paths` 尚未写入。

- [x] **Step 7: 扩展 `createSourceSnapshot`**

在 `plugins/lark-docs/sourceSnapshot.js` 中给 `createSourceSnapshot` 增加可选参数：

```js
outputPathsByToken = new Map(),
```

在每条 record 中写入：

```js
output_paths: [...new Set(outputPathsByToken.get(record.doc_token) || [])].sort(),
```

旧调用方不传该参数时输出空数组，保证兼容。

- [x] **Step 8: 写 removed record 删除回归测试**

在 `plugins/lark-docs/regression.test.js` 构造：

```text
docSourceDir/removed-token.json
reference/api/python/python/old-path.md
config/generated/python.sidebar.js
```

并构造 incremental plan：

```js
{
  mode: 'incremental',
  expanded_tokens: [],
  removed_records: [{
    doc_token: 'removed-token',
    source_file: 'removed-token.json',
    output_paths: ['reference/api/python/python/old-path.md'],
  }],
}
```

断言执行 cleanup 后：

```js
assert.equal(fs.existsSync(path.join(root, 'plugins/lark-docs/meta/sources/python/v3.0.x/removed-token.json')), false)
assert.equal(fs.existsSync(path.join(root, 'reference/api/python/python/old-path.md')), false)
```

- [x] **Step 9: 修改 `cleanupRemovedIncrementalRecords`**

在 `plugins/lark-docs/index.js` 中优先使用 `record.output_paths` 删除英文输出。保留现有 `utils.determine_file_path(record.doc_token, targetOutputDir)` 作为旧 snapshot fallback。删除后调用 `removeEmptyDirs(targetOutputDir)`。

核心逻辑：

```js
for (const rel of record.output_paths || []) {
  if (rel.startsWith(`${targetOutputDir.replace(/^\.\//, '')}/`)) {
    fs.rmSync(path.resolve(rel), { force: true })
  }
}
```

路径判断必须使用 `path.resolve` 和 containment 检查，不能删除 outputDir 外的文件。

- [x] **Step 10: 在 sidebar 重建条件中保留 removed 触发**

确认 `shouldUpdateSidebar` 继续包含：

```js
(sourcePlan.removed_records || []).length > 0
```

若缺失则补回。

- [x] **Step 11: 运行 Feishu 相关测试**

Run:

```bash
node --test plugins/lark-docs/canonicalLinkAuditor.test.js plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/regression.test.js
```

Expected: PASS。

- [x] **Step 12: Commit**

```bash
git add plugins/lark-docs/canonicalLinkAuditor.js plugins/lark-docs/canonicalLinkAuditor.test.js plugins/lark-docs/sourceSnapshot.js plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/index.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/regression.test.js
git commit -m "fix: reconcile removed Feishu docs during incremental fetch"
```

### Task 4: 从 source checkpoint diff 推导翻译对账计划

**Files:**
- Create: `scripts/translation/sourceDelta.js`
- Create: `scripts/translation/sourceDelta.test.js`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`

- [x] **Step 1: 写 source delta 映射测试**

在 `scripts/translation/sourceDelta.test.js` 中测试 path mapping：

```js
const test = require('node:test')
const assert = require('node:assert/strict')
const { mapEnglishToI18nPath } = require('./sourceDelta')

test('maps docs and reference paths to ja-JP i18n paths', () => {
  assert.equal(
    mapEnglishToI18nPath('docs/tutorials/get-started/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/get-started/a.md'
  )
  assert.equal(
    mapEnglishToI18nPath('docs-byoc/tutorials/deployment/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/deployment/a.md'
  )
  assert.equal(
    mapEnglishToI18nPath('reference/api/restful/restful/v2/a.mdx'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/a.mdx'
  )
})
```

测试 group 过滤：

```js
const { classifySourceDelta } = require('./sourceDelta')

test('classifies deleted and changed files for a selected group', () => {
  const result = classifySourceDelta({
    group: 'rest',
    changes: [
      { status: 'D', path: 'reference/api/restful/restful/old.mdx' },
      { status: 'A', path: 'reference/api/restful/restful/new.mdx' },
      { status: 'M', path: 'reference/api/python/python/other.md' },
    ],
  })
  assert.deepEqual(result.deletedI18n, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx',
  ])
  assert.deepEqual(result.changedEnglish, [
    'reference/api/restful/restful/new.mdx',
  ])
})
```

- [x] **Step 2: 运行测试确认失败**

Run:

```bash
node --test scripts/translation/sourceDelta.test.js
```

Expected: FAIL，错误为 `Cannot find module './sourceDelta'`。

- [x] **Step 3: 实现 `sourceDelta.js`**

实现并导出：

```js
function mapEnglishToI18nPath(path) { ... }
function classifySourceDelta({ group, changes }) { ... }
function parseGitNameStatus(text) { ... }
```

`parseGitNameStatus` 支持：

```text
A\tpath
M\tpath
D\tpath
R100\told\tnew
```

`R*` 输出为：

- `deletedI18n` 包含旧路径映射；
- `changedEnglish` 包含新路径；
- `renamed` 记录 `{ oldPath, newPath, oldI18nPath, newI18nPath }`。

- [x] **Step 4: 修改 translation manifest 支持 source delta 输入**

给 `scripts/translation/manifest.js` 增加参数：

```text
--source-delta <path>
```

当传入 source delta 时：

- 把 `changedEnglish` 中仍存在的文件优先加入 manifest；
- 继续用 cache/hash 收集历史 pending backlog，保证失败和 `max_files` 截断后的文件可重试；
- 删除项不加入模型翻译队列；
- manifest JSON 顶层写入：

```json
{
  "source_delta": {
    "deleted_i18n": [],
    "renamed": []
  }
}
```

- [x] **Step 5: 写 manifest 测试**

在 `scripts/translation/manifest.test.js` 中创建 source delta 文件：

```json
{
  "changedEnglish": ["reference/api/restful/restful/new.mdx"],
  "deletedI18n": ["i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx"],
  "renamed": []
}
```

断言 manifest 包含 `new.mdx`，并保留 `source_delta.deleted_i18n`。

- [x] **Step 6: 运行测试**

Run:

```bash
node --test scripts/translation/sourceDelta.test.js scripts/translation/manifest.test.js
```

Expected: PASS。

- [x] **Step 7: Commit**

```bash
git add scripts/translation/sourceDelta.js scripts/translation/sourceDelta.test.js scripts/translation/manifest.js scripts/translation/manifest.test.js
git commit -m "feat: derive translation deltas from source checkpoints"
```

### Task 5: translation job 支持 i18n 删除和 deletion-only checkpoint

**Files:**
- Create: `scripts/translation/applySourceDelta.js`
- Create: `scripts/translation/applySourceDelta.test.js`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [x] **Step 1: 写删除 i18n 和 cache entry 的失败测试**

在 `scripts/translation/applySourceDelta.test.js` 中创建：

```js
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')
const { applySourceDelta } = require('./applySourceDelta')

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

test('removes deleted i18n files and translation cache entries', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-i18n-delta-'))
  const deleted = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx'
  write(path.join(root, deleted), '# old\n')
  write(path.join(root, '.translation-cache/ja-JP.json'), JSON.stringify({
    files: {
      [deleted]: { hash: 'old', translatedAt: '2026-07-14T00:00:00.000Z' },
      keep: { hash: 'keep' },
    },
  }, null, 2))

  const result = applySourceDelta({
    cwd: root,
    delta: { deletedI18n: [deleted], renamed: [], changedEnglish: [] },
  })

  assert.equal(fs.existsSync(path.join(root, deleted)), false)
  const cache = JSON.parse(fs.readFileSync(path.join(root, '.translation-cache/ja-JP.json'), 'utf8'))
  assert.equal(cache.files[deleted], undefined)
  assert.deepEqual(result.deletedI18n, [deleted])
})
```

- [x] **Step 2: 写 deletion-only checkpoint 条件测试**

在同一测试文件中断言：

```js
assert.equal(result.hasTranslationMutation, true)
```

即使 `changedEnglish` 为空，只要 `deletedI18n` 非空，也要让 workflow 创建 translation checkpoint。

- [x] **Step 3: 运行测试确认失败**

Run:

```bash
node --test scripts/translation/applySourceDelta.test.js
```

Expected: FAIL，错误为 `Cannot find module './applySourceDelta'`。

- [x] **Step 4: 实现 `applySourceDelta.js`**

实现：

```js
function applySourceDelta({ cwd = process.cwd(), delta }) {
  // 删除 delta.deletedI18n
  // 迁移或删除 delta.renamed 对应 cache key
  // 更新 .translation-cache/ja-JP.json
  // 返回 { deletedI18n, renamedI18n, cacheChanged, hasTranslationMutation }
}
```

路径安全规则：

- 只能删除 `i18n/ja-JP/` 下路径；
- 只能修改 `.translation-cache/ja-JP.json`；
- 拒绝绝对路径和 `..`。

- [x] **Step 5: 修改 translation workflow 生成和应用 source delta**

在 `_translate-content-group.yml` 的 `Materialize source checkpoint and baseline` 后加入：

```yaml
      - name: Build source translation delta
        id: source_delta
        if: ${{ inputs.should_translate }}
        run: |
          set -euo pipefail
          git diff --name-status "$SOURCE_COMMIT_SHA^" "$SOURCE_COMMIT_SHA" > tmp/source-name-status.txt
          node scripts/translation/sourceDelta.js --group "$GROUP" --name-status tmp/source-name-status.txt --output tmp/source-delta.json
          node scripts/translation/applySourceDelta.js --delta tmp/source-delta.json --report tmp/source-delta-report.json
          echo "has_mutation=$(node -p "require('./tmp/source-delta-report.json').hasTranslationMutation ? 'true' : 'false'")" >> "$GITHUB_OUTPUT"
```

如果 source checkpoint 可能不是单父提交，脚本应使用传入的 baseline artifact 或 `git merge-base`。当前 checkpoint publisher 生成线性普通提交，因此第一版使用 `$SOURCE_COMMIT_SHA^`。

- [x] **Step 6: 修改 manifest 调用传入 source delta**

在 `Build group translation manifest` 中加入：

```bash
node scripts/translation/manifest.js --locale ja-JP --output tmp/translation-manifest.json --max-files "${{ inputs.max_files }}" --group "$GROUP" --source-checkpoint-sha "$SOURCE_COMMIT_SHA" --source-delta tmp/source-delta.json "${batch_args[@]}"
```

- [x] **Step 7: 修改 checkpoint 条件支持删除-only**

把 `Create validated translation checkpoints` 的条件从：

```yaml
if: ${{ inputs.should_translate && steps.agents.outputs.translated_count != '0' }}
```

改为：

```yaml
if: ${{ inputs.should_translate && (steps.agents.outputs.translated_count != '0' || steps.source_delta.outputs.has_mutation == 'true') }}
```

`Validate translated group` 也要在 deletion-only 时运行 MDX parse 和 build：

```yaml
if: ${{ inputs.should_translate && (steps.agents.outputs.translated_count != '0' || steps.source_delta.outputs.has_mutation == 'true') }}
```

- [x] **Step 8: 修改 result 状态**

当 `translated_count == 0` 但 `source_delta.has_mutation == true` 且 artifact 上传成功时，返回：

```text
status=translation_ready
translated_count=0
```

不能返回 `no_changes`。

- [x] **Step 9: 运行测试和 workflow policy**

Run:

```bash
node --test scripts/translation/sourceDelta.test.js scripts/translation/applySourceDelta.test.js scripts/translation/manifest.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS。

- [x] **Step 10: Commit**

```bash
git add scripts/translation/applySourceDelta.js scripts/translation/applySourceDelta.test.js .github/workflows/_translate-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix: publish translation deletions from source deltas"
```

### Task 6: 扩展英文和日文 coverage 验证

**Files:**
- Modify: `scripts/validate-generated-sidebars.js`
- Modify: `scripts/validate-generated-sidebars.test.js`
- Create: `scripts/validate-translated-coverage.js`
- Create: `scripts/validate-translated-coverage.test.js`
- Modify: `.github/workflows/_verify-docs.yml`
- Modify: `.github/workflows/_translate-content-group.yml`

- [x] **Step 1: 扩展 reference sidebar target 测试**

在 `scripts/validate-generated-sidebars.test.js` 中为 python/java/node/go/cli/rest 创建 fixture，断言 sidebar doc id 指向不存在文件时失败。错误文本必须包含：

```text
<sidebar>.sidebar.js references missing generated document files
```

- [x] **Step 2: 修改 `validate-generated-sidebars.js`**

将当前只验证 `restful.sidebar.js` 的逻辑扩展为表驱动：

```js
const referenceSidebarTargets = [
  { sidebar: 'python.sidebar.js', outputDir: 'reference', idPrefix: 'api/python/python' },
  { sidebar: 'java.sidebar.js', outputDir: 'reference', idPrefix: 'api/java/java/v2' },
  { sidebar: 'node.sidebar.js', outputDir: 'reference', idPrefix: 'api/nodejs/nodejs' },
  { sidebar: 'go.sidebar.js', outputDir: 'reference', idPrefix: 'api/go/go/v2' },
  { sidebar: 'cli.sidebar.js', outputDir: 'reference', idPrefix: 'cli/cli' },
  { sidebar: 'restful.sidebar.js', outputDir: 'reference', idPrefix: 'api/restful/restful' },
]
```

每个存在的 sidebar 都调用 `validateSidebarDocTargets`。

- [x] **Step 3: 写 translated coverage 测试**

在 `scripts/validate-translated-coverage.test.js` 中创建英文和日文 fixture：

```text
reference/api/restful/restful/new.mdx
i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/new.mdx
i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/orphan.mdx
```

断言：

```js
assert.throws(
  () => validateTranslatedCoverage({ group: 'rest', cwd: root }),
  /orphan translated files/
)
```

新增英文但没有日文时不失败，只报告 pending：

```js
const result = validateTranslatedCoverage({ group: 'rest', cwd: root, failOnPending: false })
assert.deepEqual(result.pendingTranslations, ['reference/api/restful/restful/new-only.mdx'])
```

- [x] **Step 4: 实现 `validate-translated-coverage.js`**

导出：

```js
function validateTranslatedCoverage({ group, cwd = process.cwd(), failOnPending = false }) { ... }
```

规则：

- 遍历 group 的英文输出文档；
- 映射到日文路径；
- 日文存在但英文不存在为 orphan，默认失败；
- 英文存在但日文不存在为 pending，默认不失败；
- 只检查 `.md` 和 `.mdx`；
- 忽略非文档资源。

CLI:

```bash
node scripts/validate-translated-coverage.js --group rest
```

- [x] **Step 5: 在 workflow 中运行 translated coverage**

在 `_translate-content-group.yml` 的 `Validate translated group` 中加入：

```bash
node scripts/validate-translated-coverage.js --group "$GROUP"
```

在 `_verify-docs.yml` 中对所有可翻译 group 运行：

```bash
for group in guides python java node go cli rest; do
  node scripts/validate-translated-coverage.js --group "$group"
done
```

- [x] **Step 6: 运行验证测试**

Run:

```bash
node --test scripts/validate-generated-sidebars.test.js scripts/validate-translated-coverage.test.js
node scripts/validate-generated-sidebars.js
for group in guides python java node go cli rest; do node scripts/validate-translated-coverage.js --group "$group"; done
```

Expected: PASS。如果当前仓库已有 orphan 日文文件，先不要修 validator；记录 orphan 列表，用一次性内容对账提交清理。

- [x] **Step 7: Commit**

```bash
git add scripts/validate-generated-sidebars.js scripts/validate-generated-sidebars.test.js scripts/validate-translated-coverage.js scripts/validate-translated-coverage.test.js .github/workflows/_verify-docs.yml .github/workflows/_translate-content-group.yml
git commit -m "test: validate generated and translated doc coverage"
```

### Task 7: REST 故障回归测试

**Files:**
- Create: `scripts/docs-workflow/rest-reconciliation.test.js`
- Modify: `scripts/docs-workflow/run-content-group.test.js`
- Modify: `plugins/apifox-docs/on-demand-cluster-segment.test.js`

- [x] **Step 1: 创建 REST stale baseline fixture 测试**

在 `scripts/docs-workflow/rest-reconciliation.test.js` 中模拟：

```text
baseline/reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx
baseline/config/generated/restful.sidebar.js
workspace 已 restore baseline
```

调用：

```js
prepareContentGroupWorkspace({ group: 'rest', cwd: workspace })
```

断言旧 REST 英文输出和旧 sidebar 被删除。

- [x] **Step 2: 验证 run-content-group REST 命令仍然完整生成**

在 `scripts/docs-workflow/run-content-group.test.js` 中确认：

```js
assert.deepEqual(commandsFor('rest'), [
  ['npx', 'docusaurus', 'fetch-apifox-docs', '-s', 'plugins/apifox-docs/meta/openapi/'],
])
```

- [x] **Step 3: 扩展 on-demand cluster 测试**

在 `plugins/apifox-docs/on-demand-cluster-segment.test.js` 中保留现有断言，并增加：

```js
assert.equal(sidebarIds.has('api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2'), false)
assert.equal(sidebarIds.has('api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2'), true)
```

- [x] **Step 4: 运行 REST 相关测试**

Run:

```bash
node --test scripts/docs-workflow/rest-reconciliation.test.js scripts/docs-workflow/run-content-group.test.js plugins/apifox-docs/on-demand-cluster-segment.test.js
```

Expected: PASS。

- [x] **Step 5: Commit**

```bash
git add scripts/docs-workflow/rest-reconciliation.test.js scripts/docs-workflow/run-content-group.test.js plugins/apifox-docs/on-demand-cluster-segment.test.js
git commit -m "test: cover REST reconciliation after spec moves"
```

### Task 8: 端到端验证与上线顺序

**Files:**
- Modify: `.claude/superpowers/specs/2026-07-14-incremental-doc-reconciliation-design.md`
- Modify: `.claude/superpowers/plans/2026-07-14-incremental-doc-reconciliation.md`

- [x] **Step 1: 跑核心单测**

Run:

```bash
node --test \
  scripts/docs-workflow/group-paths.test.js \
  scripts/docs-workflow/prepare-content-group-workspace.test.js \
  scripts/docs-workflow/rest-reconciliation.test.js \
  scripts/translation/sourceDelta.test.js \
  scripts/translation/applySourceDelta.test.js \
  scripts/translation/manifest.test.js \
  scripts/validate-generated-sidebars.test.js \
  scripts/validate-translated-coverage.test.js \
  plugins/lark-docs/sourceSnapshot.test.js \
  plugins/lark-docs/incrementalFetchPlanner.test.js \
  plugins/lark-docs/regression.test.js
```

Expected: PASS。

- [x] **Step 2: 跑 workflow policy**

Run:

```bash
node scripts/validate-workflow-policy.js
```

Expected: PASS。

- [x] **Step 3: 跑当前工作区验证**

Run:

```bash
node scripts/validate-generated-sidebars.js
for group in guides python java node go cli rest; do node scripts/validate-translated-coverage.js --group "$group"; done
```

Expected: PASS，或输出明确 orphan 列表供一次性清理提交。

- [x] **Step 4: REST dry run**

Run:

```bash
node scripts/docs-workflow/prepare-content-group-workspace.js rest
npx docusaurus fetch-apifox-docs -s plugins/apifox-docs/meta/openapi/
node scripts/validate-generated-sidebars.js
```

Expected: PASS，`config/generated/restful.sidebar.js` 不再引用旧 on-demand cluster 路径。

- [x] **Step 5: 构建验证**

Run:

```bash
node scripts/run-doc-build-stage.js --build "pnpm run build"
```

Expected: PASS。

实际结果：54 项核心对账测试和 71 项 ownership/landing/checkpoint 相关回归通过；workflow policy、全部 reference sidebar target、5 个 SDK/CLI landing page 和 7 个内容组 translated coverage 通过。REST dry run 成功且生成树无差异。Docusaurus `en`/`ja-JP` 静态构建通过；受限网络下线上 sitemap link-check 无法解析 `docs.zilliz.com`，使用 `--skipLinkChecks --skipCardReporting` 的构建验证通过。

- [x] **Step 6: 上线顺序**

按以下顺序合并和运行：

1. 先合并 path metadata、REST prepare、coverage validator。
2. 手动运行 `rest` 组，确认 source checkpoint 能发布到 `dev`。
3. 运行 `translate rest`，确认 deletion-only 或 changed translation checkpoint 能发布。
4. 再启用 Feishu removed-record 输出路径增强。
5. 对 `python` 选择一个小范围删除/移动 fixture 做 workflow_dispatch。
6. 最后恢复 scheduled all-groups workflow。

- [x] **Step 7: 更新文档状态**

在本计划顶部追加执行结果：

```markdown
**Execution status:** Implemented and verified through `cb11c2298`.
```

不要在未完成验证前添加该行。

- [x] **Step 8: Commit plan/spec 更新**

```bash
git add .claude/superpowers/specs/2026-07-14-incremental-doc-reconciliation-design.md .claude/superpowers/plans/2026-07-14-incremental-doc-reconciliation.md
git commit -m "docs: plan incremental doc reconciliation"
```
