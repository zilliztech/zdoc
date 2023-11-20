---
displayed_sidebar: paasSidebar
slug: /docs/byoc/query-latency-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Monitor Query Latency

To optimize your Zilliz Cloud cluster’s performance through timely adjustments of query latency, it is advisable to activate the query latency resource monitor.

## Set alert condition{#set-alert-condition}

To configure the alert conditions for query latency within a project, follow the steps below:

1. Select **Monitoring** from the project’s left navigation pane.

1. Navigate to the **Monitor Settings** tab.

1. Find the third condition in the** Resource Alerts** card. By default, notifications are set to be sent when **Query Latency** exceeds **1000 ms** for a duration of more than **10 minutes**.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. Adjust the **Query Latency** threshold and **Duration** settings as per your requirements in the dialog box that appears. Click **Save** to apply your customized alert condition.

## Enable the monitor{#enable-the-monitor}

To activate the monitor, click the switch in the **Status** column. This action toggles the monitor’s state on or off. Verification of activation is confirmed when the switch’s indicator is positioned to the right, complemented by a change in background color to blue.

![latency-monitor-byoc](/byoc/latency-monitor-byoc.png)

## Related topics{#related-topics}

- [Monitor CU Resources](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [View Cluster Metrics](./monitor-metrics)

