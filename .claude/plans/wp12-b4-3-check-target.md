# WP12-B4.3 目标 Check 接入 — 短实施计划

**目标.** 为新的 `json-field-overview` 内容 Draft PR 在签名提交 S 上显示专用验证 Check，并保留可认证的 output/receipt。范围限定单页、手动入口。

**基线.** 上游 `zilliztech/zdoc@bf29522ee9f957d0a46519ca43cabb9ed592453a`（含 #1250 离线验证 + #1265 只读报告）。开工时重新记录真实 base/head。

## 1. 固定受信工具与认证证据

- 从受信 M checkout 用 esbuild 构建 `writer-contract.ts`，候选 K、seal S、producer 归档、PR 内容全部当数据读取（复用 #1265 `report.mjs` 的 `verifyArchive` + `createRemoteReads`）。
- **producer 认证**：复用 #1265 的 `ApprovedProducerDefinition` 登记（`reviewed-producer.json`），`readRun`/`readArtifact` 认证 run/attempt/event/workflow/actor/definition/归档摘要。
- **新鲜度**：复用 #1250 的 `freshnessReport`（report.mjs 已导出），独立读 zdoc master/dev + Milvus v3.0.x（`readRef` + `readFixedGitHubRef`）。
- **#1236 是历史反例**（master/dev/source 均已过期）；正常样例从最新 M 走 discover→prepare→write 生成新 K/S、六成员归档和 producer 登记，使 producer/validator/intent 的 M 一致。

## 2. 先预留、再验收（两次独立手动 run）

架构修正（按主审裁决）：

1. **finalizer 是另一次 workflow run。** 第一次手动 dispatch（`validate`）预留 Check、validator 编码回执并归档，整次 run 结束（`completed/success`）。第二次手动 dispatch（`finalize`）独立验收。finalizer 若与 validator 同 run，`readRun`/`checkExactValidation` 永远不满足「validator 整次 run 已完成」。
2. **Check 写入走独立受限 adapter。** 保留现有 `createRemoteTransport`/只读接口及其写拒绝；新增 `createCheckWriter` 仅放行「在已认证仓库/seal 上预留」与「完成读回的那一条 Check ID」两个操作，绑定 App/name/head/suite 与 request/validator attempt，无自动重试，未知结果只读核对。
3. **优先 job-scoped `GITHUB_TOKEN`。** 登记 App ID `15368` 即 GitHub Actions；预留/finalize 用带 `checks:write` 的 `GITHUB_TOKEN`，validator 只读。核验返回的真实 App 身份；`workflow_dispatch` actor 与 bot writer/signer 身份分开固定。

**流程**
1. `validate` run：读 M 构建工具 → 认证 producer 归档 → 输入/seal 检查 → `createCheckWriter.reserve(S)` 读回真实 check/suite/App ID → `formalValidation` 的 `receipt` op 用这些 ID 编码 output/receipt → 归档 → 成功结束。
2. `finalize` run：认证 validator 的 completed run/attempt + 原始归档 + 重读 PR head 与关键 refs + in_progress Check → `prepublish`（`inspectReservedValidation`）→ `ready-to-publish`；`createCheckWriter.complete(id)` 置 success；读回后 `accept`（`acceptExactValidation`）→ `accepted`。

M 的 workflow suite 与 S 的目标 suite 分别绑定；Check head 必须等于 S；validator job 结束但整次 run 仍 in_progress 时 finalizer 必须 hold。

## 3. 注册与权限（身份 bootstrap）

- 真实 workflow ID、定义摘要、actor、Check App ID/name 固定于受信 master 的登记文件；#1265 样本里的 validator 占位 ID/摘要仅用于只读报告，本片替换为真实值。
- **Check App = GitHub Actions（ID `15368`）。** 预留/finalize job 用 job-scoped `GITHUB_TOKEN`（`checks:write`），validator 只读（`contents:read` + `actions:read` + `pull-requests:read` + `checks:read`）。核验 API 返回的真实 App 身份；`workflow_dispatch` actor 与 bot writer（`41898282`）/signer（`19864447`）分开固定。
- **登记顺序**：新 workflow 首次获得真实 workflow ID 与已审原始定义摘要后，随受信 master 登记；fresh producer run 由受信 adapter 的 `readRun`/`readArtifact` 认证，不接受候选自报 policy 或把提交自身 SHA 烤进登记。历史登记只认证历史 run；登记缺失 → `held`，输出显式 install/register/validate 顺序。生产登记与运行交主会话裁决。

## 4. 文件、selector 与隔离仓库验证

**拟改文件**
- `packages/docs-tooling/src/shared-docs/adapters/updates/remote-github.ts` — 新增 `createCheckWriter` 受限 adapter（仅 `POST /check-runs` 预留 + `PATCH /check-runs/{id}` 完成，绑定仓库/提交/Check ID/App 身份），复用 transport 的固定 host/TLS/代理独立/重定向拒绝/截止/大小上限；不扩展只读 transport 的写拒绝。
- `packages/docs-tooling/src/shared-docs/adapters/updates/remote-transaction.ts` — 复用/扩展 `authenticateValidation` 组装 facts 并接 `prepublish`/`accept`。
- `scripts/docs-workflow/shared-guides-update/` — 新增 `validate.mjs`（validator）与 `finalize.mjs`（finalizer）只读入口，复用 `formalValidation`。
- `.github/workflows/shared-guides-validate.yml`（新）— 手动 dispatch：预留→validator→finalizer 三 job。
- 登记文件（validator/finalizer workflow ID、定义摘要、actor、Check App）随受信 master 固定。
- 测试：`remote-github.test.ts`（Check mutation）、`remote.test.ts`（prepublish/accept 生命周期）、`formal-validation.test.ts`（成功顺序 + 反例）、新增 workflow/脚本测试。

**selector 与测试**（预计）
```
pnpm test:for-change -- --base <review-base> --head HEAD   # 覆盖 shared-docs + shared-guides-upstream-update
pnpm test:shared-docs && pnpm test:shared-guides-update && pnpm typecheck
pnpm test:workflow-matrix && pnpm test:workflow-policy && git diff --check
```
覆盖反例：候选脚本注入、伪造回执、错误签名/目标提交、错 App/name/suite、producer/validator 重跑、Check 查询失败、过期 M/D/source、PR 并发换 head、丢响应、重复执行、多条匹配 Check、部分执行终止，保留原始失败与关联证据。

**隔离仓库验证**（先隔离，后由主会话裁决生产单次验证）
- 在隔离仓库跑正常结果：预留→validator→finalizer→读回，Check 从 in_progress 到 success，`accept` 得到 `accepted`。
- stale 停止：master/dev/source 任一改变、PR 换 head、错误 attempt、同 App 异 workflow/Check、缺失/篡改归档均在成功发布前停止。
- 未知 mutation 结果：只读核对，不按相同参数重发；取消后记录终态。

## 边界与后续

本片停在计划评审；生产手动运行与后续定时启用是单独操作裁决。多页发现、滚动更新、分支保护把 Check 设为合并条件、真实生产身份定值均不在本片。冻结 v1 envelope 不改。
