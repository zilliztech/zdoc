# Guides 按表增量生产、记录语义与离线 Render 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以真实 Base 记录语义驱动 Guides source、表级 render 和 sidebar，并让表级 render 严格离线，同时保留在线单文档发布。

**Architecture:** 一个全局 source graph 保存 canonical 正文和全部导航记录；planner 计算 token 与表级变化；有限并行的 target/table job 只重建所属目录；assemble 统一生成 sidebar、验证并创建 checkpoint。Tools 表直接生产 Agents 页面，不再使用独立 Agents producer。

**Tech Stack:** Node.js、Docusaurus CLI、GitHub Actions reusable workflows、GitHub artifacts、`node:test`。

---

### Task 1: 固化四种 Base 记录语义

**Files:**
- Create: `plugins/lark-docs/guidesBaseRecordSemantics.js`
- Create: `plugins/lark-docs/guidesBaseRecordSemantics.test.js`
- Modify: `plugins/lark-docs/larkDocScraper.js`
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.beta.test.js`

- [x] **Step 1: 写失败测试，覆盖 canonical/section/link/ref 和缺省推断**

测试必须断言：Feishu Docs link 缺省为 canonical，非 Feishu placeholder 缺省为 section；canonical 创建页面，section 创建 category，link 创建 href，ref 创建 canonical 引用。

- [x] **Step 2: 运行语义测试并确认旧实现失败**

Run: `node --test plugins/lark-docs/guidesBaseRecordSemantics.test.js plugins/lark-docs/larkDocWriter.beta.test.js`

Expected: FAIL，至少显示 `Draft`/空 Progress canonical 或 record kind 契约不一致。

- [x] **Step 3: 实现共享语义 helper**

导出稳定接口：

```js
normalizePlacementType(record)
recordCreatesPage(record)
recordCreatesNavigation(record)
recordPublishTargets(record)
recordRefTarget(record)
```

`recordCreatesPage()` 只表达 canonical 节点类型；另行实现 publishability：`Draft/Reviewed/Published/Approved/Publish` 允许发布，空值、`Not Start Yet/WIP/Deprecated` 不发布，Targets 决定 target。helper 文件和 API 明确使用 `guides` 前缀，仅处理显式 `base_placement_type` 或 Guides 多表模式，不能解释 SDK 的 `Type` 字段。

- [x] **Step 4: 让 scraper 和 writer 使用同一 helper**

删除 Guides 多表路径中重复的 placement/status 判断。section 永远可作为结构节点；canonical 同时满足 Progress 和 Targets 时发布；link/ref 不写正文。保留没有 `base_placement_type` 的 SDK legacy fallback。

- [x] **Step 5: 运行测试**

Run: `node --test plugins/lark-docs/guidesBaseRecordSemantics.test.js plugins/lark-docs/larkDocWriter.beta.test.js plugins/lark-docs/larkDocScraper.test.js`

Expected: PASS。

- [x] **Step 6: 提交**

```bash
git add plugins/lark-docs/guidesBaseRecordSemantics.js plugins/lark-docs/guidesBaseRecordSemantics.test.js plugins/lark-docs/larkDocScraper.js plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.beta.test.js
git commit -m "fix(lark): align Base record publishing semantics"
```

### Task 2: 拒绝 virtual canonical 并补全正文 source

**Files:**
- Modify: `plugins/lark-docs/sourceCompleteness.js`
- Modify: `plugins/lark-docs/sourceCompleteness.test.js`
- Modify: `plugins/lark-docs/larkDocScraper.js`
- Modify: `plugins/lark-docs/larkDocScraper.test.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`

- [x] **Step 1: 写失败测试**

覆盖：canonical source 是 `base_nav_virtual`、缺 page block、正文 blocks 为空时 completeness 失败；section/link/ref virtual source 允许存在。

- [x] **Step 2: 验证测试失败**

Run: `node --test plugins/lark-docs/sourceCompleteness.test.js plugins/lark-docs/larkDocScraper.test.js`

Expected: FAIL，当前 virtual canonical 被计为 valid。

- [x] **Step 3: 扩展 completeness 结果**

新增 `nonRenderableCanonicalFiles`，只有真实可渲染 canonical 才增加 `validCanonicalSources`。错误消息必须列出样例 token/file。

- [x] **Step 4: 修复 linked Base doc hydration**

`__fetch_base_doc_sources()` 不再用 `sources.has(docToken)` 判断完成；只有对应 source 可渲染才跳过。full fetch 和 incomplete-cache recovery 必须刷新所有 virtual canonical。

- [x] **Step 5: 验证 planner 自动转 full**

source completeness 不完整时，plan 必须是 `mode: full`，warning 包含 non-renderable canonical 计数。

- [x] **Step 6: 运行测试**

Run: `node --test plugins/lark-docs/sourceCompleteness.test.js plugins/lark-docs/larkDocScraper.test.js plugins/lark-docs/incrementalFetchPlanner.test.js`

Expected: PASS。

- [x] **Step 7: 提交**

```bash
git add plugins/lark-docs/sourceCompleteness.js plugins/lark-docs/sourceCompleteness.test.js plugins/lark-docs/larkDocScraper.js plugins/lark-docs/larkDocScraper.test.js plugins/lark-docs/incrementalFetchPlanner.test.js
git commit -m "fix(guides): require renderable canonical sources"
```

### Task 3: 将全部导航记录纳入 snapshot 和 planner

**Files:**
- Modify: `plugins/lark-docs/sourceSnapshot.js`
- Modify: `plugins/lark-docs/sourceSnapshot.test.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`

- [x] **Step 1: 写 schema v3 失败测试**

snapshot 增加 `navigation_records`，保存 record/table/placement/parent/order/labels/slug/targets/doc/ref identity。section 移动、link href 修改、ref target 修改必须改变 table digest。

- [x] **Step 2: 验证旧 snapshot 测试失败**

Run: `node --test plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/incrementalFetchPlanner.test.js`

Expected: FAIL，旧 snapshot 不包含 navigation records。

- [x] **Step 3: 实现导航 identity 和 table digest**

canonical snapshot records 保持兼容；Guides 新增按 `table_id` 排序的 navigation identity。只有 Guides 的旧 schema v1/v2 作为不完整 navigation basis；SDK snapshot 不因缺少 `navigation_records` 自动 full fetch。

- [x] **Step 4: 扩展 affected_tables**

`affected_tables` 是 canonical token delta、删除、引用扩展和 navigation digest delta 的并集。section/link/ref 变化必须进入表级协调。

- [x] **Step 5: 运行测试**

Run: `node --test plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/incrementalFetchPlanner.test.js`

Expected: PASS。

- [x] **Step 6: 提交**

```bash
git add plugins/lark-docs/sourceSnapshot.js plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/incrementalFetchPlanner.js plugins/lark-docs/incrementalFetchPlanner.test.js
git commit -m "feat(guides): track navigation changes by Base table"
```

### Task 4: 从 snapshot 动态生成 target/table matrix

**Files:**
- Modify: `scripts/docs-workflow/guides-tables.js`
- Modify: `scripts/docs-workflow/guides-tables.test.js`
- Modify: `.github/workflows/_fetch-guides-sources.yml`

- [x] **Step 1: 重写失败测试**

删除 Client Libraries/Tools nav-only 断言。测试当前 14 个组合，并测试新增 canonical target、删除最后一个 canonical、空 Solution。

- [x] **Step 2: 验证测试失败**

Run: `node --test scripts/docs-workflow/guides-tables.test.js`

Expected: FAIL，当前静态 registry 只产生 10 个组合。

- [x] **Step 3: 实现动态 matrix**

CLI 改为：

```bash
node scripts/docs-workflow/guides-tables.js matrix \
  --plan plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json \
  --snapshot plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json
