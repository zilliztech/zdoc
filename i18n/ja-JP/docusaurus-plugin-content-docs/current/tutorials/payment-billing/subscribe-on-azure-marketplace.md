---
title: "Azure Marketplaceで購読する | Cloud"
slug: /subscribe-on-azure-marketplace
sidebar_label: "Azure Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程を順を追って説明し、Azure Marketplace上のZilliz Cloudの価格条件について概説します。 | Cloud"
type: origin
token: ETyHwKLQwiHeJmk25vUcSKUQnk7
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - azure
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# Azure Marketplaceで購読する

このガイドでは、サブスクリプションの過程を順を追って説明し、Azure Marketplace上のZilliz Cloudの価格条件について概説します。

<Admonition type="info" icon="📘" title="ノート">

<p>一度購読すると、Azure Marketplaceを介してAzureクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、Azure Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#before-you-start}

- 必ず[Azure Marketplace](https://learn.microsoft.com/ja-jp/marketplace/azure-marketplace-overview)アカウントがあることを確認してください。

- Azure Marketplaceでサブスクリプションの[請求アカウント](https://learn.microsoft.com/ja-jp/azure/cost-management-billing/manage/view-all-accounts)を設定していることを確認してください。

## Azure Marketplaceで購読する{#subscribe-on-azure-marketplace}

以下の手順で[Azure Marketplace](https://azuremarketplace.microsoft.com/ja-JP)にアクセスし、Zilliz Cloudの購読を開始してください:

1. 検索ボックスで**Zilliz Cloud**を検索するか、 [Azure Marketplaceに移動](https://azuremarketplace.microsoft.com/ja-jp/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=Overview)してZilliz Cloudポータルページを表示します。

    ![search_for_zilliz_on_azure](/img/search_for_zilliz_on_azure.png)

1. &#91;**Zilliz Cloud**&#93;をクリックします。

    サービスと価格について理解してください。

1. &#91;**プラン+価格**&#93;タブに切り替えます。&#91;**今すぐ入手**&#93;をクリックします。

    ![get_it_now_on_azure](/img/get_it_now_on_azure.png)

1. ポップアップウィンドウで、Zilliz Cloudが必要とする基本情報を入力してください。

    ![enter_basic_information_azure](/img/enter_basic_information_azure.png)

1. 「**Zilliz Cloudの購読**」ページで、以下の手順を実行してください:

    1. 適切なサブスクリ**プションとリソースグループ**を選択して、プロジェクトの詳細を設定します。リソースグループがない場合は、作成してください。**サブスクリプション**と**リソースグループ**の詳細については、Azuresの[SaaS購入体験](https://learn.microsoft.com/en-us/marketplace/purchase-saas-offer-in-azure-portal#the-saas-purchase-experience)を参照してください。

    1. &#91;**SaaS詳細**&#93;を設定します。

        1. 後で簡単に識別できるように、サブスクリプションに名前を付けてください。

        1. 契約期間を選択してください: 1ヶ月または1年。

        1. **自動更新**の設定を行います。

        <Admonition type="info" icon="📘" title="ノート">

        <p>自動更新がオンになっている場合、契約期間の終了時にAzure上のZilliz Cloudに自動的にサブスクリプションされます。自動更新がオフになっている場合、契約期間の終了時にサブスクリプションが終了し、Zilliz Cloudの組織とアカウントはこのAzure Marketplaceサブスクリプションから自動的に解除されます。</p>

        </Admonition>

    1. サブスクリプションの詳細を確認し、&#91;**レビュー+購読**&#93;をクリックします。

    ![configure_subscription_on_azure](/img/configure_subscription_on_azure.png)

1. 次のページで、&#91;**今すぐアカウント**を構成&#93;をクリックして、Azure MarketplaceサブスクリプションをZilliz Cloudにリンクします。

    ![configure_account_azure](/img/configure_account_azure.png)

1. 新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択して、手順に従ってください。

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

    1. 完全な承認。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

1. Zilliz Cloudの**請求**に移動して、Azure Marketplaceサブスクリプションが支払い方法として設定されていることを確認してください。

    ![azure-marketplace-success](/img/azure-marketplace-success.png)

## Update Azure Marketplaceサブスクリプション{#update-azure-marketplace-subscription}

Azure Marketplaceから正常にサブスクライブした後は、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用されるAzure Marketplaceアカウントを別のアカウントに変更するか、Azure Marketplaceサブスクリプションからクレジットカードに支払い方法を切り替えることができます。

### Azure Marketplaceのサブスクリプションを変更する{#change-azure-marketplace-subscription}

詳細については、「[Azureサブスクリプションおよび/またはリソースグループの変更](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#change-azure-subscription-andor-resource-group)」を参照してください。

更新内容は、&#91;**支払方法**&#93;セクションの&#91;**請求概要**&#93;ページで確認できます。&#91;サブスクリプションID&#93;をクリックし、サブスクリプション**購入者PUID**が新しいMarketplaceアカウントに更新されているかどうかを確認します。

![view-azure-subscription-id](/img/view-azure-subscription-id.png)

### クレジットカード決済に切り替える{#switch-to-payment-credit-card}

1. サブスクリプションに使用したAzureアカウントでAzure Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルまたは削除します。詳細については、[サブスクリプションキャンセル](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#cancel-subscription)および[サブスクリプション削除](https://learn.microsoft.com/ja-jp/marketplace/saas-subscription-lifecycle-management#delete-subscription)を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Azure Marketplaceでキャンセルの過程が完了するまで数分かかります。</p>

    </Admonition>

1. 「[クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)」の手順に従って、支払いクレジットカードを追加します。

1. &#91;**支払方法**&#93;セクションの&#91;**請求概要**&#93;ページで更新を確認します。

## Azure Marketplaceのサブスクリプションをキャンセルする{#cancel-azure-marketplace-subscription}

1. Azure Marketplaceのホームページを開きます。

1. &#91;**すべてのリソース**&#93;をクリックするか、&#91;**リソース/最近**&#93;タブでサブスクリプションを見つけます。

    ![azure_all_resources](/img/azure_all_resources.png)

1. キャンセルしたいサブスクリプションに移動します。&#91;**サブスクリプションのキャンセル**&#93;をクリックします。Azure Marketplaceが処理を完了するまで数分間お待ちください。

    ![cancel_azure_subscription](/img/cancel_azure_subscription.png)

Azure Marketplaceでサブスクリプションをキャンセルする方法の詳細については、[こちら](https://learn.microsoft.com/en-us/marketplace/saas-subscription-lifecycle-management#cancel-subscription)を参照してください。

## Azure Marketplaceの価格条件{#azure-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing)を参照してください。

## トラブルシューティング{#troubleshooting}

**Zilliz Cloudにマーケットプレイスのサブスクリプションをリンクする際に利用可能な組織がない場合、私は何ができますか?**

いくつかの理由が考えられます:

1. **不十分な権限**

    これは、十分な権限がない場合に発生する可能性があります。利用できない組織の横に「権限不足」タグが表示されます。

    ![insufficient-permission-subscription](/img/insufficient-permission-subscription.png)

1. **すべての組織はすでにMarketplaceサブスクリプションに正常にリンクされています**(UIプロンプト: Marketplace Linked)

    1. 既存のMarketplaceサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションの[リンク](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)を解除してから、新しいサブスクリプションを設定してください。

    1. 異なるマーケットプレイスのサブスクリプションに複数の組織が必要な場合は、次のことができます:

        1. [新し](./register-with-zilliz-cloud)いZilliz Cloudアカウントを登録して、新しい組織を作成します。その後、組織のオーナーを新しい組織に[招待](./organization-users#invite-a-user-to-your-organization)します。この組織のオーナーは複数の組織に所属し、組織ごとに異なるマーケットプレイスのサブスクリプションを設定できます。

        1. [サポートチケットを作成](http://support.zilliz.com)すると、新しい組織が作成されます。現在、Zilliz Cloudでは、ユーザーが手動で組織を作成することはサポートされていません。

1. **リストに組織がありません**

    アカウントが閉鎖された場合や、すべての組織から離脱した場合に発生する可能性があります。UIは以下のようになります。

    ![no-organization-during-subcription](/img/no-organization-during-subcription.png)

    この場合、次のことができます:

    1. 新しい組織を作る。

    1. 他のユーザに自分をOrganizationの所有者としてOrganizationに[招待](./organization-users#invite-a-user-to-your-organization)するように依頼します。

    1. [サポートチケットを送信](https://support.zilliz.com/hc/en-us)すると、新しい組織が作成されます。

1. **Zilliz Cloud BYOCを使用しています。**

    あなたの組織が実際にZilliz Cloud BYOC組織である場合、これが起こる可能性があります。利用できない組織の横に「署名済み契約」タグが表示されます。BYOC組織には支払い方法は必要ありません。ご質問がある場合は、[営業にお問い合わせ](https://zilliz.com/contact-sales)ください。 

    ![signed-contract-subscription](/img/signed-contract-subscription.png)

## 関連するトピック{#related-topics}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [AWS Marketplaceで購読する](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplaceに登録する](./subscribe-on-gcp-marketplace)

- [インボイス](./view-invoice)

 