---
title: "Google Cloud Marketplace でパブリックオファーに登録する | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace（パブリックオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、登録手順を順を追って説明し、GCP Marketplace における Zilliz Cloud の料金条件について概説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace でパブリックオファーに登録する

このガイドでは、登録手順を順を追って説明し、GCP Marketplace における Zilliz Cloud の料金条件について概説します。

<Admonition type="info" icon="📘" title="📘 Note">

登録後は、Google Cloud Marketplace を通じて Google Cloud クラスターの利用料金を支払えます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、Google Cloud Marketplace を使って支払いが可能です。

</Admonition>

## 事前準備\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)を用意してください。

- 登録に使用する GCP プロジェクトに請求先アカウントが設定されていることを確認してください。

- GCP Marketplace アカウントが組織に属している場合は、請求管理者から購入権限を付与されている必要があります。

## GCP Marketplace で登録する\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud への登録を開始します。

<Procedures>

1. 検索ボックスに **Zilliz Cloud** と入力するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizongcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金をご確認ください。

1. 登録対象のプロジェクトを選択し、**Subscribe** をクリックします。

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/clicksubscribeongcp.png "click_subscribe_on_gcp")

1. **New Zilliz Cloud subscription** ページで、以下の手順を実行します。

    1. **Purchase details** セクションのドロップダウンから請求先アカウントを選択します。

    1. **Terms** を確認し、同意します。

    1. **Subscribe** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/newzillizcloudsubscriptionongcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで **SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    登録手続きを完了できない場合は、GCP Marketplace の **[Your Orders](https://console.cloud.google.com/marketplace/orders)** ページから再試行できます。

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcpflashmessage.png "gcp_flash_message")

1. 新しく開いたタブで、以下の手順に従って登録を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合はログインしてください。お持ちでない場合は、[登録オプション](./register-with-zilliz-cloud)を選択して手続きを進めます。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認可を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **Billing** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法の更新\{#update-subscription-or-payment-method}

Marketplace からの登録完了後、必要に応じていつでもサブスクリプションを更新できます。

具体的には、以下のいずれかの操作が可能です。

- サブスクリプションに使用している Marketplace アカウントを別のアカウントに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法の更新](./update-payment-method)を参照してください。

## GCP Marketplace サブスクリプションのキャンセル\{#cancel-gcp-marketplace-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能を利用できなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、組織が直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. キャンセルしたいプランが含まれる製品を選択します。

1. **Actions available to manage your orders** をクリックします。

1. **Cancel purchase** または **Cancel subscription** を選択します。

</Procedures>

詳細については、[プランのキャンセル](https://docs.cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織が表示されない場合はどうすればよいですか？**

いくつかの原因が考えられます。

- **権限が不十分である**

    必要な権限を持っていない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。Organization Member のみでは必要な権限がありませんので、組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションにリンクされている**

    所有するすべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応を行ってください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織が表示されない**

    - アカウントが閉鎖された場合や、すべての組織から脱退した場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下のいずれかの操作が可能です。

    - [新しい組織を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに、自身の組織への[招待](./manage-platform-users#invite-organization-users)と Organization Owner ロールの付与を依頼する。

