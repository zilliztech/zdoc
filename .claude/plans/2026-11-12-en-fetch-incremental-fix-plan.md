# en Fetch 增量失效修复计划（shared 页身份 / 模式判定 / lane replay / cache 闸门）

日期：2026-11-12。基线：master 与 origin/dev 工具文件逐 blob 一致（已核对），生产行为即本仓现状。
范围纪律：全部修复走 **master PR**（工具/workflow 为 master-authoritative）；`content/`、`generated/`、
`packages/docs-tooling/src/lark/meta/{reports,assembly,snapshots}` 为 dev-owned，**不得 master 直编**；
每个改动路径过 `pnpm test:for-change -- <paths>`；Fetch 边界跑 `pnpm test:replay:fetch`，跨边界跑
`pnpm test:replay:all` + `pnpm test:workflow-policy`；Fetch 相关 PR 按 README《Production publication
runbook》的真实回放程序验证（真实留存 checkpoint 归档、隔离本地 bare remote、恢复精确生成态、保留证据根，
绝不推真 origin、绝不 dispatch 生产 workflow）。

## 1. 背景与根因

en 定时 Fetch 无法收敛（run 43114861693 手动 vs 43075575954 定时：逐类日志计数一致，39.1 vs 41.2 min；
同期 zh 16.6→9.7 min 正常收敛），zh/en 唯一差异是 en 的 90 个 shared Guides 页。四层机制（均已代码核实）：

1. **身份恒变（主因，且比"churn"更强）**：计划期身份 = `digest({master_commit, dev_commit,
   shared-docs 子树清单, 全量 dev 清单(含上一轮自己的 shared manifest 目录), navigation})`
   （`packages/docs-tooling/src/lark/sharedPageFetch.js:179-190`）；发布身份 =
   `digest(receipt.inputs)`（`scripts/docs-workflow/guides-shared-sources.js:270`）。两者哈希空间
   结构性不同，`incrementalFetchPlanner.js:133` 的 `shared inputs changed` 对 90 条记录**无条件恒真**。
   90 + 飞书真实漂移 8~13 ≥ 12 时越过 `max(10, ceil(404×0.25))=101`（`incrementalFetchPlanner.js:316-318`）
   → plan=full → 314 篇全量重抓、90 页无条件重建、486 media 全网（manifest_reuse 0）、
   `[content-links] Found 25` 校验只在 full 时跑（`packages/docs-tooling/src/lark/index.js:1088-1096`）。
2. **cache save 被闸死**：PR #1215(5bcde2f7b2) 的 overlay 自建页
   `shared-docs/guides/pages/alter-collection-field/cloud-structarray-alter-property-limits.md:1`
   引用 `array-of-structs.md`，zdoc 投影层自有登记表 `shared-docs/guides/links.yaml`（上游无此文件）
   漏登记（目标 `use-array-of-structs` 已 onboard）→ `LINK_UNRESOLVED`（`shared-docs/core/links/rewrite.ts:71`）
   → `SHARED_BUILD_FAILED` → 每 run 有 fallback → `guides-cache-save-decision.js:77` 返回 false、
   `guides-cache-generation-lifecycle.js:132-137` 写 `skipped-shared-failure`，basis 冻结在 11-11 02:14。
3. **自增强环**：dev_files 含 `generated/en/manifests/shared-pages/guides`，每轮发布 tip 前移→下一轮
   身份再翻；语义 hash（`guides-cache-save-decision.js:36`）随 inputs_sha256 每变→candidate≠baseline
   →snapshot 每 run 重写发布→`checkpoint-publication.js:326-329` 的 no-op 短路永不触发→每 run 二次全站 build:en。
4. **伴生成本**：shared lane 每 run 全量重建 90 页（`guides-shared-sources.js:167,225`，无跳过）；
   `addReason` 丢无 token 记录的原因（`incrementalFetchPlanner.js:37-41`）→ 报告 "Changed Docs: None"
   却 mode=full；`guides-broken-content-links.json` 等报告路径未 site 化（`index.js:661`）。

已定调设计（本计划落点，不重开）：上游 pins 独立第二增量轴（不探测 milvus HEAD）；渲染身份与发布溯源
分离；模式判定去 shared 化；shared lane 按 receipt replay 跳过；25 条数据修复与报告 site 化为并行小项。

