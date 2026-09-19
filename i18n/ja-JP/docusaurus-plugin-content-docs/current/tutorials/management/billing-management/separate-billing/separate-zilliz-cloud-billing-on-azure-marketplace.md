---
title: "Microsoft Marketplace で Zilliz Cloud の請求を分離する | Cloud"
slug: /separate-zilliz-cloud-billing-on-azure-marketplace
sidebar_label: "Microsoft Marketplace"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Microsoft Marketplace 上の Zilliz Cloud の請求を事業部、チーム、ユースケース、アプリケーション、またはコストセンターごとに分離する必要がある場合、推奨されるパターンは、事業部ごとに 1 つの Azure サブスクリプション、1 つの Microsoft Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用することです。 | Cloud"
type: origin
token: RLu1wO0FpiisJxkkViQcq039nff
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Marketplace で Zilliz Cloud の請求を分離する

[Microsoft Marketplace](https://marketplace.microsoft.com/en-us/) 上の Zilliz Cloud の請求を事業部、チーム、ユースケース、アプリケーション、またはコストセンターごとに分離する必要がある場合、推奨されるパターンは、事業部ごとに 1 つの Azure サブスクリプション、1 つの Microsoft Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用することです。

請求の表示は Microsoft が提供します。Zilliz Cloud は [使用量](./analyze-cost) の表示を提供します。Microsoft 側で請求を分離するには、事業部ごとに 1 つの組織を使用します。

## 概要\{#overview}

Microsoft Marketplace 上の Zilliz Cloud の請求を分離するには、各請求単位を 1 つの Microsoft サブスクリプション、Zilliz Cloud 用の 1 つの Microsoft Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織に対応付ける必要があります。

![AaIlw5K0ThgXP7bBjGvczyIZnpg](https://zdoc-images.s3.us-west-2.amazonaws.com/AaIlw5K0ThgXP7bBjGvczyIZnpg.png)

この構成では、以下のようになります。

- [Microsoft Cost Management ](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management)では、選択した Microsoft サブスクリプションの下に Marketplace の料金が表示されます。

- 各 Microsoft Marketplace サブスクリプションは、1 つの Zilliz Cloud 組織に対応付けられます。

- Zilliz Cloud は、その組織内でプロジェクトレベルおよびクラスターレベルの使用量ドリルダウンを提供します。

以下は、3 つの異なるチームの請求を分離する例です。

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

<Admonition type="info" title="Note">

内部の使用量を分離するだけでよい場合は、よりシンプルな代替案として、複数のプロジェクトを持つ 1 つの組織を使用できます。このモデルでは、Microsoft Marketplace の料金は 1 つのサブスクリプションの下にまとめられたままとなり、使用量の内訳は Zilliz Cloud の使用量分析を通じてのみ確認できます。

</Admonition>

### 比較\{#comparison}

| モデル | Microsoft Marketplace の料金を分離 | プロジェクトまたはチームごとに Zilliz の使用量を分離 | 最適な用途 |
| --- | --- | --- | --- |
| 事業部ごとに 1 つの組織 | はい | はい | Azure の請求を個別に分離する必要があるチームまたはコストセンター |
| 複数のプロジェクトを持つ 1 つの組織 | いいえ | はい | 内部的な使用量の分離のみ |

## マルチ組織のセットアップ\{#multi-organization-setup}

各事業部で Microsoft Marketplace の請求を個別に分ける必要がある場合は、このモデルを使用します。

### 複数の組織を準備する\{#prepare-multiple-organizations}

Zilliz Cloud アカウントを新規登録すると、自動的に 1 つのデフォルト組織が作成されます。

複数の組織を準備するには、以下を実行します。

<Procedures>

1. [サポートチケットを送信](http://support.zilliz.com) して、マルチ組織機能を有効にできるように依頼します。

1. 機能が有効になったら、手動で [新しい組織を作成](./organization-settings#create-an-organization) できます。

</Procedures>

各組織には、それぞれ以下があります。

- 請求と支払い方法

- ユーザーと RBAC

- プロジェクト

- クラスター

- 使用量分析データ

### 各組織に 1 つの Marketplace サブスクリプションを紐付ける\{#bind-one-marketplace-subscription-to-each-organization}

各事業部について、以下を実行します。

<Procedures>

1. Zilliz Cloud で、対象の請求単位に対応する Zilliz Cloud 組織に移動します。

1. Zilliz Cloud の Billing ページで、**+ Add Payment Method** をクリックし、続いて **Marketplace** を選択します。**Subscribe Now** をクリックします。

    ![VI6ew0JUHh3u1Yb5lrRcLhrxn9b](https://zdoc-images.s3.us-west-2.amazonaws.com/VI6ew0JUHh3u1Yb5lrRcLhrxn9b.png)

1. Microsoft Marketplace にリダイレクトされます。そこで購入を完了してください。

    詳細については、[Microsoft Marketplace でのサブスクライブ](./subscribe-on-azure-marketplace#subscribe-on-azure-marketplace) を参照してください。

1. **Configure account now** をクリックした後、一致する Zilliz Cloud 組織を選択します。

1. 必要に応じて組織 ID を確認します。

1. 認証を完了します。

</Procedures>

<Admonition type="info" title="Note">

- 各 Marketplace サブスクリプションは、1 つの Zilliz Cloud 組織にのみリンクできます。

- Marketplace サブスクリプションを Zilliz Cloud 組織に紐付けるには、その組織の Organization Owner または Organization Billing Admin である必要があります。

</Admonition>

### Microsoft の請求書を個別に受け取り、料金を個別に確認する\{#receive-microsoft-invoices-and-view-charges-separately}

- 請求書は Zilliz Cloud ではなく Microsoft を通じて発行されます。

- [Microsoft Cost Management](https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu) は、各 Microsoft サブスクリプションの下に Marketplace の料金を表示します。

- 各事業部の Zilliz Cloud の支出は、それぞれの Microsoft Marketplace サブスクリプションの下に表示されます。

- Microsoft 側の[コスト配分](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-allocation-introduction)は、Microsoft サブスクリプション、リソースグループ、およびタグのモデルに従うことができます。

- [請求書](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/download-azure-invoice)の表示形式は、引き続き Microsoft 請求アカウントの設定に依存します。

### 各組織で使用量を個別に確認する\{#check-usage-separately-in-each-organization}

各 Zilliz Cloud 組織内では、Zilliz Cloud の [使用量](./analyze-cost) 分析を使用して、以下の単位で詳細を確認できます。

- プロジェクト

- クラスター

- 期間

- コストタイプ

- リージョン

これにより、Microsoft の請求では表示されない詳細な使用量ビューを確認できます。

<Admonition type="info" title="Note">

- 請求済みの Marketplace の料金と請求書には、Microsoft Cost Management を使用してください。

- 各組織内のプロジェクトレベルおよびクラスターレベルの使用量には、Zilliz Cloud の Usage ページを使用してください。

</Admonition>

### Microsoft Billing と Zilliz Cloud Usage を照合する\{#reconcile-microsoft-billing-and-zilliz-cloud-usage}

Microsoft の請求ビューと Zilliz Cloud の使用量ビューを照合するには、以下の項目を使用します。

- [Microsoft サブスクリプション](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-subscriptions)

- Microsoft Marketplace サブスクリプション

- Zilliz Cloud 組織名と組織 ID

- Zilliz Cloud プロジェクト名とプロジェクト ID

- Zilliz Cloud クラスター名とクラスター ID

## 考慮事項\{#considerations}

- Microsoft 側の Marketplace 支出をチームごとに分離する必要がある場合は、事業部ごとに 1 つの Microsoft Marketplace サブスクリプションと 1 つの Zilliz Cloud 組織を使用してください。

- 内部の使用量を分離するだけでよい場合は、複数のプロジェクトを持つ 1 つの組織の方がシンプルですが、Microsoft Marketplace の料金は分離されません。

- 個別の Microsoft 請求書 PDF は、Microsoft 請求アカウントの種類に依存し、Zilliz Cloud のアーキテクチャだけでは保証されません。

- 確約支出、プライベートオファー、複数の Marketplace サブスクリプションにまたがる共有コミットメントなどの商用条件については、Microsoft Sales または Marketplace Operations に確認してください。
