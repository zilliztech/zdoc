# rest-upstream watchdog → refresh 自动联动方案（2026-11-09）

## 目标

drift watchdog 发现结构性漂移后自动 dispatch refresh、自动开出 draft PR（复用 ga4-404-remediation 的发布模式）。
原则：**不允许 codex/LLM 写结构化数据**——联动新增的所有结构化数据（dispatch plan）由脚本生成、由脚本验证；
refresh 现有管线已是 decisions-first 模型（模型只出 stance/闭集标签，assembler/applier 推导每个字节），本次不动。

## 现状核实（2026-11-09）

- `rest-upstream-drift-watchdog.yml`：每日 04:17 UTC 只读扫描，产出 `watchdog-report.json/md` + artifact(14d) + 飞书卡片；**从不 dispatch refresh**（known-issues 明文：fix path=人工 dispatch，日报绝不触发）。
- `rest-upstream-refresh.yml`：纯 workflow_dispatch 人工触发；全链路（prepare→decide/branch-plan/describe/translate→assemble→apply→land→门禁链→PAT 开 draft PR）已生产验证 5 次（#964/#989/#995/#1005/#1121）。
- 两个缺口：
  1. 联动缺口：drift 只落在 artifact/日报，refresh 永远等人。
  2. refresh 无 single-flight 闸：同源重复 dispatch 空烧整条付费模型链路，且失败 run 留下孤儿分支（10-30 实证两枚；push 本身无 --force，二次 push 是 non-fast-forward 被 git 拒绝 ⇒ **不是**覆写在审 PR，而是重复付费 run + non-FF push 失败/孤儿分支——2026-11-09 评审 P2-1 更正）。
- 漂移实况（run 42446324668, 11-08）：控制面 substantive 36 / 数据面 34，无 open refresh PR，无新 track。联动上线首日即自动清积压（开 2 个 draft PR）。
- 最新 refresh run（42166023912 → PR #1121）约 10 分钟全绿。

## 设计

### 新脚本 `scripts/rest-upstream/dispatch-refresh.js`（结构化数据唯一出入口）

- 输入：`watchdog-report.json` + lock + GitHub API（open pulls 列表、refresh workflow runs 列表；fetch 可注入，token 走 `--token-env GH_TOKEN`）。
- 输出：`dispatch-plan.json`（schemaVersion、generatedAt、verification full/partial、sources[]：`id/head/pin/substantiveCount/dispatchable/reason`）+ `dispatch-plan.md`（step summary 用），放进既有 artifact 目录（`tmp/rest-upstream-watchdog/`）。
- dispatch 判定（全部脚本内、hermetic 可测）：
  - `status === 'drift'`（head ≠ pin）
  - `substantiveCount > 0`（纯 prose 漂移不自动领 PR——known-issues 定论：prose 永不自动消解，随结构性 refresh 的评审单顺带走）
  - 无同源 open refresh PR：REST pulls 全量翻页（per_page=100）+ 客户端分支正则过滤 `^rest-upstream-refresh/<lower(slug)>-[0-9a-f]{7,40}$`。**不用 REST `label` 参数**（/pulls 端点静默忽略它——评审 P1-1 实测）；正则尾部 hex 锚定天然防源 id 前缀碰撞（评审 P2-3）。
  - 近 24h 无失败的 refresh run（评审 P1-3 重试护栏）：`GET .../actions/workflows/rest-upstream-refresh.yml/runs` 过滤 `status=completed ∧ conclusion=failure ∧ created_at>now-24h` 即跳过全部 dispatch（reason=`recent-refresh-failure`）。**全局钝闸而非按源**：实测所有 dispatch run 的 head_branch='master'（run 列表不带源信息），按源归因不可行；refresh 失败多为系统性根因（网关/工具链），一天 backoff 可接受、自愈。
  - **不传 upstream_commit**：refresh 运行时解析 HEAD，pin 顶到最新；扫描期新漂移并入同一次 refresh。
  - `--execute` 时逐源执行前重读 master lock（contents API，一次调用）：pin 已等于报告 head → 跳过（reason=`already-refreshed-at-head`，关掉扫描→执行窗口的 TOCTOU——评审 P1-2）。
- 模式：默认 dry-run 只写 plan（token 缺失时 verification=partial 照常产出）；`--execute` **必须**有 token（fail-closed），逐源 spawn `gh workflow run rest-upstream-refresh.yml --repo <repo> -f source=<id> -f base_ref=master -f draft_pr=true`（dispatcher 函数可注入供 hermetic 测试）。
- 写时验证（schemaVersion/源 id 在 lock 内/invariant：dispatchable ⇒ drift ∧ substantive>0 ∧ 无 open PR ∧ 无近期失败）。
- LLM/codex 全程不在链路里。

**Pin-bump-only PR 的语义（评审 P1-2 的另一半）**：全 unresolvable-subtree 漂移会产出仅 pin bump + 评审清单的 PR——**不是静默丢失**：land 步把所有未消解条目落成 ledger `deferred` 条目、T4 accounting 闸在 push 前强证"每个 upstream@pin op 都有 ledger 条目"，known-issues 补充说明此路径。（land 步 "nothing to refresh" 守卫因 lastVerifiedAt 无条件重写而实际不可达——既有行为、人工 dispatch 同样如此，本次不修，known-issues 记录。）

### watchdog workflow 改动

