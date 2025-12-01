---
title: "Google Cloudマーケットプレイスで登録 | Cloud"
slug: /subscribe-on-gcp-marketplace
sidebar_label: "Google Cloudマーケットプレイス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、登録プロセスのステップバイステップガイドを提供し、GCPマーケットプレイスでのZilliz Cloudの価格用語を概説します。 | Cloud"
type: origin
token: MIqTw7iJ4iQAtVkYKiEc98a7nsh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - マーケットプレイス
  - gcp
  - Rag llmアーキテクチャ
  - プライベートllm
  - nn検索
  - llm評価

---

import Admonition from '@theme/Admonition';


# Google Cloudマーケットプレイスで登録

このガイドでは、登録プロセスのステップバイステップガイドを提供し、GCPマーケットプレイスでのZilliz Cloudの価格用語を概説します。

<Admonition type="info" icon="📘" title="注意">

<p>登録後、Google Cloudクラスターの使用量はGoogle Cloudマーケットプレイス経由で支払えます。他のクラウドプロバイダーにデプロイされているクラスターがある場合も、Google Cloudマーケットプレイスを使用して支払えます。</p>

</Admonition>

## 始める前に\{#before-you-start}

- [GCPアカウント](https://cloud.google.com/apigee/docs/hybrid/v1.1/precog-gcpaccount)があることを確認してください。

- 登録に使用するGCPプロジェクトに請求アカウントが設定されていることを確認してください。

- GCPマーケットプレイスアカウントが組織の一部である場合、請求管理者による購入の承認を受ける必要があります。

## GCPマーケットプレイスで登録\{#subscribe-on-gcp-marketplace}

[GCPマーケットプレイス](https://console.cloud.google.com/marketplace)にアクセスし、以下のようにZilliz Cloudの登録を開始します：

1. 検索ボックスで**Zilliz Cloud**を検索するか、[GCPマーケットプレイスに移動](https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?project=zilliz-public&pli=1)してZilliz Cloudポータルページを表示します。

    ![search_for_zilliz_on_gcp](/img/search_for_zilliz_on_gcp.png)

1. **Zilliz Cloud**をクリックします。

    サービスと価格に精通してください。

1. 登録用のプロジェクトを選択し、**登録**をクリックします。

    ![click_subscribe_on_gcp](/img/click_subscribe_on_gcp.png)

1. **新しいZilliz Cloud登録**ページで、以下の手順を完了します：

    1. **購入詳細**セクションのドロップダウンから請求アカウントを選択します。

    1. **利用規約**を確認し、同意します。

    1. **登録**をクリックします。

    ![new_zilliz_cloud_subscription_on_gcp](/img/new_zilliz_cloud_subscription_on_gcp.png)

1. ポップアップウィンドウで、**ZILLIZでサインアップ**をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    <p>サインアッププロセスを完了できない場合は、GCPマーケットプレイスの<strong><a href="https://console.cloud.google.com/marketplace/orders">注文</a></strong>ページに移動して再試行できます。</p>

    </Admonition>

    ![gcp_flash_message](/img/gcp_flash_message.png)

1. 新しいタブで、以下の手順に従って登録を完了します：

    1. すでにZilliz Cloudアカウントをお持ちの場合は、単にログインしてください。そうでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択してプロセスに従ってください。

    1. 登録を既存のZilliz Cloud組織にリンクします。

    1. 承認を完了します。

    ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

1. **請求**に移動し、GCPマーケットプレイス登録が支払い方法として設定されていることを確認します。

    ![gcp-marketplace-success](/img/gcp-marketplace-success.png)

## GCPマーケットプレイス登録を更新\{#update-gcp-marketplace-subscription}

GCPマーケットプレイスから正常に登録した後、都合の良いときにいつでも登録を更新できます。具体的には、登録に使用されているGCPマーケットプレイスアカウントを別のアカウントに変更するか、GCPマーケットプレイス登録からクレジットカードへの支払い方法を切り替えることができます。

### GCPマーケットプレイス登録アカウントを変更\{#change-gcp-marketplace-subscription-account}

1. 登録に使用した元のGCPアカウントでGCPマーケットプレイスにサインインします。

1. Zilliz Cloud登録をキャンセルします。詳細については、[プランをキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>登録をキャンセルしても、Zilliz Cloudデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCPマーケットプレイスによるキャンセル処理には数分かかります。

1. 元のGCPアカウントからサインアウトします。

1. 登録に使用する新しいGCPアカウントでGCPマーケットプレイスにサインインします。

1. [GCPマーケットプレイスで登録](./subscribe-on-gcp-marketplace#subscribe-on-gcp-marketplace)セクションの手順1～4に従って、新しいアカウントでZilliz Cloudへの登録を完了します。

    <Admonition type="info" icon="📘" title="注意">

    <p>GCPマーケットプレイス登録を更新する際は、新しい登録をZilliz Cloud組織にリンクするために<strong>プロバイダーで管理</strong>ボタンをクリックする必要があります。</p>

    </Admonition>

1. **請求概要**ページの**支払い方法**セクションで更新を確認します。登録IDをクリックして、登録の**アカウントID**が新しいマーケットプレイスアカウントに更新されたことを確認します。

    ![view-gcp-subscription-id](/img/view-gcp-subscription-id.png)

<Admonition type="info" icon="📘" title="注意">

<p>サービスの中断を避けるため、1時間以内に操作を完了することを推奨します。</p>

</Admonition>

### 支払いクレジットカードに切り替える\{#switch-to-payment-credit-card}

1. 登録に使用した元のGCPアカウントでGCPマーケットプレイスにサインインします。

1. Zilliz Cloud登録をキャンセルします。詳細については、[プランをキャンセル](https://cloud.google.com/marketplace/docs/manage-billing#saas-products)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>登録をキャンセルしても、Zilliz Cloudデータは削除されませんのでご安心ください。</p>

    </Admonition>

    GCPマーケットプレイスによるキャンセル処理には数分かかります。

1. [クレジットカードを追加して登録](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要**ページの**支払い方法**セクションで更新を確認します。

## GCPマーケットプレイス登録をキャンセル\{#cancel-gcp-marketplace-subscription}

GCPマーケットプレイス登録をキャンセルするには、GCPマーケットプレイスコンソールを開き、[こちら](https://cloud.google.com/marketplace/docs/manage-billing#cancel)の指示に従う必要があります。

## GCPマーケットプレイス価格用語\{#gcp-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング\{#troubleshooting}

**マーケットプレイス登録をZilliz Cloudにリンクする際に利用可能な組織がない場合、どうすればよいですか？**

考えられる理由はいくつかあります。

1. **権限が不十分**

    これは、十分な特権がない場合に発生する可能性があります。利用できない組織の横に**「権限が不十分」**タグが表示されます。

    ![insufficient-permission-subscription](/img/insufficient-permission-subscription.png)

    組織をマーケットプレイス登録にリンクするには、**組織オーナー**または**組織請求管理者**である必要があります。組織メンバーであるだけの場合、必要な権限がありません。組織オーナーに支援を依頼してください。

1. **すべての組織が既にマーケットプレイス登録に正常にリンクされている**

    これは、すべての組織が既にマーケットプレイス登録にリンクされている場合に発生する可能性があります。利用できない組織の横に**「マーケットプレイスリンク済み」**タグが表示されます。

    ![marketplace-already-linked-subscription](/img/marketplace-already-linked-subscription.png)

    この場合、

    1. 既存のマーケットプレイス登録を更新する必要がある場合は、最初に組織の現在のマーケットプレイス登録を[リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)し、次に新しい登録を設定してください。

    1. 異なるマーケットプレイス登録用に複数の組織が必要な場合は、以下を行うことができます：

        1. [登録](./register-with-zilliz-cloud)して新しいZilliz Cloudアカウントを作成し、新しい組織を作成します。次に、組織オーナーを新しい組織に[招待](./organization-users#invite-a-user-to-your-organization)します。この組織オーナーは複数の組織に属し、各組織に異なるマーケットプレイス登録を設定できます。

        1. [サポートチケットを作成](http://support.zilliz.com)して、新しい組織を作成してもらいます。現在、Zilliz Cloudではユーザーによる組織の手動作成はサポートされていません。

1. **リストに組織がない**

    これは、アカウントが閉鎖されたか、すべての組織から退出した場合に発生する可能性があります。UIは以下のようになります。

    ![no-organization-during-subcription](/img/no-organization-during-subcription.png)

    この場合、以下を行うことができます：

    - 新しい組織を作成します。

    - 他のユーザーに[招待](./organization-users#invite-a-user-to-your-organization)されて組織に参加してもらい、組織オーナーの役割を付与してもらいます。

    - [サポートチケットを作成](https://support.zilliz.com/hc/en-us)して、新しい組織を作成してもらいます。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して登録](./subscribe-by-adding-credit-card)

- [AWSマーケットプレイスで登録](./subscribe-on-aws-marketplace)

- [Azureマーケットプレイスで登録](./subscribe-on-azure-marketplace)

- [請求書を表示](./view-invoice)

