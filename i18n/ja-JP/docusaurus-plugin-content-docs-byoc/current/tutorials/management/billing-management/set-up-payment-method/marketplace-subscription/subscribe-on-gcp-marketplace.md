---
title: "Google Cloud Marketplace でパブリックオファーをサブスクライブする | BYOC"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（パブリックオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの手順を順を追って説明し、GCP Marketplace における Zilliz Cloud の価格条件について概説します。 | BYOC"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace でパブリックオファーをサブスクライブする

このガイドでは、サブスクリプションの手順を順を追って説明し、GCP Marketplace における Zilliz Cloud の価格条件について概説します。

<Admonition type="info" title="Note">

サブスクライブ後は、Google Cloud Marketplace 経由で Google Cloud クラスターの利用料金を支払えます。他のクラウドプロバイダーにクラスターをデプロイしている場合も、Google Cloud Marketplace で支払いを行えます。

</Admonition>

## 事前準備\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount) を持っていること。

- サブスクリプションに使用する GCP プロジェクトに請求先アカウントを設定していること。

- GCP Marketplace アカウントが組織に属している場合は、請求管理者から購入の承認を得ていること。

## GCP Marketplace でサブスクライブする\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクリプションを開始します。

<Procedures>

1. 検索ボックスに **Zilliz Cloud** と入力するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizongcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. サブスクリプションに使用するプロジェクトを選択し、**Subscribe** をクリックします。

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/clicksubscribeongcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、以下の手順を実行します。

    1. **Purchase details** セクションのドロップダウンから請求先アカウントを選択します。

    1. **Terms** を確認して同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/newzillizcloudsubscriptionongcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで **SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" title="Notes">

    サインアップを完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページに移動して再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcpflashmessage.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了してください。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ オプション](./register-with-zilliz-cloud) を選択し、手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認可を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法の更新\{#update-subscription-or-payment-method}

Marketplace からサブスクリプションに成功した後は、必要に応じていつでもサブスクリプションを更新できます。

具体的には、以下のいずれかを実行できます。

- サブスクリプションに使用する Marketplace アカウントを別のアカウントに変更する。

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える。

詳細については、[支払い方法の更新](./update-payment-method) を参照してください。

## GCP Marketplace サブスクリプションのキャンセル\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルするプランを含むプロダクトを選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[プランのキャンセル](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足**

    十分な権限がない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみの場合は必要な権限がありません。組織のオーナーに問い合わせてください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、以下の対応を行ってください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織がない**

    - アカウントが閉鎖された場合や、すべての組織から退出した場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、以下のいずれかを実行できます。

    - [新しい組織を作成](./organization-settings#create-an-organization) する。

    - 他のユーザーに依頼し、そのユーザーの組織へ[招待](./manage-platform-users#invite-organization-members)してもらい、Organization Owner ロールを付与してもらう。
