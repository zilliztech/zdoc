---
slug: /query-latency-monitor
sidebar_position: 3
---



# Query Latency Monitor

To ensure timely fine-tuning of query latency to your Zilliz Cloud cluster, consider enabling the query latency resource monitor.

:::info Notes

This is a feature available only to clusters in the Standard and Enterprise plans.

:::

## Set alert condition{#set-alert-condition}

To set the alert condition for the query latency in a project, follow these steps:

1. From the left navigation pane in the project, choose **Monitoring**.

1. Open the **Monitor Settings** tab.

1. In the **Resource Alerts** card, locate the third condition.
    By default, we will send you notifications when the query latency is over 1000 ms for more than 10 minutes.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. To customize the alert condition, adjust the threshold for **Latency** and **Duration** in the prompted dialog box. Once you have set your preferences, click **Save** to apply the condition.

## Enable the monitor{#enable-the-monitor}

To enable the monitor, click the switch in the **Status** column. Clicking the switch will toggle it on and off. Make sure the indicator of the switch is on the right side, and the background color changes to blue.

![latency-monitor](/img/latency-monitor.png)

## Related topics{#related-topics}

- [CU Resource Monitor](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [Credit Card Expiration Monitor](./credit-card-expiration-monitor) 

- [View Cluster Metrics](./view-cluster-metrics) 

- [Advance Pay Balance Monitor](./advance-pay-balance-monitor) 
