---
title: "Failed Payments and Organization Recovery | Cloud"
slug: /failed-payments-organization-recovery
sidebar_label: "Failed Payments and Organization Recovery"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Failed payments can affect your organization’s billing status and access to paid Zilliz Cloud features. This guide explains common causes of payment failure, what happens when payment cannot be completed, and how to restore your organization. | Cloud"
type: origin
token: JYXswRlj9i5KE5kJ2U0cdaM5nBh
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Failed Payments and Organization Recovery

Failed payments can affect your organization’s billing status and access to paid Zilliz Cloud features. This guide explains common causes of payment failure, what happens when payment cannot be completed, and how to restore your organization.

<Admonition type="info" icon="📘" title="**Note**">

To manage payment and billing settings, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

## Common causes for failed payments\{#common-causes-for-failed-payments}

A payment may fail for several reasons:

- The saved credit card has expired.

- The credit card is declined by the card issuer.

- The Advance Pay balance is insufficient.

- Credits have been used up or have expired.

- A Marketplace public offer subscription has expired, been canceled, or is no longer linked to the Zilliz Cloud organization.

- A Marketplace private offer subscription has expired and was not renewed.

- A Marketplace free trial subscription has expired and no other payment method is provided on Zilliz Cloud.

## Credit card interim charges\{#credit-card-interim-charges}

Zilliz Cloud SaaS invoices are generated monthly. However, for new organizations that add a credit card as their payment method for the first time, Zilliz Cloud may perform interim charges before the monthly invoice is issued.

Interim charges are triggered when accumulated usage first reaches certain billing thresholds, such as &#36;100 and &#36;1,000. After the interim charges at these thresholds are completed successfully, subsequent charges follow the regular monthly billing cycle.

These interim charges help establish billing reliability for new accounts and keep the organization in good standing during the billing cycle.

If an interim charge fails, your organization may be frozen immediately, even if the monthly billing cycle has not ended. To avoid service interruption, make sure your credit card is valid and has sufficient available balance.

## Service impact\{#service-impact}

If Zilliz Cloud cannot collect payment and no valid credits or Advance Pay balance are available, your organization will have overdue invoices and become frozen.

When an organization is frozen:

- Zilliz Cloud sends email notifications and provides a 15-day grace period for you to pay the overdue invoice. If the invoice remains unpaid after the grace period, your data and resources are moved to the recycle bin.

- Running services and advanced features may be restricted.

- You are unable to create new paid resources.

- Applications that depend on affected Zilliz Cloud resources may be interrupted.

- Backups are automatically deleted 60 days after the organization is frozen.

## Recover your organization\{#recover-your-organization}

To restore access, resolve the billing issue and make sure your organization has a valid payment method or available balance.

### If credits expired or ran out\{#if-credits-expired-or-ran-out}

<Procedures>

1. Add a valid payment method, such as a [credit card](./subscribe-by-adding-credit-card) or [Marketplace subscription](./marketplace-subscription).

1. If you are using [Advance Pay](./advance-pay), add funds to your balance.

1. Contact Zilliz [s](http://zilliz.com/contact-sales)[ales](http://zilliz.com/contact-sales) or your account team if you need help with credits.

</Procedures>

### If your credit card payment failed\{#if-your-credit-card-payment-failed}

<Procedures>

1. Go to the Zilliz Cloud console.

1. Open your organization.

1. Go to **Billing**.

1. [Replace](./subscribe-by-adding-credit-card#replace-a-credit-card) the credit card.

1. [Retry](./manage-invoice#pay-invoice) your payment. If you still cannot pay your overdue invoice, contact [Zilliz Support](http://support.zilliz.com).

</Procedures>

### If your Advance Pay balance is insufficient\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. Add funds to your [Advance Pay](./advance-pay) balance.

1. Confirm that the updated balance appears in the Billing page.

1. Contact [Zilliz Support](http://support.zilliz.com) if your organization remains frozen after the balance is updated.

</Procedures>

### If your Marketplace subscription expired or was canceled\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. Check your marketplace subscription.

    1. If your Marketplace **free trial** subscription has expired, [upgrade](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription) to a paid subscription.

    1. If your Marketplace **public offer** subscription was canceled, [subscribe](./subscribe-on-aws-marketplace) again or [switch to other payment method](./update-payment-method).

    1. If your Marketplace **private offer** subscription has expired, [renew](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer) your private offer or contact your account executive.

1. Verify the updated subscription in the **Payment Method** section on the Billing page.

1. [Retry](./manage-invoice#pay-invoice) your payment. If you still cannot pay your overdue invoice, contact [Zilliz Support](http://support.zilliz.com).

</Procedures>

## After recovering your organization\{#after-recovering-your-organization}

After your organization is unfrozen, data and resources that were moved to the recycle bin are not automatically restored.

To recover them, go to the [recycle bin](./use-recycle-bin) and manually restore the required data and resources. 

After restoration, verify that your applications can access the recovered resources as expected.

## Avoid payment issues\{#avoid-payment-issues}

To reduce the risk of service interruption:

- [Monitor](./monitor-billing-alerts) remaining credits and credit expiration.

- Keep your [credit card](./subscribe-by-adding-credit-card) up to date.

- Refill [Advance Pay](./advance-pay) before the balance runs out.

- Renew Marketplace [private offers](./subscribe-on-aws-marketplace-private-offer) before they expire.

- [Configure billing alerts](./monitor-billing-alerts) for usage, credits, card validity, and Advance Pay balance.

- Confirm that [Marketplace subscription](./marketplace-subscription)s are linked to the correct Zilliz Cloud organization.

- If your organization recently added a credit card for the first time, make sure the card has sufficient available balance for interim charges when accumulated usage first reaches billing thresholds.

