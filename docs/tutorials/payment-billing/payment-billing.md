---
title: "Payment & Billing | Cloud"
slug: /payment-billing
sidebar_label: "Payment & Billing"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide details the available ways for you to subscribe to our services on Zilliz Cloud with relevant notes on invoice management | Cloud"
type: origin
token: FmkCwm1QHitB7uk9U9ncLnHrnse
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - payment
  - billing
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';


# Payment & Billing

This guide details the available ways for you to subscribe to our services on Zilliz Cloud with relevant notes on invoice management

## Overview\{#overview}

<Admonition type="info" icon="📘" title="Note">

<p>In order to manage payment and billing, you need to be an <strong>Organization Owner</strong>.</p>

</Admonition>

### Payment options\{#payment-options}

<table>
   <tr>
     <th><p><strong>Payment method</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Credits</p></td>
     <td><p>You earn credits upon registration or by participating in Zilliz Cloud events, etc. Credits can be used to cover the expenses of using Zilliz Cloud services.</p></td>
   </tr>
   <tr>
     <td><p>Credit card</p></td>
     <td><p>You receive a monthly invoice for your usage on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p>AWS Marketplace subscription</p></td>
     <td><p>You receive invoices for your Zilliz Cloud usage through the AWS Marketplace. </p><p>You can subscribe to our service in AWS Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters.</p></td>
   </tr>
   <tr>
     <td><p>GCP Marketplace subscription</p></td>
     <td><p>You receive invoices for your Zilliz Cloud usage through the GCP Marketplace.</p><p>You can subscribe to our service in GCP Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters.</p></td>
   </tr>
   <tr>
     <td><p>Azure Marketplace subscription</p></td>
     <td><p>You receive invoices for your Zilliz Cloud usage through the Azure Marketplace.</p><p>You can subscribe to our service in Azure Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters.</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay</p></td>
     <td><p>You prepay a sum of funds for Zilliz Cloud services.</p></td>
   </tr>
</table>

Credits and Advance Pay can be combined with either a credit card or a Marketplace subscription (AWS/GCP/Azure). However, it is not possible to set both a credit card and a Marketplace subscription simultaneously.

<Admonition type="info" icon="📘" title="Note">

<p>The Marketplace subscription is only a payment method and does not affect the cloud service provider when creating a cluster. For example, even after subscribing through AWS Marketplace, you can still <a href="./create-cluster">create</a> clusters on GCP, Azure, or AWS.</p>

</Admonition>

### Payment method priority\{#payment-method-priority}

If multiple payment methods are in use, their priority is as follows:

1. Credits

1. Advance Pay funds

1. Credit card / AWS Marketplace subscription / GCP Marketplace subscription / Azure Marketplace subscription.

**Example:** For a $500 unpaid bill, with $100 in credits and $200 in Advance Pay funds available, plus a linked credit card:

- The $100 credits are used first, reducing the bill to $400.

- Then, the $200 Advance Pay funds are applied, bringing the balance down to $200.

- Finally, the remaining $200 is charged to the linked credit card.

### Switching payment methods\{#switching-payment-methods}

Zilliz Cloud offers flexibility in switching between different payment methods:

#### From credit card to Marketplace subscription\{#from-credit-card-to-marketplace-subscription}

- Subscribe directly on the [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) or [Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) Marketplace.

- No need to manually remove your credit card.

- Successful Marketplace subscription automatically updates the payment method.

#### From Marketplace subscription to credit card\{#from-marketplace-subscription-to-credit-card}

- Unsubscribe manually from the original [AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) or [GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription) or [Azure](./subscribe-on-azure-marketplace) Marketplace.

- [Add your credit card](./subscribe-by-adding-credit-card) on the Zilliz Cloud web console.

#### Between Marketplace subscriptions\{#between-marketplace-subscriptions}

- Unsubscribe from the current Marketplace.

- Resubscribe using the new [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) or [Azure](./subscribe-on-azure-marketplace) Marketplace account.

## Marketplace Pricing Terms\{#marketplace-pricing-terms}

You can subscribe to Zilliz Cloud services on [AWS](./subscribe-on-aws-marketplace), [GPC](./subscribe-on-gcp-marketplace), or [Azure](./subscribe-on-azure-marketplace) Marketplace and then create a cluster deployed on the [supported cloud providers](./cloud-providers-and-regions).

The pricing varies across cloud providers, regions, and cluster plans. Refer to [Zilliz Cloud Pricing](https://zilliz.com/pricing) for more information.

Using the pricing information, if you have deployed a Zilliz Cloud cluster in the **Standard Plan** with one performance-optimized CU in AWS-us-east-1 (Virginia), you will be charged via your Marketplace subscription  $0.159/hour.

## Related topics\{#related-topics}

To learn more about subscribing to Zilliz Cloud using different payment methods and viewing your invoices, please refer to the following topics.



import DocCardList from '@theme/DocCardList';

<DocCardList />