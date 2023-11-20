---
slug: /docs/advance-pay-balance-monitor
beta: FALSE
notebook: FALSE
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# Check Advance Pay Balance

Zilliz Cloud provides an Advance Pay balance monitor, which is disabled by default. In the event that you have deposited funds into your Advance Pay account using a bank transfer, you have the option to activate this monitor. Once enabled, it ensures that you will receive notifications from us whenever your Advance Pay balance drops below a predefined threshold specified by you.

<Admonition type="info" icon="📘" title="Notes">

To use this feature, please [contact sales](https://zilliz.com/contact-sales).

</Admonition>

## Set Alert Condition{#set-alert-condition}

To configure the alert conditions for remaining Advance Pay funds within a project, follow the steps below:

1. Select **Monitoring** from the project’s left navigation pane.

1. Navigate to the **Monitor Settings** tab.

1. Find the second condition in the** Billing Monitor** card.

1. Click **…** in the **Actions** column, and select **Edit**.

1. In the dialog box that appears, set the minimum threshold for your Advance Pay balance that will trigger alerts. If your remaining Advance Pay balance falls below the specified amount, you will receive a series of three emails, distributed at a rate of one per hour.

![advance-pay-monitor-edit-en](/img/advance-pay-monitor-edit-en.png)

## Enable Advance Pay Balance Monitor{#enable-advance-pay-balance-monitor}

To activate the monitor, click the switch in the **Status** column. This action toggles the monitor’s state on or off. Verification of activation is confirmed when the switch’s indicator is positioned to the right, complemented by a change in background color to blue.

![advance-pay-monitor-enable-en](/img/advance-pay-monitor-enable-en.png)

## Related topics{#related-topics}

- [Monitor CU Resources](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [View Cluster Metrics](./monitor-metrics) 
