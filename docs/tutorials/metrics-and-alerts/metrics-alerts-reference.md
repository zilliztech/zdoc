---
title: "Metrics & Alerts Reference | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "Metrics & Alerts Reference"
beta: FALSE
notebook: FALSE
description: "In this reference, you can find descriptions of monitoring metrics for Zilliz Cloud clusters, as well as alert targets that you can set up at organization and project levels. | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


# Metrics & Alerts Reference

In this reference, you can find descriptions of monitoring metrics for Zilliz Cloud clusters, as well as alert targets that you can set up at organization and project levels.

## Cluster metrics{#cluster-metrics}

The **Metrics** tab in the Zilliz Cloud console presents various graphical representations.

The table provides a description of each metric and the actions that you are advised to perform when the usage of your cluster resource exceeds a threshold.

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, free clusters offer only one metric, CU Capacity. To unlock a range of advanced metrics, <a href="./manage-cluster#upgrade-plan">upgrade your plan tier</a>.</p>

</Admonition>

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended Action</p></th>
   </tr>
   <tr>
     <td colspan="4"><p><strong>Resources</strong></p></td>
   </tr>
   <tr>
     <td><p>Read vCUs</p></td>
     <td><p>Count</p></td>
     <td><p>A measure of vCU consumption of search and query operations.</p><p>This metric is available only for <strong>Free</strong> or <strong>Serverless</strong> clusters. For more information on cluster plan tiers, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Write vCUs</p></td>
     <td><p>Count</p></td>
     <td><p>A measure of vCU consumption of insert, delete, and upsert operations.</p><p>This metric is available only for <strong>Free</strong> or <strong>Serverless</strong> clusters. For more information on cluster plan tiers, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>CU Computation</p></td>
     <td><p>%</p></td>
     <td><p>A measure of the utilized computational power relative to the total computational capacity of the CU.</p><p>This metric is available only for <strong>Dedicated</strong> or <strong>BYOC</strong> clusters. For more information on cluster plan tiers, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p><strong>70%-80%</strong>: Check service status and prepare for <a href="./manage-cluster">scaling up</a>.</p><p><strong>> 90%</strong>: <a href="./manage-cluster">Scale up</a> immediately to avoid service interruption.</p></td>
   </tr>
   <tr>
     <td><p>CU Capacity</p></td>
     <td><p>%</p></td>
     <td><p>A measure of the used capacity relative to the total capacity of the CU.</p><p>This metric is available for <strong>Free</strong>, <strong>Dedicated</strong> or <strong>BYOC</strong> clusters. For more information on cluster plan tiers, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p><strong>70%-80%</strong>: Check service status and prepare for scaling up.</p><p><strong>> 90%</strong>: <a href="./manage-cluster">Scale up</a> immediately to avoid service interruption.</p><p><strong>100%</strong>: When CU capacity reaches 100%, you will be unable to write data into the cluster. Please <a href="./manage-cluster">scale up</a> immediately to avoid service interruption.</p></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>GB</p></td>
     <td><p>The total amount of persistent storage consumed by data and indexes. </p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> for monitoring storage usage.</p></td>
   </tr>
   <tr>
     <td colspan="4"><p><strong>Performance</strong></p></td>
   </tr>
   <tr>
     <td><p>QPS/VPS (Read)</p></td>
     <td><p>QPS/VPS</p></td>
     <td><p><strong>QPS</strong>: The number of read requests (search and query) per second.</p><p><strong>VPS</strong>: The number of read requests (search) on vectors per second. VPS is not available for query requests as query operations do not involve vectors.</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>QPS/VPS (Write)</p></td>
     <td><p>QPS/VPS</p></td>
     <td><p><strong>QPS</strong>: The number of write requests (insert, bulk insert, upsert, and delete) per second.</p><p><strong>VPS</strong>: The number of write requests (insert, bulk insert, upsert, and delete) on vectors per second.</p></td>
     <td><p>Refer to <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> for system performance monitoring.</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read)</p></td>
     <td><p>ms</p></td>
     <td><p>The time elapsed between a client sending a read request (search and query) to a server and the client receiving a response. </p><p>Selecting <strong>Average</strong> or <strong>P99</strong> from the expanded dropdown menu on the right displays an average or P99 latency.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write)</p></td>
     <td><p>ms</p></td>
     <td><p>The time elapsed between a client sending a write request (insert, upsert, and delete) to a server and the client receiving a response. </p><p>Selecting <strong>Average</strong> or <strong>P99</strong> from the expanded dropdown menu on the right displays an average or P99 latency.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read)</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of failed read requests (search and query) in all read requests per second.</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> to monitor read request failure rate.</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write)</p></td>
     <td><p>%</p></td>
     <td><p>The percentage of failed write requests (insert, bulk insert, upsert, and delete) in all write requests per second.</p></td>
     <td><p><a href="./manage-project-alerts">Configure alerts</a> to monitor write request failure rate.</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count</p></td>
     <td><p>count/min</p></td>
     <td><p>The number of slow query operations, including all search and query requests. By default, all requests whose latency is 5 seconds are considered slow queries.</p><p>This metric type is available only for <strong>Dedicated</strong> clusters of the <strong>Enterprise</strong> edition or <strong>BYOC</strong> clusters. For more information on cluster types, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>Identify problematic queries and tune performance by adjusting cluster configuration as necessary.</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity</p></td>
     <td><p>%</p></td>
     <td><p>The current rate of write operations/write rate limit.</p><p>This metric type is available only for <strong>Dedicated</strong> clusters of the <strong>Enterprise</strong> edition or <strong>BYOC</strong> clusters. For more information on cluster types, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>If the current rate is too high (suggested to be over 80%), it is recommended that you lower the write rate.</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations</p></td>
     <td><p>count/min</p></td>
     <td><p>The number of flush operations on a cluster.</p><p>This metric type is available only for <strong>Dedicated</strong> clusters of the <strong>Enterprise</strong> edition or <strong>BYOC</strong> clusters. For more information on cluster types, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>Performing flush operations too frequently can negatively impact the overall performance of the cluster. For more information, refer to <a href="./limits#flush">Zilliz Cloud Limits</a>.</p></td>
   </tr>
   <tr>
     <td colspan="4"><p><strong>Data</strong></p></td>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>count</p></td>
     <td><p>The number of collections created in a cluster.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Entity Count</p></td>
     <td><p>count</p></td>
     <td><p>The number of entities inserted into a cluster.</p><p>Selecting a specific collection from the expanded dropdown menu on the right displays the number of entities at the collection level.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities</p></td>
     <td><p>count</p></td>
     <td><p>The number of entities loaded (actively served) by a cluster.</p><p>Selecting a specific collection from the expanded dropdown menu on the right displays the number of loaded entities at the collection level.</p><p>This metric is available only for <strong>Dedicated</strong> or <strong>BYOC</strong> clusters. For more information on cluster plan tiers, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>count</p></td>
     <td><p>The number of unloaded collections in a cluster.</p><p>This metric type is available only for <strong>Dedicated</strong> clusters of the <strong>Enterprise</strong> edition or <strong>BYOC</strong> clusters. For more information on cluster types, refer to <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p></td>
     <td></td>
   </tr>