```

matrix 根据 canonical Targets 生成，不根据表名硬编码 nav-only。

- [x] **Step 4: 处理删除后的清空组合**

planner/snapshot 必须保留 previous target ownership；删除最后一个 canonical 时仍输出一次 cleanup matrix entry，完成后后续运行不再调度。

- [x] **Step 5: 运行测试**

Run: `node --test scripts/docs-workflow/guides-tables.test.js scripts/validate-workflow-policy.test.js`

Expected: PASS。

- [x] **Step 6: 提交**

```bash
git add scripts/docs-workflow/guides-tables.js scripts/docs-workflow/guides-tables.test.js .github/workflows/_fetch-guides-sources.yml
git commit -m "fix(guides): derive table renders from canonical targets"
```

### Task 5: 保持表级目录所有权并覆盖 Client Libraries/Tools

**Files:**
- Modify: `scripts/docs-workflow/render-guides-table.js`
- Modify: `scripts/docs-workflow/render-guides-table.test.js`
- Modify: `scripts/docs-workflow/guides-table-artifact.js`
- Modify: `scripts/docs-workflow/guides-table-artifact.test.js`
- Modify: `scripts/docs-workflow/restore-guides-table-artifacts.js`
- Modify: `scripts/docs-workflow/restore-guides-table-artifacts.test.js`

- [x] **Step 1: 写失败测试**

测试 Client Libraries 和 Tools 都清理/重建同名目录；section 目录保留、canonical 页面存在、link/ref 不产生重复文件；artifact 拒绝跨目录路径。

- [x] **Step 2: 验证测试失败**

Run: `node --test scripts/docs-workflow/render-guides-table.test.js scripts/docs-workflow/guides-table-artifact.test.js scripts/docs-workflow/restore-guides-table-artifacts.test.js`

Expected: FAIL，当前 Client Libraries/Tools 无 target ownership。

- [x] **Step 3: 实现所有非空内容表的目录 ownership**

`tableOutputPath(tableId, target)` 始终返回表 slug 目录；是否调度由 matrix 决定。render 只清理该目录并调用 `base:<tableId>` subtree。

- [x] **Step 4: 保留 artifact 安全校验**

继续校验 normalized relative path、identity、checksum、重复文件、缺失/额外 artifact 和空 matrix。

- [x] **Step 5: 运行测试**

Run: `node --test scripts/docs-workflow/render-guides-table.test.js scripts/docs-workflow/guides-table-artifact.test.js scripts/docs-workflow/restore-guides-table-artifacts.test.js`

Expected: PASS。

- [x] **Step 6: 提交**

```bash
git add scripts/docs-workflow/render-guides-table.js scripts/docs-workflow/render-guides-table.test.js scripts/docs-workflow/guides-table-artifact.js scripts/docs-workflow/guides-table-artifact.test.js scripts/docs-workflow/restore-guides-table-artifacts.js scripts/docs-workflow/restore-guides-table-artifacts.test.js
git commit -m "feat(guides): render every canonical Base table"
```

### Task 6: 删除重复 Agents producer

**Files:**
- Delete: `.github/workflows/_produce-guides-agents.yml`
- Delete: `scripts/docs-workflow/merge-agents-sidebar.js`
- Delete: `scripts/docs-workflow/merge-agents-sidebar.test.js`
- Modify: `config/lark-docs.config.ts`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.test.js`
- Modify: `scripts/docs-workflow/content-groups.js`
- Modify: `scripts/doc-publish-bot/publishRequest.js`
- Modify: `scripts/doc-publish-bot/publishRequest.test.js`
- Modify: `scripts/doc-publish-bot/baseResolver.test.js`
- Modify: `.claude/skills/zdoc-feishu-doc-publish/SKILL.md`
- Modify: `sidebarsTutorial.ts`

