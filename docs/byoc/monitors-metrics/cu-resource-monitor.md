---
displayed_sidebar: paasSidebar
slug: /docs/byoc/cu-resource-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Monitor CU Resources

To effectively scale your cluster, it is recommended to activate the CU resource monitor. This tool tracks both CPU and memory usage, expressed as a percentage, and responds based on the higher of the two values.

## Set alert condition{#set-alert-condition}

To configure the alert conditions for CU usage within a project, follow the steps below:

1. Select **Monitoring** from the project’s left navigation pane.

1. Navigate to the **Monitor Settings** tab.

1. Find the initial condition in the **Resource Alerts** card. By default, notifications are set to be sent when **CU Usage** exceeds **90%** for a duration of more than **10 minutes**.

1. Click **…** in the **Actions** column, and select **Edit**.

1. Adjust the **CU **usage threshold and **Duration** settings as per your requirements in the dialog box that appears. Click **Save** to apply your customized alert condition.

## Enable the monitor{#enable-the-monitor}

To activate the monitor, click the switch in the **Status** column. This action toggles the monitor’s state on or off. Verification of activation is confirmed when the switch’s indicator is positioned to the right, complemented by a change in background color to blue.

![cu-monitor-byoc](/byoc/cu-monitor-byoc.png)

## Related topics{#related-topics}

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor)

- [View Cluster Metrics](./monitor-metrics) 

