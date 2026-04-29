---
title: "Azure Marketplace で購読 | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_key: subscribe-on-azure-marketplace
sidebar_label: "Azure Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順を段階的に説明し、Azure Marketplace における Zilliz Cloud の料金条件を概説します。| Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - azure

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Grid from '@site/src/components/Grid';

import Procedures from '@site/src/components/Procedures';

# Azure Marketplace で購読する

このガイドでは、サブスクリプションプロセスのステップバイステップの説明と、Azure Marketplace における Zilliz Cloud の料金条件について説明します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、Azure クラスターの使用料を Azure Marketplace を介して支払うことができます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、Azure Marketplace を使用して支払うことができます。</p>

</Admonition>

## 始める前に\{#before-you-start}

Azure Marketplace でサブスクリプションを利用するには、[Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure の [請求アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) が必要です。

また、請求先国または地域がサポートされている市場のリストに含まれていることを確認してください。税務およびコンプライアンス上の理由により、Zilliz Cloud は Azure Marketplace において特定の市場をサポートしていません。サポートされていない市場から購読を試みると、`"No plans are available for market '<market_code>'."` というエラーメッセージが表示される場合があります。その場合は、[サポートにお問い合わせ](http://support.zilliz.com/)いただき、エラーメッセージのスクリーンショットと市場コードをご提供ください。可能な解決策についてご相談させていただきます。

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>サポートされている市場</summary>

<Grid columnSize="4" widthRatios="25,25,25,25">

    <div>

        - Armenia

        - Australia

        - Austria

        - Bahrain

        - Barbados

        - Belarus

        - Belgium

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

    </div>

    <div>

        - Slovakia

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

## Azure Marketplace で購読する\{#subscribe-on-azure-marketplace}

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、以下の手順に従って Zilliz Cloud の購読を開始します。

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[Azure Marketplace に移動](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) して Zilliz Cloud ポータルページを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_azure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービスと料金についてご確認ください。

1. **プランと料金** タブに切り替え、**Get it now** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/get_it_now_on_azure.png "get_it_now_on_azure")

1. ポップアップウィンドウで、Zilliz Cloud が必要とする基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_basic_information_azure.png "enter_basic_information_azure")

1. **Zilliz Cloud を購読する** ページで、以下の手順を実行します。

    1. 適切な **Subscription** と **リソースグループ** を選択して **プロジェクトの詳細** を構成します。リソースグループがない場合は、作成してください。サブスクリプションとリソースグループの詳細については、Azure の [SaaS 購入エクスペリエンス](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS の詳細** を構成します。

        1. 後で簡単に識別できるよう、サブスクリプションに名前を付けます。

        1. 契約期間を選択します：1 か月または 1 年。

        1. **自動更新** 設定を構成します。

            <Admonition type="info" icon="📘" title="Note">

            <p>自動更新がオンの場合、契約期間の終了時に Azure で Zilliz Cloud に自動的に購読されます。自動更新がオフの場合、契約期間の終了時にサブスクリプションが終了し、Zilliz Cloud 組織とアカウントはこの Azure Marketplace サブスクリプションから自動的にリンク解除されます。</p>

            </Admonition>

    1. サブスクリプションの詳細を確認し、**Review+購読** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_subscription_on_azure.png "configure_subscription_on_azure")

1. 次のページで、**Configure account now** をクリックして、Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_account_azure.png "configure_account_azure")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。お持ちでない場合は、[登録オプション](./register-with-zilliz-cloud) のいずれかを選択して手続きを進めてください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認証を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **請求** に移動し、Azure Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## Azure Marketplace サブスクリプションを更新する\{#update-azure-marketplace-subscription}

Azure Marketplace から正常に購読した後、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用されている Azure Marketplace アカウントを別のアカウントに変更するか、支払い方法を Azure Marketplace サブスクリプションからクレジットカードに切り替えることができます。

### Azure Marketplace サブスクリプションを変更する\{#change-azure-marketplace-subscription}

