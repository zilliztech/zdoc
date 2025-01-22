---
title: "Manage Notification Channels | Cloud"
slug: /manage-notification-channels
sidebar_label: "Manage Notification Channels"
beta: FALSE
notebook: FALSE
description: "Alert notifications in Zilliz Cloud keep you informed about events occurring within your clusters. By default, these notifications are sent to specified user email addresses. However, you can also set up custom notification channels using webhooks for more integrated, event-driven notifications. This guide will walk you through the process of configuring alert notification channels. | Cloud"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - notification
  - channels
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding

---

import Admonition from '@theme/Admonition';


# Manage Notification Channels

Alert notifications in Zilliz Cloud keep you informed about events occurring within your clusters. By default, these notifications are sent to specified user email addresses. However, you can also set up custom notification channels using webhooks for more integrated, event-driven notifications. This guide will walk you through the process of configuring alert notification channels.

## Before you start{#before-you-start}

To manage notification channels, make sure you are an [organization owner](./organization-users) or [project admin](./project-users).

## Set up notification channels{#set-up-notification-channels}

You can access the management page of notification channels in the **Edit Alert** or **Create Alert** dialog box in the Zilliz Cloud console.

![manage-alert-channel](/img/manage-alert-channel.png)

### Email{#email}

To set up email notifications,

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), navigate to the **Alert Settings** tab on the organization or project alert page.

1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

    </Admonition>

1. In the **Send to** field of the dialog box, select user roles or email addresses of individual users to receive alert notifications.

1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

For more information, refer to [Manage Organization Alerts](./manage-organization-alerts) or [Manage Project Alerts](./manage-project-alerts).

### PagerDuty{#pagerduty}

To integrate with a PagerDuty service,

1. [Create a service](https://support.pagerduty.com/docs/services-and-integrations#create-a-service) in the PagerDuty UI.

1. [Create an Events API v2 integration](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration) to obtain the integration key. The integration key will be in the format: `c55ec4de243e440bd0e921750bdfxxxx`.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the PagerDuty notification channel.

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **PagerDuty** from the dropdown list.

    1. Enter the PagerDuty integration key obtained and select the service region hosting your PagerDuty account. For more information on PagerDuty service regions, refer to [Service Regions](https://support.pagerduty.com/docs/service-regions).

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

### Slack{#slack}

To set up Slack integration,

1. [Create a webhook](https://api.slack.com/messaging/webhooks#getting_started) in the Slack UI.

1. In the **Webhook URL** section, obtain the webhook URL. The URL will be in the format: `https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Slack notification channel.

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **Slack** from the dropdown list.

    1. Enter the webhook URL obtained.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

### Opsgenie{#opsgenie}

To set up Opsgenie integration,

1. Obtain your API key in Opsgenie. For details, refer to [Create an API integration](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/).

    1. Go to the Opsgenie Integrations page by selecting **Settings** > **Integrations** and click **Add integration**.

    1. Search for and select **API**. Provide a name for this API integration and click **Continue**.

    1. On the API settings page, click **Edit**. By default, all permissions will be selected, and you will want to ensure that **Allow Read Access**, **Allow Create and Update Access**, and **Allow Configuration Access** are selected.

    1. Copy the API key that is generated for you and press **Save**. Review the **Incoming Rules** and press **Turn on integration** to finalize API set up.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Opsgenie notification channel.

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **Opsgenie** from the dropdown list.

    1. Enter the API key obtained in Opsgenie.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

### Lark{#lark}

To set up Lark integration,

1. Enter the target Lark group, invite your custom bot to the group, and then obtain the webhook URL corresponding to the robot. For detailed steps, refer to [Custom bot usage guide](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot).

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Lark notification channel.

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **Lark** from the dropdown list.

    1. Enter the webhook URL obtained.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

### Webhook{#webhook}

The **Webhook** option offered by Zilliz Cloud allows you to set up a custom notification channel.

1. Obtain the webhook URL of your service.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Webhook notification channel.

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **Webhook** from the dropdown list.

    1. Enter the webhook URL of your service.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

Example webhook notification:

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "New Zilliz Cloud Alert for your cluster Cluster-01 (in01-ffbab4a57bdd0bb). CU Computation >= 0 % for 10 minutes.",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom{#wecom}

To set up WeCom alert notifications, follow these steps:

1. Create a group bot in your WeCom group. For detailed instructions, refer to [Group bot creation](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3). 

    <Admonition type="info" icon="📘" title="Notes">

    <p>Due to WeCom settings, some groups may not be able to add group bots.</p>

    </Admonition>

1. View the created bot information to obtain the corresponding bot's webhook URL. For detailed instructions, refer to [Obtain the group bot's webhook address](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80).

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/signup) to configure the WeCom alert channel. 

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **WeCom** from the dropdown list.

    1. Enter the webhook URL obtained.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

### DingTalk{#dingtalk}

To set up DingTalk alert notifications, follow these steps:

1. Create a custom bot in your DingTalk group. For detailed instructions, refer to [Custom bot integration](https://open.dingtalk.com/document/robots/custom-robot-access).

    <Admonition type="info" icon="📘" title="Notes">

    <p>When configuring a custom bot, specify <strong>Custom Keywords</strong> in <strong>Security Setting</strong>:</p>
    <ul>
    <li><p><strong>Test</strong>: Receive alert notifications for connectivity tests.</p></li>
    <li><p><strong>Alert</strong>: Receive alert notifications for actual events.</p></li>
    </ul>

    </Admonition>

1. View the created bot information to obtain the corresponding bot's webhook URL. For detailed instructions, refer to [Obtain custom bot's webhook address](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot).

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/signup) to configure the DingTalk alert channel. 

    1. Navigate to the **Alert Settings** tab on the organization or project alert page.

    1. To modify an existing alert, select **Edit** from the **Actions** column next to the desired alert target. To create a new alert, click **+ Alert** in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click **+ Channel** in the **Send to** field and choose **DingTalk** from the dropdown list.

    1. Enter the webhook URL obtained.

    1. In **Alert Resolution Notification** and **Enable Alert**, configure the appropriate actions to be taken when an alert is resolved or triggered.

## Test connectivity{#test-connectivity}

After setting up a notification channel, click the Send Test Message icon to verify that it is properly configured.

![test-connectivity](/img/test-connectivity.png)

