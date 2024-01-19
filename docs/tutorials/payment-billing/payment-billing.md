---
slug: /payment-billing
beta: false
notebook: false
token: FmkCwm1QHitB7uk9U9ncLnHrnse
sidebar_position: 14
---

import Admonition from '@theme/Admonition';


# Payment & Billing

This guide details the available ways for you to subscribe to our services on Zilliz Cloud with relevant notes on invoice management

<Admonition type="info" icon="📘" title="Notes">

In order to manage payment and billing, you need to be an **Organization Owner**.

</Admonition>

## Payment options{#payment-options}

|  **Payment method**           |  **Description**                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  Credits                      |  You earn credits upon registration or by participating in Zilliz Cloud events, etc. Credits can be used to cover the expenses of using Zilliz Cloud services.  |
|  Credit card                  |  You receive a monthly invoice for your usage on Zilliz Cloud.                                                                                                  |
|  AWS Marketplace subscription |  You receive invoices for your Zilliz Cloud usage through the AWS Marketplace.                                                                                  |
|  GCP Marketplace subscription |  You receive invoices for your Zilliz Cloud usage through the GCP Marketplace.                                                                                  |
|  Advance Pay                  |  You prepay a sum of funds for Zilliz Cloud services.                                                                                                           |

<Admonition type="info" icon="📘" title="Notes">

Credits and Advance Pay can be combined with either a credit card or a Marketplace subscription (AWS/GCP). However, it is not possible to set both a credit card and a Marketplace subscription simultaneously.

</Admonition>

## Payment method priority{#payment-method-priority}

If multiple payment methods are in use, their priority is as follows:

1. Credits

1. Advance Pay funds

1. Credit card / AWS Marketplace subscription / GCP Marketplace subscription

**Example: **For a $500 unpaid bill, with $100 in credits and $200 in Advance Pay funds available, plus a linked credit card:

- The $100 credits are used first, reducing the bill to $400.

- Then, the $200 Advance Pay funds are applied, bringing the balance down to $200.

- Finally, the remaining $200 is charged to the linked credit card.

## Switching payment methods{#switching-payment-methods}

Zilliz Cloud offers flexibility in switching between different payment methods:

### From credit card to Marketplace subscription{#from-credit-card-to-marketplace-subscription}

- Subscribe directly on the [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) Marketplace.

- No need to manually remove your credit card.

- Successful Marketplace subscription automatically updates the payment method.

### From Marketplace subscription to credit card{#from-marketplace-subscription-to-credit-card}

- Unsubscribe manually from the original [AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) or [GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription) Marketplace.

- [Add your credit card](./subscribe-by-adding-credit-card) on the Zilliz Cloud web console.

### Between Marketplace subscriptions{#between-marketplace-subscriptions}

- Unsubscribe from the current Marketplace.

- Resubscribe using the new [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) Marketplace account.



import DocCardList from '@theme/DocCardList';

<DocCardList />