---
title: "Manage Organization Settings | Cloud"
slug: /organization-settings
sidebar_key: organization-settings
sidebar_label: "Organization Settings"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "If you are an Organization Owner, you have the privileges to manage the organization settings. | Cloud"
type: origin
token: AAqUwQW3qia3akkjfDNc0kwanlh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - settings

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

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

You can rename an organization in either of the following ways:

- Rename an organization on the organization list page:

    ![rename-organization](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-organization.png "rename-organization")

- Enter an organization and rename it on the **System Settings** page:

    ![edit-organization-name](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-organization-name.png "edit-organization-name")

## Manage timezone\{#manage-timezone}

The system time zone is set to where your first login occurs and applies to all time strings displayed on Zilliz Cloud.

To view the current time zone, you can either be an Organization Owner or an Organization Member. For details on roles in an organization, refer to [Manage Organization Users](./organization-users).

![timezone-settings](https://zdoc-images.s3.us-west-2.amazonaws.com/timezone-settings.png "timezone-settings")

To modify the system time zone, you must be an [Organization Owner](./organization-users). Click **Edit** to open the **Time Zone Settings** dialog box, and select a time zone from the drop-down list. You can also enter the name of a time zone to quickly filter the desired time zone.

## Set up preferred maintenance window\{#set-up-preferred-maintenance-window}

A preferred maintenance window is a **4-hour** period during which Zilliz Cloud automatically performs scheduled maintenance—such as upgrading the Milvus version of your Dedicated clusters.

Setting a preferred window helps you schedule maintenance outside peak traffic hours and minimize impact on your workloads.

By default, the window is set to **2:00 AM–6:00 AM**. You can update it based on your needs.

The following demo shows how to edit the preferred maintenance window.

<Supademo id="cmn4bhv4l0ps5z3qmdcrmuij7" title=""  />

<Admonition type="info" icon="📘" title="Note">

<p>If maintenance runs past your preferred window, it will continue until completion.</p>

</Admonition>

7 days before scheduled maintenance, you will see a notification on the **Cluster Overview** page in the web console.

![Czaab7qPaoElX6xVizQcEiwznmh](https://zdoc-images.s3.us-west-2.amazonaws.com/czaab7qpaoelx6xvizqceiwznmh.png "Czaab7qPaoElX6xVizQcEiwznmh")

- For **Organization Owners** and **Project Admins**, you can choose to:

    - Upgrade the cluster to the latest Milvus version immediately.

    - Defer the maintenance for 7 days. You can only defer once.

    - Take no action and let maintenance run as scheduled.

- For **Organization Members**, please check your [SDK compatibility](./install-sdks#sdk-compatibility).

## Delete organization\{#delete-organization}

Before you start, make sure the following conditions are met:

- All clusters in the current organization are [deleted](./manage-cluster).

- All volumes in the current organization are [deleted](./volume).

- All organization [bills](./view-invoice) are paid.

- You are granted the [Organization Owner](./organization-users) role in the target organization.

- All remaining advance pay funds need to be refunded.

- Third-party [marketplace subscription needs to be cancelled](./marketplace-subscription).

To delete an organization: 

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization that you want to delete.

1. In the left-side navigation pane, click **Settings**.

1. On the **System Settings** page, find the **Delete Organization** area and click the button.

1. Follow the instructions in the pop-up window and click the button to complete deleting the organization.

</Procedures>

<Admonition type="caution" icon="🚧" title="Warning">

<p>The action of deleting an organization cannot be undone. Please take extra caution with this action.</p>

</Admonition>

![delete-organization-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-organization-en.png "delete-organization-en")

