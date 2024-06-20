---
slug: /view-cluster-metric-charts
beta: FALSE
notebook: FALSE
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2

---

import Admonition from '@theme/Admonition';


# View Cluster Metric Charts

Zilliz Cloud offers a dashboard for observing cluster-specific metrics. To access this feature, navigate to the **Metrics** tab within one of your clusters.

## Access cluster metric charts{#access-cluster-metric-charts}

In the [Zilliz Cloud console](https://cloud.zilliz.com/login), locate the target cluster and select the **Metrics** tab.

Zilliz Cloud's metric charts provide performance data on resource usage, queries per second (QPS), request results, and data operations, offering granular analysis within a specific time range.

<Admonition type="info" icon="📘" title="Notes">

<p>Clicking <strong>View Alerts Settings</strong> on the right will redirect you to the <strong>Alert Settings</strong> page, offering a shortcut to manage your alerts.</p>

</Admonition>

![view_metric_charts_resources](/byoc/view_metric_charts_resources.png)

For details on each metric chart, refer to [View metric charts](./view-cluster-metric-charts#view-metric-charts).

## Modify curve window size{#modify-curve-window-size}

The **Metrics** tab allows for two types of window sizes.

- **Relative Range**: Choose from a set of pre-defined time periods relative to your current time. Using relative time ranges allows you to check metrics in a periodical and convenient way, without needing to enter the specific start and end time. Your choices include:

    - Last 10 minutes

    - Last hour

    - Last 6 hours

    - Last 12 hours

    - Last day

    - Last week

    - Last month

- **Absolute Range**: Enter the exact start time and end time. Using absolute range allows you to control the metrics you see in a more fine-tuned way.

    - The time difference between the start and the end time should be greater than 10 minutes.

![filter_metrics_by_time_period](/byoc/filter_metrics_by_time_period.png)

## View metric charts{#view-metric-charts}

Zilliz Cloud offers metric charts for monitoring cluster performance from various aspects.  For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

### Pod resources{#pod-resources}

To effectively track pod resource consumption, select the **Metrics** tab and refer to the **Pod Resources** area. Here, you'll find succinct graphs that display CPU, storage, and network usage for each pod.

- **CPU Usage**: The CPU usage of pods.

- **CPU Usage Rate for Limit**: The percentage of the pod CPU usage in the value of limit.

- **Memory Usage**: The memory usage of containers in the pod (with cache excluded).

- **Memory Usage Rate for Limit**: The percentage of the pod memory usage in the value of limit.

- **Network Inbound Flow**: The network inbound flow of pod.

- **Network Outbound Flow**: The network outbound flow of pod.

![MWoDbnsw0ouYwBxj4hycOjC2n5e](/byoc/MWoDbnsw0ouYwBxj4hycOjC2n5e.png)

### Resources{#resources}

To view metric charts for resource usage, select the **Metrics** tab and refer to the **Resources** area. These charts provide a snapshot of the cluster's resource usage, including computation, capacity, and storage.

- **CU Computation**: Measures computational power usage relative to the total.

    - 70%-80%: Prepare for [scaling out](./manage-cluster).

    - 90% or more: [Scale out](./manage-cluster) immediately to avoid service disruptions.

- **CU Capacity**: Indicates used capacity as a percentage of total, measured per second over time.

    - 70%-80%: Prepare for [scaling out](./manage-cluster).

    - 90%-99%: [Scale out](./manage-cluster) immediately to avoid service disruptions.

    - 100%: When the used CU capacity hits 100%, Zilliz Cloud disables data writing and triggers SDK errors. To restore normal functionality, [scale out](./manage-cluster) your cluster immediately.

- **Storage**: Shows total persistent storage consumed by data and indexes, calculated in GB over a selected period.

![byob_view_metric_charts_resources](/byoc/byob_view_metric_charts_resources.png)

### Performance{#performance}

To view metric charts for performance, select the **Metrics** tab and refer to the **Performance** area. These charts provide a snapshot of cluster performance, including QPS, VPS, latency, and request.

- **QPS/VPS (Read)**

    - **QPS**: The number of read requests (search and query) per second.

    - **VPS**: The number of read requests (search) on vectors per second. VPS is not available for query requests as query operations do not involve vectors.

- **QPS/VPS (Write)**

    - **QPS**: The number of write requests (insert, bulk insert, upset, and delete) per second.

    - **VPS**: The number of write requests (insert, upset, and delete) on vectors per second.

- **Latency (Read)**: The time elapsed between a client sending a read request (search and query) to a server and the client receiving a response. It includes an average latency and a P99 latency.

- **Latency (Write)**: The time elapsed between a client sending a write request (insert, upsert, and delete) to a server and the client receiving a response. It includes an average latency and a P99 latency.

- **Request Failure Rate (Read)**: The percentage of timeout read requests (search and query) in all read requests per second.

- **Request Failure Rate (Write)**: The percentage of timeout write requests (insert, bulk insert, upsert, and delete) in all write requests per second.

- **Slow Query Count**: The number of slow query operations, including all search and query requests. By default, all requests whose latency is 5 seconds are considered slow queries.

![byoc_view_metric_charts_performance](/byoc/byoc_view_metric_charts_performance.png)

### Data{#data}

To view metric charts for business data, select the **Metrics** tab and refer to the **Data** area. These charts provide a snapshot of the cluster's entity data by indicating the number of collections, entities, and loaded entities in the cluster.

- **Collection Count**: The count of collections created in the cluster.

- **Entity Count**: The count of entities inserted into a cluster. Selecting a specific collection from the expanded dropdown menu on the right displays the number of entities at the collection level.

- **Loaded Entities**: The number of entities loaded (actively served) by a cluster. Selecting a specific collection from the expanded dropdown menu on the right displays the number of loaded entities at the collection level.

![byoc_view_metric_charts_entity](/byoc/byoc_view_metric_charts_entity.png)

## Related topics{#related-topics}

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

