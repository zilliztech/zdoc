# shared-docs 上游 re-pin 自动化方案（P1：第 9 个 pin-drift watchdog + 一期 re-pin bot）

日期：2026-11-08。规划 worktree：`.claude/worktrees/pin-repin-bot-plan`（分支 `plan/shared-docs-repin-bot` @ fd2f2ac13）。
上游调研与 reviewer 复核见 11-08 会话结论（fail-closed 拒 off-branch pin；NEXT 双通道；一期 bot 全新工具；坏 pin=生产静默 fallback）。本文把"能做"落成"怎么做"。

---

## 0. 结论与分期

| 期 | 交付物 | 形态 | 依赖 |
|---|---|---|---|
| Phase 0（先行，单独 PR） | `shared-docs-pin-drift-watchdog.yml` + 检测模块 + 日报接入（第 9 个 watchdog） | 只读 scheduled workflow，drift 信号进 artifact + 日报 | 无 |
| Phase 1（第二个 PR） | `shared-docs-repin.yml` + `shared-docs repin` 写手命令 | scheduled+dispatch Action：检测漂移 → 开/更新 PR 只推 `lock.next`（current 不动）附证据 → 人审合并 | 复用 Phase 0 检测模块 |

两期共用同一个检测核心（每页：`parsePageConfig` 取上游源文件 → `git log <next>..<track-head> -- <file>`），Phase 0 只报告，Phase 1 在其上加"写 lock.next + 开 PR"。

---

## 1. 目标与今天的问题

每次 milvus-docs 合入 v3.0.x 触及已跟踪页，都要人工做 #1151 式 re-pin（current+next 推到 merge commit）。今天的问题"上游合并了哪些页还没 re-pin"由 Phase 0 回答；Phase 1 把 #1151 式操作半自动化（检测+写 pin+开 PR 自动，采用=人审合并）。

**非目标（硬边界，全部有代码依据）**：
- 不处理上游新增/删除页面（`CONFIG_SOURCE_NOT_FOUND` 要求文件在两 pin 都存在；新页走 onboarding + record Release Channel 路径）。
- 不处理 force-push 后的旧 pin（检测到 off-branch → 显式告警+人工确认，绝不自动跟 head）。
- 不做 PR-pin/lock v2（二期，未立项）；不动 fail-closed 铁律。
- 不做 promote（current 提升，WP13/8-x 范畴）；bot 永远只推 `next`。
- 不实现 RETIRE-IN-NEXT 生命周期闭环（7-9/WP12）；上游文件被删时只报 `UPSTREAM_FILE_MISSING` 且不 propose。

---

## 2. 实地核验（本 worktree，2026-11-08，全部当前代码）

