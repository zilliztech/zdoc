---
title: "AWS Marketplace でプライベートオファーに登録する | BYOC"
slug: /subscribe-on-aws-marketplace-private-offer
sidebar_label: "AWS Marketplace（プライベートオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに記載された標準価格・条件が適用されるパブリックオファーとは異なり、プライベートオファーでは交渉済みの価格、個別の契約条件、特定の契約期間、指定した支払いスケジュールなどを設定できます。 | BYOC"
type: origin
token: QGVxwmnGTidbjtk1LcYcEfqbnOe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace でプライベートオファーに登録する

AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに記載された標準価格・条件が適用されるパブリックオファーとは異なり、プライベートオファーでは交渉済みの価格、個別の契約条件、特定の契約期間、指定した支払いスケジュールなどを設定できます。

割引価格、コミット済み支出、エンタープライズ向けの調達条件、特定の AWS アカウントに紐付いた契約など、組織としてカスタムの商取引条件が必要な場合にプライベートオファーを利用します。プライベートオファーは、Zilliz がオファーに含めた AWS アカウント ID からのみ参照できます。

Zilliz Cloud のプライベートオファーをご希望の場合は、[Zilliz のアカウントエグゼクティブにお問い合わせください](https://zilliz.com/contact-sales)。その際、オファーの送付先となる AWS アカウント ID、ご希望の契約期間、利用要件、および組織で必要な調達・請求関連の要件をお知らせください。

## 事前準備\{#before-you-start}

AWS Marketplace でプライベートオファーに登録する前に、以下の条件を満たしていることを確認してください。

- Zilliz Cloud のアカウントと[組織](./organization-settings)があること。

- プライベートオファーの受領・承諾に使用する [AWS アカウント ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console-account-id.html) があること。

- `AWSMarketplaceManageSubscriptions` マネージドポリシーなど、AWS Marketplace の製品に登録するための権限を持っていること。

- Zilliz Cloud の Organization Owner または Organization Billing Admin であること。Marketplace サブスクリプションを Zilliz Cloud の組織にリンクするには、これらの権限が必要です。

## プライベートオファーへの登録\{#subscribe-to-a-private-offer}

以下に登録プロセスの概要を示します。

![I0BNwWPPnhoWZrbMZWnccBE1nYe](https://zdoc-images.s3.us-west-2.amazonaws.com/I0BNwWPPnhoWZrbMZWnccBE1nYe.png)

AWS Marketplace でプライベートオファーに登録するには、以下の手順に従ってください。

<Procedures>

1.  プライベートオファーについて、Zilliz のアカウントエグゼクティブにお問い合わせください。

    [Zilliz のアカウントエグゼクティブに連絡する](https://zilliz.com/contact-sales)際は、プライベートオファーの送付先となる AWS アカウント ID をお伝えください。

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** となっている AWS Marketplace からのメールを確認します。このメールには、オファーにアクセス可能な AWS アカウント ID が記載されています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。サインインが求められたら、メールに記載されたものと同じアカウント ID で AWS にサインインしてください。異なるアカウントでサインインすると、プライベートオファーが表示されない場合があります。

        ![AAEEwdD8zhamcKbFjB8cr1j7nFc](https://zdoc-images.s3.us-west-2.amazonaws.com/AAEEwdD8zhamcKbFjB8cr1j7nFc.png)

        <Admonition type="info" icon="📘" title="Note">

        オファーは有効期限内に承諾する必要があります。有効期限が切れている場合は、アカウントエグゼクティブにお問い合わせください。

        </Admonition>

1. オファーの内容を確認し、承諾します。

    請求書に発注書（PO）番号を記載する場合は、**Add a purchase order** を選択して必要事項を入力します。発注書が不要な場合は **No purchase order** を選択してください。

    **Accept offer** をクリックします。

    ![Xn6qwEcmihhj0LbwOXicnRgMnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/Xn6qwEcmihhj0LbwOXicnRgMnCh.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に「Y*our request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*」というメッセージが表示されます。

    ![TrnVwl8sHhW8yLbHI0bcVMO7ntf](https://zdoc-images.s3.us-west-2.amazonaws.com/TrnVwl8sHhW8yLbHI0bcVMO7ntf.png)

1. アカウントの設定を行います。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックすると、Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必須です。完了しない場合、プライベートオファーのサブスクリプションが Zilliz Cloud の組織にリンクされません。

    </Admonition>

    ![PJGGwBu6nh8lSQbZK1ac2wfhn0d](https://zdoc-images.s3.us-west-2.amazonaws.com/PJGGwBu6nh8lSQbZK1ac2wfhn0d.png)

1. Marketplace サブスクリプションを Zilliz Cloud の組織にリンクします。

    1. Zilliz Cloud のアカウントにログインします。

        ![Q6PDbtOwioM06kxe46ecIAKCnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/q6pdbtowiom06kxe46eciakcnmh.png "Q6PDbtOwioM06kxe46ecIAKCnMh")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud の組織を選択します。

        選択可能な組織がない場合やご不明な点がある場合は、[Zilliz サポート](http://support.zilliz.com)にお問い合わせください。

        ![HvVkbNvp9oe5wIxkdWvcDMWJnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/hvvkbnvp9oe5wixkdwvcdmwjnnc.png "HvVkbNvp9oe5wIxkdWvcDMWJnNc")

    1. 処理が完了すると、以下の確認ウィンドウが表示されます。

        ![REvibD9Nvog0X9xsNGMcwrvynTg](https://zdoc-images.s3.us-west-2.amazonaws.com/revibd9nvog0x9xsngmcwrvyntg.png "REvibD9Nvog0X9xsNGMcwrvynTg")

    1. Zilliz Cloud の **Billing** ページにある **Payment Method** セクションを確認します。ID アイコンにカーソルを合わせると、サブスクリプションの詳細を確認できます。

        ![NjQObiKEco940qxMYSpc8g0mnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/njqobikeco940qxmyspc8g0mnhb.png "NjQObiKEco940qxMYSpc8g0mnHb")

</Procedures>

## プライベートオファーの更新\{#renew-your-private-offer}

プライベートオファーの有効期限が近づくと、Zilliz から更新用の新しいプライベートオファーリンクが送信されます。更新手続きについてご質問がある場合は、アカウントエグゼクティブにお問い合わせください。

<Admonition type="info" icon="📘" title="Note">

AWS Marketplace では、更新は新しいプライベートオファーの承諾として行われます。承諾後、新しいオファーが自動的に既存のオファーに置き換わります。なお、新しいオファーについても Zilliz Cloud の組織へのリンク作業を再度行う必要があります。

</Admonition>

以下に更新プロセスの概要を示します。

![GKcDwCIv4hVc12bEFPvcXshQniR](https://zdoc-images.s3.us-west-2.amazonaws.com/GKcDwCIv4hVc12bEFPvcXshQniR.png)

AWS Marketplace でプライベートオファーを更新するには、以下の手順に従ってください。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** となっている AWS Marketplace からのメールを確認します。このメールには、オファーにアクセス可能な AWS アカウント ID が記載されています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。サインインが求められたら、メールに記載されたものと同じアカウント ID で AWS にサインインしてください。

        ![GvHEwgn55hnE1fbRg1Mcg8UEnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/GvHEwgn55hnE1fbRg1Mcg8UEnOc.png)

1. AWS Marketplace ページの **Your offers** セクションで、正しいオファーが選択されていることを確認します。**Offer ID** がメールに記載された ID と一致している必要があります。

    「**Accepting this offer replaces your current agreement**」というメッセージが表示されます。

    ![NLAjwwr9ahgutebTFJKcVyntnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/NLAjwwr9ahgutebTFJKcVyntnxb.png)

1. オファーの内容を確認し、承諾します。

    請求書に発注書（PO）番号を記載する場合は、**Add a purchase order** を選択して必要事項を入力します。発注書が不要な場合は **No purchase order** を選択してください。

    **Accept offer** をクリックします。

    ![YHQxwYXemhfrvubRftzcjBSPn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/YHQxwYXemhfrvubRftzcjBSPn7e.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に「*Your request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*」というメッセージが表示されます。

    <Admonition type="info" icon="📘" title="Note">

    この時点では「Set up your account」をクリック**しないでください**。リクエストが完了するまでお待ちください。
    
    リクエスト完了前にクリックしてしまうと、オファーを Zilliz Cloud の組織にリンクする際に「No organization available」と表示される場合があります。これは、以前のプライベートオファーのリンク解除がまだ完了していないことが原因です。

    </Admonition>

1. アカウントの設定を行います。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックすると、Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必須です。完了しない場合、プライベートオファーのサブスクリプションが Zilliz Cloud の組織にリンクされません。

    </Admonition>

    ![SEMzwPBZNh5ejWbOOdAcmPJunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/SEMzwPBZNh5ejWbOOdAcmPJunRf.png)

1. Marketplace サブスクリプションを Zilliz Cloud の組織にリンクします。

    1. Zilliz Cloud のアカウントにログインします。

        ![U3fHb1ZF1o9AWnxYyztcTcpBnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/u3fhb1zf1o9awnxyyztctcpbnxe.png "U3fHb1ZF1o9AWnxYyztcTcpBnXe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud の組織を選択します。

        選択可能な組織がない場合やご不明な点がある場合は、[Zilliz サポート](http://support.zilliz.com)にお問い合わせください。

        ![KgGJbyKCsoT15cxTzgDcsadWnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/kggjbykcsot15cxtzgdcsadwnhc.png "KgGJbyKCsoT15cxTzgDcsadWnHc")

    1. 処理が完了すると、以下の確認ウィンドウが表示されます。

        ![Rbp1bcYjJoFfyjxf2s7cLO8KnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/rbp1bcyjjoffyjxf2s7clo8knqh.png "Rbp1bcYjJoFfyjxf2s7cLO8KnQh")

    1. Zilliz Cloud の **Billing** ページにある **Payment Method** セクションを確認します。ID アイコンにカーソルを合わせると、サブスクリプションの詳細を確認できます。

        ![G15cbgalfoDgRExOSBWcfbzlnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/g15cbgalfodgrexosbwcfbzlnxd.png "G15cbgalfoDgRExOSBWcfbzlnxd")

</Procedures>

## パブリックオファーからプライベートオファーへの切り替え\{#switch-from-a-public-offer-to-a-private-offer}

[プライベートオファーの更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)と同様に、パブリックオファーからプライベートオファーへ切り替えるには、新しいプライベートオファーを承諾する必要があります。承諾後、新しいプライベートオファーが以前のパブリックオファーに自動的に置き換わります。なお、新しいオファーをZilliz Cloud組織に再度リンクする必要があります。

## プライベートオファーサブスクリプションのキャンセル\{#cancel-private-offer-subscription}

プライベートオファーサブスクリプションは、AWS Marketplace からキャンセルできます。

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は高度なZilliz Cloud機能へのアクセスを失います。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、組織が直ちに凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを承諾した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloudサブスクリプションを探し、契約 ID をクリックします。

1. **Agreement** セクションで **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスに **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品サブスクリプションのキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html)を参照してください。

## FAQ\{#faq}

**プライベートオファーの有効期限が切れ、更新されない場合はどうなりますか？**

プライベートオファーが有効期限切れとなり更新されない場合、AWS Marketplace サブスクリプションからプライベートオファーの条件が失われます。その時点でZilliz Cloud組織に有効な支払い方法や残りのクレジットがない場合は、高度な機能へのアクセスが無効になり、組織が凍結されます。

**マーケットプレイスサブスクリプションをZilliz Cloudにリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足**

    十分な権限がない場合にこの問題が発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織をマーケットプレイスサブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** のロールが必要です。Organization Member のみの場合は必要な権限がないため、組織のオーナーにお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションにリンクされている**

    所有するすべての組織がすでに Marketplace サブスクリプションにリンクされている場合にこの問題が発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応が可能です。

    - 既存のマーケットプレイスサブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織が表示されない**

    - アカウントが閉鎖された場合や、すべての組織から脱退した場合にこの問題が発生することがあります。UI は次のように表示されます。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下の対応が可能です。

    - [新しい組織を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに依頼して、自身の組織に[招待](./manage-platform-users#invite-organization-users)してもらい、Organization Owner ロールを付与してもらう。

