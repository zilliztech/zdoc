---
title: "Microsoft Marketplace でパブリック オファーをサブスクライブする | BYOC"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Microsoft Marketplace (パブリック オファー)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Azure Marketplace での Zilliz Cloud のサブスクリプション手順と価格条件について説明します。 | BYOC"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

import Procedures from '@site/src/components/Procedures';

# Microsoft Marketplace でパブリック オファーをサブスクライブする

このガイドでは、Azure Marketplace での Zilliz Cloud のサブスクリプション手順と価格条件について説明します。

## 事前準備\{#before-you-start}

Azure Marketplace でサブスクライブするには、[Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure の[請求先アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts)が必要です。

また、請求先の国または地域がサポート対象市場に含まれているか確認してください。税務およびコンプライアンス上の理由により、Zilliz Cloud は Azure Marketplace の一部の市場をサポートしていません。サポート対象外の市場からサブスクライブしようとすると、`"No plans are available for market '<market_code>'."` というエラー メッセージが表示される場合があります。その際は、エラー メッセージのスクリーンショットと市場コードを添えて[サポートにお問い合わせ](http://support.zilliz.com/)ください。解決策をご案内いたします。

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

        - 英国

        - 米国

        - ウズベキスタン

        - ベトナム

    </div>

</Grid>

</details>

## Azure Marketplace でのサブスクリプション\{#subscribe-on-azure-marketplace}

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、以下の手順で Zilliz Cloud をサブスクライブします。

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスに **Zilliz Cloud** と入力するか、[Azure Marketplace ページ](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)から Zilliz Cloud のポータルを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizonazure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービス内容と価格を確認します。

1. **プラン + 価格** タブに切り替え、**今すぐ入手** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/getitnowonazure.png "get_it_now_on_azure")

1. ポップアップ ウィンドウで、Zilliz Cloud に必要な基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enterbasicinformationazure.png "enter_basic_information_azure")

1. **Zilliz Cloud のサブスクライブ** ページで、以下の手順を実行します。

    1. 適切な **サブスクリプション** と **リソース グループ** を選択して、**プロジェクトの詳細** を設定します。リソース グループが存在しない場合は新規作成してください。サブスクリプションとリソース グループの詳細については、Azure の [The SaaS Purchase Experience](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS の詳細** を設定します。

        1. 後から識別しやすいよう、サブスクリプションに名前を付けます。

        1. 契約期間として 1 か月または 1 年を選択します。

        1. **自動更新** を設定します。

            <Admonition type="info" icon="📘" title="📘 Note">

            自動更新がオンの場合、契約期間終了時に Azure 上の Zilliz Cloud が自動的に更新されます。オフの場合は契約期間終了時にサブスクリプションが終了し、Zilliz Cloud の組織とアカウントがこの Azure Marketplace サブスクリプションから自動的にリンク解除されます。

            </Admonition>

    1. サブスクリプションの内容を確認し、**確認とサブスクライブ** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configuresubscriptiononazure.png "configure_subscription_on_azure")

1. 次のページで **今すぐアカウントを構成** をクリックし、Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configureaccountazure.png "configure_account_azure")

1. 新しく開いたタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloud アカウントをお持ちの場合はログインします。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud)を選択して登録を進めてください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 承認を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **請求** ページで、Azure Marketplace サブスクリプションが支払い方法として正しく設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法の変更\{#update-subscription-or-payment-method}

Marketplace 経由でのサブスクリプション完了後は、必要に応じていつでも設定を更新できます。

具体的には、以下の操作が可能です。

- サブスクリプションに使用する Marketplace アカウントを別のアカウントに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法の更新](./update-payment-method)を参照してください。

## Azure Marketplace サブスクリプションのキャンセル\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace のホームページを開きます。

1. **すべてのリソース** をクリックするか、**リソース/Recent** タブで対象のサブスクリプションを探します。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azureallresources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションを選択し、**サブスクリプションのキャンセル** をクリックします。Azure Marketplace での処理が完了するまで数分間お待ちください。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancelazuresubscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でのサブスクリプション キャンセルに関する詳細は、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription)を参照してください。

## トラブルシューティング\{#troubleshooting}

**Azure Marketplace 経由でサブスクライブする際に「No plans are available for market '&lt;country_code&gt;'」と表示されるのはなぜですか？**

このメッセージは、Zilliz Cloud が請求先の国または地域の Azure Marketplace でまだ利用できない場合に表示されます。詳細については、[対応市場](./subscribe-on-azure-marketplace#before-you-start)を参照してください。[サポートにお問い合わせ](http://support.zilliz.com)のうえ、エラー メッセージのスクリーンショットと市場コードをお知らせください。代替手段のご提案や、提供地域の更新を行える場合があります。

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの原因が考えられます。

- **権限不足**

    十分な権限がない場合に発生します。利用できない組織の横に **「Insufficient Permissions」** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** のロールが必要です。Organization Member のみでは必要な権限がありませんので、組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションにリンクされている**

    所有するすべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **「Marketplace Linked」** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応が可能です。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **一覧に組織が表示されない**

    - アカウントが閉鎖された場合や、すべての組織から退出した場合に発生する可能性があります。UI は次のように表示されます。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次の操作を行えます。

    - [新しい組織を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに依頼して、それぞれの組織へ[招待](./manage-platform-users#invite-organization-members)してもらい、Organization Owner ロールを付与してもらう。
