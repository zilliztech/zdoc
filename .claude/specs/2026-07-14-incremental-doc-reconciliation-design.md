# 增量文档对账设计

## 目标

把 `dev` 作为已发布文档基线使用，同时保证本次选中的内容组不会继承 `dev` 中的陈旧文件。Feishu 文档继续使用增量拉取和增量翻译来降低 API 与模型成本；REST 文档每次从 `master` 上的 OpenAPI 规格完整生成。英文输出、源 JSON、sidebar、快照、日文 `i18n` 输出和翻译缓存必须按同一份变更事实完成对账。

## 背景

2026-07-14 的 `fetch lark docs` 运行中，REST 生产任务在 `Validate and build generated docs` 步骤失败。`master` 已经把 on-demand cluster 文档从：

```text
reference/api/restful/restful/v2/control-plane/cluster-operations-v2
```

移动到：

```text
reference/api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2
```

但是 producer 先从 `DEV_BASELINE_SHA` 恢复了 `config/generated/restful.sidebar.js`，该 sidebar 仍然引用旧路径。后续 REST 生成输出了新路径，验证器看到 sidebar 指向的旧 `.mdx` 不存在，于是阻断构建。

这个问题不是 “规格维护在 `master`” 导致的。规格、生成器、workflow 代码仍然应该维护在 `master`。真正的问题是：恢复 `dev` 之后，本次选中的内容组没有被当作权威输出重新对账，导致最终工作区混入了旧输出和新输出。

## 核心定义

### `master`

`master` 是源事实，包含：

- OpenAPI 规格；
- Feishu/Lark 拉取与渲染代码；
- REST 生成器；
- 翻译脚本；
- workflow 与验证脚本；
- sidebar override 与生成规则。
- 当前 REST sidebar 快照；Apifox 生成命令不会重建该文件，因此 selected REST 组必须从当前 `master` 恢复它。

### `dev`

`dev` 是已发布生成物基线，包含：

- 英文生成文档；
- `config/generated/*.sidebar.js`；
- `i18n/ja-JP/**`；
- `.translation-cache/ja-JP.json`；
- last-success snapshots；
- 已确认可发布的报告和缓存状态。

`dev` 不是源事实。它只能作为未选中内容组的保留基线，不能让选中组的陈旧输出覆盖当前 `master` 逻辑。

### 内容组

现有内容组为：

```text
guides
python
java
node
go
cli
rest
```

每个内容组必须有一份明确的 ownership 元数据：

- 英文输出路径；
- sidebar 路径；
- Feishu 源 JSON 路径；
- last-success snapshot 路径；
- 日文 `i18n` 输出路径；
- 翻译缓存 key 前缀或可映射文档 ID；
- 报告路径。

### Canonical record 判定

Feishu Base/Bitable 中的记录分为可生成文档的 `canonical` record 和只用于组织导航的 `section` record。两类手册的判定来源不同：

- `guides` 在 Bitable 中有明确的 `Placement Type` 字段，继续以该字段为准；只有值为 `canonical` 的记录进入 source snapshot、增量 planner 和文档生成范围。
- SDK 参考手册（`python`、`java`、`node`、`go`、`cli`）没有可靠的显式 `Placement Type`。记录的 `Doc`/`Docs` 字段指向有效的 Feishu/Lark `wiki`、`doc`、`docs` 或 `docx` 链接时，将该记录推导为 `canonical`；否则推导为 `section`。
- SDK 的推导不能依赖 `Slug` 是否存在。`Slug` 是输出路径元数据，不是判断该记录是否代表源文档的依据。
- 普通文本、空值、外部 URL 和不能解析出飞书文档 token 的值都不能成为 SDK canonical record。

`section` record 可以参与 sidebar 层级和分类构建，但不进入 canonical source completeness 计数，不写入 canonical snapshot records，也不能因为自身没有源 JSON 而触发 full-fetch fallback。

### 对账

对账是把：

```text
dev 基线 + 本次内容组生成结果
```

变成：

