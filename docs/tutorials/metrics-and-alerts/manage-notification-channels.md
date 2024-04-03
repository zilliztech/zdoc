---
slug: /manage-notification-channels
beta: FALSE
notebook: FALSE
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# Manage Notification Channels

Alert notifications in Zilliz Cloud keep you informed about events occurring within your clusters. By default, these notifications are sent to specified user email addresses. However, you can also set up custom notification channels using webhooks for more integrated, event-driven notifications. This guide will walk you through the process of configuring alert notification channels.

## Before you start{#before-you-start}

To manage notification channels, make sure you are an [organization or project owner](./user-roles).

## Set up notification channels{#set-up-notification-channels}

Currently, Zilliz Cloud offers four main types of notification channels:

- [Email](./manage-notification-channels#email): Receive notifications at specified email addresses.

- [PagerDuty](./manage-notification-channels#pagerduty): Integrate with a PagerDuty service using an integration key.

- [Slack](./manage-notification-channels#slack): Integrate with a Slack app using a webhook URL.

- [Webhook](./manage-notification-channels#webhook): Integrate with custom services or applications using a valid webhook URL.

You can access the management page of notification channels in the __Edit Alert__ or __Create Alert__ dialog box in the Zilliz Cloud console.

![manage-alert-channel](/img/manage-alert-channel.png)

### Email{#email}

To set up email notifications,

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), navigate to the __Alert Settings__ tab on the organization or project alert page.

1. To modify an existing alert, select __Edit__ from the __Actions__ column next to the desired alert target. To create a new alert, click __+ Alert__ in the upper-right corner.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

    </Admonition>

1. In the __Send To__ field of the dialog box, select user roles or email addresses of individual users to receive alert notifications.

For more information, refer to [Manage Organization Alerts](./manage-organization-alerts) or [Manage Project Alerts](./manage-project-alerts).

### PagerDuty{#pagerduty}

To integrate with a PagerDuty service,

1. [Create a service](https://support.pagerduty.com/docs/services-and-integrations#create-a-service) in the PagerDuty UI.

1. [Create an Events API v2 integration](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration) to obtain the integration key. The integration key will be in the format: `c55ec4de243e440bd0e921750bdfxxxx`.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the PagerDuty notification channel.

    1. Navigate to the __Alert Settings__ tab on the organization or project alert page.

    1. To modify an existing alert, select __Edit__ from the __Actions__ column next to the desired alert target. To create a new alert, click __+ Alert__ in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click __+ Channel__ in the __Send To__ field and choose __PagerDuty__ from the dropdown list.

    1. Enter the PagerDuty integration key obtained and select the service region hosting your PagerDuty account. For more information on PagerDuty service regions, refer to [Service Regions](https://support.pagerduty.com/docs/service-regions).

### Slack{#slack}

To set up Slack integration,

1. [Create a webhook](https://api.slack.com/messaging/webhooks#getting_started) in the Slack UI.

1. In the __Webhook URL__ section, obtain the webhook URL. The URL will be in the format: `https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Slack notification channel.

    1. Navigate to the __Alert Settings__ tab on the organization or project alert page.

    1. To modify an existing alert, select __Edit__ from the __Actions__ column next to the desired alert target. To create a new alert, click __+ Alert__ in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click __+ Channel__ in the __Send To__ field and choose __Slack__ from the dropdown list.

    1. Enter the webhook URL obtained.

### Webhook{#webhook}

The __Webhook__ option offered by Zilliz Cloud allows you to set up a custom notification channel.

1. Obtain the webhook URL of your service.

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/signup), configure the Webhook notification channel.

    1. Navigate to the __Alert Settings__ tab on the organization or project alert page.

    1. To modify an existing alert, select __Edit__ from the __Actions__ column next to the desired alert target. To create a new alert, click __+ Alert__ in the upper-right corner.

        <Admonition type="info" icon="📘" title="Notes">

        <p>For organization alerts, you can only edit existing alert targets; creating new ones is not supported. For more information, refer to <a href="./manage-organization-alerts">Manage Organization Alerts</a>.</p>

        </Admonition>

    1. In the dialog box that appears, click __+ Channel__ in the __Send To__ field and choose __Webhook__ from the dropdown list.

    1. Enter the webhook URL of your service.

## Test connectivity{#test-connectivity}

After setting up a notification channel, click the Send Test Message icon to verify that it is properly configured.

![test-connectivity](/img/test-connectivity.png)

