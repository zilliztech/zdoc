---
title: "集群扩缩容 | Cloud"
slug: /scale-cluster
sidebar_label: "集群扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，Query CU 是一组用于处理索引和搜索请求的硬件资源。您可以将 Query CU 理解为一个全托管的物理节点，用于运行您的查询服务。Replica 是集群级别的拷贝，包含相同的集群资源与数据。Query CU 主要决定集群容量与计算资源，而 Replica 为查询服务提供额外的并行能力。 | Cloud"
type: origin
token: MeCPwj8n0i2x1BksjOHc3OKRn55
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 集群扩缩容

在 Zilliz Cloud 中，**Query CU** 是一组用于处理索引和搜索请求的硬件资源。您可以将 Query CU 理解为一个全托管的物理节点，用于运行您的查询服务。**Replica** 是集群级别的拷贝，包含相同的集群资源与数据。Query CU 主要决定集群容量与计算资源，而 Replica 为查询服务提供额外的并行能力。

<Admonition type="info" icon="📘" title="说明">

本文介绍的扩缩容选项仅适用于 Serving 集群。

On-demand 集群会自动扩缩容：有请求到达时自动拉起，空闲时自动缩容至 0，无需手动干预。

</Admonition>

## Query CU vs Replica\{#query-cu-vs-replica}

随着工作负载增长、写入数据增多，集群可能最终达到容量与性能上限。为提前应对，您可以在指标页面监控 **Query CU 加载容量**和 **Query CU 计算资源**，并在触达上限前进行扩缩容。

选择扩缩容 Query CU 还是 Replica，取决于您的目标。总体原则如下：

- 对于 **1–8  Query CU** 的集群，通常可以直接扩缩容 Query CU。

- 对于**超过 8  Query CU** 的集群，可以根据需求选择扩缩容 Query CU 或 Replica。

### 扩容 Query CU 以获得更高容量\{#scale-query-cus-for-more-capacity}

当触及容量相关限制，或预计数据与负载将持续增长时，应扩容 Query CU。典型信号与场景包括：

- 写入操作失败但读取仍成功（通常表明集群已达到或接近容量上限）。

- 需要处理大规模数据集，或需要更多 collection（集合）。

- CPU 或内存使用率较高。

详情请参见 [Query CU 扩缩容](./scale-query-cu)。

### 扩容 Replica 以提升吞吐或可用性\{#scale-replicas-for-higher-throughput-or-availability}

当集群容量足以容纳数据，但出现查询吞吐（QPS）瓶颈，或需要更高可用性时，应扩容 Replica。典型信号与场景包括：

- 数据集规模小到中等，但出现 QPS 瓶颈。

- 希望将查询负载分摊到多个相同拷贝上，以提升吞吐。

- 希望提升可用性。

详情请参见[Replica 扩缩容](./manage-replica)。

## 扩缩容方式\{#scaling-options}

Zilliz Cloud 提供多种方式来扩缩容集群资源。根据您的工作负载模式，您可以选择**手动扩缩容**、**定时扩缩容**或**动态扩缩容**。

### 手动扩缩容\{#manual-scaling}

当您对工作负载有清晰认知，并能预测何时需要调整时，可手动调整资源。

- **Query CU**：增加以扩展容量；当需求下降时减少以降低成本。

- **Replica**：增加以提升查询吞吐与可用性；当需求下降时减少。

### 定时扩缩容\{#scheduled-scaling}

当工作负载存在周期性规律（例如工作日高峰、周末低谷）时，使用计划扩缩容。常见场景包括工作时间流量高峰、可预测的批处理/查询窗口等。

对于定时扩缩容，Zilliz Cloud 提供两种模式：

- **基础模式**：使用简单选择器定义调度计划

- **高级模式**：使用 [Unix cron 表达式](./cron-expression)定义更灵活的调度计划

### 动态扩缩容\{#dynamic-scaling}

针对不可预测的工作负载，推荐启用动态扩缩容。Zilliz Cloud 会在您定义的最小–最大范围内，基于实时指标自动调整资源。

- **Query CU**：基于 **Query CU 加载容量**指标值自动扩缩容。

- **Replica**：基于 **Query CU 计算资源**指标值自动扩缩容。

<Admonition type="info" icon="📘" title="**说明**">

按量计费集群支持上述三种扩缩容方式。

包年包月集群仅支持手动扩容，不支持手动缩容、定时扩缩容、动态扩缩容。

</Admonition>

