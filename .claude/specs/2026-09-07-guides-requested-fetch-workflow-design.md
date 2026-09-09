# 用户指定 Guides 页面拉取与发布工作流设计规格

## 状态

- 状态：设计完成，尚未实现。
- 目标分支：`master`，通过正常 master PR 和 master-to-dev tooling sync 进入生产。
- 生产状态所有者：`dev`；本设计不允许在 master PR 中提交 Guides 发布状态。
- 适用站点：`en`、`zh-CN`。

## 背景

当前 Guides Fetch 会比较完整 Base canonical records、Wiki revision/edit time、标题、slug 和 source hash，找出自上次成功快照以来的变化，再按默认深度 1 扩展 incoming/outgoing 文档链接。后续流水线以受影响的 Base table × publication target 为渲染单位，依次执行 source/media、table render、assembly、checkpoint、publication selection、FIFO publication 和 reconciliation。

用户指定页面的工作流需要复用这条证据链，同时缩小“本次允许发布的变化范围”。指定页面只决定选择入口，不能把最终发布单位降为单页：Guides 的导航、路径迁移、清理和表格摘要都属于 table 级状态，因此完整 table 是最小安全重构单位。

本规格的核心规则是：

> requested scope 决定本次允许修改哪些 table；一个 table 一旦进入 scope，就按完整 table 重构。requested closure 外的当前变化必须 fail closed，且局部 requested 状态不得覆盖普通增量 Fetch 的 last-success snapshot/cache。

## 目标

1. 接受用户给出的 Guides 页面 URL、站点路径或 Lark token，并解析为唯一、可发布的 canonical Guides record。
2. 复用现有链接扩展机制，把相关 incoming/outgoing canonical records 纳入 requested closure。
3. 从 closure 推导受影响 table，并对每个 table 的当前及历史 publication targets 做完整重构或清理。
4. 发现 requested scope 外的飞书变化时，在任何共享状态写入前停止发布。
5. 复用现有 checkpoint、publication unit、FIFO、reconciliation 和可选 Translation barrier，不增加旁路 page writer。
6. 保证 requested run 结束后，普通 automatic Fetch 仍能发现并发布所有未被本次 requested run 处理的变化。

## 非目标

- 不把 `--docToken` 的本地 subtree 抓取路径包装为生产发布路径。该路径不具备完整 sidebar、inventory、assembly、checkpoint 和 publication evidence。
- 不支持任意非 Guides 文档、非 canonical draft、跨 manual selector 或用户提供的输出路径。
- 不改变普通定时 Fetch 的 selection、full-fetch threshold 或链接深度。
- 初始上线不触发 paid Translation。
- 不以单个 MDX 文件作为发布或回滚单位。
- 不处理已退役的 `zdoc_cn`。

## 工作流入口

新增顶层工作流：

```text
.github/workflows/fetch-guides-requested.yml
```

该工作流只提供 `workflow_dispatch`，不增加 schedule。顶层工作流获取现有生产写队列：

```yaml
concurrency:
  group: docs-production-dev
  queue: max
```

被调用的 reusable workflows 不得再次获取该队列。requested run 排在普通 Fetch 或 publish-enabled Translation 后面，不取消正在运行的生产 writer，也不插队。

### 输入

| 输入 | 类型/默认值 | 契约 |
| --- | --- | --- |
| `pages` | string，必填 | 每行一个 selector，允许逗号或换行分隔；去重后 1–50 项。 |
| `site` | choice，`both` | `both`、`en`、`zh-CN`。`both` 为两个站点分别解析、规划和生产。 |
| `execution_mode` | choice，`plan` | `plan` 只计算 closure/conflict；`artifact` 才拉取、渲染、assembly 并生成 checkpoint evidence。 |
| `publish` | boolean，`false` | `false` 为 artifact-only；`true` 才允许进入生产 publication coordinator。 |
| `run_translations` | boolean，`false` | Phase 1/2 必须为 `false`；Phase 3 验证完成后才允许 `true`。 |
| `media_upload_mode` | choice，`skip` | `skip` 仅允许 `publish=false && run_translations=false`；发布时必须为 `write`。 |
| `target_branch` | string，`dev` | 发布时沿用现有安全 ref 校验；生产只支持 `dev`。 |
| `tooling_ref` | string，`master` | 解析为 immutable tooling SHA。 |
| `source_ref` | string，`dev` | 解析为 immutable source/baseline SHA。 |
| `artifact_retention_days` | number，`3` | 正整数，沿用 Fetch artifact retention 规则。 |

