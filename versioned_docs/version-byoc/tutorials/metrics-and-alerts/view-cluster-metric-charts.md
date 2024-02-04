---
slug: /view-cluster-metric-charts
beta: FALSE
notebook: FALSE
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# View Cluster Metric Charts

Zilliz Cloud offers a dashboard for observing cluster-specific metrics. To access this feature, navigate to the **Metrics** tab within one of your clusters.

## Access cluster metric charts{#access-cluster-metric-charts}

In the [Zilliz Cloud console](https://cloud.zilliz.com/login), locate the target cluster and select the **Metrics** tab.

![view_metric_charts_resources](/byoc/view_metric_charts_resources.png)

Zilliz Cloud's metric charts provide performance data on resource usage, queries per second (QPS), request results, and data operations, offering granular analysis within a specific time range.

For details on each metric chart, refer to [View metric charts](./view-cluster-metric-charts#view-metric-charts).

## Modify curve window size{#modify-curve-window-size}

The **Metrics** tab allows for two types of window sizes.

- **Relative Range**: Choose from a set of pre-defined time periods relative to your current time. Using relative time ranges allows you to check metrics in a periodical and convenient way, without needing to enter the specific start and end time. Your choices include:

    - Last 10 minutes

    - Last hour

    - Last day

    - Last week

    - Last month

- **Absolute Range**: Enter the exact start time and end time. Using absolute range allows you to control the metrics you see in a more fine-tuned way.

    - The time difference between the start and the end time should be greater than 10 minutes.

![filter_metrics_by_time_period](/byoc/filter_metrics_by_time_period.png)

## View metric charts{#view-metric-charts}

Zilliz Cloud offers metric charts for monitoring cluster performance from various aspects. For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

### Resources{#resources}

To view metric charts for resource usage, locate the **Resources** section on the **Metrics** tab. These charts provide a snapshot of the cluster's resource usage, including computation, capacity, and storage.

- **CU Computation**: Measures computational power usage relative to the total.

    - 70%-80%: Prepare for [scaling out](./manage-cluster).

    - 90% or more: [Scale out](./manage-cluster) immediately to avoid service disruptions.

- **CU Capacity**: Indicates used capacity as a percentage of total, measured per second over time.

    - 70%-80%: Prepare for [scaling out](./manage-cluster).

    - 90%-99%: [Scale out](./manage-cluster) immediately to avoid service disruptions.

    - 100%: When the used CU capacity hits 100%, Zilliz Cloud disables data writing and triggers SDK errors. To restore normal functionality, [scale out](./manage-cluster) your cluster immediately.

- **Storage Use**: Shows total persistent storage consumed, calculated in GB/s over a selected period.

![view_metric_charts_resources](/byoc/view_metric_charts_resources.png)

### Performance{#performance}

To view metric charts for performance, locate the **Performance** section on the **Metrics** tab. These charts provide a snapshot of cluster performance, including QPS, VPS, latency, and request .

- **QPS/VPS (Read)**: The count of search and query requests per second. Vector search operations per second (VPS) is not available for query requests because query operations does not involve vectors.

- **QPS/VPS (Write)**: The count of insert and upsert requests per second.

- **Latency (Read)**: The time elapsed between a client sending a read request (search and query request) to a server and the client receiving a response. It includes an average latency and a P99 latency.

- **Latency (Write)**: The time elapsed between a client sending a write request (insert and upsert request) to a server and the client receiving a response. It includes an average latency and a P99 latency.

- **Request Failure Rate (Read)**: The percentage of timeout read requests in all requests per second.

- **Request Failure Rate (Write)**: The percentage of timeout write requests in all requests per second.

![view_metric_charts_performance](/byoc/view_metric_charts_performance.png)

### Data{#data}

To view metric charts for business data, locate the **Data** section on the **Metrics** tab. These charts provide a snapshot of the cluster's entity data by indicating the number of collections, entities, and loaded entities in the cluster.

- **Collection Count**: The count of collections created in the cluster.

- **Entity Count**: The count of entities inserted into the cluster.

- **Loaded Entities**: The count of entities loaded in the cluster.

![view_metric_charts_entity](/byoc/view_metric_charts_entity.png)

## Related topics{#related-topics}

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

