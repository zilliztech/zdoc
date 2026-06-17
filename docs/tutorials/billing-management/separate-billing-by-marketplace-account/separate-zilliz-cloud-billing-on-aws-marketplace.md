---
title: "Separate Zilliz Cloud Billing on AWS Marketplace | Cloud"
slug: /separate-zilliz-cloud-billing-on-aws-marketplace
sidebar_key: separate-zilliz-cloud-billing-on-aws-marketplace
sidebar_label: "AWS Marketplace"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "If you need to separate Zilliz Cloud billing on AWS Marketplace by business unit, team, use case, application, or cost center, the recommended pattern is to use one AWS member account, one AWS Marketplace subscription, and one Zilliz Cloud organization per business unit. | Cloud"
type: origin
token: V7nZwzmpFiOokGksfTqcAcjcnXh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - aws
  - usage
  - separate billing

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Separate Zilliz Cloud Billing on AWS Marketplace

If you need to separate Zilliz Cloud billing on AWS Marketplace by business unit, team, use case, application, or cost center, the recommended pattern is to use one AWS [member account](https://docs.aws.amazon.com/organizations/latest/userguide/orgs-manage_accounts_members.html), one AWS Marketplace subscription, and one Zilliz Cloud organization per business unit.

AWS provides the billing view. Zilliz Cloud provides the [usage](./analyze-cost) view. For AWS-side billing separation, use one Zilliz Cloud organization per business unit and bind it to a Marketplace subscription purchased from the corresponding AWS member account.

## Overview\{#overview}

To separate Zilliz Cloud billing on AWS Marketplace, you should map each billing unit to one AWS member account, one AWS Marketplace subscription for Zilliz Cloud, and one Zilliz Cloud organization.

With this setup, [AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) shows Marketplace charges under the selected AWS member account. With consolidated billing, the organization receives **one bill** paid through the **management account**, while usage and costs remain trackable for each **member account**.

![GvudwMSj7hDpbQbdIrqcGBbrn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/GvudwMSj7hDpbQbdIrqcGBbrn7e.png)

With this setup:

- The [AWS Organizations management account](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) receives and pays the [consolidated bill](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html).

- Each AWS member account remains visible for cost tracking and cost allocation.

- The [AWS Marketplace subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) belongs to the AWS member account that purchases or accepts it.

- If a [private offer](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html) is used, make sure the offer is extended to the AWS account that will subscribe. For buyers using AWS Organizations and consolidated billing, AWS allows private offers to be accepted from either the management account or a member account, depending on how the offer is extended and managed.

- If [Private Marketplace](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-private-marketplace.html) is enabled, the product may need to be approved for the relevant account, OU, or organization before the member account can subscribe.

The following is an example of separating billing for 3 different teams.

```plaintext
AWS Organizations management account / consolidated bill
+-- AWS member account: team-a
|   +-- AWS Marketplace SaaS subscription: Zilliz Cloud - team-a
|       +-- Zilliz organization: org-team-a
|           +-- Project: project-team-a
|               +-- Cluster(s)
|
+-- AWS member account: team-b
|   +-- AWS Marketplace SaaS subscription: Zilliz Cloud - team-b
|       +-- Zilliz organization: org-team-b
|           +-- Project: project-team-b
|               +-- Cluster(s)
|
+-- AWS member account: team-c
    +-- AWS Marketplace SaaS subscription: Zilliz Cloud - team-c
        +-- Zilliz organization: org-team-c
            +-- Project: project-team-c
                +-- Cluster(s)
```

<Admonition type="info" icon="📘" title="Note">

<p>If you only need internal usage separation, a simpler alternative is to use one organization with multiple projects. In that model, Azure Marketplace charges remain combined under one subscription, and the usage split is visible only through Zilliz Cloud usage analysis.</p>

</Admonition>

### Comparison\{#comparison}

<table>
   <tr>
     <th><p>Model</p></th>
     <th><p>Separates AWS Marketplace charges</p></th>
     <th><p>Separates Zilliz usage by project or team</p></th>
     <th><p>Best for</p></th>
   </tr>
   <tr>
     <td><p>One organization per business unit</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Teams that need AWS-side cost separation by member account.</p></td>
   </tr>
   <tr>
     <td><p>One organization with multiple projects</p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
     <td><p>Internal usage split only</p></td>
   </tr>
</table>

## Multi-organization setup\{#multi-organization-setup}

Use this model when each business unit needs separate AWS Marketplace billing.

### Prepare multiple organizations\{#prepare-multiple-organizations}

A new Zilliz Cloud account registration automatically creates one default organization.

To prepare multiple organizations:

<Procedures>

1. [Submit a support ticket](http://support.zilliz.com) so that we can enable the multi-organization feature for you.

1. Once the feature is enabled, you can manually [create new organizations](./organization-settings#create-an-organization).

</Procedures>

Each organization has its own:

- billing and payment method

- users and RBAC

- projects

- clusters

- usage analysis data

### Bind one Marketplace subscription to each organization\{#bind-one-marketplace-subscription-to-each-organization}

For each business unit:

<Procedures>

1. Sign in to [AWS Marketplace](https://aws.amazon.com/marketplace) using the AWS member account for the target billing unit.

1. On Zilliz Cloud, Navigate to the corresponding Zilliz Cloud organization for your target billing unit.

1. On the Zilliz Cloud Billing page, click **+ Add Payment Method**, and then select **Marketplace**. Click **Subscribe Now**.

    ![NCUmwUABRht89lbl0NKcBZ7on1e](https://zdoc-images.s3.us-west-2.amazonaws.com/NCUmwUABRht89lbl0NKcBZ7on1e.png)

1. You will be redirected to AWS Marketplace. Complete your purchase there.

    For details, see [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace).

1. After you click **Set up your account** in AWS Marketplace, select the matching Zilliz Cloud organization.

1. Confirm the organization ID if needed.

1. Complete authorization.

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><p>Each Marketplace subscription can be linked to only one Zilliz Cloud organization.</p></li>
<li><p>To bind a Marketplace subscription to a Zilliz Cloud organization, you must be an Organization Owner or Organization Billing Admin in that organization.</p></li>
<li><p>The AWS user or role that completes the purchase must have permission to subscribe to AWS Marketplace products. AWS provides Marketplace managed policies such as <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html"><code>AWSMarketplaceManageSubscriptions</code></a> and <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceFullAccess.html"><code>AWSMarketplaceFullAccess</code></a>.</p></li>
</ul>

</Admonition>

### Receive AWS invoices and view charges Separately\{#receive-aws-invoices-and-view-charges-separately}

- Invoices are issued through AWS, not through Zilliz Cloud.

- [AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) shows Marketplace charges under each AWS member account.

- If the member accounts are in AWS Organizations, the management account receives the [consolidated bill](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) and can track charges across member accounts.

- The Zilliz Cloud spend of each business unit appears under its own AWS Marketplace subscription.

- AWS Marketplace [subscription details](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) include the product, vendor, agreement ID, agreement status, charge summary, and purchase order details if applicable.

- AWS-side cost allocation can follow the AWS account structure, [cost allocation tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html), [cost categories](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-cost-categories.html), and [purchase order](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-purchase-orders.html) model.

- Invoice presentation still depends on your AWS account, AWS Organizations, billing, and Marketplace agreement configuration.

### Check usage separately in each organization\{#check-usage-separately-in-each-organization}

Inside each Zilliz Cloud organization, use Zilliz Cloud [usage](./analyze-cost) analysis to drill down by:

- Project

- Cluster

- Time range

- Cost type

- Region

This provides the detailed usage view that AWS billing does not show.

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><p>Use AWS Billing and Cost Management for billed Marketplace charges and invoices.</p></li>
<li><p>Use Zilliz Cloud Usage page for project-level and cluster-level usage inside each organization.</p></li>
</ul>

</Admonition>

### Reconcile AWS Billing and Zilliz Cloud Usage\{#reconcile-aws-billing-and-zilliz-cloud-usage}

Use the following components to reconcile the AWS billing view and the Zilliz Cloud usage view:

- AWS Organizations management account ID

- AWS member account ID

- AWS Marketplace subscription or agreement ID

- Zilliz Cloud organization name and organization ID

- Zilliz Cloud project name and project ID

- Zilliz Cloud cluster name and cluster ID

## Considerations\{#considerations}

- If AWS-side Marketplace spend must be separated by team, use one AWS member account, one AWS Marketplace subscription, and one Zilliz Cloud organization per business unit.

- If you only need internal usage separation, one Zilliz Cloud organization with multiple projects is simpler, but it does not separate AWS Marketplace charges.

- Separate AWS invoice PDFs depend on the AWS account structure, AWS Organizations setup, billing configuration, and Marketplace agreement terms. They are not guaranteed by Zilliz Cloud architecture alone.

- Commercial terms such as committed spend, private offers, purchase orders, or shared commitments across multiple Marketplace subscriptions should be confirmed with AWS Sales or Marketplace Operations.

