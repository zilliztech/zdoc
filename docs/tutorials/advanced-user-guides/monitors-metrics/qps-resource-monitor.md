---
slug: /qps-resource-monitor
sidebar_position: 2
---



# QPS Resource Monitor

To ensure timely fine tuning queries per second (QPS) to your Zilliz Cloud cluster, consider enabling the QPS resource monitor.

:::info Notes

This is a feature available only to clusters in the Standard and Enterprise plans.

:::

## Set alert condition{#set-alert-condition}

To set the alert condition for the QPS to your cluster in a project, follow these steps:

1. From the left navigation pane in the project, choose **Monitoring**.

1. Open the **Monitor Settings** tab.

1. In the **Resource Alerts** card, locate the second condition.
    By default, we will send you notifications when the QPS is over 10 for more than 10 minutes.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. To customize the alert condition, adjust the threshold for **QPS** and **Duration** in the prompted dialog box. Once you have set your preferences, click **Save** to apply the condition.

## Enable the monitor{#enable-the-monitor}

To enable the monitor, click the switch in the **Status** column. Clicking the switch will toggle it on and off. Make sure the indicator of the switch is on the right side, and the background color changes to blue.

![qps-monitor](/img/qps-monitor.png)

## Related topics{#related-topics}

- [CU Resource Monitor](./cu-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [Credit Card Expiration Monitor](./credit-card-expiration-monitor) 

- [View Cluster Metrics](./view-cluster-metrics) 

- https://zilliverse.feishu.cn/wiki/Wlh2wJFuqiG3b7ke3Wpcy2Wdnmg
