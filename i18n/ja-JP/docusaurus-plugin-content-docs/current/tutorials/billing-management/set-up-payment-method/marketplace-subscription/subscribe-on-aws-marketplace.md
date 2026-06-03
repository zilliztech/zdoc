---
title: "AWS Marketplace での購読 | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_key: subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
notebook: FALSE
description: "このガイドでは、AWS Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、料金体系についても解説します。"
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

# AWS Marketplace での購読

このガイドでは、AWS Marketplace での Zilliz Cloud の購読プロセスをステップバイステップで説明し、AWS Marketplace での Zilliz Cloud の価格条件を概説します。

<Admonition type="info" icon="📘" title="Note">

<p>購読後、AWS クラスターの使用料金を AWS Marketplace 経由で支払うことができます。他のクラウドプロバイダーにデプロイしたクラスターがある場合も、AWS Marketplace を使用して支払うことができます。</p>

</Admonition>

## 開始前の準備\{#before-you-start}

- AWS Marketplace アカウントを保有していることを確認してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法の変更方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html) を参照してください。

- 既存の Zilliz Cloud ユーザーの場合は、AWS Marketplace で購読する際に別のメールアドレスを使用してください。

- AWS アカウントが組織の一部である場合、請求管理者から購入の承認を受けている必要があります。