输入组合必须满足：`publish=true` 要求 `execution_mode=artifact` 和 `media_upload_mode=write`；`execution_mode=plan` 要求 `publish=false`、`run_translations=false` 和 `media_upload_mode=skip`。`execution_mode=artifact && publish=false` 才是完整 artifact-only reconstruction。

MVP 固定 `max_reference_depth=1`，不把深度暴露为 dispatch 输入。需要调整时必须作为工具契约变更评估，因为深度会扩大 API、media、table render 和发布范围。

### selector 语法

每个 `pages` 条目允许以下形式：

- canonical `doc_token` 或 Wiki node token；
- 飞书 Docx/Wiki URL；
- 当前站点的 Guides 绝对 URL 或站点相对路径。

URL 解析只提取受支持的 token/path，不执行任意 URL 抓取。站点路径先对 current navigation records 匹配，再对 trusted baseline snapshot 的 `output_paths` 匹配，以支持刚发生 rename/move 的旧地址。

每个 selector 必须解析为当前 Base 中唯一的 canonical Guides record，并满足 `guidesCanonicalIsPublishable(record)`。以下情况直接失败：未找到、匹配多条、属于别的 manual、记录不可发布、站点不匹配、token 与路径指向不同记录。错误报告保留原 selector、规范化类型和候选身份，但不把 secret 或完整飞书响应写入 artifact。

## 计划模型

现有消费者广泛用 `plan.mode !== 'incremental'` 表示 full。不得新增 `mode: 'requested'`，否则旧消费者会把 requested run 当成 full source/media/render。

保留现有字段：

```json
{
  "mode": "incremental",
  "selection_mode": "requested"
}
```

- `mode` 继续表示 source/render 行为，值为 `incremental | full`。
- `selection_mode` 表示选择原因，值为 `automatic | requested`；字段缺失按 `automatic` 读取，以兼容旧 plan。
- requested 工作流只接受最终 `mode=incremental`。任何会让现有 planner 退化为 `mode=full` 的条件，在 requested publish 中转换为显式失败，而不是执行全量生产。

requested plan schema v1：

```json
{
  "schema_version": 1,
  "manual": "guides",
  "site": "en",
  "mode": "incremental",
  "selection_mode": "requested",
  "requested_tokens": ["doc-a"],
  "linked_tokens": ["doc-b"],
  "automatic_changed_tokens": ["doc-a"],
  "table_refresh_tokens": ["doc-a", "doc-b", "doc-c"],
  "expanded_tokens": ["doc-a", "doc-b", "doc-c"],
  "affected_tables": ["table-1"],
  "table_rebuilds": [
    {
      "table_id": "table-1",
      "scope": "full-table",
      "reasons": ["requested document", "outline changed"],
      "current_targets": ["zilliz.saas", "zilliz.paas"],
      "previous_targets": ["zilliz.saas", "zilliz.paas"]
    }
  ],
  "scope_conflicts": [],
  "snapshot_basis": {
    "commit_sha": "<40-hex>",
    "snapshot_sha256": "<sha256>",
    "source_cache_identity": "<validated cache identity>"
  }
}
```

字段语义：

- `requested_tokens`：selector 直接解析出的 canonical tokens。
- `linked_tokens`：链接扩展新增的 tokens，不含 requested seeds。
- `automatic_changed_tokens`：按普通 automatic planner 在同一 current/baseline 身份上检测出的变化。该字段用于 scope conflict 审计，不能用 requested tokens 伪装。
- `table_refresh_tokens`：因为 table outline、成员、target 或跨表移动发生变化，必须从当前飞书 revision 重新物化的完整 table 成员。稳定 table 的未变成员可从可信 baseline source 复用。
- `expanded_tokens`：本次实际重新拉取的 source token 并集，即 requested、linked、closure 内 automatic changes 和 `table_refresh_tokens`。
- `affected_tables`：完整重构/清理的 table 集。
- `table_rebuilds`：逐 table 的原因、当前/历史 target 和 cleanup 证据。

所有 token、table 和 target 数组必须去重并按稳定字典序输出；plan JSON 的 hash 进入 source artifact、table artifacts、assembly decision 和 publication-ready evidence。

## requested closure 算法

每个站点独立执行以下步骤：

