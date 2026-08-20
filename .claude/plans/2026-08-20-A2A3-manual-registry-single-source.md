# A2/A3: 手册 registry 单源化 — 设计文档

日期: 2026-08-20
分支: codex/manual-registry-single-source (worktree: .claude/worktrees/manual-registry-single-source)
状态: A1 已完成并验证；本文档定义 A2/A3 并开始执行。

## 1. 目标与验收标准

**目标**: 新增一个 reference 手册（以 cpp 为真实范例）时，只需修改
`packages/docs-tooling/src/manuals/registry.ts`（以及 registry schema 里的元数据字段），
网站发布后全链路可见：

- fetch/validate/publish（源生成）流程拿到新手册
- 站点导航（navbar 的 API & SDK 下拉、CLI 入口、reference landing）
- sidebar（en/zh-CN 生成物加载）
- reference 校验（reference-navigation.json 的 zod 闭集 + EXPECTED_TARGETS）
- 翻译流程（ja-JP / zh-CN-reference 单元、reconciliation policy）
- CI fetch 矩阵（fetch-docs.yml 的 produce_* job、needs、needed set）

**验收方式**: 用 cpp 手册做一次“只改 registry + schema”的实测（在 cpp WIP worktree 上验证），
确认不再需要手改 cpp WIP 那 90 个文件。

**非目标**: byte-identical 一致无意义；retired 版本（gov1/javaV1）不呈现；所有版本靠
fallbackSourceDir 拉通。

## 2. 现状：新增手册的硬编码改动面（来自 cpp WIP diff 勘察）

cpp WIP worktree (`cpp-sdk-manual-wip` @ b8c3b5ccb) 的 `git diff master` 是 90 files,
+608/-763。剔除与 cpp 无关的噪音（Inkeep/ChatButton 重构、nginx、translation recovery
清理），真正的“新增 cpp 手册”硬编码改动面如下，这就是 A2/A3 要消灭的全部：

### 2.1 源生成 / 校验层（docs-tooling）

| 文件 | 硬编码点 | 派生来源（设计） |
|---|---|---|
| `workflows/groups.ts` | GROUP_ORDER / MANUALS / COMMIT_MESSAGES / zh-CN 拒绝组 | registry definitions 派生 |
| `lark/revisionInventory.ts` | `REVISION_GROUPS` + `RevisionGroup` 类型 | en `listPublicationGroups()` |
| `cli-main.ts` | 重复的 `REVISION_GROUPS`（transpile 动态加载） | 同上，去重 |
| `lark/cli.js` | `DISPLAYED_SIDEBARS` | publication.sidebarKey / manual id |
| `validation/referenceNavigation.ts` | EXPECTED_TARGETS / zod enum / `.length(6)` | registry 呈现元数据 |
| `reference/sidebarDerivation.ts` | REFERENCE_SIDEBARS / REFERENCE_SIDEBAR_GROUPS | registry 呈现元数据 |
| `reference/translationManifest.ts` | `referenceManualForRelativePath` ownership 表 | registry outputDir/retiredPaths 前缀（参照 cli.ts 的 defaultReferenceManualForPath） |
| `manuals/derive/larkConfig.ts` | MANUAL_ORDER / SECTION_EQUALS | registry 派生 |

### 2.2 站点呈现层（site-config / docs-ui）

| 文件 | 硬编码点 |
|---|---|
| `site-config/src/schema.ts` | `referenceKinds` 闭集 enum |
| `site-config/src/sites/en.ts` | navigation API&SDK items + referenceKinds |
| `site-config/src/sites/zh-CN.ts` | 同上 |
| `site-config/src/sidebars/en/reference.ts` | 每个 sidebarKey 一行 require |
| `site-config/src/sidebars/zh-CN/reference.ts` | 每个 sidebarKey 一行 loadPublishedSidebar |
| `docs-ui/src/shared/navigation/docsRoute.ts` | ReferenceTarget 联合 + referenceTargets 映射 |
| `docs-ui/src/shared/navigation/manualReferenceNavigation.ts` | targets 数组 + labels + entryRedirects |
| `config/reference-navigation.json` | targets 数组（文档 ID 前缀、landing、最小字数等） |

### 2.3 CI / 脚本层（fetch + translation）

