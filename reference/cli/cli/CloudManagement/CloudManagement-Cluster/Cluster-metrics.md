---
title: "metrics | Cloud"
slug: /cli/cli/Cluster-metrics
sidebar_label: "metrics"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation queries cluster performance metrics (QPS, latency, storage, etc.). | Cloud"
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

This operation queries cluster performance metrics (QPS, latency, storage, etc.).

## Description\{#description}

Zilliz Cloud organizes metrics into the following levels:

- **Organization-level metrics**: Reflect account-wide status (e.g., license credits, usage) across all projects.

- **Cluster-level metrics**: Reflect resource usage, performance, and data within individual clusters.

- **Collection-level metrics**: A subset of cluster metrics broken down per collection, helping you pinpoint performance issues and plan capacity for individual collections.

Running this command without any options triggers a set of interactive prompts for you to set up the command.

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

    Indicates a cluster ID. For example, `in01-xxxxxxxxxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--metric, -m** (*array*) -

    **[REQUIRED]**

    Indicates the metric name(s). You can chain this option after another to configure multiple metric names.

    Resource metrics:

    - `CU_COMPUTATION`

    - `CU_CAPACITY`

    - `CU_SIZE`

    - `REPLICA_COUNT`

    - `STORAGE`

    QPS metrics:

    - `SEARCH_QPS`

    - `QUERY_QPS`

    - `INSERT_QPS`

    - `UPSERT_QPS`

    - `DELETE_QPS`

    - `BULK_INSERT_QPS`

    Latency metrics:

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

    VPS metrics:

    - `SEARCH_VPS`

    - `INSERT_VPS`

    - `UPSERT_VPS`

    - `DELETE_VPS`

    - `BULK_INSERT_VPS`

    Failure rate metrics:

    - `SEARCH_FAIL_RATE`

    - `QUERY_FAIL_RATE`

    - `INSERT_FAIL_RATE`

    - `UPSERT_FAIL_RATE`

    - `DELTE_FAIL_RATE`

    - `BULK_INSERT_FAIL_RATE`

    Data metrics:

    - `ENTITIES`

    - `ENTITIES_LOADED`

    - `ENTITIES_INDEXED`

    - `COLLECTIONS`

    - `SLOW_QURIES`

    Serverless metrics:

    - `READ_VCU`

    - `WRITE_VCU`

- **--period** (*string*) -

    Indicates a relative time period from now. 

    Uses `d` for days, `m` for months. The value defaults to `1h`, indicating that the statistics are collected within the next hour.

- **--start** (*string*) -

    Indicates the start time of a time range. For example, `2026-03-01` or `2026-03-01T10:00:00Z`.

- **--end** (*string*) -

    Indicates the end time of a time range. For example, `2026-03-15` or `2026-03-15T18:00:00Z`.

- **--granularity, -g** (*string*) -

    Indicates the data point interval. For example, `30s`, `5m`, `1h`. This option defaults to `auto`.

- **--output, -o** (*string*) -

    Indicates the output format. When this option is omitted, results are rendered as an in-terminal Braille chart visualization (since v1.3.1). Explicit values:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz cluster metrics -m READ_VCU -m WRITE_VCU
```
