---
title: "Monitor Billing Alerts | Cloud"
slug: /monitor-billing-alerts
sidebar_label: "Monitor Billing Alerts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Monitor billing alerts to track recent usage, credit status, payment method validity, and prepaid balance for your Zilliz Cloud organization. These alerts help you detect unexpected spend and update payment methods in time to reduce the risk of service interruption. | Cloud"
type: origin
token: V7qxwH6n4irO3zkGABXcksTLnFc
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Monitor Billing Alerts

Monitor billing alerts to track recent usage, credit status, payment method validity, and prepaid balance for your Zilliz Cloud organization. These alerts help you detect unexpected spend and update payment methods in time to reduce the risk of service interruption.

This guide explains billing-related alerts. To learn how to configure billing alerts, see [Manage Organization Alerts](./manage-organization-alerts).

<Admonition type="info" icon="📘" title="**Note**">

To view or manage billing alerts, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

## Billing alert metrics\{#billing-alert-metrics}

Zilliz Cloud provides the following billing alert metrics.

| **Metric** | **Description** | **Recommended action** |
| --- | --- | --- |
| Usage Amount in the Past Day ($) | Cumulative usage charges over the past day. | Compare usage against your budget. If usage is higher than expected, review recent activity and optimize workloads or adjust the budget as needed. |
| Credit Validity (days) | Number of days before free credits expire. | Use eligible credits before they expire, or [contact sales](http://zilliz.com/contact-sales) if you need help with credit validity. |
| Remaining Credits ($) | Remaining balance of free credits. | [Set up another payment method](./undefined) before credits run out to avoid service interruption. |
| Credit Card Validity (days) | Number of days before the saved credit card expires. | [Replace the credit card](./subscribe-by-adding-credit-card#replace-a-credit-card) before expiry to avoid payment failures. |
| Advance Pay Balance ($) | Remaining prepaid Advance Pay balance. | [Add funds](./advance-pay#add-funds-to-advance-pay) when the balance is low to prevent payment issues or service interruption. |

## **Recommended alerts**\{#recommended-alerts}

Configure alerts based on your organization’s payment method and usage pattern.

<table>
   <tr>
     <th><p><strong>Payment setup</strong></p></th>
     <th><p><strong>Recommended alerts</strong></p></th>
   </tr>
   <tr>
     <td><p>Free credits only</p></td>
     <td><ul><li><p>Credit Validity</p></li><li><p>Remaining Credits</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Credit card</p></td>
     <td><ul><li><p>Credit Card Validity</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Advance Pay</p></td>
     <td><ul><li><p>Advance Pay Balance</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Marketplace subscription</p></td>
     <td><ul><li>Usage Amount in the Past Day</li></ul></td>
   </tr>
   <tr>
     <td><p>Credits + paid payment method</p></td>
     <td><ul><li><p>Credit Validity</p></li><li><p>Remaining Credits</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
</table>

## Best practices\{#best-practices}

- Set usage alerts based on your expected daily spend.

- Monitor remaining credits during tests or PoCs. [Contact sales](http://zilliz.com/contact-sales) if you need to apply for more credits.

- Monitor credit card validity or Advance Pay balance and update your payment method timely to prevent service interruption.

