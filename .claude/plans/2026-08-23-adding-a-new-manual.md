# 新增一本手册需要做哪些工作 —— 运行手册

> 来源：回顾 `codex/manual-registry-single-source` 分支（worktree:
> `.claude/worktrees/manual-registry-single-source`）的提交。该分支完成了「手册 registry
> 单源化」：把此前散落在 ~90 个文件里的逐手册硬编码，收敛为
> `packages/docs-tooling/src/manuals/registry.ts` 单一事实来源 + 生成脚本。
> 设计文档见 `.claude/plans/2026-08-20-A2A3-manual-registry-single-source.md`。

---

## 0. 先理解：改了什么

- **单源化之前**：新增一本 reference 手册（以 cpp 为真实范例）需要手改约 **90 个文件**
  （group 顺序、sidebar key、导航 label、CI 矩阵 job、reconciliation policy……），
  diff 为 `+608/-763`。
- **单源化之后**：所有派生数据（group 顺序、导航、sidebar、翻译单元、reconciliation
  policy）都由 `registry.ts` + `derive/` 纯函数生成，提交的生成物由 `generate-*` 脚本产出、
  `check-*` 脚本在 CI 中做漂移校验。

所以「新增一本手册」现在被压缩为 **一次 registry 声明 + 重新生成派生产物 + 几处有意保留的
手工静态契约 + 一个一次性 dev 种子**。下面按顺序列出全部工作。

---

## 1. 总览清单

| 步骤 | 内容 | 是否手写 |
|---|---|---|
| ① | 在 `registry.ts` 声明手册（sources / publications / presentation） | 手写（唯一核心改动） |
| ② | 运行 `generate-*` 脚本，重新生成派生产物 | 命令生成 |
| ③ | 手工同步 5 处静态契约（有意例外，含 landing 页 → `masterAuthoritativePaths`） | 手写 |
| ④ | 首次发布 bootstrap：把 content/sidebar/inventory 种子到 `dev` | 一次性手写（operator 步骤） |
| ⑤ | 跑一次真实 fetch/publish，补齐 sidebar + manifest | 运行验证 |

---

## 2. 第一步：在 `registry.ts` 声明手册

文件：`packages/docs-tooling/src/manuals/registry.ts`（类型见 `schema.ts`）。

`definitions` 数组里新增一条 `ManualDefinition`，包含四块：

### 2.1 顶层字段

```ts
{
  id: 'cpp',            // /^[a-z][a-z0-9-]*$/，全局唯一
  kind: 'reference',    // 'guides' | 'reference' | 'onpremise' | 'agents'
  ...
}
```

### 2.2 `sources` —— 内容来源（用 helper 构造）

- `remote(sourceType, root, base, sourceDir, generatorManual?, version?, lifecycle?, fallbackSource?)`
  用于 Lark 远程源（`drive`/`wiki`/`onePager`）。`root`/`base` 是 Lark 标识，
  `generatorManual` + `snapshotPath` 用于 snapshot 机制，`fallbackSource` 做版本链回退。
- `local(sourceDir)` 用于本地翻译源（`content/zh-CN/...`），`lifecycle: 'translation'`。
- `rest(sourceDir)` 用于 REST 源。

```ts
sources: {
  'english-v2.6': remote('drive', 'CSzVf...', 'Xmndb...', 'cpp/v2.6.x', 'cppv26', 'v2.6.x', 'fallback'),
  'english-v3.0': remote('drive', 'NVjgf...', 'QdLkb...', 'cpp/v3.0.x', 'cppv30', 'v3.0.x', 'active', 'english-v2.6'),
  chineseTranslation: local('content/zh-CN/reference/api/cpp/cpp'),
},
sourceOrder: ['english-v2.6', 'english-v3.0', 'chineseTranslation'],
```

### 2.3 `publications` —— 发布目标（en / zh-CN）

`publication(site, source, outputDir, contentRoot, sidebar, generatorTarget?, retiredPaths?, preservedFiles?)`
会帮你拼出 `outputDir` / `contentRoot` / `sidebarPath` / `overridePath` 全路径。

```ts
publications: {
  en:    publication('en', 'english-v3.0',     'reference/api/cpp/cpp', 'reference', 'cpp', 'zilliz', undefined, ['cpp.md']),
  'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/cpp/cpp', 'reference', 'cpp'),
},
```

> `en` 的最后一个参数 `['cpp.md']` 是 `preservedFiles`（landing 文件之类需要保留的路径）。

### 2.4 `presentation` —— 站点呈现元数据（仅 `kind: 'reference'` 必填）

