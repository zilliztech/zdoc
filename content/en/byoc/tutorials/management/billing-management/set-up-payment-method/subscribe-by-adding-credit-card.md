---
title: "Credit Card | BYOC"
slug: /subscribe-by-adding-credit-card
sidebar_label: "Credit Card"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides comprehensive instructions on how to add a payment credit card for your organization on Zilliz Cloud. | BYOC"
type: origin
token: TVnkwXupUiX3zDkzYPWcxKP3nvg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Credit Card

This guide provides comprehensive instructions on how to add a payment credit card for your organization on Zilliz Cloud.

<Admonition type="info" icon="📘" title="📘 Note">

- **Taxation:** Taxes on the invoices are calculated based on the billing address you provide. For companies that require to enter VAT or GST ID, please [contact us](http://support.zilliz.com).

- **Access Control**: To manage payment method, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

## Add a credit card\{#add-a-credit-card}

<Supademo id="cmpf2ubt32ddyqm8qp3nfrb56" title=""  />

<Procedures>

1. Navigate to **Billing**.

1. Click on **+ Add Payment Method**.

1. Select **Credit Card**.

1. Provide card and billing information.

    - Credit Card Information:

        - **Card number**

        - **Expiration**

        - **CVC**

    - Billing Information:

        - **First Name**

        - **Last Name**

        - **Company Name**

        - **Email**

        - **Street Address**

            We recommend using your company address. This address will be used to calculate tax and will appear on all issued invoices.

        - **Country / Region**

        - **State / Province**

        - **City**

        - **ZIP/Postal Code**

1. Click **Add**.

</Procedures>

## Replace a credit card\{#replace-a-credit-card}

When your credit card approaches its expiration date, you can choose to replace your existing card or switch to a [Marketplace subscription](./undefined).

The following demo shows how to replace your existing credit card to a new card.

<Supademo id="cmpf3fm4q2ehaqm8q8j5jx188" title=""  />

<Procedures>

1. Navigate to **Billing**.

1. Click on **Replace** next to your credit card.

1. Provide the information of your new credit card.

    - **Card number**

    - **Expiration**

    - **CVC**

1. Click **Replace**.

</Procedures>

## Switch to Marketplace subscription\{#switch-to-marketplace-subscription}

If you want to transition from a credit card payment method to a Marketplace subscription, subscribe on the corresponding Marketplace directly. 

Upon successful subscription, your existing credit card information will be automatically replaced. You can verify the update in the **Payment Method** section on the **Billing Overview** page.

<Admonition type="info" icon="📘" title="📘 Note">

Please allow a few minutes for the billing overview to reflect the chnges.

</Admonition>

For details about Marketplace subscription see [Marketplace Subscription](./undefined).

For details about updating a payment method, see [Update Payment Method](./update-payment-method).

## Set monitor for credit card expiration\{#set-monitor-for-credit-card-expiration}

By default, monitoring for credit card expiration is disabled. However, you can enable it to receive notifications when your credit card will expire in 7 or 30 days. For more information, refer to [Manage Organization Alerts](./manage-organization-alerts). 

## Remove credit card\{#remove-credit-card}

Currently, Zilliz Cloud does not support removing payment credit card on the web console. Should you need to remove a linked credit card, please contact us and submit a ticket at the Zilliz Cloud [support portal](https://support.zilliz.com/hc/en-us).