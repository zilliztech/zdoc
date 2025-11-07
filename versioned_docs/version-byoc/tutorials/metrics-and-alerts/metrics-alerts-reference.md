---
title: "Metrics Reference | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "Metrics Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud categorizes metrics in two levels - Organization and Project | BYOC"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


# Metrics Reference

Zilliz Cloud categorizes metrics in two levels - **Organization** and **Project**:

- **Organization-level metrics**: Reflect account-wide status (e.g., license credits, usage) across all projects.

- **Project-level metrics**: Reflect cluster resources, capacity, performance, and data within a single project.

<Admonition type="info" icon="📘" title="Notes">

<p>Most metrics support alerts. An alert evaluates a metric against a condition (operator + threshold) over a time window and notifies you when it’s met. For configuration, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a> and <a href="./manage-project-alerts">Manage Project Alerts</a>.</p>

</Admonition>

## Organization-level metrics\{#organization-level-metrics}

Organization-level metrics help you track license-related issues across all projects in an organization.

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>License Validity</p></td>
     <td><p>day</p></td>
     <td><p>Remaining days before the organization license expires.</p></td>
     <td><ul><li><p><strong>< 60 days</strong>: start renewal process.</p></li><li><p><strong>Expired</strong>: renew/upgrade immediately to restore full functionality (e.g., cluster creation/scale-up).</p></li></ul></td>
   </tr>
   <tr>
     <td><p>License Core Usage</p></td>
     <td><p>%</p></td>
     <td><p>Percentage of used CPU cores vs. total licensed cores.</p></td>
     <td><ul><li><p><strong>></strong> <strong>70%</strong>: assess future needs and plan renewal/upgrade.</p></li><li><p><strong>100%</strong>: renew/upgrade immediately to avoid disruption.</p></li></ul></td>
   </tr>
</table>

## Project-level metrics (cluster metrics)\{#project-level-metrics-cluster-metrics}

These metrics describe resource usage and performance within a project’s clusters.

<Admonition type="info" icon="📘" title="Notes">

<p>In this section, <strong>Availability</strong> refers to the project plan &amp; deployment options. For detailed plan comparison, refer to <a href="./select-zilliz-cloud-service-plans">Detailed Plan Comparison</a>.</p>

</Admonition>

### Pod & container resources\{#pod-and-container-resources}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended action</p></th>
     <th><p>Availability</p></th>
   </tr>
   <tr>
     <td><p>CPU Usage</p></td>
     <td><p>core</p></td>
     <td><p>The number of CPU cores used by pods.</p></td>
     <td><p>Track trends; investigate sustained growth or spikes.</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>CPU Usage Rate for Limit</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of the pod CPU usage in the value of limit.</p></td>
     <td><p>If trending up, optimize workloads or increase limits.</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>Memory Usage</p></td>
     <td><p>MB</p></td>
     <td><p>The memory usage of containers in the pod (with cache excluded).</p></td>
     <td><p>Investigate steady growth or suspected leaks.</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>Memory Usage Rate for Limit</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of the pod memory usage in the value of limit.</p></td>
     <td><p>Optimize memory or raise limits if consistently high.</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>Network Inbound Flow</p></td>
     <td><p>Mbps</p></td>
     <td><p>The network inbound flow of pod.</p></td>
     <td><p>Watch for congestion; validate bandwidth sizing.</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>Network Outbound Flow</p></td>
     <td><p>Mbps</p></td>
     <td><p>The network outbound flow of pod.</p></td>
     <td><p>Watch for congestion; validate bandwidth sizing.</p></td>
     <td><p>BYOC</p></td>
   </tr>
</table>

