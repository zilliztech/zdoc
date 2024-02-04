---
slug: /metrics-alerts-reference
beta: FALSE
notebook: FALSE
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Metrics & Alerts Reference

In this reference, you can find descriptions of monitoring metrics for Zilliz Cloud clusters, as well as alert items that you can set up at organization and project levels.

## Cluster metrics{#cluster-metrics}

### Metric types{#metric-types}

The **Metrics** tab in the Zilliz Cloud console presents various graphical representations. The table provides a description of each metric and the corresponding use cases.

|  Metric Name                  |  Unit    |  Description                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **Resources**                |          |                                                                                                                                                                                                                                                                                                                                                                              |
|  CU Computation<br/>       |  %       |  A measure of the utilized computational power relative to the total computational capacity of the CU.                                                                                                                                                                                                                                                                       |
|  CU Capacity                  |  %       |  A measure of the used capacity relative to the total capacity of the CU.                                                                                                                                                                                                                                                                                                    |
|  Storage Use                  |  GB      |  The total amount of persistent storage consumed by data and indexes. <br/>                                                                                                                                                                                                                                                                                               |
|  **Performance**              |          |                                                                                                                                                                                                                                                                                                                                                                              |
|  QPS/VPS (Read)               |  QPS/VPS |  The count of search and query requests per second. VPS is not available for query requests because query operations does not involve vectors.<br/> - Search QPS is indicated by the blue line.<br/> - Query QPS is indicated by the blue line.<br/>                                                                                                                |
|  QPS/VPS (Write)<br/>      |  QPS/VPS |  The count of insert and upsert requests per second.<br/> - Insert QPS is indicated by the blue line.<br/> - Bulk insert QPS is indicated by the green line.<br/> - Upsert QPS is indicated by the orange line.<br/> - Delete QPS is indicated by the purple line.<br/>                                                                                       |
|  Latency (Read)               |  ms      |  The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency.<br/> - Search latency is indicated by the blue line.<br/> - Query latency is indicated by the green line.<br/>                                                              |
|  Latency (Write)              |  ms      |  The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency.<br/> - Insert latency is indicated by the blue line.<br/> - Upsert latency is indicated by the green line.<br/> - Delete latency is indicated by the orange line.<br/> |
|  Request Failure Rate (Read)  |  %       |  The percentage of timeout read requests in all requests per second.                                                                                                                                                                                                                                                                                                         |
|  Request Failure Rate (Write) |  %       |  The percentage of timeout write requests in all requests per second.                                                                                                                                                                                                                                                                                                        |
|  **Data**                     |          |                                                                                                                                                                                                                                                                                                                                                                              |
|  Collection Count             |  count   |  The count of collections created in a cluster.                                                                                                                                                                                                                                                                                                                              |
|  Entity Count                 |  count   |  The count of entities created in a cluster.                                                                                                                                                                                                                                                                                                                                 |
|  Loaded Entities              |  count   |  The count of entities loaded (actively served) by a cluster.                                                                                                                                                                                                                                                                                                                |

### Recommended actions{#recommended-actions}

The following table lists the actions that you are advised to perform when the usage of your cluster resource exceeds a threshold.

