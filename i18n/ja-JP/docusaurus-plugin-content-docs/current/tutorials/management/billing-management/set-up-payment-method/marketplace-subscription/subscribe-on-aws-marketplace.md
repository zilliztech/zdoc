---
title: "AWS Marketplace の Public Offer にサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、サブスクリプション手順をステップごとに説明し、AWS Marketplace における Zilliz Cloud の料金体系を紹介します。 | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace の Public Offer にサブスクライブする

このガイドでは、サブスクリプション手順をステップごとに説明し、AWS Marketplace における Zilliz Cloud の料金体系を紹介します。 

<Admonition type="info" icon="📘" title="📘 Note">

サブスクライブすると、AWS Marketplace 経由で AWS クラスターの利用料金を支払えるようになります。他のクラウドプロバイダーにデプロイされたクラスターがある場合も、AWS Marketplace を使って支払うことができます。

</Admonition>

## 始める前に\{#before-you-start}

- AWS Marketplace アカウントを用意してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法はこちら](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- AWS アカウントが組織の一部である場合は、請求管理者から購入の許可を受けている必要があります。

## Public Offer にサブスクライブする\{#subscribe-to-a-public-offer}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、以下の手順で Zilliz Cloud のサブスクライブを開始します。

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title=""  />

<Procedures>

1. 検索ボックスで **Zilliz Cloud** を検索し、**Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)** をクリックします。

    または、直接 [このページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz) にアクセスすることもできます。 

    ![UNGcb105Oo319KxghYwciqeCntf](https://zdoc-images.s3.us-west-2.amazonaws.com/ungcb105oo319kxghywciqecntf.png "UNGcb105Oo319KxghYwciqeCntf")

1. **View purchase options** をクリックします。

    ![UQ0Bbe7huojVMUxpjWccXT6enkb](https://zdoc-images.s3.us-west-2.amazonaws.com/uq0bbe7huojvmuxpjwccxt6enkb.png "UQ0Bbe7huojVMUxpjWccXT6enkb")

1. ページを下にスクロールし、**Subscribe** をクリックします。 

    ![XAn8bszmeoIRJbxUml1cmXJQned](https://zdoc-images.s3.us-west-2.amazonaws.com/xan8bszmeoirjbxuml1cmxjqned.png "XAn8bszmeoIRJbxUml1cmXJQned")

1. 画面の案内に従って、Zilliz Cloud で **Set up your account** を行います。

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1. 新しいタブで、以下の手順に従ってサブスクリプションを完了します。

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud) を選択して手順に従ってください。AWS の ID を Zilliz Cloud アカウントに関連付けるため、URL 内のクエリ文字列は必ず保持してください。

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace は、URL 内のクエリ文字列を使用して ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz Cloud が AWS の ID を当社で登録されたアカウントに関連付けできない場合があります。このような場合は、AWS Marketplace に戻ってもう一度 <b>Set up your account</b> をクリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織にリンクします。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認可を完了します。

1. **Billing** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace でのサブスクリプションが正常に完了した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを行えます。

- サブスクリプションに使用する Marketplace アカウントを別のアカウントに変更する

- 支払い方法を Marketplace のサブスクリプションからクレジットカードに切り替える

詳細については、[支払い方法を更新する](./update-payment-method) を参照してください。

## Private Offer に切り替える\{#switch-to-a-private-offer}

詳細については、[AWS Marketplace の Private Offer にサブスクライブする](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer) を参照してください。

## Public Offer のサブスクリプションをキャンセルする\{#cancel-public-offer-subscription}

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能へのアクセスを失います。組織に残っているクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. Private Offer を承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけて、agreement ID をクリックします。

1. **Agreement** で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling product subscriptions](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace のサブスクリプションを Zilliz Cloud にリンクするときに、利用可能な組織が表示されない場合はどうすればよいですか？**

考えられる理由はいくつかあります。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace のサブスクリプションに組織をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は、必要な権限がありません。サポートが必要な場合は、組織のオーナーに連絡してください。

- **すべての組織がすでに Marketplace のサブスクリプションに正常にリンクされている**

    これは、すべての組織がすでに Marketplace のサブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合や、すべての組織から退出している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、あなたをその組織に [招待](./organization-users#invite-a-user-to-your-organization) してもらい、Organization Owner のロールを付与してもらってください。

