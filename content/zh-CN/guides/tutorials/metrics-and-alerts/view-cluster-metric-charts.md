---
title: "查看集群性能指标 | Cloud"
slug: /view-cluster-metric-charts
sidebar_key: view-cluster-metric-charts
sidebar_label: "查看集群性能指标"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供用于监控集群和 Collection 双层指标的可视化看板。指标图表展示在指定时间范围内的资源使用情况、每秒查询数（QPS）、延迟以及数据操作等性能数据。 | Cloud"
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


import Supademo from '@site/src/components/Supademo';

# 查看集群性能指标

Zilliz Cloud 提供用于监控集群和 Collection 双层指标的可视化看板。指标图表展示在指定时间范围内的资源使用情况、每秒查询数（QPS）、延迟以及数据操作等性能数据。

## 查看集群指标图表\{#view-metric-charts}

要查看集群范围的指标，请在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)中进入目标集群，然后切换到**指标**标签页。
Zilliz Cloud 的指标图表会展示在指定时间范围内的资源使用情况、每秒查询数（QPS）、请求结果以及数据操作等性能数据，帮助您进行细粒度分析。

<Admonition type="info" icon="📘" title="说明">

对于免费集群，只支持查看 Read vCUs 和 Write vCUs。如需解锁更多指标，可以考虑[升级集群版本](./manage-cluster#upgrade-deployment-option)。

</Admonition>

<Supademo id="cmnqtlki30dzzcr4jy4pwymhz" title=""  />

Zilliz Cloud 提供了多种指标图表，用于从不同角度监控集群性能。

### 资源监控\{#resources}

要查看资源使用情况的指标图表，请在**指标**选项卡下找到**资源**部分。这些图表展示了集群的资源用量情况，涵盖了计算、容量和存储方面的数据。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

### 性能监控\{#performance}

要查看性能指标图表，请在**指标**选项卡上找到**性能**部分。这些图表提供了集群性能的快照，包括每秒 Query 请求数（QPS）、每秒向量 Search 操作数（VPS）、请求延时（Latency）和请求失败率。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

### 数据监控\{#data}

要查看业务数据的度量图表，请在**指标**选项卡上找到**数据**部分。这些图表通过显示集群中的 Collection 数、Entity 总数和已加载 Entity 数，提供了集群数据的快照。要快速浏览所有可用指标，请参见[指标与告警快速参考](./metrics-alerts-reference)。

## 查看 Collection 指标图表\{#view-collection-metrics}

部分集群指标同样提供 Collection 级视图，帮助你更精准地定位性能问题并为单个 Collection 做容量规划。
要查看 Collection 级指标，在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)中进入目标 Collection，然后切换到**指标**标签页。

<Supademo id="cmnqtt1u40e22cr4j2kgqmsb0" title=""  />

图表布局和时间范围控制与 集群级指标标签页完全一致。每个图表展示的都是相同的指标定义，只是作用范围从整个集群收缩到当前选中的 Collection。

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

## 文档推荐\{#related-topics}

- [管理组织告警](./manage-organization-alerts)

- [管理项目告警](./manage-project-alerts)

- [指标与告警快速参考](./metrics-alerts-reference)

