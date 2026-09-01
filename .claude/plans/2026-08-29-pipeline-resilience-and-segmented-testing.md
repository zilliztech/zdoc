# zdoc 流水线健壮性 + 分段测试实施计划

## Context（为什么做）

用户维护这套大型多语言文档流水线两个月，核心痛点：

1. **问题只能在完整 GitHub Actions 运行后暴露** — 流水线一次跑数小时，反馈回路太长。核心根因（已实证）：
   - `pnpm test:translation`（agentRunner 等核心套件，实测全绿、~2 秒、完全 hermetic）**不在任何 CI workflow 里跑** — 只能手动跑。
   - `actionlint` 只在本地装了，CI 不跑。
   - fetch/translate 最易发的 **name-drift 类回归**（历史上 4+ 次：3504ea86a、d7bb3ce98、426f45b52、47f7daf93）没有 contract 测试；现有 contract 测试模式（`deploy/contracts/*.test.mjs`）只覆盖 master-tooling-sync 和 site-validation，且只在 `sync-master-tooling-to-dev.yml:154` 跑。
   - coordinator FIFO 发布循环、跨 job artifact 交接、`gh workflow run` 派发链等逻辑，目前只有完整 Actions 运行才能端到端验证。
2. **Fetch 流程脆弱：取消/失败 → dev 分支脏 → 下次构建两边对不上 → 失败**。链条已确认：
   - `prepare` 在 `fetch-docs.yml:148-156` 对 pinned `INITIAL_TARGET_SHA` 跑 `restore-generated-state.sh --exact` + `pnpm check:localization-input-inventory`，inventory 与内容不一致时**硬失败**。
   - `publish_ready` 被取消（GitHub 发 SIGINT，进程直接死）或超时时，coordinator **不写 terminal evidence**（不写 `publication-results.json`、不写 `GITHUB_OUTPUT`）→ `reconcile_reference_state` 的条件 `results_artifact_name != ''`（fetch-docs.yml:552）不成立 → 跳过 → dev 上内容领先于 reference/inventory，永久脏。目前唯一的自动清理是 deadline failover（publication-coordinator.js:513-527，PR #425 引入），但它只在超时触发、且 throw 前不写 results。
3. **翻译流程耗时最长且测试不足**：guides 批次 `max-parallel: 1` 串行、agentRunner 的核心 `translateAndReviewUnit`（agentRunner.js:850）无任何覆盖测试。
4. **手动提翻译 workflow 完全无法填写**：`translate-codex.yml` 的 workflow_dispatch 要求必填一个完整 schema-v3 `handoff_json`（含 `toolingSha`、`targetBaselineSha`、每 unit 的 `sourceBaselineSha`/`sourceCheckpointSha` 等机器间契约字段）— 这是给 fetch 流程 dispatch 用的机器契约，人类无法手写。正常路径是 `fetch-docs.yml` 的 `prepare_translation_handoff` job 从 fetch run 的 selection+results artifacts 自动生成。用户要求：手动入口只需一个参数——源分支（一般为 dev）。已验证可行：这些 SHA 可从 dev 的 git 历史反推（每 unit 发布 commit message 固定，如 `docs(python): publish SDK reference`；`sourceCheckpointSha` = 该 commit，`sourceBaselineSha` = 其 parent），且 `buildTranslationHandoff`/`validateTranslationHandoff`/`validateTranslationHandoffRepository`（scripts/docs-workflow/translation-handoff.js）均已导出可直接复用。
5. 用户明确方向：**分段测试、各自为营、逐个击破**；**健壮性是当务之急**；先**梳理流程**。

## 调研结论（tavily 最佳实践 + 代码实证）

