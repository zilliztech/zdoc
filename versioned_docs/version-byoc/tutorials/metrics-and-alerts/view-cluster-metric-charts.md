---
title: "View Cluster Metric Charts | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "View Cluster Metric Charts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers a dashboard for observing cluster-specific metrics. To access this feature, navigate to the Metrics tab within one of your clusters. | BYOC"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - view
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# View Cluster Metric Charts

Zilliz Cloud offers a dashboard for observing cluster-specific metrics. To access this feature, navigate to the **Metrics** tab within one of your clusters.

![view_metric_charts](https://zdoc-images.s3.us-west-2.amazonaws.com/view_metric_charts.png "view_metric_charts")

## Access cluster metric charts\{#access-cluster-metric-charts}

In the [Zilliz Cloud console](https://cloud.zilliz.com/login), locate the target cluster and select the **Metrics** tab.

Zilliz Cloud's metric charts provide performance data on resource usage, queries per second (QPS), request results, and data operations, offering granular analysis within a specific time range.

<Admonition type="info" icon="📘" title="Notes">

<p>Clicking <strong>View Alerts Settings</strong> on the right will redirect you to the <strong>Alert Settings</strong> page, offering a shortcut to manage your alerts.</p>

</Admonition>

For details on each metric chart, refer to [View metric charts](./view-cluster-metric-charts#view-metric-charts).

## Modify curve window size\{#modify-curve-window-size}

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

## View metric charts\{#view-metric-charts}

Zilliz Cloud offers metric charts for monitoring cluster performance from various aspects.

### Pod resources\{#pod-resources}

To effectively track pod resource consumption, select the **Metrics** tab and refer to the **Pod Resources** area. Here, you'll find succinct graphs that display CPU, storage, and network usage for each pod. For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference#project-level-metrics-cluster-metrics).

### Resources\{#resources}

To view metric charts for resource usage, select the **Metrics** tab and refer to the **Resources** area. These charts provide a snapshot of the cluster's resource usage, including computation, capacity, and storage. For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference#project-level-metrics-cluster-metrics).

### Performance\{#performance}

To view metric charts for performance, select the **Metrics** tab and refer to the **Performance** area. These charts provide a snapshot of cluster performance, including QPS, VPS, latency, and request. For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference#project-level-metrics-cluster-metrics).

### Data\{#data}

To view metric charts for business data, select the **Metrics** tab and refer to the **Data** area. These charts provide a snapshot of the cluster's entity data by indicating the number of collections, entities, and loaded entities in the cluster. For a quick overview of available metrics, refer to [Metrics & Alerts Reference](./metrics-alerts-reference#project-level-metrics-cluster-metrics).

## Related topics\{#related-topics}

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