## 2. PR 拆分

### PR1 — links.yaml 一行解闸（master，最小、最先合）

- **动机**：消除每 run 的 `SHARED_BUILD_FAILED`/fallback，解冻 cache save；其余 PR 的验收信号都依赖它。
- **改动面**：`shared-docs/guides/links.yaml` 增加一行 `array-of-structs.md: use-array-of-structs`
  （按文件内排序插在 `array-operators.md` 前）。不改任何代码。
- **不做**：其余 24 条 content-links 数据修复（飞书源侧，另行处理）；不改 rewrite.ts 行为。
- **验证**：
  - `pnpm docs-tooling shared-docs links-seed --sharedDocs shared-docs/guides --repo <上游克隆> --commit <lock pin> --dev <基线> --out <tmp>`（`packages/docs-tooling/src/cli-main.ts:330-335`）确认候选即 `use-array-of-structs`；
  - 有上游克隆与 dev 基线时本地单页构建：`pnpm docs-tooling shared-docs build --sharedDocs shared-docs/guides --page alter-collection-field ...`，确认无 LINK_UNRESOLVED；
  - 矩阵：`pnpm test:for-change -- shared-docs/guides/links.yaml` → 预期 row "Shared docs implementation and root onboarding inputs" → `pnpm test:shared-docs`；最终门 `pnpm typecheck` + `pnpm test:workflow-matrix` + `git diff --check`。
- **风险/回滚**：一行数据，回滚即删行。风险为零侧（新增映射只影响未解析链接）。
- **验收**：下一个定时 en run 日志无 `[shared-fallback] ... SHARED_BUILD_FAILED`；generation persistence
  报告不再出现 `skipped-shared-failure`（basis 开始随 run 前移）。

### PR2 — 模式判定去 shared 化 + addReason record 回退（止血）

- **动机**：full/incremental 只由飞书侧真实变更决定；shared 记录不再投票。这一条独立于身份改造，
  立即恢复增量（media 复用、抓取范围收缩、时长回落）。
- **改动面**（`packages/docs-tooling/src/lark/incrementalFetchPlanner.js`）：
  - 阈值（:316-318）：分子改 `changedRecords.filter(r => r.source_kind !== 'shared-page')`；
    **分母同步去 shared**（`ceil(canonical feishu records × 0.25)`，当前 ≈79）——语义干净
    （"飞书侧变更占比"）；如需保守可保留混合分母，默认取干净口径并在测试钉住数值。
  - `addReason`（:37-41）与调用点（:304,312）：无 `doc_token` 时以 `shared:<record_id>` 为键入
    `reasons_by_token`（保持 string-key schema 不破）；`renderIncrementalFetchPlanMarkdown`
    （:411,416-422）把 record 键原因渲染进 Changed Docs 列表。
  - shared 记录仍留在 `changed_records` 输出（:303）——`sharedSeeds`（:342-346）与引用扩展依赖它；
    冷启动/源缓存不完整/schema 守卫（:238-274）全部保留（bootstrap fail-closed 不动）。
