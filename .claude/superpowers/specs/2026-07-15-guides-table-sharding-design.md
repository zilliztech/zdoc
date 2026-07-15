# Guides 按表增量生产、记录语义与离线 Render 设计

## 背景

Guides 的真实来源是 Base `Ac7xbs2k1ad7bjsCXr0ccHe9nMh`。该 Base 当前包含 9 张表：

| 表 | canonical | section | ref | link | canonical target |
| --- | ---: | ---: | ---: | ---: | --- |
| Deployment | 20 | 0 | 0 | 0 | BYOC |
| Get Started | 49 | 2 | 0 | 0 | SaaS/BYOC |
| Development | 158 | 27 | 0 | 0 | SaaS/BYOC |
| Management | 115 | 27 | 10 | 0 | SaaS/BYOC |
| Client Libraries | 1 | 0 | 0 | 6 | SaaS/BYOC |
| Tools | 23 | 0 | 0 | 1 | SaaS/BYOC |
| AI Models | 2 | 2 | 5 | 0 | SaaS |
| Architecture | 5 | 1 | 0 | 0 | SaaS/BYOC |
| Solution | 0 | 0 | 0 | 0 | 无内容 |

Base 中当前 373 条 canonical 的 `Progress` 均为 `Draft`。`Draft` 是允许发布的日常编辑状态；代码仍必须防御未来出现的空 Progress，空 Progress canonical 不下载正文、不进入发布 source snapshot，也不发布页面。之前将 `Client Libraries`、`Tools` 视为 nav-only，并为 Agents 另建 producer，均与真实 Base 数据冲突。

## 目标

1. 使用 Base 记录语义作为内容和导航的唯一事实来源。
2. 保留一个全局 Guides source graph，按表并行 render。
3. render 阶段只消费 source/media artifact，不调用 Feishu、Figma、S3 或模型 API。
4. 保留 `-doc` 和普通 `-token` 的在线单文档发布能力。
5. assemble 后生成一个 Guides checkpoint，由现有 publisher 串行提交。

## 非目标

- 不把每张表拆成独立 source cache。
- 不提高 Feishu/Figma API 并发。
- 不改变 SDK、REST 和 translation 的发布协议。
- 不用宽泛 coverage 白名单掩盖 source graph 或 sidebar 错误。

## SDK 发布隔离

根据 `config/lark-docs.config.ts` 和真实 Base schema，除 Guides 外共有 18 个 SDK manuals。18 个 SDK Base 全部是单表，分为三类：

| 类型 | Manuals | sourceType | 主要结构字段 |
| --- | --- | --- | --- |
| 现代 SDK | Python 4 个、Java V2 4 个、Node.js 4 个、Go 2 个、CLI 2 个 | drive | `Type`、`父记录`、公式 `Slug` |
| Java legacy | `javaV1` | onePager | `Token`、`Parent`、公式 `Slug` |
| Go legacy | `gov1` | wiki | `Parent`、公式 `Slug`，无 `Type` |

以 Python SDK Base `D1VabelmAansLwsNTvLc2Wxxn1g` 为例：

- 只有一张表，不使用 Guides 的 `base:*` 多表导航模式；
- 没有 `Placement Type` 字段；
- 使用 `Type` 表达 Module/Class/Function/VirtualNode；
- 使用 `父记录`、公式 Slug、Milvus/Zilliz Targets；
- `sourceType` 为 `drive`，并由 `larkDriveWriter` 继承通用 writer。

现代 SDK 的 `Type` 选项包括 Module/Class/Function/VirtualNode/Enum，部分表还保留历史函数选项；Targets 除 Milvus/Zilliz 外可能包含 SDK repo 名称。Java V1 和 Go V1 使用不同 legacy schema。没有任何 SDK Base 使用 Guides 的 `Placement Type`。

因此本设计必须满足：

- 四种 Placement Type 语义封装在 Guides 专用 helper 中，只对显式带 `base_placement_type` 的 source，或 `base_table_id === '*'` 的 Guides 多表模式生效；
- 不改变 SDK 的 Type/父记录/Slug/Targets/Progress 解释；
- navigation snapshot schema v3 和 `affected_tables` 只用于 Guides，多数 SDK snapshot 继续保持现有协议；
- table matrix、table artifacts、offline render workflow 只接入 Guides；
- `larkDriveWriter` 未注入 resolver 时保持原构造和在线媒体行为；
- `run-content-group.js` 中 Python/Java/Node/Go/CLI 命令序列保持不变。

SDK 表中 Feishu 文档和结构记录的既有判定由 SDK writer 继续处理，不在本次 Guides 改造中迁移到 Placement Type schema。

