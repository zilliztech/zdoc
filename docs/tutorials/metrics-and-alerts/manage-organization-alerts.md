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

Zilliz Cloud offers two types of alerts for resource monitoring: __Organization Alerts__ for billing-related matters and __Project Alerts__ for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to clusters in the Standard and Enterprise plans. For more information, see <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</p>

</Admonition>

## Overview{#overview}

 Below is a table outlining the default configuration for each organization alert.

When an alert in an __ON__ status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-organization-alerts#edit-organization-alerts) to change its status.

|  Alert Target                    |  Unit         |  Description                                                                                                      |  Recommended Action                                                           |  Default Trigger Condition                                                                                                                         |
| -------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
|  Expiration Date of Credit card  |  Day          |  Monitor the remaining days until the credit card's expiration to ensure uninterrupted service.                   |  Renew or update credit card information before the expiration date.<br/>  |  - __WARNING__: Trigger alerts within 30 days of card expiration.<br/> - __CRITICAL__: Trigger alerts within 7 days of card expiration.<br/> |
|  Remaining Credits               |  $            |  Track the balance of free credits, alerting the user when it falls low to prompt a top-up.                       |  Top up credits to maintain account functionality.                            |  Trigger __WARNING__ alerts when the balance of free credits falls below $10.                                                                      |
|  Credit Validity Period<br/>  |  Day<br/>  |  Monitor the remaining validity period of free credits, alerting the user to encourage usage or extension.        |  Extend the validity period or use the credits before they expire.            |  Trigger __WARNING__ alerts when the validity period of free credits reaches 0 days.                                                               |
|  Advance Pay Balance             |  $            |  Monitor the advance pay balance, alerting the user when it falls low to prevent service disruption.              |  Add funds to the advance pay balance to avoid service interruption.          |  Trigger __CRITICAL__ alerts when the balance falls below $100.                                                                                    |
|  Usage Amount                    |  $            |  Track the usage amount, informing the user when it exceeds a set threshold to suggest monitoring and management. |  Monitor and manage usage to stay within budget limits.                       |  Trigger __WARNING__ alerts when the amount of usage exceeds $100.                                                                                 |

__Permissions__:

- __View and configuration__: Available to organization owners only.

- __Receiving notifications__: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

## View organization alerts{#view-organization-alerts}

Navigate to the __Organization Alert__ page to view various billing-related alerts.

__Components of an alert__:

- __Alert Target__: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- __Status__: Indicates if the alert is active (__ON__) or not. When an alert in an __ON__ status, the specified recipients will receive notifications once the conditions are met.

- __Condition__: Trigger conditions for the alert.

- __Severity Level__: Categorized as __WARNING__ or __CRITICAL__.

- __Receiver__: Designated roles or email addresses for receiving notifications. You can also set up custom notification channels using webhooks. For more information, refer to [Manage Notification Channels](./manage-notification-channels).

![view-organization-alerts](/img/view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- __Customizations__: Modify alert conditions, update notification recipients, and change the active status.

- __Restrictions__: Alert targets and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![edit-organization-alert](/img/edit-organization-alert.png)

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select __Enable__ or __Disable__ from the __Actions__ column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![turn-on-or-off-organization-alert](/img/turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the __Alert History__ tab, with filters for alert target, severity level, and time range.

![view_alert_history](/img/view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