业界共识：shift-left（便宜快速的测试前置到 PR 级）、阶段间 contract testing、幂等 pipeline（write-before-check-state、checkpoint+resume）、dry-run/staging 目标、取消时 signal handler 清理。对本仓库的适配结论：
- **不做** Temporal/重编排引擎迁移（改动太大）；**不做** act 跑 fetch/translate 全链（act 0.2.89 无法展开 `workflow_call` 复用 job + fetch 有真实飞书/AWS/模型副作用，已实证不可行）。
- **做**：把既有 hermetic 测试接进 PR 级 CI（test:translation、replay 套件）、加 actionlint 门禁、为 fetch/translate 写 workflow contract 测试（直接消灭 name-drift 类）、为取消场景补 terminal evidence、提供一键 repair。

## 分阶段计划

### Phase 0 — 流程地图（第一个交付物）[S]

**目标**：把"触一发而动全身"变成可分段理解、可分段测试的地图。

- 新文件 `.claude/specs/2026-08-29-fetch-translation-pipeline-map.md`（沿用 `.claude/specs/` 现有设计文档惯例），中文撰写、保留英文标识符。
- 内容：
  1. **fetch 阶段链**：`prepare → produce_*（矩阵并行，artifact-only）→ reconciliation_preflight → publish_ready（coordinator FIFO 串行推 dev）→ reconcile_reference_state（推派生态）→ [translation 链] → verify → aggregate`；translation 链：`prepare → prepare_guides_batches → translate_* 矩阵 → prepare_guides_publication_ready → publish_ready → aggregate`。
  2. **阶段间契约（artifact）表**：`publication-selection.json` / `docs-checkpoint-{group}-{run_id}` / `publication-ready-*` / `publication-progress-*` / `publication-results-*` / translation handoff / `translation-checkpoint/baseline-*` — 每个标注生产者、消费者、覆盖它的测试（后续 phase 落地后回填测试名）。
  3. **dev 分支变更点表**：只有 4 个 push 点（fetch publish_ready、fetch reconcile_reference_state、translation publish_ready、未来的 repair workflow），其余 job 全部 artifact-only。
  4. **已知失败模式清单**（name-drift、artifact 过期竞态、cancel mid-publish、prepare inventory 硬失败、zh-CN REST reference 发散、deadline throw 不写结果）。
  5. **恢复 runbook**（repair-fetch-dev、recover-translation.yml、重跑建议）。
- `README.md` 或 `AGENTS.md` 加一小节 operator-facing 摘要并链接。

### Phase 1 — Track R（健壮性，最高优先级）

#### R1. 一键解卡：`repair-fetch-dev` workflow [M]

**问题**：dev 被取消的 run 弄脏后，无自动修复路径。

- 新脚本 `scripts/docs-workflow/repair-fetch-dev.js`：
  - 复用 `buildFetchPublicationSelection`（`scripts/docs-workflow/fetch-publication-selection.js:61`）。
  - 复用 `runDerivedStateRefresh`（`scripts/docs-workflow/translation-publication-reconciliation.js:221`，已验证是通用函数，不校验 workflow）。**注意**：其 `allowedPaths`（:150-156）目前只覆盖 `INVENTORY_PATH` + zh-CN sidebars，fetch 侧复用需参数化扩展（加入 `MANIFEST_PATHS`，见 `fetch-reference-reconciliation.js:23-26`）。
  - commands：`pnpm generate:localization-input-inventory`、`reference-manifest --write`、每组 `reference-sidebar --group <g> --write`、`check:localization-input-inventory`、`validate-reference --site zh-CN`、`validate-revision-inventory --site en`。
  - push 单个 commit（沿用 `chore(i18n): reconcile Fetch Reference state`），严格 allowlist。
- 新 workflow `.github/workflows/repair-fetch-dev.yml`：`workflow_dispatch`（target_branch 默认 dev、groups 默认 all）；`concurrency.group: docs-production-dev` + `queue: max`（与 fetch 串行避免写 dev 竞态）；`permissions: contents: write, actions: read`；job: checkout master → install → repair → 校验最终 tip 的 inventory 检查通过。
- 测试 `scripts/docs-workflow/repair-fetch-dev.test.js`：仿 `fetch-reference-reconciliation.test.js` 的 dependency-injection 模式，断言 allowlist、push 目标、失败非零退出。
- **验证**：本地对临时 dirty 仓库跑 repair；在 staging branch 上手动 dispatch 一次。

