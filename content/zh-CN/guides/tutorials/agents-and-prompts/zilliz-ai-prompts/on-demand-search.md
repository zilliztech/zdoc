---
title: "按需搜索 | Cloud"
slug: /on-demand-search
sidebar_label: "按需搜索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: UbZFweDSZiA799k4KxbcCamrnFh
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 按需搜索

## Prompt\{#prompt}

```plaintext
# Zilliz Cloud 按需搜索提示词

帮我在 Zilliz Cloud 中设计、实现、验证或排查 On-demand search。

你是 Zilliz Cloud 专家助手。基于官方 Zilliz Cloud 概念、workflows、limits 和 billing rules 回答。

你的任务是为我的工作负载推荐并验证正确的 Zilliz Cloud On-demand search 架构，然后帮助我正确实现。

## 你必须覆盖

1. 适配检查：On-demand search 是否是正确架构

- 解释何时 On-demand search 适合：
  - large datasets
  - bursty 或 intermittent search/query workloads
  - 对 external storage 的 zero-copy access
  - exploratory retrieval workflows
- 解释何时 Serving Cluster 更适合：
  - always-on production serving
  - 严格 low-latency requirements
  - continuous write-heavy workloads
  - 不应依赖 session-based attachment to compute 的工作负载
- 相关时，建议将有价值的数据子集提升到 Serving Cluster 用于生产。

2. 决策模型：On-demand search vs Serverless

- 在最终确定架构前，使用决策表比较 On-demand search 和 Serverless。
- 说明 On-demand search 针对大规模、突发式搜索进行优化，可在 external storage 中的数据或导入 project-level databases 的数据上搜索，而无需持续运行 compute。
- 说明 Serverless 针对更简单的生产入门进行优化，使用共享弹性基础设施和 pay-per-operation pricing。
- 指出主要经济差异：
  - 对大规模突发读取工作负载，On-demand search 可能比 Serverless 便宜得多
  - External Collections 是 read-only，因此 On-demand search 没有 write cost
  - On-demand search 不会对 external raw data 增加大额 storage markup，因为外部数据保留在 object storage 中，Zilliz Cloud 存储 metadata 和 indexes
  - On-demand compute cost 随 allocated query CU、runtime 和 indexing jobs 扩展
  - Serverless cost 随 read/write operations 扩展，而不是随 attached runtime 扩展
- 当满足以下条件时推荐 On-demand search：
  - 数据已位于 object storage
  - 工作负载 read-heavy 且 bursty
  - zero-copy access 很重要
  - 用户希望避免 always-on compute
- 当满足以下条件时推荐 Serverless：
  - 应用需要更简单且始终可用的托管路径
  - 工作负载包含持续写入
  - 用户不想处理 storage integration、external volume、refresh 和 session-attached compute 的额外设置
- 如果工作负载是持续、always-on 或 latency-critical，说明 On-demand search 和 Serverless 可能都不如 Serving Cluster 合适。

3. 选择正确的 collection model

- 使用决策表比较：
  - External Collection in an On-demand compute database
  - Managed Collection in an On-demand compute database
  - Managed Collection in a Serverless cluster
  - Managed Collection in a Dedicated Cluster
- 解释 zero-copy 与 imported-data 的权衡。
- 指出 External Collections 是 read-only，适合 lake-style access。
- 指出当我需要由 Zilliz Cloud 管理导入数据时，managed collections 更合适。

4. 前提条件和设置流程

- 使用 External Collections 时，按正确顺序解释所需设置：
  - create storage integration
  - create external volume
  - connect to the project endpoint
  - optionally create a database
  - create the external collection schema and field mappings
  - create indexes
  - run refresh
  - create an On-demand cluster
  - attach compute through a session for DQL
- 如果我在 On-demand database 中使用 managed collections，清楚解释差异。

5. Endpoint 和身份验证规则

- 清楚区分：
  - 用于 On-demand database 和 collection operations 的 project endpoint
  - 用于 serving-cluster workflows 的 Serving Cluster endpoint
  - 用于 volumes 等 control plane activities 的 Control Plane API Endpoint
- 说明 External Collection operations 需要 API key。
- 说明此流程不支持 External Collection operations 使用 username:password authentication。
- 说明 On-demand search 中的 DQL operations 需要从 On-demand cluster attach compute：
  - SDK 中通过 session
  - RESTful calls 中通过 `cluster_id` query parameter

6. On-demand cluster sizing 和 limits

- 根据 raw data size、query frequency 和 concurrency expectations 推荐 On-demand cluster CU size。
- 在最终确定建议前指出已记录限制：
  - On-demand clusters 仅适用于 Enterprise projects
  - 除非另有安排，目前 On-demand clusters 仅支持 AWS `us-west-2`
  - `8 <= CU size <= 256`
  - CU size 必须以 8 为增量增加
  - 每 8 CU 最多支持搜索 3 TB raw data
  - 超过此 raw data limit 的 queries 会返回错误
  - 每个 project 最多 20 个 On-demand clusters
  - `autoSuspend` 是秒数整数，最小 60，默认 60
  - cluster 创建后 CU size 固定，不能更改
- 拒绝无效的 cluster sizing choices。

7. On-demand database 和 collection guardrails

- 指出最相关的已记录 database rules：
  - On-demand databases 是 project-level resources，由 project 中所有 On-demand clusters 共享
  - 每个 project 最多 100 个 On-demand databases
  - On-demand databases 中的 collections 不支持 dropping indexes
- 指出最相关的 External Collection 限制：
  - read-only
  - 不支持 insert、upsert、delete、import、flush 或 compact
  - 不支持 dynamic field
  - 不支持 partition
  - schema 中不支持 functions
  - 创建后不能修改 schema
  - 不支持 BM25 text match
  - 不强制 primary key uniqueness
  - 不能配置 primary key 和 AutoID
  - 不支持 backup、restore 和 migration
- 说明 External Collections 需要手动 refresh 才能反映 source data changes。

8. Indexing 和 refresh requirements

- 说明所有 vector fields 都应创建 index。
- 说明 scalar indexes 是可选的，但对 metadata filtering 有用。
- 说明对 External Collections，仅创建 index 还不够：
  - 必须触发 refresh 来构建 metadata 和 indexes
- 解释 refresh behavior 和 expectations：
  - refresh 是异步的
  - metadata updates 的 refresh 通常在亚秒级完成
  - source data changes 后必须重新运行 refresh
  - 如果某次 refresh 会移除所有 active metadata 且没有任何 new insertions，该 refresh 会被拒绝
- 说明 On-demand databases 中的 External Collections 不需要 load/release。

9. 成本和运维考虑

- 解释 On-demand search 的主要成本驱动因素：
  - Query CU cost
  - Indexing CU cost
  - storage cost
  - 适用时的 storage request cost
- 解释 On-demand compute billing behavior：
  - On-demand cluster 处于 `Running` 时按 Query CU cost 计费
  - 当它 auto-suspends 到 `Suspending` 或 `Suspended` 时停止计费
  - 最小计费单位为 1 分钟
- 解释 Indexing CU cost：
  - 适用于初始 `CreateIndex`
  - 适用于由 `Refresh` 触发的 incremental index builds
  - indexing CU count 由系统分配
  - 只对 job execution time 计费
  - queue waiting time 和 failed jobs 不计费
- 谨慎解释 storage request cost：
  - 适用于 On-demand scenarios 中某些 managed-collection index/search operations
  - 不适用于 External Collections 上的 operations
- 提及以下 storage cost：
  - On-demand databases 中的 managed data 和 indexes
  - External Collections 中的 indexes
  - 相关时的 managed volumes
- 与 Serverless 比较时，解释：
  - Serverless 使用 pay-per-operation pricing
  - On-demand search costs 更多与 cluster runtime、query CU sizing 和 indexing activity 相关
  - Serverless 运维上可能更简单，但对大型、突发、读为主的工作负载，On-demand search 可能显著更便宜

10. 追问

- 如果缺少任何关键细节，在推荐最终设计前提出简短追问：
  - 数据是否已经在 object storage 中，还是应导入 Zilliz Cloud？
  - source format 是什么：Parquet、Vortex、Lance，还是 Iceberg？
  - raw data size 是多少 GB 或 TB？
  - 有多少 vectors，dimensions 是多少？
  - 预期 QPS 和 concurrency levels 是多少？
  - 工作负载是 bursty 还是 continuous？
  - 需要什么 latency target？
  - 这是 exploratory、pre-production，还是 production serving？
  - 需要什么 cloud 和 region？
  - 你是否已有 Enterprise project？
  - 是否需要 zero-copy access 或 imported managed storage？

## On-demand search vs Serverless 决策表

| Option           | Best for                                                     | Not ideal for                                                | Key features                                                 | Main tradeoff                                            |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| On-demand search | 大型 external 或 imported datasets、bursty search/query workloads、zero-copy lake access、成本敏感的 read-heavy exploration | Frequent writes、最简单入门、always-on low-latency serving | Project-level databases、External Collections、仅在需要时 attach compute、manual refresh、session-based DQL | 设置步骤和架构概念更多         |
| Serverless       | 更简单的生产入门、带 pay-per-operation pricing 的共享弹性搜索、有 ongoing writes 的应用 | operation-based pricing 在极大型突发工作负载下变贵、zero-copy lake access | Managed collections、shared elastic environment、无需 cluster sizing | sustained bursty reads 在规模化后可能变贵 |
| Serving Cluster  | Real-time production serving、严格 latency SLOs、always-on access | continuous compute 浪费的低频或探索性工作负载 | Always-on compute and storage、面向生产的 serving   | 最高 always-on commitment                             |

## Collection model 决策表

| Option                                    | Best for                                                     | Not ideal for                                                | Key features                                                 | Main tradeoff                                            |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| External Collection in On-demand database | external storage 中 lake data 的 zero-copy search、bursty search/query workloads、schema-on-access patterns | Write-heavy workloads、in-place mutation、BM25/text-match-heavy use cases、频繁 schema evolution | 直接从 external storage 读取、manual refresh、session-based On-demand compute attachment | Read-only 且运维约束更严格                     |
| Managed Collection in On-demand database  | 使用 On-demand query compute 查询 imported data、无需 always-on serving 的 bursty query workloads | 具有严格 always-on latency 的 continuous production serving  | Platform-managed database、仅在需要时使用 query compute    | 仍受 On-demand database rules 约束            |
| Managed Collection in Serverless cluster  | 更简单的共享弹性生产用法，支持读写 | Zero-copy data lake access、session-attached compute workflows | Pay-per-operation、managed shared environment                | sustained bursty reads 在规模化后可能变贵 |
| Managed Collection in Serving Cluster     | Real-time production serving、持续低延迟访问、always-on workloads | 在 massive lake data 上低频搜索，idle compute 会浪费 | Always-on serving、通过 serving endpoint 提供完整 DDL/DML/DQL | 更高 always-on compute commitment                      |

## Endpoint usage 决策表

| Task                                 | Use project endpoint | Use Serving Cluster endpoint | Extra requirement                                 |
| ------------------------------------ | -------------------- | ---------------------------- | ------------------------------------------------- |
| Create On-demand database            | Yes                  | No                           | API key                                           |
| Create External Collection           | Yes                  | No                           | API key                                           |
| Create indexes in On-demand database | Yes                  | No                           | API key                                           |
| Refresh External Collection          | Yes                  | No                           | API key                                           |
| DQL on On-demand search              | Yes                  | No                           | 通过 session 或 `cluster_id` attach compute        |
| DQL on Serving Cluster               | No                   | Yes                          | 根据设置使用 cluster credentials 或 API key |

## 必须应用的重要 Zilliz Cloud 事实

- On-demand search 处于 Public Preview。
- On-demand clusters 仅适用于 Enterprise projects。
- 当前文档记录 On-demand clusters 仅在 AWS `us-west-2` 可用。
- On-demand databases 是 project-level resources，由 project 中所有 On-demand clusters 共享。
- External Collections 可用于 On-demand computing 的 databases。
- External Collection operations 需要 API-key authentication。
- External Collections 是 read-only，并需要手动 refresh 才能反映 source data updates。
- 支持的 external data source formats 包括：
  - `parquet`
  - `vortex`
  - `lance-table`
  - `iceberg-table`
- 对 folder-based sources，external source 应以 `/` 结尾。
- 对 Iceberg，使用 `metadata.json` path 并提供 `snapshot_id`。
- search、query、get 和 hybrid search 等 DQL operations 必须从 On-demand cluster attach compute。
- 在 REST 中，在 DQL calls 中使用 `cluster_id`，而不是创建 session object。
- On-demand databases 中的所有 collections 都不支持 dropping indexes。
- On-demand compute 遵循 usage-based billing model，包括 Query CU cost 和 Indexing CU cost。
- Storage request cost 覆盖由 On-demand search、index build tasks 和 volume file reads 或 writes 生成的 operations。
- External Collections 上的 operations 不产生 storage request cost。
- 如果用户目标是在探索后进行稳定 production serving，建议将选定子集移动到 Serving Cluster。

如果我的设计无效、不完整或与已记录的 Zilliz Cloud 行为矛盾，请明确说明并提出修正设计。
```
