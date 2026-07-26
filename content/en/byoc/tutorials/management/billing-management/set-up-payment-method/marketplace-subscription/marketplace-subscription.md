---
title: "Marketplace Subscription | BYOC"
slug: /marketplace-subscription
sidebar_label: "Marketplace Subscription"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can subscribe to Zilliz Cloud through supported cloud marketplaces and receive Zilliz Cloud charges through your existing cloud billing account. | BYOC"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Marketplace Subscription

You can subscribe to Zilliz Cloud through supported cloud marketplaces and receive Zilliz Cloud charges through your existing cloud billing account.

<Admonition type="info" icon="📘" title="📘 Note">

To manage payment method and subscriptions, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

Zilliz Cloud supports subscriptions through the following marketplaces:

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## Subscription options\{#subscription-options}

Each marketplace may support multiple subscription options:

- Marketplace Free trial

- Marketplace Public offer

- Marketplace Private offer

The following table compares the subscription options.

| **Subscription option** | **Description** | **Best for** | **Commercial terms** | **Availability** |
| --- | --- | --- | --- | --- |
| Marketplace Free Trial | A trial subscription that lets you evaluate Zilliz Cloud through a cloud marketplace before moving to a paid subscription. | Initial evaluation and short-term testing. | Free trial for 30 days. Once the free trial ends, you need to [upgrade](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription) to a paid subscription. | Available only for Zilliz Cloud **SaaS** deployments through **AWS** Marketplace. |
| Marketplace Public Offer | The standard Zilliz Cloud listing available on a cloud marketplace. | Self-service subscription with standard pricing and terms. | Uses the public pricing, contract terms, and billing rules shown on the marketplace listing page. | Available only for Zilliz Cloud **SaaS** deployments through **AWS, Google Cloud, Mircosoft** Marketplace. |
| Marketplace Private Offer | A custom offer created by Zilliz for your organization. | Enterprise procurement, discounts, committed spend, custom terms, or BYOC purchases. | Can include negotiated pricing, custom contract duration, payment schedule, and other commercial terms. | Available for both Zilliz Cloud **SaaS** and **BYOC** deployments through **AWS, Google Cloud, Mircosoft** Marketplace. |

<Admonition type="info" icon="📘" title="**Note**">

An AWS Marketplace Free Trial is started and managed through AWS Marketplace.If you upgrade after the trial, future charges are billed through AWS Marketplace. This option is suitable for teams that want procurement and billing through AWS Marketplace.

A Zilliz Cloud Free Trial is started directly from the Zilliz Cloud console and is managed within Zilliz Cloud. After the trial, you can choose to add a supported [payment method](./undefined). This option is suitable for users who want to try Zilliz Cloud directly before setting up external billing.

</Admonition>

## Considerations\{#considerations}

A Marketplace subscription is only a payment method. It does not determine the cloud provider where you create projects, clusters, and relevant resources. For example, after subscribing through AWS Marketplace, you can still create Zilliz Cloud projects and clusters on AWS, Google Cloud, or Azure, as long as the selected cloud provider and region are supported.

import DocCardList from '@theme/DocCardList';

<DocCardList />