1. **固定身份。** 把 `tooling_ref`、`source_ref`、target tip 解析为 SHA；加载该 baseline 的 Guides snapshot v3 和匹配的完整 source/media cache。
2. **验证 baseline。** 验证 snapshot records、navigation records、table digests、source file、SHA-256、token identity 和 renderability。baseline 不完整或 cache/snapshot 身份不一致时停止 requested plan；不得静默改做 full Fetch。
3. **扫描 current metadata。** 拉取完整 Base canonical records 和 Wiki node metadata，构建 current navigation/table digests。任何无法证明 revision 身份的 canonical record，都视为不能安全判定 scope。
4. **规范化请求。** 把 selectors 解析为 `requested_tokens`。
5. **建立链接图。** 使用 baseline 的完整 incoming/outgoing graph；先刷新 requested source，再以其当前链接覆盖对应 outgoing edges。按深度 1 对 incoming/outgoing canonical links 扩展，得到 `linked_tokens`。刷新 linked source 后校验其 token identity 和 revision。
6. **建立初始 table scope。** 把 requested/linked tokens 的 current table 和 previous table 加入 `affected_tables`。previous table 用于 rename、move 和删除清理。
7. **计算普通 automatic delta。** 在同一 current scan 和 baseline 上运行现有 automatic 检测，保持 `changed_records`、`removed_records`、navigation digest 和 reasons 的原始语义。
8. **结构闭包。** 对 scope 内 table 比较 current/previous digest、成员和 targets：
   - digest、成员或 targets 变化时，把该 table 的所有 current canonical members 加入 `table_refresh_tokens`；
   - scope 内 token 跨 table 移动时，同时加入旧表和新表；
   - 移动引入的新旧表继续执行同一规则，直到 table 集不再增长；
   - 被删除 table 保留 previous identity 和 targets，以生成 cleanup matrix。
9. **scope conflict 检查。** automatic delta 中任何仍落在 closure 外的 record、removed record 或 table digest 变化，加入 `scope_conflicts`。
10. **冻结计划。** 再次确认 current identities 未在规划期间变化，输出 immutable JSON/Markdown plan 和 SHA-256。后续 source/table/assembly 只能消费该 plan，不得重新解释用户输入。

为避免一次误选扩大为近似全量生产，初始限制为最多 50 个 requested tokens、20 个 affected tables。超过限制返回 `REQUESTED_SCOPE_TOO_LARGE`，用户应改走普通 Guides Fetch。限制值属于 workflow policy，并由结构测试固定。

## 表格大纲变化

表格大纲发生变化时采用 table 级重构，不采用单页写入：

| 情况 | requested 行为 |
| --- | --- |
| requested/linked 文档所在 table 的标题、层级、排序、slug、成员或 target 变化 | 刷新该 table 的全部 current canonical source，按 current/previous targets 完整重构。 |
| requested/linked 文档跨 table 移动 | 旧表与新表都进入 scope；旧路径/旧导航清理，新表生成新路径/新导航。 |
| 链接扩展进入另一个 table | 该 table 加入 scope并完整重构。 |
| table 被删除或不再服务某 target | 用 previous snapshot 生成 cleanup table matrix；不得因 current table 缺失而跳过清理。 |
| closure 外 table 的大纲变化 | `publish=true` 和 artifact-only reconstruction 均报告 `REQUESTED_SCOPE_CONFLICT`；plan-only 保留报告但不生产候选。 |
| table source/cache 不完整或 revision 不可信 | `SOURCE_REVISION_UNTRUSTED` 或 `TABLE_SOURCE_INCOMPLETE`；不得用部分 source 拼装整表。 |

这一规则允许 trusted baseline 减少稳定 table 成员的网络拉取；一旦 outline/member/target 变化，MVP 重新拉取整表，避免 current navigation 与旧 source 身份错配。

## `REQUESTED_SCOPE_CONFLICT`

requested 工作流不是“只发布指定页面并忽略别处变化”。它必须证明 current 相对 baseline 的所有变化都位于本次允许发布的 table closure 内。以下任一事实产生 conflict：

- closure 外 canonical record 新增、删除、title/slug/token/revision/edit-time/source identity 变化；
- closure 外 table digest、成员、排序、层级或 targets 变化；
- 无法取得 closure 外 record 的 current Wiki revision，从而不能证明其未变化；
- current Base scan 与 Wiki metadata scan 不属于同一可验证观察窗口，且重试后仍漂移；
- 链接指向无法解析的 canonical record，且该链接参与本次 closure。

