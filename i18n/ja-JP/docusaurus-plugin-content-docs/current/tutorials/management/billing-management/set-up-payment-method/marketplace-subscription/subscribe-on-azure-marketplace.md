---
title: "Microsoft Marketplace の Public Offer をサブスクライブする | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Microsoft Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace における Zilliz Cloud の価格条件を紹介します。 | Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

import Procedures from '@site/src/components/Procedures';

# Microsoft Marketplace の Public Offer をサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace における Zilliz Cloud の価格条件を紹介します。

<Admonition type="info" icon="📘" title="📘 Note">

- サブスクライブ後は、Azure Marketplace 経由で Azure cluster の利用料金を支払うことができます。ほかのクラウドプロバイダーに cluster をデプロイしている場合でも、Azure Marketplace を使用して支払うことができます。

- Azure Marketplace の請求を異なるチームまたは事業部門ごとに分ける必要がある場合は、[Azure Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-azure-marketplace) を参照してください。

</Admonition>

## 始める前に\{#before-you-start}

Azure Marketplace でサブスクライブするために、[Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure の [billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) を用意してください。

また、請求先の国または地域がサポート対象マーケットの一覧に含まれていることも確認してください。Zilliz Cloud は、税務およびコンプライアンス上の理由により、Azure Marketplace の一部マーケットをサポートしていません。サポート対象外のマーケットからサブスクライブしようとすると、`"No plans are available for market '<market_code>'."` というエラーメッセージが表示される場合があります。この場合は、エラーメッセージのスクリーンショットと market code を添えて、[サポートにお問い合わせ](http://support.zilliz.com/)ください。可能な解決策についてご相談させていただきます。

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>サポート対象マーケット</summary>

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

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、次の手順で Zilliz Cloud のサブスクリプションを開始します。

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[Azure Marketplace に移動](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_azure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービスと価格を確認してください。

1. **Plans + Pricing** タブに切り替えます。**Get it now** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/get_it_now_on_azure.png "get_it_now_on_azure")

1. ポップアップウィンドウで、Zilliz Cloud が必要とする基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_basic_information_azure.png "enter_basic_information_azure")

1. **Subscribe to Zilliz Cloud** ページで、以下の手順を完了します。

    1. 適切な **Subscription** と **Resource group** を選択して **Project Details** を設定します。Resource group がない場合は作成してください。subscription と resource group の詳細については、Azure の [The SaaS Purchase Experience](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS Details** を設定します。 

        1. 後で識別しやすいようにサブスクリプションに名前を付けます。

        1. 契約期間を選択します：1 か月または 1 年。

        1. **Auto-renew** の設定を行います。

            <Admonition type="info" icon="📘" title="📘 Note">

            auto-renew がオンの場合、契約期間の終了時に Azure 上の Zilliz Cloud が自動的に継続サブスクライブされます。auto-renew がオフの場合、契約期間の終了時にサブスクリプションは終了し、Zilliz Cloud の organization と account はこの Azure Marketplace サブスクリプションから自動的にリンク解除されます。

            </Admonition>

    1. サブスクリプションの詳細を確認し、**Review+Subscribe** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_subscription_on_azure.png "configure_subscription_on_azure")

1. 次のページで、**Configure account now** をクリックして Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_account_azure.png "configure_account_azure")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud account をお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択し、手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud organization にリンクします。

    1. 認可を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **Billing** に移動し、Azure Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からのサブスクライブが正常に完了した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、以下のいずれかを行えます。

- サブスクリプションに使用している Marketplace account を別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法を更新する](./update-payment-method) を参照してください。

## Azure Marketplace サブスクリプションをキャンセルする\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace のホームページを開きます。

1. **All resources** をクリックするか、**Resources/Recent** タブでサブスクリプションを見つけます。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azure_all_resources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションに移動します。**Cancel subscription** をクリックします。Azure Marketplace が処理を完了するまで数分待ちます。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_azure_subscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でのサブスクリプションのキャンセル方法の詳細については、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Azure Marketplace 経由でサブスクライブすると、「No plans are available for market '&lt;country_code&gt;'」と表示されるのはなぜですか？**

このメッセージは、請求先の国または地域向けに Azure Marketplace で Zilliz Cloud がまだ利用可能になっていないために表示されます。詳細については、[サポート対象マーケット](./subscribe-on-azure-marketplace#before-you-start) を参照してください。エラーメッセージのスクリーンショットと market code を添えて、[サポートにお問い合わせ](http://support.zilliz.com)ください。代替案をご案内したり、提供状況を更新できる場合があります。

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際に利用可能な organization がない場合は、どうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない organization の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    organization を marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみである場合は必要な権限がありません。サポートについては organization owner にお問い合わせください。

- **すべての organization がすでに Marketplace サブスクリプションに正常にリンクされている**

    これは、すべての organization がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない organization の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、以下の対応が可能です。

    - 既存の marketplace サブスクリプションを更新する必要がある場合は、まずその organization の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の organization が必要な場合は、[organization を作成](./organization-settings#create-an-organization)できます。

- **一覧に organization がない**

    - これは、account が閉鎖されている場合、またはすべての organization から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、以下のことができます。

    - [新しい organization を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、その organization にあなたを[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらいます。

