# 运维知识沉淀三件事:仓库内已知问题账本 + digest 增强 + README SOP 补缺

## Context

dashboard 讨论的结论:现有运维闭环(9 个 watchdog + 每日 11 点 digest 自动化 + agent 会话 + runbook)已经工作,不建 dashboard。真正要做的是把知识固化:

1. **已知问题账本**目前只在 `.zcode/watchdog-digest-baseline.md`(gitignored、单机、只有 agent 读得到)→ 搬进仓库变成可评审的机器可读资产。
2. **每日 digest 缺两块机械性数据**:生产队列(`docs-production-dev`)占用状态 + 昨日各工作流成功率统计 → 用一个仓库脚本承载,人和自动化都能按需跑。
3. **README SOP 缺口**:GA4 控制台人工定期复核流程、UAT→prod 镜像验证/提升路径(`deploy/contracts/verify-image.mjs` + `release.schema.json` + `evidence/{uat,prod}-records.json` 这套契约工具在 README 零文档)。

关键约束(已核实):`README.md` 在矩阵 `replay-infrastructure` 条目;**新增文件路径必须登记矩阵**否则是 gap;README 只能文档化仓库内真实存在的命令/接口。

## 交付物

### PR 1:账本 + 统计脚本 + 矩阵登记 + digest 文档(从 origin/master 拉 worktree,置于 `.claude/worktrees/`)

**1. `scripts/docs-workflow/watchdog-known-issues.json`(新增)** — schemaVersion 1,把 `.zcode/watchdog-digest-baseline.md` 全部 8 个 watchdog 的内容结构化迁移:
- 每条 watchdog:`workflow`(文件名)、`schedule`、`fetchMethod`(取数通道,如 broken-links 只能抠 job 日志、rest-upstream-drift 结论恒 success 须读 artifact 的 `watchdog-report.json`)、`steadyState`(如 product-doc-links broken=15 即健康)、`knownIssues[]`(id/status: `known-expected|in-progress|resolved|watch`/symptom/classification/action/evidence;15 条"勿报"清单保留)、`history[]`(闭环事故叙事,如 #889 pin 回退、product-doc-links token 事故)。
- 顶层 `productionQueueWorkflows`:5 个 `docs-production-dev` 成员文件名。
- **易变数值(drift 的 substantiveCount/diffDigest 等每日变动)不进仓库**——留在本地状态文件 `.zcode/watchdog-digest-state.json`(自动化读写),账本只存规则、状态与阈值。

**2. `scripts/docs-workflow/daily-ops-summary.js`(新增)** — 零依赖 Node,house 风格对齐 `print-workflow-groups.js`:
- `--markdown`(默认)/`--json`;`--window "A..B"`(默认昨日本地自然日)。
- 取数:`gh run list --repo zilliztech/zdoc --created "<window>" --limit 300 --json ...` 单次拉全量,本地聚合。输出三节:① 生产队列快照(5 个队列成员 + translate-codex producer 的 in_progress/queued run 及等待时长)② 各工作流昨日统计(runs/成功/失败/取消,失败 run 附链接)③ 账本内 watchdog 的 run 计数核对(昨日无 run 的标出)。
- `--validate-ledger` 模式:schema 校验 + 引用的 workflow 文件存在 + status 枚举合法(digest 消费前先跑,fail-closed)。
- 聚合函数 export 供测试。

**3. `scripts/docs-workflow/daily-ops-summary.test.js`(新增)** — `node --test`,fixture 驱动:健康窗口/队列被占窗口/watchdog 失败/账本校验报错四个场景。

**4. 矩阵登记** — `scripts/docs-workflow/test-matrix.json` 新增条目 `ops-digest-tooling`(paths: 上述两文件 + 测试;focusedTests: `node --test scripts/docs-workflow/daily-ops-summary.test.js`;gates: `pnpm test:workflow-matrix` + `pnpm test:workflow-policy` + `git diff --check`);同步人类可读规格 `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md` 加一行。

**5. README 新小节**(放在 runbook 的 "Feishu progress cards" 之后):"Daily ops digest and the watchdog known-issues ledger"——digest 覆盖面、账本位置与更新方式(状态变更走评审提交;每日易变数值存仓库外的本地状态文件)、按需运行 `node scripts/docs-workflow/daily-ops-summary.js --markdown`。README 不引用 `.zcode` 路径(单机目录)。

### PR 2:README SOP 补缺(纯 prose)

**6. Analytics 节新增小段** "Periodic GA4 console reconciliation":月度循环——GA 控制台 404 占比/Top 页 vs 每日 ga4-search-404 报告核对;ja 镜像覆盖审计(en/zh conf 的 exact-match 301 规则数对比,ja 404 多为规则缺口而非页面缺口);探测目标页须看 `<title>`(.com 对不存在路径回 SPA 壳的假 200 坑);产出喂给已文档化的 nginx 301 修复路径。不写历史具体数字。

**7. Containers 节新增小节** "Release verification (UAT → production)":Jenkins 前置证据规则交叉引用(L463);`scripts/doc-publish-bot` 作为仓库内触发接口(参数面按 `publishRequest.js` 实际形状:zilliz-docs-dev 的 BRANCH、zilliz-docs-prod 的 BRANCH+image_tag);`deploy/contracts/verify-image.mjs` + `release.schema.json` + `evidence/{uat,prod}-records.json`、`resolved-images.json` 验证流;镜像标签 `ZDOC_SHA`/`JENKINS_BUILD_ID` 含义。**实施时先读 verify-image.mjs 真实 CLI 再写,不发明参数**。

### 合并后(仓库外,本工作区)

**8. CronUpdate digest 自动化**(automation-94889097,保持每天 11:00):新 prompt = 先 `--validate-ledger` 校验仓库账本 + 读本地 `.zcode/watchdog-digest-state.json`(易变数值,取代写回 md 基线)→ 内嵌 `daily-ops-summary.js --markdown` 输出作"队列与统计"新章节 → 保留三段式 watchdog 详述规则;账本状态变化只改工作副本并报告"未提交,请审后提交",**永不 commit、永不 dispatch 付费/写操作**。
**9. 旧 `.zcode/watchdog-digest-baseline.md`** 加弃用指向头,保留归档(单机文件,不动 git)。
**10. 飞书推送**:默认暂不接(用户未拍板);后续要开只需在自动化 prompt 尾部加一步 lark 发送(默认发个人),零代码改动。

## 执行顺序

worktree 从 origin/master 切分支 → PR 1(文件 1-5)→ PR 2(文件 6-7,可并行准备、串行合并)→ master 合并后本地 checkout 同步 → 步骤 8-9。当前分支 `fix/redirect-ja-mirror-spa-derived-map` 不动。

## 验证

- **PR 1**:`node --test scripts/docs-workflow/daily-ops-summary.test.js`;`pnpm test:workflow-matrix`;`pnpm test:workflow-policy`;`git diff --check`;`pnpm test:replay:contract`(README/spec/矩阵文件变更命中 replay-infrastructure 条目)。矩阵 union 还列了 harness `pnpm test:replay:all`——本地跑不完时明确说明未跑、由 CI replay 闸兜底。冒烟:`node scripts/docs-workflow/daily-ops-summary.js --validate-ledger` + `--markdown`(真连 gh)。
- **PR 2**:同 replay-infrastructure 条目命令(contract + matrix + policy + diff --check),同上 harness 说明。
- **合并后**:手动触发一次 digest 验证新 prompt 端到端(读账本→脚本输出→三段式→状态写回 .zcode)。
- 全程不 dispatch 生产 workflow、不动真实 dev、不触发付费 Translation。