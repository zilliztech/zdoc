# Fetch→Translation 流水线流程地图

> 本文档是「流水线健壮性 + 分段测试」计划（`.claude/plans/2026-08-29-pipeline-resilience-and-segmented-testing.md`）的 Phase 0 交付物。
> 目的：把"触一发而动全身"的完整发布流水线，拆成可分段理解、可分段测试的地图。
> 约定：中文叙述，英文标识符（workflow 名、job 名、artifact 名、脚本名、SHA 字段）原样保留。

## 1. 总览

两条主 workflow 串联成一条生产发布链，另有 `recover-translation.yml` 作为翻译恢复的独立入口。

```
fetch-docs.yml                                    translate-codex.yml
─────────────                                    ───────────────────
prepare                                            initialize_translation_card
  └─ monitor_docs_progress                           └─ monitor_translation_progress
  └─ produce_guides_sources (en)                  prepare
  └─ render_guides_tables (en, 矩阵)                 └─ prepare_guides_batches
  └─ produce_guides (en)                             └─ translate_guides_batches (max-parallel:1)
  └─ produce_zh_guides_sources (zh-CN)               └─ translate_sdk (max-parallel:3, 矩阵)
  └─ render_zh_guides_tables (zh-CN, 矩阵)       prepare_guides_publication_ready
  └─ produce_zh_guides (zh-CN)                   publish_ready (FIFO 串行推 dev)
  └─ produce_sdk_reference (矩阵)                aggregate
  └─ publish_rest_zh-CN
  └─ reconciliation_preflight
  └─ publish_ready (FIFO 串行推 dev)
  └─ reconcile_reference_state (推派生态 commit)
  └─ record_pending_reconciliation
  └─ source_publication_barrier
  └─ prepare_translation_handoff ──(dispatch)──▶ translate-codex.yml
  └─ dispatch_translations
  └─ verify
  └─ aggregate
  └─ finalize_card_fallback
```

**触发与串行约束**：
- `fetch-docs.yml`：`workflow_dispatch`（`group`/`target_branch`/`publish`/`run_translations`/`tooling_ref`/`source_ref`/`media_upload_mode`/`artifact_retention_days`）+ `schedule`（cron `0 2,10,18 * * *`）。
- `translate-codex.yml`：`workflow_dispatch`（必填 `handoff_json` schema-v3）+ `workflow_call`（`recover-translation.yml` 复用）。
- 两者共享 `concurrency.group: docs-production-dev`、`queue: max`——**同一时刻只有一个写 dev 的 publish 在跑**；translation 在 `publish=false`（只读）时改用 `translation-readonly-{run_id}` 组，不占生产队列。
- 顶层 `permissions: contents: read`；只有写 dev 的 job（`publish_ready`、`reconcile_reference_state`）单独提升到 `contents: write`。

## 2. Fetch 阶段链（fetch-docs.yml）

