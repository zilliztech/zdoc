---
title: "Serverless 集群费用 | Cloud"
slug: /serverless-cluster-cost
sidebar_label: "Serverless 集群费用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Serverless 集群主要根据读写操作所消耗的资源收费。您只需为实际产生的用量付费，无需提前预留固定资源。 | Cloud"
type: origin
token: MfZawdBV9iFGi4k7HRbcyyj2nCh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Serverless 集群费用

Zilliz Cloud Serverless 集群主要根据读写操作所消耗的资源收费。您只需为实际产生的用量付费，无需提前预留固定资源。

Serverless 集群的总费用为以下几部分的总和：

- 数据[读取](./serverless-cluster-cost#vector-database-costs-read)与[写入](./serverless-cluster-cost#vector-database-costs-write)操作产生的向量数据库费用

- [存储费用](./serverless-cluster-cost#storage-cost)

- [其他费用](./serverless-cluster-cost#other-costs)（例如数据传输费用）

## 向量数据库费用（写入操作）\{#vector-database-costs-write}

写入费用针对  [insert](./insert-entities)、[upsert](./upsert-entities) 和 [delete](./delete-entities) 操作消耗的资源收费。

Import 和 bulk insert 操作**不产生**写入费用。

### 计算公式\{#cost-calculation}

```plaintext
向量数据库费用（写入操作） = vCU 单价 x 写入操作 vCU 用量 
```

- **vCU 单价:** ¥21/一百万 vCU

- **写入操作 vCU 用量:** 根据写入的数量计算

### 计算示例\{#example}

下表能够帮助您快速计算写入不同规模数据所消耗的 vCU 用量和写入费用。

如需速算更大规模的数据量，您只需要做一个乘法。例如写入 1000 万 768 维向量大致消耗 0.75 x 10 = 7.5 百万个 vCU，写入费用大约为 ¥15.75 x 10 = ¥157.5。

| **数据量 (&ast;)** | **写入 vCU 用量 (百万)** | **写入费用** |
| --- | --- | --- |
| 100 万 128 维向量 | 0.125 | ¥2.625 |
| 100 万 768 维向量 | 0.75 | ¥15.75 |
| 100 万 1536 维向量 | 1.5 | ¥31.5 |
| 100 万 2560 维向量 | 2.5 | &#36;52.5 |

*&ast;上表中的数据量大小不含标量。如需包含标量，建议您通过免费试用实测所需费用。*

*&ast;如果您的 Schema 中包含了多个向量列，写入费用会线性增长。例如您的 Schema 中有两个 128 维的向量字段，写入 1 百万 Entity 的 vCU 用量为 0.125 x 2 = 0.25，写入费用约为 ¥2.625 x 2 = ¥5.25。*

您也可以根据数据量，参考下表精准计算写入 vCU 用量和费用

| **操作** | **vCU 用量** |
| --- | --- |
| Insert | 1 KB 插入数据 = 0.25 vCU |
| Delete | 删除 1 个 Entity = 1 vCU<br/>删除 1 个不存在的 Entity 也会消耗 1 vCU |
| Upsert | 根据更新的数据量和删除的 Entity 数量计算<br/>删除 1 个不存在的 Entity 也会消耗 1 vCU |

假设您插入 3 GB (3,145,728 KB)  Entity 到 Serverless 集群中，随后又删除了 100,000 个 Entity。

- `Insert 操作的 vCU 用量 = 3,145,728 x 0.25 = 78,643 vCU`

- `Delete 操作的 vCU 用量 = 100,000 x 1 = 100,000 vCU`

- `总 vCU 用量 = 1,000 + 78,643 = 178,643 vCU`

- `总写入费用 = 0.178643 x 21 = ¥3.75`

## 向量数据库费用（读取操作）\{#vector-database-costs-read}

读取费用针对 [search](./single-vector-search)、[hybrid search](./hybrid-search) 和 [query](./get-and-scalar-query) 操作消耗的资源收费。

### 计算公式\{#cost-calculation}

```plaintext
向量数据库费用（读取操作） = vCU 单价 x 读取操作 vCU 用量 
```

- **vCU 单价:** ¥21/一百万 vCU

- **读取操作 vCU 用量:** 由以下 3 个因素决定。

    - 搜索或查询的次数：次数越多，消耗的 vCU 用量越高。

    - 单次搜索或查询请求中扫描的数据量：扫描的数据量越大，消耗的 vCU 用量越高。

        *提示：根据处理请求时扫描的数据和返回的数据大小来计算费用。每次读取请求中，Zilliz Cloud 会扫描整个 Collection 中的数据。如果您在读取过程中[使用 Partition Key](./use-partition-key)，Zilliz Cloud 将根据 Partition key 过滤，仅扫描符合条件的数据，从而减少读取请求扫描的数据量和读取费用。*

    - 单次搜索或查询请求中返回的数据量：返回的数据量越大，消耗的 vCU 用量越高。例如，返回所有字段（包括向量字段）的搜索请求消耗的 vCU 用量将大于仅返回 ID 字段的搜索请求。

    <Admonition type="info" icon="📘" title="说明">

    每次读取操作最低会消耗 6 vCU。

    </Admonition>

### 计算示例\{#example}

下表能够帮助您快速计算针对不同规模数据做 100 万次读取操作所消耗的 vCU 用量和读取费用。

| **数据量 (&ast;)** | **读取 vCU 用量 (百万)** | **读取费用** |
| --- | --- | --- |
| 100 万 128 维向量 | 5 | ¥105 |
| 100 万 768 维向量 | 15 | ¥315 |
| 500 万 768 维向量 | 35 | ¥735 |
| 1000 万 768 维向量 | 55 | ¥1155 |
| 100 万 1536 维向量 | 25 | ¥525 |
| 1000 万 1536 维向量 | 75 | ¥1575 |
| 1 亿 1536 维向量 | 290 | ¥6090 |
| 100 亿 1536 维向量 | 1495 | ¥31395 |
| 100 万 2560 维向量 | 30 | ¥630 |

*&ast;上表中的数据量大小不含标量。*

通过上述表格可以发现，同样向量维度的数据，当规模从 100 万增长到 1000 万，甚至到 1 亿时，vCU 用量并非以 10 倍的比例线性增长。我们建议您通过实测了解所需费用。

## 存储费用\{#storage-cost}

存储费用与 CU 费用分开计算，具体价格由以下两个因素决定：

- 集群的云地域、类型和套餐

- 存储用量

具体费用计算规则，详见[存储费用](./storage-cost)。

## 其他费用\{#other-costs}

您的 Dedicated 集群可能还会包含因使用以下附加功能所产生的费用：

- **数据传输费用**：公网出口（Public Internet Egress）以及同地域和跨地域数据传输费用。

具体费用计算规则，详见[数据传输费用](./data-transfer-cost)。