Agents 内容已经完整合并进 Guides Tools 表。Tools 表是唯一来源，不再保留独立 Agents manual、Base、sidebar、producer 或单文档发布入口。Agents 页面统一通过 `manual=guides` 和 Tools 表 canonical token 发布。

## Base 记录语义

### canonical

- `Docs` 必须指向 Feishu/Lark 文档。
- 必须获取具有正文 blocks 的真实 source。
- `Progress` 为 `Draft/Reviewed/Published/Approved/Publish` 且 target 匹配时生成页面。
- 必须进入导航。
- 空 Progress、`Not Start Yet/WIP/Deprecated` 不发布。
- `FAQs` 是显式特例：一个 canonical source 展开为多篇 FAQ 页面，外层只生成无 landing page 的 category，不生成 `faqs/faqs` 页面。

### section

- 必须进入导航并形成目录层级。
- 不生成 landing page。
- 子记录通过 `Parent` 挂载在 section 下。
- section 自身不要求正文 source。

### link

- 必须进入导航。
- 导航目标来自 `Ref Target Doc`。
- 不生成本地页面。

### ref

- 必须进入导航。
- `Ref Target Doc` 指向一个 canonical token。
- 不重复生成正文；导航复用 canonical 页面 ID，并输出为 Docusaurus `{type: 'doc', id}`。
- 与 canonical 主导航项的区别由稳定的 `ref:` key 标识，而不是创建新的页面或 doc ID。
- ref 不要求 Base `Slug`；ref key 在 Slug 为空时使用目标 canonical 的 slug，页面目标始终以 canonical token 对应的实际 doc ID 为准。
- 允许表内和跨表引用。

### 缺省 Placement Type

保持已经确认的 Guides 兼容规则：`Docs` 是 Feishu/Lark 文档链接时视为 canonical，否则视为 section。显式的 `canonical/section/link/ref` 始终优先。该推断不能覆盖 SDK 的 `Type` 模型。

## Source Graph

### 全局图

Base 扫描、Parent 层级、link/ref 解析、跨表引用图和增量 planner 继续以整个 Guides manual 为单位。表级 job 只拆分 render，不拆分 source truth。

### canonical 完整性

仅存在 `<token>.json` 不代表 source 完整。进入发布集合的 canonical source 必须同时满足：

- 文件位于 source root 内且不是 symlink；
- hash 与 snapshot 一致；
- token identity 匹配；
- 不是 `base_nav_virtual` 占位节点；
- 包含可渲染 page block 和非空正文 blocks。

空 Progress 或其他不可发布状态的 canonical 仍保留在 `navigation_records` 中，以便状态变化触发表级协调，但不计入 source completeness 的 expected canonical 数量。全量 wiki source fetch 必须先以 `hydrateLinkedDocs: true` 补齐所有可发布 canonical；增量 token fetch 和表级 render 不执行全量 hydration。

section/link/ref 可以使用 virtual source，因为它们只描述导航。

如果 cache 中任一 canonical 只有 virtual source，source completeness 必须失败，incremental planner 必须转为 full fetch。full fetch 后仍有 virtual canonical 时，source artifact 创建必须失败，不能让 render 静默恢复 dev 中的旧页面。

### 导航快照

Guides snapshot 除 canonical 文档 identity 外，还要保存全部 Base 记录的导航 identity：

- `record_id`、`table_id`、Placement Type；
- Parent、顺序、Labels、Slug；
- Targets、Docs token/link、Ref Target Doc。

section 移动、link 地址变化、ref 目标变化同样必须触发该表重新协调。导航变化不一定需要重新拉正文，但必须进入 `affected_tables` 并重新生成最终 sidebar。

SDK snapshot 不要求 `navigation_records`，不能因为缺少 Guides schema v3 字段而被强制 full fetch。

## 表级 Render

### Matrix

matrix 不再使用硬编码“nav-only 表”。它由当前 snapshot 和 plan 共同决定：

1. full plan：包含所有拥有 publishable canonical 的 `target × table`。
2. incremental plan：只包含 `affected_tables` 中当前仍拥有对应 target canonical 的组合。
3. 删除最后一条 canonical 后，该表/target 仍需产生清空 artifact。
4. 只有 section/link/ref 且没有 canonical 的表不启动内容 render，但仍参与 assemble 的 sidebar 生成。

当前预期组合为 14 个：Deployment BYOC；AI Models SaaS；其余 Get Started、Development、Management、Client Libraries、Tools、Architecture 各 SaaS/BYOC。matrix 只统计满足 Progress 与 Targets 门槛的 canonical。

### Ownership

每张表拥有其 slug 对应的目录：

- `docs/tutorials/<table-slug>`
- `docs-byoc/tutorials/<table-slug>`

