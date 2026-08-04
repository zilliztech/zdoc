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
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
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

## Description\{#description}

Zilliz Cloud 将指标组织为以下层级：

- **Organization-level metrics**：反映所有项目范围内的账号整体状态（例如许可证额度、使用量）。

- **Cluster-level metrics**：反映各个集群内的资源使用情况、性能和数据情况。

- **Collection-level metrics**：是按 collection 细分的部分集群指标，可帮助您定位性能问题并为单个 collection 规划容量。

运行此命令时如果不带任何选项，将触发一组交互式提示，帮助您完成命令设置。

## Synopsis\{#synopsis}

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

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    指定集群 ID。例如，`in01-xxxxxxxxxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该集群。

- **--metric, -m** (*array*) -

    **[REQUIRED]**

    指定指标名称。您可以连续使用此选项来配置多个指标名称。

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

    指定相对于当前时间的时间范围。

    使用 `d` 表示天，`m` 表示月。该值默认为 `1h`，表示统计接下来一小时内收集的数据。

- **--start** (*string*) -

    指定时间范围的开始时间。例如，`2026-03-01` 或 `2026-03-01T10:00:00Z`。

- **--end** (*string*) -

    指定时间范围的结束时间。例如，`2026-03-15` 或 `2026-03-15T18:00:00Z`。

- **--granularity, -g** (*string*) -

    指定数据点间隔。例如，`30s`、`5m`、`1h`。此选项默认为 `auto`。

- **--output, -o** (*string*) -

    指定输出格式。省略此选项时，结果会以终端内的盲文图表可视化形式呈现（自 v1.3.1 起）。可显式指定的值包括：

    - `json`，

    - `table`，

    - `text`。

## Example\{#example}

```bash
zilliz cluster metrics -m READ_VCU -m WRITE_VCU
```
