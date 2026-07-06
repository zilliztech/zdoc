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

The **Availability** column lists the compute resources that support each metric:

- **Serving Clusters only**: The metric is available only for Serving Clusters. The value lists the supported Serving Cluster deployment options. **All** means all Serving Cluster deployment options. For details, refer to  [Deployment and Plan Comparison](./select-zilliz-cloud-service-plans).

- **On-Demand Compute databases**: Only a subset of collection-level metrics is available. Supported metrics include **QPS (Read)**, **Search NQ per Second**, **Latency (Read)**, **Request Failure Rate (Read)**, and **Entity Count**.

</Admonition>

### Resources\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Read vCUs (count) | A measure of vCU consumption of search and query operations.<br/>Note: Alerts are not supported for this metric. | **Serving Clusters only**: Free / Serverless | Monitor trends to understand read cost/throughput. |
| Write vCUs (count) | A measure of vCU consumption of insert, delete, and upsert operations.<br/>Note: Alerts are not supported for this metric. | **Serving Clusters only**: Free / Serverless | Monitor trends to understand write cost/throughput. |
| Query CU Computation (%) | Measures how heavily query execution is using CPU resources. It is calculated from QueryNode CPU usage relative to its CPU limit. | **Serving Clusters only**: Dedicated / BYOC | A sustained high value means query execution is CPU-bound. Zilliz Cloud may [scale out replicas](./undefined) to increase parallel query processing capacity. |
| Query CU Capacity (%) | Measures how close the current Query CU is to its capacity limit. It uses the higher of two signals: memory used by loaded data, and stored data size relative to the cluster storage quota. | **Serving Clusters only**: Dedicated / BYOC | A sustained high value indicates that the current Query CU size may not have enough capacity. If auto scaling is enabled, Zilliz Cloud may [scale up query CU](./undefined) to provide more capacity. |
| Total Query CU (count) | The total query CU in the current cluster. It is calculated as the product of the numbers of cluster query CU and replica. (Eg. If your cluster has 2 Query CUs and 2 Replicas, the Total Query CU displayed here is 4.) | **Serving Clusters only**: Dedicated / BYOC | Track to identify query-CU scaling events. |
| Replica (count) | The number of cluster replicas. | **Serving Clusters only**: Dedicated / BYOC | Track to identify replica scaling events. |
| Storage (GB) | The total amount of persistent storage consumed by data and indexes. | **Serving Clusters only**: All | [Configure alerts](./manage-project-alerts) for monitoring storage usage. |

### Performance\{#performance}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read) ✦</p></td>
     <td><p>The number of read requests (search and query) per second.</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write) ✦</p></td>
     <td><p>The number of write requests (insert, bulk insert, upsert, and delete) per second.</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>The number of query vectors that each search request carries per second.</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>Measures the number of entities written per second across all write operations (insert, upsert, bulk insert, and delete).</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency.</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency.</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>The percentage of all failed read requests in all requests per second.</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring read request failure rate.</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>The percentage of all failed write requests in all requests per second.</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring write request failure rate.</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min) ✦</p></td>
     <td><p>The number of queries that take an unusually long time to execute.</p><p>By default, queries with a latency exceeding 5 seconds are considered slow queries.</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>Identify problematic queries and tune performance by adjusting cluster configuration as necessary.</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (%)</p></td>
     <td><p>Cluster write performance capacity = Current rate of write operations/write rate limit. When it exceeds 80%, it is recommended to reduce the rate of your write operations (insert and upsert).</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>If the current rate is too high (suggested to be over 80%), it is recommended that you lower the write rate.</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations (counts/min)</p></td>
     <td><p>The number of flush operations on a cluster.</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>Performing flush operations too frequently can negatively impact the overall performance of the cluster. For more information, refer to <a href="./limits#flush">Zilliz Cloud Limits</a>.</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>The average cache hit rate of all queries in the cluster, calculated as: Cache hit rate per query = (Total scanned data − Cold data scanned) / Total scanned data.</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;This metric is only available to tiered-storage clusters compatible with Milvus 2.6.x. To access this metric, <a href="http://support.zilliz.com">contact us</a> to upgrade your cluster Milvus version.</em></p></td>
     <td><p>Track to identify cluster query performance.</p></td>
   </tr>
</table>

### Data\{#data}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>The number of collections created in a cluster.</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>Monitor growth; enforce per-project limits if needed.</p></td>
   </tr>
   <tr>
     <td><p>Entity Count ✦</p></td>
     <td><p>The total number of entities inserted into the cluster or collection, including both single inserts and bulk inserts.</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>Investigate unexpected growth; plan storage and indexing.</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.) ✦</p></td>
     <td><p>The approximate number of entities loaded (actively served).</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated / BYOC</p></td>
     <td><p>For a more accurate and real-time value, please refer to the 'Loaded Entities' value on the collection overview page or use <a href="./single-vector-search">count(&ast;)</a>.</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>The number of unloaded collections in a cluster.</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>Load critical collections; review memory headroom.</p></td>
   </tr>
</table>

### Others\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | When the target cluster's status is abnormal. | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | Investigate the cluster status and take measures accordingly. |
| CMEK is Unavailable | When one of your KMS keys added to Zilliz Cloud becomes unavailable. | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | Check your KMS keys to determine whether the reported key is still available. |
| Writes to Cluster Are Disabled | When writes to the target cluster are disabled due to an error or protection mechanism. | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | Check the cluster status, recent configuration or maintenance operations, and any related alerts, then resolve the root cause and restore write capability. |
| Access Logs Forwarding is Abnormal | When access logs cannot be forwarded normally to the configured storage integration. | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | Check the log forwarding configuration, destination service status, network connectivity, and related credentials or permissions, then resolve the issue and verify that log forwarding resumes. |
| Audit Logs Forwarding is Abnormal | When audit logs cannot be forwarded normally to the configured storage integration. | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | Check the log forwarding configuration, destination service status, network connectivity, and related credentials or permissions, then resolve the issue and verify that log forwarding resumes. |

## Related topics\{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