#### R2. `prepare` 自愈（依赖 R1）[S-M]

**问题**：`fetch-docs.yml:148-156` 的 inventory 检查对 stale tip 硬失败。

- 改 `prepare` 的 "Verify immutable target localization inventory" 步骤：`check:localization-input-inventory` 失败时，先跑 `repair-fetch-dev.js repair --target-branch "$TARGET_BRANCH"`，再重新 `restore-generated-state.sh --exact --ref "$INITIAL_TARGET_SHA"` + check；仍失败才 exit 1。
- **权限（已确认）**：给 `prepare` job 加 `contents: write`，直接在 prepare 内跑 repair。repair 的写入受 allowlist 硬约束（只动派生态路径）。
- **验证**：本地构造 stale-inventory 临时仓库，模拟 prepare 步骤，确认先 repair 后 check 通过。

#### R3. 取消/超时的 terminal evidence + reconcile 兜底 [M]

**问题**：cancel/deadline 时 coordinator 不写 results，`reconcile_reference_state` 被跳过。

- `scripts/docs-workflow/publication-scheduler.js`：新增 `cancelResults({completedAt})` — 把非 terminal 单元映射到既有 terminal 状态（`producing→producer_failed`、`candidate/ready→candidate_rejected`、`publishing→publish_failed`）+ failure code `CANCELLED`，`overallStatus:'failure'`；确保 `results()` 校验通过（`planFetchReferenceReconciliation` 接受 failure，fetch-reference-reconciliation.js:43、:49-52 已接受全 terminal 的 failure）。
- `scripts/docs-workflow/publication-coordinator.js`：
  - 把 deadline 块（:513-527）抽成共享函数 `bestEffortTerminalRefresh`。
  - 安装 SIGINT/SIGTERM handler（复用 `checkpoint-publication.js:175-186` 的既有模式）：best-effort refresh derived state → `scheduler.cancelResults()` 写 `publication-results.json` → upload → exit 前向 `$GITHUB_OUTPUT` append `results_artifact_name` + `final_target_sha`（文件 append 即可，让 `reconcile_reference_state` 现有 `if` 条件成立）→ `process.exit(130)`。
  - 同样让 deadline path 也走"先写 results 再 throw"。
- `fetch-docs.yml`：`reconcile_reference_state` 已是 `if: always()`，无需改。
- **验证**：在 `replay-fetch-publication-fifo.test.js` 加 `cancel-mid-publish` 场景：断言写了 terminal results、`overallStatus==='failure'`、GITHUB_OUTPUT 被追加、成功单元派生态已 reconcile。

### Phase 2 — Track T（分段测试）quick wins

#### T1. `pnpm test:translation` 接入 CI [S]

- `site-validation.yml` `tooling_checks` job（:97-115）追加 `- run: pnpm test:translation`。该 job 每个 PR/push 到 dev、master 都跑，且在 `site_validation` aggregate 中必过（`test "$TOOLING_RESULT" = success`），实测 hermetic ~2 秒。
- **验证**：本地绿（已实证 163+22 全绿）+ CI 绿。

#### T2. actionlint CI 门禁 [S-M]

- `site-validation.yml` 新增 `workflow_lint` job：下载 pin 版 actionlint v1.7.12（SHA256 硬编码防漂移）跑 `actionlint -color`；加入 `site_validation` aggregate 必过列表。
- **验证**：本地 `actionlint -color` 先清存量告警（预期 0，`queue: max` 是唯一已知告警源），CI 绿。

#### T3. Fetch/Translate workflow contract 测试 [M]

**新文件** `deploy/contracts/fetch-translation-workflow.test.mjs`（沿用 `master-tooling-sync-workflow.test.mjs` 的 js-yaml + regex 模式；用 `createRequire` 加载 CJS 的 `print-workflow-groups.js` 拿 `fetchUnitDefinitions`/`sdkGroupIds`）。

