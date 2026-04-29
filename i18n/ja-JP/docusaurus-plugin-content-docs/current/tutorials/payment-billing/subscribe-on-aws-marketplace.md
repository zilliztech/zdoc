---
title: "AWS Marketplace で購読 | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_key: subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションプロセスのステップバイステップの説明と、AWS Marketplace における Zilliz Cloud の料金条件について解説します。 | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - aws

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で購読する

このガイドでは、サブスクリプションプロセスのステップバイステップの説明と、AWS Marketplace における Zilliz Cloud の価格条件について説明します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、AWS クラスターの使用料を AWS Marketplace を介して支払うことができます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、AWS Marketplace を使用して支払いが可能です。</p>

</Admonition>

## 始める前に\{#before-you-start}

- AWS Marketplace アカウントを持っていることを確認してください。

- AWS Buyer ID のデフォルトの支払い方法を請求書プランに設定してください。[デフォルトの支払い方法を変更する方法はこちら](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- 既存の Zilliz Cloud ユーザーである場合は、AWS Marketplace で購読するために異なるメールアドレスを使用してください。

- AWS アカウントが組織の一部である場合、請求管理者による購入承認が必要です。

## AWS Marketplace で購読する\{#subscribe-on-aws-marketplace}

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title="Zilliz Cloud - AWS Marketplace Subscription Demo" />

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順に従って Zilliz Cloud の購読を開始してください。

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[AWS Marketplace に移動して](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) Zilliz Cloud のポータルページを表示してください。

    ![search_for_zilliz_on_aws](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_aws.png "search_for_zilliz_on_aws")

1. **Zilliz Cloud** をクリックしてください。

    サービスと価格についてご確認ください。

    すでに Zilliz Cloud を使用している場合は、**View purchase options** をクリックしてください。

    Zilliz Cloud を初めて使用する場合は、**無料で試す** をクリックできます。これは AWS が提供する 30 日間の無料トライアルです。無料トライアルが終了したら、Zilliz Cloud を引き続き使用するために[サブスクリプションをアップグレード](./subscribe-on-aws-marketplace#upgrade-to-paid-subscription-from-free-trial)する必要があります。

    ![view_purchase_options](https://zdoc-images.s3.us-west-2.amazonaws.com/view_purchase_options.png "view_purchase_options")

1. ページを下にスクロールし、**購読** をクリックしてください。

    ![aws_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/aws_flash_message.png "aws_flash_message")

1. プロンプトに従って、Zilliz Cloud で**アカウントを設定**してください。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1. 新しいタブで、以下の手順に従って購読を完了してください。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。お持ちでない場合は、[登録オプション](./register-with-zilliz-cloud) を選択して手続きを進めてください。AWS アイデンティティを Zilliz Cloud アカウントにリンクさせるために、URL 内のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="Notes">

        <p>AWS Marketplace は URL 内のクエリ文字列を使用して、アイデンティティ情報を Zilliz Cloud に渡します。登録に失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud はお客様の AWS アイデンティティを当社に登録されたアカウントと関連付けられない場合があります。その場合は、AWS Marketplace に戻り、<b>Set up your account</b> を再度クリックしてください。</p>

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクしてください。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認証を完了してください。

1. **請求** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認してください。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 無料トライアルから有料サブスクリプションへアップグレードする\{#upgrade-to-paid-subscription-from-free-trial}

AWS Marketplace で Zilliz Cloud の無料トライアルを開始すると、通常の Zilliz Cloud 無料トライアルと同じ機能が利用できます。詳細については、[Zilliz Cloud を無料で試す](./free-trials#free-trial) をご覧ください。

無料トライアル期間中、**請求概要** ページの AWS Marketplace Subscription の隣に `Free Trial` タグが表示されます。

より高度な機能を利用するには、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、前のセクションで説明した通常の購読プロセスに従ってください。[デモ](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace) はこちらをクリックしてください。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動してください。

1. **View purchase options** をクリックしてください。

1. ページを下にスクロールし、**購読** をクリックしてください。

1. プロンプトで **Set up your account** をクリックしてください。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクしてください。

</Procedures>

**請求概要** ページの **支払い 方法** カードに移動することで、アップグレードが成功したか確認できます。AWS Marketplace Subscription の隣の `Free Trial` タグが消えていれば、アップグレードは成功しています。

## AWS Marketplace サブスクリプションを更新する\{#update-aws-marketplace-subscription}

AWS Marketplace から正常に購読した後、必要に応じていつでもサブスクリプションを更新できます。具体的には、サブスクリプションに使用されている AWS Marketplace アカウントを別のものに変更したり、支払い方法を AWS Marketplace サブスクリプションからクレジットカードに切り替えたりできます。

### AWS Marketplace サブスクリプションアカウントを変更する\{#change-aws-marketplace-subscription-account}

<Procedures>

1. サブスクリプションに使用した元の AWS アカウントで AWS Marketplace にサインインしてください。

1. Zilliz Cloud のサブスクリプションをキャンセルしてください。詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されないため、ご安心ください。</p>

    </Admonition>

    AWS Marketplace によるキャンセル処理の完了には数分かかる場合があります。

1. 元の AWS アカウントからサインアウトしてください。

1. サブスクリプションに使用したい別の AWS アカウントで AWS Marketplace にサインインしてください。

1. [AWS Marketplace で購読する](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace) セクションの手順 1 から 4 に従って、新しいアカウントで Zilliz Cloud の購読を完了してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>AWS Marketplace のサブスクリプションを更新する際は、新しいサブスクリプションを Zilliz Cloud 組織にリンクさせるために、<strong>Set up your account</strong> ボタンをクリックする必要があります。</p>

    </Admonition>

1. **請求概要** ページの **支払い 方法** セクションで更新内容を確認してください。Subscription ID をクリックし、サブスクリプションの **アカウントID** が新しい Marketplace アカウントに更新されているか確認してください。

    ![view-aws-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-aws-subscription-id.png "view-aws-subscription-id")

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<p>サービス中断を避けるため、操作は 1 時間以内に完了することをお勧めします。</p>

</Admonition>

### 支払い用クレジットカードに切り替える\{#switch-to-payment-credit-card}

<Supademo id="cm9i80zwc26e2ljv56y6iydeu" title="Zilliz Cloud - Change 支払い 方法 Demo" />

<Procedures>

1. サブスクリプションに使用した元の AWS アカウントで AWS Marketplace にサインインしてください。

1. Zilliz Cloud のサブスクリプションをキャンセルしてください。詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されないため、ご安心ください。</p>

    </Admonition>

    AWS Marketplace によるキャンセル処理の完了には数分かかる場合があります。

1. [支払い方法の追加](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、支払い用クレジットカードを追加してください。

1. **請求概要** ページの **支払い 方法** セクションで更新内容を確認してください。

</Procedures>

## AWS Marketplace サブスクリプションをキャンセルする\{#cancel-aws-marketplace-subscription}

AWS Marketplace のサブスクリプションをキャンセルするには、AWS Marketplace コンソールを開き、[AWS ガイド](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) の指示に従ってください。

## AWS Marketplace の価格条件\{#aws-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms) を参照してください。

## トラブルシューティング\{#troubleshooting}

**マーケットプレイスサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です** 

    - これは権限が不十分な場合に発生することがあります。利用できない組織の隣に **"権限が不十分です"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    - マーケットプレイスサブスクリプションに組織をリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、組織メンバー のみの場合は、必要な権限がありません。組織オーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションにリンク済みである**

    - これは、すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の隣に **"マーケットプレイスにリンク済み"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションを[リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) し、その後新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプションのために複数の組織が必要な場合は、以下を行えます。

        - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して、新しい組織を作成してください。その後、組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) してください。この組織オーナーは複数の組織に所属し、各組織ごとに異なる Marketplace サブスクリプションを設定できます。

        - [サポートチケットを作成](http://support.zilliz.com) して、当社で新しい組織を作成できるようにしてください。現在、Zilliz Cloud ではユーザーが手動で組織を作成することはできません。

- **リストに組織がない**

    - これは、アカウントが閉鎖された場合、またはすべての組織から脱退した場合に発生することがあります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下を行えます。

    - 新しい組織を作成してください。

    - 他のユーザーに、組織に [招待](./organization-users#invite-a-user-to-your-organization) され、組織オーナー の役割を付与されるよう依頼してください。

    - [サポートチケットを送信](https://support.zilliz.com/hc/en-us) して、当社で新しい組織を作成してもらってください。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して購読する](./subscribe-by-adding-credit-card)

- [Azure Marketplace で購読する](./subscribe-on-azure-marketplace)

- [GCP Marketplace で購読する](./subscribe-on-gcp-marketplace)

- [請求書を表示する](./view-invoice) 