1. **锁机制**：`shared-docs/guides/pages/<page>/lock.yaml`，schema_version 1，`current`/`next` 必须 40 位 SHA；`core/lock.ts:26` validateLockHistory 要求两通道 on-branch（否则 `LOCK_COMMIT_NOT_FOUND`）+ `current ≤ next`（`LOCK_ORDER`）。88 页全部 `current == next`（零分歧基线）。
2. **现有 lock bot 结构上只许新建**：`.github/workflows/shared-docs-lock.yml:152` staged 变更必须全为 `A` 状态；`commands/lock.ts:83` 对已存在锁直接 skip。→ 一期 bot 是**全新工具**。
3. **PR 自动继承真验证**：`adapters/detect-groups.cjs:20` 对 `shared-docs/` 全路径 diff（lock.yaml 算共享输入）→ bot 的 lock PR 会触发 `shared-docs-validate.yml` 在新 pin 上真实生成全部共享页并对照 dev 快照。bot 自己无需重做生成验证，PR 里的 validate run 就是核心证据。
4. **坏 pin=生产静默 fallback（复核③）**：`scripts/docs-workflow/guides-shared-sources.js` 每页构建失败（含 LOCK_COMMIT_NOT_FOUND）走 `baselineFallback`（保留旧 dev 字节）+ `[shared-fallback]` warn，run 继续。→ off-branch pin 的显式上报必须由 watchdog/bot 承担。
5. **契约归属**：`shared-docs/**` 不在 `deploy/contracts/master-tooling-sync.json` 三个清单（devOwned/masterAuthoritative/candidateDerived）中 → 普通 master 内容，bot PR 目标 master（#1151 先例一致）。
6. **update report 建模（可借鉴不必复用）**：`adapters/updates/runner.ts` report-only（`operations: []`），逐页 `requireOrdered(current, next, target)`（`updates/git.ts:68`）+ `proposedNext`/`futureEligible`（`discovery.ts:21-27`，`futureEligible = proposedNext && lifecycle.state==='active'`）。支持 `--source-sha` 指定 target → 一期（next 推到 track 内 merge commit）约束天然成立。但 reportUpdates 需要 dev checkout + evidence run（无 evidence 时 lifecycle=unknown→futureEligible=false），且属 spec/WP12 形状 → **一期 bot 不复用 reportUpdates**，用轻量 git 检测；lifecycle/retire 感知留给 WP12。
7. **spec 约束与治理**：`spec/requirements.json` 7-1..7-10（Phase 1b）**就是这个 bot 的需求**，全部 pending WP12（`spec/pending.json`）。7-1=每日检查+多提交并处理+手动触发指定页面/提交；7-2=只开 PR 不自动采用；7-3=UAT 先显、Prod 等提升（next-only bot + 现有提升流程即满足机制）。coverage 闸（`spec/coverage.ts:34`）**只认测试标题里的 `[7-1]` 式标签**，注释不算 → 见 §3 路线决策。`packages/docs-tooling/src/shared-docs/AGENTS.md`：requirements.json 不可手编（design repo 生成）、需求变更属 owner 决策。
8. **实测漂移（检测器可行性证明 + 首日基线）**：blobless clone v3.0.x（tip=`877809ac`，即 #1151 的 pin），逐页 `git log next..tip -- <source.file>`：**10 页漂移 / 0 off-branch / 88 页扫描**，集中在 5 个上游提交（f57f5988 一个提交扫 5 个 index 页；bfcc6c2a JSON flat index 删除扫 json-indexing+json-field-overview）→ "多提交一并处理"（7-1）是真实需求。清单见附录 A；扫描脚本 `/tmp/scan-pin-drift.cjs`（配方见 §8）。
9. **矩阵现状**：`pnpm test:for-change` 对新路径直接报 "no entry" → 新路径必须同 PR 补 `scripts/docs-workflow/test-matrix.json` + 人工 spec `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md`。相邻路径（lock.ts/runner.ts/两 workflow）的 union：`pnpm test:shared-docs`、`pnpm vitest run packages/docs-tooling/src/shared-docs/testing/workflows.test.ts`、`pnpm test:rest-publication-contract`、`pnpm test:workflow-matrix`、`pnpm test:workflow-policy`、`pnpm typecheck`、`git diff --check`（+ rest-upstream 套件仅当触碰 rest 面时）。
10. **可复用 workflow 模式**：rest-upstream-drift-watchdog.yml（每日 cron、只读、`watchdog-report.json`+md、artifact `rest-upstream-drift-<run_id>`、Feishu report-card、driving `card_status`）；rest-upstream-refresh.yml（PAT 推自己的分支 + Gate 10 确定性开 PR，PAT 缺失=run 失败但证据已 commit，绝不直推 master；独立并发组不碰 docs-production-dev）；shared-docs-lock.yml（immutable SHA 身份守卫、exact-HEAD 断言、regular-file/644 守卫、failure_class 分类、infrastructure report card）。

---

## 3. 路线决策：spec 定位（建议 Route B，PR 描述声明重叠）

