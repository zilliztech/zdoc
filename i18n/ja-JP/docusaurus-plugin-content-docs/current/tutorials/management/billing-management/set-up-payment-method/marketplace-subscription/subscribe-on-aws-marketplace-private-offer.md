---
title: "AWS Marketplace のプライベートオファーにサブスクライブする | Cloud"
slug: /subscribe-on-aws-marketplace-private-offer
sidebar_label: "AWS Marketplace（プライベートオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準価格と条件を使用するパブリックオファーとは異なり、プライベートオファーには、交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | Cloud"
type: origin
token: QGVxwmnGTidbjtk1LcYcEfqbnOe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace のプライベートオファーにサブスクライブする

AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準価格と条件を使用するパブリックオファーとは異なり、プライベートオファーには、交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。

割引価格、コミットメント支出、エンタープライズ調達条件、または特定の AWS アカウントに紐づく契約など、組織でカスタムの商用条件が必要な場合は、プライベートオファーを使用してください。プライベートオファーは、Zilliz がオファーに含めた AWS アカウント ID にのみ表示されます。

Zilliz Cloud 向けのプライベートオファーが必要な場合は、[Zilliz のアカウントエグゼクティブにお問い合わせください](https://zilliz.com/contact-sales)。オファーを受け取る AWS アカウント ID、想定する契約期間、利用要件、および組織で含める必要がある調達または請求要件をお知らせください。

## 始める前に\{#before-you-start}

AWS Marketplace でプライベートオファーにサブスクライブする前に、以下を確認してください。

- Zilliz Cloud アカウントと[組織](./organization-settings)を持っていること。

- プライベートオファーを受け取り、承認するための [AWS account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console-account-id.html) を持っていること。

- `AWSMarketplaceManageSubscriptions` 管理ポリシーなど、AWS Marketplace 製品にサブスクライブする権限を持っていること。

- Zilliz Cloud 上で Organization Owner または Organization Billing Admin であること。これらの権限は、Marketplace サブスクリプションを Zilliz Cloud 組織にリンクするために必要です。

## プライベートオファーにサブスクライブする\{#subscribe-to-a-private-offer}

以下は、サブスクリプションプロセスの概要です。

![I0BNwWPPnhoWZrbMZWnccBE1nYe](https://zdoc-images.s3.us-west-2.amazonaws.com/I0BNwWPPnhoWZrbMZWnccBE1nYe.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace のプライベートオファーにサブスクライブできます。

<Procedures>

1.  プライベートオファーについて、Zilliz のアカウントエグゼクティブに連絡します。

    [Zilliz のアカウントエグゼクティブに問い合わせる](https://zilliz.com/contact-sales)際に、プライベートオファーを受け取るための AWS アカウント ID を提供する必要があります。 

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** の AWS Marketplace からのメールを探します。このメールには、オファーにアクセスできる AWS アカウント ID が記載されています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。求められたら、メールに表示されているものと同じアカウント ID で AWS にサインインします。そうしないと、プライベートオファーを表示できない場合があります。

        ![AAEEwdD8zhamcKbFjB8cr1j7nFc](https://zdoc-images.s3.us-west-2.amazonaws.com/AAEEwdD8zhamcKbFjB8cr1j7nFc.png)

        <Admonition type="info" icon="📘" title="注意">

        有効期限日までにオファーを承認する必要があります。オファーの有効期限が切れている場合は、担当のアカウントエグゼクティブにお問い合わせください。

        </Admonition>

1. オファーの詳細を確認し、オファーを承認します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択し、必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![Xn6qwEcmihhj0LbwOXicnRgMnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/Xn6qwEcmihhj0LbwOXicnRgMnCh.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に "Y*our request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    ![TrnVwl8sHhW8yLbHI0bcVMO7ntf](https://zdoc-images.s3.us-west-2.amazonaws.com/TrnVwl8sHhW8yLbHI0bcVMO7ntf.png)

1. アカウントをセットアップします。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="注意">

    この手順は必ず完了してください。完了しない場合、プライベートオファーのサブスクリプションはどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![PJGGwBu6nh8lSQbZK1ac2wfhn0d](https://zdoc-images.s3.us-west-2.amazonaws.com/PJGGwBu6nh8lSQbZK1ac2wfhn0d.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![Q6PDbtOwioM06kxe46ecIAKCnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/q6pdbtowiom06kxe46eciakcnmh.png "Q6PDbtOwioM06kxe46ecIAKCnMh")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択可能な組織がない場合、またはご不明な点がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![HvVkbNvp9oe5wIxkdWvcDMWJnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/hvvkbnvp9oe5wixkdwvcdmwjnnc.png "HvVkbNvp9oe5wIxkdWvcDMWJnNc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![REvibD9Nvog0X9xsNGMcwrvynTg](https://zdoc-images.s3.us-west-2.amazonaws.com/revibd9nvog0x9xsngmcwrvyntg.png "REvibD9Nvog0X9xsNGMcwrvynTg")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを見つけます。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![NjQObiKEco940qxMYSpc8g0mnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/njqobikeco940qxmyspc8g0mnhb.png "NjQObiKEco940qxMYSpc8g0mnHb")

</Procedures>

## プライベートオファーを更新する\{#renew-your-private-offer}

プライベートオファーの有効期限が近づくと、Zilliz は更新用の新しいプライベートオファーリンクを送信します。更新プロセスについてご質問がある場合は、担当のアカウントエグゼクティブにお問い合わせください。

<Admonition type="info" icon="📘" title="注意">

AWS Marketplace では、更新は新しいプライベートオファーを承認する形で行われます。承認すると、新しいオファーが以前のオファーを自動的に置き換えます。新しいオファーを再度 Zilliz Cloud 組織にリンクする必要があります。

</Admonition>

以下は、更新プロセスの概要です。

![GKcDwCIv4hVc12bEFPvcXshQniR](https://zdoc-images.s3.us-west-2.amazonaws.com/GKcDwCIv4hVc12bEFPvcXshQniR.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace のプライベートオファーにサブスクライブできます。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** の AWS Marketplace からのメールを探します。このメールには、オファーにアクセスできる AWS アカウント ID が記載されています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。求められたら、メールに表示されているものと同じアカウント ID で AWS にサインインします。

        ![GvHEwgn55hnE1fbRg1Mcg8UEnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/GvHEwgn55hnE1fbRg1Mcg8UEnOc.png)

1. AWS Marketplace ページの **Your offers** セクションに移動し、正しいオファーが選択されていることを確認します。**Offer ID** はメールに表示されている ID と一致している必要があります。

    "**Accepting this offer replaces your current agreement**" と表示されます。

    ![NLAjwwr9ahgutebTFJKcVyntnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/NLAjwwr9ahgutebTFJKcVyntnxb.png)

1. オファーの詳細を確認し、オファーを承認します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択し、必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![YHQxwYXemhfrvubRftzcjBSPn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/YHQxwYXemhfrvubRftzcjBSPn7e.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace に "*Your request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    <Admonition type="info" icon="📘" title="注意">

    この時点では "Set up your account" をクリックしないでください。リクエストが完了するまでお待ちください。
    
    リクエスト完了前にクリックすると、オファーを Zilliz Cloud 組織にリンクする際に "No organization available" と表示される場合があります。これは、以前のプライベートオファーのリンク解除がまだ完了していないためです。

    </Admonition>

1. アカウントをセットアップします。

    リクエストが完了すると、AWS Marketplace ページの上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="注意">

    この手順は必ず完了してください。完了しない場合、プライベートオファーのサブスクリプションはどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![SEMzwPBZNh5ejWbOOdAcmPJunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/SEMzwPBZNh5ejWbOOdAcmPJunRf.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![U3fHb1ZF1o9AWnxYyztcTcpBnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/u3fhb1zf1o9awnxyyztctcpbnxe.png "U3fHb1ZF1o9AWnxYyztcTcpBnXe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択可能な組織がない場合、またはご不明な点がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![KgGJbyKCsoT15cxTzgDcsadWnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/kggjbykcsot15cxtzgdcsadwnhc.png "KgGJbyKCsoT15cxTzgDcsadWnHc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![Rbp1bcYjJoFfyjxf2s7cLO8KnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/rbp1bcyjjoffyjxf2s7clo8knqh.png "Rbp1bcYjJoFfyjxf2s7cLO8KnQh")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを見つけます。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![G15cbgalfoDgRExOSBWcfbzlnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/g15cbgalfodgrexosbwcfbzlnxd.png "G15cbgalfoDgRExOSBWcfbzlnxd")

</Procedures>

## パブリックオファーからプライベートオファーに切り替える\{#switch-from-a-public-offer-to-a-private-offer}

[プライベートオファーの更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)と同様に、パブリックオファーからプライベートオファーに切り替えるには、新しいプライベートオファーを承認する必要があります。承認すると、新しいプライベートオファーが以前のパブリックオファーを自動的に置き換えます。新しいオファーを再度 Zilliz Cloud 組織にリンクする必要があります。

## プライベートオファーのサブスクリプションをキャンセルする\{#cancel-private-offer-subscription}

AWS Marketplace からプライベートオファーのサブスクリプションをキャンセルできます。 

<Admonition type="info" icon="📘" title="注意">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能へのアクセスを失います。組織に残っているクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを承認した AWS アカウントにサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud のサブスクリプションを見つけて、契約 ID をクリックします。

1. **Agreement** の下で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[Canceling product subscriptions](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html) を参照してください。

## FAQ\{#faq}

**プライベートオファーの有効期限が切れ、更新されなかった場合はどうなりますか？**

プライベートオファーの有効期限が切れて更新されない場合、AWS Marketplace サブスクリプションはプライベートオファーの条件を失います。Zilliz Cloud 組織で有効な支払い方法も残りのクレジットも利用できない場合、高度な機能へのアクセスは無効になり、組織は凍結されます。

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに利用可能な組織がない場合は、どうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。しかし、Organization Member のみである場合は、必要な権限がありません。支援については、組織の所有者にお問い合わせください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まずその組織の現在のサブスクリプションのリンクを解除し、その後で新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖された場合、またはすべての組織から退出した場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい組織を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに、自分をその組織に[招待](./organization-users#invite-a-user-to-your-organization)し、Organization Owner のロールを付与してもらう。

