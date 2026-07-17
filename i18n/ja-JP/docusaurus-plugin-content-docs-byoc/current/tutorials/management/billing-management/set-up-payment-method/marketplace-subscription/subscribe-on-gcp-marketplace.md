---
title: "Google Cloud Marketplace の Public Offer をサブスクライブする | BYOC"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace 上の Zilliz Cloud の料金体系について概説します。 | BYOC"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace の Public Offer をサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace 上の Zilliz Cloud の料金体系について概説します。

<Admonition type="info" icon="📘" title="📘 注記">

サブスクライブすると、Google Cloud Marketplace 経由で Google Cloud クラスターの使用料金を支払えるようになります。他のクラウドプロバイダーにクラスターをデプロイしている場合でも、Google Cloud Marketplace を使用して支払うことができます。

</Admonition>

## 始める前に\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount) を持っていることを確認してください。

- サブスクリプションに使用する GCP プロジェクトに対して請求先アカウントが設定されていることを確認してください。

- GCP Marketplace アカウントが組織の一部である場合は、請求管理者による購入権限が必要です。

## GCP Marketplace でサブスクライブする\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下のように Zilliz Cloud のサブスクライブを開始します。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace にアクセスして](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)、Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. サブスクリプション用のプロジェクトを選択し、**Subscribe** をクリックします。 

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、以下の手順を完了します。

    1. **Purchase details** セクションのドロップダウンから請求先アカウントを選択します。

    1. **Terms** を確認し、同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで **SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="注記">

    サインアッププロセスを完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページに移動して再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントを持っている場合は、そのままログインします。持っていない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択し、手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認可を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からのサブスクライブに成功した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを行えます。

- サブスクリプションに使用する Marketplace アカウントを別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、「支払い方法を更新する」を参照してください。

## GCP Marketplace のサブスクリプションをキャンセルする\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="注記">

サブスクリプションをキャンセルすると、組織は高度な Zilliz Cloud 機能へのアクセスを失います。組織に残っているクレジットがない場合、またはすべてのクレジットが期限切れの場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルしたいプランが含まれる製品を選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling your plan](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace のサブスクリプションを Zilliz Cloud にリンクするときに、利用可能な組織が表示されない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace のサブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみである場合は、必要な権限がありません。サポートについては、組織の所有者にお問い合わせください。

- **すべての組織がすでに Marketplace のサブスクリプションに正常にリンクされている**

    これは、すべての組織がすでに Marketplace のサブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、次のいずれかを行ってください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合、またはすべての組織から離脱している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のことができます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、自分をその組織に[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらってください。