**断言**（直接覆盖 4 次历史回归）：
- **fetch-docs.yml**：`fetchUnitDefinitions()` 每个 `producerJob` 都能在 workflow 中解析（SDK 单元 `name: produce_${{ matrix.group }}` + matrix.group == `sdkGroupIds()`；静态 job `produce_guides`、`produce_zh_guides`、`publish_rest_zh-CN` 存在；`produce_sdk_reference` 有 `fail-fast: false`）。
- **artifact 名字契约**：`_fetch-content-group.yml` 的 `docs-checkpoint-${{ steps.paths.outputs.checkpoint_group }}-${{ github.run_id }}`（checkpoint_group = unitKey 去掉 `source/` 前缀）须等于 `fetch-publication-selection.js:37-39` 的 `checkpointArtifactName`；`publication-selection-fetch-{run_id}-{run_attempt}` == `publication-contracts.js` `artifactNames({workflow:'fetch'}).selection`。
- **依赖图**：`publish_ready.needs` 含 `reconciliation_preflight`；`reconcile_reference_state.needs` 含 `publish_ready` 且 `if` 含 `always()`；所有 `needs` 引用的 job 存在。
- **translate-codex.yml**：`translate_sdk` 的 `name: translate:${{ matrix.target }}/${{ matrix.group }}` == `translation-publication-selection.js:113` 的 `producerJob`；`prepare_guides_publication_ready` 存在；`_translate-content-group.yml` 的 `translation-checkpoint/baseline-{target}-{group}-{run_id}` == selection 的 artifact 名；`publication-ready-translation-{token}-{run_id}-{run_attempt}` == `artifactNames({workflow:'translation'}).ready`；`translate_guides_batches` 保持 `max-parallel: 1`；`publish_ready.needs` 为 `[prepare, translate_sdk, prepare_guides_publication_ready]` 且 `if` 含 `always()`，使单写者的 deadline 在全部 producer 达到终态后才开始计时。
- **跑在哪**：`site-validation.yml` `workflow_lint` job（PR 级触发）+ 加进 `sync-master-tooling-to-dev.yml:154` 的 node --test 行（沿用惯例）。
- **验证**：本地 `node --test deploy/contracts/fetch-translation-workflow.test.mjs` 绿；**负向验证**：故意改错一个 producerJob 名确认测试红。

#### T4a. replay 故障注入套件接入 CI [S]

- `package.json` 提供稳定的 `test:replay:*` 入口：PR 级 `test:replay` 运行 contract + Fetch + recovery；`test:replay:translation` 保留给较慢的 Translation FIFO/monitor 套件；`test:replay:all` 用于跨流水线合并前验证。
- recovery 侧 replay（`replay-recovery-plan.test.js`）进入 PR 级 gate；translation 侧 replay（`replay-translation-publication-fifo.test.js` + `replay-translation-monitor-artifacts.test.js`）进入独立 nightly/scheduled workflow，不阻塞 PR。
- `replay-harness-contract.test.js` 固定 package scripts、PR/nightly CI 路由和 README/AGENTS prose，防止后续新增 harness 时入口漂移。
- 代码测试矩阵提供 `pnpm test:for-change -- <paths...>` 选择器，将修改文件映射到 focused tests、replay harness 与 broader gates；未覆盖路径 fail closed。
- **验证**：本地绿 + CI 绿。

### Phase 3 — Track U（可用性）：手动翻译入口简化

#### U1. 翻译 workflow 手动入口只留一个参数 [M]

**问题**：`translate-codex.yml` 手动触发必填完整 schema-v3 `handoff_json`，人类无法填写。

