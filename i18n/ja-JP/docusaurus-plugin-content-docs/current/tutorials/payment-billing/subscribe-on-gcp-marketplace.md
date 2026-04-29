---
title: "Google Cloud Marketplace で購読 | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_key: subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションプロセスの手順を段階的に説明し、GCP Marketplace における Zilliz Cloud の料金条件について概説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - マーケットプレイス
  - gcp

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace で購読する

このガイドでは、サブスクリプションプロセスのステップバイステップの説明と、GCP Marketplace における Zilliz Cloud の価格規約について説明します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、Google Cloud クラスターの使用料を Google Cloud Marketplace を介して支払うことができます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、Google Cloud Marketplace を使用して支払いを行うことができます。</p>

</Admonition>

## 始める前に\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)を持っていることを確認してください。

- サブスクリプションに使用する GCP プロジェクトに対して請求アカウントを設定していることを確認してください。

- GCP Marketplace アカウントが組織の一部である場合、請求管理者によって購入権限が付与されている必要があります。

## GCP Marketplace で購読する\{#subscribe-on-gcp-marketplace}

[GCP Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順に従って Zilliz Cloud の購読を開始してください。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace に移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1) して Zilliz Cloud ポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービスと価格について確認してください。

1. サブスクリプション用のプロジェクトを選択し、**購読** をクリックします。

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. **新しいZilliz Cloudサブスクリプション** ページで、以下の手順を実行します。

    1. **購入の詳細** セクションのドロップダウンから請求アカウントを選択します。

    1. **規約** を確認し、同意します。

    1. **購読** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで、**SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    <p>サインアッププロセスを完了できない場合は、GCP Marketplace の <strong><a href="https://console.cloud.google.com/marketplace/orders">Your Orders</a></strong> ページに移動して再試行できます。</p>

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。お持ちでない場合は、[登録オプション](./register-with-zilliz-cloud) のいずれかを選択してプロセスに従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認証を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **請求** に移動し、GCP Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## GCP Marketplace のサブスクリプションを更新する\{#update-gcp-marketplace-subscription}

GCP Marketplace から正常に購読した後、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用する GCP Marketplace アカウントを別のアカウントに変更するか、支払い方法を GCP Marketplace のサブスクリプションからクレジットカードに切り替えることができます。

### GCP Marketplace のサブスクリプションアカウントを変更する\{#change-gcp-marketplace-subscription-account}

<Procedures>

1. サブスクリプションに使用した元の GCP アカウントで GCP Marketplace にサインインします。

1. Zilliz Cloud のサブスクリプションをキャンセルします。詳細については、[プランのキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplace によるキャンセル処理の完了には数分かかります。

1. 元の GCP アカウントからサインアウトします。

1. サブスクリプションに使用したい新しい GCP アカウントで GCP Marketplace にサインインします。

1. [GCP Marketplace で購読する](./subscribe-on-gcp-marketplace#subscribe-on-gcp-marketplace) セクションの手順 1 から 4 に従って、新しいアカウントで Zilliz Cloud のサブスクリプションを完了します。

    <Admonition type="info" icon="📘" title="Note">

    <p>GCP Marketplace のサブスクリプションを更新する際は、Manage on Provider ボタンをクリックして、新しいサブスクリプションを Zilliz Cloud 組織にリンクする必要があります。</p>

    </Admonition>

1. **請求概要** ページの **支払い 方法** セクションで更新内容を確認します。サブスクリプション ID をクリックし、サブスクリプションの **アカウントID** が新しい Marketplace アカウントに更新されていることを確認します。

    ![view-gcp-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-gcp-subscription-id.png "view-gcp-subscription-id")

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<p>サービス中断を避けるため、操作は 1 時間以内に完了することをお勧めします。</p>

</Admonition>

### 支払い方法をクレジットカードに切り替える\{#switch-to-payment-credit-card}

<Procedures>

1. サブスクリプションに使用した元の GCP アカウントで GCP Marketplace にサインインします。

1. Zilliz Cloud のサブスクリプションをキャンセルします。詳細については、[プランのキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplace によるキャンセル処理の完了には数分かかります。

1. [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、支払い用のクレジットカードを追加します。

1. **請求概要** ページの **支払い 方法** セクションで更新内容を確認します。

</Procedures>

## GCP Marketplace のサブスクリプションをキャンセルする\{#cancel-gcp-marketplace-subscription}

GCP Marketplace のサブスクリプションをキャンセルするには、GCP Marketplace コンソールを開き、[こちら](https://cloud.google.com/marketplace/docs/manage-billing#cancel) の指示に従ってください。

## GCP Marketplace の価格規約\{#gcp-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms) を参照してください。

## トラブルシューティング\{#troubleshooting}

**マーケットプレイスのサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織が表示されない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です** 

    十分な権限がない場合に発生します。利用できない組織の隣に **"権限が不十分です"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    マーケットプレイスのサブスクリプションを組織にリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、単なる 組織メンバー の場合、必要な権限がありません。組織オーナーにお問い合わせください。

- **すべての組織がすでにマーケットプレイスのサブスクリプションにリンク済みである**

    すべての組織がすでにマーケットプレイスのサブスクリプションにリンクされている場合に発生します。利用できない組織の隣に **"マーケットプレイスにリンク済み"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存のマーケットプレイスサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションを [リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) し、その後新しいサブスクリプションを設定してください。

    - 異なるマーケットプレイスサブスクリプション用に複数の組織が必要な場合は、次のいずれかを行えます。

        - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して新しい組織を作成します。次に、組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) します。この組織オーナーは複数の組織に所属することになり、各組織ごとに異なるマーケットプレイスサブスクリプションを設定できます。

        - [サポートチケットを作成](http://support.zilliz.com) して、新規組織を作成してもらいます。現在、Zilliz Cloud ではユーザーが手動で組織を作成することはできません。

- **リストに組織がない**

    - アカウントが閉鎖されているか、すべての組織から脱退している場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のいずれかを行えます。

    - 新しい組織を作成します。

    - 他のユーザーに [招待](./organization-users#invite-a-user-to-your-organization) してもらい、組織オーナー の役割を付与してもらいます。

    - [サポートチケットを作成](https://support.zilliz.com/hc/en-us) して、新規組織を作成してもらいます。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplace で購読する](./subscribe-on-aws-marketplace)

- [Azure Marketplace で購読する](./subscribe-on-azure-marketplace)

- [請求書を表示する](./view-invoice) 