| 文件 | 硬编码点 |
|---|---|
| `.github/workflows/fetch-docs.yml` | group 选项、case、produce_* job、needs、needed set |
| `scripts/fetch-sdk-reference-docs.sh` | group 列表 |
| `scripts/update-sdk-reference-snapshots.sh` | groups 数组 + usage |
| `scripts/restore-generated-state.sh` | sidebar 路径列表 |
| `scripts/docs-workflow/fetch-publication-selection.js` | FETCH_UNIT_KEYS + DEFINITIONS |
| `scripts/docs-workflow/fetch-publication-adapter.js` | FETCH_UNIT_KEYS + selectedGroup 校验 |
| `scripts/docs-workflow/fetch-publication-results.js` | FETCH_GROUP_UNIT_KEYS + requiredUnitKeys |
| `scripts/docs-workflow/fetch-reference-reconciliation.js` | REFERENCE_GROUPS |
| `scripts/docs-workflow/docs-progress-state.js` | SDK_LABELS / FETCH_BUSINESS_ORDER / UNIT_TO_CARD_ID |
| `scripts/docs-workflow/monitor-docs-progress.js` | ALL_GROUPS / PUBLICATION_UNITS / ORDER |
| `scripts/docs-workflow/monitor-translation-progress.js` | TRANSLATION_UNIT_ORDER |
| `scripts/docs-workflow/source-publication-barrier.js` | GROUPS |
| `scripts/docs-workflow/translation-progress-state.js` | SDK_GROUPS / GROUP_LABELS / SUPPORTED_UNITS / regex |
| `scripts/docs-workflow/translation-publication-adapter.js` | TRANSLATION_SELECTED_GROUPS / UNIT_KEYS |
| `scripts/docs-workflow/translation-publication-selection.js` | TRANSLATION_UNIT_KEYS |
| `scripts/docs-workflow/validate-checkpoint-artifact.js` | sidebar regex |
| `scripts/docs-workflow/replay-fetch-publication-fifo.js` | unitCount 8 -> 9（应动态） |
| `scripts/docs-workflow/replay-translation-publication-fifo.js` | isSdk regex |
| `scripts/docs-workflow/report-live-card.sh` | groups_json |
| `scripts/translation/selection.js` | GROUPS |
| `scripts/translation/reconciliation-discovery.js` | TARGET_GROUPS / TARGET_MAPPINGS |
| `scripts/translation/validate-group.js` | REFERENCE_ROOTS |
| `scripts/translation/agentRunner.js` | loadReferenceLandingContracts 直接读 JSON |
| `config/translation/reconciliation-policy.json` | 每手册 targets 条目 |
| `deploy/contracts/path-filters.json` | sidebar 路径 |
| `.github/workflows/_translate-content-group.yml` | 参数固化（需评估） |

## 3. 架构决策

### 3.1 registry 是唯一 single source of truth

`registry.ts` 的 `definitions` 已含 fetch 所需全部数据（source、publication、sidebarPath、
retiredPaths、preservedFiles）。A2 给 schema 增加**站点呈现元数据**，让“新增手册”的所有
呈现数据也进 registry。

### 3.2 派生层（derive/）而非运行时跨包依赖

- site-config 目前只依赖 zod；docs-ui 不依赖 docs-tooling。跨包运行时依赖会破坏构建拓扑。
- 采用 A1 已验证的模式：`derive/` 下建纯函数派生器（输入 registry，输出形状对象/生成文本），
  由生成脚本（`scripts/generate-*`）产出**提交的生成物**（config/lark-docs.config.ts、
  config/reference-navigation.json、site-config 的呈现片段、sidebars/reference.ts 等）。
- 运行时消费者读生成物，不 import docs-tooling。校验器（zod 闭集）改从 registry 派生
  （docs-tooling 内部可 import registry，无跨包问题）。

### 3.3 分层执行

- **A2（低风险，先做）**: docs-tooling 内部硬编码去重 + schema 呈现元数据 + site-config/docs-ui
  呈现生成化 + reference 校验/translation manifest 派生。全部可离线验证（typecheck + 单测 + check 脚本）。
- **A3（高风险，最后做）**: CI 矩阵化（fetch-docs.yml 单矩阵 job）与所有 `scripts/docs-workflow`
  / `scripts/translation` 的非单源脚本同步。涉及 GitHub Actions 语义，需谨慎并逐项用 policy 测试验证。

## 4. schema 扩展设计（A2 核心）

在 `schema.ts` 增加 reference 呈现元数据（可选，仅 reference kind 生效）：