| 阶段 | 职责 | 关键输入 | 关键输出 | 写 dev? |
|---|---|---|---|---|
| `prepare` | 解析不可变 ref（tooling/master/source/initial_target SHA）、校验 `group`/`media_upload_mode`、生成 Fetch selection、建进度卡片 | workflow inputs | 全部 job outputs（`tooling_sha`…`selected_sdk_groups`…`publication_selection_artifact_name`）+ `publication-selection` artifact | 否 |
| `monitor_docs_progress` | 飞书进度卡片监控 | `card_id` | 无 | 否 |
| `produce_guides_sources` / `produce_zh_guides_sources` | 拉取 Guides 源（en / zh-CN） | `master_sha`、`dev_baseline_sha` | 源 artifact | 否 |
| `render_guides_tables` / `render_zh_guides_tables` | 渲染 Guides 表格（矩阵，`fail-fast:false`、`max-parallel:4`） | 源 artifact | 表格 artifact | 否 |
| `produce_guides` / `produce_zh_guides` | 组装 Guides（`_assemble-guides.yml`） | 源 + 表格 artifact | `docs-checkpoint-{group}-{run_id}` | 否 |
| `produce_sdk_reference` | 按 `selected_sdk_groups` 矩阵生产 SDK reference（`_fetch-content-group.yml`） | selection | `docs-checkpoint-{sdk}-{run_id}` | 否 |
| `publish_rest_zh-CN` | zh-CN REST reference 直产（spec 生成，不走 paid 翻译） | selection | `docs-checkpoint-rest-zh-CN-{run_id}` | 否 |
| `reconciliation_preflight` | 发布前预检：下载 checkpoint、生成翻译 reconciliation plan | selection + checkpoint artifacts | `fetch-reconciliation-plans-{run_id}-{run_attempt}` | 否 |
| `publish_ready` | **coordinator FIFO 串行推 dev**（`publication-coordinator.js`，`contents:write`，`timeout-minutes: 360`） | selection + ready descriptors | `publication-results-{workflow}-{run_id}-{run_attempt}`、`final_target_sha` | ✅ |
| `reconcile_reference_state` | 派生态 reconcile + push（`fetch-reference-reconciliation.js reconcile`，`contents:write`） | selection + results | 派生态 commit | ✅ |
| `record_pending_reconciliation` | `run_translations=false` 时记录 pending plan 证据 | selection + results | `fetch-pending-reconciliation-{run_id}-{run_attempt}` | 否 |
| `source_publication_barrier` | 阻断：选定 source 未全部发布成功则不允许 paid 翻译 | selection + results | 无（gate） | 否 |
| `prepare_translation_handoff` | 生成并自校验 schema-v3 handoff | selection + results + plans | `translation-handoff-v3-{run_id}-{run_attempt}` | 否 |
| `dispatch_translations` | `gh workflow run translate-codex.yml` 派发子 run | handoff | 子 run URL/ID + `docs-translation-handoff-{run_id}` metadata | 否 |
| `verify` | 最终验证（`_verify-docs.yml`） | `final_dev_sha` + selection/results | 验证状态 | 否 |
| `aggregate` | 汇总终端结果、出卡片报告 | selection + results | `docs-card-report-{run_id}` + summary | 否 |
| `finalize_card_fallback` | 卡片兜底更新（best-effort） | card_id | 无 | 否 |

**关键 gate 条件**（决定链条是否继续，均以 `always()` 兜底判断上游 result）：

| 边界 | 条件 |
|---|---|
| `publish_ready` | `prepare.result == success` 且（`publish=false` 或 `reconciliation_preflight.result == success`） |
| `reconcile_reference_state` | `always()` 且 `publish==true` 且 `publish_ready.outputs.results_artifact_name != ''` ← **cancel/deadline 时不写 results 会在这里被跳过**（R3 目标） |
| `source_publication_barrier` | `run_translations==true` 且 `publish==true` 且 `reconcile_reference_state.result == success` |
| `prepare_translation_handoff` | 同上 + `source_publication_barrier.result == success` |
| `dispatch_translations` | `run_translations==true` 且 `publish==true` 且 handoff 成功 |

## 3. Translation 阶段链（translate-codex.yml）

| 阶段 | 职责 | 关键输入 | 关键输出 | 写 dev? |
|---|---|---|---|---|
| `initialize_translation_card` | 翻译进度卡片（仅 `request_id` 非空时） | `handoff_json` | `card_id` | 否 |
| `monitor_translation_progress` | 飞书翻译监控 | card + prepare | 无 | 否 |
| `prepare` | 校验 handoff、校验 target branch 未漂移、生成 Translation selection | `handoff_json` | `source_checkpoints_json`、`sdk_producer_matrix`、`publication-selection-translation-{run_id}-{run_attempt}` | 否 |
| `prepare_guides_batches` | 拆分 Guides 批次（`_prepare-translation-batches.yml`） | guides unit | batch matrix | 否 |
| `translate_guides_batches` | 逐批翻译 Guides（**`max-parallel:1` 串行**，`_translate-content-group.yml`） | batch matrix | `translation-checkpoint/baseline-ja-JP-guides-{run_id}-batch-*` | 否 |
| `translate_sdk` | 并行翻译 SDK（`max-parallel:3`，矩阵 `translation/{target}/{group}`） | sdk matrix | `translation-checkpoint/baseline-{target}-{group}-{run_id}` | 否 |
| `prepare_guides_publication_ready` | 打包 Guides 完整 batch set → ready descriptor | batches + checkpoints | `publication-ready-translation-{token}-{run_id}-{run_attempt}`、`translation-checkpoint/baseline-ja-JP-guides-{run_id}` | 否 |
| `publish_ready` | **coordinator FIFO 串行推 dev**（`contents:write`，带 `--deadline` 350 分钟） | selection + ready descriptors | `publication-results-{workflow}-{run_id}-{run_attempt}`、`final_target_sha` | ✅ |
| `aggregate` | 校验终端文档、验证 target 未漂移、汇总 | selection + results | summary | 否 |

