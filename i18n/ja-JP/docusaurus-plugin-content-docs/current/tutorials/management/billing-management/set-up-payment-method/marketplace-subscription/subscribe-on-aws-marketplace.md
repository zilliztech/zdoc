---
title: "AWS Marketplace でパブリックオファーにサブスクリプションする | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace（パブリックオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本ガイドでは、AWS Marketplace における Zilliz Cloud のサブスクリプション手順と料金条件について順を追って説明します。| Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace でパブリックオファーにサブスクリプションする

本ガイドでは、AWS Marketplace における Zilliz Cloud のサブスクリプション手順と料金条件について順を追って説明します。

<Admonition type="info" icon="📘" title="📘 Note">

サブスクリプション後、AWS クラスターの利用料金を AWS Marketplace 経由で支払うことができます。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、AWS Marketplace を使って支払いが可能です。

</Admonition>

## 始める前に\{#before-you-start}

- AWS Marketplace のアカウントを用意してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)をご確認ください。

- AWS アカウントが組織に属している場合は、請求管理者から購入の権限を付与されている必要があります。

## パブリックオファーにサブスクリプションする\{#subscribe-to-a-public-offer}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクリプションを開始します。

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title=""  />

<Procedures>

1. Search for **Zilliz Cloud** in the search box, then click **Milvus ベクトル データベース、Zilliz Cloud (Pay-as-you-go)**.

    または、[このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) に直接アクセスすることもできます。

    ![UNGcb105Oo319KxghYwciqeCntf](https://zdoc-images.s3.us-west-2.amazonaws.com/ungcb105oo319kxghywciqecntf.png "UNGcb105Oo319KxghYwciqeCntf")

1. **View purchase options** をクリックします。

    ![UQ0Bbe7huojVMUxpjWccXT6enkb](https://zdoc-images.s3.us-west-2.amazonaws.com/uq0bbe7huojvmuxpjwccxt6enkb.png "UQ0Bbe7huojVMUxpjWccXT6enkb")

1. ページを下へスクロールし、**Subscribe** をクリックします。

    ![XAn8bszmeoIRJbxUml1cmXJQned](https://zdoc-images.s3.us-west-2.amazonaws.com/xan8bszmeoirjbxuml1cmxjqned.png "XAn8bszmeoIRJbxUml1cmXJQned")

1. 画面の指示に従って、Zilliz Cloud で **Set up your account** を行います。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. Zilliz Cloud のアカウントを既にお持ちの場合は、ログインしてください。お持ちでない場合は、[サインアップオプション](./register-with-zilliz-cloud) を選択して手続きを進めます。AWS の ID を Zilliz Cloud アカウントにリンクさせるため、URL 内のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace は URL のクエリ文字列を使用して、あなたの ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud が AWS の ID と登録済みアカウントを関連付けられない場合があります。このような場合は、AWS Marketplace に戻り、再度 <b>Set up your account</b> をクリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 承認を完了します。

1. **Billing** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法の更新\{#update-subscription-or-payment-method}

Marketplace からのサブスクリプション完了後、必要に応じていつでもサブスクリプションを更新できます。

具体的には、以下の操作が可能です。

- サブスクリプションに使用する Marketplace アカウントを別のアカウントに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法の更新](./update-payment-method) を参照してください。

## プライベートオファーへの切り替え\{#switch-to-a-private-offer}

詳細については、[AWS Marketplace でプライベートオファーにサブスクリプションする](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer) を参照してください。

## パブリックオファーのサブスクリプション解除\{#cancel-public-offer-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションを解除すると、組織は Zilliz Cloud の高度な機能へのアクセスを失います。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを受け入れた AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけ、契約 ID をクリックします。

1. **Agreement** セクションで **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスに **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace のサブスクリプションを Zilliz Cloud にリンクする際に、利用可能な組織が表示されない場合はどうすればよいですか？**

これにはいくつかの原因が考えられます。

- **権限不足**

    これは十分な権限を持っていない場合に発生する可能性があります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。組織のオーナーにお問い合わせください。

- **すべての組織が既に Marketplace サブスクリプションにリンクされている**

    これは、所有するすべての組織が既に Marketplace サブスクリプションにリンクされている場合に発生する可能性があります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応を行ってください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織が表示されない**

    - これは、アカウントが閉鎖されたか、すべての組織から脱退した場合に発生する可能性があります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下の操作が可能です。

    - [新しい組織を作成](./organization-settings#create-an-organization) する。

    - 他のユーザーに依頼して、自身の組織にあなたを[招待](./manage-platform-users#invite-organization-users) し、Organization Owner の役割を付与してもらう。

