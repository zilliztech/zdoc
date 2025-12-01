---
title: "Azureマーケットプレイスで登録 | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Azureマーケットプレイス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Azureマーケットプレイスでの登録プロセスのステップバイステップガイドを提供し、Zilliz Cloudの価格用語を概説します。 | Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 5
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - マーケットプレイス
  - azure
  - 機械学習
  - rag
  - nlp
  - ニューラルネットワーク

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

# Azureマーケットプレイスで登録

このガイドでは、登録プロセスのステップバイステップガイドを提供し、AzureマーケットプレイスでのZilliz Cloudの価格用語を概説します。

<Admonition type="info" icon="📘" title="注意">

<p>登録後、Azureクラスターの使用量はAzureマーケットプレイス経由で支払えます。他のクラウドプロバイダーにデプロイされているクラスターがある場合も、Azureマーケットプレイスを使用して支払えます。</p>

</Admonition>

## 始める前に\{#before-you-start}

[Azureマーケットプレイス](https://learn.microsoft.com/ja-jp/marketplace/azure-marketplace-overview)アカウントとAzure [請求アカウント](https://learn.microsoft.com/ja-jp/azure/cost-management-billing/manage/view-all-accounts)があり、Azureマーケットプレイスでの登録用に設定されていることを確認してください。

また、請求先の国またはリージョンがサポートされている市場のリストに含まれていることを確認してください。税務およびコンプライアンスの理由により、Zilliz CloudはAzureマーケットプレイスで特定の市場をサポートしていません。サポートされていない市場から登録しようとすると、「`「<market_code>」市場のプランは利用できません。`」というエラーメセージが表示される場合があります。这种情况が発生した場合は、[サポートに連絡](http://support.zilliz.com/)して、エラーメセージのスクリーンショットと市場コードを提供してください。可能な解決策について協議させていただきます。

![YaPcbHnQXovDLIxks0xcItOJnpf](/img/YaPcbHnQXovDLIxks0xcItOJnpf.png)

<details>

<summary>対応市場</summary>

<Grid columnSize="4" widthRatios="25,25,25,25">

    <div>

        - アルメニア

        - オーストラリア

        - オーストリア

        - バーレーン

        - バルバドス

        - ベラルス

        - ベルギー

        - ブルガリア

        - カナダ

        - チリ

        - コロンビア

        - クロアチア

        - キプロス

        - チェコ

        - デンマーク

        - エジプト

        - エストニア

        - フィンランド

    </div>

    <div>

        - フランス

        - ジョージア

        - ドルマニー

        - ギリシャ

        - 香港特別行政区

        - ハンガリー

        - アイスランド

        - インド

        - インドネシア

        - アイルランド

        - イタリア

        - ジャパン

        - ケニア

        - ラトビア

        - リヒテンシュタイン

        - リトアニア

        - ルクセンブルク

        - マレーシア

    </div>

    <div>

        - マルタ

        - モルドバ

        - モナコ

        - ネーデルランド

        - ニュージーランド

        - ニジェリア

        - ノルウェー

        - オマーン

        - フィリピン

        - ポーランド

        - ポルトガル

        - プエルトリコ

        - カタル

        - ルーマニア

        - ロシア

        - サウジアラビア

        - セルビア

        - シンガポール

    </div>

    <div>

        - スロバキア

        - スロベニア

        - 南アフリカ

        - 韓国

        - スペイン

        - スウェーデン

        - スイス

        - 台湾

        - タジキスタン

        - タイランド

        - トルキエ

        - ウガンダ

        - ウクライナ

        - アラブ首長国連邦

        - 英国

        - アメリカ合衆国

        - ウズベキスタン

        - ベトナム

    </div>

</Grid>

</details>

## Azureマーケットプレイスで登録\{#subscribe-on-azure-marketplace}

[Azureマーケットプレイス](https://azuremarketplace.microsoft.com/ja-jp)にアクセスし、以下のようにZilliz Cloudの登録を開始します：

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azureマーケットプレイス登録デモ" />

1. 検索ボックスで**Zilliz Cloud**を検索するか、[Azureマーケットプレイスに移動](https://azuremarketplace.microsoft.com/ja-jp/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)してZilliz Cloudポータルページを表示します。

    ![search_for_zilliz_on_azure](/img/search_for_zilliz_on_azure.png)

1. **Zilliz Cloud**をクリックします。

    サービスと価格をよく理解してください。

1. **プラン＋価格**タブに切り替えます。**今すぐ入手**をクリックします。

    ![get_it_now_on_azure](/img/get_it_now_on_azure.png)

1. ポップアップウィンドウで、Zilliz Cloudに必要な基本情報を入力します。

    ![enter_basic_information_azure](/img/enter_basic_information_azure.png)

1. **Zilliz Cloudに登録**ページで、以下の手順を完了します：

    1. **プロジェクトの詳細**を設定し、適切な**サブスクリプション**と**リソースグループ**を選択します。リソースグループがない場合は、作成してください。サブスクリプションとリソースグループの詳細については、Azureの[SaaS購入体験](https://learn.microsoft.com/ja-jp/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience)を参照してください。

    1. **SaaSの詳細**を構成します。

        1. 登録名を入力して、後で簡単に識別できるようにします。

        1. 契約期間を選択：1か月または1年。

        1. **自動更新**設定を構成します。

            <Admonition type="info" icon="📘" title="注意">

            <p>自動更新がオンの場合、契約期間が終了するとZilliz CloudのAzure登録が自動的に行われます。自動更新がオフの場合、契約期間が終了すると登録が終了し、Zilliz Cloudの組織およびアカウントはこのAzureマーケットプレイス登録から自動的にリンク解除されます。</p>

            </Admonition>

    1. 登録の詳細を確認し、**確認+登録**をクリックします。

    ![configure_subscription_on_azure](/img/configure_subscription_on_azure.png)

1. 次のページで、**アカウントを今すぐ構成**をクリックして、Azureマーケットプレイス登録をZilliz Cloudにリンクします。

    ![configure_account_azure](/img/configure_account_azure.png)

1. 新しいタブで、以下の手順に従って登録を完了します：

    1. すでにZilliz Cloudアカウントをお持ちの場合は、ログインするだけでかまいません。ない場合は、[登録オプション](./register-with-zilliz-cloud)を選択してプロセスに従ってください。

    1. 既存のZilliz Cloud組織に登録をリンクします。

    1. 承認を完了します。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

1. Zilliz Cloudで**請求**に移動し、Azureマーケットプレイス登録が支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](/img/azure-marketplace-success.png)

## Azureマーケットプレイス登録を更新\{#update-azure-marketplace-subscription}

Azureマーケットプレイスから正常に登録した後、いつでも都合の良いときに登録を更新できます。具体的には、登録に使用されているAzureマーケットプレイスアカウントを別のアカウントに変更するか、Azureマーケットプレイス登録からクレジットカードへの支払い方法を切り替えることができます。

### Azureマーケットプレイス登録を変更\{#change-azure-marketplace-subscription}

詳細については、[Azureサブスクリプションと/またはリソースグループを変更](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group)を参照してください。

**請求概要**ページの**支払い方法**セクションで更新を確認できます。登録IDをクリックして、登録の**購入者PUID**が新しいマーケットプレイスアカウントに更新されたことを確認します。

![view-azure-subscription-id](/img/view-azure-subscription-id.png)

### 支払い用クレジットカードに切り替える\{#switch-to-payment-credit-card}

1. 登録に使用したAzureアカウントでAzureマーケットプレイスにサインインします。

1. Zilliz Cloud登録をキャンセルまたは削除します。詳細については、[登録をキャンセル](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#cancel-subscription)および[登録を削除](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#delete-subscription)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>Azureマーケットプレイスによるキャンセル処理には数分かかります。</p>

    </Admonition>

1. [クレジットカードを追加して登録](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要**ページの**支払い方法**セクションで更新を確認します。

## Azureマーケットプレイス登録をキャンセル\{#cancel-azure-marketplace-subscription}

1. Azureマーケットプレイスホームページを開きます。

1. **すべてのリソース**をクリックするか、**リソース/最近の**タブで登録を探します。

    ![azure_all_resources](/img/azure_all_resources.png)

1. キャンセルする登録に移動します。**登録をキャンセル**をクリックします。Azureマーケットプレイスによる処理完了まで数分待ちます。

    ![cancel_azure_subscription](/img/cancel_azure_subscription.png)

Azureマーケットプレイスでの登録キャンセル方法の詳細については、[こちら](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#cancel-subscription)を参照してください。

## Azureマーケットプレイス価格用語\{#azure-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング\{#troubleshooting}

- **Azureマーケットプレイス経由で登録する際、「「\<country_code>」市場のプランは利用できません」と表示されるのはなぜですか？**

    このメッセージは、請求先の国または地域のAzureマーケットプレイスでZilliz Cloudがまだ利用できないために表示されます。詳細については、[対応市場](./subscribe-on-azure-marketplace#before-you-start)を参照してください。[サポートに連絡](http://support.zilliz.com)して、エラーメセージのスクリーンショットと市場コードを提供してください。代替ソリューションを提供したり、利用可能状況を更新したりできる場合があります。

- **マーケットプレイス登録をZilliz Cloudにリンクする際に利用可能な組織がない場合、どうすればよいでしょうか？**

    これにはいくつかの理由が考えられます。

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

            1. [登録](./register-with-zilliz-cloud)して新しいZilliz Cloudアカウントを作成し、新しい組織を作成します。次に、組織オーナーを新しい組織に[招待](./organization-users#invite-a-user-to-your-organization)します。この組織オーナーは複数の組織に属するようになり、各組織に異なるマーケットプレイス登録を設定できます。

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

- [GCPマーケットプレイスで登録](./subscribe-on-gcp-marketplace)

- [請求書を表示](./view-invoice)

