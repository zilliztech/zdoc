---
title: "請求書を管理 | Cloud"
slug: /manage-invoice
sidebar_key: manage-invoice
sidebar_label: "請求書を管理"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud 組織の請求書を表示、ダウンロード、追跡する方法について説明します。 | Cloud"
type: origin
token: A3YdwRQwoiDLfkkPbwOcEOr3nLe
sidebar_position: 6
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - 請求書
  - 管理

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# 請求書を管理

このガイドでは、Zilliz Cloud 組織の請求書を表示、ダウンロード、追跡する方法について説明します。

支払い方法によっては、請求書は Zilliz Cloud から発行される場合も、サブスクライブしたクラウド Marketplace から発行される場合もあります。

<Admonition type="info" icon="📘" title="Note">

請求書を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

### すべての請求書を一覧表示\{#list-all-invoices}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoices.png "view-invoices")

<Procedures>

1. 左側のナビゲーションで **Billing** をクリックします。

1. **Invoices** タブに切り替えます。現在および過去のすべての請求書を確認できます。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

List Invoices RESTful API は現在パブリックプレビュー中です。この API を使用するには、[お問い合わせ](http://support.zilliz.com)ください。

</Admonition>

リクエストは以下の例のようになります。`{TOKEN}` は [Organization Owner または Billing Admin ロール](./organization-users#invite-a-user-to-your-organization)を持つ認証 API キーです。以下の `GET` リクエストは、組織のすべての請求書を一覧表示します。

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

API が返す結果では、すべての金額はセント単位です。

</Admonition>

</TabItem>

</Tabs>

### 特定の請求書の詳細を表示\{#view-the-details-of-a-specific-invoice}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view-invoice-detail](https://zdoc-images.s3.us-west-2.amazonaws.com/view-invoice-detail.png "view-invoice-detail")

<Procedures>

1. 左側のナビゲーションで **Billing** をクリックします。

1. **Invoices** タブに切り替えます。

1. 対象請求書の請求期間をクリックして、詳細を表示します。

</Procedures>

</TabItem>

<TabItem value="Bash">

<Admonition type="info" icon="📘" title="Notes">

Describe Invoice RESTful API は現在パブリックプレビュー中です。この API を使用するには、[お問い合わせ](http://support.zilliz.com)ください。

</Admonition>

リクエストは以下の例のようになります。`{TOKEN}` は [Organization Owner または Billing Admin ロール](./organization-users#invite-a-user-to-your-organization)を持つ認証 API キーです。以下の `GET` リクエストは、指定した請求書の詳細を取得します。

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

上記のコマンドでは、次の値を使用します。

- `{API_KEY}`: API リクエストの認証に使用する資格情報。値を自分のものに置き換えてください。

- `{INVOICE_ID}`: 詳細を取得する請求書の ID。

<Admonition type="info" icon="📘" title="Notes">

API が返す結果では、すべての金額はセント単位です。

</Admonition>

</TabItem>

</Tabs>

### 請求書を支払う\{#pay-invoice}

請求書が延滞している場合は、まず支払い方法を確認して更新し、その後 Zilliz Cloud Web コンソールで支払いを再試行できます。

![pay-invoice](https://zdoc-images.s3.us-west-2.amazonaws.com/pay-invoice.png "pay-invoice")

### 請求書をダウンロード\{#download-invoice}

請求書をダウンロードするには、Zilliz Cloud Web コンソールで対象請求書の横にあるダウンロードアイコンをクリックします。

![download-invoices](https://zdoc-images.s3.us-west-2.amazonaws.com/download-invoices.png "download-invoices")
