---
slug: /manage-organization-alerts
beta: FALSE
notebook: FALSE
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Manage Organization Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for license-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

## Overview{#overview}

 Below is a table outlining the default configuration for each organization alert.

When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-organization-alerts#edit-organization-alerts) to change its status.

|  Alert Target                  |  Unit |  Severity Level             |  Default Trigger Condition                                                                                                                                                                                       |  Default Status |
| ------------------------------ | ----- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
|  License (Core Usage)<br/>  |  %    |  **WARNING** / **CRITICAL** |  - **WARNING**: Triggered when the count of used CPU cores reaches or exceeds 70% of the total.<br/> - **CRITICAL**: Triggered when the count of used CPU cores reaches or exceeds 100% of the total.<br/> |  ON<br/>     |
|  License (Validity Period)     |  Day  |  **WARNING** / **CRITICAL** |  - **WARNING**: Triggered when the license validity is 60 days or less.<br/> - **CRITICAL**: Triggered when the license expires.<br/>                                                                      |  ON             |

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

## View organization alerts{#view-organization-alerts}

Navigate to the **Organization Alert** page to view various license-related alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Condition**: Trigger conditions for the alert.

- **Status**: Indicates if the alert is active (**ON**) or not.

- **Receiver**: Designated roles or email addresses for receiving notifications.

![byoc-view-organization-alerts](/byoc/byoc-view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert target target and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

To quickly turn on or off an alert, you can select **Turn On** or **Turn Off** from the **Actions** column.

</Admonition>

![byoc-edit-organization-alert](/byoc/byoc-edit-organization-alert.png)

## Turn on or off an organization alert{#turn-on-or-off-an-organization-alert}

To quickly turn on or off an organization alert, select **Turn On** or **Turn Off** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

Once an alert is turned off, you'll no longer receive alert notifications if alert conditions are met.

</Admonition>

![byoc-turn-on-or-off-organization-alert](/byoc/byoc-turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![byoc_view_alert_history](/byoc/byoc_view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