- [x] **Step 1: 写 workflow 失败测试**

断言 Tools table 是 Agents 页面唯一生产者，workflow 中不存在 `produce_guides_agents`、Agents artifact 或 fragment merge，`sidebarsTutorial.ts` 不注册 `agentsSidebar`。

- [x] **Step 2: 删除重复链路**

assemble 只等待 source 和 table matrix。删除 `agents` stage ownership、`config/generated/agents.sidebar.js` checkpoint ownership，以及 `config/lark-docs.config.ts` 中的独立 Agents manual。

publish bot 支持列表移除 `agents`；Agents/Prompts 页面统一解析为 `guides` manual。更新 skill 文档和 resolver 测试，旧 Agents Base 不再作为发布入口。

- [x] **Step 3: 保留 Release Notes 模型**

`releasesSidebar` 保留；主 Guides sidebar 仍只注入 `/docs/changelogs`。

- [x] **Step 4: 运行测试**

Run: `node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/doc-publish-bot/publishRequest.test.js scripts/doc-publish-bot/baseResolver.test.js`

Expected: PASS。

- [x] **Step 5: 提交**

```bash
git add config/lark-docs.config.ts .github/workflows/fetch-docs.yml .github/workflows/_assemble-guides.yml scripts/docs-workflow/guides-stage-artifact.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/content-groups.js scripts/doc-publish-bot/publishRequest.js scripts/doc-publish-bot/publishRequest.test.js scripts/doc-publish-bot/baseResolver.test.js .claude/skills/zdoc-feishu-doc-publish/SKILL.md sidebarsTutorial.ts
git rm .github/workflows/_produce-guides-agents.yml scripts/docs-workflow/merge-agents-sidebar.js scripts/docs-workflow/merge-agents-sidebar.test.js
git commit -m "refactor(guides): make Tools table own Agents content"
```