处理规则：

- `plan-only`：成功上传 request、plan 和 conflict report，结论为 `blocked`；不创建 source candidate、table artifact、checkpoint 或 cache。
- `publish=false` 的 artifact-only reconstruction：在 producer 前停止，工作流结论失败；不得把冲突降为 warning。
- `publish=true`：在任何 media upload、checkpoint publication 或 Git writer 前停止。

解决方式是扩大用户 selector 使相关 table 进入 scope，或运行普通 automatic Guides Fetch。requested workflow 不自动顺带发布无关变化。

## source、media、snapshot 与 cache 隔离

### 工作目录

每个 site 从 immutable baseline 恢复完整 source/media，然后在 run-scoped 目录中创建 overlay：

```text
baseline complete source/media
  + refreshed closure source/media overlay
  + current affected-table navigation overlay
  = requested complete candidate
```

source/media 替换必须以 token 为单位原子完成。抓取失败不得留下半更新文件。`media_upload_mode=skip` 只验证本地变换及引用，不写对象存储。

### 完整快照 reducer

requested candidate 仍须满足 Guides snapshot v3 的完整性，不允许创建局部 snapshot：

- closure 内 records、node metadata、source hashes、reference edges 使用 current/refreshed 值；
- affected tables 的 navigation records/table digests 使用 current 值；
- closure 外 records、navigation、digests 和 source hashes逐字继承 baseline；
- removed/moved records 只按受影响旧表的 cleanup 规则删除或迁移；
- reducer 完成后重新验证 record/token/table/source 一一对应、完整 graph、所有 SHA-256 和 renderability。

生成 `guides-requested-state-merge.json`，至少绑定：baseline commit/snapshot/cache hashes、plan hash、closure token/table 集、继承记录数、替换记录数、删除记录数、candidate snapshot hash 和完整性结果。

### 状态提升

- plan-only 和 `publish=false`：`state_promotion=none`；不得更新 Git 中 last-success snapshot、manifest、checkpoint state 或任何共享 cache key。
- `publish=true`：只有 reducer 和完整性校验均成功、scope conflict 为空、checkpoint 发布成功后，才允许把完整 merged snapshot 写入正常 dev 发布状态。
- requested cache 使用独立 run-scoped key。Phase 3 之前不保存为普通 v5 cache；后续只有证明 merged cache 与完整 v5 contract 等价时，才能以 `state_promotion=complete_merged` 提升。否则下一次普通 Fetch 允许 cache miss/full refresh，不能消费 partial requested cache。

关键回归必须证明：requested run 观察到但拒绝发布的 closure 外变化，不会进入 ordinary last-success snapshot/cache；下一次 automatic Fetch 仍将其检测为 changed。

## table render、assembly 与 checkpoint

`guides-tables.js` 继续只接受 `mode=full|incremental`。requested plan 以 `mode=incremental` 输入，matrix 由 `affected_tables` 以及 current/previous targets 生成；每个 matrix row 仍调用现有 `_render-guides-table.yml` 做完整 table offline render。

assembly 从 baseline publication stage 开始，只恢复经过 plan hash 和 table identity 认证的 table artifacts，然后执行现有完整 sidebar、manifest、source contract 和 site build 验证。不能直接把 requested MDX 复制到 checkpoint。

新增 checkpoint scope receipt，允许的差异为：

- `affected_tables × current/previous targets` 所拥有的 Guides content roots；
- 对应旧路径删除；
- 完整重算但路径固定的 Guides sidebar/manifest；
- exact Guides snapshot/publication state paths。

任意 closure 外 content diff、未声明删除、symlink、可执行文件或不匹配的 table artifact 返回 `CHECKPOINT_SCOPE_VIOLATION`。最终仍使用现有 publication units：

```text
source/guides-en
source/guides-zh-CN
```

不增加 requested 专用 Git strategy。publication selection、ready document、checkpoint/baseline pair、coordinator result 和 reconciliation 都必须绑定 requested plan hash 与 state-merge receipt hash。

## 执行阶段

### Phase 1：plan-only

- 新工作流默认 `execution_mode=plan`、`publish=false`、`run_translations=false`、`media_upload_mode=skip`。
- 完成 selector normalization、current scan、automatic delta、closure、table rebuild plan 和 conflict report。
- 不拉取 closure media、不渲染 table、不创建 checkpoint、不写共享 cache/状态。
- 用真实 URL/token 观察 scope 大小和 conflict 频率。

