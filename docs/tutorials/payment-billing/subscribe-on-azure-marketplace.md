---
title: "Subscribe on Azure Marketplace | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Azure Marketplace"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on Azure Marketplace. | Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - azure
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

# Subscribe on Azure Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on Azure Marketplace.

<Admonition type="info" icon="📘" title="Note">

<p>Once subscribed, you can pay for the usage of Azure clusters via Azure Marketplace. If you have clusters deployed on other cloud providers, you can also use Azure Marketplace to pay.</p>

</Admonition>

## Before you start\{#before-you-start}

Ensure you have an [Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) account and an Azure [billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) for subscription on Azure Marketplace.

Also ensure your billing country or region is on the list of supported markets. Zilliz Cloud does not support certain markets in the Azure Marketplace due to tax and compliance reasons. If you attempt to subscribe from an unsupported market, you may receive an error message stating, `"No plans are available for market '<market_code>'."` If this occurs, please [contact support](http://support.zilliz.com/) and provide a screenshot of the error message along with the market code. We will discuss possible solutions with you.

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>Supported markets</summary>

<Grid columnSize="4" widthRatios="25,25,25,25">

    <div>

        - Armenia

        - Australia

        - Austria

        - Bahrain

        - Barbados

        - Belarus

        - Belgium

        - Bulgaria

        - Canada

        - Chile

        - Colombia

        - Croatia

        - Cyprus

        - Czechia

        - Denmark

        - Egypt

        - Estonia

        - Finland

    </div>

    <div>

        - France

        - Georgia

        - Germany

        - Greece

        - Hong Kong SAR

        - Hungary

        - Iceland

        - India

        - Indonesia

        - Ireland

        - Italy

        - Japan

        - Kenya

        - Latvia

        - Liechtenstein

        - Lithuania

        - Luxembourg

        - Malaysia

    </div>

    <div>

        - Malta

        - Moldova

        - Monaco

        - Netherlands

        - New Zealand

        - Nigeria

        - Norway

        - Oman

        - Philippines

        - Poland

        - Portugal

        - Puerto Rico

        - Qatar

        - Romania

        - Russia

        - Saudi Arabia

        - Serbia

        - Singapore

    </div>

    <div>

        - Slovakia

        - Slovenia

        - South Africa

        - South Korea

        - Spain

        - Sweden

        - Switzerland

        - Taiwan

        - Tajikistan

        - Thailand

        - Türkiye

        - Uganda

        - Ukraine

        - United Arab Emirates

        - United Kingdom

        - United States

        - Uzbekistan

        - Vietnam

    </div>

</Grid>

</details>

## Subscribe on Azure Marketplace\{#subscribe-on-azure-marketplace}

Visit [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) and start subscribing to Zilliz Cloud as follows:

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

1. Search for **Zilliz Cloud** in the search box, or [go to the Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) to view the Zilliz Cloud portal page.

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_azure.png "search_for_zilliz_on_azure")

1. Click **Zilliz Cloud**.

    Familiarize yourself with the services and pricing.

1. Switch to the **Plans + Pricing** tab. Click **Get it now**.

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/get_it_now_on_azure.png "get_it_now_on_azure")

1. In the pop-up window, enter your basic information required by Zilliz Cloud.

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_basic_information_azure.png "enter_basic_information_azure")

1. On the **Subscribe to Zilliz Cloud** page, complete the following steps:

    1. Configure the **Project Details** by selecting an appropriate **Subscription** and **Resource group**. If there is no Resource group, please create one. For details about subscription and resource group, refer to Azures' [The SaaS Purchase Experience](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience).

    1. Configure the **SaaS Details**. 

        1. Name your subscription to easily identify it later.

        1. Choose the contract duration: 1 month or 1 year.

        1. Configure **Auto-renew** settings.

            <Admonition type="info" icon="📘" title="Note">

            <p>When auto-renew is on, you will be automatically subscribed to Zilliz Cloud on Azure at the end of the contract duration. When auto-renew is off, your subscription will end at the end of the contract duration and your Zilliz Cloud organization and account will be automatically unlinked from this Azure Marketplace subscription.</p>

            </Admonition>

    1. Review the subscription details and click **Review+Subscribe**.

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_subscription_on_azure.png "configure_subscription_on_azure")

1. On the next page, link your Azure Marketplace subscription to Zilliz Cloud by clicking **Configure account now**.

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_account_azure.png "configure_account_azure")

1. In the new tab, follow the steps below to complete subscription.

    1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process.

    1. Link your subscription to an existing Zilliz Cloud organization.

    1. Complete authorization.

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Go to **Billing** on Zilliz Cloud to ensure your Azure Marketplace subscription is set as your payment method.

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

