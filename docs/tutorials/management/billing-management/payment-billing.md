---
title: "Payment and Billing Overview | Cloud"
slug: /payment-billing
sidebar_label: "Payment and Billing Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains the payment methods available for Zilliz Cloud, how payment priority works, and what to consider when managing invoices and subscriptions. | Cloud"
type: origin
token: C0VRwRCs2iwEoUkgmq1cXCChnlh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - payment
  - billing
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Payment and Billing Overview

This guide explains the payment methods available for Zilliz Cloud, how payment priority works, and what to consider when managing invoices and subscriptions.

<Admonition type="info" icon="📘" title="Note">

<p>To manage payment and billing settings, you must be an <strong>Organization Owner</strong> or <strong>Organization Billing Admin</strong>.</p>

</Admonition>

## Payment methods\{#payment-methods}

The following table explains the payment methods available on Zilliz Cloud and whether each method is supported for SaaS and BYOC deployments.

<table>
   <tr>
     <th colspan="2"><p><strong>Payment method</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>SaaS</strong></p></th>
     <th><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Credits</p></td>
     <td><p>Credits are granted when you register for Zilliz Cloud or participate in eligible Zilliz Cloud programs or events. </p><p>Credits can be used to cover Zilliz Cloud usage charges.</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Credit card</p></td>
     <td><p>You are charged by credit card based on your Zilliz Cloud usage. Invoices are generated monthly.</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>You prepay funds for Zilliz Cloud services. Usage charges are deducted from your Advance Pay balance.</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace subscription</p></td>
     <td><p>Free Trial</p></td>
     <td rowspan="3"><p>You receive invoices for Zilliz Cloud usage through AWS Marketplace.</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Public Offer</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>GCP Marketplace subscription</p></td>
     <td><p>Public Offer</p></td>
     <td rowspan="2"><p>You receive invoices for Zilliz Cloud usage through Google Cloud Marketplace.</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Microsoft Marketplace subscription</p></td>
     <td><p>Public Offer</p></td>
     <td rowspan="2"><p>You receive invoices for Zilliz Cloud usage through Microsoft Marketplace.</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

Credits and Advance Pay can be used together with either a credit card or a Marketplace subscription. However, you cannot use a credit card and a Marketplace subscription at the same time.

A Marketplace subscription is only a payment method. It does not determine the cloud provider where you create projects, clusters, and relevant resources. For example, after subscribing through AWS Marketplace, you can still create Zilliz Cloud projects and clusters on AWS, Google Cloud, or Azure, as long as the selected cloud provider and region are supported.

## Payment method priority\{#payment-method-priority}

If multiple payment methods or balances are available, Zilliz Cloud applies them in the following order:

1. Credits

1. Advance Pay balance

1. Credit card or Marketplace subscription

For example, suppose you have a &#36;500 unpaid bill, &#36;100 in credits, &#36;200 in Advance Pay balance, and a linked AWS Marketplace subscription.

- Zilliz Cloud applies the &#36;100 credits first, reducing the unpaid amount to &#36;400.

- Zilliz Cloud then applies the &#36;200 Advance Pay balance, reducing the unpaid amount to &#36;200.

- The remaining &#36;200 is charged to the AWS Marketplace subscription.

## Marketplace subscription\{#marketplace-subscription}

You can subscribe to Zilliz Cloud through the following marketplaces:

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace subscriptions let your organization receive Zilliz Cloud charges through your cloud marketplace billing account. This is useful when your finance or procurement team wants Zilliz Cloud usage to appear on an existing cloud bill.

Marketplace pricing can vary by cloud provider, region, cluster type, and cluster plan. For detailed pricing, see [Zilliz Cloud Pricing](https://zilliz.com/pricing).

## Roles and permissions\{#roles-and-permissions}

Payment and billing settings are managed at the organization level. To view or update billing information, you must have the required organization-level permissions.

<table>
   <tr>
     <th><p><strong>Role</strong></p></th>
     <th><p><strong>Billing Permissions</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization Owner</p></td>
     <td><p>Can manage payment methods, billing profiles, Marketplace subscriptions, invoices, and billing alerts.</p></td>
   </tr>
   <tr>
     <td><p>Organization Billing Admin</p></td>
     <td><p>Can manage payment methods, billing profiles, Marketplace subscriptions, invoices, and billing alerts.</p></td>
   </tr>
   <tr>
     <td><p>Other Organization Roles</p></td>
     <td><p>Have no access to billing information. To view or update billing settings, contact Organization Owner or Organization Billing Admin.</p></td>
   </tr>
</table>

For details, see [Manage Organization Users](./organization-users).

## Billing cycle and invoices\{#billing-cycle-and-invoices}

Zilliz Cloud calculates usage charges based on the resources and services used during each billing period. Charges may include cluster usage, storage, data operations, and other billable features depending on your deployment mode, cluster type, region, and enabled services.

If you choose credit card as the payment method, Zilliz Cloud generates monthly invoices for your organization. For details about how to interpret your invoices, see [Understand Invoices](./view-invoice).

If you choose to subscribe on Marketplace, invoices are issued by the corresponding cloud marketplace, but usage details may still be available in Zilliz Cloud for review and reconciliation.

If you have questions about the billing cycle, [contact sales](http://zilliz.com/contact-sales).

## Billing status and service impact\{#billing-status-and-service-impact}

Your organization’s billing status determines whether you can continue using paid Zilliz Cloud features and resources.

- If your organization has valid credits, an Advance Pay balance, a credit card, or an active Marketplace subscription, usage can continue according to your plan and payment terms.

- If no valid payment method or remaining balance is available, your organization may have overdue invoices, lose access to advanced features, and become frozen. To avoid service interruption:

    - Monitor credit expiration and remaining credit balance.

    - Keep your credit card up to date.

    - Refill Advance Pay balance before it runs out.

    - Renew or update Marketplace subscriptions before they expire.

    - Configure billing alerts to detect payment or usage risks early.

If your organization is frozen or payment fails, update your payment method to restore access. For details, see [Failed Payments ](./failed-payments-organization-recovery)

## Related topics\{#related-topics}

- [Set Up Payment Method](./set-up-payment-method)

- [Update Payment Method](./update-payment-method)

- [Update Billing Profile](./update-billing-profile)

- [Understand Invoices](./view-invoice)

- [Manage Invoices](./manage-invoice)

- [Failed Payments ](./failed-payments-organization-recovery)

- [Separate Billing by Marketplace Account](./separate-billing-by-marketplace-account)

- [Monitor Billing Alerts](./monitor-billing-alerts)

