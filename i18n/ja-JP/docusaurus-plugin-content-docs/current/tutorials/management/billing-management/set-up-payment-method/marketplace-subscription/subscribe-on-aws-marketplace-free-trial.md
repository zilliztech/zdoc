---
title: "AWS Marketplace で無料トライアルに登録する | Cloud"
slug: /subscribe-on-aws-marketplace-free-trial
sidebar_label: "AWS Marketplace（無料トライアル）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、登録プロセスをステップごとに説明します。 | Cloud"
type: origin
token: X6nAwrgYAiJ3Lzku8mBczdbXnuo
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で無料トライアルに登録する

このガイドでは、登録プロセスをステップごとに説明します。 

## 始める前に\{#before-you-start}

- トライアルではなくフルバージョンが必要な場合は、[public offer](./subscribe-on-aws-marketplace) または [private offer](./subscribe-on-aws-marketplace-private-offer) から再度登録する必要があります。

- AWS Marketplace アカウントを持っていることを確認してください。

- AWS Buyer ID のデフォルト支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法はこちら](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- AWS アカウントが organization の一部である場合、購入を行うには `AWSMarketplaceManageSubscriptions` managed policy などの権限が必要です。

## 無料トライアルに登録する\{#subscribe-to-a-free-trial}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud の登録を開始します。

<Supademo id="cmpf98x1j009u0l0jk5t2s6j3" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、直接 [このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) にアクセスすることもできます。 

    ![CGffbQ9Jro826Rxupwvc42Vmn1c](https://zdoc-images.s3.us-west-2.amazonaws.com/cgffbq9jro826rxupwvc42vmn1c.png "CGffbQ9Jro826Rxupwvc42Vmn1c")

1. **Try for free** をクリックします。 

    このオプションは AWS が提供する 30 日間の無料トライアルです。無料トライアルが終了したら、Zilliz Cloud を継続して利用するには [サブスクリプションをアップグレード](./subscribe-on-aws-marketplace) する必要があります。

    ![KCGqbey5monHEdxTouNcJkIVneg](https://zdoc-images.s3.us-west-2.amazonaws.com/kcgqbey5monhedxtouncjkivneg.png "KCGqbey5monHEdxTouNcJkIVneg")

1. ページを下にスクロールし、**Subscribe** をクリックします。 

    ![PllVbyXrMo9ydWxOG2DcjHkZnGf](https://zdoc-images.s3.us-west-2.amazonaws.com/pllvbyxrmo9ydwxog2dcjhkzngf.png "PllVbyXrMo9ydWxOG2DcjHkZnGf")

1. 画面の指示に従って、Zilliz Cloud で **Set up your account** を行います。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1. 新しいタブで、以下の手順に従って登録を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud) を選択して手順に従ってください。AWS の ID を Zilliz Cloud アカウントに関連付けるため、URL 内のすべての query string が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace は URL 内の query string を使用して、ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらの query string が失われる可能性があります。その結果、Zilliz Cloud が AWS の ID を当社に登録されたアカウントに関連付けできない場合があります。このような場合は、AWS Marketplace に戻り、再度 <b>Set up your account</b> をクリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud organization にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認可を完了します。

1. **Billing** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 有料サブスクリプションにアップグレードする\{#upgrade-to-paid-subscription}

AWS Marketplace で Zilliz Cloud の無料トライアルを開始すると、通常の Zilliz Cloud 無料トライアルと同じ機能を利用できます。詳細については、[Try Zilliz Cloud For Free](./free-trials#free-trial) を参照してください。 

無料トライアル期間中は、**Billing Overview** ページの AWS Marketplace Subscription の横に `Free Trial` タグが表示されます。

さらに、上部バナーでもトライアルの詳細を確認できます。

![OJtZbGmhAoKOC7xlpQsceYtDn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/ojtzbgmhaokoc7xlpqsceytdn0c.png "OJtZbGmhAoKOC7xlpQsceYtDn0c")

より高度な機能が必要な場合は、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、[public offer に登録](./subscribe-on-aws-marketplace) するだけです。新しい public offer のサブスクリプションは、以前の無料トライアルのサブスクリプションを自動的に置き換えます。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動します。

1. **View purchase options** をクリックします。

1. ページを下にスクロールし、**Subscribe** をクリックします。

1. 表示される画面で **Set up your account** をクリックします。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace のサブスクリプションを Zilliz Cloud organization にリンクします。

</Procedures>

詳細なステップバイステップのガイドについては、[AWS Marketplace で Public Offer に登録する](./subscribe-on-aws-marketplace) を参照してください。

アップグレードが成功したかどうかは、**Billing Overview** ページの **Payment Method** カードで確認できます。AWS Marketplace Subscription の横にある `Free Trial` タグが消えていれば、アップグレードは成功です。 

## 無料トライアルのサブスクリプションをキャンセルする\{#cancel-free-trial-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、organization は高度な Zilliz Cloud 機能へのアクセスを失います。organization に残っているクレジットがない場合、またはすべてのクレジットが期限切れの場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. private offer を承認した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけて、agreement ID をクリックします。

1. **Agreement** の下で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling product subscriptions](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## FAQ\{#faq}

**AWS Marketplace の無料トライアルは、期限切れになると自動的にアップグレードされますか？**

いいえ。AWS Marketplace の無料トライアルが終了したら、Zilliz Cloud を継続して利用するには、手動で有料サブスクリプションにアップグレードする必要があります。

**AWS Marketplace の無料トライアルの期限が近づいたときに通知を受け取れますか？**

はい。AWS Marketplace は無料トライアルの期限切れ前にメール通知を送信します。通知は、トライアルを開始した AWS アカウントに関連付けられたメールアドレス宛に送られます。

**Marketplace サブスクリプションを Zilliz Cloud にリンクするとき、利用可能な organization が表示されない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない organization の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    marketplace サブスクリプションに organization をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。しかし、Organization Member のみである場合、必要な権限はありません。organization owner に連絡してサポートを受けてください。

- **すべての organization がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての organization がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない organization の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、以下のいずれかを行ってください。

    - 既存の marketplace サブスクリプションを更新する必要がある場合は、まず organization の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の organization が必要な場合は、[organization を作成](./organization-settings#create-an-organization) できます。

- **リストに organization がない**

    - これは、アカウントが閉鎖されている場合や、すべての organization から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下を実行できます。

    - [新しい organization を作成](./organization-settings#create-an-organization)。

    - 他のユーザーに、そのユーザーの organization にあなたを[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらってください。

