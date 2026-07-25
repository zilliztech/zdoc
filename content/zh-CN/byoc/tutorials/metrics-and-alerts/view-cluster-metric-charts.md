---
title: "查看集群性能指标 | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "查看集群性能指标"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "为更好地了解集群性能，Zilliz Cloud 提供集群监控面板，您可以在其中查看特定集群的相关性能指标。 | BYOC"
type: origin
token: S3BswPJ4NiKl9okZDoycMvbunMb
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 集群
  - 性能
  - 指标

---

import Admonition from '@theme/Admonition';


# 查看集群性能指标

为更好地了解集群性能，Zilliz Cloud 提供集群监控面板，您可以在其中查看特定集群的相关性能指标。

![view_system_metrics](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view_system_metrics.png "view_system_metrics")

## 性能指标图表\{#access-cluster-metric-charts}

在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，找到目标集群，并点击**指标**选项卡。

Zilliz Cloud 的性能指标图表展示了包括资源使用、Query 请求速率（QPS）、请求结果及数据操作等方面的性能数据，提供了对特定时间段的详细分析。

<Admonition type="info" icon="📘" title="说明">

<p>点击右侧的<strong>查看告警设置</strong>，可以跳转到<strong>告警设置</strong>页面并管理您的告警。</p>

</Admonition>

关于每个性能指标图表的详细信息，请参阅[查看性能指标图表](./view-cluster-metric-charts#view-metric-charts)。

## 调整统计频率\{#modify-curve-window-size}

**指标**选项卡提供两种类型的时间窗口设置。

- **相对范围**：您可以从一组预设的时间段中选择，这些时间段是相对于当前时间的。使用相对时间范围，您可以便捷地定期查看指标，无需手动设置具体的开始和结束时间。选项包括：

    - 过去 10 分钟

    - 过去 1 小时

    - 过去 6 小时

    - 过去 12 小时

    - 过去 1 天

    - 过去 1 周

    - 过去 1 月

- **绝对范围**：您可以精确设置想要查看的起始时间和结束时间。使用绝对时间范围，可以更精准地控制您想查看的指标数据。

    - 选择的起始时间和结束时间之间的差距应超过 10 分钟。

## 查看性能指标图表\{#view-metric-charts}

Zilliz Cloud 提供了多种指标图表，用于从不同角度监控集群性能。

### Pod 资源监控\{#pod-resources}

为了更有效地跟踪 Pod 资源消耗情况，请在**指标**选项卡下找到 **Pod 资源**部分。在这里，您可以看到相关图表，展示每个 Pod 的 CPU、存储和网络资源的使用情况。更多指标详情，可以参考[指标与告警快速参考](./metrics-alerts-reference#project-level-metrics-cluster-metrics)。

### 资源监控\{#resources}

要查看资源使用情况的指标图表，请在**指标**选项卡下找到**资源**部分。这些图表展示了集群的资源用量情况，涵盖了计算、容量和存储方面的数据。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

### 性能监控\{#performance}

要查看性能指标图表，请在**指标**选项卡上找到**性能**部分。这些图表提供了集群性能的快照，包括每秒 Query 请求数（QPS）、每秒向量 Search 操作数（VPS）、请求延时（Latency）和请求失败率。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

### 数据监控\{#data}

要查看业务数据的度量图表，请在**指标**选项卡上找到**数据**部分。这些图表通过显示集群中的 Collection 数、Entity 总数和已加载 Entity 数，提供了集群数据的快照。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

## 文档推荐\{#related-topics}

- [管理组织告警](./manage-organization-alerts)

- [管理项目告警](./manage-project-alerts)

- [指标与告警快速参考](./metrics-alerts-reference)