表级 render 先清理自己的目录，再执行 `write_subtree(outputDir, base:<tableId>)`。section 形成目录，canonical 写页面，link/ref 只影响导航。

`Tools` 表已经包含完整 Agents & Prompts canonical 树和 Terraform Provider，因此它是唯一生产者。删除独立 Agents config/source/render/artifact、`agents.sidebar.js`、fragment merge 和 publish-bot manual 路由，不再维护两套来源。

### 离线边界

表级 render 使用显式 `--offline`，并要求：

- 必须同时使用 `--skipSourceDown`；
- canonical/导航 metadata 缺失时直接失败，不回退查询 Bitable；
- media 必须命中 manifest，未命中直接失败；
- 禁止 Feishu token、媒体下载、Figma、S3 和模型请求；
- 禁用 Docusaurus/npm update notifier。

`-s3` 在 offline render 中只表示输出 S3 URL，不允许调用 S3 client 的网络方法。

`-doc` 和普通 `-token` 默认仍是 online：允许刷新指定 source、下载媒体并上传 S3。offline 是 opt-in，不能改变既有单文档发布命令。

### 恢复通用 Writer 边界

media-prefetch 初版在 commit `6dcc67dec` 中把 manifest 查找直接写入 `larkDocWriter.__image/__board/__iframe`，并通过全局环境变量改变 `larkImageDownloader`。这使 Guides workflow 的特殊策略侵入了所有 manual 和单文档命令。

改造时先用回归测试固定 prefetch 之前的 online 行为，再恢复以下边界：

- 未注入 media resolver 时，writer 完整保留原有下载、caption、retry、本地写入和 S3 上传逻辑；
- `larkImageDownloader` 只负责在线下载/上传和通用限流，不读取 Guides manifest；
- 新建 `offlineMediaResolver`，只由 `--offline` 表级 render 注入 writer；
- resolver 命中时返回 caption/object key/final URL，miss 时立即失败；
- Figma limiter 属于 downloader 的在线稳定性能力，可以保留，不与 manifest 耦合。

这样无需大改 `larkDocWriter`，也不会让 `-doc`、SDK manuals 或普通 `-token` 意外进入 prefetch/offline 模式。

## Media Prefetch

source 阶段根据计划收集本轮可能 render 的 canonical media references。prefetch 可以并发下载，但 Figma 使用全局保守 limiter。manifest 只记录 media identity、caption、object key 和最终 S3 URL，不保存二进制。

所有表 job 通过显式注入的 `offlineMediaResolver` 读取同一个 immutable manifest。prefetch 是本轮唯一允许调用 Feishu media、Figma 和 S3 的阶段。

## Sidebar 与 Assemble

表级 job 不写 sidebar。assemble：

1. 恢复 immutable dev baseline；
2. 恢复 source artifact；
3. 恢复全部表级 artifacts；
4. 根据完整 Base graph 生成 SaaS/BYOC sidebar；
5. 验证四种 Placement Type 的契约；
6. 运行完整 Docusaurus build；
7. 创建一个 Guides checkpoint。

`sidebarsTutorial.ts` 只保留默认 Guides sidebar 和 `releasesSidebar`。Release Notes 在主导航中只有一个 `/docs/changelogs` 入口，进入后由 `releasesSidebar` 展开具体版本。

## 验证约束

- 除 FAQs 外，每个 target canonical 必须存在且只存在一个生成页面，并被 sidebar doc/category link 覆盖。
- FAQs canonical 必须展开为至少一篇 FAQ 页面，所有展开页进入无 landing link 的 category，且不得生成 `faqs/faqs` 页面。
- section 必须产生导航 category，但不得要求同名 landing page。
- link 必须保留 href，不得要求本地文件。
- ref 必须解析到存在的 canonical 页面，并以复用该页面 ID 的 doc item 进入导航，不得重复写正文。
- table artifact 只能修改自己的目录，拒绝越界、重复路径、checksum 和 identity 错误。
- render workflow 不得接收 Feishu/Figma/AWS/model secrets。
- `-doc`/online `-token` 回归测试必须证明在线发布路径仍可用。
- SDK manual 回归必须证明 command sequence、drive hierarchy、sidebar、media 和 snapshot 行为未改变。

## 迁移策略

先修复 source completeness 和 Base 语义，再启用表级 matrix。旧的完整 Guides/Agents artifacts 只用于发现问题，不能作为新 assemble 的正确性 fixture，因为其中包含 virtual canonical 对应的陈旧页面。

首个生产验证必须强制 full source fetch，并观察 canonical hydration、14 个表 job、第三方请求日志、sidebar coverage、publication 和 translation 状态。
