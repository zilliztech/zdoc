---
slug: /advance-pay-balance-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 6
---



# Check Advance Pay Balance

Zilliz Cloud has an Advance Pay balance monitor that is disabled by default. If you have added funds to your Advance Pay via bank transfer, you can choose to enable it. This will allow you to receive notifications from us when your Advance Pay balance is less than the amount you specified.

:::info Notes

This is a feature available only to clusters in the Standard and Enterprise plans.

:::

## Set Alert Condition{#set-alert-condition}

To set the alert condition for advance pay balance monitor, follow these steps:

1. From the left navigation pane in a project, choose **Monitoring**.

1. Open the **Monitor Settings** tab.

1. Locate the second line in the **Billing Monitor** area.

1. Click **…** in the **Actions** column, and choose **Edit**.

1. In the pop-up window, specify the minimum amount of advance pay balance for alerting. Once the remaining advance pay balance is less than the amount you specified, you will receive a total of 3 emails, 1 every hour.

![advance-pay-monitor-edit-en](/img/advance-pay-monitor-edit-en.png)

## Enable Advance Pay Balance Monitor{#enable-advance-pay-balance-monitor}

To enable the monitor, look for the switch in the **Status** column and click it. Clicking the switch will toggle it on and off. Make sure the indicator of the switch is on the right side, and the background color changes to blue.

![advance-pay-monitor-enable-en](/img/advance-pay-monitor-enable-en.png)

## Related topics{#related-topics}

- [CU Resource Monitor](./monitor-cu-resources) 

- [QPS Resource Monitor](./monitor-qps) 

- [Query Latency Monitor](./monitor-query-latency) 

- [Load Capacity Resource Monitor](./monitor-load-capacity) 

- [View Cluster Metrics](./view-cluster-metrics) 