## 4. 阶段间契约（artifact）表

命名统一由 `scripts/docs-workflow/publication-contracts.js` 的 `artifactNames()` 与各 selection 脚本派生；此处列出 **生产者 → 消费者 → 覆盖它的测试**。

| Artifact（命名模式） | 生产者 | 消费者 | 覆盖测试 |
|---|---|---|---|
| `publication-selection-{workflow}-{run_id}-{run_attempt}` | `prepare`（fetch / translation） | 所有下游 job | `deploy/contracts/*.test.mjs`（T3 新增） |
| `docs-checkpoint-{checkpoint_group}-{run_id}`（`checkpoint_group` = unitKey 去 `source/` 前缀） | `produce_*` / `publish_rest_zh-CN` | `publish_ready`、`reconciliation_preflight` | `fetch-publication-selection.js:37-39` == T3 契约断言 |
| `docs-checkpoint-{group}-{run_id}-revision-report` | `_fetch-content-group.yml` | `aggregate`（revision 证据） | — |
| `docs-checkpoint-guides-{en\|zh-CN}-{run_id}-reports` | Guides 组装 | `aggregate`（卡片报告） | — |
| `publication-ready-{workflow}-{token}-{run_id}-{run_attempt}` | 各 producer / `prepare_guides_publication_ready` | `publish_ready`（coordinator） | `publication-contracts.js validatePublicationReady` |
| `publication-progress-{workflow}-{run_id}-{run_attempt}-{revision}` | `publication-coordinator.js`（FIFO 心跳） | monitor | — |
| `publication-results-{workflow}-{run_id}-{run_attempt}` | `publish_ready` | `reconcile_reference_state`、`record_pending_reconciliation`、`source_publication_barrier`、`prepare_translation_handoff`、`verify`、`aggregate` | `publication-contracts.js validatePublicationResults` |
| `fetch-reconciliation-plans-{run_id}-{run_attempt}` | `reconciliation_preflight` | （下游 recover/审批链） | `fetch-reconciliation-plans.test.js` |
| `fetch-reconciliation-review-{run_id}-{run_attempt}` | `reconciliation_preflight`（失败时） | 人工审批 | — |
| `fetch-pending-reconciliation-{run_id}-{run_attempt}` | `record_pending_reconciliation` | 人工 | — |
| `translation-handoff-v3-{run_id}-{run_attempt}` | `prepare_translation_handoff` | （人工审计证据） | `translation-handoff.js` |
| `docs-translation-handoff-{run_id}` | `dispatch_translations` | monitor / 人工 | — |
| `translation-checkpoint-{target}-{group}-{run_id}` + `translation-baseline-{target}-{group}-{run_id}` | `translate_sdk` / `prepare_guides_publication_ready` | `publish_ready` | `translation-publication-selection.js` |
| `translation-checkpoint/baseline-ja-JP-guides-{run_id}-batch-*` | `translate_guides_batches` | `prepare_guides_publication_ready` | `translation-artifact-pairs.js` |
| `translation-reconciliation-plan-{target}-{group}-{run_id}` | `_translate-content-group.yml` | 翻译执行 | — |
| `translation-reconciliation-review-state-{target}-{group}-{run_id}-{batch}` | `_translate-content-group.yml` | 飞书审批卡片 / 人工 | — |
| `translation-retirement-review-{target}-{group}-{run_id}-{batch}` | `_translate-content-group.yml` | 人工 | — |
| `docs-card-report-{run_id}` | `aggregate` | `finalize_card_fallback` / 人工 | — |

## 5. dev 分支变更点（push 点）

全流水线只有 **4 个写 dev 的 push 点**，其余 job 全部 artifact-only（`contents: read`）：

1. **fetch `publish_ready`** — `publication-coordinator.js` 按 producer 完成 FIFO 顺序串行 push 源内容 commit。
2. **fetch `reconcile_reference_state`** — `fetch-reference-reconciliation.js reconcile` push 派生态 commit（`MANIFEST_PATHS` + 各组 sidebar，受 allowlist 硬约束）。
3. **translation `publish_ready`** — 同样 coordinator 串行 push 翻译内容 commit。
4. **（计划中 R1）`repair-fetch-dev` workflow** — 一键解卡，只追加派生态 commit（严格 allowlist）。

并发安全靠 `concurrency.group: docs-production-dev` + `queue: max` 保证这 4 个写点串行。

