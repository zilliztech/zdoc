---
title: "Invoices | Cloud"
slug: /view-invoice
sidebar_label: "Invoices"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud charges at the organization level. To access invoices, you must have either Organization Owner or Billing Admin permissions. | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - invoice
  - view
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# Invoices

Zilliz Cloud charges at the organization level. To access invoices, you must have either **Organization Owner** or **Billing Admin** permissions.

This guide explains how to view, pay, and download invoices, as well as how to interpret your invoice details.

<Admonition type="info" icon="📘" title="Notes">

<p>If you subscribe on Marketplace, you will receive invoices for your Zilliz Cloud usage through the Marketplace. </p>

</Admonition>

## Understand your invoices{#understand-your-invoices}

Each invoice is composed of several key components. This section will walk through an example invoice to help you understand each element.

![example-invoice](/img/example-invoice.png)

### Billing cycle{#billing-cycle}

The billing cycle, displayed at the top of your invoice, shows the period during which charges are calculated, along with the payment due date.

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](/img/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **Billing Cycle:** Typically a month-long period starting at 00:00:00 (UTC) on the first day of the previous month and ending at 23:59:59 (UTC) on the last day of that month. For example, Zilliz Cloud issues the invoice for August on September 1, 2024, with the billing period running from August 1, 2024, at 00:00:00 (UTC) to August 31, 2024, at 23:59:59 (UTC). Charges accumulate for your usage throughout this period and your invoice status remains “**unbilled**”.

- **Data of Issue:** The date your invoice is generated. On this day, the invoice status changes to “**unpaid**,” and payment can be made. If you have added a payment method (e.g., credit card or marketplace subscription), it will be charged automatically. Upon successful payment, the invoice status updates to “**paid**”. In case of a failed payment, notification emails will be sent to the **Organization Owner(s)** and **Billing Admin(s)**.

- **Due Date:** The final day to make your payment. If payment is not received by this date, your invoice enters the **Grace Period**.

- **Grace Period:** A 14-day window during which payments can still be made. During this time, daily email reminders are sent, and the invoice status remains “**unpaid**” until successful payment.

- **Overdue Date:** If the payment remains unpaid, the invoice status becomes “**overdue**”. It is recommended to pay promptly, as your organization may be frozen the next day. Without payment within one day of freezing, all clusters (Serverless and Dedicated) will be automatically moved to [recycle bin](./use-recycle-bin) and will be retained there for 30 days.

### Invoice status{#invoice-status}

In Zilliz Cloud, invoice statuses represent different stages in the payment process. The following table explains each possible status:

<table>
   <tr>
     <th><p><strong>Status</strong></p></th>
     <th><p><strong>Definition</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Unbilled</strong></p></td>
     <td><p>Transactions that occur after the billing cycle but before the statement is generated. These amounts are not immediately due but will be included in the next billing cycle.</p></td>
   </tr>
   <tr>
     <td><p><strong>Unpaid</strong></p></td>
     <td><p>The invoice is billed and is within the due timeframe.</p></td>
   </tr>
   <tr>
     <td><p><strong>Overdue</strong></p></td>
     <td><p>The invoice is billed but not paid within the due timeframe.</p></td>
   </tr>
   <tr>
     <td><p><strong>Paid</strong></p></td>
     <td><p>Payment has been completed with no outstanding amounts.</p></td>
   </tr>
   <tr>
     <td><p><strong>Free</strong></p></td>
     <td><p>All amounts due are paid with credits.</p></td>
   </tr>
</table>

### Invoice Summary{#invoice-summary}

The summary section provides a high-level overview of the charges on your invoice.

- **Usage Amount:** The monthly total for all billable items (including CU, storage, backup, pipelines, and read and write costs).

- **Credits:** Any credits applied toward the payment.

- **Subtotal:** Subtotal = Usage Amount - Credits.

- **Tax:** Tax = Subtotal x Tax rate. Tax rates are based on the country in your billing address.

- **Total Amount:** Total Amount = Subtotal + Tax.

- **Advance Pay:** The amount of Advance Pay used to offset the payment.

- **Amount Due/Amount Paid:** The final amount you need to pay or have paid.

### Summary by Cluster Plan{#summary-by-cluster-plan}

Zilliz Cloud offers three cluster types: Free, Serverless, and Dedicated. Charges apply only for Serverless and Dedicated clusters.

- **Dedicated Clusters:** Billed based on usage. Charges are calculated as `Cluster Cost = Cluster CU Size x Runtime x Unit Price`. Unlike Serverless clusters, for dedicated clusters charges apply even without active read/write operations due to dedicated resource allocation.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For Dedicated cluster cost, runtime is defined as the period during which the cluster status is "<strong>Running</strong>", "<strong>Modifying</strong>", "<strong>Frozen</strong>", etc. Cluster under the following four statuses is not charged: "<strong>Creating</strong>", "<strong>Suspending</strong>", "<strong>Resuming</strong>", or "<strong>Suspended</strong>." </p>

    </Admonition>

- **Serverless Clusters:** Billed on a pay-as-you-go basis for vCU consumption during read/write operations. The cost is calculated as `Read and Write Cost = vCU Usage x vCU Unit Price`. If no operations occur, only storage fees are billed.

Additional charges include:

- **Backup Costs:** Calculated as `Backup File Size x Backup Retention Period` and measured in  "GB-month", which refers to the usage of 1 GB of backup file retained for 1 month. **Backup is billed at a minimum of 1 day, even for shorter retention period.** This means if the backup file is created but kept for less than one day, it will still be charged at the rate for one day.

- **Storage Costs:** Calculated as `Current Storage Size x Cluster Runtime` and measured in "GB-Hour", which refers to the usage of 1 GB of data stored for 1 hour. **Storage is billed at a minimum of 1 hour, even for shorter storage durations.** 

    <Admonition type="info" icon="📘" title="Notes">

    <p>For storage cost, runtime is defined as the period during which the cluster status is "<strong>Running</strong>", "<strong>Modifying</strong>", "<strong>Frozen</strong>", etc. Cluster under the following status is not charged: "<strong>Creating</strong>".</p>

    </Admonition>

### Invoice Details{#invoice-details}

This section provides a detailed breakdown of charges for each billable item. 

### Billing Profile{#billing-profile}

Your billing profile includes details about where and to whom invoices are issued. To edit the billing profile, refer to [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card#edit-billing-profile).

## Manage Invoices{#manage-invoices}

If you are an Organization Owner or a Billing Admin, you can view, pay, and download your invoices.

### View Invoice{#view-invoice}

1. Click **Billing** on the left navigation.

1. Switch to the **Invoices** tab. You can see all current and past invoices.

1. Click on the billing period of a target invoice to view its details.

![view-invoices](/img/view-invoices.png)

### Pay Invoice{#pay-invoice}

When your invoice is overdue, you can first check and update your payment method and then retry the payment on the invoice details page.

![pay-invoice](/img/pay-invoice.png)

### Download Invoice{#download-invoice}

To download an invoice, click the download icon next to the target invoice.

![download-invoices](/img/download-invoices.png)

## Troubleshooting / FAQ{#troubleshooting-faq}

#### What is the start and end time of an invoice?{#what-is-the-start-and-end-time-of-an-invoice}

- **Explanation:** The billing period starts at 00:00:00 (UTC) on the first day of the previous month and ending at 23:59:59 (UTC) on the last day of that month.

- **Example:** Zilliz Cloud issues the invoice for August on September 1, 2024, with the billing period running from August 1, 2024, at 00:00:00 (UTC) to August 31, 2024, at 23:59:59 (UTC).

#### How precise are the amounts displayed in the invoices on Zilliz Cloud?{#how-precise-are-the-amounts-displayed-in-the-invoices-on-zilliz-cloud}

- **Explanation:** Zilliz Cloud prices products with a precision of 8 decimal places. As a result, charges are calculated to eight decimals. During the billing process, these detailed daily charges are summed and then rounded to 2 decimal places.

    On the web UI, displayed amounts are rounded to 2 decimal places (for example: $60.00). 

    ![precision_invoice_cn](/img/precision_invoice_cn.png)

- **Example:** Suppose during reconciliation, you first retrieve three days of daily usage data via the Query Org Daily Usage API for August 1 to August 3, 2024. Each day's amount has an eight-decimal precision.

    - Total for August 1: $105.03331200

    - Total for August 2: $92.03000245

    - Total for August 3: $114.25300000

    Adding up the three daily totals gives a sum of $311.31631445, which rounds to $311.32 after considering the third decimal. This figure should match the total usage amount shown in the invoices on the web UI.

#### Why haven’t I received my invoice?{#why-havent-i-received-my-invoice}

- **Possible Cause:** Only **Organization Owners** or **Billing Admins** have access to invoices.

- **Solution:** Ensure you have the necessary permissions. Contact your Organization Owner or Billing Admin if you're not able to access invoices.

#### What happens if my payment method fails?{#what-happens-if-my-payment-method-fails}

- **Possible Cause:** The payment method (e.g., credit card) you’ve provided may have expired, or there could be insufficient funds.

- **Solution:**

    - Zilliz Cloud will notify **Organization Owners** and **Billing Admins** via email if a payment fails.

    - You can update your payment method by navigating to the **Billing Profile** section of your account and adding a valid credit card or payment method.

    - You can retry the payment within the **Grace** **Period**, which lasts **14 days**.

#### What is the Grace Period?{#what-is-the-grace-period}

- **Explanation:** The **Grace Period** is a 14-day window after the payment due date, during which you can still make payments before your invoice becomes overdue.

- **Tip:** During this period, you'll receive daily email reminders, and your invoice status will remain unpaid until the payment is completed.

#### What happens if I don’t make a payment after the overdue date?{#what-happens-if-i-dont-make-a-payment-after-the-overdue-date}

- **Explanation:** If payment is not made within the **Grace Period**:

    - On the **Overdue Date**, your invoice will be marked as overdue.

    - One day after the **Overdue Date**, your organization will be **frozen**, limiting access to Zilliz Cloud services.

    - If payment is still not made one day after the organization is frozen, all clusters (Serverless and Dedicated) will be automatically deleted.

- **Solution:** Make sure to resolve the payment before the **Overdue Date** to avoid service disruption and data loss.

#### **Why am I being charged even if there is no operations in my Serverless cluster?**{#why-am-i-being-charged-even-if-there-is-no-operations-in-my-serverless-cluster}

- **Explanation:** Even if no read or write operations occur in a Serverless cluster, you are still charged for storage. Storage costs are calculated based on the size of data stored and the time it is kept in Zilliz Cloud.

- **Solution:** To minimize storage costs, consider deleting unused data.

#### **I received an email about my organization being frozen. What should I do?**{#i-received-an-email-about-my-organization-being-frozen-what-should-i-do}

- **Explanation:** If you have received an email indicating that your organization has been frozen, it means your payment is overdue and access to Zilliz Cloud services is limited.

- **Solution:** 

    To unfreeze the organization:

    - Make the necessary payment within one day after freezing to prevent automatic deletion of your clusters.

    - Once the payment is processed, your organization will be unfrozen, and full cluster access will be restored.

#### **How can I recover my automatically deleted clusters due to an overdue invoice?**{#how-can-i-recover-my-automatically-deleted-clusters-due-to-an-overdue-invoice}

- **Explanation:** If your clusters were automatically deleted, it means you still fail to make payments after the organization is frozen.

- **Solution:**

    To restore automatically deleted clusters,

    - Make the payment to unfreeze the organization first.

    - When payment is successful, go to Recycle Bin to restore your deleted cluster.

- **Tip:** 

    - Deleted clusters are retained in the recycle bin for 30 days. If you still need the clusters, pease make the overdue payments within 30 days from cluster deletion.

    - If you have any problems when making the payment or restoring the clusters, please [submit a support ticket](http://support.zilliz.com).

