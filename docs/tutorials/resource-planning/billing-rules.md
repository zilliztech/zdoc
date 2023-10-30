---
slug: /billing-rules
beta: FALSE
notebook: FALSE
sidebar_position: 4
---



# Billing Rules

## Overview{#overview}

This guide helps you understand the basic billing rules in Zilliz Cloud.

## Pricing model{#pricing-model}

Zilliz Cloud adopts a pay-as-you-go pricing model, meaning you only pay for what you actually use. With this model, you do not have to overcommit budgets and can flexibly adapt to your changing business needs. More specifically, in Zilliz Cloud, you will be charged for the running clusters. To save costs, you are advised to suspend your unused clusters. When a cluster is suspended, you will only pay for storage consumption. You will not be charged for the computing resources of this suspended cluster.

### Billing period{#billing-period}

If your organization does not have a payment method or has added a credit card as the payment method, the billing period is 1 month. On the first day of every month, you will receive a bill.

If you subscribe to Zilliz Cloud on AWS Marketplace, your billing is managed by AWS. At the beginning of every month, you will receive a bill from Amazon Web Services (AWS) for your AWS Marketplace charges. For more information, see [Paying for products](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-paying-for-products.html).

### Access required{#access-required}

To view billing, payment methods, and invoices, you need to be granted the organization owner role. Only an organization owner has access to the billing tab and receives the relevant email notification for billing.

## Billable items{#billable-items}

The total cost of using Zilliz Cloud is the aggregate of compute cost, storage cost, backup cost, and migration cost. For a detailed breakdown of the total cost, you can [view your invoice](./view-invoice).

![billable_items](/img/billable_items.png)

### Compute cost{#compute-cost}

Compute costs are incurred when you use the CU resources in Zilliz Cloud. The billed cost of using CU resources is calculated by multiplying the number of hours by the CU unit price. The CU unit price varies according to the plan type, cloud provider, cloud region, and CU type of your cluster. For more information, see [Pricing](https://zilliz.com/pricing).

For instance, the unit price of a performance-optimized cluster on AWS is $0.159/hour. If you choose the Starter plan and deploy a 1 CU performance-optimized cluster on AWS us-west-2 and use this cluster for 10 hours, the compute cost is $1.59.

:::info Notes

$0.159 * 1 * 10 =$1.59

:::

### Storage cost{#storage-cost}

The monthly cost for storing data in Zilliz Cloud is charged per gigabyte (GB). The unit storage price varies according to the cloud provider. For more information, see [Pricing](https://zilliz.com/pricing).
For instance, the unit price of storing data in a Zilliz Cloud cluster hosted on AWS is $0.025 / GB per month. If you imported 10GB of data to a Zilliz Cloud cluster hosted on AWS in the past 2 months, the storage cost is $0.5.

:::info Notes

$0.025 * 10 * 2 =$0.5

:::

### Backup cost{#backup-cost}

Backup cost is incurred when you use the backup feature in Zilliz Cloud. The backup cost is charged based on the amount of data transferred. The unit price of backup is $0.025/GB.

### Migration cost{#migration-cost}

Migration cost is incurred when you use the migration feature in Zilliz Cloud. The migration cost is charged based on the amount of data transferred. The unit price of migration is $0.025/GB.

## Payment methods{#payment-methods}

![payment_method](/img/payment_method.png)

Zilliz Cloud accepts various payment methods. Currently, there are four types of payment methods. Your registered payment method is viewable on the **Billing Overview **page. The payment priority is "Credit > Advance pay > Credit card/Marketplace subscription". This means that when you receive a Zilliz Cloud bill, you will pay with the free credits first, then the advance pay funds. If the remaining credits and advance pay funds are not sufficient to cover your total cost, you will be charged through the credit card you provided or your third-party marketplace subscription. 

Please note that if you have added a credit card and later want to change your payment method to a marketplace subscription, you can directly[ subscribe to Zilliz Cloud on a third-party marketplace](./subscribe-by-adding-credit-card#switch-to-aws-marketplace-subscription), without having to manually. remove your credit card. In this case, your payment method will be automatically switched to Marketplace subscription and your linked credit card will be automatically removed. However, if you have previously subscribed to Zilliz Cloud on a third-party marketplace but later wanted to switch your payment method to a credit card, you will have to cancel your marketplace subscription first and then add a credit card on the Zilliz Cloud web console. For more information, see [Switch to payment credit card](./subscribe-on-aws-marketplace#switch-to-payment-credit-card).

### Free credits{#free-credits}

You will earn a minimum of $100 free credits upon registration. These credits can be used to cover your costs. The credits expire in 30 days. If you add another payment method,  your credit expiration will be extended to 1 year. You can check the amount of remaining credits on the Billing Overview page.

### Credit card{#credit-card}

Zilliz Cloud supports Visa and Mastercard credit cards as the payment method. For more information, see [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card) 

### Marketplace subscription{#marketplace-subscription}

Zilliz Cloud is now available on AWS and GCP marketplace. For more information see [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace) and [Subscribe on GCP Marketplace](./undefined) . 

:::info Notes

If your payment method is marketplace subscription, your bills and invoices are managed by the corresponding third-party marketplace. Therefore, you need to visit AWS Billing or Google Cloud Billing to view invoices.

:::

### Advance pay{#advance-pay}

Zilliz Cloud also accepts advance pay (bank transfer) as the payment method. For more information, see [Use Advance Pay](./advance-pay) [.](./advance-pay)

## Overdue payments{#overdue-payments}

账单未支付后发生什么：

1.  试用用户：60% credit usage 发送一封邮件提醒，预估3天即将用完。credit用完/过期立即删除dedicated cluster。继续使用需绑定支付方式。

1. 绑支付方式用户：邮件通知，连发3天。3天后仍未支付，冻结组织1天。冻结 1天后仍未付款，删除dedicated cluster
    - AWS marketplace 

## FAQ：Free trial {#faqfree-trial}

**What will happen when my free trial ends?**

Your free trial will end when you have no registered payment method on Zilliz Cloud and the credits run out or expire.  If your free trial comes to an end, you can still use your Starter plan clusters. However, all your Standard plan clusters will be moved to the recycle bin and will be permanently deleted after 30 days. If you still need your Starter plan clusters, you can add a payment method and recover them within 30 days.

:::info Notes

- https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-paying-for-products.html

- https://www.alibabacloud.com/help/en/mongodb/product-overview/billing-methods

- https://www.mongodb.com/docs/atlas/billing/

:::

:::info Notes

:::