詳細については、[Azure サブスクリプションおよび/またはリソースグループの変更](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group) を参照してください。

**請求概要** ページの **支払い方法** セクションで更新を確認できます。サブスクリプション ID をクリックし、サブスクリプションの **購入者 PUID** が新しい Marketplace アカウントに更新されているか確認します。

![view-azure-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-azure-subscription-id.png "view-azure-subscription-id")

### 支払い用クレジットカードに切り替える\{#switch-to-payment-credit-card}

<Procedures>

1. サブスクリプションに使用した Azure アカウントで Azure Marketplace にサインインします。

1. Zilliz Cloud サブスクリプションをキャンセルまたは削除します。詳細については、[サブスクリプションをキャンセル](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) および [サブスクリプションを削除](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#delete-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>Azure Marketplace によるキャンセル処理の完了には数分かかる場合があります。</p>

    </Admonition>

1. [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要** ページの **支払い方法** セクションで更新を確認します。

</Procedures>

## Azure Marketplace サブスクリプションをキャンセルする\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace ホームページを開きます。

1. **すべてのリソース** をクリックするか、**リソース/最近** タブでサブスクリプションを見つけます。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azure_all_resources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションに移動します。**サブスクリプションをキャンセル** をクリックします。Azure Marketplace による処理完了まで数分お待ちください。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_azure_subscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でサブスクリプションをキャンセルする方法の詳細については、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) を参照してください。

## Azure Marketplace の料金条件\{#azure-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms) を参照してください。

## トラブルシューティング\{#troubleshooting}

- **Azure Marketplace を介して購読する際に、「No plans are available for market '\<country_code>'」というメッセージが表示されるのはなぜですか？**

    このメッセージは、請求先国または地域において、Zilliz Cloud がまだ Azure Marketplace で利用できない場合に表示されます。詳細については、[サポートされている市場](./subscribe-on-azure-marketplace#before-you-start) をご覧ください。[サポートにお問い合わせ](http://support.zilliz.com) いただき、エラーメッセージのスクリーンショットと市場コードをご提供ください。代替ソリューションのご提案や、利用可能地域の更新ができる場合があります。

- **マーケットプレイスサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

    いくつかの理由が考えられます。

    - **権限が不十分です**

        これは、十分な権限を持っていない場合に発生します。利用できない組織の横に **"権限が不十分です"** というタグが表示されます。

        ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

        組織をマーケットプレイスサブスクリプションにリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、単なる組織メンバーの場合、必要な権限がありません。組織オーナーにお問い合わせください。

    - **すべての組織がすでに Marketplace サブスクリプションにリンク済みです**

        これは、すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"マーケットプレイスにリンク済み"** というタグが表示されます。

        ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

        この場合、

        - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションを [リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) し、その後新しいサブスクリプションを設定してください。

        - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、次のいずれかを行えます。

            - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して新しい組織を作成します。次に、組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) します。この組織オーナーは複数の組織に所属することになり、各組織ごとに Marketplace サブスクリプションを設定できます。

            - [サポートチケットを作成](http://support.zilliz.com) して、新規組織を作成してもらいます。現在、Zilliz Cloud ではユーザーによる組織の手動作成はサポートされていません。

    - **リストに組織がありません**

        これは、アカウントが閉鎖されているか、すべての組織から脱退している場合に発生します。UI は以下のようになります。

        ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

        この場合、次のいずれかを行えます。

        - 新しい組織を作成します。

        - 他のユーザーに、あなたを自分の組織に [招待](./organization-users#invite-a-user-to-your-organization) し、組織オーナーの役割を付与するよう依頼します。

        - [サポートチケットを作成](https://support.zilliz.com/hc/en-us) して、新しい組織を作成してもらいます。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplace で購読する](./subscribe-on-aws-marketplace)

- [GCP Marketplace で購読する](./subscribe-on-gcp-marketplace)

- [請求書を表示する](./view-invoice)

 