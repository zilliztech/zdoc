---
slug: /manage-organization-alerts
beta: FALSE
notebook: FALSE
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 2
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

|  Alert Target                    |  Unit             |  Severity Level                      |  Default Trigger Condition                                                                                                               |  Default Status |
| -------------------------------- | ----------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
|  Credit Card Expiration<br/>  |  Day              |  **WARNING** / **CRITICAL**<br/>  |  - **WARNING**: Triggered within 30 days of card expiration.<br/> - **CRITICAL**: Triggered within 7 days of card expiration.<br/> |  ON             |
|  Credits (Usage / Validity)      |  % / Day<br/>  |  **WARNING**                         |  Triggered when credit balance falls below $10 or validity period reaches 0 days.                                                        |  ON<br/>     |
|  Advance Pay Balance             |  $                |  **CRITICAL**                        |  Triggered when the balance falls below $100.                                                                                            |  ON             |
|  Usage Amount                    |  $                |  **WARNING**                         |  Triggered when the amount of usage exceeds $100.                                                                                        |  OFF            |

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

- **Restrictions**: Alert target target and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

To quickly turn on or off an alert, you can select **Turn On** or **Turn Off** from the **Actions** column.

</Admonition>

![edit-organization-alert](/img/edit-organization-alert.png)

## Turn on or off an organization alert{#turn-on-or-off-an-organization-alert}

To quickly turn on or off an organization alert, select **Turn On** or **Turn Off** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

Once an alert is turned off, you'll no longer receive alert notifications if alert conditions are met.

</Admonition>

![turn-on-or-off-organization-alert](/img/turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

![view_alert_history](/img/view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

