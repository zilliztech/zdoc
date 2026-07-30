---
title: "Update Payment Method | BYOC"
slug: /update-payment-method
sidebar_key: update-payment-method
sidebar_label: "Update Payment Method"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "You can update your payment method when your organization needs to replace an expired card, move billing to a cloud marketplace, switch between marketplace accounts, or return from marketplace billing to credit card billing. | BYOC"
type: origin
token: TfzMwdLsWibd0UkGpGAcLhuInvb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - payment
  - billing
  - update

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Update Payment Method

You can update your payment method when your organization needs to replace an expired card, move billing to a cloud marketplace, switch between marketplace accounts, or return from marketplace billing to credit card billing.

<Admonition type="info" icon="📘" title="Note">

To manage payment method, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

## Supported payment method changes\{#supported-payment-method-changes}

Zilliz Cloud supports the following payment method changes.

<table>
   <tr>
     <th><p><strong>From</strong></p></th>
     <th><p><strong>To</strong></p></th>
     <th><p><strong>How to update</strong></p></th>
   </tr>
   <tr>
     <td><p>Credit card</p></td>
     <td><p>Credit card</p></td>
     <td><p>Replace the added credit card in the Zilliz Cloud console.</p></td>
   </tr>
   <tr>
     <td><p>Credit card</p></td>
     <td><p>Marketplace subscription</p></td>
     <td><p>Subscribe to Zilliz Cloud through the target marketplace and link the subscription to your Zilliz Cloud organization. </p><p>After the subscription is linked, the payment method is updated automatically. The marketplace subscription automatically replaces the credit card information.</p></td>
   </tr>
   <tr>
     <td><p>Marketplace subscription</p></td>
     <td><p>Credit card</p></td>
     <td><p>Cancel the current marketplace subscription, and then add a credit card in the Zilliz Cloud console.</p></td>
   </tr>
   <tr>
     <td><p>Marketplace subscription</p></td>
     <td><p>Marketplace subscription</p></td>
     <td><p>Cancel the current marketplace subscription, subscribe through the new marketplace account, and link the new subscription to your Zilliz Cloud organization.</p></td>
   </tr>
</table>

## Replace a credit card\{#replace-a-credit-card}

For step-by-step guide, see [Credit Card](./subscribe-by-adding-credit-card#replace-a-credit-card).

## Switch from credit card to marketplace subscription\{#switch-from-credit-card-to-marketplace-subscription}

To switch from credit card billing to marketplace billing, follow the steps below.

<Procedures>

1. Subscribe to Zilliz Cloud through cloud marketplaces.

    - [AWS Marketplace](./subscribe-on-aws-marketplace)

    - [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

    - [Microsoft Marketplace](./subscribe-on-azure-marketplace)

1. Verify the update.

    After the marketplace subscription is successful, the payment method is updated automatically. You do not need to manually remove the credit card.

    You can verify the update on the **Billing** page.

</Procedures>

## Switch from marketplace subscription to credit card\{#switch-from-marketplace-subscription-to-credit-card}

To switch from marketplace billing to credit card billing, follow the steps below.

<Procedures>

1. Cancel the current subscription from the cloud marketplace where you subscribed.

1. In the Zilliz Cloud console, go to **Billing**.

1. [Add a credit card](./subscribe-by-adding-credit-card#add-a-credit-card) in the **Payment Method** section.

</Procedures>

Your organization uses the credit card as the payment method after it is added successfully.

## Switch between marketplace subscriptions\{#switch-between-marketplace-subscriptions}

You can switch between marketplace subscriptions when you need to change the marketplace account used for billing, upgrade an AWS Marketplace free trial, or move from a public offer to a private offer.

The required steps depend on the type of change.

<table>
   <tr>
     <th><p><strong>Scenario</strong></p></th>
     <th><p><strong>What to do</strong></p></th>
   </tr>
   <tr>
     <td><p>Change the marketplace account used for billing</p></td>
     <td><p>Cancel the current marketplace subscription, subscribe again with the new marketplace account, and link the new subscription to your Zilliz Cloud organization.</p></td>
   </tr>
   <tr>
     <td><p>Upgrade AWS Marketplace free trial</p></td>
     <td><p>Upgrade or subscribe from the AWS Marketplace offer page, and then link the paid subscription to your Zilliz Cloud organization.</p></td>
   </tr>
   <tr>
     <td><p>Switch from public offer to private offer</p></td>
     <td><p>Accept the private offer. The private offer replaces the previous public offer. You still need to link the new offer to your Zilliz Cloud organization.</p></td>
   </tr>
</table>

### Change Marketplace account\{#change-marketplace-account}

The following example shows how to change the AWS Marketplace account used for billing. The same process applies to Google Cloud Marketplace and Microsoft Marketplace.

<Admonition type="info" icon="📘" title="Note">

We recommend completing the operations within 1 hour to avoid service interruption.

</Admonition>

<Procedures>

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.

    <Admonition type="info" icon="📘" title="Note">

    Please rest assured that canceling the subscription will not delete your Zilliz Cloud data.

    </Admonition>

    It takes a few minutes for AWS Marketplace to complete the cancellation process.

1. Sign out of your original AWS account.

1. Sign in to AWS Marketplace with a different AWS account that you want to use for the subscription.

1. Follow the steps in the [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace#subscribe-to-a-public-offer) section to complete your subscription to Zilliz Cloud with the new account.

    <Admonition type="info" icon="📘" title="Note">

    When updating AWS Marketplace subscription, you must click the **Set up your account** button to link your new subscription with Zilliz Cloud organization.

    </Admonition>

1. Verify the update in the **Payment Method** section on the **Billing Overview** page. Click on the Subscription ID and verify if the subscription **Account ID** has been updated to the new Marketplace account.

    ![view-aws-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-aws-subscription-id.png "view-aws-subscription-id")

</Procedures>

### Switch from public offer to private offer\{#switch-from-public-offer-to-private-offer}

To switch from a marketplace public offer to a private offer, accept the private offer provided by Zilliz.

The new private offer automatically replaces the previous public offer after you accept it. You still need to link the new offer to your Zilliz Cloud organization.

For details, see [switch from a public offer to a private offer](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer). 

