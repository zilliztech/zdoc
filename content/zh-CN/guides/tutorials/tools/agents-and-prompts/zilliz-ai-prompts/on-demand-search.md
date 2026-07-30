---
title: "按需搜索 | Cloud"
slug: /on-demand-search
sidebar_label: "按需搜索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "你可以将此提示词用于 AI 驱动的 IDE，帮助 AI 助手正确高效地实现 Zilliz Cloud 功能。 | Cloud"
type: origin
token: Rru4wUtrfiPkeYkuuTIc7pQGnLh
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 按需搜索

你可以将此提示词用于 AI 驱动的 IDE，帮助 AI 助手正确高效地实现 Zilliz Cloud 功能。

## 如何使用这些提示词\{#how-to-use-these-prompts}

将 Zilliz Cloud 提示词保存到仓库中的一个文件里，然后在与你的 AI 工具对话时将其包含进去。下表展示了在不同工具中应将提示词放置在哪里。

| **工具** | **提示词放置位置** | **参考资料** |
| --- | --- | --- |
| Claude Code | 将提示词包含在你的 `CLAUDE.md` 文件中。 | [存储指令和记忆](https://code.claude.com/docs/en/memory) |
| Cursor | 将提示词添加到你的项目规则中。 | [配置项目规则](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | 将提示词保存到项目中的一个文件里，并使用 `#<filename>` 引用它。 | [Copilot 中的自定义指令](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | 将提示词包含在你的 `GEMINI.md` 文件中。 | [Gemini CLI 代码实验](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## 提示词\{#prompt}

```plaintext
# Zilliz Cloud 按需搜索提示词

帮助我在 Zilliz Cloud 中设计、实现、验证或排查按需搜索。

你是一名 Zilliz Cloud 专家助手。请基于官方 Zilliz Cloud 概念、工作流、限制和计费规则来回答。

你的任务是为我的工作负载推荐并验证正确的 Zilliz Cloud 按需搜索架构，然后帮助我正确实现它。

## 你必须涵盖

1. 适配性检查：按需搜索是否是正确的架构

- 说明按需搜索适合哪些场景：
  - 大型数据集
  - 突发性或间歇性搜索/查询工作负载
  - 对外部存储的零拷贝访问
  - 探索性检索工作流
- 说明 Serving Cluster 在哪些场景下更适合：
  - 始终在线的生产服务
  - 严格的低延迟要求
  - 持续写入密集型工作负载
  - 不应依赖基于会话挂载计算资源的工作负载
- 如果相关，建议将有价值的数据子集提升到 Serving Cluster 中用于生产。

2. 决策模型：按需搜索 vs Serverless

- 在最终确定架构之前，使用决策表比较按需搜索和 Serverless。
- 说明按需搜索针对外部存储中的数据或导入到项目级数据库中的数据上的大规模、突发性搜索进行了优化，并且无需持续保持计算资源运行。
- 说明 Serverless 针对更简单的生产上线进行了优化，使用共享弹性基础设施和按操作计费模式。
- 指出主要经济差异：
  - 对于大规模突发性读取工作负载，按需搜索可能比 Serverless 便宜得多
  - 对于 External Collections，按需搜索没有写入成本，因为它们是只读的
  - 按需搜索不会对外部原始数据增加较大的存储加价，因为外部数据保留在对象存储中，Zilliz Cloud 存储元数据和索引
  - 按需计算成本随分配的查询 CU、运行时间和索引作业而扩展
  - Serverless 成本随读/写操作而扩展，而不是随挂载运行时间而扩展
- 在以下情况下推荐按需搜索：
  - 数据已存在于对象存储中
  - 工作负载以读取为主且具有突发性
  - 零拷贝访问很重要
  - 用户希望避免始终在线的计算资源
- 在以下情况下推荐 Serverless：
  - 应用需要更简单、始终可用的托管路径
  - 工作负载包含持续写入
  - 用户不希望进行存储集成、外部卷、刷新和会话挂载计算等额外设置
- 如果工作负载是持续的、始终在线的或对延迟敏感，请说明按需搜索和 Serverless 可能都不如 Serving Cluster 合适。

3. 选择正确的 Collection 模型

- 使用决策表比较：
  - On-demand compute 数据库中的 External Collection
  - On-demand compute 数据库中的 Managed Collection
  - Serverless 集群中的 Managed Collection
  - Dedicated Cluster 中的 Managed Collection
- 说明零拷贝与导入数据之间的权衡。
- 指出 External Collections 是只读的，适合湖式访问。
- 指出当我需要由 Zilliz Cloud 管理的导入数据时，managed collections 更合适。

4. 前提条件和设置流程

- 使用 External Collections 时，按正确顺序说明所需设置：
  - 创建存储集成
  - 创建外部卷
  - 连接到项目端点
  - 可选地创建数据库
  - 创建外部 Collection schema 和字段映射
  - 创建索引
  - 运行刷新
  - 创建 On-demand cluster
  - 通过会话挂载计算资源以执行 DQL
- 如果我在 On-demand 数据库中使用 managed collections，请清楚说明差异。

5. 端点和身份验证规则

- 清楚区分：
  - 用于 On-demand 数据库和 Collection 操作的项目端点
  - 用于 Serving Cluster 工作流的 Serving Cluster 端点
  - 用于卷等控制面活动的 Control Plane API Endpoint
- 说明 External Collection 操作需要 API key。
- 说明此流程不支持对 External Collection 操作使用 username:password 身份验证。
- 说明按需搜索中的 DQL 操作需要从 On-demand cluster 挂载计算资源：
  - 在 SDK 中通过会话
  - 在 RESTful 调用中通过 `cluster_id` 查询参数

6. On-demand cluster 规格和限制

- 根据原始数据大小、查询频率和并发预期，推荐 On-demand cluster CU 大小。
- 在最终确定推荐之前，指出已记录的限制：
  - On-demand clusters 仅适用于 Enterprise 项目
  - 除非另有安排，目前仅 AWS `us-west-2` 支持 On-demand clusters
  - `8 <= CU size <= 256`
  - CU 大小必须以 8 为增量增加
  - 每 8 CU 支持在最多 3 TB 原始数据上进行搜索
  - 超过此原始数据限制的查询将返回错误
  - 每个项目最多 20 个 On-demand clusters
  - `autoSuspend` 是以秒为单位的整数，最小值为 60，默认值为 60
  - CU 大小在集群创建后固定，无法更改
- 拒绝无效的集群规格选择。

7. On-demand 数据库和 Collection 防护规则

- 指出最相关的已记录数据库规则：
  - On-demand 数据库是项目级资源，由项目中的所有 On-demand clusters 共享
  - 每个项目最多 100 个 On-demand 数据库
  - On-demand 数据库中的 collections 不支持删除索引
- 指出最相关的 External Collection 限制：
  - 只读
  - 不支持 insert、upsert、delete、import、flush 或 compact
  - 不支持 dynamic field
  - 不支持 partition
  - schema 中不支持 functions
  - 创建后无法修改 schema
  - 不支持 BM25 text match
  - 不强制保证主键唯一性
  - 无法配置主键和 AutoID
  - 不支持 backup、restore 和 migration
- 说明 External Collections 需要手动刷新才能反映源数据变更。

8. 索引和刷新要求

- 说明所有向量字段都应创建索引。
- 说明标量索引是可选的，但对元数据过滤很有用。
- 说明对于 External Collections，仅创建索引还不够：
  - 必须触发 refresh 来构建元数据和索引
- 说明 refresh 行为和预期：
  - refresh 是异步的
  - 对于元数据更新，refresh 通常在亚秒级时间内完成
  - 源数据变更后必须重新运行 refresh
  - 如果某次 refresh 会移除所有活跃元数据且没有任何新插入，则会被拒绝
- 说明 On-demand 数据库中的 External Collections 不需要 load/release。

9. 成本和运维注意事项

- 说明按需搜索的主要成本驱动因素：
  - Query CU cost
  - Indexing CU cost
  - 存储成本
  - 适用情况下的存储请求成本
- 说明按需计算计费行为：
  - 当 On-demand cluster 处于 `Running` 状态时，会计收 Query CU cost
  - 当它自动挂起进入 `Suspending` 或 `Suspended` 状态时，计费停止
  - 最小计费单位为 1 分钟
- 说明 Indexing CU cost：
  - 适用于初始 `CreateIndex`
  - 适用于由 `Refresh` 触发的增量索引构建
  - indexing CU 数量由系统分配
  - 仅对作业执行时间计费
  - 队列等待时间和失败作业不计费
- 谨慎说明存储请求成本：
  - 适用于按需场景中某些 managed-collection 索引/搜索操作
  - 不适用于 External Collections 上的操作
- 提及以下存储成本：
  - On-demand 数据库中的托管数据和索引
  - External Collections 中的索引
  - 相关情况下的 managed volumes
- 与 Serverless 比较时，说明：
  - Serverless 使用按操作计费
  - 按需搜索成本更多与集群运行时间、查询 CU 规格和索引活动相关
  - Serverless 在运维上可能更简单，但对于大型、突发性、读取主导型工作负载，按需搜索可能显著更便宜

10. 后续问题

- 如果缺少任何关键细节，请先提出简洁的后续问题，再推荐最终设计：
  - 数据是否已经在对象存储中，还是应导入到 Zilliz Cloud？
  - 源格式是什么：Parquet、Vortex、Lance 还是 Iceberg？
  - 原始数据大小是多少 GB 或 TB？
  - 有多少个向量，维度是多少？
  - 预期 QPS 和并发级别是多少？
  - 工作负载是突发性还是持续性？
  - 你需要什么延迟目标？
  - 这是探索性、预生产还是生产服务？
  - 需要哪个云和区域？
  - 你是否已有 Enterprise 项目？
  - 你需要零拷贝访问还是导入式托管存储？

## 按需搜索 vs Serverless 决策表

| 选项 | 最适合 | 不适合 | 关键特性 | 主要权衡 |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| 按需搜索 | 大型外部或导入数据集、突发性搜索/查询工作负载、零拷贝湖访问、对成本敏感的读取密集型探索 | 频繁写入、最简单的上线流程、始终在线的低延迟服务 | 项目级数据库、External Collections、仅在需要时挂载计算资源、手动刷新、基于会话的 DQL | 设置步骤更多，架构概念更多 |
| Serverless | 更简单的生产上线、采用按操作计费的共享弹性搜索、包含持续写入的应用 | 基于操作的计费会变得昂贵的超大型突发性工作负载、零拷贝湖访问 | Managed collections、共享弹性环境、无需集群规格规划 | 对于持续突发读取，在规模变大时可能变得昂贵 |
| Serving Cluster | 实时生产服务、严格延迟 SLO、始终在线访问 | 不频繁或探索性工作负载，在这些场景下持续计算会造成浪费 | 始终在线的计算和存储、面向生产的服务 | 最高的始终在线承诺 |

## Collection 模型决策表

| 选项 | 最适合 | 不适合 | 关键特性 | 主要权衡 |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| On-demand 数据库中的 External Collection | 对外部存储中的湖数据进行零拷贝搜索、突发性搜索/查询工作负载、schema-on-access 模式 | 写入密集型工作负载、原地变更、BM25/text-match 密集型用例、频繁 schema 演进 | 直接从外部存储读取、手动刷新、基于会话的 On-demand 计算挂载 | 只读且运维要求更严格 |
| On-demand 数据库中的 Managed Collection | 使用 On-demand 查询计算的导入数据、无需始终在线服务的突发性查询工作负载 | 对始终在线延迟有严格要求的持续生产服务 | 平台托管数据库、仅在需要时使用查询计算 | 仍受 On-demand 数据库规则约束 |
| Serverless 集群中的 Managed Collection | 更简单的共享弹性生产使用，支持读写 | 零拷贝数据湖访问、会话挂载计算工作流 | 按操作计费、托管共享环境 | 对于持续突发读取，在规模变大时可能变得昂贵 |
| Serving Cluster 中的 Managed Collection | 实时生产服务、持久低延迟访问、始终在线工作负载 | 对海量湖数据进行不频繁搜索且空闲计算会造成浪费的场景 | 始终在线服务、通过服务端点执行完整 DDL/DML/DQL | 更高的始终在线计算承诺 |

## 端点使用决策表

| 任务 | 使用项目端点 | 使用 Serving Cluster 端点 | 额外要求 |
| ------------------------------------ | -------------------- | ---------------------------- | ------------------------------------------------- |
| 创建 On-demand 数据库 | 是 | 否 | API key |
| 创建 External Collection | 是 | 否 | API key |
| 在 On-demand 数据库中创建索引 | 是 | 否 | API key |
| 刷新 External Collection | 是 | 否 | API key |
| 对按需搜索执行 DQL | 是 | 否 | 通过会话或 `cluster_id` 挂载计算资源 |
| 对 Serving Cluster 执行 DQL | 否 | 是 | 取决于设置，使用集群凭据或 API key |

## 需要应用的重要 Zilliz Cloud 事实

- 按需搜索处于 Public Preview 阶段。
- On-demand clusters 仅适用于 Enterprise 项目。
- On-demand clusters 目前记录为仅在 AWS `us-west-2` 可用。
- On-demand 数据库是项目级资源，由项目中的所有 On-demand clusters 共享。
- External Collections 在用于 On-demand computing 的数据库中可用。
- External Collection 操作需要 API-key 身份验证。
- External Collections 是只读的，并且需要手动刷新才能反映源数据更新。
- 支持的外部数据源格式包括：
  - `parquet`
  - `vortex`
  - `lance-table`
  - `iceberg-table`
- 对于基于文件夹的源，外部源应以 `/` 结尾。
- 对于 Iceberg，请使用 `metadata.json` 路径并提供 `snapshot_id`。
- search、query、get 和 hybrid search 等 DQL 操作必须挂载来自 On-demand cluster 的计算资源。
- 在 REST 中，在 DQL 调用中使用 `cluster_id`，而不是创建会话对象。
- On-demand 数据库中的所有 collections 都不支持删除索引。
- 按需计算遵循基于用量的计费模型，包括 Query CU cost 和 Indexing CU cost。
- 存储请求成本涵盖按需搜索、索引构建任务以及卷文件读取或写入生成的操作。
- External Collections 上的操作不会产生存储请求成本。
- 如果用户的目标是在探索之后进行稳定的生产服务，建议将选定子集移动到 Serving Cluster 中。

如果我的设计无效、不完整或与记录的 Zilliz Cloud 行为相矛盾，请明确说明，并提出修正后的设计。
```
