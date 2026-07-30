---
title: "Azure Marketplace での購読 | BYOC"
slug: /subscribe-on-azure-marketplace
sidebar_key: subscribe-on-azure-marketplace
sidebar_label: "Azure Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Azure Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、料金条件についても解説します。"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 6
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

# Azure Marketplace での購読

このガイドでは、Azure Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、料金条件についても解説します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、Azure クラスターの使用料金を Azure Marketplace 経由で支払うことができます。他のクラウドプロバイダーにデプロイしたクラスターがある場合も、Azure Marketplace を使用して支払いを行うことができます。</p>

</Admonition>

## 開始前に\{#before-you-start}

Azure Marketplace での購読に必要な [Azure Marketplace](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview) アカウントと Azure [請求アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) を用意してください。

また、請求先の国または地域が対応マーケットのリストに含まれていることを確認してください。Zilliz Cloud は、税務およびコンプライアンス上の理由から、Azure Marketplace の特定のマーケットをサポートしていません。サポート対象外のマーケットから購読しようとすると、`"No plans are available for market '<market_code>'."` というエラーメッセージが表示される場合があります。この場合は、[サポートにお問い合わせ](http://support.zilliz.com/) いただき、エラーメッセージのスクリーンショットとマーケットコードをご提供ください。可能な解決策についてご相談させていただきます。

![YaPcbHnQXovDLIxks0xcItOJnpf](https://zdoc-images.s3.us-west-2.amazonaws.com/yapcbhnqxovdlixks0xcitojnpf.png "YaPcbHnQXovDLIxks0xcItOJnpf")

<details>

<summary>対応マーケット</summary>

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

## Azure Marketplace での購読\{#subscribe-on-azure-marketplace}

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us) にアクセスし、以下の手順で Zilliz Cloud の購読を開始してください：

<Supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo" />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[Azure Marketplace に移動](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview) して Zilliz Cloud のポータルページを表示します。

    ![search_for_zilliz_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_azure.png "search_for_zilliz_on_azure")

1. **Zilliz Cloud** をクリックします。

    サービスと料金について確認してください。

1. **プランと料金** タブに切り替え、**今すぐ入手** をクリックします。

    ![get_it_now_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/get_it_now_on_azure.png "get_it_now_on_azure")

1. ポップアップウィンドウで、Zilliz Cloud に必要な基本情報を入力します。

    ![enter_basic_information_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_basic_information_azure.png "enter_basic_information_azure")

1. **Zilliz Cloud を購読する** ページで、以下の手順を完了します：

    1. **プロジェクトの詳細** を構成します。適切な **サブスクリプション** と **リソースグループ** を選択します。リソースグループがない場合は作成してください。サブスクリプションとリソースグループの詳細については、Azure の [SaaS 購入エクスペリエンス](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience) を参照してください。

    1. **SaaS の詳細** を構成します。

        1. 後で簡単に識別できるよう、サブスクリプションに名前を付けます。

        1. 契約期間を選択します：1 か月または 1 年。

        1. **自動更新** の設定を構成します。

            <Admonition type="info" icon="📘" title="Note">

            <p>自動更新をオンにすると、契約期間終了時に自動的に Azure Marketplace で Zilliz Cloud の購読が更新されます。自動更新をオフにすると、契約期間終了時にサブスクリプションが終了し、Zilliz Cloud の組織とアカウントがこの Azure Marketplace サブスクリプションから自動的にリンク解除されます。</p>

            </Admonition>

    1. サブスクリプションの詳細を確認し、**確認および購読** をクリックします。

    ![configure_subscription_on_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_subscription_on_azure.png "configure_subscription_on_azure")

1. 次のページで、**今すぐアカウントを構成** をクリックして、Azure Marketplace サブスクリプションを Zilliz Cloud にリンクします。

    ![configure_account_azure](https://zdoc-images.s3.us-west-2.amazonaws.com/configure_account_azure.png "configure_account_azure")

1. 新しいタブで、以下の手順に従って購読を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。ない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択してプロセスに従ってください。

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

    1. 認証を完了します。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

1. Zilliz Cloud の **請求** に移動し、Azure Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![azure-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/azure-marketplace-success.png "azure-marketplace-success")

</Procedures>

## Azure Marketplace サブスクリプションの更新\{#update-azure-marketplace-subscription}

Azure Marketplace からの購読が完了した後は、必要に応じていつでもサブスクリプションを更新できます。具体的には、購読に使用している Azure Marketplace アカウントを別のアカウントに変更するか、支払い方法を Azure Marketplace サブスクリプションからクレジットカードに切り替えることができます。

### Azure Marketplace サブスクリプションの変更\{#change-azure-marketplace-subscription}

詳細については、[Azure サブスクリプションおよびリソースグループの変更](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group) を参照してください。

更新内容は、**請求概要** ページの **支払い方法** セクションで確認できます。サブスクリプション ID をクリックし、サブスクリプションの **購入者PUID** が新しい Marketplace アカウントに更新されているか確認してください。

![view-azure-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-azure-subscription-id.png "view-azure-subscription-id")

### クレジットカード支払いへの切り替え\{#switch-to-payment-credit-card}

<Procedures>

1. 購読に使用した Azure アカウントで Azure Marketplace にサインインします。

1. Zilliz Cloud のサブスクリプションをキャンセルまたは削除します。詳細については、[サブスクリプションをキャンセル](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) および [サブスクリプションを削除](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#delete-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>Azure Marketplace でキャンセル処理が完了するまでに数分かかります。</p>

    </Admonition>

1. [クレジットカードを追加して購読](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要** ページの **支払い方法** セクションで更新内容を確認します。

</Procedures>

## Azure Marketplace サブスクリプションのキャンセル\{#cancel-azure-marketplace-subscription}

<Procedures>

1. Azure Marketplace のホームページを開きます。

1. **すべてのリソース** をクリックするか、**リソース/最近** タブでサブスクリプションを探します。

    ![azure_all_resources](https://zdoc-images.s3.us-west-2.amazonaws.com/azure_all_resources.png "azure_all_resources")

1. キャンセルしたいサブスクリプションに移動し、**サブスクリプションをキャンセル** をクリックします。Azure Marketplace で処理が完了するまで数分お待ちください。

    ![cancel_azure_subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_azure_subscription.png "cancel_azure_subscription")

</Procedures>

Azure Marketplace でのサブスクリプションキャンセルについての詳細は、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription) を参照してください。

## Azure Marketplace の料金条件\{#azure-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#payment-methods) を参照してください。

## トラブルシューティング\{#troubleshooting}

- **Azure Marketplace 経由で購読する際に「No plans are available for market '\<country_code>'」と表示されるのはなぜですか？**

    このメッセージは、Zilliz Cloud がお客様の請求先の国または地域の Azure Marketplace ではまだ利用できないために表示されます。詳細については、[対応マーケット](./subscribe-on-azure-marketplace#before-you-start) を参照してください。[サポートにお問い合わせ](http://support.zilliz.com) いただき、エラーメッセージのスクリーンショットとマーケットコードをご提供ください。代替ソリューションのご提案や、利用可能状況の更新が可能な場合があります。

- **マーケットプレイスサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

    いくつかの理由が考えられます。

    - **権限が不十分です**

        十分な権限を持っていない場合に発生します。利用できない組織の横に **"権限が不十分です"** タグが表示されます。

        ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

        マーケットプレイスサブスクリプションを組織にリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、**組織メンバー** のみである場合は、必要な権限がありません。組織オーナーにご連絡いただき、ご支援をお願いしてください。

    - **すべての組織がすでにマーケットプレイスサブスクリプションに正常にリンク済み**

        すべての組織がすでにマーケットプレイスサブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"マーケットプレイスにリンク済み"** タグが表示されます。

        ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

        この場合、

        - 既存のマーケットプレイスサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

        - 異なるマーケットプレイスサブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

    - **リストに組織がない**

        アカウントがクローズされた場合、またはすべての組織から脱退した場合に発生します。UI は以下のようになります。

        ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

        この場合、以下の方法があります：

        - [新しい組織を作成](./organization-settings#create-an-organization)します。

        - 他のユーザーに[招待](./organization-users#invite-a-user-to-your-organization) を依頼し、組織オーナーのロールを付与してもらいます。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して購読](./subscribe-by-adding-credit-card)

- [AWS Marketplace での購読](./subscribe-on-aws-marketplace)

- [GCP Marketplace での購読](./subscribe-on-gcp-marketplace)

- [請求書の表示](./manage-invoice)

 
