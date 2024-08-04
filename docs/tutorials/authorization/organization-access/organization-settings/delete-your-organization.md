---
title: "Delete Your Organization | Cloud"
slug: /delete-your-organization
sidebar_label: "Delete Your Organization"
beta: FALSE
notebook: FALSE
description: "This topic describes how to delete an organization in Zilliz Cloud. Once the organization is deleted, all its data will be cleaned permanently and cannot be recovered. | Cloud"
type: origin
token: OCc5wCndbipOkzk8tkUc9IuJnle
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - organizations
  - delete

---

import Admonition from '@theme/Admonition';


# Delete Your Organization

This topic describes how to delete an organization in Zilliz Cloud. Once the organization is deleted, all its data will be cleaned permanently and cannot be recovered.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- All clusters in the current organizations are [deleted](./manage-cluster).

- All organization [bills](./view-invoice) are paid.

- You are granted the [Organization Owner](./resource-hierarchy) role in the target organization.

- All remaining advance pay funds need to be refunded.

- Third-party [marketplace subscription needs to be cancelled](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription).

## Delete organization{#delete-organization}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization that you want to delete.

1. In the left-side navigation pane, click **Settings**.

1. On the **System Settings** page, find the **Delete Organization** area and click the button.

1. Follow the instructions in the pop-up window and click the button to complete deleting the organization.

<Admonition type="caution" icon="🚧" title="Warning">

<p>The action of deleting an organization cannot be undone. Please take extra caution with this action.</p>

</Admonition>

![delete-organization-en](/img/delete-organization-en.png)

## Related topics{#related-topics}

- [A Panorama View](./resource-hierarchy)

- [Manage Organizations and Members](./organizations)

- [Manage Projects and Collaborators](./project-access)

- [View Activities](./view-activities)

