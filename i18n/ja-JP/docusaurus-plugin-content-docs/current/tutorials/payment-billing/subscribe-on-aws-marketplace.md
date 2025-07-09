---
title: "AWS Marketplaceで購読する | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの過程をステップバイステップで説明し、AWS Marketplace上のZilliz Cloudの価格条件を概説します。 | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - aws
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base

---

import Admonition from '@theme/Admonition';


# AWS Marketplaceで購読する

このガイドでは、サブスクリプションの過程をステップバイステップで説明し、AWS Marketplace上のZilliz Cloudの価格条件を概説します。 

<Admonition type="caution" icon="🚧" title="undefined">

<p>一度購読すると、AWS Marketplaceを介してAWSクラスターの使用料を支払うことができます。他のクラウドプロバイダーにクラスターをデプロイしている場合は、AWS Marketplaceを使用して支払うこともできます。</p>

</Admonition>

## 始める前に{#before-you-start}

- AWS Marketplaceアカウントを持っていることを確認してください。

- AWSバイヤーIDのデフォルトの支払い方法を請求プランに設定します。[デフォルトの支払い方法を変更する方法を学ぶ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html).

- 既存のZilliz Cloudユーザーの場合は、別のメールアドレスを使用してAWS Marketplaceに登録してください。

- AWSアカウントが組織の一部である場合は、請求管理者によって購入を行う権限が必要です。

## AWS Marketplaceで購読する{#subscribe-on-aws-marketplace}

<supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title="Zilliz Cloud - AWS Marketplace Subscription Demo"></supademo>

