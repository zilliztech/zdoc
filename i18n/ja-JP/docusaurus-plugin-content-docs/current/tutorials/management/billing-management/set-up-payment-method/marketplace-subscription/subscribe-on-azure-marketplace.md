---
title: "Microsoft Marketplace の Public Offer にサブスクライブする | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Microsoft Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace における Zilliz Cloud の料金体系を紹介します。 | Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

import Procedures from '@site/src/components/Procedures';

# Microsoft Marketplace の Public Offer にサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、Azure Marketplace における Zilliz Cloud の料金体系を紹介します。

<Admonition type="info" icon="📘" title="📘 Note">

- サブスクライブ後は、Azure Marketplace 経由で Azure クラスターの利用料金を支払えます。他のクラウドプロバイダーにクラスターをデプロイしている場合でも、Azure Marketplace を使用して支払うことができます。

- 異なるチームや事業部門ごとに Azure Marketplace の請求を分ける必要がある場合は、[Azure Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-azure-marketplace) を参照してください。

</Admonition>

## 始める前に\{#before-you-start}

Azure Marketplace でサブスクライブするには、[Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure の[請求アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts)があることを確認してください。

また、請求先の国または地域がサポート対象の市場リストに含まれていることも確認してください。税務およびコンプライアンス上の理由により、Zilliz Cloud は Azure Marketplace の一部市場ではサポートされていません。サポート対象外の市場からサブスクライブしようとすると、`"No plans are available for market '<market_code>'."` というエラーメッセージが表示される場合があります。この場合は、エラーメッセージのスクリーンショットとマーケットコードを添えて[サポートにお問い合わせ](http://support.zilliz.com/)ください。可能な解決策についてご案内します。

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>サポート対象の市場</summary>

<Grid columnSize="4" widthRatios="25,25,25,25">

    <div>

        - Armenia

        - Australia

        - Austria

        - Bahrain

        - Barbados

        - Belarus

        - Belgium

        - Brazil

        - Bulgaria

        - Canada

        - Chile

        - Colombia

        - Croatia

        - Cyprus

        - Czechia

        - Denmark

        - Egypt

        - Estonia

        - Finland

    </div>

    <div>

        - France

        - Georgia

        - Germany

        - Greece

        - Hong Kong SAR

        - Hungary

        - Iceland

        - India

        - Indonesia

        - Ireland

        - Italy

        - Japan

        - Kenya

        - Latvia

        - Liechtenstein

        - Lithuania

        - Luxembourg

        - Malaysia

    </div>

    <div>

        - Malta

        - Moldova

        - Monaco

        - Netherlands

        - New Zealand

        - Nigeria

        - Norway

        - Oman

        - Philippines

        - Poland

        - Portugal

        - Puerto Rico

        - Qatar

        - Romania

        - Russia

        - Saudi Arabia

        - Serbia

        - Singapore

        - Slovakia

    </div>

    <div>

        - Slovenia

        - South Africa

        - South Korea

        - Spain

        - Sweden

        - Switzerland

        - Taiwan

        - Tajikistan

        - Thailand

        - Türkiye

        - Uganda

        - Ukraine

        - United Arab Emirates

        - United Kingdom

        - United States

        - Uzbekistan

        - Vietnam

    </div>

</Grid>

</details>

## Azure Marketplace でサブスクライブする\{#subscribe-on-azure-marketplace}

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、以下の手順で Zilliz Cloud へのサブスクライブを開始します。

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[Azure Marketplace に移動](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/searchforzillizonazure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービス内容と料金を確認してください。

1. **Plans + Pricing** タブに切り替え、**Get it now** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/getitnowonazure.png "get_it_now_on_azure")

1. ポップアップウィンドウで、Zilliz Cloud に必要な基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enterbasicinformationazure.png "enter_basic_information_azure")

1. **Subscribe to Zilliz Cloud** ページで、以下の手順を完了します。

    1. 適切な **Subscription** と **Resource group** を選択して **Project Details** を設定します。Resource group がない場合は作成してください。サブスクリプションとリソースグループの詳細については、Azure の [The SaaS Purchase Experience](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS Details** を設定します。 

        1. 後で識別しやすいように、サブスクリプションに名前を付けます。

        1. 契約期間を選択します: 1 か月または 1 年。

        1. **Auto-renew** 設定を構成します。

            <Admonition type="info" icon="📘" title="📘 Note">

            Auto-renew がオンの場合、契約期間終了時に Azure 上の Zilliz Cloud へ自動的に再サブスクライブされます。Auto-renew がオフの場合、契約期間終了時にサブスクリプションは終了し、この Azure Marketplace サブスクリプションと Zilliz Cloud 組織およびアカウントのリンクは自動的に解除されます。

            </Admonition>

    1. サブスクリプションの詳細を確認し、**Review+Subscribe** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configuresubscriptiononazure.png "configure_subscription_on_azure")

1. 次のページで、**Configure account now** をクリックして Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configureaccountazure.png "configure_account_azure")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud)を選択し、手順に従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認可を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **Billing** に移動し、Azure Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からのサブスクライブに成功した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、以下のいずれかを実行できます。

- サブスクリプションに使用している Marketplace アカウントを別のものに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法を更新する](./update-payment-method) を参照してください。

## Azure Marketplace サブスクリプションをキャンセルする\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace のホームページを開きます。

1. **All resources** をクリックするか、**Resources/Recent** タブでサブスクリプションを見つけます。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azureallresources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションに移動し、**Cancel subscription** をクリックします。Azure Marketplace が処理を完了するまで数分待ちます。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancelazuresubscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でサブスクリプションをキャンセルする方法の詳細については、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription)を参照してください。

## トラブルシューティング\{#troubleshooting}

**Azure Marketplace 経由でサブスクライブする際に “No plans are available for market '&lt;country_code&gt;'” と表示されるのはなぜですか？**

このメッセージは、請求先の国または地域では Zilliz Cloud がまだ Azure Marketplace で利用できないために表示されます。詳細については、[サポート対象の市場](./subscribe-on-azure-marketplace#before-you-start)を参照してください。エラーメッセージのスクリーンショットとマーケットコードを添えて、[サポートにお問い合わせ](http://support.zilliz.com)ください。代替案をご案内できる場合や、利用可能状況を更新できる場合があります。

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不足している** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace サブスクリプションと組織をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。組織の所有者に問い合わせて支援を依頼してください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、以下を確認してください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその組織の現在のサブスクリプションのリンクを解除し、その後で新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプションごとに複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されているか、すべての組織から退出している場合に発生することがあります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下を実行できます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに依頼して、そのユーザーの組織に[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner ロールを付与してもらってください。

