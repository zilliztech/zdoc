---
title: "Manage Organization Alerts | BYOC"
slug: /manage-organization-alerts
sidebar_label: "Manage Organization Alerts"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers two types of alerts for resource monitoring Organization Alerts for license-related matters and Project Alerts for operational performance of clusters in specific projects. For a quick reference, refer to Metrics & Alerts Reference. | BYOC"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

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
     <th><p>Alert Target</p></th>
     <th><p>Unit</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended Action</p></th>
     <th><p>Default Trigger Condition</p></th>
   </tr>
   <tr>
     <td><p>License (Core Usage)</p></td>
     <td><p>%</p></td>
     <td><p>Monitor the percentage of used CPU cores against the total licensed cores.</p></td>
     <td><p><strong>Below 70%</strong>: Continue monitoring to ensure core usage stays within this range. </p><p><strong>70-99%</strong>: Assess future needs and prepare to renew or upgrade the license.</p><p><strong>100% or above</strong>: Renew or upgrade the license immediately to avoid operational disruptions.</p></td>
     <td><p><strong>WARNING</strong>: Triggered when the count of used CPU cores reaches or exceeds 70% of the total.</p><p><strong>CRITICAL</strong>: Triggered when the count of used CPU cores reaches or exceeds 100% of the total.</p></td>
   </tr>
   <tr>
     <td><p>License (Validity Period)</p></td>
     <td><p>Day</p></td>
     <td><p>Track the remaining days of license validity.</p></td>
     <td><p><strong>Above 60 days</strong>: Continue monitoring to ensure more than 60 days of validity remain. </p><p><strong>60 days or below</strong>: Start preparing to renew or upgrade the license. </p><p><strong>Expired</strong>: Renew or upgrade the license immediately to avoid restrictions like the inability to create new clusters or scale up.</p></td>
     <td><p><strong>WARNING</strong>: Triggered when the license validity is 60 days or less.</p><p><strong>CRITICAL</strong>: Triggered when the license expires.</p></td>
   </tr>
</table>

**Permissions**:

- **View and configuration**: Available to organization owners only.

- **Receiving notifications**: Available to any organization member if designated by the owner.

For a detailed explanation of user roles, refer to [Manage Organization Users](./organization-users).

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

## Enable or disable an organization alert{#enable-or-disable-an-organization-alert}

To quickly enable or disable an organization alert, select **Enable** or **Disable** from the **Actions** column. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once an alert is disabled, you'll no longer receive alert notifications if alert conditions are met.</p>

</Admonition>

## View alert history{#view-alert-history}

View triggered alerts on the **Alert History** tab, with filters for alert target, severity level, and time range.

## Related topics{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Project Alerts](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)