|  Metric Type                  |  Threshold        |  Recommended Actions                                                                                                                                                                                             |
| ----------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  CU Computation               |  70%-80%          |  Check service status and prepare for scaling up.                                                                                                                                                                |
|                               |  > 90%            |  Scale up immediately to avoid service interruption.                                                                                                                                                             |
|  CU Capacity                  |  70%-80%          |  Check service status and prepare for scaling up.                                                                                                                                                                |
|                               |  > 90%            |  [Scale up](./manage-cluster#manage-and-configure-clusters) immediately to avoid service interruption. Receive a critical alert.                                                                                 |
|                               |  100%             |  [Scale up](./manage-cluster#manage-and-configure-clusters) immediately to avoid service interruption.                                                                                                           |
|  Storage Use                  |  Custom threshold |  [Configure alerts](./manage-project-alerts) for monitoring and release unused indexes and collections. If a specified value is exceeded, consider [scaling up](./manage-cluster#manage-and-configure-clusters). |
|  QPS/VPS (Read)               |  -                |  Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring.                                                                                                      |
|  QPS/VPS (Write)              |  -                |  Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring.                                                                                                      |
|  Request Failure Rate (Read)  |  Custom threshold |  [Configure alerts](./manage-project-alerts) to monitor request success rate.<br/>                                                                                                                            |
|  Request Failure Rate (Write) |  Custom threshold |  [Configure alerts](./manage-project-alerts) to monitor request failure rate.                                                                                                                                    |

## Organization alerts{#organization-alerts}

Organization alerts keep you informed about license-related issues such as the license cores and validity period.

|  Alert Target                  |  Unit |  Default Status |  Default Condition                                                                                                                                                                                               |  Severity Level             |
| ------------------------------ | ----- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
|  License (Core Usage)<br/>  |  %    |  ON<br/>     |  - **WARNING**: Triggered when the count of used CPU cores reaches or exceeds 70% of the total.<br/> - **CRITICAL**: Triggered when the count of used CPU cores reaches or exceeds 100% of the total.<br/> |  **WARNING** / **CRITICAL** |
|  License (Validity Period)     |  Day  |  ON             |  - **WARNING**: Triggered when the license validity is 60 days or less.<br/> - **CRITICAL**: Triggered when the license expires.<br/>                                                                      |  **WARNING** / **CRITICAL** |

## Project alerts{#project-alerts}

Project alerts focus on the operational aspects of your clusters, including notifications on the CU usage, QPS thresholds, latency issues, and request anomalies, ensuring you maintain optimal cluster performance.

### Default alert targets{#default-alert-targets}

Zilliz Cloud provides predefined default alert targets to ensure that critical issues are quickly identified and addressed with the appropriate actions.

|  Alert Target            |  Unit |  Default Status |  Default Trigger Condition                                                                                                                                                      |  Severity Level             |
| ------------------------ | ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
|  CU Computation<br/>  |  %    |  ON             |  - **WARNING**: Triggered at >70% utilized computational power for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized computational power for 10+ minutes.<br/> |  **WARNING** / **CRITICAL** |
|  CU Capacity             |  %    |  ON             |  - **WARNING**: Triggered at >70% utilized CU capacity for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized CU capacity for 10+ minutes.<br/>                 |  **WARNING** / **CRITICAL** |
|  Search QPS              |  QPS  |  OFF            |  Triggered at >50 search operations per second for 10+ minutes.                                                                                                                 |  **WARNING**                |
|  Query QPS               |  QPS  |  OFF            |  Triggered at >50 query operations per second for 10+ minutes.                                                                                                                  |  **WARNING**                |
|  P99 Search Latency      |  ms   |  OFF            |  Triggered at P99 latency >1,000ms for 10+ minutes.                                                                                                                             |  **WARNING**                |
|  P99 Query Latency       |  ms   |  OFF            |  Triggered at P99 latency >1,000ms for 10+ minutes.                                                                                                                             |  **WARNING**                |

### Custom alert targets{#custom-alert-targets}

In addition to the predefined default project alerts , you can also configure custom alert targets as needed.

|  Alert Target                           |  Description                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
|  **Resource**                           |                                                                                                                                    |
|  Storage Usage                          |  Monitor storage usage and send notifications if the usage exceeds a threshold for a certain duration.                             |
|  **Performance (read/write)**           |                                                                                                                                    |
|  Insert QPS                             |  Monitor the rate of insert operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Bulk Insert QPS                        |  Monitor the rate of bulk insert operations and send notifications if the rate exceeds a threshold for a certain duration.         |
|  Upsert QPS                             |  Monitor the rate of upsert operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Delete QPS                             |  Monitor the rate of delete operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Search VPS                             |  Monitor the rate of vector search operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  Insert VPS                             |  Monitor the rate of vector insert operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  Upsert VPS                             |  Monitor the rate of vector upsert operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  **Performance (latency)**              |                                                                                                                                    |
|  Average Search Request Latency         |  Monitor the average latency for search requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  Average Query Latency                  |  Monitor the average latency for query requests and send notifications if the latency exceeds a threshold for a certain duration.  |
|  Average Insert Latency                 |  Monitor the average latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Insert Latency                     |  Monitor the P99 latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  Average Upsert Latency                 |  Monitor the average latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Upsert Latency                     |  Monitor the P99 latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  Average Delete Latency                 |  Monitor the average latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Delete Latency                     |  Monitor the P99 latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  **Performance (request failure rate)** |                                                                                                                                    |
|  Search Failure Rate                    |  Monitor the failure rate of search requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Query Failure Rate                     |  Monitor the failure rate of query requests and send notifications if the rate exceeds a threshold for a certain duration.         |
|  Insert Failure Rate                    |  Monitor the failure rate of insert requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Bulk Insert Failure Rate               |  Monitor the failure rate of bulk insert requests and send notifications if the rate exceeds a threshold for a certain duration.   |
|  Upsert Failure Rate                    |  Monitor the failure rate of upsert requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Delete Failure Rate                    |  Monitor the failure rate of delete requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  **Data**                               |                                                                                                                                    |
|  Loaded Entities                        |  Monitor the count of loaded entities and send notifications if the count exceeds a threshold for a certain duration.              |
|  Total Entities                         |  Monitor the count of total entities and send notifications if the count exceeds a threshold for a certain duration.               |
|  Total Collections                      |  Monitor the count of total collections and send notifications if the count exceeds a threshold for a certain duration.            |

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

