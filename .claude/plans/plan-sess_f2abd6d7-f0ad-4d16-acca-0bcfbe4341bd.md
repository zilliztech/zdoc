# 优化 `Generate selected shared Guides sources` 步骤（29m39s → 预计 6–9min）

## Context

Run 42082394809 中 en 的该步骤耗时 29m39s。根因是每个成功页（74 页，约 21s/页）的重放证明 `regenerateReceipt` 里：`hydrate()` 逐文件 `git show` 子进程（每页 1041 个 spawn，约 13–17s/页）；`verifyInventory` ×4 + `assertToolIdentity` 的 `gitInventory` 每页对完全相同参数重复全树 blob 读取+SHA-256（85 页只有 18 个不同 lock commit 对）；`assertToolIdentity` 还对 ~50 个 require.cache 的 lark 模块逐个 `git show`。

目标：**纯 I/O 等价重排**，不改变 fail-closed 语义、回执证据链形状、任何工作流 YAML。zh 侧跳过是 `if: inputs.site == 'en'` 设计闸，不动。

## 改动（4 项，全部落在已有文件）

1. **`gitInventory` 记忆化** — packages/docs-tooling/src/lark/sharedPageFetch.js:30-48：模块级 Map，key=`root\0commit\0paths`，只缓存成功结果；自动消掉 verifyInventory/assertToolIdentity/lockedInventory/prepareSharedSources 的重复调用。不缓存读活工作树的检查。
2. **`hydrate` 批量化** — guides-shared-regeneration.js:62-70,107-108：逐文件 `git show` 改为每树一次 `git archive <commit> -- <roots>` 管道给 `tar -xf -`（复用 replay-shared-pages.js:456 模式）；提取后保留逐文件 SHA-256 fail-closed 校验 + 文件集合一致性断言，错误形状保持 `PUBLISH_REGEN_MISMATCH` detail 不变。
3. **`assertToolIdentity` 模块字节比对批量化** — guides-shared-regeneration.js:50-53：~50 次逐模块 `git show` → 一次 `cat-file --batch`；活文件 fs 比对保持逐次（现有脏树双调用测试钉住）。
4. **每页阶段耗时日志** — guides-shared-sources.js 主循环：`[shared-regen] page=<page> build=<s>s regen=<s>s activation=<s>s`。

明确不做：跨页共享 hydrated dev 树、跳过第二次 runBuild、activation 前置、任何工作流 YAML 改动。

## 测试与验证

- 新增聚焦测试（现有 node:test 文件内）：hydrate 批量==逐文件参考字节；digest 不匹配 fail-closed 同形状；`gitInventory` 记忆化正确性（新 commit 重算）。
- 保持绿的现有钉子：PUBLISH_REGEN_MISMATCH 变异矩阵、冷/热字节一致 bundle、脏树双调用、checkpoint 离线校验。
- 验证命令：`pnpm test:for-change` 确认 union 无缺口，然后跑全量：guides-shared-sources/regeneration/collect-build-card-notes node --test、fetch-build.test.ts、test:guides-workflow、test:replay:fetch、test:replay:shared-pages、test:shared-docs、typecheck、test:workflow-policy、test:workflow-matrix、git diff --check。
- 真实工件验证：用 run 42082394809 已下载产物输入本地重跑 generate 循环，改动前后各一次，实测提速 + 字节一致。

## 落地机制

- 在 `.claude/worktrees/shared-regen-io-batching` 建新分支 `feat/shared-regen-io-batching`（origin/master 基），worktree 内 `pnpm install --frozen-lockfile`，确认 `apps/docs/node_modules/jiti` 存在；PR 走 master。