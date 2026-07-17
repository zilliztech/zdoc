---
title: "Google Cloud Marketplace の Public Offer にサブスクライブする | BYOC"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace における Zilliz Cloud の料金条件を示します。 | BYOC"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace の Public Offer にサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace における Zilliz Cloud の料金条件を示します。

<Admonition type="info" icon="📘" title="📘 注">

サブスクライブ後は、Google Cloud Marketplace 経由で Google Cloud cluster の利用料金を支払うことができます。他のクラウドプロバイダーにデプロイされた cluster がある場合でも、Google Cloud Marketplace を使用して支払うことができます。

</Admonition>

## 開始前に\{#before-you-start}

- [GCP account](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount) を持っていることを確認してください。

- サブスクリプションに使用する GCP project に billing account が設定されていることを確認してください。

- GCP Marketplace account が organization の一部である場合は、billing administrator によって購入権限が付与されている必要があります。

## GCP Marketplace でサブスクライブする\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下のように Zilliz Cloud へのサブスクライブを開始します。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)して Zilliz Cloud ポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizongcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. サブスクリプション対象の project を選択し、**Subscribe** をクリックします。 

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/clicksubscribeongcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、以下の手順を完了します。

    1. **Purchase details** セクションのドロップダウンから billing account を選択します。

    1. **Terms** を確認して同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/newzillizcloudsubscriptionongcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで、**SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    サインアッププロセスを完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページに移動して再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcpflashmessage.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud account をお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud)を選択して手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud organization にリンクします。

    1. 認可を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace から正常にサブスクライブした後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを実行できます。

- サブスクリプションに使用する Marketplace account を別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法の更新](./update-payment-method)を参照してください。

## GCP Marketplace のサブスクリプションをキャンセルする\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="注">

サブスクリプションをキャンセルすると、organization は Zilliz Cloud の高度な機能にアクセスできなくなります。organization に残っているクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、即座に凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルしたいプランが含まれる製品を選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[プランのキャンセル](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace のサブスクリプションを Zilliz Cloud にリンクする際、利用可能な organization が表示されない場合はどうすればよいですか？**

いくつかの原因が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない organization の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    organization を Marketplace のサブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。organization owner に連絡して支援を依頼してください。

- **すべての organization がすでに Marketplace のサブスクリプションに正常にリンクされている**

    すべての organization がすでに Marketplace のサブスクリプションにリンクされている場合に発生することがあります。利用できない organization の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合:

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその organization の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の organization が必要な場合は、[organization を作成](./organization-settings#create-an-organization)できます。

- **リストに organization がない**

    - account が閉鎖されている場合や、すべての organization から退出している場合に発生することがあります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のいずれかを実行できます。

    - [新しい organization を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに、そのユーザーの organization へあなたを[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらう。