### Task 7: 为表级 render 增加严格 offline policy

**Files:**
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.media-prefetch.test.js`
- Modify: `plugins/lark-docs/larkImageDownloader.js`
- Modify: `plugins/lark-docs/larkImageDownloader.test.js`
- Create: `plugins/lark-docs/offlineMediaResolver.js`
- Create: `plugins/lark-docs/offlineMediaResolver.test.js`
- Create: `plugins/lark-docs/offlineRender.test.js`
- Modify: `scripts/docs-workflow/render-guides-table.js`
- Modify: `.github/workflows/_render-guides-table.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: 为 prefetch 之前的 online writer 行为补 golden tests**

固定 `6dcc67dec^` 的核心行为：普通 image/board/Figma iframe 会调用 downloader；`skipImageDown` 保留既有 URL/caption 行为；S3 upload、retry 和本地写入不受 manifest 环境变量影响。

- [ ] **Step 2: 验证当前实现破坏边界**

Run: `node --test plugins/lark-docs/larkDocWriter.media-prefetch.test.js plugins/lark-docs/larkImageDownloader.test.js`

Expected: FAIL，当前 downloader 会全局读取 `GUIDES_MEDIA_MANIFEST`，writer 直接依赖 `__prefetchedMedia`。

- [ ] **Step 3: 恢复通用 writer/downloader 在线路径**

从 writer 的默认路径移除全局 manifest 依赖；downloader 不再读取 Guides manifest。保留 `4375ef132` 引入的 Figma limiter，因为它属于在线 API 稳定性，不改变发布语义。

- [ ] **Step 4: 实现显式 offlineMediaResolver**

导出：

```js
createOfflineMediaResolver({ manifestPath, imageBedUrl })
```

resolver 提供 `resolveFeishuImage(token)`、`resolveBoard(token)`、`resolveFigma(fileKey, nodeId)`；命中返回 final URL/caption/object key，miss 抛 `MEDIA_PREFETCH_MISS`。

- [ ] **Step 5: 让 writer 只在显式注入 resolver 时走离线路径**

writer 的新增构造参数默认为 `null`。`null` 时执行原 online 实现；非空时只解析 manifest，不调用 downloader。不要通过进程级环境变量改变所有 writer 实例。

- [ ] **Step 6: 写 offline 失败测试**

覆盖：`--offline` 未配 `--skipSourceDown` 时拒绝；本地 metadata 缺失时不调用 Bitable；media miss 不调用 Feishu/Figma/S3；S3 client 不能执行 send。

- [ ] **Step 7: 写 online 单文档兼容测试**

模拟 `-doc` 和普通 `-token`，断言仍调用 `scraper.fetch(false, token)`，且没有默认开启 offline。

- [ ] **Step 8: 验证 offline 测试失败**

Run: `node --test plugins/lark-docs/offlineMediaResolver.test.js plugins/lark-docs/offlineRender.test.js scripts/doc-publish-bot/publishJob.test.js scripts/doc-publish-bot/publishRequest.test.js`

Expected: FAIL，当前没有 offline guard。

- [ ] **Step 9: 实现 opt-in offline**

增加 CLI `--offline` 和 `--mediaManifest <path>`。offline 必须同时提供 manifest；只在该模式禁用 writer 的 Bitable fallback，并向 writer 注入 `offlineMediaResolver`；默认 online 行为不变。

- [ ] **Step 10: 收紧 render workflow**

表级命令增加 `--offline --mediaManifest plugins/lark-docs/meta/media-cache/guides.json` 和 `NO_UPDATE_NOTIFIER=1`。从 reusable workflow 删除 APP、SPACE、FIGMA、AWS、MODEL secrets/环境变量，只保留非敏感的 `IMAGE_BED_URL`。

- [ ] **Step 11: 运行测试**

Run: `node --test plugins/lark-docs/larkDocWriter.media-prefetch.test.js plugins/lark-docs/larkImageDownloader.test.js plugins/lark-docs/larkDriveWriter.test.js plugins/lark-docs/offlineMediaResolver.test.js plugins/lark-docs/offlineRender.test.js scripts/doc-publish-bot/publishJob.test.js scripts/doc-publish-bot/publishRequest.test.js scripts/validate-workflow-policy.test.js`

Expected: PASS。

