# WP12-B4.3 生产 GitHub Check 接入 — 短实施计划

**目标.** 让验证器从受信 master 运行，认证 `schedule` 触发的真实 producer，把候选提交（candidate K / seal S）当数据读取，将预留 Check、验证回执和最终结果绑定到 PR 当前的签名提交。范围限定 `json-field-overview` 单页。

**基线.** 上游 `zilliztech/zdoc#1250`（离线验证器，head `10fab106`）当前 Ready、尚未合并；`origin/master` 为 `0b8d8e1afd`。本计划的 review-base 取 `0b8d8e1afd` 并合入 `10fab106`，代表「master + #1250」。上游 #1250 合并后以真实 merge SHA 为准。

## 1. schedule producer 的认证

历史样例：run `43170134677`，attempt 1。证据来源与核验值如下（全部可由只读 adapter `remote-github.ts` 复现）：

| 事实 | 值 | 证据来源 |
|---|---|---|
| 仓库 | `zilliztech/zdoc`，ID `660446555` | `GET /repos/zilliztech/zdoc`（`id`/`full_name`） |
| run/attempt | `43170134677` / `1` | `GET /actions/runs/43170134677/attempts/1`（`id`/`run_attempt`） |
| 触发事件 | `schedule` | 同上（`event`） |
| workflow | `shared-guides-update.yml`，workflow_id `414826845` | 同上（`workflow_id`/`path`） |
| workflow 定义 | SHA-256 `d3b99cdf…` | workflow 文件在 master `64ca5bae05` 的原始字节重算 SHA-256（`readRun` 的 `run()` 已做） |
| 完成状态 | `status=completed`，`conclusion=success` | 同上 |
| 触发 actor | `105278390`（`liyun95`，schedule owner） | 同上（`actor.id`） |
| head_sha（tools） | `64ca5bae05`（master） | 同上（`head_sha`） |
| 归档 | artifact `13923258931`，ZIP SHA-256 `b0dbe106…` | `GET /actions/runs/43170134677/artifacts` + `GET /actions/artifacts/13923258931/zip`（digest + 下载重算） |

**需修改的契约。** `core/updates/remote.ts:52` 的 `IdentitySchema.event: z.literal('workflow_dispatch')`。它经 `IdentitySchema.shape` 流入 `runShape` → `ProducerRunFactSchema`/`ValidatorRunFactSchema`（第 78–81 行）与 `ApprovedProducerDefinitionSchema`（第 234 行）。上一片保留真实 `schedule` 值时，`acceptExactValidation` 里 `RemoteFactsSchema.parse` → `ProducerRunFactSchema` 拒绝 `event:'schedule'`，抛出 `FACTS_MALFORMED`。最小修改：`event: z.enum(['workflow_dispatch','schedule'])`；producer run fact 与 `ApprovedProducerDefinition` 携带 `event:'schedule'` 后，`remote-github.ts` 的 `run()`（`raw.event !== identity.event`）与 `remote-transaction.ts:449` 的 `stripRun`（透传 `event`）即一致。

**注册。** 需新增一条 `ApprovedProducerDefinition`（`protocol:'shared-update-producer-v1'`）绑定该 schedule producer：`tools=64ca5bae05`、`workflowId=414826845`、`workflowPath=shared-guides-update.yml`、`workflowDefinitionSha256=d3b99cdf…`、`actorId=105278390`、`event='schedule'`。与既有 `reviewed-scheduled-fetch.json` 只登记 Fetch producer 不同，shared-guides-update 的 schedule producer 尚无注册，须由受信入口（策略/注册表）提供，不读候选内容。

**身份区分（要点）。** run actor `105278390`（schedule owner）≠ 提交 author `41898282`（`github-actions[bot]`）≠ 平台 signer `19864447`（`web-flow`）。`writerActorId`（PR 作者）保持 bot，`producer.actorId` 是 run 触发者。schedule owner 会随 cron 编辑变化，是否固定 `105278390` 属策略裁决，写入计划、不默认放宽 actor 检查。

## 2. 从受信 master 运行验证器 + Check 绑定

现有 `remote-transaction.ts` 的 `authenticateValidation`（第 433 行）已组装完整 `RemoteFacts`（`readRun`/`readArtifact`/`readChecks`/`readRef`/`readPull`）并调 `acceptExactValidation`。本片在其上补 schedule 事件与 report-only 入口，不改事务写路径。

步骤与最小权限（`GITHUB_TOKEN` = job token；Check 用独立 App token）：