### Phase 2：artifact-only

- 使用 `execution_mode=artifact`、`publish=false`、`run_translations=false`。
- conflict 为空时拉取 closure，重构完整 tables，执行 assembly、site validation 和 checkpoint preflight。
- publication coordinator 使用 artifact-only 模式产生终态 evidence，但不写 Git。
- 保存 source、table、checkpoint、baseline、plan、state-merge 和 scope receipts。
- `media_upload_mode=skip` 只验证无写模式；另做受控 `write` 验证确认真实 media 合约。

### Phase 3：publish

- 使用 `execution_mode=artifact`、`publish=true`、`media_upload_mode=write`。
- 只在 Phase 2 的真实 retained-artifact replay 和状态隔离回归通过后开放 `publish=true`。
- 顶层 workflow 继续占用 `docs-production-dev`，coordinator 以当前 dev tip 做 drift 检查并按 FIFO 发布 en/zh-CN units。
- 初始保持 `run_translations=false`。若 target drift、push probe 不确定或 `REMOTE_STATE_UNKNOWN`，停止且不盲目重试。
- 发布完成后验证 result SHA ancestry、完整 snapshot、ordinary incremental discoverability 和 reconciliation 结果。

### Phase 4：可选 Translation handoff

- 只有 `site` 包含 `en` 且英文 Guides publication unit 已发布或确定 no-changes，才允许 handoff。
- handoff 必须引用完整、已认证的英文 source checkpoint，不能引用局部 requested cache。
- 复用现有 source publication barrier、Translation selection/FIFO/reconciliation。
- 在单独批准前保持关闭；不得为了工作流验收启动 paid Translation。

## 错误分类

| code | phase | 含义/处理 |
| --- | --- | --- |
| `INVALID_REQUEST_SELECTOR` | normalize | selector 语法、数量或 host/path 不受支持。 |
| `REQUEST_NOT_CANONICAL` | normalize | 不能唯一映射到 canonical Guides record。 |
| `REQUEST_NOT_PUBLISHABLE` | normalize | record 存在但不可发布。 |
| `REQUEST_SITE_MISMATCH` | normalize | selector 与选择站点不一致。 |
| `REQUESTED_BASELINE_UNTRUSTED` | baseline | snapshot/cache/source completeness 或 identity 校验失败。 |
| `REQUESTED_SCOPE_TOO_LARGE` | plan | token/table closure 超过固定上限；改走普通 Fetch。 |
| `REQUESTED_SCOPE_CONFLICT` | plan | closure 外存在变化或无法证明未变化。 |
| `SOURCE_REVISION_UNTRUSTED` | fetch | closure source 未固定到可信 revision。 |
| `TABLE_SOURCE_INCOMPLETE` | render | 完整 table source graph 不成立。 |
| `REQUESTED_STATE_MERGE_INVALID` | assembly | 完整 snapshot reducer 或 merge receipt 校验失败。 |
| `CHECKPOINT_SCOPE_VIOLATION` | checkpoint | candidate diff 越过 table-derived allowlist。 |
| `TARGET_DRIFT` | publish | target tip 已偏离 immutable selection baseline。 |
| `REMOTE_STATE_UNKNOWN` | publish | push 后远端状态不可确认；按现有安全停止处理。 |

所有错误都写结构化 JSON 和人类可读 Markdown；只有纯输入错误可在修正输入后重新 dispatch。publish 阶段错误必须重新解析 target identity，不能复用旧 selection/ready evidence。

## 对当前生产流水线的影响

### 保持不变

- 普通 `fetch-docs.yml` 的 schedule、默认 group selection 和 automatic planner 行为不变。
- `mode` 仍只有 `incremental|full`；旧 plan 缺少 `selection_mode` 时按 automatic 处理。
- table renderer、assembly、publication unit IDs、coordinator strategy、FIFO 和 reconciliation 入口保持不变。
- `dev` 仍是唯一生产状态分支，工具变更仍经 master PR 和 tooling sync。

### 新增影响

