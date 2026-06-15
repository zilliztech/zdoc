---
title: "Metrics Reference | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "Metrics Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud organizes metrics into the following levels | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Metrics Reference

Zilliz Cloud organizes metrics into the following levels:

- **Organization-level metrics**: Reflect account-wide status (e.g., license credits, usage) across all projects.

- **Cluster-level metrics**: Reflect resource usage, performance, and data within individual clusters.

- **Collection-level metrics**: A subset of cluster metrics broken down per collection, helping you pinpoint performance issues and plan capacity for individual collections.

<Admonition type="info" icon="📘" title="Notes">

Most metrics support alerts. An alert evaluates a metric against a condition (operator + threshold) over a time window and notifies you when it’s met. For configuration, refer to [Manage Organization Alerts](./manage-organization-alerts) and [Manage Project Alerts](./manage-project-alerts).

</Admonition>

## Organization-level metrics\{#organization-level-metrics}

Organization-level metrics help you track billing-related issues across all projects in an organization.

| Metric | Description | Recommended action |
| --- | --- | --- |
| Usage Amount in the Past Day ($) | Cumulative usage charges over a the past day. | Monitor vs. budget; optimize usage or adjust budget as needed. |
| Credit Validity (day) | Days left before free credits expire. | Use or extend credits before expiry. |
| Remaining Credits ($) | Balance of free credits. | Top up when low to maintain account functionality. |
| Credit Card Validity (day) | Days until the saved card expires. | Update or replace card before expiry to avoid payment failures. |
| Advance Pay Balance ($) | Remaining pre-paid funds. | Add funds when low to prevent service interruption. |

## Cluster and collection metrics\{#cluster-and-collection-metrics}

These metrics describe resource usage, performance, and data within individual clusters. Metrics marked with **✦** are also available at the collection level. You can access collection-level metrics from the collection detail page in the Console, via the [Prometheus endpoint](./prometheus-monitoring), or through the RESTful API.

<Admonition type="info" icon="📘" title="Notes">

In this section, **Availability** refers to the project plan & deployment options. For detailed plan comparison, refer to [Detailed Plan Comparison](./select-zilliz-cloud-service-plans).

</Admonition>

### Resources\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Read vCUs (count) | A measure of vCU consumption of search and query operations.<br/>Note: Alerts are not supported for this metric. | Free / Serverless | Monitor trends to understand read cost/throughput. |
| Write vCUs (count) | A measure of vCU consumption of insert, delete, and upsert operations.<br/>Note: Alerts are not supported for this metric. | Free / Serverless | Monitor trends to understand write cost/throughput. |
| Query CU Computation (%) | Measures how heavily query execution is using CPU resources. It is calculated from QueryNode CPU usage relative to its CPU limit. | Dedicated / BYOC | A sustained high value means query execution is CPU-bound. Zilliz Cloud may [scale out replicas](./manage-replica) to increase parallel query processing capacity. |
| Query CU Capacity (%) | Measures how close the current Query CU is to its capacity limit. It uses the higher of two signals: memory used by loaded data, and stored data size relative to the cluster storage quota. | Dedicated / BYOC | A sustained high value indicates that the current Query CU size may not have enough capacity. If auto scaling is enabled, Zilliz Cloud may [scale up query CU](./manage-replica) to provide more capacity. |
| Total Query CU (count) | The total query CU in the current cluster. It is calculated as the product of the numbers of cluster query CU and replica. (Eg. If your cluster has 2 Query CUs and 2 Replicas, the Total Query CU displayed here is 4.) | Dedicated / BYOC | Track to identify query-CU scaling events. |
| Replica (count) | The number of cluster replicas. | Dedicated / BYOC | Track to identify replica scaling events. |
| Storage (GB) | The total amount of persistent storage consumed by data and indexes. | All | [Configure alerts](./manage-project-alerts) for monitoring storage usage. |

### Performance\{#performance}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| QPS (Read) ✦ | The number of read requests (search and query) per second. | All | Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring. |
| QPS (Write) ✦ | The number of write requests (insert, bulk insert, upsert, and delete) per second. | All | Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring. |
| Search NQ per Second ✦ | The number of query vectors that each search request carries per second. | All | Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring. |
| Write Throughput (Entities/sec) ✦ | Measures the number of entities written per second across all write operations (insert, upsert, bulk insert, and delete). | All | Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring. |
| Latency (Read) (ms) ✦ | The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency. | All | - |
| Latency (Write) (ms) ✦ | The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency. | All | - |
| Request Failure Rate (Read) (%) ✦ | The percentage of all failed read requests in all requests per second. | All | [Configure alerts](./manage-project-alerts) for monitoring read request failure rate. |
| Request Failure Rate (Write) (%) ✦ | The percentage of all failed write requests in all requests per second. | All | [Configure alerts](./manage-project-alerts) for monitoring write request failure rate. |
| Slow Query Count (counts/min) | The number of queries that take an unusually long time to execute.<br/>By default, queries with a latency exceeding 5 seconds are considered slow queries. | Dedicated (Enterprise or  Business Critical) / BYOC | Identify problematic queries and tune performance by adjusting cluster configuration as necessary. |
| Cluster Write Performance Capacity (%) | Cluster write performance capacity = Current rate of write operations/write rate limit. When it exceeds 80%, it is recommended to reduce the rate of your write operations (insert and upsert). | Dedicated (Enterprise or  Business Critical) / BYOC | If the current rate is too high (suggested to be over 80%), it is recommended that you lower the write rate. |
| Number of Flush Operations (counts/min) | The number of flush operations on a cluster. | Dedicated (Enterprise or  Business Critical) / BYOC | Performing flush operations too frequently can negatively impact the overall performance of the cluster. For more information, refer to [Zilliz Cloud Limits](./limits#flush). |
| Cache Hit Rate (%) | The average cache hit rate of all queries in the cluster, calculated as: Cache hit rate per query = (Total scanned data − Cold data scanned) / Total scanned data. | Dedicated (Tiered-storage) / BYOC<br/>*&ast;This metric is only available to tiered-storage clusters compatible with Milvus 2.6.x. To access this metric, [contact us](http://support.zilliz.com) to upgrade your cluster Milvus version.* | Track to identify cluster query performance. |

### Data\{#data}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Collection Count | The number of collections created in a cluster. | All | Monitor growth; enforce per-project limits if needed. |
| Entity Count ✦ | The total number of entities inserted into the cluster or collection, including both single inserts and bulk inserts. | All | Investigate unexpected growth; plan storage and indexing. |
| Loaded Entities (Approx.) ✦ | The approximate number of entities loaded (actively served). | Dedicated / BYOC | For a more accurate and real-time value, please refer to the 'Loaded Entities' value on the collection overview page or use [count(*)](./single-vector-search). |
| Number of Unloaded Collections | The number of unloaded collections in a cluster. | Dedicated (Enterprise or  Business Critical) / BYOC | Load critical collections; review memory headroom. |

### Others\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | When the target cluster's status is abnormal. | Dedicated (Enterprise or  Business Critical) / BYOC | Investigate the cluster status and take measures accordingly. |
| CMEK is Unavailable | When one of your KMS keys added to Zilliz Cloud becomes unavailable. | Dedicated (Enterprise or  Business Critical) / BYOC | Check your KMS keys to determine whether the reported key is still available. |
| Writes to Cluster Are Disabled | When writes to the target cluster are disabled due to an error or protection mechanism. | Dedicated (Enterprise or  Business Critical) / BYOC | Check the cluster status, recent configuration or maintenance operations, and any related alerts, then resolve the root cause and restore write capability. |

## Related topics\{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

