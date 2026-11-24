---
title: "View Metric Charts | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "View Metric Charts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use metric charts to track traffic, latency, and resource usage for a serving cluster or an individual collection. To view charts for an on-demand cluster, see Monitor On-Demand Clusters. | Cloud"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# View Metric Charts

Use metric charts to track traffic, latency, and resource usage for a serving cluster or an individual collection. To view charts for an on-demand cluster, see [Monitor On-Demand Clusters](./monitor-on-demand-cluster).

## Cluster charts\{#cluster-charts}

<Supademo id="cmwu34ytl00lmqmq1do1j6xfd" title=""  />

<Procedures>

1. Open your project in the [Zilliz Cloud console](https://cloud.zilliz.com/login) and select **Serving Clusters**.

1. Choose the cluster you want to inspect. If you are investigating slow vector searches across several clusters, select **Latency (P99)** above the list and compare the **Search** value in each row. Select the cluster name and open **Metrics** to see its cluster-wide charts.

1. Choose the time range. Use a relative range for recent activity or enter a start and end time to match an incident. To compare metrics at the same timestamp, turn on **Sync Tooltips** and hover over a data point in a chart.

1. On a Dedicated cluster, start with **Key Metrics**, then choose a chart group below to investigate. Available charts depend on the cluster type.

    | Chart group | What to look for |
    | --- | --- |
    | Performance | If searches slowed down, compare search latency and search QPS over the same period. This shows whether the slowdown coincided with a change in traffic. |
    | Resources | Check Query CU Computation for CPU pressure during the slowdown. Check Query CU Capacity to see how close the cluster is to its memory or storage limit. |
    | Data | Check Entity Count for changes in data volume, or Collection Count for changes in the number of collections. |

    For definitions, units, and availability by cluster type, see resource metrics, performance metrics, and data metrics.

</Procedures>

## Collection charts\{#collection-charts}

These charts show metrics for one collection in a serving cluster. For collections in an on-demand database, see [On-demand database and collection metrics](./on-demand-metrics-reference#on-demand-database-and-collection-metrics).

<Supademo id="cmwu3bdzt00q6qmq1j8730zt5" title=""  />

<Procedures>

1. Open **Serving Clusters** and locate the cluster that serves your application.

1. Open the metric charts for the collection you want to inspect.

    - If you know its name, open the cluster, expand its database in the resource tree, select the collection name, and open **Metrics**.

    - To compare collections first, find the cluster name in the **Cluster** column. Click the small window-shaped button immediately to the right of the name, before the **ID** badge. This opens **Collection Overview**. 

        For example, select **Latency (P99)** and compare the **Search** values to find a collection with slow searches. Click its name to open its charts.

1. Under **Key Metrics**, use **QPS (Read)** to see how many read requests per second the selected collection received.

    For collection-level request metrics, see Performance. For entity counts, see Data.

</Procedures>