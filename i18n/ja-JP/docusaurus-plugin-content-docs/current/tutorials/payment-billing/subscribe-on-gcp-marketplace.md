---
title: "Google Cloud Marketplaceに登録する | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloud Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程をステップバイステップで説明し、GCP Marketplace上のZilliz Cloudの価格条件について概説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - gcp
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# Google Cloud Marketplaceに登録する

このガイドでは、サブスクリプションの過程をステップバイステップで説明し、GCP Marketplace上のZilliz Cloudの価格条件について概説します。

<Admonition type="caution" icon="🚧" title="undefined">

<p>一度購読すると、Google Cloud Marketplaceを介してGoogle Cloudクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、Google Cloud Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#before-you-start}

- [GCPアカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)があることを確認してください。

- サブスクリプションに使用するGCPプロジェクトの請求先アカウントを設定していることを確認してください。

- GCP Marketplaceアカウントが組織に属している場合、課金管理者による購入の承認が必要です。

## GCP Marketplaceで購読する{#subscribe-on-gcp-marketplace}

[GCP](https://console.cloud.google.com/marketplace) [ マーケットプレイス](https://console.cloud.google.com/marketplace)にアクセスし、以下の手順でZilliz Cloudの購読を開始してください。

1. 検索ボックスで**Zilliz Cloud**を検索するか、[GCP Marketplaceにアクセスしてください。](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)をクリックしてZilliz Cloudポータルページを表示してください。

    ![search_for_zilliz_on_gcp](/img/search_for_zilliz_on_gcp.png)

1. 「Zilliz Cloud」をクリックしてください。

    サービスと価格について理解してください。

1. 購読するプロジェクトを選択し、**購読**をクリックしてください。 

    ![click_subscribe_on_gcp](/img/click_subscribe_on_gcp.png)

1. **New Zilliz Cloudサブスクリプション**ページで、以下の手順を完了してください:

    1. 「購入詳細」セクションのドロップダウンから請求先アカウントを選択してください。

    1. **利用規約**を確認し、同意してください。

    1. 「購読」をクリックしてください。

    ![new_zilliz_cloud_subscription_on_gcp](/img/new_zilliz_cloud_subscription_on_gcp.png)

1. ポップアップウィンドウで、**ZILLIZでサインアップ**をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>サインアップの過程を完了できない場合は、GCP Marketplaceの<strong><a href="https://console.cloud.google.com/marketplace/orders">ご注文</a></strong>ページに移動して再試行できます。</p>

    </Admonition>

    ![gcp_flash_message](/img/gcp_flash_message.png)

1. 新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択し、手順に従ってください。

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

    1. 完全な承認。

    ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

1. **請求**に移動して、GCP Marketplaceのサブスクリプションが支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](/img/gcp-marketplace-success.png)

## GCP Marketplaceのサブスクリプションを更新する{#update-gcp-marketplace-subscription}

GCP Marketplaceから正常にサブスクリプションを申し込んだ後は、いつでも適切なタイミングでサブスクリプションを更新できます。具体的には、サブスクリプションに使用するGCP Marketplaceアカウントを別のアカウントに変更するか、GCP Marketplaceのサブスクリプションからクレジットカードへの支払い方法を切り替えることができます。 

### GCP Marketplaceのサブスクリプションアカウントを変更する{#change-gcp-marketplace-subscription-account}