```ts
export const ReferencePresentationSchema = z.object({
  // node -> nodejs, rest -> restful, cpp -> cpp, python -> python...
  referenceKind: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  // sidebar name (e.g. 'cpp') 与 sidebar key (e.g. 'cppSidebar')
  sidebar: z.string().min(1),
  sidebarKey: z.string().min(1),
  // 导航
  label: z.object({en: z.string().min(1), 'zh-CN': z.string().min(1)}),
  icon: z.string().min(1),
  href: z.string().min(1).superRefine(v => v.startsWith('/reference/')),
  navOrder: z.number().int().nonnegative(),
  // landing 契约（reference-navigation.json 的单条 target）
  documentIdPrefix: z.string().min(1),
  landingPage: z.string().min(1).superRefine(v => /.mdx?$/u.test(v)),
  minimumProseCharacters: z.number().int().positive(),
  minimumHeadingCount: z.number().int().positive(),
  requireSourceDifference: z.boolean(),
}).strict();
```

`ManualDefinitionSchema` 增加 `presentation?: ReferencePresentationSchema`（reference 必填，
非 reference 禁止）。并在 `validateManualRegistry` 里校验 reference kind 必须有 presentation，
非 reference 不得有。

## 5. 实施顺序与验证

每个步骤：改一处 -> 跑最小聚焦测试 -> 相关 suite。

### A2 第一梯队（docs-tooling 内部去硬编码，无 schema 变更）

1. `workflows/groups.ts`: GROUP_ORDER / MANUALS / COMMIT_MESSAGES / zh-CN 拒绝组从
   `manualRegistry` 派生（参照 A1 larkConfigView.ts 模式）。
   验证: `pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts` + `node --test scripts/docs-workflow/content-groups.test.js`
2. `lark/revisionInventory.ts` + `cli-main.ts`: REVISION_GROUPS 从 en `listPublicationGroups()`
   派生，消除 cli-main 重复常量。
   验证: `pnpm vitest run packages/docs-tooling/src/lark` + typecheck
3. `lark/cli.js` DISPLAYED_SIDEBARS: 由 registry 的 sidebarKey/manual id 派生。
   验证: `node --test scripts/guides-sdk-isolation.test.js`
4. `reference/translationManifest.ts` ownership 表: 从 registry outputDir/retiredPaths 前缀派生
   （复用 cli.ts defaultReferenceManualForPath 逻辑）。
   验证: `pnpm vitest run packages/docs-tooling/src/reference`

### A2 第二梯队（schema 呈现元数据 + 站点呈现生成化）

5. schema.ts 增加 ReferencePresentationSchema（见上），registry 补齐 6 个现有 reference 的
   presentation 元数据（python/java/node/go/cli/rest），validateManualRegistry 加约束。
   验证: `pnpm vitest run packages/docs-tooling/src/manuals`
6. `referenceNavigation.ts`: EXPECTED_TARGETS / zod enum / .length 从 registry presentation 派生。
7. `sidebarDerivation.ts`: REFERENCE_SIDEBARS / REFERENCE_SIDEBAR_GROUPS 从 registry 派生。
8. 新增生成脚本 `scripts/generate-reference-presentation.js`，产出：
   - `config/reference-navigation.json`（targets 从 presentation 派生）
   - `packages/site-config/src/sidebars/{en,zh-CN}/reference.ts`（sidebarKey -> require/load 行）
   - `packages/site-config/src/sites/{en,zh-CN}.ts` 的 referenceKinds 与 navigation API&SDK items
     （通过生成器注入，而非运行时跨包依赖）
   - `docs-ui` 的 ReferenceTarget 映射 / manualReferenceNavigation targets
     （若 docs-ui 无法生成器注入，则改为从 site-config 暴露的运行时数据读取；优先生成器）
9. 补齐 site-config schema 的 referenceKinds 放开为生成注入。
10. `larkConfig.ts` 的 MANUAL_ORDER / SECTION_EQUALS 去硬编码（从 registry 派生）。
    验证: `pnpm check:lark-config` + `pnpm vitest run packages/docs-tooling/src/manuals`

### A3 第三梯队（CI/脚本矩阵化，最后做）

11. `fetch-docs.yml`: produce_* 单矩阵 job；case/needs/needed set 动态化。
12. Shell 脚本组列表动态读 registry。
13. 非单源脚本同步（2.3 表格），统一从 registry 派生 group 列表、unitKey、label。
    验证: `node --test scripts/validate-workflow-policy.test.js` + `node --test scripts/docs-workflow/*.test.js`
    + `node --test scripts/sdk-reference-workflow.test.js`

