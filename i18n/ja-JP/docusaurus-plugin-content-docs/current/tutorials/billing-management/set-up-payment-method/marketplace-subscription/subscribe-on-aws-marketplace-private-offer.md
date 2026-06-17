---
title: "AWS Marketplace で Private Offer にサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace-private-offer
sidebar_key: subscribe-on-aws-marketplace-private-offer
sidebar_label: "AWS Marketplace (Private Offer)"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "AWS Marketplace の Private Offer は、Zilliz が組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準の価格と条件を使用する Public Offer とは異なり、Private Offer には交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | Cloud"
type: origin
token: QGVxwmnGTidbjtk1LcYcEfqbnOe
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - aws
  - private offer

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace で Private Offer にサブスクライブする

AWS Marketplace の Private Offer は、Zilliz が組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準の価格と条件を使用する Public Offer とは異なり、Private Offer には交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。

割引価格、コミット済み利用額、エンタープライズ調達条件、特定の AWS account ID に紐付いた契約など、組織がカスタムの商用条件を必要とする場合は Private Offer を使用します。Private Offer は、Zilliz がオファーに含めた AWS account ID にのみ表示されます。

Zilliz Cloud の Private Offer が必要な場合は、[担当の Zilliz アカウントエグゼクティブにお問い合わせ](https://zilliz.com/contact-sales)ください。オファーを受け取る AWS account ID、想定契約期間、利用要件、組織が含める必要のある調達または請求要件をお知らせください。

## 開始前の準備\{#before-you-start}

AWS Marketplace で Private Offer にサブスクライブする前に、次のことを確認してください。

- Zilliz Cloud アカウントと [組織](./organizations)があること。

- Private Offer を受け取り、承諾するための [AWS account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console-account-id.html)があること。

- `AWSMarketplaceManageSubscriptions` マネージドポリシーなど、AWS Marketplace 製品にサブスクライブする権限があること。

- Zilliz Cloud で Organization Owner または Organization Billing Admin であること。Marketplace サブスクリプションを Zilliz Cloud 組織にリンクするには、これらの権限が必要です。

## Private Offer にサブスクライブする\{#subscribe-to-a-private-offer}

以下は、サブスクリプションプロセスの概要です。

![I0BNwWPPnhoWZrbMZWnccBE1nYe](https://zdoc-images.s3.us-west-2.amazonaws.com/I0BNwWPPnhoWZrbMZWnccBE1nYe.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace で Private Offer にサブスクライブできます。

<Procedures>

1.  Private Offer について担当の Zilliz アカウントエグゼクティブに問い合わせます。

    [担当の Zilliz アカウントエグゼクティブに問い合わせる](https://zilliz.com/contact-sales)際は、Private Offer を受け取るための AWS account ID を提供する必要があります。

1. メールの受信トレイを確認します。

    1. AWS Marketplace から件名 **You have a new Private Offer** のメールを探します。このメールには、オファーにアクセスできる AWS account ID が含まれています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。プロンプトが表示されたら、メールに表示されているものと同じ AWS account ID で AWS にサインインします。そうしないと、Private Offer を表示できない場合があります。

        ![AAEEwdD8zhamcKbFjB8cr1j7nFc](https://zdoc-images.s3.us-west-2.amazonaws.com/AAEEwdD8zhamcKbFjB8cr1j7nFc.png)

        <Admonition type="info" icon="📘" title="Note">

        オファーの有効期限が切れる前に承諾する必要があります。オファーの有効期限が切れている場合は、担当のアカウントエグゼクティブに連絡してください。

        </Admonition>

1. オファーの詳細を確認し、オファーを承諾します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択し、必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![Xn6qwEcmihhj0LbwOXicnRgMnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/Xn6qwEcmihhj0LbwOXicnRgMnCh.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に、"Y*our request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    ![TrnVwl8sHhW8yLbHI0bcVMO7ntf](https://zdoc-images.s3.us-west-2.amazonaws.com/TrnVwl8sHhW8yLbHI0bcVMO7ntf.png)

1. アカウントを設定します。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必ず完了してください。完了しない場合、Private Offer サブスクリプションはどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![PJGGwBu6nh8lSQbZK1ac2wfhn0d](https://zdoc-images.s3.us-west-2.amazonaws.com/PJGGwBu6nh8lSQbZK1ac2wfhn0d.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![Q6PDbtOwioM06kxe46ecIAKCnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/q6pdbtowiom06kxe46eciakcnmh.png "Q6PDbtOwioM06kxe46ecIAKCnMh")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択できる組織がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![HvVkbNvp9oe5wIxkdWvcDMWJnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/hvvkbnvp9oe5wixkdwvcdmwjnnc.png "HvVkbNvp9oe5wIxkdWvcDMWJnNc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![REvibD9Nvog0X9xsNGMcwrvynTg](https://zdoc-images.s3.us-west-2.amazonaws.com/revibd9nvog0x9xsngmcwrvyntg.png "REvibD9Nvog0X9xsNGMcwrvynTg")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを探します。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![NjQObiKEco940qxMYSpc8g0mnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/njqobikeco940qxmyspc8g0mnhb.png "NjQObiKEco940qxMYSpc8g0mnHb")

</Procedures>

## Private Offer を更新する\{#renew-your-private-offer}

Private Offer の有効期限が近づくと、Zilliz は更新用の新しい Private Offer リンクを送信します。更新プロセスについて質問がある場合は、担当のアカウントエグゼクティブに連絡してください。

<Admonition type="info" icon="📘" title="Note">

AWS Marketplace では、更新は新しい Private Offer を承諾することと同じように機能します。承諾すると、新しいオファーが以前のオファーを自動的に置き換えます。それでも、新しいオファーを Zilliz Cloud 組織に再度リンクする必要があります。

</Admonition>

以下は、更新プロセスの概要です。

![GKcDwCIv4hVc12bEFPvcXshQniR](https://zdoc-images.s3.us-west-2.amazonaws.com/GKcDwCIv4hVc12bEFPvcXshQniR.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace で Private Offer にサブスクライブできます。

<Procedures>

1. メールの受信トレイを確認します。

    1. AWS Marketplace から件名 **You have a new Private Offer** のメールを探します。このメールには、オファーにアクセスできる AWS account ID が含まれています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。プロンプトが表示されたら、メールに表示されているものと同じ AWS account ID で AWS にサインインします。

        ![GvHEwgn55hnE1fbRg1Mcg8UEnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/GvHEwgn55hnE1fbRg1Mcg8UEnOc.png)

1. AWS Marketplace ページで **Your offers** セクションに移動し、正しいオファーが選択されていることを確認します。**Offer ID** はメールに表示されている ID と一致している必要があります。

    "**Accepting this offer replaces your current agreement**" というプロンプトが表示されます。

    ![NLAjwwr9ahgutebTFJKcVyntnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/NLAjwwr9ahgutebTFJKcVyntnxb.png)

1. オファーの詳細を確認し、オファーを承諾します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択し、必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![YHQxwYXemhfrvubRftzcjBSPn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/YHQxwYXemhfrvubRftzcjBSPn7e.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に、"*Your request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    <Admonition type="info" icon="📘" title="Note">

    この時点では **Set up your account** をクリックしないでください。リクエストが完了するまで待ってください。

    リクエストが完了する前にクリックすると、オファーを Zilliz Cloud 組織にリンクする際に "No organization available" と表示される場合があります。これは、以前の Private Offer がまだリンク解除されていないために発生します。

    </Admonition>

1. アカウントを設定します。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必ず完了してください。完了しない場合、Private Offer サブスクリプションはどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![SEMzwPBZNh5ejWbOOdAcmPJunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/SEMzwPBZNh5ejWbOOdAcmPJunRf.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![U3fHb1ZF1o9AWnxYyztcTcpBnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/u3fhb1zf1o9awnxyyztctcpbnxe.png "U3fHb1ZF1o9AWnxYyztcTcpBnXe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択できる組織がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![KgGJbyKCsoT15cxTzgDcsadWnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/kggjbykcsot15cxtzgdcsadwnhc.png "KgGJbyKCsoT15cxTzgDcsadWnHc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![Rbp1bcYjJoFfyjxf2s7cLO8KnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/rbp1bcyjjoffyjxf2s7clo8knqh.png "Rbp1bcYjJoFfyjxf2s7cLO8KnQh")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを探します。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![G15cbgalfoDgRExOSBWcfbzlnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/g15cbgalfodgrexosbwcfbzlnxd.png "G15cbgalfoDgRExOSBWcfbzlnxd")

</Procedures>

## Public Offer から Private Offer に切り替える\{#switch-from-a-public-offer-to-a-private-offer}

[Private Offer の更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer) と同様に、Public Offer から Private Offer に切り替えるには、新しい Private Offer を承諾する必要があります。承諾すると、新しい Private Offer が以前の Public Offer を自動的に置き換えます。それでも、新しいオファーを Zilliz Cloud 組織に再度リンクする必要があります。

## Private Offer サブスクリプションをキャンセルする\{#cancel-private-offer-subscription}

AWS Marketplace から Private Offer サブスクリプションをキャンセルできます。

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

**Private Offer の有効期限が切れ、更新されない場合はどうなりますか？**

Private Offer の有効期限が切れて更新されない場合、AWS Marketplace サブスクリプションは Private Offer の条件を失います。Zilliz Cloud 組織で有効な支払い方法または残りのクレジットを利用できない場合、高度な機能へのアクセスが無効になり、組織は凍結されます。

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

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントがクローズされている場合、またはすべての組織から脱退している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のように対応できます。

    - [新しい組織を作成](./organization-settings#create-an-organization)します。

    - 他のユーザーに、その組織へあなたを [招待](./organization-users#invite-a-user-to-your-organization) し、Organization Owner のロールを付与するよう依頼します。
