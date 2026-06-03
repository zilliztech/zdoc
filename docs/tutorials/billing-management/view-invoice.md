---
title: "Understand Invoices | Cloud"
slug: /view-invoice
sidebar_key: view-invoice
sidebar_label: "Understand Invoices"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud charges at the organization level. | Cloud"
type: origin
token: PBEbwjRu9iyyaFkZnuzcINHCnke
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - invoice
  - overview

---

import Admonition from '@theme/Admonition';


# Understand Invoices

Zilliz Cloud charges at the organization level. 

To access invoices, you must have either **Organization Owner** or **Organization Billing Admin** permissions.

<Admonition type="info" icon="📘" title="Notes">

If you subscribe on Marketplace, you will receive invoices for your Zilliz Cloud usage through the Marketplace. 

</Admonition>

Each invoice is composed of several key components. This section will walk through an example invoice to help you understand each element.

![example-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/example-invoice.png "example-invoice")

## Billing cycle\{#billing-cycle}

The billing cycle, displayed at the top of your invoice, shows the period during which charges are calculated, along with the payment due date.

![Vp6Rwz3Eph1IuXbQgKScVcSEnZg](https://zdoc-images.s3.us-west-2.amazonaws.com/Vp6Rwz3Eph1IuXbQgKScVcSEnZg.png)

- **Billing Cycle:** Typically a month-long period starting at 00:00:00 (UTC) on the first day of the previous month and ending at 23:59:59 (UTC) on the last day of that month. For example, Zilliz Cloud issues the invoice for August on September 1, 2024, with the billing period running from August 1, 2024, at 00:00:00 (UTC) to August 31, 2024, at 23:59:59 (UTC). Charges accumulate for your usage throughout this period and your invoice status remains “**unbilled**”.

- **Data of Issue:** The date your invoice is generated. On this day, the invoice status changes to “**unpaid**,” and payment can be made. If you have added a payment method (e.g., credit card or marketplace subscription), it will be charged automatically. Upon successful payment, the invoice status updates to “**paid**”. In case of a failed payment, notification emails will be sent to the **Organization Owner(s)** and **Billing Admin(s)**.

- **Due Date:** The final day to make your payment. If payment is not received by this date, your invoice enters the **Grace Period**.

- **Grace Period:** A 14-day window during which payments can still be made. During this time, daily email reminders are sent, and the invoice status remains “**unpaid**” until successful payment.

- **Overdue Date:** If the payment remains unpaid, the invoice status becomes “**overdue**”. It is recommended to pay promptly, as your organization may be frozen the next day. Without payment within one day of freezing, all clusters (Serverless and Dedicated) will be automatically moved to [recycle bin](./use-recycle-bin) and will be retained there for 30 days.

## Invoice status\{#invoice-status}

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

## Invoice summary\{#invoice-summary}

The summary section provides a high-level overview of the charges on your invoice.

- **Usage Amount:** The monthly total for all billable items (including CU, storage, backup, pipelines, and read and write costs).

- **Credits:** Any credits applied toward the payment.

- **Subtotal:** Subtotal = Usage Amount - Credits.

- **Tax:** Tax = Subtotal x Tax rate. Tax rates are based on the country in your billing address.

- **Total Amount:** Total Amount = Subtotal + Tax.

- **Advance Pay:** The amount of Advance Pay used to offset the payment.

- **Amount Due/Amount Paid:** The final amount you need to pay or have paid.

## Summary by cluster plan\{#summary-by-cluster-plan}

Zilliz Cloud offers three cluster types: Free, Serverless, and Dedicated. Charges apply only for Serverless and Dedicated clusters.

- **Dedicated Clusters:** Billed based on usage. Charges are calculated as `Cluster Cost = Cluster CU Size x Runtime x Unit Price`. Unlike Serverless clusters, for dedicated clusters charges apply even without active read/write operations due to dedicated resource allocation.

    <Admonition type="info" icon="📘" title="Notes">

    For Dedicated cluster cost, runtime is defined as the period during which the cluster status is "**Running**", "**Modifying**", "**Frozen**", etc. Cluster under the following four statuses is not charged: "**Creating**", "**Suspending**", "**Resuming**", or "**Suspended**." 

    </Admonition>

- **Serverless Clusters:** Billed on a pay-as-you-go basis for vCU consumption during read/write operations. The cost is calculated as `Read and Write Cost = vCU Usage x vCU Unit Price`. If no operations occur, only storage fees are billed.

Additional charges include:

- **Backup Costs:** Calculated as `Backup File Size x Backup Retention Period` and measured in  "GB-month", which refers to the usage of 1 GB of backup file retained for 1 month. **Backup is billed at a minimum of 1 day, even for shorter retention period.** This means if the backup file is created but kept for less than one day, it will still be charged at the rate for one day.

- **Storage Costs:** Calculated as `Current Storage Size x Cluster Runtime` and measured in "GB-Hour", which refers to the usage of 1 GB of data stored for 1 hour. **Storage is billed at a minimum of 1 hour, even for shorter storage durations.** 

    <Admonition type="info" icon="📘" title="Notes">

    For storage cost, runtime is defined as the period during which the cluster status is "**Running**", "**Modifying**", "**Frozen**", etc. Cluster under the following status is not charged: "**Creating**".

    </Admonition>

## Invoice details\{#invoice-details}

This section provides a detailed breakdown of charges for each billable item. 

## Billing profile\{#billing-profile}

Your billing profile includes details about where and to whom invoices are issued. In Zilliz Cloud, relevant billing emails will be sent to Organization Owners, Organization Billing Admins, and the email addresses added in the billing profile. Therefore, to add recipients of invoices, you can add the email address in the billing profile or [invite](./organization-users) user to join the organization as an Organization Billing Admin.

To edit the billing profile, refer to [Update Billing Profile](./update-billing-profile).

## Troubleshooting / FAQ\{#troubleshooting-faq}

1. **What is the start and end time of an invoice?**

    **Explanation:** The billing period starts at 00:00:00 (UTC) on the first day of the previous month and ending at 23:59:59 (UTC) on the last day of that month. 

    **Example:** Zilliz Cloud issues the invoice for August on September 1, 2024, with the billing period running from August 1, 2024, at 00:00:00 (UTC) to August 31, 2024, at 23:59:59 (UTC). 

1. **How precise are the amounts displayed in the usage details on Zilliz Cloud?**

    Zilliz Cloud calculates charges with a precision of **10 decimal places**, and all billing is computed to this level of accuracy. Daily charges are first calculated to 10 decimals, then summed and rounded to 10 decimals during the billing process.

    - **RESTful API**: All numeric values (e.g., Unit Price, Usage, Usage Amount) are always returned with exactly 10 decimal places. If the value has fewer than 10 decimal digits, trailing zeros are padded to reach 10 digits. For more information about how to use the RESTful API, see [Query Daily Usage](/reference/restful/query-daily-usage-v2).

    - **Web Console UI**: The displayed amounts are consistent with the API values, but trailing zeros are omitted for readability. For example, `0.1234000000` would be displayed as `0.1234` in the UI.

1. **Why haven’t I received my invoice?**

    **Possible Cause:** Only **Organization Owners** or **Billing Admins** have access to invoices.

    **Solution:** Ensure you have the necessary permissions. Contact your Organization Owner or Billing Admin if you're not able to access invoices.

1. **What happens if my payment method fails?**

    **Possible Cause:** The payment method (e.g., credit card) you’ve provided may have expired, or there could be insufficient funds.

    **Solution:** Zilliz Cloud will notify **Organization Owners** and **Billing Admins** via email if a payment fails. Organization Owners and Billing Admins can update the organization's payment method on the **Billing Profile** page and then retry the payment within the **14-day** **Grace** **Period**.

1. **What is the Grace Period?**

    **Explanation:** The **Grace Period** is a 14-day window after the payment due date, during which you can still make payments before your invoice becomes overdue.

    **Tip:** During this period, you'll receive daily email reminders, and your invoice status will remain unpaid until the payment is completed.

1. **What happens if I don’t make a payment after the overdue date?**

    **Explanation:** If payment is not made within the **Grace Period**:

    - On the **Overdue Date**, your invoice will be marked as overdue.

    - One day after the **Overdue Date**, your organization will be **frozen**, limiting access to Zilliz Cloud services.

    - If payment is still not made one day after the organization is frozen, all clusters (Serverless and Dedicated) will be automatically deleted.

    **Solution:** Make sure to resolve the payment before the **Overdue Date** to avoid service disruption and data loss.

1. **Why am I being charged even if there is no operations in my Serverless cluster?**

    **Explanation:** Even if no read or write operations occur in a Serverless cluster, you are still charged for storage. Storage costs are calculated based on the size of data stored and the time it is kept in Zilliz Cloud.

    **Solution:** To minimize storage costs, consider deleting unused data.

1. **I received an email about my organization being frozen. What should I do?**

    **Explanation:** If you have received an email indicating that your organization has been frozen, it means your payment is overdue and access to Zilliz Cloud services is limited.

    **Solution:** 

    To unfreeze the organization:

    - Make the necessary payment within one day after freezing to prevent automatic deletion of your clusters.

    - Once the payment is processed, your organization will be unfrozen, and full cluster access will be restored.

1. **How can I recover my automatically deleted clusters due to an overdue invoice?**

    **Explanation:** If your clusters were automatically deleted, it means you still fail to make payments after the organization is frozen.

    **Solution:**

    To restore automatically deleted clusters,

    - Make the payment to unfreeze the organization first.

    - When payment is successful, go to Recycle Bin to restore your deleted cluster.

    **Tip:** 

    - Deleted clusters are retained in the recycle bin for 30 days. If you still need the clusters, pease make the overdue payments within 30 days from cluster deletion.

    - If you have any problems when making the payment or restoring the clusters, please [submit a support ticket](http://support.zilliz.com).

