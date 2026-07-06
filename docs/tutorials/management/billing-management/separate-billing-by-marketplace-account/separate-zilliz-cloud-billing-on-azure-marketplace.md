---
title: "Separate Zilliz Cloud Billing on Microsoft Marketplace | Cloud"
slug: /separate-zilliz-cloud-billing-on-azure-marketplace
sidebar_label: "Microsoft Marketplace"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "If you need to separate Zilliz Cloud billing on Microsoft Marketplace by business unit, team, use case, application, or cost center, the recommended pattern is to use one Azure subcription, one Microsoft Marketplace subscription and one Zilliz Cloud organization per business unit. | Cloud"
type: origin
token: RLu1wO0FpiisJxkkViQcq039nff
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Separate Zilliz Cloud Billing on Microsoft Marketplace

If you need to separate Zilliz Cloud billing on [Microsoft Marketplace](https://marketplace.microsoft.com/en-us/) by business unit, team, use case, application, or cost center, the recommended pattern is to use one Azure subcription, one Microsoft Marketplace subscription and one Zilliz Cloud organization per business unit.

Microsoft provides the billing view. Zilliz Cloud provides the [usage](./analyze-cost) view. For Microsoft-side billing separation, use one organization per business unit.

## Overview\{#overview}

To separate Zilliz Cloud billing on Microsoft Marketplace, you should map each billing unit to one Microsoft subscription, one Microsoft Marketplace subscription for Zilliz Cloud, and one Zilliz Cloud organization.

![AaIlw5K0ThgXP7bBjGvczyIZnpg](https://zdoc-images.s3.us-west-2.amazonaws.com/AaIlw5K0ThgXP7bBjGvczyIZnpg.png)

With this setup:

- [Microsoft Cost Management ](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management)shows Marketplace charges under the selected Microsoft subscription.

- Each Microsoft Marketplace subscription maps to one Zilliz Cloud organization.

- Zilliz Cloud provides project-level and cluster-level usage drill-down inside that organization.

The following is an example of separating the billing for 3 different teams.

```plaintext
  Microsoft billing account
  +-- Microsoft subscription: team-a
  |   +-- Microsoft Marketplace SaaS subscription: Zilliz Cloud - team-a
  |       +-- Zilliz organization: org-team-a
  |           +-- Project: project-team-a
  |               +-- Cluster(s)
  +-- Microsoft subscription: team-b
  |   +-- Microsoft Marketplace SaaS subscription: Zilliz Cloud - team-b
  |       +-- Zilliz organization: org-team-b
  |           +-- Project: project-team-b
  |               +-- Cluster(s)
  +-- Microsoft subscription: team-c
      +-- Microsoft Marketplace SaaS subscription: Zilliz Cloud - team-c
          +-- Zilliz organization: org-team-c
              +-- Project: project-team-c
                  +-- Cluster(s)
```

<Admonition type="info" icon="📘" title="Note">

If you only need internal usage separation, a simpler alternative is to use one organization with multiple projects. In that model, Microsoft Marketplace charges remain combined under one subscription, and the usage split is visible only through Zilliz Cloud usage analysis.

</Admonition>

### Comparison\{#comparison}

| Model | Separates Microsoft Marketplace charges | Separates Zilliz usage by project or team | Best for |
| --- | --- | --- | --- |
| One organization per business unit | Yes | Yes | Teams or cost centers that need separate Azure billing |
| One organization with multiple projects | No | Yes | Internal usage split only |

## Multi-organization setup\{#multi-organization-setup}

Use this model when each business unit needs separate Microsoft Marketplace billing.

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

1. On Zilliz Cloud, navigate to the corresponding Zilliz Cloud organization for your target billing unit.

1. On the Zilliz Cloud Billing page, click **+ Add Payment Method**, and then select **Marketplace**. Click **Subscribe Now**.

    ![VI6ew0JUHh3u1Yb5lrRcLhrxn9b](https://zdoc-images.s3.us-west-2.amazonaws.com/VI6ew0JUHh3u1Yb5lrRcLhrxn9b.png)

1. You will be redirected to Microsoft Marketplace. Complete your purchase there.

    For details, see [Subscribe on Azure Marketplace](./subscribe-on-azure-marketplace#subscribe-on-azure-marketplace).

1. After you click **Configure account now**, select the matching Zilliz Cloud organization.

1. Confirm the organization ID if needed.

1. Complete authorization.

</Procedures>

<Admonition type="info" icon="📘" title="Note">

- Each Marketplace subscription can be linked to only one Zilliz Cloud organization.

- To bind a Marketplace subscription to a Zilliz Cloud organization, you must be an Organization Owner or Organization Billing Admin in that organization.

</Admonition>

### Receive Microsoft invoices and view charges separately\{#receive-microsoft-invoices-and-view-charges-separately}

- Invoices are issued through Microsoft, not through Zilliz Cloud.

- [Microsoft Cost Management](https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu) shows Marketplace charges under each Microsoft subscription.

- The Zilliz Cloud spend of each business unit appears under its own Microsoft Marketplace subscription.

- Microsoft-side [cost allocation](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-allocation-introduction) can follow the Microsoft subscription, resource group, and tag model.

- [Invoice](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/download-azure-invoice) presentation still depends on your Microsoft billing account configuration.

### Check usage separately in each organization\{#check-usage-separately-in-each-organization}

Inside each Zilliz Cloud organization, use Zilliz Cloud [usage](./analyze-cost) analysis to drill down by:

- Project

- Cluster

- Time range

- Cost type

- Region

This provides the detailed usage view that Microsoft billing does not show.

<Admonition type="info" icon="📘" title="Note">

- Use Microsoft Cost Management for billed Marketplace charges and invoices.

- Use Zilliz Cloud Usage page for project-level and cluster-level usage inside each organization.

</Admonition>

### Reconcile Microsoft billing and Zilliz Cloud usage\{#reconcile-microsoft-billing-and-zilliz-cloud-usage}

Use the following components to reconcile the Microsoft billing view and the Zilliz Cloud usage view:

- [Microsoft subscription](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-subscriptions)

- Microsoft Marketplace subscription

- Zilliz Cloud organization name and organization ID

- Zilliz Cloud project name and project ID

- Zilliz Cloud cluster name and cluster ID

## Considerations\{#considerations}

- If Microsoft-side Marketplace spend must be separated by team, use one Microsoft Marketplace subscription and one Zilliz Cloud organization per business unit.

- If you only need internal usage separation, one organization with multiple projects is simpler, but it does not separate Microsoft Marketplace charges.

- Separate Microsoft invoice PDFs depend on the Microsoft billing account type and are not guaranteed by Zilliz Cloud architecture alone.

- Commercial terms such as committed spend, private offers, or shared commitments across multiple Marketplace subscriptions should be confirmed with Microsoft Sales or Marketplace Operations.

