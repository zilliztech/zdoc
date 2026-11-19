## Context

PR CI 的 `Validate tooling consistency` job 耗时 ~16 分钟，其中 `test:shared-docs`（grouped gate）占 13m51s，用满 runner 15 分钟死线的 92%（light 相位持续增长）。矩阵选择器证明最近 30 个合并 PR 仅 1/3 触碰 shared-docs 门禁路径。方案 = **A 路径门控 + B 重相位拆并行 job**（env 过滤项已于早前落地，`packages/docs-tooling/src/shared-docs/adapters/updates/git.ts:11-29`）。

预期效果：无关 PR 的 tooling job 16min → ~2min；shared-docs 触发面中原未分类子集的墙钟 ~9-10min；碰 `packages/docs-tooling/src/shared-docs/**` 或 `shared-guides-update.yml` 的 PR 仍受 `build_zh_cn`（90min job）主导，改善为 tooling job 并行化与门禁化；每相位独立 15min 预算，死线风险解除。

方案经两轮独立 code-review：第一轮 needs-changes（P0：path-filters 匹配器不支持尾部 `*`，4 条模式是死模式），第二轮 **approve-with-nits**（全部修正闭环确认，剩余 3 P1 + 5 P2 已折入本版）。新分支（off origin/master）实施，矩阵+规格+契约测试+文档同改。

## 改动清单

### 1. path-filters 契约（A）

**`deploy/contracts/verify-image.mjs`**（P0 修正）
- `patternMatches`（:472-478）扩展尾部 `*` 前缀匹配，对齐 selector 语义。**分支顺序陷阱（P2-1）**：先 `endsWith('/**')` 前缀分支，后通用 `endsWith('*')` 分支（复刻 `select-tests-for-changes.js:24-29`），否则 `packages/**` 退化为死模式。
- `verify-image.test.mjs` 补 `*` vs `/**` 分支顺序单元对照用例 + 尾部 `*` 用例（断言用真实文件名，lark 文件实为 `.js`：`sharedPageFetch.js`、`sharedPageRenderIdentity.js`）。

**`deploy/contracts/path-filters.json`**（version 6→7）
- 新规则 `sharedDocsGate`，checks `["build:en", "build:zh-CN", "shared-docs:tests"]`（P1-3 修正：保留双构建覆盖，publish-sites auto 选站语义不变），include：`packages/docs-tooling/src/shared-docs/**`、`shared-docs/**`、`scripts/testing/**`、`.github/workflows/shared-guides-update.yml`、`scripts/docs-workflow/shared-guides-update/**`、`packages/docs-tooling/src/lark/sharedPageFetch*`、`packages/docs-tooling/src/lark/sharedPageRenderIdentity*`、`scripts/docs-workflow/guides-shared-sources*`、`scripts/docs-workflow/replay-shared-pages*`。
- `shared` exclude 追加 4 条对应模式（必须同 change 落地，否则双匹配抛错）；`package.json`/`pnpm-lock.yaml` 不迁移。

**`deploy/contracts/evaluate-path-filters.mjs`**：`CHECK_ORDER`/`formatGithubOutputs` 追加 `shared-docs:tests`→`shared_docs_tests`；不加入 `FAIL_CLOSED_CHECKS`。

**`deploy/contracts/evaluate-path-filters.test.mjs`**
- 精确 GITHUB_OUTPUT 字符串加新输出；新规则路由用例（真实文件名，overlap-free、unclassified→false）。
- **常驻等价断言（P1-3 修正）**：新规则每个 include 族取真实代表文件解析出的 checks 必含 `build:en` 与 `build:zh-CN`——防止未来有人删构建 check 重新打开 publish-sites 语义变化。

### 2. workflow 改动（`.github/workflows/site-validation.yml`）

- `classify` outputs 追加 `shared_docs_tests`；manual 步 `site=all`→true、en/zh-CN→false（sync 晋升验证必跑重门禁），注释说明单站点 dispatch 不跑的取舍。
- 新增 `shared_docs_light`（`--phases light`）与 `shared_docs_isolated`（`--phases transactions,local-runner,update-prepare`）两并行 job：`if: needs.classify.outputs.shared_docs_tests == 'true'`，放 `tools_coverage` 之后；checkout source_sha；**node-version 22、步级 env `ZDOC_TEST_TMP_PARENT`**（P2-5）；失败上传 artifact 带 `-light-`/`-isolated-` 后缀；timeout-minutes 20。
- `tooling_checks` 删 Test shared docs 两步、timeout 20→10；`site_validation` needs/env/success||skipped 循环追加两新 job（`retirement` 等既有 success-only 钉不动）。

