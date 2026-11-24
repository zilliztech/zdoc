---
title: "Metrics Reference | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "Metrics Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes organization metrics and metrics for serving clusters and their collections. | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Metrics Reference

This page describes organization metrics and metrics for serving clusters and their collections.

## Organization metrics\{#organization-metrics}

Organization metrics describe the billing status of a Zilliz Cloud organization across all its projects. They cover charges, balances, and the time remaining before credits or a payment card expire. Monetary values are in US dollars.

| Metric | Description |
| --- | --- |
| Usage Amount in the Past Day (&#36;) | Total usage charges over the past day. |
| Credit Validity (day) | Days until free credits expire. |
| Remaining Credits (&#36;) | Balance of unused free credits. |
| Credit Card Validity (day) | Days until the saved payment card expires. |
| Advance Pay Balance (&#36;) | Funds remaining in the advance payment account. |

## Serving cluster metrics\{#serving-cluster-metrics}

These metrics apply to clusters listed under **Serving Clusters** in the console. Cluster-level values cover the entire cluster. Collection-level values cover one collection. The charts available in the console depend on the cluster type.

### Resources\{#resources}

These metrics measure the entire cluster. Query CU and replica metrics apply to Dedicated clusters. Read and write vCUs apply to Free and Serverless clusters.

| Metric | Description |
| --- | --- |
| Read vCUs (count) | vCUs consumed by search and query operations. Alerts are unavailable for this metric. |
| Write vCUs (count) | vCUs consumed by insert, delete, and upsert operations. Alerts are unavailable for this metric. |
| Query CU Computation (%) | Query-node CPU usage as a percentage of its CPU limit. A sustained high value indicates that query execution is approaching the available CPU limit. |
| Query CU Capacity (%) | The higher of the percentage of memory used by loaded data and the percentage of the cluster storage quota in use. A sustained high value means that at least one of these resources is nearing its limit. |
| Total Query CU (count) | Query CUs per replica multiplied by the number of replicas. Two query CUs per replica and two replicas give four total query CUs. |
| Replica (count) | Number of replicas in the cluster. |
| Storage (GB) | Persistent storage used by data and indexes. *Applies to all serving cluster types.* |

### Performance\{#performance}

Unless an entry specifies a restriction, these metrics apply to all serving cluster types at both the cluster and collection levels.

| Metric | Description |
| --- | --- |
| QPS (Read) | Read requests per second, broken down by operation. Each request counts once, even if it contains multiple query vectors. |
| QPS (Write) | Write requests per second across insert, bulk insert, upsert, and delete operations. |
| Search NQ per Second | Number of query vectors carried by search requests per second. One search request can carry multiple vectors. |
| Write Throughput (Entities/sec) | Entities written per second across write operations. A single write request can affect multiple entities. |
| Latency (Read) (ms) | Average or 99th-percentile (P99) time from sending a read request to receiving its response. |
| Latency (Write) (ms) | Average or 99th-percentile (P99) time from sending a write request to receiving its response. |
| Request Failure Rate (Read) (%) | Reported failure rate for read requests, including searches and queries, expressed as a percentage. |
| Request Failure Rate (Write) (%) | Reported failure rate for write requests, expressed as a percentage. |
| Slow Query Count (counts/min) | Slow queries per minute. By default, a query is slow when latency exceeds five seconds. *Dedicated clusters on the Enterprise or Business Critical plan.* |
| Cluster Write Performance Capacity (%) | Current write rate as a percentage of the cluster’s write rate limit. If the value exceeds 80%, consider reducing the write rate. *Cluster level only. Dedicated clusters on the Enterprise or Business Critical plan.* |
| Number of Flush Operations (counts/min) | Number of flush operations per minute. Frequent flushes can reduce cluster performance. *Cluster level only. Dedicated clusters on the Enterprise or Business Critical plan.* ([Zilliz Cloud Limits](./limits#flush)) |
| Cache Hit Rate (%) | Average cache hit rate across queries. The hit rate for each query is (total data scanned − cold data scanned) / total data scanned. *Cluster level only. Dedicated clusters with tiered storage and Milvus 2.6.x.* |

### Data\{#data}

These metrics count collections and entities. Unless an entry specifies otherwise, they apply to the entire cluster across all serving cluster types.

| Metric | Description |
| --- | --- |
| Collection Count | Number of collections in the cluster. |
| Entity Count | Number of entities inserted into the cluster or collection, including single and bulk inserts. *Also available for an individual collection.* |
| Loaded Entities (Approx.) | Approximate number of loaded entities. *Dedicated clusters. Also available for an individual collection.* |
| Number of Unloaded Collections | Number of collections in the cluster that are currently unloaded. *Dedicated clusters on the Enterprise or Business Critical plan.* |

