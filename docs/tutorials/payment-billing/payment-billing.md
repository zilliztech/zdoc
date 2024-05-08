---
slug: /payment-billing
beta: FALSE
notebook: FALSE
type: origin
token: FmkCwm1QHitB7uk9U9ncLnHrnse
sidebar_position: 15
---

import Admonition from '@theme/Admonition';


# Payment & Billing

This guide details the available ways for you to subscribe to our services on Zilliz Cloud with relevant notes on invoice management

## Overview{#overview}

<Admonition type="info" icon="📘" title="Notes">

<p>In order to manage payment and billing, you need to be an <strong>Organization Owner</strong>.</p>

</Admonition>

### Payment options{#payment-options}

|  __Payment method__             |  __Description__                                                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  Credits                        |  You earn credits upon registration or by participating in Zilliz Cloud events, etc. Credits can be used to cover the expenses of using Zilliz Cloud services.                                                            |
|  Credit card                    |  You receive a monthly invoice for your usage on Zilliz Cloud.                                                                                                                                                            |
|  AWS Marketplace subscription   |  You receive invoices for your Zilliz Cloud usage through the AWS Marketplace. <br/> You can subscribe to our service in AWS Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters.    |
|  GCP Marketplace subscription   |  You receive invoices for your Zilliz Cloud usage through the GCP Marketplace.<br/> You can subscribe to our service in GCP Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters.     |
|  Azure Marketplace subscription |  You receive invoices for your Zilliz Cloud usage through the Azure Marketplace.<br/> You can subscribe to our service in Azure Marketplace and choose among AWS, GCP, and Azure to create your Zilliz Cloud clusters. |
|  Advance Pay                    |  You prepay a sum of funds for Zilliz Cloud services.                                                                                                                                                                     |

Credits and Advance Pay can be combined with either a credit card or a Marketplace subscription (AWS/GCP/Azure). However, it is not possible to set both a credit card and a Marketplace subscription simultaneously.

<Admonition type="info" icon="📘" title="Notes">

<p>The Marketplace subscription is only a payment method and does not affect the cloud service provider when creating a cluster. For example, even after subscribing through AWS Marketplace, you can still <a href="./create-cluster">create</a> clusters on GCP, Azure, or AWS.</p>

</Admonition>

### Payment method priority{#payment-method-priority}

If multiple payment methods are in use, their priority is as follows:

1. Credits

1. Advance Pay funds

1. Credit card / AWS Marketplace subscription / GCP Marketplace subscription / Azure Marketplace subscription.

__Example:__ For a $500 unpaid bill, with $100 in credits and $200 in Advance Pay funds available, plus a linked credit card:

- The $100 credits are used first, reducing the bill to $400.

- Then, the $200 Advance Pay funds are applied, bringing the balance down to $200.

- Finally, the remaining $200 is charged to the linked credit card.

### Switching payment methods{#switching-payment-methods}

Zilliz Cloud offers flexibility in switching between different payment methods:

#### From credit card to Marketplace subscription{#from-credit-card-to-marketplace-subscription}

- Subscribe directly on the [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) or [Azure](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) Marketplace.

- No need to manually remove your credit card.

- Successful Marketplace subscription automatically updates the payment method.

#### From Marketplace subscription to credit card{#from-marketplace-subscription-to-credit-card}

- Unsubscribe manually from the original [AWS](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) or [GCP](./subscribe-on-gcp-marketplace#cancel-gcp-marketplace-subscription) or [Azure](./subscribe-on-azure-marketplace) Marketplace.

- [Add your credit card](./subscribe-by-adding-credit-card) on the Zilliz Cloud web console.

#### Between Marketplace subscriptions{#between-marketplace-subscriptions}

- Unsubscribe from the current Marketplace.

- Resubscribe using the new [AWS](./subscribe-on-aws-marketplace) or [GCP](./subscribe-on-gcp-marketplace) or [Azure](./subscribe-on-azure-marketplace) Marketplace account.

## Marketplace Pricing Terms{#marketplace-pricing-terms}

You can subscribe to Zilliz Cloud services on [AWS](./subscribe-on-aws-marketplace), [GPC](./subscribe-on-gcp-marketplace), or [Azure](./subscribe-on-azure-marketplace) Marketplace and then create a cluster deployed on the [supported cloud providers](./cloud-providers-and-regions).

- Zilliz Cloud Standard Plan

    |  __Unit/Count__                                        |  __Cost per unit or count__ |
    | ------------------------------------------------------ | --------------------------- |
    |  1 AWS performance-optimized CU per hour as one unit   |  $0.159                     |
    |  1 AWS capacity-optimized CU per hour as one unit      |  $0.159                     |
    |  1 GB for storage on AWS per month as one unit         |  $0.025                     |
    |  1 GB for backup service on AWS as one unit            |  $0.025                     |
    |  1 GCP performance-optimized CU per hour as one unit   |  $0.137                     |
    |  1 GCP capacity-optimized CU per hour as one unit      |  $0.137                     |
    |  1 GB for storage on GCP per month as one unit         |  $0.02                      |
    |  1 GB for backup service on GCP as one unit            |  $0.02                      |
    |  1 Azure performance-optimized CU per hour as one unit |  $0.159                     |
    |  1 Azure capacity-optimized CU per hour as one unit    |  $0.159                     |
    |  1 GB for storage on Azure per month as one unit       |  $0.025                     |
    |  1 GB for backup service on Azure as one unit          |  $0.025                     |

- Zilliz Cloud Enterprise Plan

    |  __Unit/Count__                                        |  __Cost per unit or count__ |
    | ------------------------------------------------------ | --------------------------- |
    |  1 AWS performance-optimized CU per hour as one unit   |  $0.248                     |
    |  1 AWS capacity-optimized CU per hour as one unit      |  $0.248                     |
    |  1 GB for storage on AWS per month as one unit         |  $0.025                     |
    |  1 GB for backup service on AWS as one unit            |  $0.025                     |
    |  1 GCP performance-optimized CU per hour as one unit   |  $0.215                     |
    |  1 GCP capacity-optimized CU per hour as one unit      |  $0.215                     |
    |  1 GB for storage on GCP per month as one unit         |  $0.02                      |
    |  1 GB for backup service on GCP as one unit            |  $0.02                      |
    |  1 Azure performance-optimized CU per hour as one unit |  $0.248                     |
    |  1 Azure capacity-optimized CU per hour as one unit    |  $0.248                     |
    |  1 GB for storage on Azure per month as one unit       |  $0.025                     |
    |  1 GB for backup service on Azure as one unit          |  $0.025                     |

Using the above table, if you have deployed a Zilliz Cloud cluster in the __Standard Plan__ with one performance-optimized CU on AWS, you will be charged via your Marketplace subscription 159 units per hour, that is $0.159/hour.

## Related topics{#related-topics}

To learn more about subscribing to Zilliz Cloud using different payment methods and viewing your invoices, please refer to the following topics.



import DocCardList from '@theme/DocCardList';

<DocCardList />