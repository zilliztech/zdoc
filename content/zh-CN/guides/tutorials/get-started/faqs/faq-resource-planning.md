---
title: "FAQ：资源规划 | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ：资源规划"
beta: FALSE
notebook: FALSE
description: "本文列举了在 Zilliz Cloud 规划资源和使用成本时可能遇到的常见问题及对应解决方法。 | CLOUD"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 6
displayed_sidebar: default

---

# FAQ：资源规划

本文列举了在 Zilliz Cloud 规划资源和使用成本时可能遇到的常见问题及对应解决方法。

## Contents

- [什么是计算单元（Compute Unit, CU）?](#what-is-a-compute-unit-cu)
- [什么是 vCU？](#what-is-a-vCU-how-does-it-get-calculated)
- [如何查看订阅的 Zilliz Cloud 版本？](#how-can-i-know-which-plan-i-am-on)
- [我应该选择哪种集群类型？](#which-type-of-cluster-should-i-pick)
- [我的数据需要使用多少 Query CU？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [如何避免未使用的集群产生费用？](#how-can-i-avoid-expenses-on-unused-clusters)
- [如何估算使用 Zilliz Cloud 的成本？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)

## FAQs




### 什么是计算单元（Compute Unit, CU）?\{#what-is-a-compute-unit-cu}

计算单元（CU）是指用于提供向量检索、分析服务的一组硬件资源。可以将 CU 视为一个物理查询节点。

### 什么是 vCU？\{#what-is-a-vCU-how-does-it-get-calculated}

vCU 是用于衡量读取（如 search、query）和写入操作（如 insert、upsert、delete）所消耗资源的基本单位。读取和写入的数据量单位会由 GB 折算为 vCU。详情请参考[Serverless 集群费用](./serverless-cluster-cost)。

### 如何查看订阅的 Zilliz Cloud 版本？\{#how-can-i-know-which-plan-i-am-on}

如需查看版本，请前往项目列表页。您可以看到所有项目的版本。

![D1TPbn5Atoc3EfxDWaNcA7yznFh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/d1tpbn5atoc3efxdwanca7yznfh.png "D1TPbn5Atoc3EfxDWaNcA7yznFh")

### 我应该选择哪种集群类型？\{#which-type-of-cluster-should-i-pick}

- 如果您的应用需要低延迟和高吞吐量，建议选择性能型。

- 如果您需要存储大量数据，但对吞吐量和延迟的要求较低，建议选择容量型。

- 如果您需要处理超大规模、追求性价比的工作负载，建议选择分层存储型。如需选择分层存储型，集群 Query CU 数量需至少为 8。

### 我的数据需要使用多少 Query CU？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- 性能型集群： 以 768 维向量为基准估计，可支持 200 万个向量（不包含标量字段）。

- 容量型集群： 以 768 维向量为基准估计，可支持 800 万个向量（不包含标量字段）。

- 分层存储型集群： 以 768 维向量为基准估计，可支持 4000 万个向量（不包含标量字段）。

以上数据针对仅包含主键的向量数据。如果您的数据中含有其他标量字段，如 ID 或 label，可能需要使用更多 Query CU。我们建议进行测试以准确评估数据实际需要使用的 Query CU 数量。

### 如何避免未使用的集群产生费用？\{#how-can-i-avoid-expenses-on-unused-clusters}

建议您挂起未使用的集群以节省成本。您可随时按需恢复集群。

### 如何估算使用 Zilliz Cloud 的成本？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

请使用[价格计算器](https://zilliz.com.cn/pricing#calculator)估算使用成本。