- requested 顶层 run 会占用 `docs-production-dev` 队列，因此可能延后普通 Fetch/Translation；`queue: max` 保证它们按队列执行而不是互相取消。
- API 和渲染负载与 closure 中 table 数量有关，而不是只与 requested page 数量有关。一个页面可因链接、跨表移动或 outline change 触发多张 table。
- `site=both` 会分别产生 en/zh-CN source、media、table build 和 publication evidence，不能用一个站点通过推断另一个站点成功。
- 严格 scope conflict 会让部分 requested run 停止，尤其在普通 Fetch 尚未发布其它飞书变化时。这是防止漏发布和状态污染的必要行为。
- Phase 1/2 不写 Git/shared cache；Phase 3 只提升经过完整 reducer 证明的 merged state。

## 代码和工作流改动清单

### 新增

- `.github/workflows/fetch-guides-requested.yml`：顶层 dispatch、immutable refs、生产队列、双站点编排。
- `scripts/docs-workflow/guides-requested-selection.js`：输入解析、canonical resolution、limits 和 selection receipt。
- `packages/docs-tooling/src/lark/requestedGuidesFetchPlanner.js`：requested closure、automatic delta 对照、table fixpoint 和 conflicts。
- `scripts/docs-workflow/guides-requested-state-merge.js`：完整 snapshot/source/navigation reducer 和 merge receipt。
- `scripts/docs-workflow/guides-requested-scope.js`：table-derived checkpoint allowlist 与 diff 校验。
- 对应 `*.test.js`、artifact schemas 和 replay fixtures。

### 修改

- `packages/docs-tooling/src/lark/incrementalFetchPlanner.js`：抽取可复用的 change detection/link graph primitives；ordinary output 保持字节级兼容或用 fixture 证明等价。
- `packages/docs-tooling/src/lark/index.js` / CLI adapter：接受 immutable requested plan 文件，不直接接受未认证 selector 作为 fetch input。
- `scripts/docs-workflow/guides-media-prefetch.js`：识别 `selection_mode=requested`，只处理 plan closure/affected tables，禁止 full fallback。
- `scripts/docs-workflow/guides-assembly-identity.js`：认证 selection mode、plan hash、state merge 和 conflict-free 状态。
- `scripts/docs-workflow/guides-tables.js`：验证 requested table rebuild entries 与 matrix 一致。
- `scripts/docs-workflow/guides-cache-save-decision.js`：默认拒绝 requested partial cache promotion。
- `_fetch-guides-sources.yml`、`_render-guides-table.yml`、`_assemble-guides.yml`：增加 plan/receipt identity inputs 和 artifacts；reusable workflows 不获取生产队列。
- Fetch publication selection/results/card collector：显示 `selection_mode=requested`、selectors 数量、affected tables、conflict code 和 plan hash。
- `scripts/docs-workflow/test-matrix.json` 与 `.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md`：为新工作流和脚本增加完整映射。
- `README.md`：实现后补 operator dispatch、artifact-only、publish、冲突处理和恢复步骤；不得在功能落地前把假设输入写成已支持命令。

实现时应优先把 common Guides producer topology 提取为可复用边界，避免复制 `fetch-docs.yml` 的 en/zh-CN jobs 后发生策略漂移。顶层 automatic/requested workflow 各自拥有 selection 与 queue，底层 source/table/assembly 共享。

## 测试规格

### focused tests

1. selector/input：token、Wiki URL、Docx URL、current path、previous path、重复、歧义、非 canonical、非 publishable、站点错配、50 项边界及所有 execution/publish/media/Translation 组合。
2. plan schema：旧 automatic plan 兼容；`mode=requested` 被拒绝；requested 始终 `mode=incremental`。
3. links：incoming/outgoing 深度 1、current requested outgoing 覆盖 baseline、循环、unresolved canonical link。
4. table scope：稳定 table、outline digest 变化、target 变化、跨表 move、table removal、linked cross-table 和 fixpoint 上限。
5. conflicts：closure 外新增/更新/删除/大纲变化/Wiki metadata failure 全部 fail closed；closure 内同类变化纳入 rebuild。
6. state merge：closure 外 snapshot/source bytes 继承 baseline，closure 内替换，旧表清理，hash/identity mismatch 拒绝。
7. media/cache：artifact-only 无外部写；partial requested cache 永不匹配 ordinary v5 restore key。
8. matrix/assembly：完整 table × current/previous target；closure 外 artifact 与 checkpoint diff 被拒绝。
9. ordinary regression：同一 fixture 的 automatic plan 在改动前后等价；requested conflict run 后 ordinary Fetch 仍检测外部变化。
10. workflow policy：dispatch defaults、queue ownership、publish/media/Translation guards、immutable SHA 传播和 reusable workflow 不重入队列。