## 包年包月集群扩容\{#annual-subscription-cluster-scaling}

包年包月集群仅支持手动扩容。

目前，您只能通过 Zilliz Cloud Web 控制台进行集群扩容，暂时不支持通过 RESTful API 进行操作。

![VPQSwUkM7hVFtIbbahJcopfpngg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/VPQSwUkM7hVFtIbbahJcopfpngg.png)

上图展示了为包年包月集群扩容的主要流程和步骤。以下为具体操作说明。

### 步骤 1. 增加集群 CU 规格\{#increase-cu-size}

1. 登录 Zilliz Cloud。前往目标集群的**集群详情**页。点击**扩容**。

    ![scale-annual-subscription-cluster-entrance-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/scale-annual-subscription-cluster-entrance-cn.png "scale-annual-subscription-cluster-entrance-cn")

1. 选择集群目标 Query CU 或 Replica 数量。目前仅支持选择比当前更大的数值。

1. （可选）您可以选择是否在扩容的同时**延长集群有效期**。

1. 检查订单金额，点击**扩容**。如需了解集群升配与续订的费用计算规则，请参考[变更配置费用说明](./undefined)。

    ![scale-annual-subscription-cluster-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/scale-annual-subscription-cluster-cn.png "scale-annual-subscription-cluster-cn")

1. 阅读并同意 [Zilliz Cloud 服务条款](https://zilliz.com.cn/cloud-service-terms)。

### 步骤 2. 支付订单\{#pay-the-order}

完成步骤 1 后，Zilliz Cloud 将生成一份类型为**升配**的**待支付**订单。请检查订单内容并及时完成支付。

![pay-annual-subscription-scale-order-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pay-annual-subscription-scale-order-cn.png "pay-annual-subscription-scale-order-cn")

<Admonition type="info" icon="📘" title="说明">

如果您的组织现金余额不足，请先进行现金充值（对公转账）。详情请见[现金充值（对公转账）](./cash-recharge)。

充值成功后，您可以前往**费用中心>订单**页支付订单。详情请见[管理订单](./manage-orders)。

订单生成后 7 天内未完成支付，系统将自动取消订单。如仍需为包年包月集群扩容，请重新完成步骤 1 的操作并支付新订单。

</Admonition>

### 步骤 3. 等待集群完成扩容\{#wait-for-scaling-complete}

订单支付成功后，Zilliz Cloud 会开始为您的包年包月集群进行扩容，您将看到以下界面。

![annual-subscription-cluster-is-being-scaled-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/annual-subscription-cluster-is-being-scaled-cn.png "annual-subscription-cluster-is-being-scaled-cn")

集群扩容的过程大约需要 10 分钟，请您耐心等待。当集群状态变为**运行中**时，代表包年包月集群扩容成功。

## 常见问题\{#faq}

**我应该选择哪种扩缩容方式？**

以下是帮助您快速选择合适扩缩容方式的建议：

![DIlKwYWaLhUfKRbeI93coBZTnmb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DIlKwYWaLhUfKRbeI93coBZTnmb.png)

- 如果您非常清楚工作负载模式，例如每天的峰值时间固定，**手动**扩缩容和**定时**扩缩容是最适合您的选择。

- 如果您的工作负载不可预测，并且波动较大，推荐使用**动态**扩缩容。它会在您设定的范围内自动调整集群 Query CU，帮助在保持性能的同时优化成本。

**什么情况下应该调整 Replica 数量，什么时候应该进行集群 Query CU 扩缩容？**

- 增加 Replica 数量适用于以下场景：

    - 需要处理高 QPS（每秒查询数）并保证高可用性。

    - 工作负载包含大量并发搜索或查询请求，希望提升吞吐量

    **提示**：每个 Replica 都是 Query CU 资源的独立拷贝，负责处理部分查询请求。

- 增加 Query CU 适用于以下场景：

    - 需要处理大型数据集或支持更多 Collection。

    - CPU 或内存使用率较高。

    **提示**：增加 Query CU 可为每个 query node 提供更多计算资源和容量。

- **建议**：对于 1-8 CU 的集群，请直接进行集群扩缩容。对于超过 8 CU 的集群，请增加 Replica 数量。

**当我对 Dedicated 集群进行扩缩容时，扩缩容期间会按照旧配置还是新配置计费？**

扩缩容期间，将按照集群的原有配置计费。只有当扩缩容任务成功完成后，才会按照新的配置计费。

import DocCardList from '@theme/DocCardList';

<DocCardList />