---
title: "Manage Organization Alerts | Cloud"
slug: /manage-organization-alerts
sidebar_label: "Manage Organization Alerts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization alerts monitor billing and account-related metrics across your entire Zilliz Cloud organization. Unlike project alerts that focus on cluster performance, organization alerts help you track credit balances, payment methods, and usage patterns to ensure uninterrupted service and prevent unexpected billing issues. Stay informed about account health and avoid service disruptions by receiving timely notifications about credit depletion, payment failures, and usage thresholds. | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Organization Alerts

Organization alerts monitor billing and account-related metrics across your entire Zilliz Cloud organization. Unlike project alerts that focus on cluster performance, organization alerts help you track credit balances, payment methods, and usage patterns to ensure uninterrupted service and prevent unexpected billing issues. Stay informed about account health and avoid service disruptions by receiving timely notifications about credit depletion, payment failures, and usage thresholds.

## Before you start\{#before-you-start}

Before viewing or managing organization alerts, ensure you have:

- **Organization Owner** role access

## View organization alerts\{#view-organization-alerts}

Navigate to **Organization Alerts** in the left sidebar to access your organization alert dashboard and monitor your account's financial health.

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View Organization Alerts Demo" />

### Alert history\{#alert-history}

Use the **History** tab to investigate past alert activities and understand billing patterns. This is useful for analyzing spending trends, reviewing credit usage, or demonstrating account management to stakeholders.

### Alert settings\{#alert-settings}

Use the **Settings** tab to monitor the current status of all billing-related alerts. Check here when you need to verify which alerts are protecting your organization and review their configuration.

When viewing alerts, you'll encounter the following configuration items:

<table>
   <tr>
     <th><p>Field</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>Alert identifier describing the billing event (e.g., "Credit Balance Low", "Payment Method Expiring")</p></td>
   </tr>
   <tr>
     <td><p>Status</p></td>
     <td><p>Current alert state: Enabled (Active monitoring) or Disabled (No notifications)</p></td>
   </tr>
   <tr>
     <td><p>Target</p></td>
     <td><p>Monitored scope - Organization-wide</p></td>
   </tr>
   <tr>
     <td><p>Metric &amp; Condition</p></td>
     <td><p>Trigger parameters including credit thresholds, payment status, and usage limits</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>Impact classification</p><ul><li><p><strong>Warning:</strong> Approaching limits</p></li><li><p><strong>Critical:</strong> Immediate attention required</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>Notification recipients including configured email addresses and communication channels</p></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>Available management options: Edit, Clone</p></td>
   </tr>
</table>

## Manage organization alerts\{#manage-organization-alerts}

Modify and maintain your existing alerts to ensure effective billing monitoring that matches your organization's needs and notification preferences.

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isShowcase="true" />

### Disable or enable an alert\{#disable-or-enable-an-alert}

Control active monitoring without losing alert configuration.

- **Disabled alerts:** Retain all configuration but stop monitoring and notifications

- **Enabled alerts:** Actively monitor billing metrics and send notifications when conditions are met

### Edit an alert\{#edit-an-alert}

Customize notification recipients and modify trigger conditions for existing alerts.

### Clone an alert\{#clone-an-alert}

Create similar alerts with different notification settings or threshold modifications.

## Configure alert receiver settings\{#configure-alert-receiver-settings}

Set organization-wide default notification settings that automatically apply to new alerts, ensuring consistent billing notification practices across your organization.

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### How often will I receive alert notifications when an alert is triggered?\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

Alert notifications follow an automatic frequency pattern:

- **First notification**: Sent immediately when the alert threshold is exceeded

- **Second notification**: Sent after 1 hour if the condition persists

- **Subsequent notifications**: Sent once daily while the alert condition remains active

If you find the notifications too frequent, you can:

- [Edit the alert](./manage-organization-alerts#edit-an-alert) to adjust the condition thresholds or duration requirements

- [Disable the alert](./manage-organization-alerts#disable-or-enable-an-alert) temporarily to stop all notifications while retaining the configuration