```ts
presentation: {
  referenceKind: 'cpp',           // 站点导航/URL 里的公开 kind（node->nodejs, rest->restful）
  sidebar: 'cpp',                 // 生成 sidebar 的 basename
  sidebarKey: 'cppSidebar',       // Docusaurus sidebar key
  label: {en: 'C++ SDK', 'zh-CN': 'C++ SDK'},
  icon: 'cpp',
  href: '/reference/cpp',
  prefix: '/reference/cpp',
  groupOrder: 6,                  // fetch/publish 分组顺序（必须全局唯一连续）
  navOrder: {en: 5, 'zh-CN': 1},  // 各站点 Reference 导航呈现顺序
  standalone: false,              // 是否独立 navbar 项（CLI 为 true）
  documentIdPrefix: 'api/cpp/cpp',// 与 landing 契约一致的文档 ID 前缀
  landingPage: 'api/cpp/cpp/cpp.md',// landing 页（相对路径，必须以 .md/.mdx 结尾）
  minimumProseCharacters: 300,    // landing 契约校验
  minimumHeadingCount: 2,
  requireSourceDifference: true,
},
```

### 2.5 校验会自动拦住什么

`validateManualRegistry()`（`registry.ts:68`）会自动校验，声明错会直接 throw：

- `id` 重复 / `sourceOrder` 必须恰好覆盖所有 source 且无重复
- `fallbackSource` 必须存在于 sources 且在其之前（`sourceOrder` 顺序），retired source 不得声明 fallback
- 每个 publication 的 `source` 必须存在；content/generated/override 路径必须 site-owned
- reference kind 必须有 `presentation`、非 reference 不得有（`sidebar`/`documentIdPrefix`/`landingPage` 与 publication 的一致性）

---

## 3. 第二步：重新生成派生产物

改完 `registry.ts` 后，运行生成脚本，把派生结果写回提交的生成物。**这些生成物必须一起提交**：

| 命令 | 产出的文件 |
|---|---|
| `pnpm generate:reference-presentation` | `config/reference-navigation.json`、`packages/site-config/src/sidebars/{en,zh-CN}/reference.ts`、`packages/site-config/src/generated/referencePresentation.ts`、`packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts` |
| `pnpm generate:reconciliation-policy` | `config/translation/reconciliation-policy.json` |
| `pnpm generate:lark-config` | `config/lark-docs.config.ts` |
| `pnpm generate:localization-input-inventory` | `deploy/contracts/localization-inputs.inventory.json` |

对应的 `check-*` 脚本在 `site-validation.yml` 里跑漂移校验，生成物与 registry 不一致会 CI 失败：

```
pnpm check:reference-presentation
pnpm check:reconciliation-policy
pnpm check:lark-config
pnpm check:localization-input-inventory
```

> 其中 `check:reference-presentation` 还会顺带校验 `path-filters.json` 的 reference
> sidebar 路径是否同步（见 4.2）。

---

## 4. 第三步：手工同步 5 处静态契约（有意例外）

这几处**不会**从 registry 自动生成，必须手改。原因是各自的硬约束（脚本在临时 git 仓库里被
测试实际执行、静态 deploy 契约、GitHub Actions 无法在运行时读 TS），或 landing 页归 master
所有（见 4.5）：

### 4.1 `scripts/restore-generated-state.sh` + 其测试

把新手册的 `generated/en/sidebars/<manual>.sidebar.js` 加进固定 restore 路径列表
（`scripts/restore-generated-state.sh:94` 附近的 JSON 数组），**同时**加到
`scripts/restore-generated-state.test.js` 的 `restorePaths` 数组 —— 测试断言两者完全一致。

### 4.2 `deploy/contracts/path-filters.json`

新增手册的 reference sidebar 路径（见 cpp 对应的
`generated/en/sidebars/cpp.sidebar.js`）。静态 deploy 契约，不做全量生成；靠
`check:reference-presentation` 的 `validatePathFiltersReferenceSidebars()` 做漂移拦截。

### 4.3 `scripts/translation/selection.js` 的 `GROUPS`

这是硬编码的有意例外（`validate-workflow-policy` 测试靠「复制单文件 + 字符串替换」审计它，
必须自包含）。**新手册加进来后，这里的 `GROUPS` 顺序必须与 registry 派生的
`sdkGroupIds()`/`groupOrder` 顺序一致**，否则 `validateTranslationHandoffContract` 会失败。
（cpp 验收时暴露过「cli 必须在 cpp 之前」的硬约束。）

### 4.4 `.github/workflows/fetch-docs.yml`（2 处静态列表）

GitHub Actions 的 `workflow_dispatch` group 描述与 `prepare` 的 `case` 是静态列表，新增手册时
各补一项（cpp 已示范）：

- 第 6 行 `group` input 的 `description` 里的合法组列表
- 第 118 行 `case "$SELECTED_GROUP" in all|guides|...|cpp|*,*)` 的 case

> **无需改动**：`_translate-content-group.yml` 全是 `workflow_call` 输入，没有逐手册列表；
> SDK 翻译本身已是矩阵（`translate:${{ matrix.target }}/${{ matrix.group }}`）。

### 4.5 `deploy/contracts/master-tooling-sync.json` —— landing 页（`preservedFiles`）

如果手册声明了 `preservedFiles`（通常是 landing 页，如
`content/en/reference/api/<manual>/<manual>.md`），这是**最容易踩的一处**：

