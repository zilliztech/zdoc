---
title: "AWS Marketplace で Zilliz Cloud 請求を分離する | Cloud"
slug: /separate-zilliz-cloud-billing-on-aws-marketplace
sidebar_key: separate-zilliz-cloud-billing-on-aws-marketplace
sidebar_label: "AWS Marketplace"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "AWS Marketplace 上の Zilliz Cloud 請求を事業部、チーム、ユースケース、アプリケーション、または cost center ごとに分離する必要がある場合は、事業部ごとに AWS member account 1 つ、AWS Marketplace subscription 1 つ、Zilliz Cloud 組織 1 つを使用する構成が推奨されます。 | Cloud"
type: origin
token: V7nZwzmpFiOokGksfTqcAcjcnXh
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - aws
  - 使用量
  - 請求の分離

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で Zilliz Cloud 請求を分離する

AWS Marketplace 上の Zilliz Cloud 請求を事業部、チーム、ユースケース、アプリケーション、または cost center ごとに分離する必要がある場合は、事業部ごとに AWS [member account](https://docs.aws.amazon.com/organizations/latest/userguide/orgs-manage_accounts_members.html) 1 つ、AWS Marketplace subscription 1 つ、Zilliz Cloud 組織 1 つを使用する構成が推奨されます。

AWS は請求ビューを提供します。Zilliz Cloud は[使用量](./analyze-cost)ビューを提供します。AWS 側で請求を分離するには、事業部ごとに 1 つの Zilliz Cloud 組織を使用し、対応する AWS member account から購入した Marketplace subscription にバインドします。

## 概要\{#overview}

AWS Marketplace 上の Zilliz Cloud 請求を分離するには、各請求単位を AWS member account 1 つ、Zilliz Cloud 用 AWS Marketplace subscription 1 つ、Zilliz Cloud 組織 1 つに対応付けます。

この設定では、[AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) により、選択した AWS member account 配下に Marketplace 料金が表示されます。一括請求では、組織は **management account** を通じて支払われる **1 つの請求書** を受け取り、各 **member account** の使用量とコストは引き続き追跡できます。

![GvudwMSj7hDpbQbdIrqcGBbrn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/GvudwMSj7hDpbQbdIrqcGBbrn7e.png)

この設定では、次のようになります。

- [AWS Organizations management account](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) は、[consolidated bill](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、支払います。

- 各 AWS member account は、コスト追跡とコスト配賦のために引き続き表示されます。

- [AWS Marketplace subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) は、それを購入または承諾した AWS member account に属します。

- [private offer](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html) を使用する場合は、サブスクライブする AWS アカウントにオファーが拡張されていることを確認してください。AWS Organizations と一括請求を使用する購入者の場合、AWS では、オファーの拡張方法と管理方法に応じて、management account または member account のいずれからでも private offer を承諾できます。

- [Private Marketplace](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-private-marketplace.html) が有効な場合、member account がサブスクライブできるようになる前に、関連するアカウント、OU、または組織に対して製品の承認が必要になることがあります。

次の例は、3 つの異なるチームの請求を分離する構成を示しています。

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

内部の使用量分離だけが必要な場合は、1 つの組織で複数のプロジェクトを使用する方が簡単です。このモデルでは、Azure Marketplace の料金は 1 つのサブスクリプションにまとめられたままで、使用量の分割は Zilliz Cloud の使用量分析でのみ確認できます。

</Admonition>

### 比較\{#comparison}

<table>
   <tr>
     <th><p>モデル</p></th>
     <th><p>AWS Marketplace 料金を分離する</p></th>
     <th><p>Zilliz の使用量をプロジェクトまたはチームごとに分離する</p></th>
     <th><p>最適な用途</p></th>
   </tr>
   <tr>
     <td><p>事業部ごとに 1 つの組織</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td><p>member account ごとに AWS 側のコスト分離が必要なチーム。</p></td>
   </tr>
   <tr>
     <td><p>1 つの組織に複数のプロジェクト</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>内部の使用量分割のみ</p></td>
   </tr>
</table>

## 複数組織のセットアップ\{#multi-organization-setup}

各事業部で AWS Marketplace 請求を分離する必要がある場合は、このモデルを使用します。

### 複数の組織を準備する\{#prepare-multiple-organizations}

新しい Zilliz Cloud アカウントを登録すると、デフォルトの組織が 1 つ自動的に作成されます。

複数の組織を準備するには、次の手順に従います。

<Procedures>

1. マルチ組織機能を有効にできるよう、[サポートチケットを送信](http://support.zilliz.com)してください。

1. 機能が有効になると、手動で[新しい組織を作成](./organization-settings#create-an-organization)できます。

</Procedures>

各組織には、それぞれ次のものがあります。

- 請求と支払い方法

- ユーザーと RBAC

- プロジェクト

- クラスター

- 使用量分析データ

### 各組織に 1 つの Marketplace subscription をバインドする\{#bind-one-marketplace-subscription-to-each-organization}

各事業部について、次の手順に従います。

<Procedures>

1. 対象の請求単位に対応する AWS member account を使用して [AWS Marketplace](https://aws.amazon.com/marketplace) にサインインします。

1. Zilliz Cloud で、対象の請求単位に対応する Zilliz Cloud 組織に移動します。

1. Zilliz Cloud の Billing ページで、**+ Add Payment Method** をクリックし、**Marketplace** を選択します。**Subscribe Now** をクリックします。

    ![NCUmwUABRht89lbl0NKcBZ7on1e](https://zdoc-images.s3.us-west-2.amazonaws.com/NCUmwUABRht89lbl0NKcBZ7on1e.png)

1. AWS Marketplace にリダイレクトされます。そこで購入を完了します。

    詳細については、[AWS Marketplace でサブスクライブする](./subscribe-on-aws-marketplace)を参照してください。

1. AWS Marketplace で **Set up your account** をクリックした後、一致する Zilliz Cloud 組織を選択します。

1. 必要に応じて組織 ID を確認します。

1. 認可を完了します。

</Procedures>

<Admonition type="info" icon="📘" title="Note">

- 各 Marketplace subscription は、1 つの Zilliz Cloud 組織にのみリンクできます。

- Marketplace subscription を Zilliz Cloud 組織にバインドするには、その組織の Organization Owner または Organization Billing Admin である必要があります。

- 購入を完了する AWS ユーザーまたはロールには、AWS Marketplace 製品をサブスクライブする権限が必要です。AWS は [`AWSMarketplaceManageSubscriptions`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html) や [`AWSMarketplaceFullAccess`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceFullAccess.html) などの Marketplace 管理ポリシーを提供しています。

</Admonition>

### AWS 請求書を受け取り、料金を個別に表示する\{#receive-aws-invoices-and-view-charges-separately}

- 請求書は Zilliz Cloud ではなく AWS を通じて発行されます。

- [AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) には、各 AWS member account 配下の Marketplace 料金が表示されます。

- member account が AWS Organizations に属している場合、management account は [consolidated bill](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、member account 全体の料金を追跡できます。

- 各事業部の Zilliz Cloud 支出は、それぞれの AWS Marketplace subscription 配下に表示されます。

- AWS Marketplace の[サブスクリプション詳細](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html)には、製品、ベンダー、契約 ID、契約ステータス、料金概要、該当する場合は発注書の詳細が含まれます。

- AWS 側のコスト配賦は、AWS アカウント構造、[cost allocation tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)、[cost categories](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-cost-categories.html)、および[発注書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-purchase-orders.html)モデルに従うことができます。

- 請求書の表示形式は、AWS アカウント、AWS Organizations、請求、Marketplace 契約の設定に引き続き依存します。

### 各組織で使用量を個別に確認する\{#check-usage-separately-in-each-organization}

各 Zilliz Cloud 組織内で、Zilliz Cloud の[使用量](./analyze-cost)分析を使用し、次の項目でドリルダウンします。

- プロジェクト

- クラスター

- 時間範囲

- コストタイプ

- リージョン

これにより、AWS 請求では表示されない詳細な使用量ビューが提供されます。

<Admonition type="info" icon="📘" title="Note">

- 請求済みの Marketplace 料金と請求書については、AWS Billing and Cost Management を使用します。

- 各組織内のプロジェクトレベルおよびクラスターレベルの使用量については、Zilliz Cloud Usage ページを使用します。

</Admonition>

### AWS Billing と Zilliz Cloud Usage を照合する\{#reconcile-aws-billing-and-zilliz-cloud-usage}

AWS の請求ビューと Zilliz Cloud の使用量ビューを照合するには、次の構成要素を使用します。

- AWS Organizations management account ID

- AWS member account ID

- AWS Marketplace subscription または agreement ID

- Zilliz Cloud 組織名と組織 ID

- Zilliz Cloud プロジェクト名とプロジェクト ID

- Zilliz Cloud クラスター名とクラスター ID

## 考慮事項\{#considerations}

- AWS 側の Marketplace 支出をチームごとに分離する必要がある場合は、事業部ごとに AWS member account 1 つ、AWS Marketplace subscription 1 つ、Zilliz Cloud 組織 1 つを使用します。

- 内部の使用量分離だけが必要な場合は、1 つの Zilliz Cloud 組織で複数のプロジェクトを使用する方が簡単ですが、AWS Marketplace 料金は分離されません。

- AWS の請求書 PDF を分離できるかどうかは、AWS アカウント構造、AWS Organizations のセットアップ、請求設定、Marketplace 契約条件に依存します。Zilliz Cloud のアーキテクチャだけでは保証されません。

- committed spend、private offers、purchase orders、複数の Marketplace subscription にまたがる shared commitments などの商取引条件については、AWS Sales または Marketplace Operations に確認してください。