- **Route B（推荐，两期默认）**：bot/watchdog 的测试**不打 `[7-x]` 标签** → 7-x 全部保持 pending WP12，coverage 闸照常绿。bot 是"#1151 式操作自动化"工具，不是 WP12 交付。PR 描述明确声明：本工具与 7-1/7-2/7-3 机制重叠，属 owner 决策范围；owner 可在后续把测试补打标签+更新 pending.json（改动极小）将其转正为 WP12 首增量，或在 WP12 实施时收编/替换。
- **Route A（备选）**：第一版即按 7-1/7-2/7-7 打标签实现并同 PR 从 pending.json 移除这三个 id。语义更诚实，但等于 owner 未拍板就推进 WP12，且 7-1 的"手动触发指定页面与提交"等验收细节需完整对齐，第一期成本上升。
- 拍板点：owner（PR review 时确认即可，不阻塞 Phase 0——watchdog 纯只读观察，与 spec 无重叠争议；主要影响 Phase 1 的测试标签与 PR 措辞）。

---

## 4. Phase 0：`shared-docs-pin-drift-watchdog`（第 9 个 watchdog）

### 4.1 交付物
- `scripts/docs-workflow/shared-docs-pin-drift.js` — 检测核心（导出可复用函数，Phase 1 bot 直接 require）：
  - 输入：`{ sharedDocsRoot, upstreamRepoDir, headSha }`；
  - 逐页：`parsePageConfig`（**真实上下文**：`manualRegistry` + `DOC_HEADING_TAGS.filter(t=>t!=='BYOC')`，即 runLock 的构造方式——本规划实测空 manuals 会全量误报 `CONFIG_MANUAL_UNKNOWN`）取 `source.file`；读 lock.yaml 的 `current`/`next`；
  - 三类结果：`drifted`（`git log next..head -- file` 非空，带 commit 列表）、`pin_unhealthy`（`git merge-base --is-ancestor` 失败 → `PIN_OFF_BRANCH`；源文件在 head 不存在 → `UPSTREAM_FILE_MISSING`）、`errors`（config/lock 解析失败）；
  - 输出 `watchdog-report.json`（pages[] + `summary: {driftedCount, unhealthyCount, errorCount, diffDigest}`）+ `watchdog-report.md`（人读摘要，页→commit subjects）。`diffDigest` 对 pages 清单做 hash，供日报日环比（仿 rest drift 的 diffDigest 用法）。
- `.github/workflows/shared-docs-pin-drift-watchdog.yml` — 照抄 rest drift watchdog 骨架：`schedule: '47 4 * * *'`（避开 04:17 rest drift 与整点；digest 11:00 CST 之前一天内自然落入次日窗口，与 product-doc-links 03:43 同理）+ `workflow_dispatch`；`permissions: contents: read`；固定并发组 `shared-docs-pin-drift-watchdog`；blobless 单支 clone（`git clone --filter=blob:none --no-checkout --single-branch --branch "$TRACK" --no-tags`，本规划已实测 blobless 下 `git log <sha>..<head> -- <path>` 可用且无需 blob）；artifact 名 `shared-docs-pin-drift-<run_id>`（retention 14d）；step summary 附 report.md。
- **report card 状态规则（与 rest drift 的差异点，显式定案）**：`card_status = fail` 仅当 `unhealthyCount > 0 || errorCount > 0`（off-branch pin 是生产静默 fallback 的前兆，必须响亮）；`driftedCount > 0` 只是信息（re-pin 滞后无害，NEXT 通道解耦，人决定何时合并 bot PR），card 记 success 并在摘要列页数。
- 矩阵：`scripts/docs-workflow/test-matrix.json` 新行（`shared-docs-pin-drift`）+ 人工 spec 同步；`.zcode/watchdog-digest-baseline.md`（gitignored，workspace 本地）新增"shared-docs pin drift"节（首日基线=附录 A 的 10 页 + unhealthy=0 + diffDigest）。