[AWSマーケットプレイス](https://aws.amazon.com/marketplace)にアクセスし、以下の手順でZilliz Cloudの購読を開始してください。

1. 検索ボックスで**Zilliz Cloud**を検索するか、[AWS Marketplaceにアクセスしてください。](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz)をクリックしてZilliz Cloudポータルページを表示してください。

    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. 「Zilliz Cloud」をクリックしてください。

    サービスと価格について理解してください。 

    すでにZilliz Cloudを使用している場合は、**購入オプションを表示**をクリックしてください。

    Zilliz Cloudを使用したことがない場合は、AWSが提供する30日間の無料トライアルである「無料で試す」をクリックできます。無料トライアルが終了したら、Zilliz Cloudを引き続き使用するには、[サブスクリプションをアップグレードする](./subscribe-on-aws-marketplace#upgrade-subscription-from-free-trial)をクリックする必要があります。

    ![view_purchase_options](/img/view_purchase_options.png)

1. ページをスクロールして、**購読**をクリックしてください。 

    ![aws_flash_message](/img/aws_flash_message.png)

1. Zilliz Cloudでアカウントを設定するには、プロンプトに従ってください。

    ![set-up-account](/img/set-up-account.png)

1.  新しいしいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloudアカウントをお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud)を選択して、手順に従ってください。AWS IDをZilliz Cloudアカウントにリンクするために、URL内のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>AWS Marketplaceは、URL内のクエリ文字列を使用して、お客様のID情報をZilliz Cloudに渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloudは、お客様のAWS IDを当社に登録されたアカウントに関連付けることができない場合があります。この場合は、AWS Marketplaceに戻り、をクリックしてください。<b>アカウントを設定してください</b>またか</p>

        </Admonition>

    1. 既存のZilliz Cloud組織にサブスクリプションをリンクしてください。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

    1. 完全な承認。

1. **請求**に移動して、AWS Marketplaceサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## 無料トライアルからサブスクリプションをアップグレードする{#upgrade-subscription-from-free-trial}

無料トライアルが終了したら、Zilliz Cloudを引き続き使用するためにサブスクリプションをアップグレードする必要があります。アップグレードするには、[サブスクリプション過程](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)をもう一度繰り返してください。

1. AWS Marketplaceの[Zilliz Cloudのページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa)に移動してください。

1. 「購入オプションを表示」をクリックしてください。

1. ページをスクロールして、**購読**をクリックしてください。

1. プロンプトで**アカウントを設定**をクリックしてください。

1. Zilliz Cloudアカウントにログインし、AWS MarketplaceサブスクリプションをZilliz Cloud組織にリンクしてください。

アップグレードが成功したかどうかは、「請求概要」ページの「支払い方法」カードに移動して確認できます。AWS Marketplaceサブスクリプションの横にある`Free Trial`タグが消えている場合、アップグレードは成功しています。 

## AWS Marketplaceのサブスクリプションを更新する{#update-aws-marketplace-subscription}

AWS Marketplaceから正常にサブスクライブした後は、必要に応じていつでもサブスクリプションを更新できます。より具体的には、サブスクリプションに使用されるAWS Marketplaceアカウントを別のアカウントに変更するか、AWS Marketplaceサブスクリプションからクレジットカードに支払い方法を切り替えることができます。

### AWS Marketplaceのサブスクリプションアカウントを変更する{#change-aws-marketplace-subscription-account}

1. サブスクリプションに使用した元のAWSアカウントでAWS Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[製品のサブスクリプションをキャンセルする](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)を参照してください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    AWS Marketplaceがキャンセル過程を完了するには数分かかります。

1. 元のAWSアカウントからサインアウトします。

1. サブスクリプションに使用する別のAWSアカウントでAWS Marketplaceにサインインしてください。

1. 新しいアカウントでZilliz Cloudのサブスクリプションを完了するには、[AWS Marketplaceで購読する](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)セクションの手順1から4に従ってください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>AWS Marketplaceのサブスクリプションを更新する場合、新しいサブスクリプションをZilliz Cloud組織にリンクするには、<strong>アカウントの設定</strong>ボタンをクリックする必要があります。</p>

    </Admonition>

1. 「請求概要」ページの「支払い方法」セクションで更新を確認してください。「サブスクリプションID」をクリックし、「アカウントID」が新しいマーケットプレイスアカウントに更新されたかどうかを確認してください。

    ![view-aws-subscription-id](/img/view-aws-subscription-id.png)

<Admonition type="caution" icon="🚧" title="undefined">

<p>サービスの中断を避けるために、1時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード決済に切り替える{#switch-to-payment-credit-card}

<supademo id="cm9i80zwc26e2ljv56y6iydeu" title="Zilliz Cloud - Change Payment Method Demo"></supademo>

1. サブスクリプションに使用した元のAWSアカウントでAWS Marketplaceにサインインしてください。

1. Zilliz Cloudのサブスクリプションをキャンセルしてください。詳細については、[製品のサブスクリプションをキャンセルする](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)を参照してください。

    <Admonition type="caution" icon="🚧" title="undefined">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloudのデータは削除されませんのでご安心ください。</p>

    </Admonition>

    AWS Marketplaceがキャンセル過程を完了するには数分かかります。

1. [支払い方法を追加する](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払いクレジットカードを追加してください。

1. 「請求概要」ページの「支払い方法」セクションで更新を確認してください。

## AWS Marketplaceのサブスクリプションをキャンセルする{#cancel-aws-marketplace-subscription}

AWS Marketplaceのサブスクリプションをキャンセルするには、AWS Marketplaceコンソールを開き、[AWSガイドで](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html)の指示に従う必要があります。

## AWS Marketplaceの価格条件{#aws-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング{#troubleshooting}

**Zilliz Cloudにマーケットプレイスのサブスクリプションをリンクする場合、利用可能な組織がない場合はどうすればよいですか?**

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

    - [サポートチケットを送信する](https://support.zilliz.com/hc/en-us)をクリックすると、新しい組織が作成されます。

## 関連するトピック{#related-topics}

- リンク_PLACEHOLDER_0

- [Azure Marketplaceで購読する](./subscribe-on-azure-marketplace)

- リンク_PLACEHOLDER_0

- リンク_PLACEHOLDER_0 

