---
title: "Manage Organization Settings | BYOC"
slug: /organization-settings
sidebar_label: "Organization Settings"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "If you are an Organization Owner, you have the privileges to manage the organization settings. | BYOC"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - settings
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';


# Manage Organization Settings

If you are an Organization Owner, you have the privileges to manage the organization settings.

This guide will walk you through the steps of managing organization settings.

## View organizations\{#view-organizations}

Once you sign up for Zilliz Cloud, a default organization will be created for you. While you cannot create new organizations, you can join other user's organizations by invitation. 

After logging into the [Zilliz Cloud console](https://cloud.zilliz.com/login), you'll land on the page listing the organizations you're part of. You can check out and enter these organizations.

For a quick view of all the organizations you've joined, just click **All Organizations** in the top left corner.

![view-organizations](https://zdoc-images.s3.us-west-2.amazonaws.com/view-organizations.png "view-organizations")

## Rename an organization\{#rename-an-organization}

To rename an organization, you must be an [Organization Owner](./organization-users).

![edit-organization-name-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name-byoc.png "edit-organization-name-byoc")

## Manage timezone\{#manage-timezone}

The system time zone is set to where your first login occurs and applies to all time strings displayed on Zilliz Cloud.

To view the current time zone, you can either be an Organization Owner or an Organization Member. For details on roles in an organization, refer to [Manage Organization Users](./organization-users).

![byoc-timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-timezone-settings.png "byoc-timezone-settings")

To modify the system time zone, you must be an [Organization Owner](./organization-users). Click **Edit** to open the **Time Zone Settings** dialog box, and select a time zone from the drop-down list. You can also enter the name of a time zone to quickly filter the desired time zone.

## Set up maintenance window\{#set-up-maintenance-window}

You can set up a maintenance window to allow Zilliz Cloud to schedule maintenance for your hosted cluster. This makes impactful maintenance events more predictable and less disruptive for your workload.

Currently, the maintenance window setting is global and applies to all clusters hosted on Zilliz Cloud.

By default, Zilliz Cloud blocks most impactful updates from 0 AM to 2 PM local time daily to avoid disruptions during peak business hours. You will receive a notification in advance for an upcoming maintenance event on a specific day. On that day, Zilliz Cloud takes action during the preferred window hours.

A maintenance event usually lasts two hours and may cause service interruptions. The default maintenance window is between 2 AM and 4 AM local time. You can adjust the maintenance window by selecting an option in "System Maintenance Window" to fit your needs.

You will receive another notification after a maintenance event has finished. Zilliz Cloud also lists the start and end of every maintenance event in "Activities" for further checks in case you miss the notifications.

To view the current time zone, choose **Settings** from the left navigation pane and find the currently applied maintenance window hours under the **System Maintenance Window** area.

To change the system maintenance window hours, click **Edit** to open the Edit System Maintenance Window dialog box, and select a time window from the **System Maintenance Window** drop-down list.

![byoc-maintenance-window](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-maintenance-window.png "byoc-maintenance-window")

## Delete organization\{#delete-organization}

Before you start, make sure the following conditions are met:

- All clusters in the current organization are [deleted](./manage-cluster).

- You are granted the [Organization Owner](./organization-users) role in the target organization.

- All remaining advance pay funds need to be refunded.

To delete an organization: 

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization that you want to delete.

1. In the left-side navigation pane, click **Settings**.

1. On the **System Settings** page, find the **Delete Organization** area and click the button.

1. Follow the instructions in the pop-up window and click the button to complete deleting the organization.

<Admonition type="caution" icon="🚧" title="Warning">

<p>The action of deleting an organization cannot be undone. Please take extra caution with this action.</p>

</Admonition>

![byoc-delete-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-delete-organization.png "byoc-delete-organization")