- **不做**：不动 compareRecord 的原因集合；不动 shared lane 重建行为（PR4）；不动身份配方（PR3）。
- **测试**：`incrementalFetchPlanner.test.js` 新增钉：(a) 仅 90 shared 变更 + 少量飞书漂移 → incremental；
  (b) 飞书侧变更 ≥ 阈值（构造 min-10 边界与 25% 边界）→ full；(c) shared 原因出现在
  reasons_by_token/markdown 报告（`shared:<record_id>` 键）。矩阵：row "Guides record projection...
  incremental planner" → `node --test packages/docs-tooling/src/lark/incrementalFetchPlanner.test.js
  ...incrementalSharedReceipts.test.js` + `pnpm test:replay:fetch`；最终门 `pnpm test:workflow-policy`。
- **风险/回滚**：增量恢复后 `[content-links] Found 25` 校验按 :1090-1096 只在 full 时跑——PR2 落地后
  该 lint 自然停跑（现状它也只是报告不阻断），25 条修复仍在 PR1/数据侧轨道；broken-links 报告在 dev 上
  保留最后一次 full 的旧副本（PR5 site 化时一并处理）。回滚 = revert 单文件。
- **验收**：下一个定时 en run：plan mode=incremental（plan 报告 Changed Docs 列出真实飞书漂移 +
  shared 记录带原因）、fetch 源抓取范围=expanded tokens、media manifest_reuse > 0、
  job 时长向 zh 量级回落；`skipped-shared-failure` 已因 PR1 消失。

### PR3 — 渲染身份投影分离（核心）

- **动机**：把"是否需要重渲染"的判定从全局溯源哈希改为**内容寻址的页级渲染身份**，同时保住
  receipt 的完整发布溯源；消除恒等错配与自增强环。
- **身份配方（单一纯函数 `renderIdentity(inputs)`，pre-build 与 post-build 两处共用同一实现）**：
  `{group, page, lock.current/next（pin 提交）, upstream: milvus site/en 在两个 pin 的内容寻址清单,
   overlay: shared-docs/guides 顶层文件(source.yaml/Variables.json/links.yaml/product-names.yaml/
   presentation/cloud-sdk-tabs.yaml) + pages/<page>/**（fetch 模式恰好只读这些：build.ts:172 的
   readSharedDocs 单页限制）, engine: packages/docs-tooling/src/shared-docs/** + manuals registry +
   docs-ui/docHeadingTags.ts + md2md 版本 的内容寻址清单（在 pinned master 树上取，master tip 移动
   但子树内容不变则身份不变）, dev_page_index: dev 上 content/en/guides+byoc 的 .mdx/.md 路径集合
   digest（内容编辑不翻转；增删/改名页翻转——正是需要重渲染的时刻）, render_targets:
   本页 {manual,path,extension,sidebar_label,sidebar_position,channel}, images: 本页
   {source,sha256} 集合, active: 本页 active entry（含 anchors）digest}`。
  - links.yaml 取**全局 digest**（理由见核对发现 #6：安全侧过度失效可接受，按页提取有漏失效风险）。
  - master_commit/dev_commit/navigation/全量 dev 内容哈希**移出身份**，保留在 receipt
    （`receipt.inputs.zdoc/dev/fetch.navigation` 原样，`validatePublishedReceipt` 的授权链不变，只换
    :33-34 的复算函数为 `renderIdentity(receiptInputs)`——receipt 携带全部所需字段，dev_page_index
    由 `dev.files` 路径过滤派生，active digest 新增入 receipt inputs）。
- **改动面**：
  - `packages/docs-tooling/src/lark/sharedPageFetch.js` `prepareSharedSources`（:182-190）：pre-build
    身份改用 `renderIdentity`（数据源同在：pinned inventories + planFetchTargets 前置可得 render_targets
    + baseline active.json）；
  - `scripts/docs-workflow/guides-shared-sources.js:270`：post-build 身份不再 `digest(receipt.inputs)`，
    改为同一 `renderIdentity(receipt.inputs)`；
  - `packages/docs-tooling/src/lark/sharedPagePublication.js:29-47`：`validatePublishedReceipt` 换复算
    函数；`source-state.ts`（`shared-docs/core/handoff/source-state.ts`）的 receipt 校验如需新字段
    （active digest）一并扩展；
  - `guides-cache-save-decision.js` / `guides-cache-generation-lifecycle.js`：**无需改动**（核对发现 #10）——
    语义投影（:36）继续含 inputs_sha256，身份稳定后 candidateHash==baselineHash 的 skip-valid-v5
    路径（lifecycle:37-49）自动生效。
- **不做**：不探测上游 HEAD（pin 纪律）；不改 zh/ja 路径；不改 shared lane 每 run 重建（PR4）；
  不动 `regenerateReceipt` 的重建式证明。
- **测试**：guides-shared-sources.test.js 增钉：零漂移两轮 pre-build 身份相等（今天必不等）；
  仅 dev 内容编辑（同路径集）不翻身份；dev 页新增翻全部身份；master 无关工具提交不翻身份；
  render_targets.position 变化翻本页身份。`pnpm test:for-change -- packages/docs-tooling/src/lark/sharedPageFetch.js
  scripts/docs-workflow/guides-shared-sources.js packages/docs-tooling/src/lark/sharedPagePublication.js` →
  预期 rows：shared-fetch-source-generation / shared-fetch-publication → `node --test
  scripts/docs-workflow/guides-shared-sources.test.js scripts/docs-workflow/guides-shared-regeneration.test.js`
  + `pnpm vitest run packages/docs-tooling/src/shared-docs/testing/build/fetch-build.test.ts` +
  `pnpm test:replay:fetch` + `pnpm test:replay:shared-pages` + `pnpm test:replay:requested`（requested
  续跑路径消费 validatePublishedReceipt）；最终门 `pnpm test:shared-docs` + `pnpm typecheck` +
  `pnpm test:workflow-policy` + `pnpm test:workflow-matrix` + `git diff --check`。
- **风险/回滚**：
  - 一次性身份翻转：合入后首个 run 全部 90 页身份变 → shared lane 全量重建一轮（PR2 已保证 plan 仍
    incremental）、snapshot/manifest 重写一轮；之后进入稳态。回滚 = revert（身份再翻一轮，无害）。
  - 漏检真实输入变更 → stale 页（见风险清单 §6）：身份保留内容寻址溯源字段，`validatePublishedReceipt`
    与 `regenerateReceipt` 的 pinned inventory 校验（guides-shared-regeneration.js:108-111）不改，任何
    怀疑都可全量重放验证。
  - replay 套件 fixture 更新：replay-shared-pages / replay-requested 的 receipt 断言随新配方更新，
    并按 runbook 跑真实回放（隔离 bare remote + 留存归档），报告命令、归档身份与结果计数。
- **验收**：连续两个零漂移 run：en plan incremental、changed_records 中 shared 条目为 0、
  语义 hash candidate==baseline → `skipped-valid-v5`（lifecycle persistence）、无 snapshot 重写提交、
  零漂移 run 的 checkpoint 进入 `no_changes` no-op 短路（checkpoint-publication.js:326-329，验证
  composition 日志出现 `noop_short_circuit`）。

### PR4 — shared lane receipt replay 跳过 + cache 闸门按页语义

- **动机**：90 页里身份未变的页不再 runBuild（每页 build+activation+regen 全免），把 shared lane
  从每 run 固定成本变为按变更页数线性；`reused` outcome 让"未重建"不再与"失败回退"共享闸门。
- **改动面**：
  - `scripts/docs-workflow/guides-shared-sources.js` `generateSharedSources`：在现有 previousReceipt
    验证块（:196-209）之后插入早退分支——`renderIdentity` 未变（pre-build 身份 === 上一发布身份）→
    outcome `{status:'reused', identity: 上一身份, outputs: 上一 receipt 的 outputs+基线字节,
    receipt: 基线 receipt 字节, regeneration: 继承 _publication.json.regeneration[record_id]}`，
    不调 runBuild/activationDraft/regenerateReceipt，输出 `[shared-reuse] page=...` 日志行；
    任何校验不过 → 原路走 build。
  - `packages/docs-tooling/src/lark/sharedPagePublication.js`：`effectiveSnapshot`（:48-74）增加
    `reused` 分支（保留 candidate 记录，output_paths 取自 receipt）；`finalizePublication`（:82-124）
    对 reused 沿用 baselineReceipts 字节复用通道；`cache_eligible`（:116）改
    `every(status ∈ {success, reused})`；`publishedEvidence` 不变。
  - `guides-cache-save-decision.js:77` 与 `guides-cache-generation-lifecycle.js:132-137`：判定式不变
    （reused 不是 fallback）；**明确保留**"身份已变且构建失败 → 全局 skipped-shared-failure 冻结"
    的 fail-closed（真正按页分片 cache 需重设计整代 SAVE_KEY，不做，见核对发现 #10）。
  - 可观测：`scripts/docs-workflow/docs-ingestion-watchdog*` 增加 `[shared-reuse]` 计数（沿用
    `[shared-fallback]` 解析框架；矩阵 row docs-ingestion-watchdog）。
- **不做**：不自动 re-pin（repin bot 另案：`.claude/plans/2026-11-08-shared-docs-repin-bot.md`）；
  不改 `regenerateReceipt`（变更页仍走完整 build+独立重放证明）。
- **测试**：guides-shared-sources.test.js 钉 reused 分支（零漂移 run 产物 bundle 与发布等价、无 build
  日志）；sharedPagePublication/replay-shared-pages 钉 effectiveSnapshot/cache_eligible；矩阵 union 同
  PR3 另加 `scripts/docs-workflow/replay-shared-pages*`（row shared-pages-replay）→
  `pnpm test:replay:shared-pages` + `pnpm test:replay:all` + `pnpm test:workflow-policy`。
- **风险/回滚**：reused 页输出字节 = pinned dev 基线字节，经 `validatePublishedReceipt` 的
  verifyOutput 摘要校验（:45）；怀疑 stale 时回滚 PR4 即恢复每 run 全建。跨页锚点 stale 窗口
  （dev 目标页标题变更）为已知残余风险，兜底=身份含 dev_page_index + 变更页全量重放通道（§6）。
- **验收**：零漂移定时 run：`[shared-reuse] page=...×90`、shared lane 耗时趋近于 0、
  generation persistence `skipped-valid-v5`、dev 无新提交（no-op 短路）；单页 overlay 改动 run：
  恰 1 页 build、其余 reused、发布提交只含该页字节与 receipt。

### PR5 — 报告路径 site 化 + pins 落后度可观测性（小项，可拆两半）

- **动机**：`guides-broken-content-links.json`（及同类的 incremental-fetch-plan 报告）en/zh 共享同一路径
  （`index.js:661`、guides-stage-artifact.js:33-35 无 site 条件），卡片笔记与 checkpoint 无法区分来源；
  同时收敛 canonical-audit 的三处命名漂移（核对发现 #7）。pins 落后度只做可观测，不做 re-pin。
- **改动面**：
  - 发射点：`packages/docs-tooling/src/lark/index.js:661` 改为接受路径覆盖（对齐
    `--canonicalLinkReportPrefix` 模式），`.github/workflows/_fetch-guides-sources.yml` 在 fetch 调用
    传 `--contentLinkReportPath ".../guides-${{ inputs.site }}-broken-content-links.json"`（同 :292 惯例）；
    顺带对 `guides-incremental-fetch-plan`（index.js:1042）做同样处理或明确留 note。
  - 消费方三处 + 契约：`scripts/docs-workflow/guides-stage-artifact.js:33-35` → `guides-${site}-*`；
    `packages/docs-tooling/src/workflows/groups.ts` GUIDES_CHECKPOINT_PATHS（:81-90）→ en 侧改
    `guides-en-broken-content-links.json`（及 canonical-audit 改 site 化名并**过渡期同时保留旧路径**
    一个周期，使 dev 上旧文件被 checkpoint 删除语义收敛）；`scripts/collect-build-card-notes.js:225`
    （及 :237-238 canonical 引用）→ site 参数化。
  - pins 落后度：`guides-shared-sources.js` 在 `lockedInventory` 后对每页计算
    `git rev-list --count <lock.current>..origin/<track>`（上游克隆已在手），写入 outcome/
    publication 报告新字段（如 `upstream_lag`），卡片笔记汇总展示；无任何 re-pin 动作。
- **测试**：guides-stage-artifact.test.js、groups/checkpoint 契约测试、collect-build-card-notes 测试、
  workflow-policy（workflow yml 改动）；矩阵 union 以 `pnpm test:for-change` 输出为准（预计叠加
  shared-fetch-offline-handoff 与 shared-fetch-publication 两行）+ `pnpm test:workflow-policy` +
  `git diff --check`。
- **风险/回滚**：路径变更涉及 checkpoint 托管集合，过渡期双路径防旧文件滞留 dev；回滚 revert 即可
  （旧路径消费者已同步改回）。
- **验收**：en/zh 各自 run 的 source artifact 内报告文件名带 site；en 卡片 Content links 数字与 en
  run 一致；pins 落后度出现在卡片/报告。

## 3. 依赖与合并顺序

```
PR1 (links.yaml)  ──► PR2 (模式判定)  ──► PR3 (渲染身份)  ──► PR4 (replay skip)
                                                    PR5 独立，任意时点（建议最后，避免与 PR3/4 的文件冲突）
```

- **PR2 先于 PR3 安全**：两者文件交集仅 incrementalFetchPlanner 的消费侧（PR3 不改 planner）；PR2 单独
  即恢复增量模式与 media 复用，且其测试不依赖新身份。PR3 在 PR2 之后落地，首 run 的 90 页身份翻转不会
  再触发 mode=full——顺序明确优于反序（反序时身份翻转×旧阈值会把首个 run 推回 full）。
- PR4 依赖 PR3（身份不稳则 reused 永不触发，代码无害但无意义且测试无法钉）；PR1 依赖无，立即可合。
- PR5 与 PR1-4 无逻辑依赖，仅文本协调。

## 4. 端到端验收（按序观察下一个定时 Fetch run）

1. en plan 报告 `mode: incremental`，Changed Docs 仅真实飞书漂移，shared 条目 0（PR2）；
   `reasons_by_token` 无丢因（`shared:<record_id>` 键可查）。
2. 无 `[shared-fallback]`/`SHARED_BUILD_FAILED`；generation persistence 无 `skipped-shared-failure`（PR1），
   零漂移 run 进一步出现 `skipped-valid-v5`（PR3/4）。
3. media `manifest_reuse > 0`（健康增量参照 200/275 量级），抓取源集合 = expanded tokens 而非全量。
4. shared lane：零漂移 run 90×`[shared-reuse]`、无 build；单页改动恰 1×build（PR4）。
5. job 时长：PR2 后显著回落（预期向 zh 的 ~10-17min 区间收敛）；PR4 后再降。
6. 零漂移 run 的 checkpoint publication 日志出现 `phase=noop_short_circuit`（PR3 稳态后），
   dev 无新提交、无 snapshot/manifest 重写。
7. 保留 runbook 的真实回放程序要求：PR3/PR4 合入前各跑一次
   `node scripts/docs-workflow/replay-shared-pages.js --legacy-baseline ...`（README《Replay harnesses》/
   《Evidence required after a successful run》），隔离 bare remote、保留证据根、报告命令与结果计数；
   PR2 跑 `pnpm test:replay:fetch`；跨边界（PR3/PR4）加 `pnpm test:replay:all` + `pnpm test:workflow-policy`。

## 5. 明确 out of scope

- repin bot（`.claude/plans/2026-11-08-shared-docs-repin-bot.md` 另案）；任何探测/跟随 milvus HEAD 的逻辑。
- 飞书源侧 25 条 content-links 数据修复的执行（PR1 只修 zdoc 侧解闸的一行）。
- zh/ja 内容与翻译工作；`zdoc_cn` 兼容；按页 cache 分片（整代 SAVE_KEY 重设计）。
- shared 页退役（WP14）、OWNERSHIP_REVERTED 语义调整。

## 6. 风险清单

| 风险 | 缓解/兜底 |
|---|---|
| 渲染身份漏检真实输入变更 → stale 页（如 dev 目标页标题改动致跨页锚点失效） | 身份含 dev_page_index + render_targets + images + active/anchors；reused 输出经 `validatePublishedReceipt.verifyOutput` 摘要校验；receipt 保留全量 inputs_sha256 溯源字段与 pinned inventory 校验（regeneration replay 随时可全量重验）；怀疑时回滚 PR4 恢复全建 |
| 快照/receipt 契约破坏 | inputs_sha256 字段名与 schema 不变，只换哈希配方；`validatePublishedReceipt`/`validateSharedSnapshotRecord`/`pendingSourceSnapshot` 同 PR 更新并有测试钉；一次性身份翻转是预期内的单轮全量重建 |
| 缓存语义变更影响恢复/回放 | recover-translation 不消费 shared 身份（翻译侧）不受影响；replay:requested / replay:shared-pages 的 continuation 与 requestedBaseline 复用 validatePublishedReceipt，随 PR3 更新 fixture 并全量跑套件；cache 决策链（save-decision/lifecycle）代码不动，仅语义受益 |
| PR2 后 content-links lint 不再每 run 跑 | 现状它仅报告不阻断；25 条修复走数据侧；PR5 让报告恢复 per-site 可信 |
| checkpoint 托管路径变更（PR5） | 过渡期双路径 + 删除语义收敛旧文件；workflow-policy 与 stage 契约测试同步 |
