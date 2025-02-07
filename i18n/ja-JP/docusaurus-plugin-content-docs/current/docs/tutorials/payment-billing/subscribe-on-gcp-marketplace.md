---
title: "Google Cloud Marketplaceに登録する | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程をステップバイステップで説明し、GCP Marketplace上のZilliz Cloudの価格条件について概説します。 | Cloud"
type: origin
token: IJfwwpxMSiOb39ktg4IcIr7un5f
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - gcp
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection

---

import Admonition from '@theme/Admonition';


# Google Cloud Marketplaceに登録する

このガイドでは、サブスクリプションの過程をステップバイステップで説明し、GCP Marketplace上のZilliz Cloudの価格条件について概説します。

<Admonition type="info" icon="Notes" title="undefined">

<p>一度購読すると、Google Cloud Marketplaceを介してGoogle Cloudクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、Google Cloud Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#}

- 必ず[GCPアカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)を作成してください。

- サブスクリプションに使用するGCPプロジェクトの請求先アカウントを設定していることを確認してください。

- ご利用のGCPMarketplaceアカウントが組織に属している場合は、課金管理者による購入の承認が必要です。

## GCP Marketplaceに登録する{#gcp-marketplace}

以下の手順で[GCP](https://console.cloud.google.com/marketplace) [Marketplace](https://console.cloud.google.com/marketplace)にアクセスし、Zilliz Cloudの購読を開始してください。

1. 検索ボックスで**Zilliz Cloud**を検索するか、[GCP Marketplaceにアクセス](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)してZilliz Cloudポータルページを表示してください。

    ![search_for_zilliz_on_gcp](/img/ja-JP/search_for_zilliz_on_gcp.png)

1. [**Zilliz Cloud**]をクリックします。

    サービスと価格について理解してください。

1. 登録するプロジェクトを選択し、[**登録**]をクリックします。

    ![click_subscribe_on_gcp](/img/ja-JP/click_subscribe_on_gcp.png)

1. [**New Zilliz Cloudサブスクリプション**]ページで、次の手順を実行します。

    1. [**購入詳細**]セクションのドロップダウンから請求先アカウントを選択します。

    1. 利用**規約**を確認し、同意します。

    1. 購読をクリックし**ます**。

    ![new_zilliz_cloud_subscription_on_gcp](/img/ja-JP/new_zilliz_cloud_subscription_on_gcp.png)

1. ポップアップウィンドウで、「**SIGN UP WITH ZILLIZ**」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>登録手続きを完了できない場合は、GCP Marketplaceの[<strong><a href="https://console.cloud.google.com/marketplace/orders">ご注文</a></strong>]ページに移動して再試行できます。</p>

    </Admonition>

    ![gcp_flash_message](/img/ja-JP/gcp_flash_message.png)

1. 新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択して、手順に従ってください。

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

    1. 完全な承認。

    ![aws-marketplace-dialog](/img/ja-JP/aws-marketplace-dialog.png)

1. GCP Marketplaceのサブスクリプションが**支払**い方法として設定されていることを確認するには、請求に移動してください。

    ![gcp-marketplace-success](/img/ja-JP/gcp-marketplace-success.png)

## GCP Marketplaceのサブスクリプションを更新する{#gcp-marketplace}

GCP Marketplaceから正常にサブスクリプションを申し込んだ後は、いつでも適切なタイミングでサブスクリプションを更新できます。具体的には、サブスクリプションに使用するGCP Marketplaceアカウントを別のアカウントに変更するか、GCP Marketplaceのサブスクリプションからクレジットカードへの支払い方法を切り替えることができます。

### GCP Marketplaceのサブスクリプションアカウントを変更する{#gcp-marketplace}

1. サブスクリプションに使用した元のGCPアカウントでGCP Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[プランをキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)するを参照してください。

    <Admonition type="info" icon="Notes" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplaceがキャンセルの過程を完了するには数分かかります。

1. 元のGCPアカウントからログアウトします。

1. サブスクリプションに使用する新しいGCPアカウントでGCP Marketplaceにサインインします。

1. 新しいアカウントでZilliz Cloudのサブスクリプションを完了するには、[GCP Marketplaceで購読](./subscribe-on-gcp-marketplace#gcp-marketplace)するセクションの手順1から4に従ってください。

    <Admonition type="info" icon="Notes" title="undefined">

    <p>GCP Marketplaceのサブスクリプションを更新する場合、新しいサブスクリプションをZilliz Cloud組織にリンクするには、[プロバイダーで管理]ボタンをクリックする必要があります。</p>

    </Admonition>

1. [**支払方法**]セクションの[**請求概要**]ページで更新を確認します。[サブスクリプションID]をクリックし、サブスクリプション**アカウントID**が新しいMarketplaceアカウントに更新されているかどうかを確認します。

    ![view-gcp-subscription-id](/img/ja-JP/view-gcp-subscription-id.png)

<Admonition type="info" icon="Notes" title="undefined">

<p>サービスの中断を避けるために、1時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード決済に切り替える{#}

1. サブスクリプションに使用した元のGCPアカウントでGCP Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[プランをキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)するを参照してください。

    <Admonition type="info" icon="Notes" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplaceがキャンセルの過程を完了するには数分かかります。

1. 「[クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)」の手順に従って、支払いクレジットカードを追加します。

1. [**支払方法**]セクションの[**請求概要**]ページで更新を確認します。

## GCP Marketplaceのサブスクリプションをキャンセルする{#gcp-marketplace}

GCP Marketplaceのサブスクリプションを解約するには、GCP Marketplaceコンソールを開き、[こちら](https://cloud.google.com/marketplace/docs/manage-billing#cancel)の手順に従ってください。

## GCP Marketplaceの価格条件{#gcp-marketplace}

詳細については、[支払いと請求](./payment-billing)を参照してください。

## トラブルシューティング{#}

**マーケットプレイスのサブスクリプションをZilliz Cloudにリンクする際に問題が発生した場合、どうすればよいですか?**

いくつかの理由が考えられます:

1. **不十分な権限**（UIプロンプト:「不十分な権限」）

    組織をマーケットプレイスサブスクリプションにリンクするには、組織の所有者である必要があります。ただし、組織のメンバーの場合、必要な権限がありません。組織の所有者にお問い合わせください。

1. **すべての組織はすでにMarketplaceサブスクリプションに正常にリンクされています**(UIプロンプト: Marketplace Linked)

    1. 既存のMarketplaceサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションの[リンク](./subscribe-on-gcp-marketplace#gcp-marketplace)を解除してから、新しいサブスクリプションを設定してください。

    1. 異なるマーケットプレイスのサブスクリプションに複数の組織が必要な場合は、次のことができます:

        1. [新し](./register-with-zilliz-cloud)いZilliz Cloudアカウントを登録して、新しい組織を作成します。その後、組織のオーナーを新しい組織に[招待](./organization-users#)します。この組織のオーナーは複数の組織に所属し、組織ごとに異なるマーケットプレイスのサブスクリプションを設定できます。

        1. [サポートチケットを作成](http://support.zilliz.com)すると、新しい組織が作成されます。現在、Zilliz Cloudでは、ユーザーが手動で組織を作成することはサポートされていません。

1. **リストに組織がありません**

    アカウントが閉鎖された場合や、すべての組織から離脱した場合に発生する可能性があります。この場合、次のことができます:

    1. 他のユーザに自分をOrganizationの所有者としてOrganizationに[招待](./organization-users#)するように依頼します。

    1. [サポートチケットを送信](https://support.zilliz.com/hc/en-us)すると、新しい組織が作成されます。

## 関連するトピック{#}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- [インボイス](./view-invoice)