- 步骤顺序：scan → **dispatch** → artifact upload（`if: always()`，plan 随既有 artifact 上传——评审 P1-4：dispatch 必须在 upload 之前）→ step summary（追加 dispatch 段）→ report card。dispatch 步 `if: steps.scan.conclusion == 'success'`。
- env：`REST_UPSTREAM_REFRESH_PAT`（与 ga4 同一把 PAT；脚本 API 读 + gh workflow run 都用它，避开 runs API 的 actions:read 需求，顶层 permissions 保持 `contents: read`）；kill switch：repo var `REST_UPSTREAM_AUTO_REFRESH_DISABLED` 非空 → notice + 不传 `--execute`（plan 照算）。
- PAT dispatch 权限前置核查（评审 P2-2）：classic PAT repo scope 含 workflow dispatch；fine-grained 需 Actions:write。上线顺序 = 合并后先 kill switch 开着跑一个定时周期验证 plan 产出与 artifact，再由运维确认 PAT scope 后清掉 var 启用。dispatch 步对 PAT 缺 scope fail-closed（步失败、run 红、artifact 保留）。
- timeout 30 → 35。

### refresh workflow 改动（single-flight 闸）

- 新增前置 `gate` job（无 checkout/deps，仅 gh + github.token 读 open PR，模式与 ga4 publish 步一致）：`gh pr list --repo "$GITHUB_REPOSITORY" --state open --json headRefName` → headRefName 命中 `^rest-upstream-refresh/<lower(slug)>-[0-9a-f]{7,40}$` → 输出 `proceed=false` + notice；否则 `proceed=true`。
- `refresh` job 加 `needs: gate` + `if: needs.gate.outputs.proceed == 'true'`（闸在模型阶段之前，省掉整条付费链路；避免重复付费 run 与 non-FF push 失败/孤儿分支）。
- 人工逃逸：关闭 open PR，次日 watchdog 自动重开（不加 force 输入，与 ga4 同构）。

### 配套

- `scripts/docs-workflow/watchdog-known-issues.json`：改写 `rest-upstream-drift-backlog`（fix path=watchdog 自动 dispatch；digest 只报 dispatch/PR/run 状态，仍然绝不手动触发）；补两条 known 行为说明：pin-bump-only PR 走 ledger deferred（非静默丢失）、land 步 no-op 守卫不可达。
- 测试矩阵：paths 已覆盖（`scripts/rest-upstream/**` + 两个 yml），但 **focusedTests 是显式清单** → 新测试文件必须显式加入 `rest-upstream-pipeline` 行的 focusedTests，否则 selector union 静默漏跑（历史上踩过两次）。
- 新测试：`scripts/rest-upstream/dispatch-refresh.test.js`（plan 判定/验证拒绝/dispatcher 注入/分支正则含前缀碰撞阴性/近失败窗口/execute 时 pin 重查/token fail-closed）；`scripts/rest-upstream/dispatch-linkage-workflow.test.js`（watchdog：dispatch 步位于 upload 前、kill switch 闸、PAT 用法、permissions 不变、全文无 git push、timeout；refresh：gate job 先行、refresh job needs/if、闸正则、既有分支命名不变）。
- `runbook/rest-reference-pipeline.md` 补联动一节（触发条件、single-flight、kill switch、首日行为）。**该页在矩阵映射到 replay-infrastructure 面**（评审 P2-4 实测）：selector union 含 `pnpm test:replay:contract`/`pnpm test:replay:all`，按 union 全跑，不做豁免。

### 不采用的替代方案（记录理由）

- **合并为单 workflow / workflow_call 矩阵扇出**：refresh 独立 run 的 evidence artifact 命名（`rest-upstream-refresh-<run_id>`）、按源 concurrency、失败隔离、日报按 workflow 名读 run——合并全部要重接；3h 级 refresh 腿混入 watchdog run 会破坏其"廉价只读扫描"的日报语义。
- **ga4 式 issue_comment 回复执行器**：rest-upstream 不需要——评审决定（stance/ledger reclassify/描述修正）直接以 PR commit 落，没有需要回填的 conf 类结构化产物。
- **GITHUB_TOKEN + actions:write dispatch**：可行（workflow_dispatch 是 GITHUB_TOKEN 事件例外），但会动 permissions 块；PAT 通道已是仓库既定模式（Gate 10）。

## 验证配方（AGENTS.md）

- `pnpm test:for-change -- .github/workflows/rest-upstream-drift-watchdog.yml .github/workflows/rest-upstream-refresh.yml scripts/rest-upstream/dispatch-refresh.js` → union 全跑（含新 focusedTests 行）。
- `pnpm test:rest-publication-contract`、`pnpm test:workflow-policy`、`git diff --check`。
- 不涉 replay 套件（rest-upstream 无 retained-artifact replay 面，hermetic 套件即其闸）。
- 实弹验证不先烧模型费：用 11-08 watchdog artifact 本地跑 `--execute` 的 dry-run（plan 应含两源）；首个 live dispatch 交给上线后的 04:17 UTC 周期（或 kill switch 默认开保守：先关、人工 dispatch 一次验证后开 var）。

## 风险与首日影响

- 上线首个周期自动开 2 个 draft PR（两源当前都在漂移）——正是日报连日提醒的积压，符合预期；不想首日清积压就用 kill switch 延后。
- 成本：单源 refresh ≈10-20 分钟 + 翻译网关费用；single-flight + substantive>0 + 日频自然收敛（稳态=只在真有结构性漂移时付费，至多 2 dispatch/天）。
- refresh 失败（如网关瞬态）：次日 watchdog 自然重试（24h backoff），失败 run 被日报看见。
- digest automation（automation-94889097）的 prompt 在本 PR 合并后需 CronUpdate：补"refresh 已自动 dispatch，日报改报 dispatch/PR 状态"。

## 明确不做

- 不改 refresh 管线内任何模型阶段/assembler/applier 逻辑。
- 不加 lifecycle_track 自动化（track 采纳是人工决策；auto lane 恒传空）。
- 不加 force 输入、不改分支命名（single-flight 后碰撞需人工才能复现；如要彻底免疫可后续给分支加 run-id 后缀，本期不做）。