### 4.2 日报接入（automation-94889097，两处改动）
- `CronUpdate` 日报 automation 的 prompt：
  - "八个工作流" → "九个工作流"，追加：`9. shared-docs-pin-drift-watchdog.yml(04:47 UTC)`；取数要点：下载 `shared-docs-pin-drift-<run_id>` artifact 读 report JSON，与基线节做日环比（drifted 页清单 diffDigest 变化=上游又动了；`PIN_OFF_BRANCH`/`UPSTREAM_FILE_MISSING`/errorCount>0 = **P1 级，Top 处理项**，因其意味着生产 Fetch 正在对该页静默 fallback）；
  - TL;DR 规则加一句：pin-drift 出现 unhealthy 或 drift 页数突增时列入 Top 1-3。
- 首日报运行后回写基线（正常三段式流程，无需额外机制）。

### 4.3 Phase 0 验证清单
```
pnpm test:for-change -- scripts/docs-workflow/shared-docs-pin-drift.js .github/workflows/shared-docs-pin-drift-watchdog.yml
node --test scripts/docs-workflow/shared-docs-pin-drift.test.js   # 新 harness：离线 fixture（本地 git 仓库模拟上游）
pnpm test:workflow-matrix && pnpm test:workflow-policy
pnpm typecheck && git diff --check
# workflow shell 块离线测试（若归入 workflows.test.ts 契约面）：
pnpm vitest run packages/docs-tooling/src/shared-docs/testing/workflows.test.ts
# 真实演练：workflow_dispatch 手动跑一次，核对 artifact 与附录 A 基线一致
```

---

## 5. Phase 1：`shared-docs-repin` bot（scheduled Action 开 PR）

### 5.1 触发与输入
- `schedule: '17 5 * * *'`（watchdog 之后）+ `workflow_dispatch`，inputs：`pages`（逗号分隔，缺省=全部漂移页，对应 7-1"手动触发指定页面与提交"）、`source_sha`（缺省=track head）、`dry_run`（缺省 true？否——**缺省 false**，直接开 PR；dry_run 供首次演练，输出将写的 diff 而不动分支）。
- 并发组 `shared-docs-repin`（唯一，不 reacquire docs-production-dev）；`permissions: contents: read`（推送走 PAT URL，与 refresh 相同）。

### 5.2 流水线（每步守卫沿袭 lock workflow）
1. checkout master 固定 ref（`persist-credentials: false`）→ pnpm/node → `parseSourceConfig(source.yaml)`（复制 lock workflow 的步骤断言：凭证-free GitHub URL）。
2. blobless 单支 clone track；跑 §4.1 检测核心。
3. **无漂移 → 成功退出**（step summary "No drift; no PR"，幂等，7-7 精神）。
4. **过滤不 propose 的页**（每条都写入 PR/summary 告警清单，绝不静默跳过）：
   - `PIN_OFF_BRANCH`（含 current 或 next 非 track 祖先——force-push 后果）→ 不动该页 + report card **fail** + run 失败（fail-closed：人工确认前不自动跟 head）；
   - `UPSTREAM_FILE_MISSING`（上游删/改名）→ 不动该页，告警待人处理（7-9 前置观察）；
   - 页面配置/lock 解析错误 → infrastructure failure class。
5. **写 pin**：新命令 `pnpm docs-tooling shared-docs repin --shared-docs shared-docs/guides --plan <detector.json>`：
   - 只允许**修改已存在** lock.yaml 的 `next:` 行（正则锚定单行替换；`current:` 字节不变；缺 lock=报错不创建——与 lock 命令互补）；`--pages` 过滤；
   - 输出逐页 `next: old → new` 清单供 PR body；
   - 写后自校验：重新 parseLock + `requireOrdered(current, newNext, head)`（merge-base 断言）。
