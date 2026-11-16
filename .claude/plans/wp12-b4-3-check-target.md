# WP12-B4.3 目标 Check 接入 — 短实施计划

**目标.** 为新的 `json-field-overview` 内容 Draft PR 在签名提交 S 上显示专用验证 Check，并保留可认证的 output/receipt。范围限定单页、手动入口。

**基线.** 上游 `zilliztech/zdoc@bf29522ee9f957d0a46519ca43cabb9ed592453a`（含 #1250 离线验证 + #1265 只读报告）。开工时重新记录真实 base/head。

## 1. 固定受信工具与认证证据

- 从受信 M checkout 用 esbuild 构建 `writer-contract.ts`，候选 K、seal S、producer 归档、PR 内容全部当数据读取（复用 #1265 `report.mjs` 的 `verifyArchive` + `createRemoteReads`）。
- **producer 认证**：复用 #1265 的 `ApprovedProducerDefinition` 登记（`reviewed-producer.json`），`readRun`/`readArtifact` 认证 run/attempt/event/workflow/actor/definition/归档摘要。
- **新鲜度**：复用 #1250 的 `freshnessReport`（report.mjs 已导出），独立读 zdoc master/dev + Milvus v3.0.x（`readRef` + `readFixedGitHubRef`）。
- **#1236 是历史反例**（master/dev/source 均已过期）；正常样例从最新 M 走 discover→prepare→write 生成新 K/S、六成员归档和 producer 登记，使 producer/validator/intent 的 M 一致。

## 2. 先预留、再验收（Check 生命周期）

1. **预留**：完成输入与 seal 检查后，对 S `POST /check-runs`（`status=in_progress`），读回真实 check/suite/App ID（用 Check App 凭据）。
2. **validator**：用这些 ID 调 `formalValidation` 的 `receipt` op 编码 `output.json` + `receipt.json`，上传归档，成功结束。
3. **finalizer（独立）**：认证 validator 的 completed run/attempt + 原始归档 + 重读 PR 当前 head 与关键 refs + in_progress Check，调 `prepublish`（`inspectReservedValidation`）→ `ready-to-publish`；`PATCH /check-runs/{id}` 置 success；读回实际完成态后调 `accept`（`acceptExactValidation`）→ `accepted`。

M 上的 workflow suite 与 S 上的目标 suite 分别绑定（`prepublish` 需真实 in_progress Check + 成功 validator；`accept` 需 completed Check）。Check 的 head 必须等于 S。

## 3. 注册与权限

- 真实 workflow ID、定义摘要、actor、Check App ID/name 固定于受信 master 的登记文件；#1265 样本里的 validator 占位 ID/摘要仅用于只读报告，本片替换为真实值。
- 凭据：读取用 job token（`contents:read` + `actions:read` + `pull-requests:read` + `checks:read`）；仅预留/完成 Check 的受信步骤用 Check App 安装 token（`checks:write`）。
- 先核对现有凭据与运行方式（App 身份、安装、token 作用域）再实施。

## 4. 文件、selector 与隔离仓库验证

**拟改文件**
- `packages/docs-tooling/src/shared-docs/adapters/updates/remote-github.ts` — 新增 Check mutation capability（`POST /check-runs` 预留、`PATCH /check-runs/{id}` 完成），URL allowlist 精确放行该两端点。
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