1. **读受信 master（M）。** `contents: read`，checkout `refs/heads/master`，用 `writer-contract.ts` 的 esbuild bundle 从 master 构建验证契约（与 writer 同法）。
2. **读候选为数据。** `readCommit(K)`/`readCommit(S)`、`readPull`、`readRef('master'/'dev')`、`readRun(producer/validator)`、`readArtifact`、`readChecks(S)` —— 全部 `actions: read` + `pull-requests: read`；不 checkout、不执行候选。
3. **组装 facts + 预留 Check。** 先 `formalValidation({op:'prepublish', …}, {repositoryId:660446555})` → `inspectReservedValidation`（`check status='in_progress'`）→ `ready-to-publish`；再以 Check App token `POST /repos/zilliztech/zdoc/check-runs`（`checks: write`）预留 `in_progress` Check，记录 check/suite ID。
4. **产回执。** `formalValidation({op:'receipt', …})` 编码 `ExactValidationReceiptV1`，作为 validator archive 成员（`receipt.json` + `output.json`）。
5. **完成 Check。** `formalValidation({op:'accept', …})` → `acceptExactValidation`（`check status='completed', conclusion='success'`）→ `accepted`；再以 App token `PATCH /check-runs/{id}` 更新为 `success`。绑定到 S：Check 的 `head_sha=S`、`app.id=checkAppId`、`name=checkName`，与普通 `shared-docs-validate` 绿勾区分。

**最小权限汇总.** job token：`contents: read`（读 master/候选对象）、`actions: read`（读 run/artifact）、`pull-requests: read`（读 PR）；Check App：`checks: write`（预留 + 更新）。本片不授 `contents: write`/`pull-requests: write`/`actions: write`。

## 3. 验证场景与停止位置

| 场景 | 预期结果 | 停止位置 |
|---|---|---|
| 正常输入 | `receipt`→encoded，`prepublish`→ready-to-publish，`accept`→accepted，Check=success | 全绿 |
| master 移动 | `STALE_MASTER` hold | `checkInputs`（`freshness`），不预留/不更新 Check |
| dev 移动 | `STALE_DEV` hold | 同上 |
| 上游（Milvus v3.0.x）head 移动 | `STALE_SOURCE` hold | 同上 |
| producer 重跑（不同 run/attempt） | `PROVENANCE_AMBIGUOUS_OR_MISSING` 或 `PRODUCER_AMBIGUOUS_OR_MISSING` | `authenticateValidation` / `acceptExactValidation` |
| 同 App 的其他 Check（不同 name/suite/head） | `CHECK_AMBIGUOUS_OR_MISSING` / `CHECK_*` 绑定失败 | `checkExactValidation` |
| 验证期间 PR 换 head（S→S'） | `PR_HEAD` / `PR_TARGET_CHANGED`（重读 PR head 比对） | 重读后 hold，不更新 Check |

**报告方式.** 默认 report-only：产出验证回执 + 报告，不落 Check（`targetCheckPublished=false` 形态）。真实 Check 预留/更新仅在手动获准后执行；定时启用留待后续。

## 拟改文件

- `packages/docs-tooling/src/shared-docs/core/updates/remote.ts` — `IdentitySchema.event` 放开 `schedule`。
- `packages/docs-tooling/src/shared-docs/testing/updates/remote.test.ts` — schedule 事件的 run fact/definition 正例 + 旧 `workflow_dispatch` 正例保留。
- `packages/docs-tooling/src/shared-docs/adapters/updates/remote-github.ts`（若需）— `run()` 对 schedule producer 的 definition 匹配已存在，仅补测试。
- 新增 schedule producer 注册（策略/注册表，随实现定位；不读候选内容）。

生产 workflow、分支保护、冻结 v1 envelope、Check 写 mutation 均不在本片实现范围。

## selector 对应测试

```
pnpm test:for-change -- \
  packages/docs-tooling/src/shared-docs/core/updates/remote.ts \
  packages/docs-tooling/src/shared-docs/testing/updates/remote.test.ts
pnpm vitest run packages/docs-tooling/src/shared-docs/testing/updates/remote.test.ts
# 最终 HEAD
pnpm test:for-change -- --base review-base/wp12-b4-3-check --head HEAD
pnpm test:shared-docs && pnpm typecheck && pnpm test:workflow-matrix && git diff --check
```

## 手动 report-only 验证步骤

1. 用 #1236 真实归档（run `43170134677`/artifact `13923258931`）离线重放三操作：历史 pinned 观察 → encoded/ready-to-publish/accepted；当前观察（master/dev 前进）→ `STALE_MASTER`+`STALE_DEV`。历史 #1236 只用于重放，不回填 Check。
2. 以真实 schedule producer 定义跑 `readRun(producer)`，确认 `event:'schedule'` 通过 `run()` 与 `stripRun`，不再 `FACTS_MALFORMED`。
3. 构造同 App 异 Check、producer 重跑、PR 换 head 的负例 fixture，逐条确认停止码。
4. report-only 入口跑通（不写 Check），保留证据；真实 Check 预留/更新与定时启用待主审裁决。

## 边界与后续

本片停在计划评审。生产 Check 写 mutation、分支保护中把 Check 设为合并条件、定时启用，均留待后续裁决。`schedule` 的 actor 固定策略、check app/name 的生产取值随激活时由主审给定。
