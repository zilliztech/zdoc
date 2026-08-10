---
title: "metrics | Cloud"
slug: /cli/cli/Collection-metrics
sidebar_label: "metrics"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在请求的时间窗口内，按给定的指标名称获取每个 Collection 的指标（QPS、延迟、VPS、失败率、Entity 数量）。默认情况下，结果会渲染为内联盲文图表；传入 `-o table` 可显示为数据透视表，或传入 `-o json` / `-o yaml` / `-o csv` / `--query` 可获取原始数据。 | Cloud"
type: docx
token: X1rVdVsuHogCohx1CX3cZFaQn1e
sidebar_position: 11
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
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

此操作会在请求的时间窗口内，按给定的指标名称获取每个 Collection 的指标（QPS、延迟、VPS、失败率、Entity 数量）。默认情况下，结果会渲染为内联盲文图表；传入 `-o table` 可显示为数据透视表，或传入 `-o json` / `-o yaml` / `-o csv` / `--query` 可获取原始数据。

## 用法\{#synopsis}

```bash
zilliz collection metrics
[--cluster-id <string>]
--collection-name <string>
--metric <string>...
[--period <string>]
[--start <iso8601>]
[--end <iso8601>]
[--granularity <string>]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    指定集群 ID。省略时，将使用当前活动上下文中的集群。

- **--collection-name, -c** (*string*) -

    **[必需]**

    指定要获取指标的 Collection 名称。

- **--metric, -m** (*string*) -

    **[必需]**

    指定指标名称。可重复使用。有效的 Collection 范围指标包括：`SEARCH_QPS`、`QUERY_QPS`、`INSERT_QPS`、`UPSERT_QPS`、`DELETE_QPS`、`BULK_INSERT_QPS`、`HYBRID_SEARCH_QPS`、`SEARCH_LATENCY_AVG`、`SEARCH_LATENCY_P99`、`QUERY_LATENCY_AVG`、`QUERY_LATENCY_P99`、`INSERT_LATENCY_AVG`、`INSERT_LATENCY_P99`、`UPSERT_LATENCY_AVG`、`UPSERT_LATENCY_P99`、`DELETE_LATENCY_AVG`、`DELETE_LATENCY_P99`、`HYBRID_SEARCH_LATENCY_AVG`、`HYBRID_SEARCH_LATENCY_P99`、`SEARCH_VPS`、`INSERT_VPS`、`UPSERT_VPS`、`DELETE_VPS`、`BULK_INSERT_VPS`、`SEARCH_FAIL_RATE`、`QUERY_FAIL_RATE`、`INSERT_FAIL_RATE`、`UPSERT_FAIL_RATE`、`DELETE_FAIL_RATE`、`HYBRID_SEARCH_FAIL_RATE`、`BULK_INSERT_FAIL_RATE`、`ENTITIES`、`ENTITIES_LOADED`、`ENTITIES_INDEXED`。

- **--period** (*string*) -

    指定回溯时间窗口。可接受的值包括：`10m`、`1h`、`6h`、`24h`、`3d`、`7d`。默认值：`1h`。与 `--start` / `--end` 互斥。

- **--start** (*string*) -

    指定 ISO 8601 格式的开始时间戳（例如 `2026-04-01T00:00:00Z`）。如需显式时间范围，请结合 `--end` 使用，而不要使用 `--period`。

- **--end** (*string*) -

    指定 ISO 8601 格式的结束时间戳。与 `--start` 配合使用。

- **--granularity, -g** (*string*) -

    指定数据点间隔。可接受的值包括：`1m`、`5m`、`1h`、`1d`。默认会根据 `--period` 选择一个合适的值。

## 示例\{#example}

```bash
# Inline chart of insert + search QPS over the last hour
zilliz collection metrics -c my_collection -m INSERT_QPS -m SEARCH_QPS

# Pivot table of latency for the last 24 hours, 5-minute granularity
zilliz collection metrics -c my_collection -m SEARCH_LATENCY_P99 -m QUERY_LATENCY_P99 --period 24h -g 5m -o table

# Raw JSON for downstream tooling
zilliz collection metrics -c my_collection -m ENTITIES -o json
```