- [ ] **Step 12: 提交**

```bash
git add plugins/lark-docs/index.js plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.media-prefetch.test.js plugins/lark-docs/larkImageDownloader.js plugins/lark-docs/larkImageDownloader.test.js plugins/lark-docs/offlineMediaResolver.js plugins/lark-docs/offlineMediaResolver.test.js plugins/lark-docs/offlineRender.test.js scripts/docs-workflow/render-guides-table.js .github/workflows/_render-guides-table.yml scripts/validate-workflow-policy.test.js
git commit -m "refactor(lark): isolate offline media resolution"
```

### Task 8: 建立 SDK 发布隔离回归

**Files:**
- Modify: `plugins/lark-docs/larkDriveWriter.test.js`
- Modify: `plugins/lark-docs/larkDocWriter.test.js`
- Modify: `plugins/lark-docs/sourceSnapshot.test.js`
- Modify: `scripts/docs-workflow/run-content-group.test.js`
- Modify: `scripts/sdk-reference-workflow.test.js`
- Create: `scripts/guides-sdk-isolation.test.js`

- [ ] **Step 1: 写 SDK 配置隔离测试**

从 `config/lark-docs.config.ts` 读取全部 manuals，断言：Guides 使用 `sourceType: wiki` 和 `base:*`；18 个 SDK manuals 各使用单表独立 Base；不存在独立 `agents` manual；所有非 Guides manual 都不进入 Guides table matrix。

- [ ] **Step 2: 固定 SDK command sequence**

断言 `commandsFor('python'|'java'|'node'|'go'|'cli')` 与改造前完全一致，不增加 `--offline`、`--mediaManifest`、Guides source candidate 或 table 参数。

- [ ] **Step 3: 固定 drive writer 记录模型**

覆盖三类 fixture：

1. modern drive：`Type + 父记录 + formula Slug`；
2. `javaV1` onePager：`Token + Parent`；
3. `gov1` wiki legacy：`Parent` 且无 `Type`。

三类都不得进入 Guides Placement Type helper，原层级和页面路径保持不变。

- [ ] **Step 4: 固定 SDK snapshot 行为**

SDK schema v2 snapshot 缺少 `navigation_records` 时仍可 incremental；只有 Guides 多表 snapshot 才要求 schema v3 navigation identity。

- [ ] **Step 5: 固定继承的 online media 行为**

`larkDriveWriter` 未传 resolver 时继续调用 downloader/caption/S3 路径，不读取 Guides manifest，也不触发 offline guard。

- [ ] **Step 6: 运行 SDK 回归**

Run:

```bash
node --test plugins/lark-docs/larkDriveWriter.test.js plugins/lark-docs/larkDocWriter.test.js plugins/lark-docs/sourceSnapshot.test.js scripts/docs-workflow/run-content-group.test.js scripts/sdk-reference-workflow.test.js scripts/guides-sdk-isolation.test.js
```

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add plugins/lark-docs/larkDriveWriter.test.js plugins/lark-docs/larkDocWriter.test.js plugins/lark-docs/sourceSnapshot.test.js scripts/docs-workflow/run-content-group.test.js scripts/sdk-reference-workflow.test.js scripts/guides-sdk-isolation.test.js
git commit -m "test(lark): isolate SDK publishing from Guides sharding"
```

### Task 9: 按 Base 语义验证 sidebar 和文件

**Files:**
- Create: `scripts/validate-guides-source-contract.js`
- Create: `scripts/validate-guides-source-contract.test.js`
- Modify: `scripts/validate-guides-coverage.js`
- Modify: `scripts/validate-guides-coverage.test.js`
- Modify: `scripts/validate-generated-sidebars.js`

- [ ] **Step 1: 写四类记录契约测试**

canonical 缺文件/导航失败；section 缺 category 失败但不要求页面；link href 错误失败；ref target 缺失或重复正文失败。

- [ ] **Step 2: 验证测试失败**

Run: `node --test scripts/validate-guides-source-contract.test.js scripts/validate-guides-coverage.test.js`

Expected: FAIL，当前 validator 只比较文件与 sidebar ID。

- [ ] **Step 3: 实现 source contract validator**

输入 source candidate、target、output root 和 sidebar，逐条验证 Base 记录语义。FAQ/home/release sidebar 例外保持显式且最小。

- [ ] **Step 4: 接入 assemble validation**

`validate-generated-sidebars.js` 先验证 sidebar 文件引用，再验证 Base contract，最后运行 coverage。

- [ ] **Step 5: 运行测试**

Run: `node --test scripts/validate-guides-source-contract.test.js scripts/validate-guides-coverage.test.js`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add scripts/validate-guides-source-contract.js scripts/validate-guides-source-contract.test.js scripts/validate-guides-coverage.js scripts/validate-guides-coverage.test.js scripts/validate-generated-sidebars.js
git commit -m "test(guides): validate Base navigation semantics"
```

