---
title: "Google Cloud Marketplace の公開オファーをサブスクライブする | BYOC"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（公開オファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace 上の Zilliz Cloud の料金体系を概説します。 | BYOC"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace の公開オファーをサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、GCP Marketplace 上の Zilliz Cloud の料金体系を概説します。

<Admonition type="info" icon="📘" title="📘 Note">

サブスクライブすると、Google Cloud Marketplace 経由で Google Cloud クラスターの利用料金を支払うことができます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、Google Cloud Marketplace を使用して支払うことができます。

</Admonition>

## 始める前に\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)があることを確認してください。

- サブスクリプションに使用する GCP プロジェクトに対して請求先アカウントが設定されていることを確認してください。

- GCP Marketplace アカウントが組織に属している場合、請求管理者から購入権限を付与されている必要があります。

## GCP Marketplace でサブスクライブする\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクリプションを開始します。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)して Zilliz Cloud ポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. サブスクリプション対象のプロジェクトを選択し、**Subscribe** をクリックします。 

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、次の手順を完了します。

    1. **Purchase details** セクションのドロップダウンから請求先アカウントを選択します。

    1. **Terms** を確認し、同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで **SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    サインアップ手順を完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページに移動して再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud)を選択し、手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認証を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からのサブスクリプションが正常に完了した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを行えます。

- サブスクリプションに使用している Marketplace アカウントを別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法の更新](./update-payment-method)を参照してください。

## GCP Marketplace のサブスクリプションをキャンセルする\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、即座に凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルしたいプランを含む製品を選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[プランのキャンセル](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに、利用可能な組織がない場合はどうすればよいですか？**

いくつかの原因が考えられます。

- **権限不足** 

    これは、十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace サブスクリプションで組織をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみの場合は、必要な権限がありません。サポートについては組織の所有者にお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    これは、すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、次のとおりです。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合、またはすべての組織から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、自分をその組織に[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner の役割を付与してもらいます。

