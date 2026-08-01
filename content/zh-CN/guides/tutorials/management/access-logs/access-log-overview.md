---
title: "访问日志概述 | Cloud"
slug: /access-log-overview
sidebar_label: "访问日志概述"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在高查询负载场景下，了解哪些数据被最频繁访问对于索引调优、分区策略等优化决策至关重要。缺乏查询模式的可见性，这些决策只能依赖猜测。 | Cloud"
type: origin
token: R0Jiw6mWPiPLo1kU3rocWfoCneg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 访问日志概述

在高查询负载场景下，了解哪些数据被最频繁访问对于索引调优、分区策略等优化决策至关重要。缺乏查询模式的可见性，这些决策只能依赖猜测。

访问日志为您提供这种可见性。在 Zilliz Cloud 集群上启用后，访问日志会捕获查询活动，并将结构化日志文件传输到您自己的对象存储中。您可以将这些日志加载到数据仓库中，按 Entity ID 聚合，从而识别热点数据和使用趋势。

<Admonition type="info" icon="📘" title="说明">

- 本版本仅支持搜索和查询类操作的日志记录：Search、HybridSearch 和 Query。完整操作列表的支持将在后续版本中提供。

- 本版本中，审计日志和访问日志互斥，同一时间只能开启其中一个。

- 访问日志仅适用于 Enterprise 项目下的 Dedicated 集群。如果你的集群使用的是其他套餐或集群类型，建议升级到 Enterprise Dedicated 集群后再启用访问日志。

</Admonition>

## 工作原理\{#how-the-pipeline-works}

访问日志分为两个阶段：Zilliz Cloud 侧的采集和用户侧的日志分析。

![F2PlbhS6FoqmabxuP8FcRRSyncc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/f2plbhs6foqmabxup8fcrrsyncc.png "F2PlbhS6FoqmabxuP8FcRRSyncc")

### Zilliz Cloud 采集并传输日志\{#zilliz-cloud-collects-and-delivers-logs}

在集群上启用 访问日志 后，Zilliz Cloud 开始在代理层捕获查询活动。你可以在集群级别配置两项设置：

- **采样率**：控制记录到访问日志的请求占比。取值范围为 0～100，表示随机抽样并写入访问日志的请求百分比。例如，将采样率设置为 1 时，大约会有 1% 的请求产生访问日志条目。对于高吞吐量工作负载，较低的采样率可以在保持足够分析访问模式的数据前提下，降低日志存储成本。

- **输出字段**：控制在每条访问日志记录中包含哪些额外的响应字段。常见选项包括：

    - `params.result_pks`：记录查询结果中返回的主键 ID 列表。借助这些 ID，你可以在后续按实体维度进行聚合，识别热点数据和访问频率。

    - `params.result_scores`：记录与 `params.result_pks` 中每个 ID 对应的相似度分数，帮助你判断哪些结果是高置信度匹配，哪些则更接近边界情况。

日志以 **JSON Lines** 格式（每行一个 JSON 对象）写入，并自动传输到你在设置过程中配置的对象存储桶。每个文件遵循固定的路径约定：

```plaintext
/<Cluster ID>/<Log type>/<Date>/<HH:MM:SS>-<UUID>.log
```

例如：`/in03-c7be749d5f403ad/access/2024-12-20/09:16:53-jz5l7D8Q.log`

### 用户侧日志分析\{#you-analyze-the-logs}

由于日志以标准 JSON Lines 文件的形式存储在你自己的存储桶中，你可以使用任何能够读取 JSON 的工具来处理它们。每条日志记录包含结构化字段，包括 `action`、`cluster_id`、`timestamp` 和 `params.result_pks`（查询结果中的主键列表）。

一般分析流程如下：

1. 将 JSON Lines 文件加载到数据仓库或分析工具中。

1. 从每条记录中解析 `action` 和 `params.result_pks` 字段。

1. 在一个时间窗口内按主键聚合，以呈现访问频率。

最终结果是一张数据热力图——哪些实体被查询最频繁、通过哪些操作、在什么时间。

## 可靠性与计费\{#reliability-and-billing}

访问日志围绕一个核心原则设计：日志记录绝不影响查询性能。

### 非阻塞保证\{#non-blocking-guarantee}

访问日志的采集永远不会延迟或阻塞用户请求。如果系统必须在完成查询和写入日志之间做出选择，查询始终优先。

### 优雅降级\{#graceful-degradation}

在极端负载下，系统可能会丢弃访问日志记录以保障查询吞吐量。这意味着访问日志提供的是尽力而为的查询活动记录，而非保证完整的记录。

## 下一步\{#whats-next}

- [配置访问日志](./configure-access-logs)：启用访问日志、调整采样率和输出参数，或停用日志记录。

- [访问日志参考](./access-log-reference)：完整的字段 Schema、操作列表和文件路径约定。

