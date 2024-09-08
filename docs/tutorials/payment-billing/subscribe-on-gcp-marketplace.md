---
title: "Subscribe on Google Cloud Marketplace | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace"
beta: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on GCP Marketplace. | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - gcp

---

import Admonition from '@theme/Admonition';


# Subscribe on Google Cloud Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on GCP Marketplace.

<Admonition type="info" icon="📘" title="Notes">

<p>Once subscribed, you can pay for the usage of Google Cloud clusters via Google Cloud Marketplace. If you have clusters deployed on other cloud providers, you can also use Google Cloud Marketplace to pay.</p>

</Admonition>

## Before you start{#before-you-start}

- Ensure you have a [GCP account](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount).

- Ensure you have set a billing account for the GCP project used for subscription.

- If your GCP Marketplace account is part of an organization, you must be authorized to make purchases by the billing administrator.

## Subscribe on GCP Marketplace{#subscribe-on-gcp-marketplace}

Visit [GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) and start subscribing to Zilliz Cloud as follows:

1. Search for **Zilliz Cloud** in the search box, or [go to the GCP Marketplace](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1) to view the Zilliz Cloud portal page.

    ![search_for_zilliz_on_gcp](/img/search_for_zilliz_on_gcp.png)

1. Click **Zilliz Cloud**.

    Familiarize yourself with the services and pricing.

1. Select the project for subscription and click **Subscribe**. 

    ![click_subscribe_on_gcp](/img/click_subscribe_on_gcp.png)

1. On the **New Zilliz Cloud subscription** page, complete the following steps:

    1. Select your billing account from the dropdown in the **Purchase details** section.

    1. Review and accept the **Terms**.

    1. Click **Subscribe**.

    ![new_zilliz_cloud_subscription_on_gcp](/img/new_zilliz_cloud_subscription_on_gcp.png)

1. In the pop-up window, click **SIGN UP WITH ZILLIZ**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>If you are unable to complete the signup process, you can retry by navigating to <strong><a href="https://console.cloud.google.com/marketplace/orders">Your Orders</a></strong> page in the GCP Marketplace.</p>

    </Admonition>

    ![gcp_flash_message](/img/gcp_flash_message.png)

1. In the new tab, follow the steps below to complete subscription.

    1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process.

    1. Link your subscription to an existing Zilliz Cloud organization.

    1. Complete authorization.

    ![gcp_link_subscription_with_account](/img/gcp_link_subscription_with_account.png)

1. Go to **Billing** to ensure your GCP Marketplace subscription is set as your payment method.

## Update GCP Marketplace subscription{#update-gcp-marketplace-subscription}

After successfully subscribing from GCP Marketplace, you can always update your subscription at any time that you see fit. More specifically, you can either change the GCP Marketplace account used for the subscription to another one or switch your payment method from a GCP Marketplace subscription to a credit card. 

### Change GCP Marketplace subscription account{#change-gcp-marketplace-subscription-account}

1. Sign in to GCP Marketplace with the original GCP account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your plan](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>It takes a few minutes for GCP Marketplace to complete the cancellation process.</p>

    </Admonition>

1. Sign out of your original GCP account.

1. Sign in to GCP Marketplace with the new GCP account you want to use for the subscription.

1. Follow steps 1 to 4 in the [Subscribe on GCP Marketplace](./subscribe-on-gcp-marketplace#subscribe-on-gcp-marketplace) section to complete your subscription to Zilliz Cloud with the new account.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When updating GCP Marketplace subscription, you must click the Manage on Provider button to link your new subscription with Zilliz Cloud organization.</p>

    </Admonition>

### Switch to payment credit card{#switch-to-payment-credit-card}

1. Sign in to GCP Marketplace with the original GCP account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your plan](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>It takes a few minutes for GCP Marketplace to complete the cancellation process.</p>

    </Admonition>

1. Follow the steps in [Subscribe by adding a credit card](./subscribe-by-adding-credit-card#add-a-credit-card) to add a payment credit card.

1. Check out your current payment method in your billing overview.

## Cancel GCP Marketplace subscription{#cancel-gcp-marketplace-subscription}

To cancel your GCP Marketplace subscription, you need to open the GCP Marketplace console and follow the instructions [here](https://cloud.google.com/marketplace/docs/manage-billing#cancel).

## GCP Marketplace pricing terms{#gcp-marketplace-pricing-terms}

Please refer to [Payment & Billing](./payment-billing#marketplace-pricing-terms) for more information.

## Troubleshooting{#troubleshooting}

**What I can do if I encounter issues when linking a marketplace subscription to Zilliz Cloud?**

There are several possible reasons:

1. **Insufficient permissions** (UI prompt: Insufficient Permissions)

    To link an organization with a marketplace subscription, you must be an organization owner. But if you are an organization member, you do not have the required permissions. Please contact the organization owner for assistance.

1. **All organizations have already been successfully linked to a Marketplace subscription** (UI prompt: Marketplace Linked)

    1. If you need to update an existing marketplace subscription, please [unlink](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription) the current subscription of the organization first and then set up a new subscription.

    1. If you need multiple organizations for different Marketplace subscription, you can:

        1. [Register](./register-with-zilliz-cloud) a new Zilliz Cloud account to create a new organization. Then, [invite](./organization-users#invite-a-user-to-join-your-organization) the organization owner to the new organization. This organization owner will then belong to multiple organizations and can setup different marketplace subscriptions for each organization.

        1. [Create a support ticket](http://support.zilliz.com) so that we will create new organizations for you. Currently, Zilliz Cloud does not support manually creating organizations by users.

1. **No organizations in the list**

    This can happen if your account has been closed or if you have left all organizations. In this case, you can:

    1. Ask other users to [invite](./organization-users#invite-a-user-to-join-your-organization) you to their organization as an organization owner.

    1. [Submit a support ticket](https://support.zilliz.com/hc/en-us) and we will create a new organization for you.

## Related topics{#related-topics}

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Subscribe on Azure Marketplace](./subscribe-on-azure-marketplace)

- [View Invoice](./view-invoice) 

