---
title: "按需计算费用 | Cloud"
slug: /on-demand-compute-cost
sidebar_key: on-demand-compute-cost
sidebar_label: "按需计算"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "按需计算在 Zilliz Cloud 中采用基于用量的计费模式。系统会根据您的工作负载所消耗的查询计算资源和索引构建计算资源进行计费。 | Cloud"
type: origin
token: XEvpwUMfFirFkNkQZofcwUTcnvd
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 支付方式
  - 账单
  - 费用
  - On-demand

---

import Admonition from '@theme/Admonition';


# 按需计算费用

按需计算在 Zilliz Cloud 中采用基于用量的计费模式。系统会根据您的工作负载所消耗的查询计算资源和索引构建计算资源进行计费。

按需计算的总费用由以下部分组成：

- Query CU 费用

- Indexing CU 费用

## Query CU 费用\{#query-cu-cost}

Query CU 费用用于衡量 On-demand 集群所消耗的计算资源。

### 计算公式\{#cost-calculation}

```plaintext
Query CU 费用 = Query CU 单价 × Query CU 数量 × 运行时长
```

- **Query CU 单价**: ：由您的云地域和项目版本决定。详见 [Zilliz Cloud 列表价](https://zilliz.com.cn/pricing/pricing-guide)。

- **Query CU 数量**: 为 On-demand 集群配置的 Query CU 数量。

- **运行时长**: On-demand 集群的计算资源处于使用状态时的计费时长。

    - 当 On-demand 集群处于**运行中**状态时，开始计费。

    - 当 On-demand 集群自动挂起，并进入**挂起中**或**已挂起**状态时，停止计费。

    - 最小计费单位为 **1 分钟**。不足 1 分钟按 1 分钟计费。

## Indexing CU 费用\{#indexing-cu-cost}

Indexing CU 费用用于衡量在按需计算中为 Managed Collection 和 [External Collection](./external-collection) 构建索引时所消耗的计算资源。

### Indexing CU 费用来源\{#sources-of-indexing-cu-cost}

在以下场景中，您会产生 Indexing CU 费用：

- 为 Managed Collection 和 External Collection 执行初始 `CreateIndex` 构建

- 由 `Refresh` 触发的增量索引构建

### 计算公式\{#cost-calculation}

```plaintext
Indexing CU 费用 = Indexing CU 单价 × Indexing CU 数量 x 时长
```

- **Indexing CU 单价**: 由您的云地域和项目版本决定。详见 [Zilliz Cloud 列表价](https://zilliz.com.cn/pricing/pricing-guide)。

- **Indexing CU 数量**: 系统会自动分配最合适的 Indexing CU 数量。您无法自行指定使用的Indexing CU 数量。

- **时长**: 完成索引构建任务所需的时间。仅任务实际执行时间计费；排队等待时间和失败任务均不计费。最小计费单位为 1 分钟。不足 1 分钟按 1 分钟计费。

<Admonition type="info" icon="📘" title="说明">

在[用量](./analyze-cost)和[账单](./view-invoice)页面中，Indexing CU cost 按 Database 汇总显示，而不是按单个任务显示。

</Admonition>

