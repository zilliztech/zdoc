---
slug: /manage-project-alerts
beta: FALSE
notebook: FALSE
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4

---

import Admonition from '@theme/Admonition';


# Manage Project Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for license-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage project alerts.

## Overview{#overview}

Below is a table outlining the default trigger conditions for predefined project alert targets.

When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-project-alerts#edit-a-project-alert) to change its status.

For more information about recommended actions, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

<table>
   <tr>
     <th><p>Alert Target</p></th>
     <th><p>Unit</p></th>
     <th><p>Default Trigger Condition</p></th>
   </tr>
   <tr>
     <td><p>CU Computation<br/></p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized computational power for 10+ minutes.<br/> <strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized computational power for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>CU Capacity</p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized CU capacity for 10+ minutes.<br/> <strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized CU capacity for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Search (QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at &gt;50 search operations per second for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Query (QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at &gt;50 query operations per second for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Search Latency (P99)</p></td>
     <td><p>ms</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>Query Latency (P99)</p></td>
     <td><p>ms</p></td>
     <td><p>Trigger <strong>WARNING</strong> alerts at P99 latency &gt;1,000ms for 10+ minutes.</p></td>
   </tr>
</table>

**Permissions**:

- **View**: Organization owners and project owners or members can view project alerts.

- **Configuration**: Only organization or project owners can configure cluster alerts.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For more information on user roles, see [User Roles](./user-roles).

## View project alerts{#view-project-alerts}

Navigate to the **Project Alerts** page to view project alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Status**: Indicates if the alert is active (**ON**) or not. When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met.

- **Condition**: Trigger conditions for the alert. For each project alert target, the trigger condition includes a threshold value and a duration value that must be met for the alert to be triggered. The condition can be set to one of the following operators: >, >=, &lt;, &lt;=, =. The threshold value can be a numeric value, such as a number for metrics like query latency, query QPS, search QPS, CU Capacity, and CU Computation. The duration specifies how long the threshold must be exceeded, which is set to a minimum of 1 minute and a maximum of 30 minutes.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Receiver**: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![byoc-view-project-alert](/byoc/byoc-view-project-alert.png)

## Create a project alert{#create-a-project-alert}

In addition to default project alerts, you can click **+ Alert** to create an alert by customizing the alert type, severity level, alert condition, and notification recipients.

For supported custom alert targets, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

![byoc-create-alert](/byoc/byoc-create-alert.png)

## Edit a project alert{#edit-a-project-alert}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert target type and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![byoc-edit-project-alert](/byoc/byoc-edit-project-alert.png)

## Enable or disable a project alert{#enable-or-disable-a-project-alert}

To quickly enable or disable a project alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![byoc-turn-on-or-off-project-alert](/byoc/byoc-turn-on-or-off-project-alert.png)

## Delete a project alert{#delete-a-project-alert}

Once a project alert is no longer needed, you can delete it.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once an alert is deleted, you'll no longer receive notifications for the alert target.</p>

</Admonition>

![byoc-delete-project-alert](/byoc/byoc-delete-project-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![byoc-view-project-alert-history](/byoc/byoc-view-project-alert-history.png)

## Related topics{#related-topics}

- [View Cluster Metrics](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

