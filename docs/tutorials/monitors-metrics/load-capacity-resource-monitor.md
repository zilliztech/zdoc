---
slug: /load-capacity-resource-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 4
---



# Monitor Load Capacity

To monitor the load capacity of your collections, consider enabling the load capacity resource monitor. This monitor tracks the size of the memory used by the loaded data in percentage.

:::info Notes

:::

## Set alert condition{#set-alert-condition}

To set the alert condition for the consumed memory proportion in a project, follow these steps:

1. From the left navigation pane in the project, choose **Monitoring**.

1. Open the **Monitor Settings** tab.

1. In the **Resource Alerts** card, locate the last condition.
    By default, we will send you notifications when the load capacity is over **90%** for more than **10** minutes.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. To customize the alert condition, adjust the threshold for **Load Latency** and **Duration** in the prompted dialog box. Once you have set your preferences, click **Save** to apply the condition.

## Enable the monitor{#enable-the-monitor}

To enable the monitor, click the switch in the **Status** column. Clicking the switch will toggle it on and off. Make sure the indicator of the switch is on the right side, and the background color changes to blue.

![resource-monitors](/img/resource-monitors.png)

## Related topics{#related-topics}

- [CU Resource Monitor](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Credit Card Expiration Monitor](./credit-card-expiration-monitor) 

- [View Cluster Metrics](./monitor-metrics) 

- [Advance Pay Balance Monitor](./advance-pay-balance-monitor) 
