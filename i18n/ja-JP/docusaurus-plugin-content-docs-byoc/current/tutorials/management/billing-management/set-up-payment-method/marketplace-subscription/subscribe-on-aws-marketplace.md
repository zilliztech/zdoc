---
title: "AWS Marketplace の Public Offer を購読する | BYOC"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、AWS Marketplace における Zilliz Cloud の購読プロセスをステップごとに説明し、料金体系の概要を示します。 | BYOC"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace の Public Offer を購読する

このガイドでは、AWS Marketplace における Zilliz Cloud の購読プロセスをステップごとに説明し、料金体系の概要を示します。 

<Admonition type="info" icon="📘" title="📘 Note">

購読後は、AWS Marketplace 経由で AWS クラスターの使用料を支払うことができます。ほかのクラウドプロバイダーにデプロイされたクラスターがある場合でも、AWS Marketplace を使って支払うことができます。

</Admonition>

## 始める前に\{#before-you-start}

- AWS Marketplace アカウントを持っていることを確認してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法はこちら](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- AWS アカウントが組織の一部である場合、請求管理者から購入権限を付与されている必要があります。

## Public Offer を購読する\{#subscribe-to-a-public-offer}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud の購読を開始します。

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、直接 [このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) にアクセスすることもできます。 

    ![UNGcb105Oo319KxghYwciqeCntf](https://zdoc-images.s3.us-west-2.amazonaws.com/ungcb105oo319kxghywciqecntf.png "UNGcb105Oo319KxghYwciqeCntf")

1. **View purchase options** をクリックします。

    ![UQ0Bbe7huojVMUxpjWccXT6enkb](https://zdoc-images.s3.us-west-2.amazonaws.com/uq0bbe7huojvmuxpjwccxt6enkb.png "UQ0Bbe7huojVMUxpjWccXT6enkb")

1. ページを下にスクロールし、**Subscribe** をクリックします。 

    ![XAn8bszmeoIRJbxUml1cmXJQned](https://zdoc-images.s3.us-west-2.amazonaws.com/xan8bszmeoirjbxuml1cmxjqned.png "XAn8bszmeoIRJbxUml1cmXJQned")

1. 画面の案内に従って、Zilliz Cloud で **Set up your account** を行い、アカウントを設定します。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  新しいタブで、以下の手順に従って購読を完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud) を選択して手順に従ってください。AWS の ID 情報を Zilliz Cloud アカウントに関連付けるため、URL 内のすべてのクエリ文字列を保持したままにしてください。

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace は、URL のクエリ文字列を使用してお客様の ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud が AWS の ID 情報を当社で登録されたお客様のアカウントに関連付けできない場合があります。この場合は、AWS Marketplace に戻って再度 <b>Set up your account</b> をクリックしてください。

        </Admonition>

    1. 購読を既存の Zilliz Cloud 組織に関連付けます。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認証を完了します。

1. **Billing** に移動し、AWS Marketplace の購読が支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## 購読または支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からの購読に成功した後は、必要に応じていつでも購読内容を更新できます。 

具体的には、以下のいずれかを実行できます。

- 購読に使用している Marketplace アカウントを別のものに変更する

- 支払い方法を Marketplace 購読からクレジットカードに切り替える

詳細については、Update Payment Method を参照してください。

## Private Offer に切り替える\{#switch-to-a-private-offer}

詳細については、[AWS Marketplace の Private Offer を購読する](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer) を参照してください。

## Public Offer の購読をキャンセルする\{#cancel-public-offer-subscription}

<Admonition type="info" icon="📘" title="Note">

購読をキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残っているクレジットがない場合、またはすべてのクレジットが期限切れの場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. Private Offer を承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud の購読を見つけて、agreement ID をクリックします。

1. **Agreement** の下で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling product subscriptions](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace の購読を Zilliz Cloud に関連付ける際に、利用可能な組織が表示されない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不足している** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace の購読に組織を関連付けるには、**Organization Owner** または **Organization Billing Admin** である必要があります。しかし、Organization Member のみである場合は、必要な権限がありません。組織の所有者に連絡して支援を依頼してください。

- **すべての組織がすでに Marketplace 購読に正常に関連付けられている**

    すべての組織がすでに Marketplace 購読に関連付けられている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace 購読を更新する必要がある場合は、まずその組織の現在の購読の関連付けを解除してから、新しい購読を設定してください。

    - 異なる Marketplace 購読のために複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合や、すべての組織から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、そのユーザーの組織へ [招待](./organization-users#invite-a-user-to-your-organization) してもらい、Organization Owner のロールを付与してもらってください。

