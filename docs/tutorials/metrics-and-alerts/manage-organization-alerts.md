---
slug: /manage-organization-alerts
beta: FALSE
notebook: FALSE
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3

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
     <th>Alert Target</th>
     <th>Unit</th>
     <th>Description</th>
     <th>Recommended Action</th>
     <th>Default Trigger Condition</th>
   </tr>
   <tr>
     <td>Expiration Date of Credit card</td>
     <td>Day</td>
     <td>Monitor the remaining days until the credit card's expiration to ensure uninterrupted service.</td>
     <td>Renew or update credit card information before the expiration date.<br/></td>
     <td></td>
   </tr>
   <tr>
     <td>Remaining Credits</td>
     <td>$</td>
     <td>Track the balance of free credits, alerting the user when it falls low to prompt a top-up.</td>
     <td>Top up credits to maintain account functionality.</td>
     <td>Trigger <strong>WARNING</strong> alerts when the balance of free credits falls below $10.</td>
   </tr>
   <tr>
     <td>Credit Validity Period<br/></td>
     <td>Day<br/></td>
     <td>Monitor the remaining validity period of free credits, alerting the user to encourage usage or extension.</td>
     <td>Extend the validity period or use the credits before they expire.</td>
     <td>Trigger <strong>WARNING</strong> alerts when the validity period of free credits reaches 0 days.</td>
   </tr>
   <tr>
     <td>Advance Pay Balance</td>
     <td>$</td>
     <td>Monitor the advance pay balance, alerting the user when it falls low to prevent service disruption.</td>
     <td>Add funds to the advance pay balance to avoid service interruption.</td>
     <td>Trigger <strong>CRITICAL</strong> alerts when the balance falls below $100.</td>
   </tr>
   <tr>
     <td>Usage Amount</td>
     <td>$</td>
     <td>Track the usage amount, informing the user when it exceeds a set threshold to suggest monitoring and management.</td>
     <td>Monitor and manage usage to stay within budget limits.</td>
     <td>Trigger <strong>WARNING</strong> alerts when the amount of usage exceeds $100.</td>
   </tr>
</table>

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

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

![edit-organization-alert](/img/edit-organization-alert.png)

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![turn-on-or-off-organization-alert](/img/turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![view_alert_history](/img/view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

