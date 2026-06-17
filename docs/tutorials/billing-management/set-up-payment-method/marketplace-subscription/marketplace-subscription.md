---
title: "Marketplace Subscription | Cloud"
slug: /marketplace-subscription
sidebar_key: marketplace-subscription
sidebar_label: "Marketplace Subscription"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "You can subscribe to Zilliz Cloud through supported cloud marketplaces and receive Zilliz Cloud charges through your existing cloud billing account. | Cloud"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace subscription
  - AWS
  - Google Cloud
  - Microsoft
  - Marketplace

---

import Admonition from '@theme/Admonition';


# Marketplace Subscription

You can subscribe to Zilliz Cloud through supported cloud marketplaces and receive Zilliz Cloud charges through your existing cloud billing account.

<Admonition type="info" icon="📘" title="Note">

<p>To manage payment method and subscriptions, you must be an <strong>Organization Owner</strong> or <strong>Organization Billing Admin</strong>.</p>

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

<table>
   <tr>
     <th><p><strong>Subscription option</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Best for</strong></p></th>
     <th><p><strong>Commercial terms</strong></p></th>
     <th><p><strong>Availability</strong></p></th>
   </tr>
   <tr>
     <td><p>Marketplace Free Trial</p></td>
     <td><p>A trial subscription that lets you evaluate Zilliz Cloud through a cloud marketplace before moving to a paid subscription.</p></td>
     <td><p>Initial evaluation and short-term testing.</p></td>
     <td><p>Free trial for 30 days. Once the free trial ends, you need to <a href="./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription">upgrade</a> to a paid subscription.</p></td>
     <td><p>Available only for Zilliz Cloud <strong>SaaS</strong> deployments through <strong>AWS</strong> Marketplace.</p></td>
   </tr>
   <tr>
     <td><p>Marketplace Public Offer</p></td>
     <td><p>The standard Zilliz Cloud listing available on a cloud marketplace.</p></td>
     <td><p>Self-service subscription with standard pricing and terms.</p></td>
     <td><p>Uses the public pricing, contract terms, and billing rules shown on the marketplace listing page.</p></td>
     <td><p>Available only for Zilliz Cloud <strong>SaaS</strong> deployments through <strong>AWS, Google Cloud, Mircosoft</strong> Marketplace.</p></td>
   </tr>
   <tr>
     <td><p>Marketplace Private Offer</p></td>
     <td><p>A custom offer created by Zilliz for your organization.</p></td>
     <td><p>Enterprise procurement, discounts, committed spend, custom terms, or BYOC purchases.</p></td>
     <td><p>Can include negotiated pricing, custom contract duration, payment schedule, and other commercial terms.</p></td>
     <td><p>Available for both Zilliz Cloud <strong>SaaS</strong> and <strong>BYOC</strong> deployments through <strong>AWS, Google Cloud, Mircosoft</strong> Marketplace.</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="**Note**">

<p>An AWS Marketplace Free Trial is started and managed through AWS Marketplace.If you upgrade after the trial, future charges are billed through AWS Marketplace. This option is suitable for teams that want procurement and billing through AWS Marketplace.</p>
<p>A Zilliz Cloud Free Trial is started directly from the Zilliz Cloud console and is managed within Zilliz Cloud. After the trial, you can choose to add a supported <a href="./set-up-payment-method">payment method</a>. This option is suitable for users who want to try Zilliz Cloud directly before setting up external billing.</p>

</Admonition>

## Considerations\{#considerations}

A Marketplace subscription is only a payment method. It does not determine the cloud provider where you create projects, clusters, and relevant resources. For example, after subscribing through AWS Marketplace, you can still create Zilliz Cloud projects and clusters on AWS, Google Cloud, or Azure, as long as the selected cloud provider and region are supported.

import DocCardList from '@theme/DocCardList';

<DocCardList />