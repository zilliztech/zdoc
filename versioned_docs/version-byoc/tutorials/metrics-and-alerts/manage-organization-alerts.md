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

Zilliz Cloud offers two types of alerts for resource monitoring: __Organization Alerts__ for license-related matters and __Project Alerts__ for operational performance of clusters in specific projects. For a quick reference, refer to [Metrics & Alerts Reference](./metrics-alerts-reference).

This topic describes how to view and manage organization alerts.

## Overview{#overview}

 Below is a table outlining the default configuration for each organization alert.

When an alert in an __ON__ status, the specified recipients will receive notifications once the conditions are met. You can [edit an alert](./manage-organization-alerts#edit-organization-alerts) to change its status.

|  Alert Target                  |  Unit |  Description                                                                |  Recommended Action                                                                                                                                                                                                                                                                                                                                                         |  Default Trigger Condition                                                                                                                                                                                       |
| ------------------------------ | ----- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  License (Core Usage)<br/>  |  %    |  Monitor the percentage of used CPU cores against the total licensed cores. |  - __Below 70%__: Continue monitoring to ensure core usage stays within this range.<br/> - __70-99%__: Assess future needs and prepare to renew or upgrade the license.<br/> - __100% or above__: Renew or upgrade the license immediately to avoid operational disruptions.<br/> For details, refer to [License](./license).                                      |  - __WARNING__: Triggered when the count of used CPU cores reaches or exceeds 70% of the total.<br/> - __CRITICAL__: Triggered when the count of used CPU cores reaches or exceeds 100% of the total.<br/> |
|  License (Validity Period)     |  Day  |  Track the remaining days of license validity.                              |  - __Above 60 days__: Continue monitoring to ensure more than 60 days of validity remain.<br/> - __60 days or below__: Start preparing to renew or upgrade the license.<br/> - __Expired__: Renew or upgrade the license immediately to avoid restrictions like the inability to create new clusters or scale up.<br/> For details, refer to [License](./license). |  - __WARNING__: Triggered when the license validity is 60 days or less.<br/> - __CRITICAL__: Triggered when the license expires.<br/>                                                                      |

__Permissions__:

- __View and configuration__: Available to organization owners only.

- __Receiving notifications__: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [User Roles](./user-roles).

## View organization alerts{#view-organization-alerts}

Navigate to the __Organization Alert__ page to view various license-related alerts.

__Components of an alert__:

- __Alert Target__: Preconfigured by Zilliz Cloud with trigger conditions and severity.

- __Severity Level__: Categorized as __WARNING__ or __CRITICAL__.

- __Condition__: Trigger conditions for the alert.

- __Status__: Indicates if the alert is active (__ON__) or not.

- __Receiver__: Designated roles or email addresses for receiving notifications.

![byoc-view-organization-alerts](/byoc/byoc-view-organization-alerts.png)

## Edit organization alerts{#edit-organization-alerts}

- __Customizations__: Modify alert conditions, update notification recipients, and change the active status.

- __Restrictions__: Alert targets and severity level are fixed and cannot be changed.

<Admonition type="info" icon="📘" title="Notes">

<p>To quickly enable or disable an alert, you can select <strong>Enable</strong> or <strong>Disable</strong> from the <strong>Actions</strong> column.</p>

</Admonition>

![byoc-edit-organization-alert](/byoc/byoc-edit-organization-alert.png)

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select __Enable__ or __Disable__ from the __Actions__ column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

![byoc-turn-on-or-off-organization-alert](/byoc/byoc-turn-on-or-off-organization-alert.png)

## View alert history{#view-alert-history}

View triggered alerts on the __Alert History__ tab, with filters for alert target, severity level, and time range.

![byoc_view_alert_history](/byoc/byoc_view_alert_history.png)

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