```text
可验证、可提交、无陈旧文件的最终树
```

对账必须显式处理：

- `added`：本次新增文件；
- `modified`：本次改动文件；
- `deleted`：基线存在但本次不再存在的文件；
- `renamed`：路径移动，语义上等价于旧路径删除加新路径新增，翻译可选择迁移缓存。

## 正确流程

### Source producer 通用流程

所有 source producer 仍然先恢复 `dev`，因为未选中的内容组需要保留：

```text
checkout master_sha
restore generated state from dev_baseline_sha
prepare selected group workspace
run selected group generation
reconcile selected group English/source/sidebar output
validate generated sidebars
build docs
update selected group snapshot
create checkpoint artifact with explicit deletions
```

关键变化是 `prepare selected group workspace` 和 `reconcile selected group`：

- 未选中内容组继续来自 `dev`；
- 选中内容组不能盲目相信 `dev` 中的旧文件；
- 选中内容组的删除、移动、sidebar 变化必须在 artifact manifest 中表现为显式 deletions。

### REST

REST 不需要从 `dev` 恢复自己的输出。REST 输入是 `master` 中的 OpenAPI 规格和生成器，完整生成成本可接受。

REST producer 在恢复 `dev` 后必须清理 Apifox 可以完整重建的 operation trees：

```text
reference/api/restful/restful/v1/control-plane
reference/api/restful/restful/v1/data-plane
reference/api/restful/restful/v2/control-plane
reference/api/restful/restful/v2/data-plane
```

不能删除 `restful.md`、`versioning.md`、error-code 页面和版本 landing page 等不会由 Apifox 命令完整重建的 scaffolding。`config/generated/restful.sidebar.js` 也不是 Apifox 输出；它必须用当前 `master` 的版本覆盖从 `dev` 恢复的旧版本。

然后运行：

```text
npx docusaurus fetch-apifox-docs -s plugins/apifox-docs/meta/openapi/
```

REST source checkpoint 只发布英文 REST 输出和 REST sidebar。REST 的日文输出由后续 translation job 根据英文 source checkpoint 的 diff 处理，不能在 source producer 中直接清理 `i18n`。

### Feishu/Lark 内容组

Feishu 内容组继续使用 incremental planner。planner 的职责是决定工作范围，不负责最终文件系统对账。

`guides` 使用 wiki source，具备可比较的 wiki 节点元数据时可以继续做 source JSON 增量拉取。SDK/CLI 参考手册使用 Drive source，当前没有可靠的远端 revision metadata，因此不能做真正的 source JSON 增量拉取；正确做法是每次完整刷新该手册的 source JSON，然后用新 source hash 与 last-success snapshot 计算增量渲染、删除和 sidebar 对账。也就是说，SDK/CLI 的增量收益来自 render/output/translation planner，不来自 source JSON fetch。

planner 在比较 snapshot 前必须先按上述规则得到 canonical record 集合。对于 SDK 手册，新增飞书文档记录等价于新增 canonical record；删除飞书链接或把记录改为纯 section 等价于删除 canonical record，必须产生 `removed_records` 并清理旧源 JSON、英文输出、sidebar 项和后续日文输出。

planner 输出至少包含：

```json
{
  "mode": "incremental",
  "changed_tokens": [],
  "expanded_tokens": [],
  "removed_tokens": [],
  "removed_records": [],
  "reasons_by_token": {}
}
```

source producer 对 Feishu 组的处理规则：

- `expanded_tokens`：拉取源 JSON，渲染对应英文文档；
- `removed_records`：删除对应源 JSON，删除对应英文输出，触发 sidebar 重建；
- `changed_tokens` 为空且 `removed_records` 为空：保留该组从 `dev` 恢复的输出，但仍允许验证；
- planner 降级为 `full`：清空该组英文输出和 active manual 的源 JSON 后完整拉取与渲染；
- sidebar 在有新增、修改、删除时必须重建；
- last-success snapshot 只能在验证成功后更新。

