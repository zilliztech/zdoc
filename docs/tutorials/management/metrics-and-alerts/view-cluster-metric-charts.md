---
title: "View Metric Charts | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "View Metric Charts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers dashboards for monitoring metrics at both the cluster and collection level. The metric charts provide performance data on resource usage, queries per second (QPS), latency, and data operations within a specific time range. | Cloud"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# View Metric Charts

Zilliz Cloud offers dashboards for monitoring metrics at both the cluster and collection level. The metric charts provide performance data on resource usage, queries per second (QPS), latency, and data operations within a specific time range.

## View cluster metrics\{#view-cluster-metrics}

To view cluster-wide metrics, navigate to your cluster in the [Zilliz Cloud console](https://cloud.zilliz.com/login) and select the **Metrics** tab.

Zilliz Cloud's metric charts provide performance data on resource usage, queries per second (QPS), request results, and data operations, offering granular analysis within a specific time range.

<Admonition type="info" icon="📘" title="Notes">

For free clusters, only read & write vCUs are available. To unlock a range of advanced metrics, [upgrade your plan tier](./manage-cluster).

</Admonition>

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

Cluster metric charts are organized into the following groups:

### Resources\{#resources}

These charts show the cluster's resource usage, including CU computation, CU capacity, and storage. For a full list of resource metrics, refer to [Metrics Reference](./metrics-alerts-reference#resources).

### Performance\{#performance}

These charts show cluster performance, including QPS, latency, request failure rates, and throughput. For a full list of performance metrics, refer to [Metrics Reference](./metrics-alerts-reference#performance).

### Data\{#data}

These charts show the cluster's data status, including the number of collections, entities, and loaded entities. For a full list of data metrics, refer to [Metrics Reference](./metrics-alerts-reference#data).

Clicking **View Alerts Settings** on the right will redirect you to the **Alert Settings** page, offering a shortcut to manage your alerts.

## View collection metrics\{#view-collection-metrics}

A subset of cluster metrics is also available **at the collection level**, helping you pinpoint performance issues and plan capacity for individual collections.

To view collection-level metrics, navigate to a collection in the [Zilliz Cloud console](https://cloud.zilliz.com/login) and select the **Metrics** tab.

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

The chart layout and time range controls are identical to those on the cluster **Metrics** tab. Each chart shows the same metric definition scoped to the selected collection rather than the entire cluster.

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

## Related topics\{#related-topics}

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

