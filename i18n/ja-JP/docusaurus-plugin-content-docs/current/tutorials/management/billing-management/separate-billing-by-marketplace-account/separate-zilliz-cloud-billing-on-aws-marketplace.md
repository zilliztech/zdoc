---
title: "AWS Marketplace で Zilliz Cloud の請求を分離する | Cloud"
slug: /separate-zilliz-cloud-billing-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Marketplace 上の Zilliz Cloud の請求を事業部、チーム、ユースケース、アプリケーション、またはコストセンターごとに分離する必要がある場合、推奨されるパターンは、事業部ごとに 1 つの AWS メンバーアカウント、1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用することです。 | Cloud"
type: origin
token: V7nZwzmpFiOokGksfTqcAcjcnXh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で Zilliz Cloud の請求を分離する

AWS Marketplace 上の Zilliz Cloud の請求を事業部、チーム、ユースケース、アプリケーション、またはコストセンターごとに分離する必要がある場合、推奨されるパターンは、事業部ごとに 1 つの AWS [メンバーアカウント](https://docs.aws.amazon.com/organizations/latest/userguide/orgs-manage_accounts_members.html)、1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用することです。

AWS は請求ビューを提供します。Zilliz Cloud は [使用量](./analyze-cost)ビューを提供します。AWS 側で請求を分離するには、事業部ごとに 1 つの Zilliz Cloud 組織を使用し、それを対応する AWS メンバーアカウントから購入した Marketplace サブスクリプションに紐付けます。

## 概要\{#overview}

AWS Marketplace 上で Zilliz Cloud の請求を分離するには、各請求単位を 1 つの AWS メンバーアカウント、Zilliz Cloud 用の 1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織に対応付ける必要があります。

このセットアップでは、[AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) により、選択した AWS メンバーアカウントの下に Marketplace の請求が表示されます。一括請求を使用すると、AWS Organizations の組織は **管理アカウント** を通じて支払われる **1 つの請求書** を受け取り、使用量とコストは各 **メンバーアカウント** ごとに引き続き追跡できます。

![GvudwMSj7hDpbQbdIrqcGBbrn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/GvudwMSj7hDpbQbdIrqcGBbrn7e.png)

このセットアップでは、次のようになります。

- [AWS Organizations 管理アカウント](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) が [一括請求書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、支払います。

- 各 AWS メンバーアカウントは、コスト追跡とコスト配分のために引き続き可視化されます。

- [AWS Marketplace サブスクリプション](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) は、それを購入または受諾した AWS メンバーアカウントに属します。

- [プライベートオファー](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html) を使用する場合は、サブスクライブする AWS アカウントに対してオファーが提示されていることを確認してください。AWS Organizations と一括請求を使用する購入者の場合、オファーの提示および管理方法に応じて、AWS では管理アカウントまたはメンバーアカウントのいずれからでもプライベートオファーを受諾できます。

- [Private Marketplace](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-private-marketplace.html) が有効になっている場合、メンバーアカウントがサブスクライブする前に、対象のアカウント、OU、または組織に対して製品の承認が必要になることがあります。

以下は、3 つの異なるチームの請求を分離する例です。

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

内部的な使用量の分離だけが必要な場合は、より簡単な代替手段として、1 つの組織と複数のプロジェクトを使用できます。このモデルでは、Azure Marketplace の請求は 1 つのサブスクリプションの下にまとめられたままとなり、使用量の分割は Zilliz Cloud の使用量分析を通じてのみ可視化されます。

</Admonition>

### 比較\{#comparison}

| Model | AWS Marketplace の請求を分離 | Zilliz の使用量をプロジェクトまたはチームごとに分離 | 最適な用途 |
| --- | --- | --- | --- |
| 事業部ごとに 1 つの組織 | Yes | Yes | メンバーアカウントごとに AWS 側でのコスト分離が必要なチーム。 |
| 1 つの組織に複数のプロジェクト | No | Yes | 内部的な使用量の分離のみ |

## 複数組織のセットアップ\{#multi-organization-setup}

各事業部で AWS Marketplace の請求を個別にする必要がある場合は、このモデルを使用します。

### 複数の組織を準備する\{#prepare-multiple-organizations}

新しい Zilliz Cloud アカウントの登録では、自動的に 1 つのデフォルト組織が作成されます。

複数の組織を準備するには、次の手順に従います。

<Procedures>

1. [サポートチケットを送信](http://support.zilliz.com)して、マルチ組織機能を有効化できるようにしてください。

1. 機能が有効になったら、手動で[新しい組織を作成](./organization-settings#create-an-organization)できます。

</Procedures>

各組織には、それぞれ次のものがあります。

- 請求と支払い方法

- ユーザーと RBAC

- プロジェクト

- クラスター

- 使用量分析データ

### 各組織に 1 つの Marketplace サブスクリプションを紐付ける\{#bind-one-marketplace-subscription-to-each-organization}

各事業部について、次の手順を実行します。

<Procedures>

1. 対象の請求単位に対応する AWS メンバーアカウントを使用して [AWS Marketplace](https://aws.amazon.com/marketplace) にサインインします。

1. Zilliz Cloud で、対象の請求単位に対応する Zilliz Cloud 組織に移動します。

1. Zilliz Cloud の Billing ページで、**+ Add Payment Method** をクリックし、**Marketplace** を選択します。次に **Subscribe Now** をクリックします。

    ![NCUmwUABRht89lbl0NKcBZ7on1e](https://zdoc-images.s3.us-west-2.amazonaws.com/NCUmwUABRht89lbl0NKcBZ7on1e.png)

1. AWS Marketplace にリダイレクトされます。そこで購入を完了してください。

    詳細は、[Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace) を参照してください。

1. AWS Marketplace で **Set up your account** をクリックした後、一致する Zilliz Cloud 組織を選択します。

1. 必要に応じて組織 ID を確認します。

1. 認可を完了します。

</Procedures>

<Admonition type="info" icon="📘" title="Note">

- 各 Marketplace サブスクリプションは、1 つの Zilliz Cloud 組織にのみリンクできます。

- Marketplace サブスクリプションを Zilliz Cloud 組織に紐付けるには、その組織の Organization Owner または Organization Billing Admin である必要があります。

- 購入を完了する AWS ユーザーまたはロールには、AWS Marketplace 製品をサブスクライブする権限が必要です。AWS は、[`AWSMarketplaceManageSubscriptions`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html) や [`AWSMarketplaceFullAccess`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceFullAccess.html) などの Marketplace マネージドポリシーを提供しています。

</Admonition>

### AWS の請求書を受け取り、請求を個別に表示する\{#receive-aws-invoices-and-view-charges-separately}

- 請求書は Zilliz Cloud ではなく AWS を通じて発行されます。

- [AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) では、各 AWS メンバーアカウントの下に Marketplace の請求が表示されます。

- メンバーアカウントが AWS Organizations に含まれている場合、管理アカウントが [一括請求書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、メンバーアカウント全体の請求を追跡できます。

- 各事業部の Zilliz Cloud の支出は、それぞれの AWS Marketplace サブスクリプションの下に表示されます。

- AWS Marketplace の [サブスクリプション詳細](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) には、製品、ベンダー、契約 ID、契約ステータス、請求サマリー、および該当する場合は発注書の詳細が含まれます。

- AWS 側のコスト配分は、AWS アカウント構造、[コスト配分タグ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)、[コストカテゴリ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-cost-categories.html)、および [発注書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-purchase-orders.html) モデルに従って行えます。

- 請求書の表示形式は、依然として AWS アカウント、AWS Organizations、請求、および Marketplace 契約の構成に依存します。

### 各組織で使用量を個別に確認する\{#check-usage-separately-in-each-organization}

各 Zilliz Cloud 組織内では、Zilliz Cloud の [使用量](./analyze-cost)分析を使用して、次の項目ごとに詳細を確認できます。

- プロジェクト

- クラスター

- 期間

- コストタイプ

- リージョン

これにより、AWS の請求では表示されない詳細な使用量ビューが提供されます。

<Admonition type="info" icon="📘" title="Note">

- 請求済みの Marketplace 料金と請求書については AWS Billing and Cost Management を使用してください。

- 各組織内のプロジェクトレベルおよびクラスターレベルの使用量については Zilliz Cloud Usage ページを使用してください。

</Admonition>

### AWS Billing と Zilliz Cloud Usage を照合する\{#reconcile-aws-billing-and-zilliz-cloud-usage}

AWS の請求ビューと Zilliz Cloud の使用量ビューを照合するには、次の要素を使用します。

- AWS Organizations 管理アカウント ID

- AWS メンバーアカウント ID

- AWS Marketplace サブスクリプションまたは契約 ID

- Zilliz Cloud 組織名と組織 ID

- Zilliz Cloud プロジェクト名とプロジェクト ID

- Zilliz Cloud クラスター名とクラスター ID

## 考慮事項\{#considerations}

- AWS 側の Marketplace 支出をチームごとに分離する必要がある場合は、事業部ごとに 1 つの AWS メンバーアカウント、1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用してください。

- 内部的な使用量の分離だけが必要な場合は、複数のプロジェクトを持つ 1 つの Zilliz Cloud 組織の方が簡単ですが、AWS Marketplace の請求は分離されません。

- AWS の請求書 PDF を個別に分けられるかどうかは、AWS アカウント構造、AWS Organizations の設定、請求構成、および Marketplace 契約条件に依存します。Zilliz Cloud のアーキテクチャだけでは保証されません。

- コミット済み支出、プライベートオファー、発注書、または複数の Marketplace サブスクリプションにまたがる共有コミットメントなどの商用条件については、AWS Sales または Marketplace Operations に確認してください。