</table>

## Organization alerts{#organization-alerts}

Organization alerts keep you informed about billing-related issues such as expiring credit cards, the status of free credits, balance alerts for advance payments, and notifications regarding usage costs.

<table>
   <tr>
     <th><p>Alert Target</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended Action</p></th>
     <th><p>Default Trigger Condition</p></th>
   </tr>
   <tr>
     <td><p>Expiration Date of Credit card</p></td>
     <td><p>Day</p></td>
     <td><p>Monitor the remaining days until the credit card's expiration to ensure uninterrupted service.</p></td>
     <td><p>Renew or update credit card information before the expiration date.</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts within 30 days of card expiration.</p><p><strong>CRITICAL</strong>: Trigger alerts within 7 days of card expiration.</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits</p></td>
     <td><p>$</p></td>
     <td><p>Track the balance of free credits, alerting the user when it falls low to prompt a top-up.</p></td>
     <td><p>Top up credits to maintain account functionality.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the balance of free credits falls below $10.</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity Period</p></td>
     <td><p>Day</p></td>
     <td><p>Monitor the remaining validity period of free credits, alerting the user to encourage usage or extension.</p></td>
     <td><p>Extend the validity period or use the credits before they expire.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the validity period of free credits reaches 0 days.</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay Balance</p></td>
     <td><p>$</p></td>
     <td><p>Monitor the advance pay balance, alerting the user when it falls low to prevent service disruption.</p></td>
     <td><p>Add funds to the advance pay balance to avoid service interruption.</p></td>
     <td><p>Trigger <strong>CRITICAL</strong> alerts when the balance falls below $100.</p></td>
   </tr>
   <tr>
     <td><p>Usage Amount</p></td>
     <td><p>$</p></td>
     <td><p>Track the usage amount, informing the user when it exceeds a set threshold to suggest monitoring and management.</p></td>
     <td><p>Monitor and manage usage to stay within budget limits.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the amount of usage exceeds $100.</p></td>
   </tr>
</table>

## Project alerts{#project-alerts}

Project alerts focus on the operational aspects of your clusters, including notifications on the CU usage, QPS thresholds, latency issues, and request anomalies, ensuring you maintain optimal cluster performance.

