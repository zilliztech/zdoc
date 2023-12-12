---
slug: /qps-resource-monitor
beta: FALSE
notebook: FALSE
token: TKJawqMDPikhpMkQKcHc91mhnEd
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Monitor QPS

To optimize your Zilliz Cloud cluster’s performance through timely adjustments of queries per second (QPS), it is advisable to activate the QPS resource monitor.

## Set alert condition{#set-alert-condition}

To configure the alert conditions for QPS within a project, follow the steps below:

1. Select **Monitoring** from the project’s left navigation pane.

1. Navigate to the **Monitor Settings** tab.

1. Find the second condition in the** Resource Alerts** card. By default, notifications are set to be sent when **QPS** exceeds **10** for a duration of more than **10 minutes**.

1. Click **…** in the **Actions** column, and select **Edit**.

1. Adjust the **QPS** threshold and **Duration** settings as per your requirements in the dialog box that appears. Click **Save** to apply your customized alert condition.

## Enable the monitor{#enable-the-monitor}

To activate the monitor, click the switch in the **Status** column. This action toggles the monitor’s state on or off. Verification of activation is confirmed when the switch’s indicator is positioned to the right, complemented by a change in background color to blue.

![qps-monitor-byoc](/byoc/qps-monitor-byoc.png)

## Related topics{#related-topics}

- [Monitor CU Resources](./cu-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [View Cluster Metrics](./monitor-metrics)

