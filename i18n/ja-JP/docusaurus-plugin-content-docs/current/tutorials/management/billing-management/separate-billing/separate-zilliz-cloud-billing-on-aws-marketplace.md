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

AWS Marketplace 上の Zilliz Cloud の請求を事業部、チーム、ユースケース、アプリケーション、またはコストセンターごとに分離する必要がある場合は、事業部ごとに 1 つの AWS [メンバーアカウント](https://docs.aws.amazon.com/organizations/latest/userguide/orgs-manage_accounts_members.html)、1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用するパターンを推奨します。

請求の表示は AWS が提供します。Zilliz Cloud は [使用量](./analyze-cost) の表示を提供します。AWS 側で請求を分離するには、事業部ごとに 1 つの Zilliz Cloud 組織を使用し、それを対応する AWS メンバーアカウントから購入した Marketplace サブスクリプションに紐付けます。

## 概要\{#overview}

AWS Marketplace 上の Zilliz Cloud の請求を分離するには、各請求単位を 1 つの AWS メンバーアカウント、Zilliz Cloud 用の 1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織に対応付ける必要があります。

この構成では、[AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) は、選択した AWS メンバーアカウントの下に Marketplace の料金を表示します。一括請求を使用すると、組織は **管理アカウント** を通じて支払われる **1 つの請求書** を受け取りますが、使用量とコストは各 **メンバーアカウント** ごとに引き続き追跡できます。

![GvudwMSj7hDpbQbdIrqcGBbrn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/GvudwMSj7hDpbQbdIrqcGBbrn7e.png)

この構成では、以下のようになります。

- [AWS Organizations 管理アカウント](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) が [一括請求書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、支払います。

- 各 AWS メンバーアカウントは、コストの追跡とコスト配分のために引き続き確認できます。

- [AWS Marketplace サブスクリプション](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) は、それを購入または承諾した AWS メンバーアカウントに属します。

- [プライベートオファー](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html) を使用する場合は、サブスクライブする AWS アカウントに対してオファーが提示されていることを確認してください。AWS Organizations と一括請求を使用する購入者の場合、オファーの提示方法と管理方法に応じて、AWS では管理アカウントまたはメンバーアカウントのいずれからでもプライベートオファーを承諾できるようになっています。

- [Private Marketplace](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-private-marketplace.html) が有効になっている場合は、メンバーアカウントがサブスクライブする前に、該当するアカウント、OU、または組織に対して製品が承認されている必要がある場合があります。

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

<Admonition type="info" title="Note">

内部的な使用量の分離だけが必要な場合は、よりシンプルな代替手段として、1 つの組織で複数のプロジェクトを使用する方法があります。このモデルでは、Azure Marketplace の料金は 1 つのサブスクリプションの下にまとめられたままとなり、使用量の分割は Zilliz Cloud の使用量分析でのみ確認できます。

</Admonition>

### 比較\{#comparison}

| モデル | AWS Marketplace の請求を分離 | プロジェクトまたはチームごとに Zilliz の使用量を分離 | 最適な用途 |
| --- | --- | --- | --- |
| 事業部ごとに 1 つの組織 | はい | はい | メンバーアカウントごとに AWS 側のコストを分離する必要があるチーム |
| 複数のプロジェクトを持つ 1 つの組織 | いいえ | はい | 内部的な使用量の分離のみ |

## マルチ組織のセットアップ\{#multi-organization-setup}

各事業部で AWS Marketplace の請求を個別に分ける必要がある場合は、このモデルを使用します。

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

1. 対象の請求単位の AWS メンバーアカウントを使用して [AWS Marketplace](https://aws.amazon.com/marketplace) にサインインします。

1. Zilliz Cloud で、対象の請求単位に対応する Zilliz Cloud 組織に移動します。

1. Zilliz Cloud の Billing ページで **+ Add Payment Method** をクリックし、続いて **Marketplace** を選択します。**Subscribe Now** をクリックします。

    ![NCUmwUABRht89lbl0NKcBZ7on1e](https://zdoc-images.s3.us-west-2.amazonaws.com/NCUmwUABRht89lbl0NKcBZ7on1e.png)

1. AWS Marketplace にリダイレクトされます。そこで購入を完了します。

    詳細については、[AWS Marketplace でのサブスクライブ](./subscribe-on-aws-marketplace) を参照してください。

1. AWS Marketplace で **Set up your account** をクリックした後、一致する Zilliz Cloud 組織を選択します。

1. 必要に応じて組織 ID を確認します。

1. 認証を完了します。

</Procedures>

<Admonition type="info" title="Note">

- 各 Marketplace サブスクリプションは、1 つの Zilliz Cloud 組織にのみリンクできます。

- Marketplace サブスクリプションを Zilliz Cloud 組織に紐付けるには、その組織の Organization Owner または Organization Billing Admin である必要があります。

- 購入を完了する AWS ユーザーまたはロールには、AWS Marketplace 製品をサブスクライブする権限が必要です。AWS では、[`AWSMarketplaceManageSubscriptions`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceManageSubscriptions.html) や [`AWSMarketplaceFullAccess`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSMarketplaceFullAccess.html) などの Marketplace 管理ポリシーを提供しています。

</Admonition>

### AWS 請求書を個別に受け取り、料金を個別に確認する\{#receive-aws-invoices-and-view-charges-separately}

- 請求書は Zilliz Cloud ではなく AWS を通じて発行されます。

- [AWS Billing and Cost Management](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html) は、各 AWS メンバーアカウントの下に Marketplace の料金を表示します。

- メンバーアカウントが AWS Organizations に含まれている場合、管理アカウントが [一括請求書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html) を受け取り、メンバーアカウント全体の請求を追跡できます。

- 各事業部の Zilliz Cloud の支出は、それぞれの AWS Marketplace サブスクリプションの下に表示されます。

- AWS Marketplace の [サブスクリプションの詳細](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-managing-subscriptions.html) には、製品、ベンダー、契約 ID、契約ステータス、料金の概要、および該当する場合は発注書の詳細が含まれます。

- AWS 側のコスト配分は、AWS アカウント構造、[コスト配分タグ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)、[コストカテゴリ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-cost-categories.html)、および [発注書](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-purchase-orders.html) のモデルに従うことができます。

- 請求書の表示形式は、引き続き AWS アカウント、AWS Organizations、請求、および Marketplace 契約の設定に依存します。

### 各組織で使用量を個別に確認する\{#check-usage-separately-in-each-organization}

各 Zilliz Cloud 組織内では、Zilliz Cloud の [使用量](./analyze-cost) 分析を使用して、以下の単位で詳細を確認できます。

- プロジェクト

- クラスター

- 期間

- コストタイプ

- リージョン

これにより、AWS の請求では表示されない詳細な使用量ビューを確認できます。

<Admonition type="info" title="Note">

- 請求済みの Marketplace の料金と請求書には、AWS Billing and Cost Management を使用してください。

- 各組織内のプロジェクトレベルおよびクラスターレベルの使用量には、Zilliz Cloud の Usage ページを使用してください。

</Admonition>

### AWS Billing と Zilliz Cloud Usage を照合する\{#reconcile-aws-billing-and-zilliz-cloud-usage}

AWS の請求ビューと Zilliz Cloud の使用量ビューを照合するには、以下の項目を使用します。

- AWS Organizations 管理アカウント ID

- AWS メンバーアカウント ID

- AWS Marketplace サブスクリプションまたは契約 ID

- Zilliz Cloud 組織名と組織 ID

- Zilliz Cloud プロジェクト名とプロジェクト ID

- Zilliz Cloud クラスター名とクラスター ID

## 考慮事項\{#considerations}

- AWS 側の Marketplace 支出をチームごとに分離する必要がある場合は、事業部ごとに 1 つの AWS メンバーアカウント、1 つの AWS Marketplace サブスクリプション、および 1 つの Zilliz Cloud 組織を使用してください。

- 内部的な使用量の分離だけが必要な場合は、複数のプロジェクトを持つ 1 つの Zilliz Cloud 組織の方がシンプルですが、AWS Marketplace の請求は分離されません。

- 個別の AWS 請求書 PDF は、AWS アカウント構造、AWS Organizations の設定、請求設定、および Marketplace 契約条件に依存します。Zilliz Cloud のアーキテクチャだけでは保証されません。

- 確約支出、プライベートオファー、発注書、複数の Marketplace サブスクリプションにまたがる共有コミットメントなどの商用条件については、AWS Sales または Marketplace Operations に確認してください。
