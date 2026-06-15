---
title: "Subscribe to a Public Offer on Google Cloud Marketplace | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace (Public Offer)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on GCP Marketplace. | Cloud"
type: origin
token: PWixwTgmIiAe47kO8UOc6SHHnle
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Subscribe to a Public Offer on Google Cloud Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on GCP Marketplace.

<Admonition type="info" icon="📘" title="Note">

Once subscribed, you can pay for the usage of Google Cloud clusters via Google Cloud Marketplace. If you have clusters deployed on other cloud providers, you can also use Google Cloud Marketplace to pay.

</Admonition>

## Before you start\{#before-you-start}

- Ensure you have a [GCP account](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount).

- Ensure you have set a billing account for the GCP project used for subscription.

- If your GCP Marketplace account is part of an organization, you must be authorized to make purchases by the billing administrator.

## Subscribe on GCP Marketplace\{#subscribe-on-gcp-marketplace}

Visit [GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) and start subscribing to Zilliz Cloud as follows:

<Procedures>

1. Search for **Zilliz Cloud** in the search box, or [go to the GCP Marketplace](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1) to view the Zilliz Cloud portal page.

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. Click **Zilliz Cloud**.

    Familiarize yourself with the services and pricing.

1. Select the project for subscription and click **Subscribe**. 

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. On the **New Zilliz Cloud subscription** page, complete the following steps:

    1. Select your billing account from the dropdown in the **Purchase details** section.

    1. Review and accept the **Terms**.

    1. Click **Subscribe**.

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. In the pop-up window, click **SIGN UP WITH ZILLIZ**.

    <Admonition type="info" icon="📘" title="Notes">

    If you are unable to complete the signup process, you can retry by navigating to **[Your Orders](https://console.cloud.google.com/marketplace/orders)** page in the GCP Marketplace.

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. In the new tab, follow the steps below to complete subscription.

    1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process.

    1. Link your subscription to an existing Zilliz Cloud organization.

    1. Complete authorization.

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Go to **Billing** to ensure your GCP Marketplace subscription is set as your payment method.

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## Update subscription or payment method\{#update-subscription-or-payment-method}

After successfully subscribing from Marketplace, you can always update your subscription at any time that you see fit. 

More specifically, you can either:

- Change the Marketplace account used for the subscription to another one

- Switch your payment method from Marketplace subscription to a credit card.

For details, see [Update Payment Method](./update-payment-method)

## Cancel GCP Marketplace subscription\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="Note">

After you cancel the subscription, your organization loses access to advanced Zilliz Cloud features. If your organization has no remaining credits, or if all credits have expired, it is frozen immediately.

</Admonition>

<Procedures>

1. Go to [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) page.

1. Select the product with the plan you want to cancel.

1. Click **Actions available to manage your orders**.

1. Select **Cancel purchase** or **Cancel subscription**.

</Procedures>

For details, refer to [Canceling your plan](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products).

## Troubleshooting\{#troubleshooting}

**What I can do if there is no organization available when linking a marketplace subscription to Zilliz Cloud?**

There could be several reasons.

- **Insufficient permissions** 

    This can happen when you do not have sufficient privileges. You will see an **"Insufficient Permissions"** tag next to the unavailable organization.

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    To link an organization with a marketplace subscription, you must be an **Organization Owner** or an **Organization Billing Admin**. But if you are only an Organization Member, you do not have the required permissions. Please contact the organization owner for assistance.

- **All organizations have already been successfully linked to a Marketplace subscription**

    This can happen when all your organizations are already linked to Marketplace subscriptions. You will see a **"Marketplace Linked"** tag next to the unavailable organization.

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    In this case,

    - If you need to update an existing marketplace subscription, please unlink the current subscription of the organization first and then set up a new subscription.

    - If you need multiple organizations for different Marketplace subscription, you can:

        - [Register](./register-with-zilliz-cloud) a new Zilliz Cloud account to create a new organization. Then, [invite](./organization-users#invite-a-user-to-your-organization) the organization owner to the new organization. This organization owner will then belong to multiple organizations and can setup different marketplace subscriptions for each organization.

        - [Create a support ticket](http://support.zilliz.com) so that we will create new organizations for you. Currently, Zilliz Cloud does not support manually creating organizations by users.

- **No organizations in the list**

    - This can happen if your account has been closed or if you have left all organizations. Your UI will be similar to the following.

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    In this case, you can:

    - Create a new organization.

    - Ask other users to [invite](./organization-users#invite-a-user-to-your-organization) you to their organizations and grant you the role of an Organization Owner.

    - [Create a support ticket](https://support.zilliz.com/hc/en-us) and we will create a new organization for you.