1. サブスクリプションに使用した元のGCPアカウントでGCP Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[プランをキャンセルする](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplaceがキャンセルの過程を完了するには数分かかります。

1. 元のGCPアカウントからログアウトします。

1. サブスクリプションに使用する新しいGCPアカウントでGCP Marketplaceにサインインしてください。

1. 新しいアカウントでZilliz Cloudのサブスクリプションを完了するには、[GCP Marketplaceで購読する](./subscribe-on-gcp-marketplace#subscribe-on-gcp-marketplace)セクションの手順1から4に従ってください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>GCP Marketplaceのサブスクリプションを更新する場合、新しいサブスクリプションをZilliz Cloud組織にリンクするには、[プロバイダーで管理]ボタンをクリックする必要があります。</p>

    </Admonition>

1. 「請求概要」ページの「支払い方法」セクションで更新を確認してください。「サブスクリプションID」をクリックし、「アカウントID」が新しいマーケットプレイスアカウントに更新されたかどうかを確認してください。

    ![view-gcp-subscription-id](/img/view-gcp-subscription-id.png)

<Admonition type="caution" icon="🚧" title="undefined">

<p>サービスの中断を避けるために、1時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード決済に切り替える{#switch-to-payment-credit-card}

1. サブスクリプションに使用した元のGCPアカウントでGCP Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[プランをキャンセルする](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCP Marketplaceがキャンセルの過程を完了するには数分かかります。

1. [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払いクレジットカードを追加してください。

1. 「請求概要」ページの「支払い方法」セクションで更新を確認してください。

## GCP Marketplaceのサブスクリプションをキャンセルする{#cancel-gcp-marketplace-subscription}

GCP Marketplaceのサブスクリプションをキャンセルするには、GCP Marketplaceコンソールを開き、[わたくし](https://cloud.google.com/marketplace/docs/manage-billing#cancel)の指示に従ってください。

## GCP Marketplaceの価格条件{#gcp-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング{#troubleshooting}

**Zilliz Cloudにマーケットプレイスのサブスクリプションをリンクする場合、利用可能な組織がない場合はどうすればよいですか?**

いくつかの理由があるかもしれません。

1. **権限が不十分です** 

    これは、十分な権限を持っていない場合に発生する可能性があります。利用できない組織の横に**「権限不足」**タグが表示されます。

    ![insufficient-permission-subscription](/img/insufficient-permission-subscription.png)

    組織をマーケットプレイスのサブスクリプションにリンクするには、**組織オーナー**または**組織請求管理者**である必要があります。ただし、組織メンバーのみの場合、必要な権限がありません。サポートについては、組織オーナーにお問い合わせください。

1. **すべての組織はすでにMarketplaceサブスクリプションに正常にリンクされています**

    これは、すべての組織がすでにMarketplaceサブスクリプションにリンクされている場合に発生します。利用できない組織の横に**"Marketplace Linked"**タグが表示されます。

    ![marketplace-already-linked-subscription](/img/marketplace-already-linked-subscription.png)

    この場合、

    1. 既存のマーケットプレイスのサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションに[リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)を設定してから、新しいサブスクリプションを設定してください。

    1. 異なるマーケットプレイスのサブスクリプションに複数の組織が必要な場合は、次のことができます:

        1. [登録する](./register-with-zilliz-cloud)は、新しいZilliz Cloudアカウントを作成して新しい組織を作成します。次に、[招待する](./organization-users#invite-a-user-to-your-organization)は、新しい組織の組織所有者です。この組織所有者は、複数の組織に所属し、組織ごとに異なるマーケットプレイスサブスクリプションを設定できます。

        1. [サポートチケットを作成する](http://support.zilliz.com)を使用すると、新しい組織を作成できます。現在、Zilliz Cloudはユーザーが手動で組織を作成することをサポートしていません。

1. リストに組織がありません

    アカウントが閉鎖された場合や、すべての組織から離脱した場合に発生する可能性があります。UIは以下のようになります。

    ![no-organization-during-subcription](/img/no-organization-during-subcription.png)

    この場合、次のことができます:

    - 新しい組織を作る。

    - 他のユーザーに自分の組織への[招待する](./organization-users#invite-a-user-to-your-organization)を要求し、組織のオーナーの役割を付与してください。

    - [サポートチケットを作成する](https://support.zilliz.com/hc/en-us)をクリックすると、新しい組織が作成されます。

## 関連するトピック{#related-topics}

- リンク_PLACEHOLDER_0

- リンク_PLACEHOLDER_0

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- リンク_PLACEHOLDER_0 