SDK/CLI 输出根还包含不能由飞书 render 重建的 landing page。selected group 在恢复 `dev` 后，必须先用当前 `master` 的版本覆盖这些文件，再进入增量或 full render：

```text
python -> reference/api/python/python/python.md
java   -> reference/api/java/java/java.md
node   -> reference/api/nodejs/nodejs/nodejs.md
go     -> reference/api/go/go/go.md
cli    -> reference/cli/cli/Overview.md
```

Python、Node、CLI landing 位于生成输出根内，full render 的清理逻辑通过 sidebar override `inject` 列表显式保留。Java、Go landing 位于 `v2` 输出根外，但仍属于对应 content group 的 artifact ownership，否则从 `master` 恢复后的修改无法进入 source checkpoint。removed-record 对账只能删除 snapshot 记录的 canonical `output_paths`，landing page 没有 canonical token，不能被当成 removed record 输出删除。

为了让删除稳定，snapshot 应逐步记录每个 canonical record 的生成输出路径。对旧 snapshot，删除逻辑可以退化为：

- 用当前输出目录里的 frontmatter/id 反查 token；
- 用旧 sidebar 中的 doc id 推导路径；
- 找不到时输出警告并让 coverage 验证兜底失败。

### 日文 `i18n`

`i18n` 必须跟随英文 source checkpoint 对账。路径映射如下：

```text
docs/tutorials
  -> i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials

docs-byoc/tutorials
  -> i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials

reference/<path>
  -> i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/<path>
```

翻译 job 从 source checkpoint 的 commit diff 计算本组英文变化：

- 英文新增或修改：进入翻译 manifest；
- 英文删除：删除对应日文文件；
- 英文重命名：删除旧日文文件；如果可证明内容 hash 未变，可迁移翻译缓存，否则按新路径重新翻译；
- 只有删除、没有需要翻译的文件时，也必须创建 translation checkpoint，不能返回 `no_changes`。

source delta 不能成为唯一候选集合。否则本次超出 `max_files` 的文件或模型翻译失败的文件，在下一次 source diff 中消失后将永远无法重试。manifest 的正确规则是：

- 本次 `changedEnglish` 优先入队；
- 继续用 target 是否存在和 cache `sourceHash` 扫描历史 pending backlog；
- `max_files` 在“当前变化优先、历史 backlog 在后”的完整候选集上截断；
- durable batch 的 pending-set identity 必须包含 `source_delta`，避免准备阶段和执行阶段对删除事实理解不一致。

当没有模型翻译文件、但存在实际日文删除或 cache 删除时，durable workflow 生成一个 `pendingCount=0` 的 reconciliation-only batch，仍然执行 coverage/build、创建 artifact 并发布 deletion。

`.translation-cache/ja-JP.json` 不允许 last-writer-wins。现有 artifact apply 已经做三方 merge；新逻辑必须补充删除/重命名处理：

- 英文删除时删除对应 cache entry；
- 英文重命名时删除旧 source key；新路径重新进入翻译队列，避免把旧 target/hash 错当成新路径已完成；
- 发生 cache 冲突时失败，不自动覆盖。

当前 cache 以英文 `sourcePath` 为 key，并在 value 中记录日文 `targetPath`。删除逻辑同时按 source key、targetPath 和旧版 target-key 兼容形式清理。

### Artifact 与 publisher

source artifact 和 translation artifact 都必须包含显式 deletions。现有 `create-checkpoint-artifact.js` 已经会比较 baseline/current 并生成 `deletions`，这项能力要继续作为发布事实。

需要补充的是：

- producer 在创建 artifact 前必须确保 selected group 的 current tree 已经完成对账；
- translation job 在创建 artifact 前必须把 source deletions 映射到 `i18n` deletions；
- publisher 继续用 `apply-checkpoint-artifact.js` 应用 files 和 deletions；
- workflow policy 要禁止绕过 artifact deletions 直接复制目录。

## 验证规则

### 英文

`scripts/validate-generated-sidebars.js` 已经验证 REST sidebar 指向真实文件。需要扩展为所有 reference sidebars 的 doc-target 验证，至少覆盖：

