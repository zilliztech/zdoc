---
title: "AWS Marketplace で Free Trial にサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace-free-trial
sidebar_key: subscribe-on-aws-marketplace-free-trial
sidebar_label: "AWS Marketplace (Free Trial)"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップバイステップで説明します。 | Cloud"
type: origin
token: X6nAwrgYAiJ3Lzku8mBczdbXnuo
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - aws
  - free trial

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で Free Trial にサブスクライブする

このガイドでは、サブスクリプション手順をステップバイステップで説明します。

## 開始前の準備\{#before-you-start}

- トライアルではなくフルバージョンが必要な場合は、[Public Offer](./subscribe-on-aws-marketplace) または [Private Offer](./subscribe-on-aws-marketplace-private-offer) を通じて再度サブスクライブする必要があります。

- AWS Marketplace アカウントを保有していることを確認してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html) を参照してください。

- AWS アカウントが組織に属している場合、購入を行うには `AWSMarketplaceManageSubscriptions` マネージドポリシーなどの権限が必要です。

## Free Trial にサブスクライブする\{#subscribe-to-a-free-trial}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクライブを開始してください。

<Supademo id="cmpf98x1j009u0l0jk5t2s6j3" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、[このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) に直接アクセスできます。

    ![CGffbQ9Jro826Rxupwvc42Vmn1c](https://zdoc-images.s3.us-west-2.amazonaws.com/cgffbq9jro826rxupwvc42vmn1c.png "CGffbQ9Jro826Rxupwvc42Vmn1c")

1. **Try for free** をクリックします。

    このオプションは AWS が提供する 30 日間の Free Trial です。Free Trial が終了した後も Zilliz Cloud を継続して使用するには、[サブスクリプションをアップグレード](./subscribe-on-aws-marketplace) する必要があります。

    ![KCGqbey5monHEdxTouNcJkIVneg](https://zdoc-images.s3.us-west-2.amazonaws.com/kcgqbey5monhedxtouncjkivneg.png "KCGqbey5monHEdxTouNcJkIVneg")

1. ページを下にスクロールし、**Subscribe** をクリックします。

    ![PllVbyXrMo9ydWxOG2DcjHkZnGf](https://zdoc-images.s3.us-west-2.amazonaws.com/pllvbyxrmo9ydwxog2dcjhkzngf.png "PllVbyXrMo9ydWxOG2DcjHkZnGf")

1. プロンプトに従って、Zilliz Cloud で **Set up your account** を行います。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、ログインするだけです。まだお持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択し、手順に従ってください。AWS の ID を Zilliz Cloud アカウントにリンクするため、URL 内のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace は、URL 内のクエリ文字列を使用して ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる場合があります。その結果、Zilliz Cloud が AWS の ID を当社に登録されたアカウントに関連付けられない可能性があります。この場合は、AWS Marketplace に戻り、<b>Set up your account</b> をもう一度クリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認証を完了します。

1. **Billing** に移動し、AWS Marketplace サブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 有料サブスクリプションにアップグレードする\{#upgrade-to-paid-subscription}

AWS Marketplace で Zilliz Cloud の Free Trial を開始すると、通常の Zilliz Cloud Free Trial と同じ機能を利用できます。詳細については、[Zilliz Cloud を無料で試す](./free-trials#free-trial) を参照してください。

Free Trial の期間中、**Billing Overview** ページの AWS Marketplace Subscription の横に `Free Trial` タグが表示されます。

また、上部のバナーでもトライアルの詳細を確認できます。

![OJtZbGmhAoKOC7xlpQsceYtDn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/ojtzbgmhaokoc7xlpqsceytdn0c.png "OJtZbGmhAoKOC7xlpQsceYtDn0c")

より高度な機能が必要な場合は、いつでも有料の AWS サブスクリプションにアップグレードできます。アップグレードするには、[Public Offer にサブスクライブ](./subscribe-on-aws-marketplace) してください。新しい Public Offer サブスクリプションは、以前の Free Trial サブスクリプションを自動的に置き換えます。

<Procedures>

1. AWS Marketplace の [Zilliz Cloud ページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) に移動します。

1. **View purchase options** をクリックします。

1. ページを下にスクロールし、**Subscribe** をクリックします。

1. プロンプトで **Set up your account** をクリックします。

1. Zilliz Cloud アカウントにログインし、AWS Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

</Procedures>

詳細なステップバイステップガイドについては、[AWS Marketplace で Public Offer にサブスクライブする](./subscribe-on-aws-marketplace) を参照してください。

アップグレードが成功したかどうかは、**Billing Overview** ページの **Payment Method** カードに移動して確認できます。AWS Marketplace Subscription の横にある `Free Trial` タグが消えていれば、アップグレードは成功しています。

## Free Trial サブスクリプションをキャンセルする\{#cancel-free-trial-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットが期限切れになっている場合、組織は直ちに凍結されます。

</Admonition>

<Procedures>

1. Private Offer を承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud サブスクリプションを見つけ、agreement ID をクリックします。

1. **Agreement** で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## FAQ\{#faq}

**AWS Marketplace Free Trial は期限切れになると自動的にアップグレードされますか？**

いいえ。AWS Marketplace Free Trial が終了した後も Zilliz Cloud を継続して使用するには、有料サブスクリプションへ手動でアップグレードする必要があります。

**AWS Marketplace Free Trial の期限が近づくと通知を受け取れますか？**

はい。AWS Marketplace は Free Trial の有効期限が切れる前にメール通知を送信します。通知は、トライアルを開始した AWS アカウントに関連付けられたメールアドレスに送信されます。

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です**

    これは、十分な権限がない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみである場合、必要な権限がありません。支援が必要な場合は、組織オーナーに連絡してください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    これは、すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、次のように対応できます。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションを [リンク解除](./subscribe-on-aws-marketplace#cancel-public-offer-subscription) してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、次のいずれかを行えます。

        - 新しい Zilliz Cloud アカウントを [登録](./register-with-zilliz-cloud) して新しい組織を作成します。次に、その組織オーナーを新しい組織に [招待](./organization-users#invite-a-user-to-your-organization) します。この組織オーナーは複数の組織に所属することになり、各組織に異なる Marketplace サブスクリプションを設定できます。

        - [サポートチケットを作成](http://support.zilliz.com) してください。当社が新しい組織を作成します。現在、Zilliz Cloud はユーザーによる組織の手動作成をサポートしていません。

- **リストに組織がない**

    - これは、アカウントがクローズされている場合、またはすべての組織から脱退している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のように対応できます。

    - 新しい組織を作成します。

    - 他のユーザーに、その組織へあなたを [招待](./organization-users#invite-a-user-to-your-organization) し、Organization Owner のロールを付与するよう依頼します。

    - [サポートチケットを作成](https://support.zilliz.com/hc/en-us) してください。当社が新しい組織を作成します。
