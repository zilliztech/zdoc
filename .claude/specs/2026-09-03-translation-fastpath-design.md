# Translation fast-path 预检设计(Phase 2:按证据分组修订)

该脚本是本地、失败关闭的验证器:发现 dev 基线之上的内容 diff,按证据分组检查范围与所有权,必要时生成 zh-CN Reference manifest,执行 selector 返回的全部命令,并写入 `tmp/translation-fastpath/<timestamp>/` 报告。绝不 commit、push、PR API、在线 Translation、写真实 dev 或获取 docs-production-dev。

本修订(2026-09-09)把范围判定从硬编码 locale/路径清单切换到 `packages/docs-tooling/src/publication/evidenceGroups.ts` 分组权威,并落实统一规格 Phase 5 的三处放行前置条件:ja Reference 放行(Phase 3 完成,日文 manifest 与 `validate-reference --site ja-JP` 已存在);zh Guides 放行(Phase 1 完成,zh Guides 发布 manifest 已绑定飞书锚点);ja REST 归导出组校验(per-locale rest-derivation 清单),不进入翻译证据。

## 已确认契约

- Selector 为 `scripts/docs-workflow/select-tests-for-changes.js`,入口 `pnpm test:for-change`,支持 `--json`,返回 files、branchPolicies、areas、focusedTests、harnesses、gates、ordered commands。优先解析 JSON;失败关闭。
- Ownership 由 `deploy/contracts/master-tooling-sync.json` 决定,顺序 candidateDerivedPaths -> masterAuthoritativePaths -> devOwnedPaths -> master-tooling。仅接受 dev-published-state -> dev;唯一 candidate-derived 是 `deploy/contracts/localization-inputs.inventory.json`。
- 分组权威为 `packages/docs-tooling/src/publication/evidenceGroups.ts`:fetch / spec-derived / translation 三组路径集合由 manual 注册表与 translation targets 派生;fastpath 通过 `classifyEvidencePath` 消费,不得维护自己的路径清单。已退役治理 manifest(import.json、tools-translations.json)不属于任何组。
- ja-JP 范围:`i18n/ja-JP/**` 中分类为 translation 的路径(guides/byoc/reference 三个 target root)。Reference 路径自此放行:证据由 `generated/ja-JP/manifests/reference-translations.json` + `validate-reference --site ja-JP` 校验(fail-closed,manifest 过期即失败,不自动改写)。REST 输出路径同时分类为 spec-derived:按导出组校验 —— `generated/ja-JP/manifests/rest-derivation.json` 必须存在且与 OpenAPI fragment 集 hash 一致;缺失或漂移即失败。
- zh-CN 范围:分类为 translation 的 `content/zh-CN/reference/**`(非 api/restful,REST 归 zh REST lane,不接受 fastpath 候选)与 `content/zh-CN/guides/tutorials/**`(fetch 组放行路径,由 `validate-revision-inventory --site zh-CN` 的发布 manifest hash 校验兜底;landing 文件由 reference-landings 翻译单元拥有)。其他 locale、未分类路径、master-tooling 文件拒绝。
- Reference CLI 为 `reference-manifest`(固定 source/target/source-commit,`--write`),随后 `validate-reference --site en` 与 `--site zh-CN`(zh 候选)/`--site en` 与 `--site ja-JP`(ja 候选);status 只允许 translated|unchanged|retired。
- Inventory 生成前保存字节与存在性,运行 `pnpm generate:localization-input-inventory` 后比较并恢复;变化 => BLOCKED_CANDIDATE_DERIVED_CHANGE,生成失败 => VALIDATION_FAILED。

## 执行顺序

