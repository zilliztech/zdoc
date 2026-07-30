---
title: "Manage Invoices | Cloud"
slug: /manage-invoice
sidebar_label: "Manage Invoices"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides instructions on how to view, download, and track invoices for your Zilliz Cloud organization. | Cloud"
type: origin
token: A3YdwRQwoiDLfkkPbwOcEOr3nLe
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Manage Invoices

This guide provides instructions on how to view, download, and track invoices for your Zilliz Cloud organization. 

Depending on your payment method, invoices may be issued by Zilliz Cloud or by the cloud marketplace where you subscribed.

<Admonition type="info" icon="📘" title="📘 Note">

To manage invoices, you must be an **Organization Owner** or **Organization Billing Admin**.

</Admonition>

### List all invoices\{#list-all-invoices}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoices](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-invoices.png "view-invoices")

<Procedures>

1. Click **Billing** on the left navigation.

1. Switch to the **Invoices** tab. You can see all current and past invoices.

</Procedures>

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{TOKEN}` is your authentication API key with an [Organization Owner or Billing Admin role](./organization-users#invite-a-user-to-your-organization). The following `GET` request lists all invoices for your organization.

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com/v2/invoices" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "invoices": [
#             {
#                 "id": "inv-12312io23810o291",
#                 "orgId": "org-xxxxxx",
#                 "periodStart": "2024-01-01T00:00:00Z",
#                 "periodEnd": "2024-02-01T00:00:00Z",
#                 "invoiceDate": "2024-02-01T00:00:00Z",
#                 "dueDate": "2024-02-01T00:00:00Z",
#                 "currency": "USD",
#                 "status": "unpaid",
#                 "usageAmount": 52400,
#                 "creditsApplied": 12400,
#                 "alreadyBilledAmount": 0,
#                 "subtotal": 40000,
#                 "tax": 5000,
#                 "total": 45000,
#                 "advancePayAmount": 0,
#                 "amountDue": 45000
#             }
#         ]
#     }
# }
```

<Admonition type="info" icon="📘" title="Notes">

In the results returned by the API, all amounts are in cents.

</Admonition>

</TabItem>

</Tabs>

### View the details of a specific invoice\{#view-the-details-of-a-specific-invoice}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoice-detail](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-invoice-detail.png "view-invoice-detail")

<Procedures>

1. Click **Billing** on the left navigation.

1. Switch to the **Invoices** tab.

1. Click on the billing period of a target invoice to view its details.

</Procedures>

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{TOKEN}` is your authentication API key with an [Organization Owner or Billing Admin role](./organization-users#invite-a-user-to-your-organization). The following `GET` request describes the specified invoice.

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com/v2/invoices/${INVOICE_ID}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "id": "inv-12312io23810o291",
#         "orgId": "org-xxxxxx",
#         "periodStart": "2024-01-01T00:00:00Z",
#         "periodEnd": "2024-02-01T00:00:00Z",
#         "invoiceDate": "2024-02-01T00:00:00Z",
#         "dueDate": "2024-02-01T00:00:00Z",
#         "currency": "USD",
#         "status": "unpaid",
#         "usageAmount": 52400,
#         "creditsApplied": 12400,
#         "alreadyBilledAmount": 0,
#         "subtotal": 40000,
#         "tax": 5000,
#         "total": 45000,
#         "advancePayAmount": 0,
#         "amountDue": 45000
#     }
# }
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `{INVOICE_ID}`: The ID of the invoice to describe.

<Admonition type="info" icon="📘" title="Notes">

In the results returned by the API, all amounts are in cents.

</Admonition>

</TabItem>

</Tabs>

### Pay Invoice\{#pay-invoice}

When your invoice is overdue, you can first check and update your payment method and then retry the payment view the Zilliz Cloud web console.

![pay-invoice](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pay-invoice.png "pay-invoice")

### Download Invoice\{#download-invoice}

To download an invoice, click the download icon next to the target invoice on the Zilliz Cloud web console.

![download-invoices](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/download-invoices.png "download-invoices")

