---
slug: /manage-organization-alerts
beta: FALSE
notebook: FALSE
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Organization Alerts

Zilliz Cloud offers two types of alerts for resource monitoring: **Organization Alerts** for billing-related matters and **Project Alerts** for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

<Admonition type="info" icon="📘" title="Notes">

This feature is exclusively available to clusters in the Standard and Enterprise plans. For more information, see [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

</Admonition>

## Overview{#overview}

 Below is a table outlining the default configuration for each organization alert.

When an alert in an **ON** status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-organization-alerts#edit-organization-alerts) to change its status.

|  Alert Target                    |  Unit         |  Default Status |  Default Trigger Condition                                                                                                               |  Severity Level                      |
| -------------------------------- | ------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
|  Expiration Date of Credit card  |  Day          |  ON             |  - **WARNING**: Triggered within 30 days of card expiration.<br/> - **CRITICAL**: Triggered within 7 days of card expiration.<br/> |  **WARNING** / **CRITICAL**<br/>  |
|  Remaining Credits               |  $            |  ON             |  Triggered when the balance of free credits falls below $10.                                                                             |  **WARNING**                         |
|  Credit Validity Period<br/>  |  Day<br/>  |  ON<br/>     |  Triggered when the validity period of free credits reaches 0 days.                                                                      |  **WARNING**                         |
|  Advance Pay Balance             |  $            |  ON             |  Triggered when the balance falls below $100.                                                                                            |  **CRITICAL**                        |
|  Usage Amount                    |  $            |  OFF            |  Triggered when the amount of usage exceeds $100.                                                                                        |  **WARNING**                         |

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

## View organization alerts{#view-organization-alerts}

Navigate to the **Organization Alert** page to view various billing-related alerts.

**Components of an alert**:

- **Alert Target**: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- **Severity Level**: Categorized as **WARNING** or **CRITICAL**.

- **Condition**: Trigger conditions for the alert.

- **Status**: Indicates if the alert is active (**ON**) or not.

- **Receiver**: Designated roles or email addresses for receiving notifications.

![view-organization-alerts](/img/view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- **Customizations**: Modify alert conditions, update notification recipients, and change the active status.

- **Restrictions**: Alert targets and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

To quickly enable or disable an alert, you can select **Enable** or **Disable** from the **Actions** column.

</Admonition>

![edit-organization-alert](/img/edit-organization-alert.png)

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.

</Admonition>

![turn-on-or-off-organization-alert](/img/turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![view_alert_history](/img/view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

