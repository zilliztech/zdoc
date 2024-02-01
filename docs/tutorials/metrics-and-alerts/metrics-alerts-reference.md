---
slug: /metrics-alerts-reference
beta: FALSE
notebook: FALSE
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 4
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

Organization alerts keep you informed about billing-related issues such as expiring credit cards, the status of free credits, balance alerts for advance payments, and notifications regarding usage costs.

|  Alert Target                    |  Unit             |  Default Status |  Default Trigger Condition                                                                                                               |  Severity Level                      |
| -------------------------------- | ----------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
|  Credit Card Expiration<br/>  |  Day              |  ON             |  - **WARNING**: Triggered within 30 days of card expiration.<br/> - **CRITICAL**: Triggered within 7 days of card expiration.<br/> |  **WARNING** / **CRITICAL**<br/>  |
|  Credits (Usage / Validity)      |  % / Day<br/>  |  ON<br/>     |  Triggered when credit balance falls below $10 or validity period reaches 0 days.                                                        |  **WARNING**                         |
|  Advance Pay Balance             |  $                |  ON             |  Triggered when the balance falls below $100.                                                                                            |  **CRITICAL**                        |
|  Usage Amount                    |  $                |  OFF            |  Triggered when the amount of usage exceeds $100.                                                                                        |  **WARNING**                         |

## Project alerts{#project-alerts}

Project alerts focus on the operational aspects of your clusters, including notifications on the CU usage, QPS thresholds, latency issues, and request anomalies, ensuring you maintain optimal cluster performance.

|  Alert Target         |  Unit |  Default Status |  Default Trigger Condition                                                                                                                                                      |  Severity Level             |
| --------------------- | ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
|  CU Computation       |  %    |  ON             |  - **WARNING**: Triggered at >70% utilized computational power for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized computational power for 10+ minutes.<br/> |  **WARNING** / **CRITICAL** |
|  CU Capacity          |  %    |  ON             |  - **WARNING**: Triggered at >70% utilized CU capacity for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized CU capacity for 10+ minutes.<br/>                 |  **WARNING** / **CRITICAL** |
|  Search QPS           |  QPS  |  OFF            |  Triggered at >50 search operations per second for 10+ minutes.                                                                                                                 |  **WARNING**                |
|  Query QPS            |  QPS  |  OFF            |  Triggered at >50 query operations per second for 10+ minutes.                                                                                                                  |  **WARNING**                |
|  P99 Search Latency   |  ms   |  OFF            |  Triggered at P99 latency >1000ms for 10+ minutes.                                                                                                                              |  **WARNING**                |
|  P99 Query Latency    |  ms   |  OFF            |  Triggered at P99 latency >1000ms for 10+ minutes.                                                                                                                              |  **WARNING**                |
|  Request Failure Rate |  %    |  ON             |  Triggered at a failure rate of >50% for 10+ minutes.                                                                                                                           |  **WARNING**                |

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