1. 解析 `--locale (ja-JP|zh-CN)`、可选重复 `--path`,拒绝未知/不安全参数。
2. `git fetch origin dev`;解析 BASE_DEV_SHA=origin/dev 并证明 HEAD 基于它;失败 => INVALID_BASELINE。
3. 用 no-renames diff 与 status 发现变更:仅允许对已跟踪文件的修改(M);A/D/R、非分组白名单或无关 tracked 修改拒绝,untracked 用户文件容忍并记入报告,不清理用户修改。
4. 对每个变更路径 `classifyEvidencePath`:未分类 => UNSUPPORTED_EVIDENCE_PATH;zh 候选中的 zh REST => UNSUPPORTED_EVIDENCE_PATH;ja 候选必须位于 `i18n/ja-JP/` 且分类含 translation(ja REST 额外要求导出组校验);zh 候选必须分类含 translation 或 fetch 且位于 `content/zh-CN/`。
5. 调用 `pnpm test:for-change -- --json <all-changed-paths>`;拒绝 unmapped、非 dev-published-state、candidate-derived、master exception。
6. 运行 inventory 预检并恢复/阻断。
7. zh 候选含非 REST Reference 路径时调用 `reference-manifest --write`;失败 => MANIFEST_GENERATION_FAILED。ja 候选不自动改写 manifest(过期即失败)。
8. 候选含 REST 分类路径时执行导出组校验:对应 locale 的 rest-derivation manifest 必须存在且 fragment hash 一致;失败 => VALIDATION_FAILED。
9. 重跑 selector,按原顺序执行 commands。每条记录完整命令、开始/结束、退出码、signal/timeout、stdout/stderr、logPath、passed/failed;任一失败/超时/中断/未执行 => VALIDATION_FAILED;不硬编码列表。zh 候选随后必须运行 `validate-reference --site en` 与 `--site zh-CN`,ja 候选 `--site en` 与 `--site ja-JP`。
10. 要求 selector 返回的 `git diff --check` 并复核最终允许路径/生成文件(manifest 对与 sidebar 派生文件属于预期生成输出)。
11. 再次 fetch origin/dev,得到 LATEST_DEV_SHA;变化 => REBASE_REQUIRED,fetch 失败 => INVALID_BASELINE。
12. 写 report.json/report.md,输出唯一 READY_FOR_PR=true 或 STATUS=<state>;仅 READY 退出 0。

## 失败状态表

| 状态 | 含义 | 退出码 |
| --- | --- | ---: |
| READY_FOR_PR | 全部检查和漂移检查通过 | 0 |
| INVALID_BASELINE | fetch、SHA 或 ancestry 无法证明 | 2 |
| INVALID_SCOPE | 参数、变更生命周期(A/D/R)或 tracked 修改超出 locale 白名单 | 3 |
| UNMAPPED_PATH | selector 无矩阵匹配 | 4 |
| UNSUPPORTED_EVIDENCE_PATH | 变更路径未落入任何证据分组,或该分组对该 locale 不可 fastpath 校验(如 zh REST 输出) | 5 |
| BLOCKED_CANDIDATE_DERIVED_CHANGE | inventory 字节变化 | 6 |
| MANIFEST_GENERATION_FAILED | manifest 工具/产物失败 | 7 |
| VALIDATION_FAILED | selector 命令失败、超时、中断、缺少必需 validation、导出组清单缺失/漂移或最终 diff 非法 | 8 |
| REBASE_REQUIRED | 验证前后 origin/dev 漂移 | 9 |

## 报告契约

UTC 时间戳加随机后缀;report.json 至少含 mode=manual-fastpath、locale、baseDevSha、latestDevSha、headSha、changedPaths、evidenceGroups(逐路径分类)、ownership、referenceManifestGenerated、restDerivationValidated、candidateDerivedChanged、checks、unexecutedChecks、untrackedUserFiles、status、readyForPr。report.md 列出 locale、文件、source/target hash、manifest provenance、命令结果、漂移、未执行检查和最终状态。报告仅为证据,不改在线 Translation schema。

## 安全与测试

只允许本地 fetch、读取/恢复、selector、manifest、inventory、rest-derivation 校验及 selector 返回的检查;禁止 commit/push/PR API/在线 Translation/发布协调器/锁。临时写入限于 `tmp/translation-fastpath/<run>/` 或受支持生成文件;恢复 inventory,保留用户修改。测试覆盖:ja Guides、ja Reference(新放行)、zh 非 REST Reference、zh Guides(新放行)的放行路径;zh REST/未分类路径/master-tooling 文件拒绝;ownership/unmapped/candidate-derived;manifest/门禁/导出组校验失败;dev 漂移;无关/用户修改容忍;报告字段与稳定退出码。新增路径同步 test-matrix.json 并运行 selector、workflow-matrix、workflow-policy、git diff --check。

## 证据限制

Phase 1 冒烟受限于本地环境无法写 `.git/FETCH_HEAD`(git fetch origin dev 失败映射 INVALID_BASELINE)。实现以依赖注入提供可测试边界;真实 origin/dev 的端到端冒烟需在可写 worktree 执行,作为首次真实使用的操作者证据保留在报告目录中。
