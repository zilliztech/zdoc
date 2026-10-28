---
title: "AWS Marketplace で無料トライアルをサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace-free-trial
sidebar_label: "AWS Marketplace（無料トライアル）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプションの手順をステップごとに説明します。 | Cloud"
type: origin
token: X6nAwrgYAiJ3Lzku8mBczdbXnuo
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で無料トライアルをサブスクライブする

このガイドでは、サブスクリプションの手順をステップごとに説明します。

## 事前準備\{#before-you-start}

- トライアルではなくフルバージョンが必要な場合は、[パブリックオファー](./subscribe-on-aws-marketplace) または [プライベートオファー](./subscribe-on-aws-marketplace-private-offer) を通じて再度サブスクライブする必要があります。

- AWS Marketplace アカウントを持っていることを確認してください。

- AWS バイヤー ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法の変更方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html) を参照してください。

- AWS アカウントが組織の一部である場合は、購入を行うために `AWSMarketplaceManageSubscriptions` マネージドポリシーなどの権限が必要です。

## 無料トライアルをサブスクライブする\{#subscribe-to-a-free-trial}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、次の手順で Zilliz Cloud のサブスクリプションを開始します:

<Supademo id="cmpf98x1j009u0l0jk5t2s6j3" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus ベクトル データベース, Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、[このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) に直接アクセスすることもできます。

    ![CGffbQ9Jro826Rxupwvc42Vmn1c](https://zdoc-images.s3.us-west-2.amazonaws.com/cgffbq9jro826rxupwvc42vmn1c.png "CGffbQ9Jro826Rxupwvc42Vmn1c")

1. **Try for free** をクリックします。

    このオプションは、AWS が提供する 30 日間の無料トライアルです。無料トライアルが終了した後も Zilliz Cloud を利用し続けるには、[サブスクリプションをアップグレード](./subscribe-on-aws-marketplace)する必要があります。

    ![KCGqbey5monHEdxTouNcJkIVneg](https://zdoc-images.s3.us-west-2.amazonaws.com/kcgqbey5monhedxtouncjkivneg.png "KCGqbey5monHEdxTouNcJkIVneg")

1. ページを下にスクロールし、**Subscribe** をクリックします。

    ![PllVbyXrMo9ydWxOG2DcjHkZnGf](https://zdoc-images.s3.us-west-2.amazonaws.com/pllvbyxrmo9ydwxog2dcjhkzngf.png "PllVbyXrMo9ydWxOG2DcjHkZnGf")

1. プロンプトに従って、Zilliz Cloud で **Set up your account** をクリックします。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloud アカウントをすでにお持ちの場合は、ログインするだけで済みます。お持ちでない場合は、サインアップオプションを選択し、その手順に従います。AWS の ID を Zilliz Cloud アカウントにリンクするため、URL 内のすべてのクエリ文字列を保持してください。

        <Admonition type="info" title="Notes">

        AWS Marketplace は URL 内のクエリ文字列を使用して、ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われることがあります。その結果、Zilliz Cloud が AWS の ID を当社に登録されたアカウントに関連付けられない場合があります。この問題が発生した場合は、AWS Marketplace に戻り、<b>Set up your account</b> を再度クリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 承認を完了します。

1. **Billing** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 有料サブスクリプションにアップグレードする\{#upgrade-to-paid-subscription}

AWS Marketplace で Zilliz Cloud の無料トライアルを開始すると、通常の Zilliz Cloud 無料トライアルと同じ機能を利用できます。詳細については、[クレジット](./credits) を参照してください。

無料トライアル期間中は、**Billing Overview** ページの AWS Marketplace Subscription の横に `Free Trial` タグが表示されます。

さらに、上部のバナーでトライアルの詳細を確認することもできます。

![OJtZbGmhAoKOC7xlpQsceYtDn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/ojtzbgmhaokoc7xlpqsceytdn0c.png "OJtZbGmhAoKOC7xlpQsceYtDn0c")

より高度な機能を利用するには、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、[パブリックオファーをサブスクライブ](./subscribe-on-aws-marketplace)するだけです。新しいパブリックオファーのサブスクリプションは、以前の無料トライアルサブスクリプションを自動的に置き換えます。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動します。

1. **View purchase options** をクリックします。

1. ページを下にスクロールし、**Subscribe** をクリックします。

1. プロンプトで **Set up your account** をクリックします。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクします。

</Procedures>

詳細なステップバイステップガイドについては、[AWS Marketplace でパブリックオファーをサブスクライブ](./subscribe-on-aws-marketplace) を参照してください。

**Billing Overview** ページの **Payment Method** カードに移動すると、アップグレードが成功したかどうかを確認できます。AWS Marketplace Subscription の横にある `Free Trial` タグが消えていれば、アップグレードは成功しています。

## 無料トライアルのサブスクリプションをキャンセルする\{#cancel-free-trial-subscription}

<Admonition type="info" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残っているクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合、組織は直ちに凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけ、契約 ID をクリックします。

1. **Agreement** で、**Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## FAQ\{#faq}

**AWS Marketplace の無料トライアルは、期限が切れると自動的にアップグレードされますか？**

いいえ。AWS Marketplace の無料トライアルが終了した後も Zilliz Cloud を利用し続けるには、有料サブスクリプションに手動でアップグレードする必要があります。

**無料トライアルの期限が近づくと通知が届きますか？**

はい。AWS Marketplace は、無料トライアルの有効期限が切れる前にメール通知を送信します。通知は、トライアルを開始した AWS アカウントに関連付けられたメールアドレスに送信されます。

**マーケットプレイスのサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不足している**

    これは、十分な権限がない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織をマーケットプレイスのサブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member にすぎない場合は、必要な権限がありません。組織のオーナーに問い合わせて支援を受けてください。

- **すべての組織がすでにマーケットプレイスのサブスクリプションに正常にリンクされている**

    これは、すべての組織がすでにマーケットプレイスのサブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存のマーケットプレイスのサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なるマーケットプレイスのサブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合、またはすべての組織から退出した場合に発生します。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい組織を作成](./organization-settings#create-an-organization)します。

    - 他のユーザーに、[招待](./manage-platform-users#invite-organization-members) して組織に追加し、Organization Owner のロールを付与するよう依頼します。
