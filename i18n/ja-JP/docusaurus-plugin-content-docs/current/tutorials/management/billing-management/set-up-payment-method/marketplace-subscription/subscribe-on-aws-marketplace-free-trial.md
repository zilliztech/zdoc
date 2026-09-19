---
title: "AWS Marketplace で無料トライアルに登録する | Cloud"
slug: /subscribe-on-aws-marketplace-free-trial
sidebar_label: "AWS Marketplace（無料トライアル）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、登録手順をステップバイステップで説明します。 | Cloud"
type: origin
token: X6nAwrgYAiJ3Lzku8mBczdbXnuo
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で無料トライアルに登録する

このガイドでは、登録手順をステップバイステップで説明します。

## 事前準備\{#before-you-start}

- トライアルではなく正式版が必要な場合は、[パブリックオファー](./subscribe-on-aws-marketplace)または[プライベートオファー](./subscribe-on-aws-marketplace-private-offer)から再度サブスクリプション登録を行う必要があること。

- AWS Marketplace アカウントを保有していること。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定しておくこと。詳細については、[デフォルトの支払い方法の変更方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html) を参照してください。

- AWS アカウントが組織に属している場合は、購入を行うために `AWSMarketplaceManageSubscriptions` 管理ポリシーなどの権限を保有していること。

## 無料トライアルに登録する\{#subscribe-to-a-free-trial}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクリプション登録を開始します。

<Supademo id="cmpf98x1j009u0l0jk5t2s6j3" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus ベクトルデータベース、Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、[このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) から直接アクセスすることもできます。

    ![CGffbQ9Jro826Rxupwvc42Vmn1c](https://zdoc-images.s3.us-west-2.amazonaws.com/cgffbq9jro826rxupwvc42vmn1c.png "CGffbQ9Jro826Rxupwvc42Vmn1c")

1. **Try for free** をクリックします。

    これは AWS が提供する 30 日間の無料トライアルです。期間終了後も Zilliz Cloud を引き続きご利用いただくには、[サブスクリプションをアップグレード](./subscribe-on-aws-marketplace)する必要があります。

    ![KCGqbey5monHEdxTouNcJkIVneg](https://zdoc-images.s3.us-west-2.amazonaws.com/kcgqbey5monhedxtouncjkivneg.png "KCGqbey5monHEdxTouNcJkIVneg")

1. ページを下までスクロールし、**Subscribe** をクリックします。

    ![PllVbyXrMo9ydWxOG2DcjHkZnGf](https://zdoc-images.s3.us-west-2.amazonaws.com/pllvbyxrmo9ydwxog2dcjhkzngf.png "PllVbyXrMo9ydWxOG2DcjHkZnGf")

1. 画面の指示に従って、Zilliz Cloud で **Set up your account** を実行します。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  新しく開いたタブで、以下の手順に従ってサブスクリプション登録を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合はログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択して手続きを進めます。AWS の ID 情報を Zilliz Cloud アカウントに紐付けるため、URL に含まれるすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" title="Notes">

        AWS Marketplace は、URL のクエリ文字列を使用して ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud が AWS の ID 情報を当社に登録されているアカウントに関連付けられない場合があります。その場合は、AWS Marketplace に戻り、<b>Set up your account</b> を再度クリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 承認を完了します。

1. **Billing** に移動し、AWS Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 有料サブスクリプションへのアップグレード\{#upgrade-to-paid-subscription}

AWS Marketplace で Zilliz Cloud の無料トライアルを開始すると、通常の Zilliz Cloud 無料トライアルと同じ機能を利用できます。詳細については、[Zilliz Cloud を無料で試す](./free-trials#free-trial) を参照してください。

無料トライアル期間中は、**Billing Overview** ページの AWS Marketplace Subscription の横に `Free Trial` タグが表示されます。

また、画面上部のバナーからもトライアルの詳細を確認できます。

![OJtZbGmhAoKOC7xlpQsceYtDn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/ojtzbgmhaokoc7xlpqsceytdn0c.png "OJtZbGmhAoKOC7xlpQsceYtDn0c")

より高度な機能が必要な場合は、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、[パブリックオファーに登録](./subscribe-on-aws-marketplace)するだけです。新しいパブリックオファーのサブスクリプションは、以前の無料トライアルのサブスクリプションを自動的に置き換えます。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動します。

1. **View purchase options** をクリックします。

1. ページを下までスクロールし、**Subscribe** をクリックします。

1. 表示されるプロンプトで **Set up your account** をクリックします。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

</Procedures>

詳細な手順については、[AWS Marketplace でパブリックオファーにサブスクリプションする](./subscribe-on-aws-marketplace) を参照してください。

アップグレードの成否は、**Billing Overview** ページの **Payment Method** カードで確認できます。AWS Marketplace Subscription の横にある `Free Trial` タグが消えていれば、アップグレードは成功です。

## 無料トライアルサブスクリプションのキャンセル\{#cancel-free-trial-subscription}

<Admonition type="info" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。残りのクレジットがない場合や、すべてのクレジットの有効期限が切れている場合は、組織が即座に凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを探し、契約 ID をクリックします。

1. **Agreement** セクションで **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスに **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## FAQ\{#faq}

**AWS Marketplace の無料トライアルは、有効期限が切れると自動的にアップグレードされますか？**

いいえ。AWS Marketplace の無料トライアルが終了した後も Zilliz Cloud を引き続き利用するには、手動で有料サブスクリプションにアップグレードする必要があります。

**AWS Marketplace の無料トライアルの有効期限が近づくと、通知は届きますか？**

はい。AWS Marketplace は、無料トライアルの有効期限が切れる前にメール通知を送信します。通知は、トライアルを開始した AWS アカウントに関連付けられているメールアドレスに送信されます。

**マーケットプレイスサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの原因が考えられます。

- **権限不足**

    十分な権限がない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織をマーケットプレイスサブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は必要な権限がないため、組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションにリンク済みである**

    所有するすべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応が可能です。

    - 既存のマーケットプレイスサブスクリプションを更新したい場合は、まず該当組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - アカウントが閉鎖されている場合や、すべての組織から脱退している場合などに発生します。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のいずれかを実行します。

    - [新しい組織を作成](./organization-settings#create-an-organization)します。

    - 他のユーザーに依頼して、そのユーザーの組織に[招待](./manage-platform-users#invite-organization-members)してもらい、Organization Owner ロールを付与してもらいます。

