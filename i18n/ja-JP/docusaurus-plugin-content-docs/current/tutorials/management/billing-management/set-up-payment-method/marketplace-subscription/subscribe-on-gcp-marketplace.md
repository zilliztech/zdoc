---
title: "Google Cloud Marketplace の Public Offer を購読する | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace における Zilliz Cloud の料金体系について概説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace の Public Offer を購読する

このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace における Zilliz Cloud の料金体系について概説します。

<Admonition type="info" icon="📘" title="📘 注">

購読後は、Google Cloud Marketplace 経由で Google Cloud cluster の利用料金を支払うことができます。他のクラウドプロバイダー上に cluster をデプロイしている場合でも、Google Cloud Marketplace を使用して支払うことができます。

</Admonition>

## 開始前に\{#before-you-start}

- [GCP account](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount) を持っていることを確認してください。

- サブスクリプションに使用する GCP project に対して billing account が設定されていることを確認してください。

- GCP Marketplace account が organization の一部である場合は、billing administrator によって購入権限が付与されている必要があります。

## GCP Marketplace で購読する\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud の購読を開始します。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. 購読する project を選択し、**Subscribe** をクリックします。 

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、以下の手順を完了します。

    1. **Purchase details** セクションのドロップダウンから billing account を選択します。

    1. **Terms** を確認し、同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで、**SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    サインアッププロセスを完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページに移動して再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従って購読を完了します。

    1. すでに Zilliz Cloud account を持っている場合は、そのままログインします。持っていない場合は、[sign-up option](./register-with-zilliz-cloud) を選択して手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud organization にリンクします。

    1. 認可を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からの購読が正常に完了した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを行えます。

- サブスクリプションに使用している Marketplace account を別のものに変更する

- 支払い方法を Marketplace subscription からクレジットカードに切り替える。

詳細については、支払い方法の更新を参照してください。

## GCP Marketplace のサブスクリプションをキャンセルする\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="注">

サブスクリプションをキャンセルすると、organization は Zilliz Cloud の高度な機能にアクセスできなくなります。organization に利用可能なクレジットが残っていない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルしたいプランが含まれる製品を選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling your plan](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace subscription を Zilliz Cloud にリンクするときに、利用可能な organization が表示されない場合はどうすればよいですか？**

原因はいくつか考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない organization の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace subscription に organization をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。organization owner に連絡してサポートを依頼してください。

- **すべての organization がすでに Marketplace subscription に正常にリンクされている**

    すべての organization がすでに Marketplace subscription にリンクされている場合に発生することがあります。利用できない organization の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は次のとおりです。

    - 既存の marketplace subscription を更新する必要がある場合は、まずその organization の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace subscription 用に複数の organization が必要な場合は、[organization を作成](./organization-settings#create-an-organization)できます。

- **リストに organization がない**

    - account が閉鎖されている場合、またはすべての organization から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい organization を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに、そのユーザーの organization へあなたを[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらう。

