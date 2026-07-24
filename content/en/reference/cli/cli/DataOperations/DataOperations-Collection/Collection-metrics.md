---
title: "metrics | Cloud"
slug: /cli/cli/Collection-metrics
sidebar_label: "metrics"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation fetches per-collection metrics (QPS, latency, VPS, failure rate, entity counts) for the given metric names over the requested time window. By default the result is rendered as an inline Braille chart; pass `-o table` for a pivot table or `-o json` / `-o yaml` / `-o csv` / `--query` for raw data. | Cloud"
type: docx
token: X1rVdVsuHogCohx1CX3cZFaQn1e
sidebar_position: 11
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
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

This operation fetches per-collection metrics (QPS, latency, VPS, failure rate, entity counts) for the given metric names over the requested time window. By default the result is rendered as an inline Braille chart; pass `-o table` for a pivot table or `-o json` / `-o yaml` / `-o csv` / `--query` for raw data.

## Synopsis\{#synopsis}

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

## Options\{#options}

- **--cluster-id** (*string*) -

    Indicates the cluster ID. When omitted, the active context cluster is used.

- **--collection-name, -c** (*string*) -

    **[REQUIRED]**

    Specifies the collection name to fetch metrics for.

- **--metric, -m** (*string*) -

    **[REQUIRED]**

    Specifies a metric name. Repeatable. Valid collection-scope metrics include: `SEARCH_QPS`, `QUERY_QPS`, `INSERT_QPS`, `UPSERT_QPS`, `DELETE_QPS`, `BULK_INSERT_QPS`, `HYBRID_SEARCH_QPS`, `SEARCH_LATENCY_AVG`, `SEARCH_LATENCY_P99`, `QUERY_LATENCY_AVG`, `QUERY_LATENCY_P99`, `INSERT_LATENCY_AVG`, `INSERT_LATENCY_P99`, `UPSERT_LATENCY_AVG`, `UPSERT_LATENCY_P99`, `DELETE_LATENCY_AVG`, `DELETE_LATENCY_P99`, `HYBRID_SEARCH_LATENCY_AVG`, `HYBRID_SEARCH_LATENCY_P99`, `SEARCH_VPS`, `INSERT_VPS`, `UPSERT_VPS`, `DELETE_VPS`, `BULK_INSERT_VPS`, `SEARCH_FAIL_RATE`, `QUERY_FAIL_RATE`, `INSERT_FAIL_RATE`, `UPSERT_FAIL_RATE`, `DELETE_FAIL_RATE`, `HYBRID_SEARCH_FAIL_RATE`, `BULK_INSERT_FAIL_RATE`, `ENTITIES`, `ENTITIES_LOADED`, `ENTITIES_INDEXED`.

- **--period** (*string*) -

    Indicates the look-back window. Accepted values: `10m`, `1h`, `6h`, `24h`, `3d`, `7d`. Default: `1h`. Mutually exclusive with `--start` / `--end`.

- **--start** (*string*) -

    Indicates the start timestamp in ISO 8601 format (for example, `2026-04-01T00:00:00Z`). Use with `--end` instead of `--period` for explicit ranges.

- **--end** (*string*) -

    Indicates the end timestamp in ISO 8601 format. Pairs with `--start`.

- **--granularity, -g** (*string*) -

    Indicates the data-point interval. Accepted values: `1m`, `5m`, `1h`, `1d`. Defaults to a sensible value based on `--period`.

## Example\{#example}

```bash
# Inline chart of insert + search QPS over the last hour
zilliz collection metrics -c my_collection -m INSERT_QPS -m SEARCH_QPS

# Pivot table of latency for the last 24 hours, 5-minute granularity
zilliz collection metrics -c my_collection -m SEARCH_LATENCY_P99 -m QUERY_LATENCY_P99 --period 24h -g 5m -o table

# Raw JSON for downstream tooling
zilliz collection metrics -c my_collection -m ENTITIES -o json
```
