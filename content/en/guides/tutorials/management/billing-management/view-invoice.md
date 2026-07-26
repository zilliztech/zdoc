---
title: "Understand Invoices | Cloud"
slug: /view-invoice
sidebar_label: "Understand Invoices"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud charges at the organization level. | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Understand Invoices

Zilliz Cloud charges at the organization level. 

To access invoices, you must have either **Organization Owner** or **Organization Billing Admin** permissions.

<Admonition type="info" icon="📘" title="📘 Notes">

If you subscribe on Marketplace, you will receive invoices for your Zilliz Cloud usage through the Marketplace. 

</Admonition>

Each invoice is composed of several key components. This section will walk through an example invoice to help you understand each element.

![example-invoice](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/example-invoice.png "example-invoice")

## Billing cycle\{#billing-cycle}

The billing cycle, displayed at the top of your invoice, shows the period during which charges are calculated, along with the payment due date.

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **Billing Cycle:** Typically a month-long period starting at 00:00:00 (UTC) on the first day of the previous month and ending at 23:59:59 (UTC) on the last day of that month. For example, Zilliz Cloud issues the invoice for August on September 1, 2024, with the billing period running from August 1, 2024, at 00:00:00 (UTC) to August 31, 2024, at 23:59:59 (UTC). Charges accumulate for your usage throughout this period and your invoice status remains “**unbilled**”.

- **Data of Issue:** The date your invoice is generated. On this day, the invoice status changes to “**unpaid**,” and payment can be made. If you have added a payment method (e.g., credit card or marketplace subscription), it will be charged automatically. Upon successful payment, the invoice status updates to “**paid**”. In case of a failed payment, notification emails will be sent to the **Organization Owner(s)** and **Billing Admin(s)**.

- **Due Date:** The final day to make your payment.  If payment is not received by this date, your invoice enters the **Grace Period**.

- **Grace Period:** A 14-day window during which payments can still be made. During this time, daily email reminders are sent, and the invoice status remains “**unpaid**” until successful payment.

- **Overdue Date:** If the payment remains unpaid, the invoice status becomes “**overdue**”. It is recommended to pay promptly, as your organization may be frozen the next day. Without payment within one day of freezing, all clusters (Serverless and Dedicated) will be automatically moved to [recycle bin](./use-recycle-bin) and will be retained there for 30 days.

## Invoice status\{#invoice-status}

In Zilliz Cloud, invoice statuses represent different stages in the payment process. The following table explains each possible status:

| **Status** | **Definition** |
| --- | --- |
| **Unbilled** | Transactions that occur after the billing cycle but before the statement is generated. These amounts are not immediately due but will be included in the next billing cycle. |
| **Unpaid** | The invoice is billed and is within the due timeframe. |
| **Overdue** | The invoice is billed but not paid within the due timeframe. |
| **Paid** | Payment has been completed with no outstanding amounts. |
| **Free** | All amounts due are paid with credits. |

## Invoice summary\{#invoice-summary}

The summary section provides a high-level overview of the charges on your invoice.

- **Usage Amount:** The monthly total for all billable items (including CU, storage, backup, pipelines, and read and write costs).

- **Credits:** Any credits applied toward the payment.

- **Subtotal:** Subtotal = Usage Amount - Credits.

- **Tax:** Tax = Subtotal x Tax rate. Tax rates are based on the country in your billing address.

- **Total Amount:** Total Amount = Subtotal + Tax.

- **Advance Pay:** The amount of Advance Pay used to offset the payment.

- **Amount Due/Amount Paid:** The final amount you need to pay or have paid.

>