### 3. runner 相位子集（B）（`scripts/testing/run-vitest-groups.mjs` + 其 test）

- `parseOptions` 接受 `--phases <csv>`；选中集合 = partition 按 canonical 序过滤（P2-4：钉 `--phases update-prepare,light` → `[light, update-prepare]` 规范化、未知相位名/空集拒绝）。
- verdict **v2→v3** 新增 `selectedPhases`；记账不对称：`unaccountedFiles`/success（:635/:670/:676）按选中集合，`discoveredFiles`（:673）保持全量 manifest——注释+测试钉住；子集 fixture 自带该不对称样本（P2-5）。
- 新增解析代码勿落入 `run-vitest-groups.test.mjs:206-210` 源码切片区间。
- 测试钉改造：`:41-43` 拒绝清单、`:534` version、`:536` 相位名单（默认调用+子集变体）、`:699-731` update-prepare 索引钉配套 fixture、platform-skip 子集用例。

### 4. 契约测试与矩阵

- **`deploy/contracts/site-validation-workflow.test.mjs`**：classify 新输出表达式、两新 job `if:`+完整命令串钉、gate 聚合新条目、"tooling_checks 不含 test:shared-docs" 反向钉。
- **双向漂移守卫**（`scripts/docs-workflow/select-tests-for-changes.test.js`）：正向（规则每 include 模式取真实代表文件过 selector 选中 test:shared-docs）+ 反向（矩阵 commands 含 test:shared-docs 的每条 path 模式展开后命中 sharedDocsGate）。**例外 = 恰好 `package.json` 一条，结构化钉法**：断言其经 `matchingPathFilterRules` 解析为 `shared` 规则（双构建保护仍在）+ 内联 reason，不裸 skip-list。
- **`scripts/docs-workflow/test-matrix.json`**：`grouped-vitest-harness` 路径 = **保留 `package.json`** + 合并 `scripts/testing/**`（4 个显式文件折叠进 glob；P1-1 修正：替换会致根 manifest 无映射、现有测试红）；新 area `path-filters-contract` 收编 6 个未映射路径，focusedTests = `node --test evaluate-path-filters.test.mjs verify-image.test.mjs`，gates 含 **`pnpm check:reference-presentation`（path-filters 第三消费方）** + `pnpm test:workflow-matrix` + `git diff --check`（P2-2）。

### 5. 文档

- `README.md:45-97`：重写含 :74-76 "20-minute limit unchanged" 段；**收益叙事按触发面分口径**（P1-2 修正：shared-docs/lark 源路径 PR 仍由 zh 构建主导墙钟）；light 增长观察义务。
- `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md`：grouped-vitest-harness 条目（含 package.json 保留）、相位模型、evidence、矩阵表 193/196 行、231 行聚合声明、分口径收益注记。
- `deploy/contracts/README.md`：新 check/rule、fail-open 决策、`publish-sites.yml` 第二消费方说明（等价性由常驻测试守护的指引）。
- `packages/docs-tooling/src/manuals/README.md:105`：CI 表格补条件化重门禁。

## 验证

1. `pnpm test:for-change -- <全部变更路径>` union 逐条执行（含新收编路径）。
2. focused：三个 deploy/contracts 契约测试、fetch-translation/master-tooling-sync workflow 测试、`test:vitest-groups`、`select-tests-for-changes.test.js`、`pnpm check:reference-presentation`。
3. gates：`pnpm test:workflow-policy`、`pnpm test:replay`、`pnpm test:workflow-matrix`、`git diff --check`。
4. 兼容实跑：`pnpm test:shared-docs`（默认全相位）+ 两次子集实跑（light / isolated）验 verdict v3 与记账；`pnpm test:frontend` 按矩阵义务（macOS 历史问题，失败则精确记录）。
5. 门控仿真：`evaluate-path-filters.mjs --base origin/master --head <branch>` 三组——watchdog 类路径（`shared_docs_tests=false` 且双构建照旧）、shared-docs/lark/testing 真实文件（`=true`）、**sharedDocsGate 单类变更 → `build_en`/`build_zh_cn` 均为 true 的输出比对**（publish-sites 语义仿真，P2-3）。
6. actionlint（本地钉版或注明 CI 验证）。

## 交付

- 新分支（off origin/master）单 PR；不动当前 watchdog 分支及其未跟踪文件。
- 报告：改前改后相位计时、全部测试结果、`git status`、遗留证据缺口（如有）。