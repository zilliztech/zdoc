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

Zilliz Cloud offers two types of alerts for resource monitoring: __Organization Alerts__ for license-related matters and __Project Alerts__ for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage project alerts.

## Overview{#overview}

Below is a table outlining the default conditions for each default project alert.

When an alert in an __ON__ status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-project-alerts#edit-a-project-alert) to change its status.

For more information about recommended actions, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

|  Alert Target            |  Unit |  Default Trigger Condition                                                                                                                                                                |
| ------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  CU Computation<br/>  |  %    |  - __WARNING__: Trigger alerts at >70% utilized computational power for 10+ minutes.<br/> - __CRITICAL__: Trigger alerts at >90% utilized computational power for 10+ minutes.<br/> |
|  CU Capacity             |  %    |  - __WARNING__: Trigger alerts at >70% utilized CU capacity for 10+ minutes.<br/> - __CRITICAL__: Trigger alerts at >90% utilized CU capacity for 10+ minutes.<br/>                 |
|  Search QPS              |  QPS  |  Trigger __WARNING__ alerts at >50 search operations per second for 10+ minutes.                                                                                                          |
|  Query QPS               |  QPS  |  Trigger __WARNING__ alerts at >50 query operations per second for 10+ minutes.                                                                                                           |
|  P99 Search Latency      |  ms   |  Trigger __WARNING__ alerts at P99 latency >1,000ms for 10+ minutes.                                                                                                                      |
|  P99 Query Latency       |  ms   |  Trigger __WARNING__ alerts at P99 latency >1,000ms for 10+ minutes.                                                                                                                      |

__Permissions__:

- __View__: Organization owners and project owners or members can view project alerts.

- __Configuration__: Only organization or project owners can configure cluster alerts.

- __Receiving notifications__: Available to any organization member if designated by the owner.

For more information on user roles, see [User Roles](./user-roles).

## View project alerts{#view-project-alerts}

Navigate to the __Project Alerts__ page to view project alerts.

__Components of an alert__:

- __Alert Target__: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- __Status__: Indicates if the alert is active (__ON__) or not. When an alert in an __ON__ status, the specified recipients will receive notifications once the conditions are met.

- __Condition__: Trigger conditions for the alert.

- __Severity Level__: Categorized as __WARNING__ or __CRITICAL__.

- __Receiver__: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![byoc-view-project-alert](/byoc/byoc-view-project-alert.png)

## Create a project alert{#create-a-project-alert}

In addition to default project alerts, you can click __+ Alert__ to create an alert by customizing the alert type, severity level, alert condition, and notification recipients.

For supported custom alert targets, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

![byoc-create-alert](/byoc/byoc-create-alert.png)

## Edit a project alert{#edit-a-project-alert}

- __Customizations__: Modify alert conditions, update notification recipients, and change the active status.

- __Restrictions__: Alert target type and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![byoc-edit-project-alert](/byoc/byoc-edit-project-alert.png)

## Enable or disable a project alert{#enable-or-disable-a-project-alert}

To quickly enable or disable a project alert, select __Enable__ or __Disable__ from the __Actions__ column. 

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

View triggered alerts on the __Alert History__ tab, with filters for alert target, severity level, and time range.

![byoc-view-project-alert-history](/byoc/byoc-view-project-alert-history.png)

## Related topics{#related-topics}

- [View Cluster Metrics](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

