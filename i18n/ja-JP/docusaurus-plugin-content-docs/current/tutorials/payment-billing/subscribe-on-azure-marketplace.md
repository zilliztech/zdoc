---
title: "Azure Marketplaceで購読する | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Azure Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程を順を追って説明し、Azure Marketplace上のZilliz Cloudの価格条件について概説します。 | Cloud"
type: origin
token: LbFXwpruviFWWokwtkhcVmnhnFh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - azure
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


# Azure Marketplaceで購読する

このガイドでは、サブスクリプションの過程を順を追って説明し、Azure Marketplace上のZilliz Cloudの価格条件について概説します。

<Admonition type="caution" icon="🚧" title="undefined">

<p>一度購読すると、Azure Marketplaceを介してAzureクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、Azure Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#before-you-start}

- [Azure Marketplace Azureブログ](https://learn.microsoft.com/en-us/marketplace/azure-marketplace-overview)アカウントを持っていることを確認してください。

- Azure Marketplaceのサブスクリプションに[請求アカウント](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts)を設定していることを確認してください。

## Azure Marketplaceで購読する{#subscribe-on-azure-marketplace}

[Azure Marketplace Azureブログ](https://azuremarketplace.microsoft.com/en-us)にアクセスし、以下の手順でZilliz Cloudの購読を開始してください。

<supademo id="cm9jmpiac3eq2ljv5itt1tn7s" title="Zilliz Cloud - Azure Marketplace Subscription Demo"></supademo>

1. 検索ボックスで**Zilliz Cloud**を検索するか、[Azure Marketplaceにアクセスしてください。](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)をクリックしてZilliz Cloudポータルページを表示してください。

    ![search_for_zilliz_on_azure](/img/search_for_zilliz_on_azure.png)

1. 「Zilliz Cloud」をクリックしてください。

    サービスと価格について理解してください。

1. 「プラン+価格」タブに切り替えます。「今すぐ入手」をクリックしてください。

    ![get_it_now_on_azure](/img/get_it_now_on_azure.png)

1. ポップアップウィンドウで、Zilliz Cloudが必要とする基本情報を入力してください。

    ![enter_basic_information_azure](/img/enter_basic_information_azure.png)

1. 「Zilliz Cloudの購読」ページで、以下の手順を実行してください:

    1. 適切なサブスクリプションとリソースグループを選択して、**プロジェクトの詳細**を構成します。リソースグループがない場合は、作成してください。サブスクリプションとリソースグループの詳細については、Azuresの[SaaSの購入体験](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience)を参照してください。

    1. SaaSの詳細を設定してください。 

        1. 後で簡単に識別できるように、サブスクリプションに名前を付けてください。

        1. 契約期間を選択してください: 1ヶ月または1年。

        1. **自動更新**の設定を行います。

            <Admonition type="caution" icon="🚧" title="undefined">

            <p>自動更新がオンになっている場合、契約期間の終了時にAzure上のZilliz Cloudに自動的にサブスクリプションされます。自動更新がオフになっている場合、契約期間の終了時にサブスクリプションが終了し、Zilliz Cloudの組織とアカウントはこのAzure Marketplaceサブスクリプションから自動的に解除されます。</p>

            </Admonition>

    1. サブスクリプションの詳細を確認し、[**Review+Subscribe**]をクリックします。

    ![configure_subscription_on_azure](/img/configure_subscription_on_azure.png)

1. 次のページで、**今すぐアカウントを構成**をクリックして、Azure MarketplaceサブスクリプションをZilliz Cloudにリンクしてください。

    ![configure_account_azure](/img/configure_account_azure.png)

1. 新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択し、手順に従ってください。

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

    1. 完全な承認。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

1. Zilliz Cloudの**請求**に移動して、Azure Marketplaceサブスクリプションが支払い方法として設定されていることを確認してください。

    ![azure-marketplace-success](/img/azure-marketplace-success.png)

## Update Azure Marketplaceサブスクリプション{#update-azure-marketplace-subscription}

Azure Marketplaceから正常にサブスクライブした後は、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用されるAzure Marketplaceアカウントを別のアカウントに変更するか、Azure Marketplaceサブスクリプションからクレジットカードに支払い方法を切り替えることができます。 

### Azure Marketplaceのサブスクリプションを変更する{#change-azure-marketplace-subscription}

詳細については、[Azureサブスクリプションとリソースグループを変更する](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group)を参照してください。

「請求概要」ページの「支払い方法」セクションで更新を確認できます。「サブスクリプションID」をクリックし、「購入者PUID」が新しいマーケットプレイスアカウントに更新されたかどうかを確認してください。

![view-azure-subscription-id](/img/view-azure-subscription-id.png)

### クレジットカード決済に切り替える{#switch-to-payment-credit-card}

1. サブスクリプションに使用したAzureアカウントでAzure Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルまたは削除してください。詳細については、[購読をキャンセルする](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription)と[サブスクリプションを削除](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#delete-subscription)を参照してください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>Azure Marketplaceでキャンセルの過程が完了するまで数分かかります。</p>

    </Admonition>

1. [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払いクレジットカードを追加してください。

1. 「請求概要」ページの「支払い方法」セクションで更新を確認してください。

## Azure Marketplaceのサブスクリプションをキャンセルする{#cancel-azure-marketplace-subscription}

1. Azure Marketplaceのホームページを開きます。

1. 「すべてのリソース」をクリックするか、「リソース/最近」タブでサブスクリプションを見つけてください。

    ![azure_all_resources](/img/azure_all_resources.png)

1. キャンセルしたいサブスクリプションに移動します。**サブスクリプションのキャンセル**をクリックします。Azure Marketplaceが処理を完了するまで数分間お待ちください。

    ![cancel_azure_subscription](/img/cancel_azure_subscription.png)

Azure Marketplaceでサブスクリプションをキャンセルする方法の詳細については、[わたくし](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription)を参照してください。

## Azure Marketplaceの価格条件{#azure-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング{#troubleshooting}

- Azure Marketplaceを介してサブスクライブすると、「市場'X X国'にプランがありません」と表示されるのはなぜですか?

    このメッセージは、Zilliz Cloudが請求先の国のAzure Marketplaceでまだ利用できないため表示されます。[サポートに連絡](http://support.zilliz.com)をクリックして、購読している国をお知らせください。代替ソリューションを提供したり、可用性を更新したりすることができる場合があります。

- **Zilliz Cloudにマーケットプレイスのサブスクリプションをリンクする場合、利用可能な組織がない場合はどうすればよいですか?**

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

- [GCP Marketplaceで購読する](./subscribe-on-gcp-marketplace)

- リンク_PLACEHOLDER_0

 