### repository gates

每次实现按所有 changed paths 运行：

```bash
pnpm test:for-change -- <all-changed-paths...>
```

新路径当前尚未映射是必须在同一变更修复的 matrix gap。至少应包含：

```bash
pnpm test:guides-workflow
pnpm test:replay:fetch
pnpm test:workflow-policy
pnpm test:workflow-matrix
git diff --check
```

workflow YAML 还要运行 selector 返回的 scoped `actionlint`/contract tests。若跨到 Translation handoff，则提升为 `pnpm test:replay:all`，并按矩阵执行 Fetch/Translation workflow contract。

### 真实 retained-artifact replay

实现 publish 前必须使用真实 retained Guides source/table/checkpoint artifacts：

1. 记录原 run ID、attempt、head SHA、artifact IDs/names 和 GitHub `sha256:` digest。
2. 对每个 checkpoint archive 做 preflight。
3. 使用 `.claude/worktrees/` 下隔离 checkout 和系统临时目录中的隔离 local bare Git remote；绝不使用真实 `origin` 作为 replay remote。
4. 从 exact dev baseline 恢复 generated state，验证 `apps/docs/node_modules/jiti`，运行 en/zh-CN 对应 inventory/build。
5. 重放至少四个场景：稳定 table 单页、outline change 整表、跨表 move、closure 外变化 conflict。
6. 在 conflict 场景后运行 ordinary automatic planner，证明外部 token 仍为 changed。
7. 保存 replay root、最终 local remote SHA/ancestry、candidate diff、plan/state-merge/checkpoint hashes、每站点 table/result counts。

Synthetic fixtures 用于 fault injection，但不能替代真实 artifact replay。验收过程不启动 paid Translation。

## 验收标准

1. 同一个 selector 在固定 current/baseline 身份下产生稳定 requested token、table closure 和 plan hash。
2. requested/linked table 的 outline 变化会完整重构 table；跨表 move 同时重构并清理旧/新 table。
3. closure 外任意变化或 revision 不确定性在共享写入前产生 `REQUESTED_SCOPE_CONFLICT`。
4. artifact-only run 不修改 dev、对象存储（skip 模式）、last-success snapshot 或共享 cache。
5. publish candidate 的所有 content diff 都属于 table-derived allowlist，完整 snapshot/source graph 校验通过。
6. requested run 后 ordinary automatic Fetch 不漏掉任何未发布变化。
7. en/zh-CN 各自具有完整 source/table/build/checkpoint evidence；`both` 不把一个站点的结果替代另一个。
8. publication 继续通过现有 unit、FIFO、target drift、REMOTE_STATE_UNKNOWN 和 reconciliation contracts。
9. 普通 scheduled/manual `fetch-docs.yml` fixture 与生产行为保持兼容，无 selection 或 cache 回归。
10. test matrix 无 unmapped production path，focused tests、Fetch replay、workflow policy、workflow matrix 和 diff check 全部通过。

## 回滚与恢复

- Phase 1/2 回滚只需禁用或移除新 dispatch 入口；没有共享发布状态需要恢复。
- Phase 3 通过现有 checkpoint publication 产生单一、可审计的 dev 前进历史。失败时先判定是否已有 publication unit 写入；不要根据顶层 workflow 红/绿推断 Git 状态。
- target drift 时重新基于 current dev 规划，不 rebase 或复用旧 requested plan。
- `REMOTE_STATE_UNKNOWN` 时保存 selection、ready、progress、results 和 push probe evidence，停止自动恢复。确认远端真实 tip 后使用现有恢复边界处理。
- 已发布内容需要业务回退时，生成新的正常 Fetch/checkpoint 前进修复；不 force-push、不 reset dev、不直接恢复 partial requested cache。

## 开放项

以下项目不阻塞 Phase 1，但必须在开放对应阶段前定案：

- public Guides URL 的 canonical path resolver 是否已有可直接复用的唯一权威；若没有，Phase 1 可先只支持 Lark URL/token，并将 path selector 延后。
- complete merged requested cache 何时满足普通 v5 cache 等价条件；在证明前保持独立、不提升。
- `run_translations=true` 的产品需求是翻译 requested delta 还是仅在英文完整 checkpoint 上触发现有 Guides Translation；本规格选择后者。
- 20-table 上限是否需要根据 artifact-only 运行数据调整。
