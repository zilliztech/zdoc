---
title: "AWS Marketplace の Public Offer にサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace（Public Offer）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、AWS Marketplace における Zilliz Cloud のサブスクリプション手順をステップごとに説明し、料金条件の概要を示します。 | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS Marketplace の Public Offer にサブスクライブする

このガイドでは、AWS Marketplace における Zilliz Cloud のサブスクリプション手順をステップごとに説明し、料金条件の概要を示します。 

<Admonition type="info" icon="📘" title="📘 注">

サブスクライブ後は、AWS Marketplace を通じて AWS クラスターの利用料金を支払えます。他のクラウドプロバイダーにデプロイされたクラスターがある場合でも、AWS Marketplace を利用して支払うことができます。

</Admonition>

## 始める前に\{#before-you-start}

- AWS Marketplace アカウントを持っていることを確認してください。

- AWS Buyer ID のデフォルトの支払い方法を Invoicing Plan に設定してください。[デフォルトの支払い方法を変更する方法はこちら](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)。

- AWS アカウントが組織の一部である場合、課金管理者から購入権限を付与されている必要があります。

## Public Offer にサブスクライブする\{#subscribe-to-a-public-offer}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、次の手順で Zilliz Cloud のサブスクリプションを開始します。

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

    1. すでに Zilliz Cloud アカウントをお持ちの場合は、そのままログインしてください。お持ちでない場合は、[サインアップ方法](./register-with-zilliz-cloud) を選択し、手順に従ってください。AWS の ID 情報を Zilliz Cloud アカウントに関連付けるため、URL 内のすべてのクエリ文字列が保持されていることを確認してください。

        <Admonition type="info" icon="📘" title="注">

        AWS Marketplace は、URL 内のクエリ文字列を使用して ID 情報を Zilliz Cloud に渡します。サインアップに失敗すると、これらのクエリ文字列が失われる場合があります。その結果、Zilliz Cloud が AWS の ID 情報を当社に登録されたアカウントに関連付けできないことがあります。このような場合は、AWS Marketplace に戻って再度 <b>Set up your account</b> をクリックしてください。

        </Admonition>

    1. サブスクリプションを既存の Zilliz Cloud 組織に関連付けます。

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. 認可を完了します。

1. **Billing** に移動し、AWS Marketplace のサブスクリプションが支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## サブスクリプションまたは支払い方法を更新する\{#update-subscription-or-payment-method}

Marketplace からのサブスクリプションが正常に完了した後は、必要に応じていつでもサブスクリプションを更新できます。 

具体的には、次のいずれかを行えます。

- サブスクリプションに使用する Marketplace アカウントを別のアカウントに変更する

- 支払い方法を Marketplace サブスクリプションからクレジットカードに切り替える

詳細については、Update Payment Method を参照してください。

## Private Offer に切り替える\{#switch-to-a-private-offer}

詳細については、[AWS Marketplace の Private Offer にサブスクライブする](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer) を参照してください。

## Public Offer のサブスクリプションをキャンセルする\{#cancel-public-offer-subscription}

<Admonition type="info" icon="📘" title="注">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残っているクレジットがない場合、またはすべてのクレジットが期限切れの場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. Private Offer を承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけ、契約 ID をクリックします。

1. **Agreement** の下で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## トラブルシューティング\{#troubleshooting}

**Marketplace サブスクリプションを Zilliz Cloud に関連付ける際に利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace サブスクリプションに組織を関連付けるには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合、必要な権限がありません。サポートが必要な場合は、組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションに正常に関連付けられている**

    これは、すべての組織がすでに Marketplace サブスクリプションに関連付けられている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、次のようにしてください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその組織の現在のサブスクリプションの関連付けを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization) できます。

- **リストに組織が表示されない**

    - これは、アカウントが閉鎖されている場合、またはすべての組織から退出している場合に発生することがあります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のいずれかを実行できます。

    - [新しい組織を作成](./organization-settings#create-an-organization)。

    - 他のユーザーに、自分をその組織に [招待](./organization-users#invite-a-user-to-your-organization) してもらい、Organization Owner のロールを付与してもらいます。