For each project alert target, the trigger condition includes a threshold value and a duration value that must be met for the alert to be triggered. The condition can be set to one of the following operators: >, >=, \<, \<=, =. The threshold value can be a numeric value, such as a number for metrics like query latency, query QPS, search QPS, CU Capacity, and CU Computation. The duration specifies how long the threshold must be exceeded, which is set to a minimum of 1 minute and a maximum of 30 minutes.

### Default alert targets{#default-alert-targets}

Zilliz Cloud predefines common alert targets to ensure that critical issues are quickly identified and addressed with the appropriate actions.

For more information about recommended actions, refer to [Cluster metrics](./metrics-alerts-reference#cluster-metrics).

<table>
   <tr>
     <th><p>Alert Target</p></th>
     <th><p>Unit</p></th>
     <th><p>Default Trigger Condition</p></th>
   </tr>
   <tr>
     <td><p>CU Computation</p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized computational power for 10+ minutes.</p><p><strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized computational power for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>CU Capacity</p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized CU capacity for 10+ minutes.</p><p><strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized CU capacity for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Search (QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at &gt;50 search operations per second for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Query (QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at &gt;50 query operations per second for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Search Latency (P99)</p></td>
     <td><p>ms</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Query Latency (P99)</p></td>
     <td><p>ms</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</p></td>
   </tr>
</table>

### Custom alert targets{#custom-alert-targets}

In addition to the predefined default project alerts , you can also configure custom alert targets as needed.

<table>
   <tr>
     <th><p>Alert Target</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><strong>Resource</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>Monitor storage usage and send notifications if the usage exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p><strong>Performance (read/write)</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Bulk Insert (QPS)</p></td>
     <td><p>Monitor the rate of bulk insert operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Delete (QPS)</p></td>
     <td><p>Monitor the rate of delete operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Insert (QPS)</p></td>
     <td><p>Monitor the rate of insert operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Insert (VPS)</p></td>
     <td><p>Monitor the rate of vector insert operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Search (VPS)</p></td>
     <td><p>Monitor the rate of vector search operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Upsert (QPS)</p></td>
     <td><p>Monitor the rate of upsert operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Upsert (VPS)</p></td>
     <td><p>Monitor the rate of vector upsert operations and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Writes to Cluster Are Disabled</p></td>
     <td><p>Monitor the write operations to the cluster to ensure they are not prohibited. Please scale out immediately if write prohibition has been triggered.</p></td>
   </tr>
   <tr>
     <td><p><strong>Performance (latency)</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Delete Latency (Average)</p></td>
     <td><p>Monitor the average latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Delete Latency (P99)</p></td>
     <td><p>Monitor the P99 latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Insert Latency (Average)</p></td>
     <td><p>Monitor the average latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Insert Latency (P99)</p></td>
     <td><p>Monitor the P99 latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Query Latency (Average)</p></td>
     <td><p>Monitor the average latency for query requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Search Request Latency (Average)</p></td>
     <td><p>Monitor the average latency for search requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Upsert Latency (Average)</p></td>
     <td><p>Monitor the average latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Upsert Latency (P99)</p></td>
     <td><p>Monitor the P99 latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p><strong>Performance (request failure rate)</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Bulk Insert Failure Rate</p></td>
     <td><p>Monitor the failure rate of bulk insert requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Delete Failure Rate</p></td>
     <td><p>Monitor the failure rate of delete requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Insert Failure Rate</p></td>
     <td><p>Monitor the failure rate of insert requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Query Failure Rate</p></td>
     <td><p>Monitor the failure rate of query requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Search Failure Rate</p></td>
     <td><p>Monitor the failure rate of search requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count</p></td>
     <td><p>Monitor the number of slow queries and send notifications if the value exceeds a threshold for a certain duration.</p><p>By default, all requests whose latency is 5 seconds are considered slow queries.</p><p>This alert target is available only for <a href="./select-zilliz-cloud-service-plans">BYOC</a> clusters or clusters of the <a href="/docs/select-zilliz-cloud-service-plans?_highlight=enterprise#enterprise-plan">Enterprise</a> edition.</p></td>
   </tr>
   <tr>
     <td><p>Upsert Failure Rate</p></td>
     <td><p>Monitor the failure rate of upsert requests and send notifications if the rate exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p><strong>Data</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Loaded Entities</p></td>
     <td><p>Monitor the number of loaded entities and send notifications if the count exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Total Collections</p></td>
     <td><p>Monitor the number of total collections and send notifications if the count exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p>Total Entities</p></td>
     <td><p>Monitor the number of total entities and send notifications if the count exceeds a threshold for a certain duration.</p></td>
   </tr>
   <tr>
     <td><p><strong>Others</strong></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Cluster Is Abnormal</p></td>
     <td><p>Monitor the status of a cluster to ensure it is functioning properly. This includes checking the cluster load and usage.</p></td>
   </tr>
</table>

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