**设计**：新增薄入口 workflow `.github/workflows/translate-manual.yml`（或在 translate-codex.yml 加简化输入分支）：
- 输入仅 `source_branch`（默认 `dev`）+ 可选 `targets`（默认 all）、`publish`（默认 false）、`groups`（默认 all）。
- 新脚本 `scripts/docs-workflow/build-manual-translation-handoff.js`：
  - `git fetch origin <source_branch>` → `tip = rev-parse`。
  - 对每个待翻译 unit（复用 `fetchUnitDefinitions()`/翻译单元定义），在 dev 历史中找该 unit 的最近发布 commit（按 `commitMessage` 匹配，workflowUnits.ts 中的固定 message）→ `sourceCheckpointSha` = 该 commit、`sourceBaselineSha` = 其 parent；`toolingSha` = 该发布 commit 时的 master 工具 SHA 或 origin/master tip；`targetBaselineSha` = dev tip。
  - 组装后调用既有 `buildTranslationHandoff(...)` + `validateTranslationHandoffRepository({repository, handoff})` 自校验（已导出）。
  - 输出 handoff JSON + 所需派生输入，供 dispatch translate-codex.yml。
- 入口 job 内部再 `gh workflow run translate-codex.yml -f handoff_json=... -f mode=auto -f publish=...`（复用 dispatch_translations 的模式，fetch-docs.yml:749）。
- **注意**：增量翻译的 reconciliation plan 依赖 fetch run 的 artifacts（`fetch-reconciliation-plans.js generate` 需要 selection+results artifacts）。手动入口首次落地按 `mode=full` 或"从 dev tip 直接对比"处理（`sourceChanges.js` 支持 workspace 对比），后续再评估是否需要从最近成功 fetch run 拉取 plans。手动模式定位为"补翻译/重翻译"入口，与 fetch 驱动的增量链路并存。
- **测试** `build-manual-translation-handoff.test.js`：用本地 fixture 仓库（含模拟的发布 commit 历史）断言 SHA 反推逻辑、找不到发布 commit 时的明确报错、handoff 通过 `validateTranslationHandoff`。
- **验证**：本地 fixture 仓库生成 handoff 并过 `validateTranslationHandoffRepository`；真实环境用 staging branch 手动 dispatch 一次（publish=false）。

### Phase 4 — Track T 深入

#### T5. agentRunner 核心 `translateAndReviewUnit` 覆盖 [M-L]

- 把 `translateAndReviewUnit`（agentRunner.js:850）加入 `module.exports`（:2048-2079，纯 additive）。
- 新测试（`agentRunner-translate-unit.test.js`）：mock `callModel` 返回合法语义单元 JSON，覆盖：空文档直返原文（:870）、protected token 保持、provider_timeout 触发 adaptive subdivision（:884-958）、polish 破坏 locale contract 回退 translation 草稿（:994-1001）、review 循环 ≤ maxReviewRounds 且 issue 驱动 correction（:1006+）。
- **验证**：新测试绿 + `pnpm test:translation` 全绿。

### 延后项（明确不做，及理由）

- **R4 幂等重跑 skip-if-current** [L]：`publishCheckpointTransaction` 已对无差异返回 `no_changes`，per-unit 幂等基本成立；剩余浪费是 producer compute 成本不是正确性问题。R1-R3 落地后再评估。
- **T4b 每晚全量 replay 真实 artifact** [L]：依赖 artifact 3 天留存、易 flaky；T4a hermetic 故障注入已覆盖 8 个关键场景。
- **act 跑 fetch/translate 全链**：不可行（已实证）。
- **Temporal 式重编排**：改动过大。

## 依赖与顺序

```
Phase 0 (流程地图)
   ├─→ R1 (repair) ─→ R2 (prepare 自愈)     [Track R 串行]
   ├─→ R3 (cancel evidence)                  [独立，与 R1 并行]
   ├─→ T1 + T2 + T3 + T4a                    [Track T quick wins，可并行]
   ├─→ U1 (手动翻译入口简化)                  [独立]
   └─→ T5 (agentRunner)                      [独立]
```

