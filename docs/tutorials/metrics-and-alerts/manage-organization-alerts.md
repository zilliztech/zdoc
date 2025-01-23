---
title: "Manage Organization Alerts | Cloud"
slug: /manage-organization-alerts
sidebar_label: "Manage Organization Alerts"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers two types of alerts for resource monitoring Organization Alerts for billing-related matters and Project Alerts for operational performance of clusters in specific projects. For a quick reference, refer to Metrics & Alerts Reference. | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# Manage Organization Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for billing-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to clusters in the Standard and Enterprise plans. For more information, see <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p>

</Admonition>

## Overview{#overview}

 Below is a table outlining the default configuration for each organization alert.

When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-organization-alerts#edit-organization-alerts) to change its status.

<table>
   <tr>
     <th><p>Alert Target</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended Action</p></th>
     <th><p>Default Trigger Condition</p></th>
   </tr>
   <tr>
     <td><p>Expiration Date of Credit card</p></td>
     <td><p>Day</p></td>
     <td><p>Monitor the remaining days until the credit card's expiration to ensure uninterrupted service.</p></td>
     <td><p>Renew or update credit card information before the expiration date.</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts within 30 days of card expiration.</p><p><strong>CRITICAL</strong>: Trigger alerts within 7 days of card expiration.</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits</p></td>
     <td><p>$</p></td>
     <td><p>Track the balance of free credits, alerting the user when it falls low to prompt a top-up.</p></td>
     <td><p>Top up credits to maintain account functionality.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the balance of free credits falls below $10.</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity Period</p></td>
     <td><p>Day</p></td>
     <td><p>Monitor the remaining validity period of free credits, alerting the user to encourage usage or extension.</p></td>
     <td><p>Extend the validity period or use the credits before they expire.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the validity period of free credits reaches 0 days.</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay Balance</p></td>
     <td><p>$</p></td>
     <td><p>Monitor the advance pay balance, alerting the user when it falls low to prevent service disruption.</p></td>
     <td><p>Add funds to the advance pay balance to avoid service interruption.</p></td>
     <td><p>Trigger <strong>CRITICAL</strong> alerts when the balance falls below $100.</p></td>
   </tr>
   <tr>
     <td><p>Usage Amount</p></td>
     <td><p>$</p></td>
     <td><p>Track the usage amount, informing the user when it exceeds a set threshold to suggest monitoring and management.</p></td>
     <td><p>Monitor and manage usage to stay within budget limits.</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts when the amount of usage exceeds $100.</p></td>
   </tr>
</table>

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [Manage Organization Users](./organization-users).

## View organization alerts{#view-organization-alerts}

Navigate to the **Organization Alert** page to view various billing-related alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Status**: Indicates if the alert is active (**ON**) or not. When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met.

- **Condition**: Trigger conditions for the alert.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Receiver**: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![view-organization-alerts](/img/view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert targets and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