## 6. cpp 目标 registry 片段（A2 完成后可直接粘贴验证）

```ts
{
  id: 'cpp',
  kind: 'reference',
  sources: {
    'english-v2.6': remote('drive', 'CSzVfDgfAlne87dDj3vcnR3nnsg', 'XmndbkxkQaigA8soRiCcTT41nMd', 'cpp/v2.6.x', 'cppv26', 'v2.6.x', 'fallback'),
    'english-v3.0': remote('drive', 'NVjgfJr5aleBsedDoKCcDpnJn9b', 'QdLkbfmnFatl4TsThKDc5Dobn5g', 'cpp/v3.0.x', 'cppv30', 'v3.0.x', 'active', 'english-v2.6'),
    chineseTranslation: local('content/zh-CN/reference/api/cpp/cpp'),
  },
  sourceOrder: ['english-v2.6', 'english-v3.0', 'chineseTranslation'],
  publications: {
    en: publication('en', 'english-v3.0', 'reference/api/cpp/cpp', 'reference', 'cpp', 'zilliz', undefined, ['cpp.md']),
    'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/cpp/cpp', 'reference', 'cpp'),
  },
  presentation: {
    referenceKind: 'cpp', sidebar: 'cpp', sidebarKey: 'cppSidebar',
    label: {en: 'C++ SDK', 'zh-CN': 'C++ SDK'}, icon: 'cpp', href: '/reference/cpp', navOrder: 6,
    documentIdPrefix: 'api/cpp/cpp', landingPage: 'api/cpp/cpp/cpp.md',
    minimumProseCharacters: 300, minimumHeadingCount: 2, requireSourceDifference: true,
  },
}
```

## 7. 风险与注意事项

- **不重做 A1**: worktree 已有 9 modified + derive/ + generate-lark-docs-config.js 等 untracked，
  保持这些不动，只新增本任务文件。
- **cpp WIP 里的噪音**不要照搬：Inkeep/ChatButton、nginx、translation recovery 清理与本任务无关。
- **replay unitCount 8->9** 这类魔法数字应改为动态（从 selection.units.length 派生），避免再次硬编码。
- **跨包依赖方向**是最大结构风险：site-config/docs-ui 不能运行时 import docs-tooling；
  一律走生成器产出提交物。
- **A3 CI 矩阵**风险最高，放在最后；每一步用 validate-workflow-policy 测试把关，失败即停。

## 8. 验证命令汇总（worktree 内）

```bash
pnpm typecheck
pnpm vitest run packages/docs-tooling/src/manuals
pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts
node --test scripts/docs-workflow/content-groups.test.js
node --test scripts/validate-workflow-policy.test.js
pnpm test:retirement
pnpm test:typescript-runtime-boundary
pnpm check:lark-config
node --test scripts/doc-publish-bot/publishRequest.test.js
node --test scripts/sdk-reference-workflow.test.js
```

## 9. 执行状态（2026-08-20 会话）

### A2 —— 已完成并验证 ✅

- registry.ts 为 6 个 reference 补齐 presentation 元数据 + 校验（sidebar/documentIdPrefix/landingPage 一致性）。
- groups.ts / revisionInventory.ts+cli-main.ts / lark-cli.js DISPLAYED_SIDEBARS / translationManifest.ts ownership 全部从 registry 派生。
- referenceNavigation.ts / sidebarDerivation.ts / derive/larkConfig.ts 从 registry 派生。
- 新增 derive/referencePresentation.ts + scripts/generate-reference-presentation.js（--check 模式），生成：
  - config/reference-navigation.json（与提交版本字节一致）
  - packages/site-config/src/sidebars/{en,zh-CN}/reference.ts
  - packages/site-config/src/generated/referencePresentation.ts（sites 注入）
  - packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts
- sites/{en,zh-CN}.ts 消费生成片段；site-config schema referenceKinds 放开；docs-ui ReferenceTarget/aliases/targets 生成化。
- site-validation.yml 增加 pnpm check:reference-presentation；package.json 增加 generate/check:reference-presentation。

### A3 —— 脚本层核心已完成 ✅，其余为剩余项

