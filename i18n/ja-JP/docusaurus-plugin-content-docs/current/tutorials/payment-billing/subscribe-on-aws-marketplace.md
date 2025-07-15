---
title: "AWS Marketplaceで購読する | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程をステップバイステップで説明し、AWS Marketplace上のZilliz Cloudの価格条件を概説します。 | Cloud"
type: origin
token: MjrLwXGCqidVczk2LuScB81Nnc2
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - aws
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';


# AWS Marketplaceで購読する

このガイドでは、サブスクリプションの過程をステップバイステップで説明し、AWS Marketplace上のZilliz Cloudの価格条件を概説します。

<Admonition type="info" icon="📘" title="ノート">

<p>一度購読すると、AWS Marketplaceを介してAWSクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、AWS Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#before-you-start}

- 必ずAWSMarketplaceアカウントをお持ちください。

- インボイスプランにAWSバイヤーIDのデフォルトの支払い方法を設定してください。[デフォルトの支払い方法を変更する方法を学びましょう](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- 既存のZilliz Cloudユーザーの場合は、別のメールアドレスを使用してAWSMarketplaceに登録してください。

- AWSアカウントが組織の一部である場合は、請求管理者によって購入を行う権限が必要です。

## 購読するAWSMarketplace{#subscribe-on-aws-marketplace}

以下の手順で[AWS Marketplace](https://aws.amazon.com/marketplace)にアクセスし、Zilliz Cloudの購読を開始してください:

1. 検索ボックスで**Zilliz Cloud**を検索するか、[AWS Marketplaceにアクセス](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz)してZilliz Cloudポータルページを表示してください。

    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. [**Zilliz Cloud**]をクリックします。

    サービスと価格について理解してください。

    すでにZilliz Cloudをお使いの場合は、**購入オプションを表示**をクリックしてください。

    Zilliz Cloudを使用したことがない場合は、AWSが提供する30日間の無料トライアルである「**Try for free**」をクリックしてください。無料トライアルが終了したら、Zilliz Cloudを引き続き使用するために[サブスクリプションをアップグレード](./subscribe-on-aws-marketplace#upgrade-subscription-from-free-trial)する必要があります。

    ![view_purchase_options](/img/view_purchase_options.png)

1. ページを下にスクロールし、[**購読**]をクリックします。

    ![aws_flash_message](/img/aws_flash_message.png)

1. Zilliz Cloudで**アカウントを設定**するには、プロンプトに従ってください。

    ![set-up-account](/img/set-up-account.png)

1. 新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでにZilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択し、手順に従ってください。URL内のすべてのクエリ文字列が保持されていることを確認し、AWSIDをZilliz Cloudアカウントにリンクしてください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>AWSMarketplaceは、URLのクエリ文字列を使用して、お客様のID情報をZilliz Cloudに渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloudは、AWS IDを当社に登録されたアカウントに関連付けることができない場合があります。この場合は、AWS Marketplaceに戻り、<b>アカウントの設定</b>を再度クリックしてください。</p>

        </Admonition>

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

    1. 完全な承認。

1. [**請求**]に移動して、AWSMarketplaceサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## 無料トライアルからサブスクリプションをアップグレードする{#upgrade-subscription-from-free-trial}

無料トライアルが終了したら、Zilliz Cloudを引き続き使用するためにサブスクリプションをアップグレードする必要があります。アップグレードするには、[サブスクリプションプロセス](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)をもう一度繰り返します。

1. AWS Marketplaceの[Zilliz Cloudページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa)に移動してください。

1. [**購入オプションを表示**]をクリックします。

1. ページを下にスクロールし、[**購読**]をクリックします。

1. プロンプトで[**アカウントを設定]を**クリックします。

1. Zilliz Cloudアカウントにログインし、AWS MarketplaceサブスクリプションをZilliz Cloud組織にリンクしてください。

アップグレードが成功したかどうかは、**支払い方法**カードの**請求概要**ページに移動して確認できます。AWS Marketplaceサブスクリプションの横にある`無料トライアル`タグが消えている場合、アップグレードは成功しました。

## アップデートAWSMarketplaceサブスクリプション{#update-aws-marketplace-subscription}

AWS Marketplaceから正常にサブスクライブした後は、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用されるAWS Marketplaceアカウントを別のアカウントに変更するか、AWSMarketplaceサブスクリプションからクレジットカードに払い戻し方法を切り替えることができます。

### AWS Marketplaceのサブスクリプションアカウントを変更する{#change-aws-marketplace-subscription-account}

1. サブスクリプションに使用した元のAWSアカウントでAWS Marketplaceにサインインします。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[製品サブスクリプションをキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)するを参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    キャンセルプロセスが完了するまで、AWSMarketplaceには数分かかります。

1. 元のAWSアカウントからサインアウトします。

1. サブスクリプションに使用する別のAWSアカウントでAWS Marketplaceにサインインします。

1. 新しいアカウントでZilliz Cloudのサブスクリプションを完了するには、[AWS Marketplaceで購読](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)するセクションの手順1から4に従ってください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>AWS Marketplaceのサブスクリプションを更新する場合は、[<strong>アカウントを設定</strong>]ボタンをクリックして、新しいサブスクリプションをZilliz Cloud組織にリンクする必要があります。</p>

    </Admonition>

1. [**支払方法**]セクションの[**請求概要**]ページで更新を確認します。[サブスクリプションID]をクリックし、サブスクリプション**アカウントID**が新しいMarketplaceアカウントに更新されたかどうかを確認します。

    ![view-aws-subscription-id](/img/view-aws-subscription-id.png)

<Admonition type="info" icon="📘" title="ノート">

<p>サービスの中断を避けるために、1時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード決済に切り替える{#switch-to-payment-credit-card}

1. サブスクリプションに使用した元のAWSアカウントでAWS Marketplaceにサインインします。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[製品サブスクリプションをキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)するを参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    AWS Marketplaceがキャンセル過程を完了するには数分かかります。

1. 「[支払い方法の](./subscribe-by-adding-credit-card)[追加](./subscribe-by-adding-credit-card)」の手順に従って、支払いクレジットカードを追加します。

1. [**支払方法**]セクションの[**請求概要**]ページで更新を確認します。

## AWS Marketplaceのサブスクリプションをキャンセルする{#cancel-aws-marketplace-subscription}

AWS Marketplaceのサブスクリプションをキャンセルするには、AWSMarketplaceコンソールを開き、[AWSガイドの](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html)指示に従ってください。

## AWSMarketplaceの価格条件{#aws-marketplace-pricing-terms}

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

- [Google Cloud Marketplaceに登録する](./subscribe-on-gcp-marketplace)

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- [インボイス](./view-invoice)