## Update Azure Marketplace subscription\{#update-azure-marketplace-subscription}

After successfully subscribing from Azure Marketplace, you can always update your subscription at any time that you see fit. More specifically, you can either change the Azure Marketplace account used for the subscription to another one or switch your payment method from an Azure Marketplace subscription to a credit card. 

### Change Azure Marketplace subscription\{#change-azure-marketplace-subscription}

For more information, please refer to [Change Azure subscription and/or resource group](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group).

You can verify the update in the **Payment Method** section on the **Billing Overview** page. Click on the Subscription ID and check if the subscription **Purchaser PUID** has been updated to the new Marketplace account.

![view-azure-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-azure-subscription-id.png "view-azure-subscription-id")

### Switch to payment credit card\{#switch-to-payment-credit-card}

1. Sign in to Azure Marketplace with the Azure account you used for the subscription.

1. Cancel or delete your Zilliz Cloud subscription. Refer to [Cancel subscription](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) and [Delete subscription](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#delete-subscription) for more details.

    <Admonition type="info" icon="📘" title="Note">

    <p>It takes a few minutes for Azure Marketplace to complete the cancellation process.</p>

    </Admonition>

1. Follow the steps in [Subscribe by adding a credit card](./subscribe-by-adding-credit-card#add-a-credit-card) to add a payment credit card.

1. Verify the update in the **Payment Method** section on the **Billing Overview** page.

## Cancel Azure Marketplace subscription\{#cancel-azure-marketplace-subscription}

1. Open the Azure Marketplace homepage.

1. Click **All resources** or find your subscription in the **Resources/Recent** tab.

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azure_all_resources.png "azure_all_resources")

1. Navigate to the subscription you want to cancel. Click **Cancel subscription**. Wait for a few minutes for Azure Marketplace to complete the process.

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_azure_subscription.png "cancel_azure_subscription")

For more information about how to cancel subscription on Azure Marketplace, see [here](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription).

## Azure Marketplace pricing terms\{#azure-marketplace-pricing-terms}

Please refer to [Payment & Billing](./payment-billing#marketplace-pricing-terms) for more information.

## Troubleshooting\{#troubleshooting}

- **Why do I see “No plans are available for market '\<country_code>'” when subscribing via Azure Marketplace?**

    This message appears because Zilliz Cloud is not yet available in the Azure Marketplace for your billing country or region. For details, see [supported markets](./subscribe-on-azure-marketplace#before-you-start). Please [contact support](http://support.zilliz.com) and provide a screenshot of the error message along with the market code. We may be able to provide alternative solutions or update availability.

- **What I can do if there is no organization available when linking a marketplace subscription to Zilliz Cloud?**

    There could be several reasons.

    1. **Insufficient permissions** 

        This can happen when you do not have sufficient privileges. You will see an **"Insufficient Permissions"** tag next to the unavailable organization.

        ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

        To link an organization with a marketplace subscription, you must be an **Organization Owner** or an **Organization Billing Admin**. But if you are only an Organization Member, you do not have the required permissions. Please contact the organization owner for assistance.

    1. **All organizations have already been successfully linked to a Marketplace subscription**

        This can happen when all your organizations are already linked to Marketplace subscriptions. You will see a **"Marketplace Linked"** tag next to the unavailable organization.

        ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

        In this case,

        1. If you need to update an existing marketplace subscription, please [unlink](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) the current subscription of the organization first and then set up a new subscription.

        1. If you need multiple organizations for different Marketplace subscription, you can:

            1. [Register](./register-with-zilliz-cloud) a new Zilliz Cloud account to create a new organization. Then, [invite](./organization-users#invite-a-user-to-your-organization) the organization owner to the new organization. This organization owner will then belong to multiple organizations and can setup different marketplace subscriptions for each organization.

            1. [Create a support ticket](http://support.zilliz.com) so that we will create new organizations for you. Currently, Zilliz Cloud does not support manually creating organizations by users.

    1. **No organizations in the list**

        This can happen if your account has been closed or if you have left all organizations. Your UI will be similar to the following.

        ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

        In this case, you can:

        - Create a new organization.

        - Ask other users to [invite](./organization-users#invite-a-user-to-your-organization) you to their organizations and grant you the role of an Organization Owner.

        - [Create a support ticket](https://support.zilliz.com/hc/en-us) and we will create a new organization for you.

## Related topics\{#related-topics}

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Subscribe on GCP Marketplace](./subscribe-on-gcp-marketplace)

- [View Invoice](./view-invoice)

 