- landing 页物理上在 dev-owned 的 `content/` 下，但归 master 所有（fetch 时从 `MASTER_SHA`
  恢复）。它必须**①提交到 master，②把路径加进 `masterAuthoritativePaths`**。
- 少做 ①（或从 master 误删）：fetch prepare 报
  `preserved path ... must be tracked on the tooling branch`。
- 少做 ②：`inspectSync` 报 `modifies dev-owned paths: content/en/.../<manual>.md`。
  （`isDevOwned()` 会先查 `masterAuthoritativePaths`，声明后即视为 master 拥有。）
- **不要**把 `sidebar-overrides/en/<manual>.json` 提交到 master：`sidebar-overrides/en/` 是
  dev-owned，override 由 fetch 产出。

---

## 5. 第四步：首次发布 bootstrap（一次性，seed 到 `dev`）

`content/` 和 `generated/` 是 dev-owned 路径（`deploy/contracts/master-tooling-sync.json`
的 `devOwnedPaths`），所以 `master → dev` 的 tooling sync **永远不会**把新手册的内容和生成
sidebar 带过去。而 fetch 流水线是在 build 时从 source 派生出内容与 sidebar 的 —— 一本全新手册
在第一次被 fetch 之前，`dev` 上什么都没有，形成一个 bootstrap 缺口：

- `releaseInputDefinition('en')` 把整个 `generated/en/sidebars/` 当作本地化输入根，新手册的
  `generated/en/sidebars/<manual>.sidebar.js` 是输入之一；
- `write-provenance.mjs` 要求每个本地化输入都 `git ls-files` 已跟踪，否则 throw
  `Localization input must be tracked: generated/en/sidebars/<manual>.sidebar.js`；
- produce job 用 `restore-generated-state.sh --exact --ref <source_ref>` 恢复，`--exact`
  只重新跟踪该 ref 上**已存在**的 sidebar。

因此，在首次生产 fetch 前，必须**人工**把以下三样种子到 `dev`（生产 `source_ref`）：

1. 手册内容，如 `content/en/reference/api/<manual>/...`；
2. `generated/en/sidebars/<manual>.sidebar.js`；
3. 重新生成的 `deploy/contracts/localization-inputs.inventory.json`
   （stage 完 sidebar 后跑 `pnpm generate:localization-input-inventory`）。

这是**每本手册一次性**的 operator 步骤。当前没有自动化 bootstrap 命令
（`master-tooling-sync.js` 的 `bootstrap` 子命令只切换一次性 `enabled` 门，不 seed 内容）。

---

## 6. 禁止事项与运行时验证缺口

- **不要**把 `content/...` 或 `generated/...` 提交到 `master`：它们是 dev-owned 路径，
  `inspectSync` 对 master 历史里改到 dev-owned 路径会 fail closed。
  **唯一例外**：`preservedFiles`（landing 页）归 master 所有，必须提交到 master 并写进
  `masterAuthoritativePaths`（见 4.5）。
- **顺序：先 fetch 后 sync。** sync 的 focused validation 会跑 `validate-revision-inventory
  --site en` 和 site build，依赖 fetch 才产出的 `lark-revisions/<manual>.json` 与
  `<manual>.sidebar.js`。`REVISION_GROUPS` 从 registry 派生，新手册一加进来就被要求存在，
  顺序反了 sync 会报 `Revision inventory path is missing`。
- **运行时缺口**：新手册的 `generated/en/sidebars/<manual>.sidebar.js` 与
  `generated/en/manifests/reference.json` 里的 sourceCommit 记录，只有真实跑一次
  fetch/publish 才会产生。在那之前，依赖它们的测试/脚本（如
  `replay-translation-publication-fifo`、`docs-tooling reference-manifest --write`）会因缺
  sidebar/manifest 而失败。
- **GitHub Actions 矩阵行为无法本地验证**：`produce_sdk_reference` 单矩阵 job 的展开、
  `selected_group` 多组过滤、协调器对 matrix job 名的匹配，需要一次 `publish=false` 的试运行确认。

---

## 7. 验证命令汇总（worktree 内）

```bash
pnpm typecheck
pnpm vitest run packages/docs-tooling/src/manuals
pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts
node --test scripts/docs-workflow/content-groups.test.js
node --test scripts/validate-workflow-policy.test.js
node --test scripts/sdk-reference-workflow.test.js
node --test scripts/restore-generated-state.test.js
pnpm check:reference-presentation
pnpm check:reconciliation-policy
pnpm check:lark-config
```

---

## 附：最小改动参考

分支上 `feat(cpp): add C++ SDK reference manual via registry single source`（`19a95d17e`）
就是「新增 cpp 手册」的最小改动集，共 35 文件 `+363/-65`。其中真正的手写核心只有
`registry.ts`（+36 行声明）；其余是 `generate-*` 重新产出的生成物、测试 fixture 更新、以及
4.2/4.4 里的静态契约补项。可对照该 commit 逐一复核。
