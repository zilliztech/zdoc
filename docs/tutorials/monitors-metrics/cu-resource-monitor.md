---
slug: /cu-resource-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 1
---



#  Monitor CU Resources

To scale up your cluster in a timely manner, consider enabling the CU resource monitor. The monitor tracks both the CPU and memory usage in percentage and uses whichever is greater.

:::info Notes

This is a feature available only to clusters in the Standard and Enterprise plans.

:::

## Set alert condition{#set-alert-condition}

To set the alert condition for the CU usage in a project, follow these steps:

1. From the left navigation pane in the project, choose **Monitoring**.

1. Open the **Monitor Settings** tab.

1. In the **Resource Alerts** card, locate the first condition.
    By default, we will send you notifications when the CU usage is over **90%** for more than **10** minutes.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. To customize the alert condition, adjust the threshold for the **CU** usage and **Duration** in the prompted dialog box. Once you have set your preferences, click **Save** to apply the condition.

## Enable the monitor{#enable-the-monitor}

To enable the monitor, click the switch in the **Status** column. Clicking the switch will toggle it on and off. Make sure the indicator of the switch is on the right side, and the background color changes to blue.

![cu-monitor](/img/cu-monitor.png)

## Related topics{#related-topics}

- [QPS Resource Monitor](./monitor-qps) 

- [Query Latency Monitor](./monitor-query-latency) 

- [Load Capacity Resource Monitor](./monitor-load-capacity) 

- [Credit Card Expiration Monitor](./stay-informed-on-credit-card-expiration) 

- [View Cluster Metrics](./view-cluster-metrics) 

- [Advance Pay Balance Monitor](./check-advance-pay-balance) 
