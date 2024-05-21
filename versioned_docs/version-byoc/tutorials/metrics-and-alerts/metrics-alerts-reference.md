---
slug: /metrics-alerts-reference
beta: FALSE
notebook: FALSE
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Metrics & Alerts Reference

In this reference, you can find descriptions of monitoring metrics for Zilliz Cloud clusters, as well as alert targets that you can set up at organization and project levels.

## Cluster metrics{#cluster-metrics}

The **Metrics** tab in the Zilliz Cloud console presents various graphical representations.

The table provides a description of each metric and the actions that you are advised to perform when the usage of your cluster resource exceeds a threshold.

<table>
   <tr>
     <th>Metric Name</th>
     <th>Unit</th>
     <th>Description</th>
     <th>Recommended Action</th>
   </tr>
   <tr>
     <td colspan="4"></td>
   </tr>
   <tr>
     <td colspan="4"><strong>Resources</strong></td>
   </tr>
   <tr>
     <td>CU Computation<br/></td>
     <td>%</td>
     <td>A measure of the utilized computational power relative to the total computational capacity of the CU.</td>
     <td></td>
   </tr>
   <tr>
     <td>CU Capacity<br/></td>
     <td>%</td>
     <td>A measure of the used capacity relative to the total capacity of the CU.<br/> <br/></td>
     <td></td>
   </tr>
   <tr>
     <td>Storage</td>
     <td>GB</td>
     <td>The total amount of persistent storage consumed by data and indexes. <br/></td>
     <td><a href="./manage-project-alerts">Configure alerts</a> for monitoring storage usage.</td>
   </tr>
   <tr>
     <td colspan="4"><strong>Performance</strong></td>
   </tr>
   <tr>
     <td>QPS/VPS (Read)</td>
     <td>QPS/VPS</td>
     <td><strong>QPS</strong>: The number of read requests (search and query) per second.<br/> <strong>VPS</strong>: The number of read requests (search) on vectors per second. VPS is not available for query requests as query operations do not involve vectors.</td>
     <td>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.<br/></td>
   </tr>
   <tr>
     <td>QPS/VPS (Write)<br/></td>
     <td>QPS/VPS</td>
     <td><strong>QPS</strong>: The number of write requests (insert, bulk insert, upsert, and delete) per second.<br/> <strong>VPS</strong>: The number of write requests (insert, bulk insert, upsert, and delete) on vectors per second.</td>
     <td>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.<br/></td>
   </tr>
   <tr>
     <td>Latency (Read)<br/></td>
     <td>ms</td>
     <td>The time elapsed between a client sending a read request (search and query) to a server and the client receiving a response. <br/> Selecting <strong>Average</strong> or <strong>P99</strong> from the expanded dropdown menu on the right displays an average or P99 latency.</td>
     <td>-</td>
   </tr>
   <tr>
     <td>Latency (Write)</td>
     <td>ms</td>
     <td>The time elapsed between a client sending a write request (insert, upsert, and delete) to a server and the client receiving a response. <br/> Selecting <strong>Average</strong> or <strong>P99</strong> from the expanded dropdown menu on the right displays an average or P99 latency.</td>
     <td>-</td>
   </tr>
   <tr>
     <td>Request Failure Rate (Read)</td>
     <td>%</td>
     <td>The percentage of timeout read requests (search and query) in all read requests per second.</td>
     <td><a href="./manage-project-alerts">Configure alerts</a> to monitor read request failure rate.</td>
   </tr>
   <tr>
     <td>Request Failure Rate (Write)</td>
     <td>%</td>
     <td>The percentage of timeout write requests (insert, bulk insert, upsert, and delete) in all write requests per second.</td>
     <td><a href="./manage-project-alerts">Configure alerts</a> to monitor write request failure rate.</td>
   </tr>
   <tr>
     <td>Slow Query Count<br/></td>
     <td>count/s</td>
     <td>The number of slow query operations, including all search and query requests. By default, all requests whose latency is 5 seconds are considered slow queries.<br/> This metric type is available only for <a href="./select-zilliz-cloud-service-plans#bring-your-own-cloud-byoc">BYOC</a> clusters or clusters of the <a href="/docs/select-zilliz-cloud-service-plans?_highlight=enterprise#enterprise-plan">Enterprise</a> edition.</td>
     <td>Identify problematic queries and tune performance by adjusting cluster configuration as necessary.<br/></td>
   </tr>
   <tr>
     <td colspan="4"><strong>Data</strong></td>
   </tr>
   <tr>
     <td>Collection Count</td>
     <td>count</td>
     <td>The number of collections created in a cluster.</td>
     <td>-</td>
   </tr>
   <tr>
     <td>Entity Count</td>
     <td>count</td>
     <td>The number of entities created in a cluster.<br/> Selecting a specific collection from the expanded dropdown menu on the right displays the number of entities at the collection level.</td>
     <td>-</td>
   </tr>
   <tr>
     <td>Loaded Entities</td>
     <td>count</td>
     <td>The number of entities loaded (actively served) by a cluster.<br/> Selecting a specific collection from the expanded dropdown menu on the right displays the number of entities at the collection level.</td>
     <td>-</td>
   </tr>
