---
title: "Azure Marketplace で Zilliz Cloud 請求を分離する | Cloud"
slug: /separate-zilliz-cloud-billing-on-azure-marketplace
sidebar_key: separate-zilliz-cloud-billing-on-azure-marketplace
sidebar_label: "Azure 請求の分離"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Azure Marketplace 上の Zilliz Cloud 請求を事業部・チーム・ユースケース・アプリ・コストセンター単位で分離するには、事業部ごとに Azure サブスクリプション 1 つ、Azure Marketplace サブスクリプション 1 つ、Zilliz Cloud 組織 1 つを対応させる構成が推奨です。 | Cloud"
type: origin
token: RLu1wO0FpiisJxkkViQcq039nff
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - azure
  - usage
  - separate billing

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Azure Marketplace で Zilliz Cloud 請求を分離する

[Azure Marketplace](https://marketplace.microsoft.com/en-us/) 上の Zilliz Cloud 請求を事業部・チーム・ユースケース・アプリケーション・コストセンター単位で分離したい場合は、事業部ごとに「Azure サブスクリプション 1 つ + Azure Marketplace サブスクリプション 1 つ + Zilliz Cloud 組織 1 つ」を対応させる構成を推奨します。

Azure provides the billing view. Zilliz Cloud provides the [usage](./analyze-cost) view. For Azure-side billing separation, use one organization per business unit.

## Overview\{#overview}

To separate Zilliz Cloud billing on Azure Marketplace, you should map each billing unit to one Azure subscription, one Azure Marketplace subscription for Zilliz Cloud, and one Zilliz Cloud organization.

![AaIlw5K0ThgXP7bBjGvczyIZnpg](https://zdoc-images.s3.us-west-2.amazonaws.com/AaIlw5K0ThgXP7bBjGvczyIZnpg.png)

With this setup:

- [Azure Cost Management ](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management)shows Marketplace charges under the selected Azure subscription.

- Each Azure Marketplace subscription maps to one Zilliz Cloud organization.

- Zilliz Cloud provides project-level and cluster-level usage drill-down inside that organization.

The following is an example of separating the billing for 3 different teams.

```plaintext
  Azure billing account
  +-- Azure subscription: team-a
  |   +-- Azure Marketplace SaaS subscription: Zilliz Cloud - team-a
  |       +-- Zilliz organization: org-team-a
  |           +-- Project: project-team-a
  |               +-- Cluster(s)
  +-- Azure subscription: team-b
  |   +-- Azure Marketplace SaaS subscription: Zilliz Cloud - team-b
  |       +-- Zilliz organization: org-team-b
  |           +-- Project: project-team-b
  |               +-- Cluster(s)
  +-- Azure subscription: team-c
      +-- Azure Marketplace SaaS subscription: Zilliz Cloud - team-c
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
     <th><p>Separates Azure Marketplace charges</p></th>
     <th><p>Separates Zilliz usage by project or team</p></th>
     <th><p>Best for</p></th>
   </tr>
   <tr>
     <td><p>One organization per business unit</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Teams or cost centers that need separate Azure billing</p></td>
   </tr>
   <tr>
     <td><p>One organization with multiple projects</p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
     <td><p>Internal usage split only</p></td>
   </tr>
</table>

## Multi-organization setup\{#multi-organization-setup}

Use this model when each business unit needs separate Azure Marketplace billing.

### Prepare multiple organizations\{#prepare-multiple-organizations}

A new Zilliz Cloud account registration automatically creates one default organization.

To prepare multiple organizations:

<Procedures>

1. マルチ組織機能を有効にできるよう、[サポートチケットを送信](http://support.zilliz.com)してください。

1. 機能が有効になると、手動で[新しい組織を作成](./organization-settings#create-an-organization)できます。

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

1. On Zilliz Cloud, navigate to the corresponding Zilliz Cloud organization for your target billing unit.

1. On the Zilliz Cloud Billing page, click **+ Add Payment Method**, and then select **Marketplace**. Click **Subscribe Now**.

    ![VI6ew0JUHh3u1Yb5lrRcLhrxn9b](https://zdoc-images.s3.us-west-2.amazonaws.com/VI6ew0JUHh3u1Yb5lrRcLhrxn9b.png)

1. You will be redirected to Azure Marketplace. Complete your purchase there.

    For details, see [Subscribe on Azure Marketplace](./subscribe-on-azure-marketplace#subscribe-on-azure-marketplace).

1. After you click **Configure account now**, select the matching Zilliz Cloud organization.

1. Confirm the organization ID if needed.

1. Complete authorization.

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><p>Each Marketplace subscription can be linked to only one Zilliz Cloud organization.</p></li>
<li><p>To bind a Marketplace subscription to a Zilliz Cloud organization, you must be an Organization Owner or Organization Billing Admin in that organization.</p></li>
</ul>

</Admonition>

### Receive Azure invoices and view charges separately\{#receive-azure-invoices-and-view-charges-separately}

- Invoices are issued through Azure, not through Zilliz Cloud.

- [Azure Cost Management](https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu) shows Marketplace charges under each Azure subscription.

- The Zilliz Cloud spend of each business unit appears under its own Azure Marketplace subscription.

- Azure-side [cost allocation](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-allocation-introduction) can follow the Azure subscription, resource group, and tag model.

- [Invoice](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/download-azure-invoice) presentation still depends on your Azure billing account configuration.

### Check usage separately in each organization\{#check-usage-separately-in-each-organization}

Inside each Zilliz Cloud organization, use Zilliz Cloud [usage](./analyze-cost) analysis to drill down by:

- Project

- Cluster

- Time range

- Cost type

- Region

This provides the detailed usage view that Azure billing does not show.

<Admonition type="info" icon="📘" title="Note">

<ul>
<li><p>Use Azure Cost Management for billed Marketplace charges and invoices.</p></li>
<li><p>Use Zilliz Cloud Usage page for project-level and cluster-level usage inside each organization.</p></li>
</ul>

</Admonition>

### Reconcile Azure billing and Zilliz Cloud usage\{#reconcile-azure-billing-and-zilliz-cloud-usage}

Use the following components to reconcile the Azure billing view and the Zilliz Cloud usage view:

- [Azure subscription](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-subscriptions)

- Azure Marketplace subscription

- Zilliz Cloud organization name and organization ID

- Zilliz Cloud project name and project ID

- Zilliz Cloud cluster name and cluster ID

## Considerations\{#considerations}

- If Azure-side Marketplace spend must be separated by team, use one Azure Marketplace subscription and one Zilliz Cloud organization per business unit.

- If you only need internal usage separation, one organization with multiple projects is simpler, but it does not separate Azure Marketplace charges.

- Separate Azure invoice PDFs depend on the Azure billing account type and are not guaranteed by Zilliz Cloud architecture alone.

- Commercial terms such as committed spend, private offers, or shared commitments across multiple Marketplace subscriptions should be confirmed with Microsoft Azure Sales or Marketplace Operations.