新增 derive/workflowUnits.ts（fetch/translation 单位、组、标签、roots、orders 全部 registry 派生），并转换：
- fetch-publication-selection / -adapter / -results / fetch-reference-reconciliation / source-publication-barrier
- translation-publication-selection / -adapter
- docs-progress-state / monitor-docs-progress / monitor-translation-progress / translation-progress-state
- translation/validate-group / translation/reconciliation-discovery
- validate-checkpoint-artifact（sidebar 正则）、replay-fetch-publication-fifo（unitCount 动态）、replay-translation-publication-fifo（isSdk 派生）
- 例外：scripts/translation/selection.js 因 workflow-policy 测试会复制到临时目录再 require，保持自包含未转换。

### 剩余项（本次未做，需单独任务）

1. fetch-docs.yml produce_* 单矩阵 job（case/needs/needed set 动态化）—— GitHub Actions 无法本地验证，风险最高。
2. _translate-content-group.yml 参数固化评估。
3. shell 脚本：fetch-sdk-reference-docs.sh / update-sdk-reference-snapshots.sh / restore-generated-state.sh / report-live-card.sh（测试断言精确内容，且属重放安全工具）。
4. config/translation/reconciliation-policy.json 与 deploy/contracts/path-filters.json 生成化。

### 已知基线问题（非本次引入）

- scripts/guides-sdk-isolation.test.js 引用已退役的 run-content-group.js（master 同样失败）。
- scripts/sdk-reference-workflow.test.js 断言 fetch-docs.yml 的 concurrency 为 cancel-in-progress:false，实际为 queue:max（master 同样失败）。
- runtime-contract.test.ts 报 ajv 未声明（fragmentCollection.js require ajv，package.json 未声明，master 同样失败）。


### 续做（2026-08-20 第二段，已在 worktree 提交 8309e6411 / 598d26b0a）

- scripts/docs-workflow/print-workflow-groups.js（--sdk-groups / --sdk-snapshot-groups / --groups-json）从 registry 输出组列表。
- fetch-sdk-reference-docs.sh / update-sdk-reference-snapshots.sh / report-live-card.sh 改为调用 print-workflow-groups.js；对应测试断言已更新。
- 新增 derive/reconciliationPolicy.ts + scripts/generate-reconciliation-policy.js（pnpm generate/check:reconciliation-policy），生成 config/translation/reconciliation-policy.json（组键 + preservedRoots 全派生）；已重新生成并加入 site-validation.yml。
- 剩余项更新：restore-generated-state.sh 因测试在临时 git 仓库中实际执行脚本、需保持自包含（同 selection.js 约束）；path-filters.json 为静态 deploy 契约（仅 6 个 reference sidebar 路径需随新增手册更新）；fetch-docs.yml 矩阵与 _translate-content-group.yml 为 GitHub Actions 最高风险项，未本地验证。


### fetch-docs.yml produce_* 矩阵化（2026-08-20 第三段，提交 83529e76d）

- prepare 新增 sdk_groups 输出（node scripts/docs-workflow/print-workflow-groups.js --sdk-groups-json）。
- 6 个 produce_python/java/node/go/cli/rest job 收敛为单个 produce_sdk_reference matrix job（name: produce_${{ matrix.group }}，矩阵来自 prepare.sdk_groups）。
  - 矩阵实例的 GitHub job 名仍为 produce_<group>，FIFO 调度器契约不变（producerJob 名称未改）。
- reconciliation_preflight：needs 改为 [prepare, produce_guides, produce_zh_guides, produce_sdk_reference]；producer 校验改为 GitHub API（新增 scripts/docs-workflow/validate-reconciliation-producers.js，复用 createPublicationGitHubClient）；checkpoint 下载步骤的 needed 组集合改为从 print-workflow-groups.js --groups-json 派生。
- 测试更新：validate-workflow-policy.test.js（matrix 断言）、sdk-reference-workflow.test.js（matrix 断言）；新增 validate-reconciliation-producers.test.js（2 tests）。
- 验证：yaml 可解析；test:workflow-policy 99 ✅；scheduler/github-client/producer 校验 35 ✅；typecheck ✅。
- **运行时验证缺口**：GitHub Actions 行为（matrix 展开、selected_group 过滤、协调器对 matrix job 名的匹配）无法本地跑，需一次 publish=false 试运行确认。
- 已知 GitHub 限制：workflow_dispatch 的 group options（fetch-docs.yml 第 8 行）与 prepare 的 case（第 118 行）是静态列表，新增手册时需手工补一项（无法从 registry 派生）。