### Task 10: 完成 workflow DAG 和空矩阵行为

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `.github/workflows/_render-guides-table.yml`
- Modify: `scripts/docs-workflow/build-live-card-state.js`
- Modify: `scripts/docs-workflow/build-live-card-state.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: 写 DAG 失败测试**

断言 source producer 完成后启动 `target × table` matrix，`max-parallel: 4`；空 matrix 仍允许 assemble；assemble 不下载不存在的 table artifact。

- [ ] **Step 2: 实现 workflow**

producer 并行、table render 有限并行、publisher 排队策略保持不变。live card 把 matrix children 聚合为一个 Guides render 阶段。

- [ ] **Step 3: 验证 YAML 无重复 key**

Run:

```bash
node -e "const fs=require('fs'),YAML=require('yaml');for(const f of fs.readdirSync('.github/workflows').filter(x=>x.endsWith('.yml'))){const d=YAML.parseDocument(fs.readFileSync('.github/workflows/'+f,'utf8'),{uniqueKeys:true});if(d.errors.length)throw new Error(f+': '+d.errors.join('; '))}"
```

Expected: exit 0。

- [ ] **Step 4: 运行 policy 测试**

Run: `node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-live-card-state.test.js && node scripts/validate-workflow-policy.js`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add .github/workflows/fetch-docs.yml .github/workflows/_assemble-guides.yml .github/workflows/_render-guides-table.yml scripts/docs-workflow/build-live-card-state.js scripts/docs-workflow/build-live-card-state.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "ci(guides): finalize parallel table render DAG"
```

### Task 11: 真实 Base 全量重放和生产验证

**Files:**
- Modify: `.claude/superpowers/plans/2026-07-15-guides-table-sharding.md`

- [ ] **Step 1: 运行完整本地测试**

Run:

```bash
node --test plugins/lark-docs/*.test.js scripts/docs-workflow/*.test.js scripts/validate-guides-coverage.test.js scripts/validate-guides-source-contract.test.js scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js scripts/guides-sdk-isolation.test.js
```

Expected: 0 failures。

- [ ] **Step 2: 强制 full source fetch 到隔离工作区**

使用真实 Base 和 `--forceFullFetch`，确认 373 条 canonical 全部为 renderable source，Tools 为 23 条 canonical，Client Libraries 为 1 条 canonical。

- [ ] **Step 3: 以 `max-parallel: 4` 重放 14 个组合**

确认每个 job 只修改所属目录，render 日志中不存在 Feishu/Figma/S3/model 请求，media miss 会失败。

- [ ] **Step 4: 重放 assemble**

生成 SaaS/BYOC sidebar，运行：

```bash
node scripts/validate-generated-sidebars.js
node scripts/run-doc-build-stage.js --build "pnpm run build" --skipLinkChecks --skipCardReporting
```

Expected: PASS，Tools/Agents、Client Libraries、Release Notes 导航完整。

- [ ] **Step 5: 验证单文档发布回归**

使用测试 token 执行 dry-run/fixture 级 `-doc` 和 online `-token`，确认会刷新单篇 source，offline guard 不影响该路径。

- [ ] **Step 6: 验证 SDK content groups**

在隔离 fixture 中至少重放 Python 和一个非 Python SDK producer，确认 source fetch、drive writer、sidebar、checkpoint 和 snapshot delta 与改造前一致。

- [ ] **Step 7: 检查 diff**

Run: `git diff --check && git status --short`

Expected: 无 whitespace error，且没有计划之外的无关修改。

- [ ] **Step 8: 推送后触发全量构建**

```bash
gh workflow run fetch-docs.yml \
  --ref master \
  -f group=all \
  -f artifact_retention_days=3 \
  -f target_branch=dev \
  -f publish=true \
  -f tooling_ref=master
```

- [ ] **Step 9: 观察生产结果**

确认 source hydration、14 个 table jobs、无 render 429、assemble/build、单次 Guides publication、translation batch 和最终 verify 全部成功。
