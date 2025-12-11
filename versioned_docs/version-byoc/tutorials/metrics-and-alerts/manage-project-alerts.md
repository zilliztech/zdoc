---
title: "Manage Project Alerts | BYOC"
slug: /manage-project-alerts
sidebar_label: "Manage Project Alerts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Project alerts enable proactive monitoring of your Zilliz Cloud clusters by sending notifications when specified conditions are met. You can configure project alerts to monitor cluster metrics such as CU capacity, query performance, ensuring you're immediately notified of potential issues that require attention. | BYOC"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - project
  - alerts
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Manage Project Alerts

Project alerts enable proactive monitoring of your Zilliz Cloud clusters by sending notifications when specified conditions are met. You can configure project alerts to monitor cluster metrics such as CU capacity, query performance, ensuring you're immediately notified of potential issues that require attention.

## Before you start\{#before-you-start}

Before creating or managing project alerts, ensure you have:

- **Organization Owner** or **Project Admin** role access

## View project alerts\{#view-project-alerts}

Navigate to **Project Alerts** in the left sidebar to access your project alert dashboard.

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### Alert history\{#alert-history}

Use the **History** tab when you need to investigate past events, understand alert patterns, or demonstrate system reliability.

### Alert settings\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

Use the **Settings** tab to review all configured alerts and their current status. This provides a centralized view of your monitoring coverage.

When viewing alerts, you'll encounter the following configuration items:

<table>
   <tr>
     <th><p>Field</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>Descriptive identifier for your alert (e.g., "High CU Usage - Dedicated Clusters", "P99 Query Latency")</p></td>
   </tr>
   <tr>
     <td><p>Status</p></td>
     <td><p>Toggle switch showing current alert state: Enabled (Active monitoring) or Disabled (No notifications)</p></td>
   </tr>
   <tr>
     <td><p>Target Cluster</p></td>
     <td><p>Monitored clusters - specific clusters (e.g., "Dedicated-02, Dedicated-01") or all Dedicated clusters (including those to be created later)</p></td>
   </tr>
   <tr>
     <td><p>Metric &amp; Condition</p></td>
     <td><p>Combined display of monitored parameter and trigger settings (e.g., "CU Capacity &gt; 80%, Duration &gt;= 10 min", "Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min")</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>Impact classification</p><ul><li><p><strong>Warning:</strong> Approaching limits</p></li><li><p><strong>Critical:</strong> Immediate attention required</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>Notification recipients including configured email addresses and notification channels.</p><p>For a list of notification channels available, refer to <a href="./manage-notification-channels">Manage Notification Channels</a>.</p></td>
   </tr>
   <tr>
     <td><p>Alert Interval</p></td>
     <td><p>Suppresses repeat notifications for a set time after each alert is sent.</p><ul><li><p>If an alert persists, notifications will not be resent during the interval. A notification will be resent before entering the next interval.</p></li><li><p>If the alert is resolved, the alert interval will be reset and resume alert evaluation.</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>Available management options: Edit, Clone, Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

You can view the alert list created for a specific project. For details on parameters, refer to [List Alert Rules](/reference/restful/list-alert-rules-v2).

```bash
export BASE_URL=https://api.cloud.zilliz.com
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request GET \
     --url "${BASE_URL}/v2/alertRules?projectId=${PROJECT_ID}" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

</TabItem>
</Tabs>

## Create a project alert\{#create-a-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

Set up new alerts to monitor your cluster performance and health from various aspects.

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

You can create an alert for specific or all Dedicated clusters. For details on parameters, refer to [Create Alert Rule](/reference/restful/create-alert-rule-v2).

```bash
export BASE_URL=https://api.cloud.zilliz.com
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request POST \
     --url "${BASE_URL}/v2/alertRules" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
       "projectId": "'"${PROJECT_ID}"'",
       "ruleName": "High CU Computation",
       "level": "CRITICAL",
       "metricName": "CU_COMPUTATION",
       "metricUnit": "percent",
       "threshold": 80,
       "windowSize": 10,
       "comparisonMethod": "GREATER_THAN",
       "targetClusterIds": ["in01-fbc09dde0a4bfc5"],
       "enabled": true,
       "sendResolved": true,
       "actions": [
         {
           "type": "EMAIL",
           "config": {
             "recipients": {
               "members": ["leryn.li@zilliz.com"],
               "orgRoles": ["OWNER"],
               "projectRoles": ["OWNER"]
             }
           }
         }
       ]
     }'
```

</TabItem>
</Tabs>

## Manage project alerts\{#manage-project-alerts}

Modify, organize, and maintain your existing alerts to keep monitoring relevant and effective.

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" icon="📘" title="Notes">

<p>You can also manage project alerts via RESTful APIs. For details, refer to <a href="/reference/restful/update-alert-rule-v2">Update Alert Rule</a> and <a href="/reference/restful/delete-alert-rule-v2">Delete Alert Rule</a>.</p>

</Admonition>

### Disable or enable an alert\{#disable-or-enable-an-alert}

Control active monitoring without losing configuration.

- **Disabled alerts:** Stop sending notifications but retain all settings

- **Enabled alerts:** Actively monitor clusters and send notifications when thresholds are exceeded

### Edit an alert\{#edit-an-alert}

Update alert configurations when monitoring requirements change.

Modify any alert parameter including:

- Threshold values and comparison operators

- Target clusters and metric types

- Nnotification channels, recipients, and alert intervals

- Severity levels and duration settings

### Clone an alert\{#clone-an-alert}

Create similar alerts with minimal setup effort. Cloning copies all existing settings, allowing you to:

- Create variants for different cluster environments

- Adjust thresholds while keeping other parameters

- Scale monitoring across multiple projects

### Delete an alert\{#delete-an-alert}

Remove obsolete or redundant monitoring rules.

<Admonition type="danger" icon="🚧" title="Warning">

<p>Alert deletion is permanent and cannot be undone. Ensure you no longer need the alert before proceeding.</p>

</Admonition>

## Configure alert receiver settings\{#configure-alert-receiver-settings}

Set project-wide default notification settings, ensuring consistent monitoring practices across your team.

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

When configuring settings, you'll encounter the following concepts:

- **Send to**: Default notification channels (email, Slack, webhooks) automatically selected for new alerts. Configure your most commonly used channels to streamline alert creation.

- **Alert Resolution Notification**: When enabled, you will receive notifications when the alert is resolved.

- **Apply Settings to Existing Alerts**: Choose whether to update all existing alerts with new default settings.

## FAQ\{#faq}

### How often will I receive alert notifications when an alert is triggered?\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

Alert notifications follow an automatic frequency pattern:

- **First notification**: Sent immediately when the alert threshold is exceeded

- **Second notification**: Sent after 1 hour if the condition persists

- **Subsequent notifications**: Sent once daily while the alert condition remains active

If you find the notifications too frequent, you can:

- [Edit the alert](./manage-project-alerts#edit-an-alert) to adjust the condition thresholds or duration requirements

- [Disable the alert](./manage-project-alerts#disable-or-enable-an-alert) temporarily to stop all notifications while retaining the configuration