</table>

## Organization alerts{#organization-alerts}

Organization alerts keep you informed about license-related issues such as the license cores and validity period.

<table>
   <tr>
     <th>Alert Target</th>
     <th>Unit</th>
     <th>Description</th>
     <th>Recommended Action</th>
     <th>Default Trigger Condition</th>
   </tr>
   <tr>
     <td>License (Core Usage)<br/></td>
     <td>%</td>
     <td>Monitor the percentage of used CPU cores against the total licensed cores.</td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td>License (Validity Period)</td>
     <td>Day</td>
     <td>Track the remaining days of license validity.</td>
     <td></td>
     <td></td>
   </tr>
</table>

## Project alerts{#project-alerts}

Project alerts focus on the operational aspects of your clusters, including notifications on the CU usage, QPS thresholds, latency issues, and request anomalies, ensuring you maintain optimal cluster performance.

### Default alert targets{#default-alert-targets}

Zilliz Cloud predefines common alert targets to ensure that critical issues are quickly identified and addressed with the appropriate actions.

For more information about recommended actions, refer to [Cluster metrics](./metrics-alerts-reference#cluster-metrics).

<table>
   <tr>
     <th>Alert Target</th>
     <th>Unit</th>
     <th>Default Trigger Condition</th>
   </tr>
   <tr>
     <td>CU Computation<br/></td>
     <td>%</td>
     <td></td>
   </tr>
   <tr>
     <td>CU Capacity</td>
     <td>%</td>
     <td></td>
   </tr>
   <tr>
     <td>Search (QPS)</td>
     <td>QPS</td>
     <td>Trigger <strong>WARNING</strong> alerts at &gt;50 search operations per second for 10+ minutes.</td>
   </tr>
   <tr>
     <td>Query (QPS)</td>
     <td>QPS</td>
     <td>Trigger <strong>WARNING</strong> alerts at &gt;50 query operations per second for 10+ minutes.</td>
   </tr>
   <tr>
     <td>Search Latency (P99)</td>
     <td>ms</td>
     <td>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</td>
   </tr>
   <tr>
     <td>Query Latency (P99)</td>
     <td>ms</td>
     <td>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</td>
   </tr>
</table>

### Custom alert targets{#custom-alert-targets}

In addition to the predefined default project alerts , you can also configure custom alert targets as needed.

<table>
   <tr>
     <th>Alert Target</th>
     <th>Description</th>
   </tr>
   <tr>
     <td><strong>Resource</strong></td>
     <td></td>
   </tr>
   <tr>
     <td>Storage</td>
     <td>Monitor storage usage and send notifications if the usage exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td><strong>Performance (read/write)</strong></td>
     <td></td>
   </tr>
   <tr>
     <td>Bulk Insert (QPS)<br/></td>
     <td>Monitor the rate of bulk insert operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Delete (QPS)<br/></td>
     <td>Monitor the rate of delete operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Insert (QPS)</td>
     <td>Monitor the rate of insert operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Insert (VPS)<br/></td>
     <td>Monitor the rate of vector insert operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Search (VPS)<br/></td>
     <td>Monitor the rate of vector search operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Upsert (QPS)<br/></td>
     <td>Monitor the rate of upsert operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Upsert (VPS)</td>
     <td>Monitor the rate of vector upsert operations and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td><strong>Performance (latency)</strong></td>
     <td></td>
   </tr>
   <tr>
     <td>Delete Latency (Average)</td>
     <td>Monitor the average latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Delete Latency (P99)</td>
     <td>Monitor the P99 latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Insert Latency (Average)</td>
     <td>Monitor the average latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Insert Latency (P99)</td>
     <td>Monitor the P99 latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Query Latency (Average)</td>
     <td>Monitor the average latency for query requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Search Request Latency (Average)</td>
     <td>Monitor the average latency for search requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Upsert Latency (Average)<br/></td>
     <td>Monitor the average latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Upsert Latency (P99)<br/></td>
     <td>Monitor the P99 latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td><strong>Performance (request failure rate)</strong></td>
     <td></td>
   </tr>
   <tr>
     <td>Bulk Insert Failure Rate</td>
     <td>Monitor the failure rate of bulk insert requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Delete Failure Rate</td>
     <td>Monitor the failure rate of delete requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Insert Failure Rate</td>
     <td>Monitor the failure rate of insert requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Query Failure Rate</td>
     <td>Monitor the failure rate of query requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Search Failure Rate</td>
     <td>Monitor the failure rate of search requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Upsert Failure Rate</td>
     <td>Monitor the failure rate of upsert requests and send notifications if the rate exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td><strong>Data</strong></td>
     <td></td>
   </tr>
   <tr>
     <td>Loaded Entities</td>
     <td>Monitor the number of loaded entities and send notifications if the count exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Total Collections</td>
     <td>Monitor the number of total collections and send notifications if the count exceeds a threshold for a certain duration.</td>
   </tr>
   <tr>
     <td>Total Entities</td>
     <td>Monitor the number of total entities and send notifications if the count exceeds a threshold for a certain duration.</td>
   </tr>
</table>

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

