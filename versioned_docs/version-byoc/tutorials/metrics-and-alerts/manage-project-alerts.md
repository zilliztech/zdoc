---
slug: /manage-project-alerts
beta: FALSE
notebook: FALSE
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Manage Project Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for license-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage project alerts.

## Overview{#overview}

Below is a table outlining the default conditions for each default project alert.

When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-project-alerts#edit-a-project-alert) to change its status.

|  Alert Target       |  Unit |  Severity Level             |  Default Trigger Condition                                                                                                                                                      |  Default Status |
| ------------------- | ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
|  CU Computation     |  %    |  **WARNING** / **CRITICAL** |  - **WARNING**: Triggered at >70% utilized computational power for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized computational power for 10+ minutes.<br/> |  ON<br/>     |
|  CU Capacity        |  %    |  **WARNING** / **CRITICAL** |  - **WARNING**: Triggered at >70% utilized CU capacity for 10+ minutes.<br/> - **CRITICAL**: Triggered at >90% utilized CU capacity for 10+ minutes.<br/>                 |  ON             |
|  Search QPS         |  QPS  |  **WARNING**                |  Triggered at >50 search operations per second for 10+ minutes.                                                                                                                 |  OFF            |
|  Query QPS          |  QPS  |  **WARNING**                |  Triggered at >50 query operations per second for 10+ minutes.                                                                                                                  |  OFF            |
|  P99 Search Latency |  ms   |  **WARNING**                |  Triggered at P99 latency >1000ms for 10+ minutes.                                                                                                                              |  OFF            |
|  P99 Query Latency  |  ms   |  **WARNING**                |  Triggered at P99 latency >1000ms for 10+ minutes.                                                                                                                              |  OFF            |

**Permissions**:

- **View**: Organization owners and project owners or members can view project alerts.

- **Configuration**: Only organization or project owners can configure cluster alerts.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For more information on user roles, see [User Roles](./user-roles).

## View project alerts{#view-project-alerts}

Navigate to the **Project Alerts** page to view project alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Condition**: Trigger conditions for the alert.

- **Send to**: Designated roles or email addresses for receiving notifications.

- **Status**: Indicates if the alert is active (**ON**) or not.

![byoc-view-project-alert](/byoc/byoc-view-project-alert.png)

## Create a project alert{#create-a-project-alert}

In addition to default project alerts, you can click **+ Alert** to create an alert by customizing the alert type, severity level, alert condition, and notification recipients.

For supported custom alert targets, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

![byoc-create-alert](/byoc/byoc-create-alert.png)

## Edit a project alert{#edit-a-project-alert}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert target type and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

To quickly enable or disable an alert, you can select **Enable** or **Disable** from the **Actions** column.

</Admonition>

![byoc-edit-project-alert](/byoc/byoc-edit-project-alert.png)

## Enable or disable a project alert{#enable-or-disable-a-project-alert}

To quickly enable or disable a project alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.

</Admonition>

![byoc-turn-on-or-off-project-alert](/byoc/byoc-turn-on-or-off-project-alert.png)

## Delete a project alert{#delete-a-project-alert}

Once a project alert is no longer needed, you can delete it.

<Admonition type="caution" icon="🚧" title="Warning">

Once an alert is deleted, you'll no longer receive notifications for the alert target.

</Admonition>

![byoc-delete-project-alert](/byoc/byoc-delete-project-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![byoc-view-project-alert-history](/byoc/byoc-view-project-alert-history.png)

## Related topics{#related-topics}

- [View Cluster Metrics](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

