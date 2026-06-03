---
title: "Google Cloud Marketplace での購読 | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_key: subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、GCP Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、料金体系についても解説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - gcp

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace での購読

このガイドでは、GCP Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、価格設定の規約を概説します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、Google Cloud クラスターの使用料金を Google Cloud Marketplace で支払うことができます。他のクラウドプロバイダーにデプロイしたクラスターがある場合も、Google Cloud Marketplace を使用して支払いを行うことができます。</p>

</Admonition>

## 開始前に\{#before-you-start}

- [GCP アカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount) を持っていることを確認してください。

- 購読に使用する GCP プロジェクトの請求アカウントが設定されていることを確認してください。

- GCP Marketplace アカウントが組織の一部である場合、請求管理者から購入の権限を付与されている必要があります。

## GCP Marketplace での購読\{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace)[ Marketplace](https://console.cloud.google.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud の購読を開始します：

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[GCP Marketplace にアクセス](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1) して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_gcp.png "search_for_zilliz_on_gcp")

1. **Zilliz Cloud** をクリックします。

    サービスと価格設定を確認してください。

1. 購読するプロジェクトを選択し、**購読** をクリックします。

    ![click_subscribe_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/click_subscribe_on_gcp.png "click_subscribe_on_gcp")

1. **新しいZilliz Cloudサブスクリプション** ページで、以下の手順を完了します：

    1. **購入の詳細** セクションのドロップダウンから請求アカウントを選択します。

    1. **規約** を確認して同意します。

    1. **購読** をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/new_zilliz_cloud_subscription_on_gcp.png "new_zilliz_cloud_subscription_on_gcp")

1. ポップアップウィンドウで、**SIGN UP WITH ZILLIZ** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    <p>サインアッププロセスを完了できない場合は、GCP Marketplace の <strong><a href="https://console.cloud.google.com/marketplace/orders">Your Orders</a></strong> ページに移動して再試行できます。</p>

    </Admonition>

    ![gcp_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp_flash_message.png "gcp_flash_message")

1. 新しいタブで、以下の手順に従って購読を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。ない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択してプロセスに従ってください。

    1. 購読を既存の Zilliz Cloud 組織にリンクします。

    1. 認証を完了します。

    ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. **請求** に移動し、GCP Marketplace の購読が支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/gcp-marketplace-success.png "gcp-marketplace-success")

</Procedures>

## GCP Marketplace 購読の更新\{#update-gcp-marketplace-subscription}

GCP Marketplace からの購読が成功した後、いつでも適切なタイミングで購読を更新できます。具体的には、購読に使用する GCP Marketplace アカウントを別のアカウントに変更するか、支払い方法を GCP Marketplace の購読からクレジットカードに切り替えることができます。

### GCP Marketplace 購読アカウントの変更\{#change-gcp-marketplace-subscription-account}

<Procedures>

1. 購読に使用した元の GCP アカウントで GCP Marketplace にサインインします。

1. Zilliz Cloud の購読をキャンセルします。詳細については [プランのキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>購読をキャンセルしても、Zilliz Cloud のデータは削除されないのでご安心ください。</p>

    </Admonition>

    GCP Marketplace でキャンセル処理が完了するまで数分かかります。

1. 元の GCP アカウントからサインアウトします。

1. 購読に使用したい新しい GCP アカウントで GCP Marketplace にサインインします。

1. [GCP Marketplace での購読](./subscribe-on-gcp-marketplace#subscribe-on-gcp-marketplace) セクションの手順 1 から 4 に従って、新しいアカウントで Zilliz Cloud の購読を完了します。

    <Admonition type="info" icon="📘" title="Note">

    <p>GCP Marketplace の購読を更新する際は、Manage on Provider ボタンをクリックして、新しい購読を Zilliz Cloud 組織とリンクする必要があります。</p>

    </Admonition>

1. **請求概要** ページの **支払い 方法** セクションで更新を確認します。Subscription ID をクリックし、購読の **アカウントID** が新しい Marketplace アカウントに更新されているか確認します。

    ![view-gcp-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-gcp-subscription-id.png "view-gcp-subscription-id")

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<p>サービス中断を避けるため、1時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード支払いへの切り替え\{#switch-to-payment-credit-card}

<Procedures>

1. 購読に使用した元の GCP アカウントで GCP Marketplace にサインインします。

1. Zilliz Cloud の購読をキャンセルします。詳細については [プランのキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>購読をキャンセルしても、Zilliz Cloud のデータは削除されないのでご安心ください。</p>

    </Admonition>

    GCP Marketplace でキャンセル処理が完了するまで数分かかります。

1. [クレジットカードの追加による購読](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要** ページの **支払い 方法** セクションで更新を確認します。

</Procedures>

## GCP Marketplace 購読のキャンセル\{#cancel-gcp-marketplace-subscription}

GCP Marketplace の購読をキャンセルするには、GCP Marketplace コンソールを開き、[こちら](https://cloud.google.com/marketplace/docs/manage-billing#cancel) の手順に従ってください。

## GCP Marketplace の価格設定規約\{#gcp-marketplace-pricing-terms}

詳細については [支払い & 請求](./payment-billing#marketplace-pricing-terms) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace の購読を Zilliz Cloud にリンクする際に利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です**

    十分な権限を持っていない場合に発生します。利用できない組織の横に **"権限が不十分です"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace の購読を組織にリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、**組織メンバー** のみである場合は、必要な権限がありません。組織オーナーに連絡して支援を依頼してください。

- **すべての組織がすでに Marketplace の購読に正常にリンクされている**

    すべての組織がすでに Marketplace の購読にリンクされている場合に発生します。利用できない組織の横に **"マーケットプレイスにリンク済み"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace の購読を更新する必要がある場合は、まず組織の現在の購読を [リンク解除](./subscribe-on-aws-marketplace#cancel-public-offer-subscription) してから、新しい購読を設定してください。

    - 異なる Marketplace の購読用に複数の組織が必要な場合は、以下の方法があります：

        - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して新しい組織を作成します。次に、組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) します。この組織オーナーは複数の組織に所属し、各組織に異なる Marketplace の購読を設定できます。

        - [サポートチケットを作成](http://support.zilliz.com) してください。新しい組織を作成いたします。現在、Zilliz Cloud はユーザーによる手動での組織作成をサポートしていません。

- **リストに組織がない**

    - アカウントがクローズされた場合、またはすべての組織から脱退した場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下の方法があります：

    - 新しい組織を作成します。

    - 他のユーザーに自分を組織に [招待](./organization-users#invite-a-user-to-your-organization) してもらい、組織オーナーのロールを付与してもらいます。

    - [サポートチケットを作成](https://support.zilliz.com/hc/en-us) してください。新しい組織を作成いたします。

## 関連トピック\{#related-topics}

- [クレジットカードの追加による購読](./subscribe-by-adding-credit-card)

- [AWS Marketplace での購読](./subscribe-on-aws-marketplace)

- [Azure Marketplace での購読](./subscribe-on-azure-marketplace)

- [請求書の表示](./view-invoice) 
