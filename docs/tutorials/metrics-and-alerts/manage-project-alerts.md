---
title: "Manage Project Alerts | Cloud"
slug: /manage-project-alerts
sidebar_label: "Manage Project Alerts"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers two types of alerts for resource monitoring Organization Alerts for billing-related matters and Project Alerts for operational performance of clusters in specific projects. For a quick reference, refer to Metrics & Alerts Reference. | Cloud"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - project
  - alerts

---

import Admonition from '@theme/Admonition';


# Manage Project Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for billing-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage project alerts.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to clusters in the Standard and Enterprise plans. For more information, see <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p>

</Admonition>

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
     <td><p>CU Computation</p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized computational power for 10+ minutes.</p><p><strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized computational power for 10+ minutes.</p></td>
   </tr>
   <tr>
     <td><p>CU Capacity</p></td>
     <td><p>%</p></td>
     <td><p><strong>WARNING</strong>: Trigger alerts at &gt;70% utilized CU capacity for 10+ minutes.</p><p><strong>CRITICAL</strong>: Trigger alerts at &gt;90% utilized CU capacity for 10+ minutes.</p></td>
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

- **View**: All members can view project alerts in the target organization.

- **Configuration**: Only organization owners or project admins can configure cluster alerts.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For more information on user roles, see [User Roles](./user-roles).

## View project alerts{#view-project-alerts}

Navigate to the **Project Alerts** page to view project alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Status**: Indicates if the alert is active (**ON**) or not. When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met.

- **Condition**: Trigger conditions for the alert. For each project alert target, the trigger condition includes a threshold value and a duration value that must be met for the alert to be triggered. The condition can be set to one of the following operators: >, >=, \<, \<=, =. The threshold value can be a numeric value, such as a number for metrics like query latency, query QPS, search QPS, CU Capacity, and CU Computation. The duration specifies how long the threshold must be exceeded, which is set to a minimum of 1 minute and a maximum of 30 minutes.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Receiver**: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![view-project-alert](/img/view-project-alert.png)

## Create a project alert{#create-a-project-alert}

In addition to default project alerts, you can click **+ Alert** to create an alert by customizing the alert type, severity level, alert condition, and notification recipients.

For supported custom alert targets, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

![create-alert](/img/create-alert.png)

## Edit a project alert{#edit-a-project-alert}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert target type and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![edit-project-alert](/img/edit-project-alert.png)

## Enable or disable a project alert{#enable-or-disable-a-project-alert}

To quickly enable or disable a project alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![turn-on-or-off-project-alert](/img/turn-on-or-off-project-alert.png)

## Delete a project alert{#delete-a-project-alert}

Once a project alert is no longer needed, you can delete it.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once an alert is deleted, you'll no longer receive notifications for the alert target.</p>

</Admonition>

![delete-project-alert](/img/delete-project-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![view-project-alert-history](/img/view-project-alert-history.png)

## Related topics{#related-topics}

- [View Cluster Metrics](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