## 6. 已知失败模式清单

| # | 失败模式 | 现象 | 根因 | 对应计划项 |
|---|---|---|---|---|
| 1 | name-drift | workflow job 名 / artifact 名与 selection 脚本派生名不一致，下游 download-artifact 拿不到东西 | job 名硬编码在 workflow，业务名派生在 TS/JS，无 contract 测试 | **T3**（历史 4 次：`3504ea86a`、`d7bb3ce98`、`426f45b52`、`47f7daf93`） |
| 2 | artifact 过期竞态 | 跨 job 交接的 artifact 被 3 天 retention 回收 | 下游 job 晚于 retention 窗口启动 | 人工监控（T4b 延后） |
| 3 | cancel mid-publish | 取消/超时时 coordinator 不写 terminal results → `reconcile_reference_state` 的 `results_artifact_name != ''` 不成立 → 跳过 → dev 内容领先于 reference/inventory，永久脏 | coordinator 无 SIGINT/SIGTERM handler，deadline throw 前不写 results | **R3** |
| 4 | prepare inventory 硬失败 | `prepare` 的 `restore-generated-state --exact` + `check:localization-input-inventory` 对 stale tip 硬 fail（fetch-docs.yml:148-156） | 上一条取消/失败留下脏 dev | **R2**（依赖 R1） |
| 5 | zh-CN REST reference 发散 | REST 中文内容由 spec 生成、不经翻译链，与派生态 manifest 可能不同步 | 独立 `publish_rest_zh-CN` producer + `rest_publication_contract` 单独校验 | 已由 `publish_rest_zh-CN` 改名 PR 处理 |
| 6 | deadline throw 不写结果 | `--deadline`（translation 350min）触发时 coordinator throw，不写 results | 同 #3 根因 | **R3** |

**观察到的现状偏差（执行 T3 时需注意）**：`produce_sdk_reference`（fetch-docs.yml:342-346）当前**没有** `fail-fast: false`（矩阵默认 `fail-fast: true`）。计划 T3 的断言「`produce_sdk_reference` 有 `fail-fast: false`」与现状不符——落地 T3 时应改为「断言其为矩阵 + 明确 fail-fast 行为」，或先补上 `fail-fast: false` 再断言。`render_guides_tables`/`render_zh_guides_tables`/`translate_guides_batches`/`translate_sdk` 均已显式 `fail-fast: false`。

## 7. 恢复 runbook（对应 README「Failure handling and recovery」）

| 场景 | 入口 | 关键动作 |
|---|---|---|
| 翻译 artifact 过期/不兼容 | `recover-translation.yml`（输入上一 translation run **ID** 非 job ID） | 先 `publish=false` 认证 recovery plan、检查 rejected；兼容后再 `publish=true`；`allow_full_retranslate` 是显式授权的付费路径 |
| dev 被取消 run 弄脏（fetch 侧） | 计划 R1 `repair-fetch-dev.yml` | `workflow_dispatch`（target_branch 默认 dev、groups 默认 all），严格 allowlist 只追加派生态 commit |
| 删除/路径变更需人工审批 | `scripts/docs-workflow/reconciliation-review-pr.js` | 生成确定性审批 PR，审核后 merge，再走 master→dev tooling sync |
| 未知远程状态（`REMOTE_STATE_UNKNOWN`） | 无自动入口 | 安全停止：不 cancel、不 force-push、不盲目重跑，先探明 remote/candidate/result SHA |
| 卡片/上报失败 | — | 卡片是观测不是 Git writer，以 selection/results 与最终验证 artifact 为准 |

## 8. 与后续计划项的衔接

- **R1** 复用 `buildFetchPublicationSelection`（fetch-publication-selection.js:61）与 `runDerivedStateRefresh`（translation-publication-reconciliation.js:221，需参数化扩展 `allowedPaths` 加入 `MANIFEST_PATHS`）。
- **R3** 复用 `checkpoint-publication.js:175-186` 的 signal handler 模式，给 coordinator 装 SIGINT/SIGTERM handler + `scheduler.cancelResults()`。
- **T3** 沿 `deploy/contracts/master-tooling-sync-workflow.test.mjs` 的 js-yaml + regex 模式，断言第 4 节 artifact 名与 job 名一致。
- **T1/T2/T4a** 挂载点统一在 `site-validation.yml`（`tooling_checks` / 新增 `workflow_lint`），并纳入 `site_validation` aggregate 必过列表。