## AWS Marketplace での購読\{#subscribe-to-a-public-offer}

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title="Zilliz Cloud - AWS Marketplace Subscription Demo" />

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud の購読を開始してください：

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索するか、[AWS Marketplace にアクセス](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) して Zilliz Cloud のポータルページを表示してください。

    ![search_for_zilliz_on_aws](https://zdoc-images.s3.us-west-2.amazonaws.com/search_for_zilliz_on_aws.png "search_for_zilliz_on_aws")

1. **Zilliz Cloud** をクリックしてください。

    サービスと価格についてよくお読みください。

    すでに Zilliz Cloud を利用している場合は、**View purchase options** をクリックしてください。

    初めて Zilliz Cloud を利用する場合は、**無料で試す** をクリックできます。これは AWS が提供する 30 日間の無料トライアルです。無料トライアルが終了すると、[購読をアップグレード](./subscribe-on-aws-marketplace#upgrade-to-paid-subscription-from-free-trial) して Zilliz Cloud の利用を継続する必要があります。

    ![view_purchase_options](https://zdoc-images.s3.us-west-2.amazonaws.com/view_purchase_options.png "view_purchase_options")

1. ページを下にスクロールし、**購読** をクリックしてください。

    ![aws_flash_message](https://zdoc-images.s3.us-west-2.amazonaws.com/aws_flash_message.png "aws_flash_message")

1. プロンプトに従って、Zilliz Cloud で **アカウントの設定** を行ってください。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  新しいタブで、以下の手順に従って購読を完了してください。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。ない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択してプロセスに従ってください。AWS の ID を Zilliz Cloud アカウントにリンクするために、URL のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="Notes">

        <p>AWS Marketplace は、URL のクエリ文字列を使用してあなたの ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud はあなたの AWS ID を当社に登録されたアカウントと関連付けることができない場合があります。このような場合は、AWS Marketplace に戻り、<b>アカウントの設定</b> を再度クリックしてください。</p>

        </Admonition>

    1. 購読を既存の Zilliz Cloud 組織にリンクしてください。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認証を完了してください。

1. **請求** に移動し、AWS Marketplace の購読が支払い方法として設定されていることを確認してください。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 無料トライアルから有料購読へのアップグレード\{#upgrade-to-paid-subscription-from-free-trial}

AWS Marketplace で Zilliz Cloud の無料トライアルを開始すると、通常の Zilliz Cloud 無料トライアルと同じ機能が利用できます。詳細については、[Zilliz Cloud を無料で試す](./free-trials#free-trial) を参照してください。

無料トライアル期間中、**請求概要** ページの AWS Marketplace サブスクリプションの横に `Free Trial` タグが表示されます。

より高度な機能が必要な場合は、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、前のセクションで説明した通常の購読プロセスに従うだけです。[デモ](./subscribe-on-aws-marketplace#subscribe-to-a-public-offer) はこちらをクリックしてください。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動してください。

1. **View purchase options** をクリックしてください。

1. ページを下にスクロールし、**購読** をクリックしてください。

1. プロンプトで **アカウントの設定** をクリックしてください。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace の購読を Zilliz Cloud 組織にリンクしてください。

</Procedures>

アップグレードが成功したかどうかは、**請求概要** ページの **支払い方法** カードで確認できます。AWS Marketplace サブスクリプションの横の `Free Trial` タグが消えていれば、アップグレードは成功しています。

## AWS Marketplace 購読の更新\{#update-aws-marketplace-subscription}

AWS Marketplace からの購読が成功した後は、必要に応じていつでも購読を更新できます。具体的には、購読に使用する AWS Marketplace アカウントを別のアカウントに変更するか、支払い方法を AWS Marketplace 購読からクレジットカードに切り替えることができます。

### AWS Marketplace 購読アカウントの変更\{#change-aws-marketplace-subscription-account}

<Procedures>

1. 購読に使用した元の AWS アカウントで AWS Marketplace にサインインしてください。

1. Zilliz Cloud の購読をキャンセルしてください。詳細については、[製品購読のキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>購読をキャンセルしても、Zilliz Cloud のデータは削除されないのでご安心ください。</p>

    </Admonition>

    AWS Marketplace でキャンセル処理が完了するまでに数分かかります。

1. 元の AWS アカウントからサインアウトしてください。

1. 購読に使用したい別の AWS アカウントで AWS Marketplace にサインインしてください。

1. [AWS Marketplace での購読](./subscribe-on-aws-marketplace#subscribe-to-a-public-offer) セクションの手順 1 から 4 に従って、新しいアカウントで Zilliz Cloud の購読を完了してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>AWS Marketplace 購読を更新する際は、<strong>アカウントの設定</strong> ボタンをクリックして、新しい購読を Zilliz Cloud 組織とリンクする必要があります。</p>

    </Admonition>

1. **請求概要** ページの **支払い方法** セクションで更新を確認してください。サブスクリプション ID をクリックし、購読の **アカウントID** が新しい Marketplace アカウントに更新されているか確認してください。

    ![view-aws-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-aws-subscription-id.png "view-aws-subscription-id")

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<p>サービス中断を避けるため、1 時間以内に操作を完了することをお勧めします。</p>

</Admonition>

### クレジットカード支払いへの切り替え\{#switch-to-payment-credit-card}

<Supademo id="cm9i80zwc26e2ljv56y6iydeu" title="Zilliz Cloud - Change 支払い 方法 Demo" />

<Procedures>

1. 購読に使用した元の AWS アカウントで AWS Marketplace にサインインしてください。

1. Zilliz Cloud の購読をキャンセルしてください。詳細については、[製品購読のキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    <p>購読をキャンセルしても、Zilliz Cloud のデータは削除されないのでご安心ください。</p>

    </Admonition>

    AWS Marketplace でキャンセル処理が完了するまでに数分かかります。

1. [支払い方法の追加](./subscribe-by-adding-credit-card#add-a-credit-card) の手順に従って、クレジットカードを追加してください。

1. **請求概要** ページの **支払い方法** セクションで更新を確認してください。

</Procedures>

## AWS Marketplace 購読のキャンセル\{#cancel-public-offer-subscription}

AWS Marketplace の購読をキャンセルするには、AWS Marketplace コンソールを開き、[AWS ガイド](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) の手順に従ってください。

## AWS Marketplace の価格条件\{#aws-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms) を参照してください。

## トラブルシューティング\{#troubleshooting}

**マーケットプレイスの購読を Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です**

    - 十分な権限を持っていない場合に発生します。利用できない組織の横に **"権限が不十分です"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    - 組織をマーケットプレイスの購読にリンクするには、**組織オーナー** または **組織の請求管理者** である必要があります。ただし、**組織メンバー** のみである場合は、必要な権限がありません。組織オーナーに連絡して支援を依頼してください。

- **すべての組織がすでに Marketplace の購読に正常にリンクされている**

    - すべての組織がすでに Marketplace の購読にリンクされている場合に発生します。利用できない組織の横に **"マーケットプレイスにリンク済み"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存のマーケットプレイス購読を更新する必要がある場合は、まず組織の現在の購読を [解除](./subscribe-on-aws-marketplace#cancel-public-offer-subscription) してから、新しい購読を設定してください。

    - 異なる Marketplace 購読用に複数の組織が必要な場合は、以下の方法があります：

        - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して新しい組織を作成してください。次に、組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) してください。この組織オーナーは複数の組織に所属し、各組織に異なるマーケットプレイス購読を設定できます。

        - [サポートチケットを作成](http://support.zilliz.com) してください。当社が新しい組織を作成いたします。現在、Zilliz Cloud はユーザーによる手動での組織作成をサポートしていません。

- **リストに組織がない**

    - アカウントがクローズされた場合、またはすべての組織から脱退した場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下の方法があります：

    - 新しい組織を作成する。

    - 他のユーザーに [招待](./organization-users#invite-a-user-to-your-organization) を依頼し、組織オーナーのロールを付与してもらう。

    - [サポートチケットを送信](https://support.zilliz.com/hc/en-us) していただければ、当社が新しい組織を作成いたします。

## 関連トピック\{#related-topics}

- [クレジットカードの追加による購読](./subscribe-by-adding-credit-card)

- [Azure Marketplace での購読](./subscribe-on-azure-marketplace)

- [GCP Marketplace での購読](./subscribe-on-gcp-marketplace)

- [請求書の表示](./view-invoice) 