```text
python.sidebar.js -> reference/api/python/python
java.sidebar.js   -> reference/api/java/java/v2
node.sidebar.js   -> reference/api/nodejs/nodejs
go.sidebar.js     -> reference/api/go/go/v2
cli.sidebar.js    -> reference/cli/cli
restful.sidebar.js -> reference/api/restful/restful
```

guides 继续使用 source/sidebar/docs coverage 验证。

### 日文

新增 translated coverage 验证：

- 本组 `i18n` 文件不能存在对应英文源文件已删除的孤儿文件；
- 日文 sidebar/config 不能引用英文已不存在的 doc id；
- 新增英文文件允许暂时没有日文翻译，但必须被翻译 manifest 报告为 pending 或 translated；
- 删除-only translation checkpoint 必须能通过 MDX parse 和 build 验证。

### REST

REST 必须有专门回归测试：

- `dev` baseline 含旧 `cluster-operations-v2/*on-demand*` 文件和旧 sidebar；
- `master` 规格生成新 `on-demand-cluster-operations-v2`；
- producer 清理 REST 英文 owned paths 后生成；
- source artifact manifest 含旧路径 deletions；
- validation 通过。

### Feishu

Feishu 必须有删除和移动测试：

- guides 显式 `Placement Type=section` 的记录即使含飞书链接也不进入 canonical 集合；
- SDK 记录没有 `Placement Type` 时，含有效飞书文档链接的记录进入 canonical 集合，不含文档或只含外部链接的记录作为 section；
- SDK canonical 判定不要求 `Slug`；
- snapshot 中存在 record，当前 Base scan 移除该 record；
- planner 产生 `removed_records`；
- source JSON、英文输出、sidebar entry 被删除；
- translation job 删除对应 `i18n` 文件和 cache entry；
- artifact manifest 含英文和日文 deletions。

## 失败语义

- REST 完整生成失败：source producer 失败，不发布 checkpoint。
- Feishu incremental planner 无法证明 source cache 完整：降级 full fetch。
- Feishu removed record 找不到旧输出路径：记录 bounded warning，并让 coverage 验证失败，禁止发布。
- 英文 source checkpoint 成功但 translation 删除对账失败：source checkpoint 保留，translation checkpoint 失败。
- 删除-only translation checkpoint：应该发布，不能因为没有模型翻译文件而跳过。
- cache merge 冲突：translation publisher 失败，保留 source checkpoint。

## 非目标

- 不把 REST 规格迁移到 `dev`。
- 不把 `dev` 当作 source of truth。
- 不要求 REST 增量生成。
- 不要求新增英文文档必须在同一个 source producer 内完成日文翻译。
- 不用百分比阈值判断 coverage。
- 不允许通过忽略 validator 来绕过 stale 文件问题。

## 实施与验证结果

- 内容组 ownership、REST prepare、Feishu removed-record 对账、翻译 source delta、deletion-only checkpoint、reference sidebar coverage 和日文 orphan coverage 已实现。
- 一次性删除了 7 个位于旧 `cluster-operations-v2` 路径、已经失去英文 source 的日文 REST 文件，并清理对应翻译 cache key。
- 当前 coverage 无 orphan；pending 为 guides 6、python 3、java 1、go 1、rest 9，node/cli 为 0。Java/Go 的 pending 是新增纳入 ownership 的 landing page 日文翻译。pending 默认报告但不阻塞，后续由增量翻译消费。
- REST dry run 已验证：operation trees 清理后可从当前 OpenAPI 规格完整生成，生成结果与已提交树一致，sidebar 使用 `on-demand-cluster-operations-v2`。
- 核心单测、workflow policy、sidebar/translated coverage 均通过。
- Docusaurus `en` 与 `ja-JP` 静态构建通过。完整 build-stage 的线上 sitemap link-check 在受限网络中因无法解析 `docs.zilliz.com` 失败；使用仓库支持的 `--skipLinkChecks --skipCardReporting` 后构建成功。