**已确认的执行顺序（用户拍板）**：Phase 0 → **T1/T2（半天内 quick wins，立刻缩短反馈回路）→ R1 → R3 → R2 → T3 → T4a → U1 → T5**。

**已确认的决策**：
- **R2 权限**：`prepare` job 直接加 `contents: write`，失败时自动 repair 再复查（写入受 allowlist 硬约束）。
- **T4a**：fetch replay（9 秒）进 PR 级 CI；translation replay（>10 分钟）放 nightly/scheduled workflow，不阻塞 PR。
- **U1**：手动入口只留 `source_branch`（默认 dev）等人类可理解的参数；schema-v3 handoff 由脚本从 dev git 历史自动反推生成并自校验。

## 关键文件清单

| 文件 | 改动 |
|---|---|
| `.claude/specs/2026-08-29-fetch-translation-pipeline-map.md` | 新建：流程地图 |
| `.github/workflows/repair-fetch-dev.yml` | 新建：一键解卡 |
| `scripts/docs-workflow/repair-fetch-dev.js` + `.test.js` | 新建：repair 脚本与测试 |
| `.github/workflows/fetch-docs.yml` | R2 prepare 自愈步骤改造 |
| `scripts/docs-workflow/publication-coordinator.js` | R3 signal handler + bestEffortTerminalRefresh |
| `scripts/docs-workflow/publication-scheduler.js` | R3 cancelResults() |
| `scripts/docs-workflow/replay-fetch-publication-fifo.test.js` | R3 验证场景 |
| `scripts/docs-workflow/replay-recovery-plan.js` + `.test.js` | retained Translation recovery plan 真实 artifact replay + fault overlay |
| `scripts/docs-workflow/replay-harness-contract.test.js` | replay 命令、CI 分层与 prose 接线契约 |
| `scripts/docs-workflow/test-matrix.json` + `select-tests-for-changes.js` + `.test.js` | 机器可读代码测试矩阵、Agent 选择器和 fail-closed 校验 |
| `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md` | 人可读代码路径到测试/harness/门禁映射 |
| `deploy/contracts/fetch-translation-workflow.test.mjs` | 新建：workflow contract 测试 |
| `.github/workflows/site-validation.yml` | T1/T2/T3/T4a 挂载点（tooling_checks + workflow_lint） |
| `scripts/translation/agentRunner.js` | T5 导出 translateAndReviewUnit |
| `scripts/translation/agentRunner-translate-unit.test.js` | 新建：核心翻译单元测试 |
| `.github/workflows/translate-manual.yml` | 新建（U1）：单参数手动翻译入口 |
| `scripts/docs-workflow/build-manual-translation-handoff.js` + `.test.js` | 新建（U1）：从 dev 历史反推 handoff 并自校验 |

## 验证方式（端到端）

1. **单元/契约级**：`pnpm test:translation`、`pnpm test:replay`；跨 Fetch/Translation/recovery 时运行 `pnpm test:replay:all`；另跑 `node --test deploy/contracts/fetch-translation-workflow.test.mjs`、`pnpm test:workflow-policy`，并对本次变更的 workflow 运行 `actionlint`（全仓扫描会对仓库自定义的 `concurrency.queue` 扩展产生已知 schema 告警）。
2. **R1/R2 端到端**：本地构造 stale-inventory 的临时 git 仓库（bare remote + 本地 worktree），跑 repair 脚本，确认只追加派生态 commit 且 inventory 检查转绿；随后在 staging branch dispatch repair-fetch-dev workflow 验证真实环境。
3. **R3 端到端**：replay 套件新增的 cancel-mid-publish 场景全绿；真实环境用一次非生产分支的 cancel 测试观察 `publication-results.json` 上传 + reconcile 条件成立。
4. **CI 级**：开 PR 后 site-validation 的 `tooling_checks`/`workflow_lint` 在几分钟内完成并给出翻译回归/contract drift 的 PR 级反馈（不再需要跑数小时流水线才发现）。
