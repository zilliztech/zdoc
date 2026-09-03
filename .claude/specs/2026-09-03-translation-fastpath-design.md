# Translation fast-path 预检设计（Phase 1）

该脚本是本地、失败关闭的验证器：发现翻译 diff，要求新鲜 origin/dev 基线，检查 locale/范围/生命周期/ownership，必要时生成 zh-CN Reference manifest，执行 selector 返回的全部命令，并写入 tmp/translation-fastpath/<timestamp>/。绝不 commit、push、PR API、在线 Translation、写真实 dev 或获取 docs-production-dev。

## 已确认契约

- Selector 为 scripts/docs-workflow/select-tests-for-changes.js，入口 pnpm test:for-change，支持 --json，返回 files、branchPolicies、areas、focusedTests、harnesses、gates、ordered commands。优先解析 JSON；失败关闭。
- Ownership 由 deploy/contracts/master-tooling-sync.json 决定，顺序 candidateDerivedPaths -> masterAuthoritativePaths -> devOwnedPaths -> master-tooling。仅接受 dev-published-state -> dev；唯一 candidate-derived 是 deploy/contracts/localization-inputs.inventory.json。
- ja-JP Guides 仅接受既有 i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/** 与 docusaurus-plugin-content-docs-byoc/current/tutorials/** 文件修改；新增/删除/重命名及全部 Reference 拒绝，不假设日文 manifest。
- zh-CN 仅接受已有 content/zh-CN/reference/** 中非 api/restful 且有英文 source 映射的文件；REST、Guides、其他 locale、无关文件拒绝。
- Reference CLI 为 reference-manifest（固定 source/target/source-commit，--write），随后 validate-reference --site en 与 --site zh-CN；status 只允许 translated|unchanged|retired。
- Inventory 生成前保存字节与存在性，运行 pnpm generate:localization-input-inventory 后比较并恢复；变化 => BLOCKED_CANDIDATE_DERIVED_CHANGE，生成失败 => VALIDATION_FAILED。

## 执行顺序

1. 解析 --locale (ja-JP|zh-CN)、可选重复 --path，拒绝未知/不安全参数。
2. git fetch origin dev；解析 BASE_DEV_SHA=origin/dev 并证明 HEAD 基于它；失败 => INVALID_BASELINE。
3. 用 no-renames diff 与 status 发现变更；拒绝 A/D/R、非白名单或无关文件，不清理用户修改。
4. 调用 pnpm test:for-change -- --json <all-changed-paths>；拒绝 unmapped、非 dev-published-state、candidate-derived、master exception。
5. 运行 inventory 预检并恢复/阻断。
6. zh-CN 非 REST Reference 调用 reference-manifest --write；失败 => MANIFEST_GENERATION_FAILED。
7. 重跑 selector，按原顺序执行 commands。每条记录完整命令、开始/结束、退出码、signal/timeout、stdout/stderr、logPath、passed/failed；任一失败/超时/中断/未执行 => VALIDATION_FAILED；不硬编码列表。
8. 要求 selector 返回的 git diff --check 并复核最终允许路径/生成文件。
9. 再次 fetch origin/dev，得到 LATEST_DEV_SHA；变化 => REBASE_REQUIRED，fetch 失败 => INVALID_BASELINE。
10. 写 report.json/report.md，输出唯一 READY_FOR_PR=true 或 STATUS=<state>；仅 READY 退出 0。

## 失败状态表

| 状态 | 含义 | 退出码 |
| --- | --- | ---: |
| READY_FOR_PR | 全部检查和漂移检查通过 | 0 |
| INVALID_BASELINE | fetch、SHA 或 ancestry 无法证明 | 2 |
| INVALID_SCOPE | locale/范围/生命周期或无关变更 | 3 |
| UNMAPPED_PATH | selector 无矩阵匹配 | 4 |
| UNSUPPORTED_LOCALE_REFERENCE | ja-JP 或其他不支持的 Reference | 5 |
| BLOCKED_CANDIDATE_DERIVED_CHANGE | inventory 字节变化 | 6 |
| MANIFEST_GENERATION_FAILED | manifest 工具/产物失败 | 7 |
| VALIDATION_FAILED | selector 命令失败、超时、中断、缺少必需 validation 或最终 diff 非法 | 8 |
| REBASE_REQUIRED | 验证前后 origin/dev 漂移 | 9 |

## 报告契约

UTC 时间戳加随机后缀；report.json 至少含 mode=manual-fastpath、locale、baseDevSha、latestDevSha、headSha、changedPaths、ownership、referenceManifestGenerated、candidateDerivedChanged、checks、unexecutedChecks、status、readyForPr。report.md 列出 locale、文件、source/target hash、manifest provenance、命令结果、漂移、未执行检查和最终状态。报告仅为证据，不改在线 Translation schema。

## 安全与测试

只允许本地 fetch、读取/恢复、selector、manifest、inventory 及 selector 返回的检查；禁止 commit/push/PR API/在线 Translation/发布协调器/锁。临时写入限于 tmp/translation-fastpath/<run>/ 或受支持生成文件；恢复 inventory，保留用户修改。Phase 2 测试覆盖 ja Guides、zh 非 REST、REST/zh Guides/ja Reference 拒绝、ownership/unmapped/candidate-derived、manifest/门禁失败、漂移、无关/用户修改、报告和稳定退出码；新增路径同步 test-matrix.json 并运行 selector、workflow-matrix、workflow-policy、git diff --check。

## 证据限制

本次确认本地 origin/dev 可解析，但 git fetch origin dev 因环境无法写 .git/FETCH_HEAD 失败；该 ref 不是最新 dev 证明。实现必须映射 INVALID_BASELINE，并在可写 worktree 重跑 Phase 4 冒烟。
