---
title: "Dedicated 集群费用 | Cloud"
slug: /dedicated-cluster-cost
sidebar_key: dedicated-cluster-cost
sidebar_label: "Dedicated 集群"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud Dedicated 集群采用按量计费的模式，主要根据集群实际消耗的计算资源计费。您无需提前过度预留资源，只需为实际使用的部分付费。 | Cloud"
type: origin
token: Gc0Cw50sPikX4vkCxU7cw7kunzb
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 支付方式
  - 账单
  - Dedicated
  - 费用

---

import Admonition from '@theme/Admonition';


# Dedicated 集群费用

Zilliz Cloud Dedicated 集群采用按量计费的模式，主要根据集群实际消耗的计算资源计费。您无需提前过度预留资源，只需为实际使用的部分付费。

Dedicated 集群的总费用为以下几部分的总和：

- [向量数据库费用](./dedicated-cluster-cost#vector-database-cost)

- [存储费用 ](./dedicated-cluster-cost#storage-cost)

- [其他费用](./dedicated-cluster-cost#other-costs)（例如审计日志和数据传输费用）

## 向量数据库费用\{#vector-database-cost}

### 计算公式\{#cost-calculation}

```plaintext
向量数据库费用 = Query CU 单价 × Query CU 总数 × 集群运行时长
```

- **Query CU 单价**：具体单价由集群的地域、类型和项目版本决定。详见 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

- **Query CU 总数**：集群中 Query CU 的总数量，需要乘以 Replica 数量。

    ```plaintext
    Query CU 总数 = Query CU 数量 × Replica 数量
    ```

    示例： 假设集群 Query CU 数量为 2，副本数量为 2，该集群的 Query CU 总数为 2 x 2 = 4 CU。

- **集群运行时长**：集群处于计费状态的总小时数。

    - **计费状态**：包含运行中、修改中。

    - **非计费状态**：包含创建中、挂起中、恢复运行中、已挂起。非计费状态下不收取 CU 费用，但仍会产生存储费用。

### 计算示例\{#example}

假设您的集群配置如下：

- **项目版本**：企业版

- **集群部署方式**：Dedicated

- **云服务提供商和地域**：阿里云华东1（杭州）

- **集群类型**：性能型

- **Query CU**：8 CU

- **Replica 数量**：2

- **Cluster 运行时长**：720 小时 (1 个月)

根据项目版本、云服务提供商和地域、CU 类型这三个信息，您可以在官网的[定价](https://zilliz.com.cn/pricing)页面查看 CU 单价为 ￥1.25/小时。

![find-cu-unit-price-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/find-cu-unit-price-cn.png "find-cu-unit-price-cn")

根据 Query CU 和 Replica 数量两个信息，得出 `Query CU 总数 = 8 CU x 2 Replica = 16 CU`。

示例 Dedicated 集群的向量数据库费用为 `¥1.25 x 16 x 720 = ¥14400`。

## 存储费用\{#storage-cost}

存储费用与 CU 费用分开计算，具体价格由以下两个因素决定：

- 集群的云地域、类型和套餐

- 存储用量

具体费用计算规则，详见[存储费用](./storage-cost)。

## 其他费用\{#other-costs}

您的 Dedicated 集群可能还会包含因使用以下附加功能所产生的费用：

- **审计日志费用**：按审计日志所消耗的 CU 用量计费。

- **数据传输费用**：公网出口（Public Internet Egress）以及同地域和跨地域数据传输费用。

具体费用计算规则，详见[审计日志费用](./audit-log-cost)和[数据传输费用](./data-transfer-cost)。

## 常见问题\{#faqs}

1. **集群挂起后还会继续收费吗？**
集群挂起后将暂停收取向量数据库费用，但会继续产生存储费用。

1. **集群在创建或挂起的过程中会产生费用吗？**
 创建中、挂起中、恢复运行中、已挂起状态下，不收取向量数据库费用。但存储费用仍会产生。

