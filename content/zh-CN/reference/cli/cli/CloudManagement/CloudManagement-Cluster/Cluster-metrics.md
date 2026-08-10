---
title: "metrics | Cloud"
slug: /cli/cli/Cluster-metrics
sidebar_label: "metrics"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于查询集群性能指标（QPS、延迟、存储等）。 | Cloud"
type: docx
token: BVHRdq4miotjdVxI72fcI7XznKc
sidebar_position: 5
keywords: 
  - 开源向量 Database
  - 开源向量数据库 db
  - 向量 Database 示例
  - rag 向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - metrics
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# metrics

此操作用于查询集群性能指标（QPS、延迟、存储等）。

## 说明\{#description}

Zilliz Cloud 将指标划分为以下层级：

- **组织级指标**：反映所有项目范围内的账户整体状态（例如许可证额度、使用量）。

- **集群级指标**：反映各个集群中的资源使用情况、性能和数据。

- **Collection 级指标**：按 Collection 细分的集群指标子集，可帮助您定位性能问题，并为单个 Collection 规划容量。

运行此命令时如果不带任何选项，将触发一组交互式提示，引导您设置该命令。

## 概要\{#synopsis}

```bash
zilliz cluster metrics
--cluster-id <value>
--metric <value>
[--period <value>]
[--start <value>]
[--end <value>]
[--granularity <value>]
[--output <value>]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    表示集群 ID。例如，`in01-xxxxxxxxxxxx`。

    如果使用 `zilliz context set` 配置了集群，则在未配置此选项时会自动应用该配置。

- **--metric, -m** (*array*) -

    **[必需]**

    表示指标名称。您可以在另一个此选项后继续追加，以配置多个指标名称。

    资源指标：

    - `CU_COMPUTATION`

    - `CU_CAPACITY`

    - `CU_SIZE`

    - `REPLICA_COUNT`

    - `STORAGE`

    QPS 指标：

    - `SEARCH_QPS`

    - `QUERY_QPS`

    - `INSERT_QPS`

    - `UPSERT_QPS`

    - `DELETE_QPS`

    - `BULK_INSERT_QPS`

    延迟指标：

    - `SEARCH_LATENCY_AVG`

    - `SEARCH_LATENCY_P99`

    - `QUERY_LATENCY_AVG`

    - `QUERY_LATENCY_P99`

    - `INSERT_LATENCY_AVG`

    - `INSERT_LATENCY_P99`

    - `UPSERT_LATENCY_AVG`

    - `UPSERT_LATENCY_P99`

    - `DELETE_LATENCY_AVG`

    - `DELETE_LATENCY_P99`

    VPS 指标：

    - `SEARCH_VPS`

    - `INSERT_VPS`

    - `UPSERT_VPS`

    - `DELETE_VPS`

    - `BULK_INSERT_VPS`

    失败率指标：

    - `SEARCH_FAIL_RATE`

    - `QUERY_FAIL_RATE`

    - `INSERT_FAIL_RATE`

    - `UPSERT_FAIL_RATE`

    - `DELTE_FAIL_RATE`

    - `BULK_INSERT_FAIL_RATE`

    数据指标：

    - `ENTITIES`

    - `ENTITIES_LOADED`

    - `ENTITIES_INDEXED`

    - `COLLECTIONS`

    - `SLOW_QURIES`

    Serverless 指标：

    - `READ_VCU`

    - `WRITE_VCU`

- **--period** (*string*) -

    表示从现在开始的相对时间段。

    天使用 `d`，月使用 `m`。默认值为 `1h`，表示统计接下来一小时内收集的数据。

- **--start** (*string*) -

    表示时间范围的开始时间。例如，`2026-03-01` 或 `2026-03-01T10:00:00Z`。

- **--end** (*string*) -

    表示时间范围的结束时间。例如，`2026-03-15` 或 `2026-03-15T18:00:00Z`。

- **--granularity, -g** (*string*) -

    表示数据点间隔。例如，`30s`、`5m`、`1h`。此选项默认值为 `auto`。

- **--output, -o** (*string*) -

    表示输出格式。省略此选项时，结果将显示为终端内的盲文图表可视化形式（自 v1.3.1 起）。显式值包括：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz cluster metrics -m READ_VCU -m WRITE_VCU
```