6. **diff 守卫**（改编 lock workflow :141-156）：staged 变更必须全部为 `M` 状态的 `pages/*/lock.yaml`，且逐文件 diff 仅为 next 行值变化；文件 mode 644、非符号链接。
7. **分支与 PR**：分支 `bot/shared-docs-repin`；先 rebase 到 origin/master tip，再提交 lock 变更（conventional commit：`chore(shared-docs): re-pin <n> pages to upstream merges`）；PAT（**新 secret `SHARED_DOCS_REPIN_PAT`**，fine-grained：zdoc 的 contents:write + pull_requests:write）push；`GH_TOKEN=$PAT` 创建/更新 PR——**单滚动 PR**（见 5.3）：已存在则 push 新 commit（update-in-place，7-4 精神），否则创建。PR body 逐页附：上游文件、`current`(不变)/`next` old→new、对应上游 commit subjects、以及指向本 PR 自动触发的 `shared-docs-validate` run 的链接占位（validate 由 PAT 开的 PR 自动触发——GITHUB_TOKEN 开的 PR 不触发 pull_request workflow，这是必须用 PAT 的原因，refresh Gate 10 注释同源）。
8. **PAT 缺失 fail-closed**（Gate 10 式）：变更已 commit 到本地分支 + report card fail（"verified change not delivered"），绝不改用 GITHUB_TOKEN 直推 master。
9. （可选增强，第一版可不做）等待 validate run 结束（复用 lock workflow 的 request_id 精确发现模式），红色 → run 失败 + card fail。

### 5.3 PR 粒度决策（本方案推荐：单滚动 PR）
- **推荐：单滚动 PR**（0 或 1 个 bot PR，确定性状态机）：每 run 重算全部漂移 → rebase+update-in-place。理由：状态最少、不产生 PR 风暴（今天基线一上来就是 10 页）；reviewer 要拆分时自己 close 后人工 #1151（人始终保留 #1151 通道，bot PR 只是默认草稿位）；同页多 commit 时自动推到最远连续 SHA。
- 备选：每上游 merge commit 一个 PR（review 粒度=上游 PR；缺点：同页被后续 commit 触及时要处理"旧 PR 被新 commit 取代"的替换逻辑，状态机复杂一个量级）。
- 拍板点：reviewer 偏好；两者共享同一检测核心，切换成本低。

### 5.4 语义要点（对齐调研定论）
- bot 只推 `next`，`current` 不动 → 生产零影响；UAT（NEXT 通道）在 PR 合并+sync+Fetch 后显示新内容，Prod 等人工提升（与 #1151 的 current+next 双推不同——bot PR reviewer 若判断该内容应立即进生产，可在合并前手动把对应页 current 一并推上去，或随后单独 PR；bot 不代做）。
- 幂等：分支上无 diff 即 no-op；同一漂移状态重复 run 产出同一 PR 内容（7-7 的"同样输入同样结果"精神，即使 Route B 不打标签）。
- 安全（7-10 精神）：bot 只在 zdoc 仓库按 schedule 运行，只读公开 milvus-docs；社区 PR 不触发任何 zdoc 代码；PAT 仅 zdoc 权限。

### 5.5 Phase 1 验证清单
```
pnpm test:for-change -- .github/workflows/shared-docs-repin.yml packages/docs-tooling/src/shared-docs/commands/repin.ts scripts/docs-workflow/shared-docs-pin-drift.js
pnpm test:shared-docs            # repin 命令单测：正常/缺锁/锁非法/current 被动/diff 越界
pnpm vitest run packages/docs-tooling/src/shared-docs/testing/workflows.test.ts
pnpm test:workflow-matrix && pnpm test:workflow-policy && pnpm typecheck && git diff --check
# 真实演练（dry_run=true 先行）：对照附录 A 的 10 页清单核对 PR body；
# 演练 PR 可真实合并（其内容=应做的 re-pin），合并后由既有 sync→Fetch→UAT 链路验证。
```

---