### Resources\{#resources}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended action</p></th>
     <th><p>Availability</p></th>
   </tr>
   <tr>
     <td><p>Query CU Computation</p></td>
     <td><p>%</p></td>
     <td><p>A measure of the utilized computational power relative to the total computational capacity of the CU.</p></td>
     <td><ul><li><p>70–80%: check service status &amp; prep <a href="./scale-cluster">scale-up</a>.</p></li><li><p>&gt;90%: <a href="./scale-cluster">scale up</a> to avoid interruption.</p></li></ul></td>
     <td><p>Dedicated / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Query CU Capacity</p></td>
     <td><p>%</p></td>
     <td><p>A measure of the used capacity relative to the total capacity of the CU.</p></td>
     <td><ul><li><p>70–80%: prep <a href="./scale-cluster">scale up</a>.</p></li><li><blockquote>  <p>90%: <a href="./scale-cluster">scale up</a>.</p></blockquote></li><li><p><strong>100%:</strong> writes are blocked—<a href="./scale-cluster">scale up</a> immediately.</p></li></ul></td>
     <td><p>Dedicated / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Total Query CU</p></td>
     <td><p>count</p></td>
     <td><p>The total query CU in the current cluster. It is calculated as the product of the numbers of cluster query CU and replica. (Eg. If your cluster has 2 Query CUs and 2 Replicas, the Total Query CU displayed here is 4.)</p></td>
     <td><p>Track to identify query-CU scaling events.</p></td>
     <td><p>Dedicated / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Replica</p></td>
     <td><p>count</p></td>
     <td><p>The number of cluster replicas.</p></td>
     <td><p>Track to identify replica scaling events.</p></td>
     <td><p>Dedicated / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>GB</p></td>
     <td><p>The total amount of persistent storage consumed by data and indexes.</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring storage usage.</p></td>
     <td><p>All</p></td>
   </tr>
</table>

### Performance\{#performance}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended action</p></th>
     <th><p>Availability</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read)</p></td>
     <td><p>-</p></td>
     <td><p>The number of read requests (search and query) per second.</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write)</p></td>
     <td><p>-</p></td>
     <td><p>The number of write requests (insert, bulk insert, upsert, and delete) per second.</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second</p></td>
     <td><p>-</p></td>
     <td><p>The number of query vectors that each search request carries per second.</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec)</p></td>
     <td><p>-</p></td>
     <td><p>Measures the number of entities written per second across all write operations (insert, upsert, bulk insert, and delete).</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read)</p></td>
     <td><p>ms</p></td>
     <td><p>The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency.</p></td>
     <td><p>-</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write)</p></td>
     <td><p>ms</p></td>
     <td><p>The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency.</p></td>
     <td><p>-</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read)</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of all failed read requests in all requests per second.</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring read request failure rate.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write)</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of all failed write requests in all requests per second.</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring write request failure rate.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count</p></td>
     <td><p>counts/min</p></td>
     <td><p>The number of queries that take an unusually long time to execute.</p></td>
     <td><p>Identify problematic queries and tune performance by adjusting cluster configuration as necessary.</p></td>
     <td><p>Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity</p></td>
     <td><p>%</p></td>
     <td><p>Cluster write performance capacity = Current rate of write operations/write rate limit. When it exceeds 80%, it is recommended to reduce the rate of your write operations (insert and upsert).</p></td>
     <td><p>If the current rate is too high (suggested to be over 80%), it is recommended that you lower the write rate.</p></td>
     <td><p>Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations</p></td>
     <td><p>counts/min</p></td>
     <td><p>The number of flush operations on a cluster.</p></td>
     <td><p>Performing flush operations too frequently can negatively impact the overall performance of the cluster. For more information, refer to <a href="https://docs.cloud-uat3.zilliz.com/docs/limits#flush">Zilliz Cloud Limits</a>.</p></td>
     <td><p>Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
   </tr>
</table>

### Data\{#data}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended action</p></th>
     <th><p>Availability</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>count</p></td>
     <td><p>The number of collections created in a cluster.</p></td>
     <td><p>Monitor growth; enforce per-project limits if needed.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Entity Count</p></td>
     <td><p>count</p></td>
     <td><p>The total number of entities inserted into the cluster, including both single inserts and bulk inserts.</p></td>
     <td><p>Investigate unexpected growth; plan storage and indexing.</p></td>
     <td><p>All</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.)</p></td>
     <td><p>count</p></td>
     <td><p>The approximate number of entities loaded (actively served).</p></td>
     <td><p>For a more accurate and real-time value, please refer to the 'Loaded Entities' value on the collection overview page or use <a href="./single-vector-search">count(*)</a>.</p></td>
     <td><p>Dedicated / BYOC</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>count</p></td>
     <td><p>The number of unloaded collections in a cluster.</p></td>
     <td><p>Load critical collections; review memory headroom.</p></td>
     <td><p>Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
   </tr>
</table>

## Related topics\{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

