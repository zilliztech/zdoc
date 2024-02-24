---
slug: /setup-maintenance-window
beta: FALSE
notebook: FALSE
token: FUtxwSaoSiDKFikcDw8cKngKn1f
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Set up Maintenance Window

You can set up a maintenance window to allow Zilliz Cloud to schedule maintenance for your hosted cluster. This makes impactful maintenance events more predictable and less disruptive for your workload.

![byoc-maintenance-window](/byoc/byoc-maintenance-window.png)

## Overview{#overview}

Currently, the maintenance window setting is global and applies to all clusters hosted on Zilliz Cloud.

By default, Zilliz Cloud blocks most impactful updates from 0 AM to 2 PM local time daily to avoid disruptions during peak business hours. You will receive a notification in advance for an upcoming maintenance event on a specific day. On that day, Zilliz Cloud takes action during the preferred window hours.

A maintenance event usually lasts two hours and may cause service interruptions. The default maintenance window is between 2 AM and 4 AM local time. You can adjust the maintenance window by selecting an option in "Preferred Time" to fit your needs.

You will receive another notification after a maintenance event has finished. Zilliz Cloud also lists the start and end of every maintenance event in "Activities" for further checks in case you miss the notifications.

## View current window hours{#view-current-window-hours}

To view the current time zone, choose __Settings__ from the left navigation pane and find the currently applied maintenance window hours under __Window Hours__ in the __System Maintenance Window__ area.

## Edit current window hours{#edit-current-window-hours}

To change the system maintenance window hours, click __Edit__ to open the __Maintenance Window Settings__ dialog box, and select a time window from the __Window Hours__ drop-down list.

## Related topics{#related-topics}

- [Manage Timezone](./manage-timezone)

- [Manage Organization Information](./organizations) 