## 6. 测试矩阵与文档（两个 PR 共同义务）
- `scripts/docs-workflow/test-matrix.json` 新增两行（watchdog/bot workflow + 检测模块 + repin 命令的 paths→focusedTests）；人工 spec `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md` 同步；新 harness 为 `*.test.js`（离线本地 git fixture：init 一个假 milvus-docs 仓库造漂移/off-branch/删文件三态）。
- 新 replay 面：不需要（本工具不触 Fetch/Translation/checkpoint 发布；检测与写 pin 是纯 git+yaml 操作，离线 fixture 即真实验）。replay 契约测试不受影响，但 `pnpm test:replay` 作为 PR 门照跑。
- 运维文档：runbook/ 增一篇（pin-drift 与 re-pin bot 的运维：看什么 artifact、off-branch 时怎么办、如何手动补 PAT、如何人工 #1151 覆盖 bot），README runbook 索引加链接；`.zcode/watchdog-digest-baseline.md` 由首日报回写。
- 不动：`spec/requirements.json`（generated，禁止手编）、pending.json（Route B）、lock schema、现有 lock/validate workflow。

## 7. 风险与开放问题
1. **owner 拍板（Route B vs A、PR 粒度）**——不阻塞 Phase 0；Phase 1 PR 描述里显式问。
2. bot PR 长期不合并时 rebase 冲突：lock.yaml 单行冲突仅当人工同时改了同一页——策略=bot rebase 失败即 close 旧 PR + 开新 PR + 告警，不 force-push。
3. 漂移"多远算多远"：bot 永远推到最远连续 SHA（上游 merge commit 链），若某中间 commit 不想采纳 → reviewer close PR 后对该页做 #1151 单点操作（phase-1 不做逐 commit 挑选 UI）。
4. cron 时刻、artifact retention、card 状态规则为初始值，首两周日报观察后可调。
5. 本方案不覆盖 7-4"每页一个 PR"的字面语义（单滚动 PR 是其"更新不另开"的简化）；若 owner 要求逐页 PR，切 §5.3 备选。

## 8. 本规划的复现配方
```bash
# worktree
git -C /Users/anthony/Documents/projects/zdoc worktree add .claude/worktrees/pin-repin-bot-plan -b plan/shared-docs-repin-bot fd2f2ac13
# 实测漂移扫描（blobless clone + 逐页 git log；脚本 /tmp/scan-pin-drift.cjs）
git clone --filter=blob:none --no-checkout --single-branch --branch v3.0.x --no-tags \
  https://github.com/milvus-io/milvus-docs /tmp/milvus-docs-pin-scan
node /tmp/scan-pin-drift.cjs   # 依赖主 checkout 的 node_modules + load-typescript
```

## 附录 A：2026-11-08 实测漂移基线（upstream head = 877809ac，即 #1151 pin）
| 页 | 上游文件 | next 落后 | 上游提交 |
|---|---|---|---|
| bitmap-index-type | indexes/scalar/bitmap.md | 1 | f57f5988 fix: restore idempotent-import fence… |
| bm25-function | bm25-function.md | 1 | b2231b6b fix C++ code fence language tag |
| full-text-search | full-text-search.md | 1 | f57f5988 |
| inverted-index-type | indexes/scalar/inverted.md | 1 | f57f5988 |
| json-field-overview | schema/json-field-overview.md | 1 | bfcc6c2a remove JSON flat index |
| json-indexing | schema/json-indexing.md | 1 | bfcc6c2a |
| ngram-index-type | indexes/scalar/ngram.md | 1 | f57f5988 |
| rtree-index-type | indexes/scalar/rtree.md | 1 | f57f5988 |
| slt-sort-index-type | indexes/scalar/stl-sort.md | 1 | f57f5988 |
| struct-array-limits | schema/structarray-limits.md | 1 | 64c61b82 document StructArray limits… |

off-branch：0；解析错误：0。注意 bfcc6c2a（删除 JSON flat index）是**内容性变更**，正是"人审合并"而非自动采用的理由样本。
