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

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for license-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

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
     <td>License (Core Usage)<br/></td>
     <td>%</td>
     <td>Monitor the percentage of used CPU cores against the total licensed cores.</td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td>License (Validity Period)</td>
     <td>Day</td>
     <td>Track the remaining days of license validity.</td>
     <td></td>
     <td></td>
   </tr>
</table>

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

## View organization alerts{#view-organization-alerts}

Navigate to the **Organization Alert** page to view various license-related alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Status**: Indicates if the alert is active (**ON**) or not. When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met.

- **Condition**: Trigger conditions for the alert.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Receiver**: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![byoc-view-organization-alerts](/byoc/byoc-view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert targets and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![byoc-edit-organization-alert](/byoc/byoc-edit-organization-alert.png)

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![byoc-turn-on-or-off-organization-alert](/byoc/byoc-turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![byoc_view_alert_history](/byoc/byoc_view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

