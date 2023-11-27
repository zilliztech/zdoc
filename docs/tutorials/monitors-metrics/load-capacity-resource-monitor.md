---
slug: /docs/load-capacity-resource-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Monitor Load Capacity

To effectively keep track of the load capacity of your collections, it is advisable to turn on the load capacity resource monitor. This monitor assesses the memory size occupied by the loaded data in percentage.

<Admonition type="info" icon="📘" title="Notes">

This is a feature exclusively available to clusters in the Standard and Enterprise plans.

</Admonition>

## Set alert condition{#set-alert-condition}

To configure the alert conditions for load capacity within a project, follow the steps below:

1. Select **Monitoring** from the project’s left navigation pane.

1. Navigate to the **Monitor Settings** tab.

1. Find the last condition in the** Resource Alerts** card. By default, notifications are set to be sent when** Load Capacity** exceeds **90%** for a duration of more than **10 minutes**.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. Adjust the **Load Capacity** threshold and **Duration** settings as per your requirements in the dialog box that appears. Click **Save** to apply your customized alert condition.

## Enable the monitor{#enable-the-monitor}

To activate the monitor, click the switch in the **Status** column. This action toggles the monitor’s state on or off. Verification of activation is confirmed when the switch’s indicator is positioned to the right, complemented by a change in background color to blue.

![resource-monitors](/img/resource-monitors.png)

## Related topics{#related-topics}

- [Monitor CU Resources](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [View Cluster Metrics](./monitor-metrics)

- [Credit Card Expiration Monitor](./credit-card-expiration-monitor) 

- [Advance Pay Balance Monitor](./advance-pay-balance-monitor) 

