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

In this reference, you can find descriptions of monitoring metrics for Zilliz Cloud clusters, as well as alert items that you can set up at organization and project levels.

## Cluster metrics{#cluster-metrics}

The __Metrics__ tab in the Zilliz Cloud console presents various graphical representations.

The table provides a description of each metric and the actions that you are advised to perform when the usage of your cluster resource exceeds a threshold.

|  Metric Name                  |  Unit    |  Description                                                                                                                                                                              |  Recommended Action                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  __Resources__                |          |                                                                                                                                                                                           |                                                                                                                                                                                                                                                                                                                                                                                                                        |
|  CU Computation<br/>       |  %       |  A measure of the utilized computational power relative to the total computational capacity of the CU.                                                                                    |  - __70%-80%__: Check service status and prepare for [scaling up](./manage-cluster#manage-and-configure-clusters).<br/> - __> 90%__: [Scale up](./manage-cluster#manage-and-configure-clusters) immediately to avoid service interruption.<br/>                                                                                                                                                                  |
|  CU Capacity                  |  %       |  A measure of the used capacity relative to the total capacity of the CU.                                                                                                                 |  - __70%-80%__: Check service status and prepare for scaling up.<br/> - __> 90%__: [Scale up](./manage-cluster#manage-and-configure-clusters) immediately to avoid service interruption.<br/> - __100%__: When CU capacity reaches 100%, you will be unable to write data into the cluster. Please [scale up](./manage-cluster#manage-and-configure-clusters) immediately to avoid service interruption.<br/> |
|  Storage Use                  |  GB      |  The total amount of persistent storage consumed by data and indexes. <br/>                                                                                                            |  [Configure alerts](./manage-project-alerts) for monitoring and release unused indexes and collections. If a specified value is exceeded, consider [scaling up](./manage-cluster#manage-and-configure-clusters).                                                                                                                                                                                                       |
|  __Performance__              |          |                                                                                                                                                                                           |                                                                                                                                                                                                                                                                                                                                                                                                                        |
|  QPS/VPS (Read)               |  QPS/VPS |  The count of search and query requests per second. VPS is not available for query requests because query operations does not involve vectors.                                            |  Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring.                                                                                                                                                                                                                                                                                                            |
|  QPS/VPS (Write)<br/>      |  QPS/VPS |  The count of insert and upsert requests per second.                                                                                                                                      |  Refer to [benchmark](https://zilliz.com/vector-database-benchmark-tool) for system performance monitoring.                                                                                                                                                                                                                                                                                                            |
|  Latency (Read)               |  ms      |  The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency.   |  -                                                                                                                                                                                                                                                                                                                                                                                                                     |
|  Latency (Write)              |  ms      |  The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency. |  -                                                                                                                                                                                                                                                                                                                                                                                                                     |
|  Request Failure Rate (Read)  |  %       |  The percentage of timeout read requests in all requests per second.                                                                                                                      |  [Configure alerts](./manage-project-alerts) to monitor read request failure rate.                                                                                                                                                                                                                                                                                                                                     |
|  Request Failure Rate (Write) |  %       |  The percentage of timeout write requests in all requests per second.                                                                                                                     |  [Configure alerts](./manage-project-alerts) to monitor write request failure rate.                                                                                                                                                                                                                                                                                                                                    |
|  __Data__                     |          |                                                                                                                                                                                           |                                                                                                                                                                                                                                                                                                                                                                                                                        |
|  Collection Count             |  count   |  The count of collections created in a cluster.                                                                                                                                           |  -                                                                                                                                                                                                                                                                                                                                                                                                                     |
|  Entity Count                 |  count   |  The count of entities created in a cluster.                                                                                                                                              |  -                                                                                                                                                                                                                                                                                                                                                                                                                     |
|  Loaded Entities              |  count   |  The count of entities loaded (actively served) by a cluster.                                                                                                                             |  -                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Organization alerts{#organization-alerts}

Organization alerts keep you informed about license-related issues such as the license cores and validity period.

|  Alert Target                  |  Unit |  Description                                                                |  Recommended Action                                                                                                                                                                                                                                                           |  Default Trigger Condition                                                                                                                                                                                                 |
| ------------------------------ | ----- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  License (Core Usage)<br/>  |  %    |  Monitor the percentage of used CPU cores against the total licensed cores. |  - __> 70%__: Assess future needs and prepare to renew or upgrade the license.<br/> - __> 100%__: Renew or upgrade the license immediately to avoid operational disruptions.<br/> For details, refer to [License](./license).                                           |  - __WARNING__: Trigger alerts when the count of used CPU cores reaches or exceeds 70% of the total.<br/> - __CRITICAL__: Trigger alerts when the count of used CPU cores reaches or exceeds 100% of the total.<br/> |
|  License (Validity Period)     |  Day  |  Track the remaining days of license validity.                              |  - __< 60 days__: Start preparing to renew or upgrade the license.<br/> - __< 0 day__ (expired): Renew or upgrade the license immediately to avoid restrictions like the inability to create new clusters or scale up.<br/> For details, refer to [License](./license). |  - __WARNING__: Trigger alerts when the license validity is 60 days or less.<br/> - __CRITICAL__: Trigger alerts when the license expires.<br/>                                                                      |

## Project alerts{#project-alerts}

Project alerts focus on the operational aspects of your clusters, including notifications on the CU usage, QPS thresholds, latency issues, and request anomalies, ensuring you maintain optimal cluster performance.

### Default alert targets{#default-alert-targets}

Zilliz Cloud provides predefined default alert targets to ensure that critical issues are quickly identified and addressed with the appropriate actions.

For more information about recommended actions, refer to [Cluster metrics](./metrics-alerts-reference#cluster-metrics).

|  Alert Target            |  Unit |  Default Trigger Condition                                                                                                                                                                |
| ------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  CU Computation<br/>  |  %    |  - __WARNING__: Trigger alerts at >70% utilized computational power for 10+ minutes.<br/> - __CRITICAL__: Trigger alerts at >90% utilized computational power for 10+ minutes.<br/> |
|  CU Capacity             |  %    |  - __WARNING__: Trigger alerts at >70% utilized CU capacity for 10+ minutes.<br/> - __CRITICAL__: Trigger alerts at >90% utilized CU capacity for 10+ minutes.<br/>                 |
|  Search QPS              |  QPS  |  Trigger __WARNING__ alerts at >50 search operations per second for 10+ minutes.                                                                                                          |
|  Query QPS               |  QPS  |  Trigger __WARNING__ alerts at >50 query operations per second for 10+ minutes.                                                                                                           |
|  P99 Search Latency      |  ms   |  Trigger __WARNING__ alerts at P99 latency >1,000ms for 10+ minutes.                                                                                                                      |
|  P99 Query Latency       |  ms   |  Trigger __WARNING__ alerts at P99 latency >1,000ms for 10+ minutes.                                                                                                                      |

### Custom alert targets{#custom-alert-targets}

In addition to the predefined default project alerts , you can also configure custom alert targets as needed.

|  Alert Target                           |  Description                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
|  __Resource__                           |                                                                                                                                    |
|  Storage Usage                          |  Monitor storage usage and send notifications if the usage exceeds a threshold for a certain duration.                             |
|  __Performance (read/write)__           |                                                                                                                                    |
|  Insert QPS                             |  Monitor the rate of insert operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Bulk Insert QPS                        |  Monitor the rate of bulk insert operations and send notifications if the rate exceeds a threshold for a certain duration.         |
|  Upsert QPS                             |  Monitor the rate of upsert operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Delete QPS                             |  Monitor the rate of delete operations and send notifications if the rate exceeds a threshold for a certain duration.              |
|  Search VPS                             |  Monitor the rate of vector search operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  Insert VPS                             |  Monitor the rate of vector insert operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  Upsert VPS                             |  Monitor the rate of vector upsert operations and send notifications if the rate exceeds a threshold for a certain duration.       |
|  __Performance (latency)__              |                                                                                                                                    |
|  Average Search Request Latency         |  Monitor the average latency for search requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  Average Query Latency                  |  Monitor the average latency for query requests and send notifications if the latency exceeds a threshold for a certain duration.  |
|  Average Insert Latency                 |  Monitor the average latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Insert Latency                     |  Monitor the P99 latency for insert requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  Average Upsert Latency                 |  Monitor the average latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Upsert Latency                     |  Monitor the P99 latency for upsert requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  Average Delete Latency                 |  Monitor the average latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration. |
|  P99 Delete Latency                     |  Monitor the P99 latency for delete requests and send notifications if the latency exceeds a threshold for a certain duration.     |
|  __Performance (request failure rate)__ |                                                                                                                                    |
|  Search Failure Rate                    |  Monitor the failure rate of search requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Query Failure Rate                     |  Monitor the failure rate of query requests and send notifications if the rate exceeds a threshold for a certain duration.         |
|  Insert Failure Rate                    |  Monitor the failure rate of insert requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Bulk Insert Failure Rate               |  Monitor the failure rate of bulk insert requests and send notifications if the rate exceeds a threshold for a certain duration.   |
|  Upsert Failure Rate                    |  Monitor the failure rate of upsert requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  Delete Failure Rate                    |  Monitor the failure rate of delete requests and send notifications if the rate exceeds a threshold for a certain duration.        |
|  __Data__                               |                                                                                                                                    |
|  Loaded Entities                        |  Monitor the count of loaded entities and send notifications if the count exceeds a threshold for a certain duration.              |
|  Total Entities                         |  Monitor the count of total entities and send notifications if the count exceeds a threshold for a certain duration.               |
|  Total Collections                      |  Monitor the count of total collections and send notifications if the count exceeds a threshold for a certain duration.            |

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

