---
title: "Microsoft Marketplace の公開オファーをサブスクライブする | BYOC"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Microsoft Marketplace（公開オファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace 上の Zilliz Cloud の料金体系について説明します。 | BYOC"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

import Procedures from '@site/src/components/Procedures';

# Microsoft Marketplace の公開オファーをサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace 上の Zilliz Cloud の料金体系について説明します。

<Admonition type="info" icon="📘" title="📘 注">

- サブスクライブすると、Azure クラスターの利用料金を Azure Marketplace 経由で支払えるようになります。他のクラウドプロバイダー上にデプロイされたクラスターがある場合も、Azure Marketplace を使って支払うことができます。

- 異なるチームや事業部門ごとに Azure Marketplace の請求を分ける必要がある場合は、[Azure Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-azure-marketplace) を参照してください。

</Admonition>

## 開始する前に\{#before-you-start}

Azure Marketplace でサブスクライブするために、[Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure の [請求アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) を用意してください。

また、請求先の国または地域がサポート対象市場の一覧に含まれていることも確認してください。Zilliz Cloud は、税務およびコンプライアンス上の理由により、Azure Marketplace の一部市場ではサポートされていません。サポート対象外の市場からサブスクライブしようとすると、`"No plans are available for market '<market_code>'."` というエラーメッセージが表示されることがあります。この場合は、エラーメッセージのスクリーンショットとマーケットコードを添えて [サポートにお問い合わせください](http://support.zilliz.com/)。可能な解決策についてご案内します。

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>サポート対象市場</summary>

<Grid columnSize="4" widthRatios="25,25,25,25">

    <div>

        - アルメニア

        - オーストラリア

        - オーストリア

        - バーレーン

        - バルバドス

        - ベラルーシ

        - ベルギー

        - ブラジル

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

        - ドイツ

        - ギリシャ

        - 香港特別行政区

        - ハンガリー

        - アイスランド

        - インド

        - インドネシア

        - アイルランド

        - イタリア

        - 日本

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

        - オランダ

        - ニュージーランド

        - ナイジェリア

        - ノルウェー

        - オマーン

        - フィリピン

        - ポーランド

        - ポルトガル

        - プエルトリコ

        - カタール

        - ルーマニア

        - ロシア

        - サウジアラビア

        - セルビア

        - シンガポール

        - スロバキア

    </div>

    <div>

        - スロベニア

        - 南アフリカ

        - 韓国

        - スペイン

        - スウェーデン

        - スイス

        - 台湾

        - タジキスタン

        - タイ

        - トルコ

        - ウガンダ

        - ウクライナ

        - アラブ首長国連邦

        - イギリス

        - アメリカ合衆国

        - ウズベキスタン

        - ベトナム

    </div>

</Grid>

</details>

## Azure Marketplace でサブスクライブする\{#subscribe-on-azure-marketplace}

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、以下の手順で Zilliz Cloud のサブスクライブを開始します。

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[Azure Marketplace に移動して](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizonazure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. **Plans + Pricing** タブに切り替え、**Get it now** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/getitnowonazure.png "get_it_now_on_azure")

1. ポップアップウィンドウで、Zilliz Cloud が必要とする基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enterbasicinformationazure.png "enter_basic_information_azure")

1. **Subscribe to Zilliz Cloud** ページで、以下の手順を実行します。

    1. 適切な **Subscription** と **Resource group** を選択して **Project Details** を設定します。Resource group がない場合は作成してください。サブスクリプションとリソースグループの詳細については、Azure の [The SaaS Purchase Experience](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS Details** を設定します。 

        1. 後で識別しやすいようにサブスクリプションに名前を付けます。

        1. 契約期間を選択します: 1 か月または 1 年。

        1. **Auto-renew** 設定を構成します。

            <Admonition type="info" icon="📘" title="📘 注">

            自動更新がオンの場合、契約期間の終了時に、Azure Marketplace 上の Zilliz Cloud サブスクリプションが自動的に更新されます。自動更新がオフの場合、契約期間の終了時にサブスクリプションは終了し、Zilliz Cloud の組織とアカウントはこの Azure Marketplace サブスクリプションから自動的にリンク解除されます。

            </Admonition>

    1. サブスクリプションの詳細を確認し、**Review+Subscribe** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configuresubscriptiononazure.png "configure_subscription_on_azure")

1. 次のページで、**Configure account now** をクリックして Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configureaccountazure.png "configure_account_azure")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントを持っている場合は、そのままログインします。持っていない場合は、[サインアップ方法](./register-with-zilliz-cloud) を選択して手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認可を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **Billing** に移動し、Azure Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace から正常にサブスクライブした後は、いつでも必要に応じてサブスクリプションを更新できます。 

具体的には、次のいずれかが可能です。

- サブスクリプションに使用する Marketplace アカウントを別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細は、[支払い方法を更新する](./update-payment-method) を参照してください。

## Azure Marketplace サブスクリプションをキャンセルする\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace のホームページを開きます。

1. **All resources** をクリックするか、**Resources/Recent** タブでサブスクリプションを見つけます。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azureallresources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションに移動します。**Cancel subscription** をクリックします。Azure Marketplace が処理を完了するまで数分待ちます。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancelazuresubscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でサブスクリプションをキャンセルする方法の詳細については、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Azure Marketplace 経由でサブスクライブする際に「No plans are available for market '&lt;country_code&gt;'」と表示されるのはなぜですか？**

このメッセージは、お客様の請求先の国または地域では、Zilliz Cloud がまだ Azure Marketplace で提供されていないために表示されます。詳細は、[サポート対象市場](./subscribe-on-azure-marketplace#before-you-start) を参照してください。[サポートにお問い合わせいただき](http://support.zilliz.com)、エラーメッセージのスクリーンショットとマーケットコードをご提供ください。代替案のご案内や、提供状況の更新が可能な場合があります。

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに利用可能な組織がない場合、どうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    必要な権限が不足している場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は次の通りです。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプションごとに複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **一覧に組織がない**

    - アカウントが閉鎖されている場合や、すべての組織から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のことができます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、そのユーザーの組織へ [招待](./organization-users#invite-a-user-to-your-organization) してもらい、Organization Owner のロールを付与してもらう。

