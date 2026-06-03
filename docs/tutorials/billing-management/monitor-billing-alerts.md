---
title: "Monitor Billing Alerts | Cloud"
slug: /monitor-billing-alerts
sidebar_key: monitor-billing-alerts
sidebar_label: "Monitor Billing Alerts"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Monitor billing alerts to track recent usage, credit status, payment method validity, and prepaid balance for your Zilliz Cloud organization. These alerts help you detect unexpected spend and update payment methods in time to reduce the risk of service interruption. | Cloud"
type: origin
token: XCZaw6aKbixxWIkMssEchOtOnlg
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - usage
  - monitor
  - billing alerts

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

<table>
   <tr>
     <th><p><strong>Metric</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Recommended action</strong></p></th>
   </tr>
   <tr>
     <td><p>Usage Amount in the Past Day ($)</p></td>
     <td><p>Cumulative usage charges over the past day.</p></td>
     <td><p>Compare usage against your budget. If usage is higher than expected, review recent activity and <a href="./cost-optimization">optimize workloads</a> or adjust the budget as needed.</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity (days)</p></td>
     <td><p>Number of days before free credits expire.</p></td>
     <td><p>Use eligible credits before they expire, or <a href="http://zilliz.com/contact-sales">contact sales</a> if you need help with credit validity.</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits ($)</p></td>
     <td><p>Remaining balance of free credits.</p></td>
     <td><p><a href="./set-up-payment-method">Set up another payment method</a> before credits run out to avoid service interruption.</p></td>
   </tr>
   <tr>
     <td><p>Credit Card Validity (days)</p></td>
     <td><p>Number of days before the saved credit card expires.</p></td>
     <td><p><a href="./subscribe-by-adding-credit-card#replace-a-credit-card">Replace the credit card</a> before expiry to avoid payment failures.</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay Balance ($)</p></td>
     <td><p>Remaining prepaid Advance Pay balance.</p></td>
     <td><p><a href="./advance-pay#add-funds-to-advance-pay">Add funds</a> when the balance is low to prevent payment issues or service interruption.</p></td>
   </tr>
</table>

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

