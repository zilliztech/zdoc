---
title: "AWS Marketplace のプライベートオファーを購読する | BYOC"
slug: /subscribe-on-aws-marketplace-private-offer
sidebar_label: "AWS Marketplace（プライベートオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準の価格と条件を使用するパブリックオファーとは異なり、プライベートオファーには、交渉済みの価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | BYOC"
type: origin
token: QGVxwmnGTidbjtk1LcYcEfqbnOe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS Marketplace のプライベートオファーを購読する

AWS Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。AWS Marketplace の製品ページに表示される標準の価格と条件を使用するパブリックオファーとは異なり、プライベートオファーには、交渉済みの価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。

プライベートオファーは、割引価格、コミットメント支出、エンタープライズ調達条件、または特定の AWS account に紐づく契約など、組織でカスタムの商用条件が必要な場合に使用します。プライベートオファーは、Zilliz がオファーに含めた AWS account ID にのみ表示されます。

Zilliz Cloud のプライベートオファーが必要な場合は、[Zilliz のアカウントエグゼクティブにお問い合わせください](https://zilliz.com/contact-sales)。オファーを受け取る AWS account ID、想定する契約期間、利用要件、および組織で含める必要がある調達または請求要件を伝えてください。

## 開始する前に\{#before-you-start}

AWS Marketplace のプライベートオファーを購読する前に、以下を確認してください。

- Zilliz Cloud のアカウントと[organization](./organization-settings)を持っていること。

- プライベートオファーを受け取り、承諾するための [AWS account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console-account-id.html) を持っていること。

- `AWSMarketplaceManageSubscriptions` 管理ポリシーなど、AWS Marketplace 製品を購読する権限を持っていること。

- Zilliz Cloud で Organization Owner または Organization Billing Admin であること。これらの権限は、Marketplace の購読を Zilliz Cloud organization にリンクするために必要です。

## プライベートオファーを購読する\{#subscribe-to-a-private-offer}

以下は、購読プロセスの概要です。

![I0BNwWPPnhoWZrbMZWnccBE1nYe](https://zdoc-images.s3.us-west-2.amazonaws.com/I0BNwWPPnhoWZrbMZWnccBE1nYe.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace のプライベートオファーを購読できます。

<Procedures>

1.  プライベートオファーについて、Zilliz のアカウントエグゼクティブに連絡します。

    [Zilliz のアカウントエグゼクティブに連絡する](https://zilliz.com/contact-sales)際には、プライベートオファーを受け取るために AWS account ID を提供する必要があります。 

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** の AWS Marketplace からのメールを探します。メールには、そのオファーにアクセスできる AWS account ID が含まれています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。求められたら、メールに表示されているものと同じ account ID で AWS にサインインしてください。そうしないと、プライベートオファーを表示できない場合があります。

        ![AAEEwdD8zhamcKbFjB8cr1j7nFc](https://zdoc-images.s3.us-west-2.amazonaws.com/AAEEwdD8zhamcKbFjB8cr1j7nFc.png)

        <Admonition type="info" icon="📘" title="注">

        オファーは有効期限までに承諾する必要があります。オファーの有効期限が切れている場合は、アカウントエグゼクティブにお問い合わせください。

        </Admonition>

1. オファーの詳細を確認し、オファーを承諾します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択して必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![Xn6qwEcmihhj0LbwOXicnRgMnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/Xn6qwEcmihhj0LbwOXicnRgMnCh.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace には、"Y*our request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    ![TrnVwl8sHhW8yLbHI0bcVMO7ntf](https://zdoc-images.s3.us-west-2.amazonaws.com/TrnVwl8sHhW8yLbHI0bcVMO7ntf.png)

1. アカウントをセットアップします。

    リクエストが完了すると、AWS Marketplace ページ上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="注">

    この手順は必ず完了してください。そうしないと、プライベートオファーの購読はどの Zilliz Cloud organization にもリンクされません。

    </Admonition>

    ![PJGGwBu6nh8lSQbZK1ac2wfhn0d](https://zdoc-images.s3.us-west-2.amazonaws.com/PJGGwBu6nh8lSQbZK1ac2wfhn0d.png)

1. Marketplace の購読を Zilliz Cloud organization にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![Q6PDbtOwioM06kxe46ecIAKCnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/q6pdbtowiom06kxe46eciakcnmh.png "Q6PDbtOwioM06kxe46ecIAKCnMh")

    1. Marketplace の購読にリンクする Zilliz Cloud organization を選択します。

        選択可能な organization がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![HvVkbNvp9oe5wIxkdWvcDMWJnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/hvvkbnvp9oe5wixkdwvcdmwjnnc.png "HvVkbNvp9oe5wIxkdWvcDMWJnNc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![REvibD9Nvog0X9xsNGMcwrvynTg](https://zdoc-images.s3.us-west-2.amazonaws.com/revibd9nvog0x9xsngmcwrvyntg.png "REvibD9Nvog0X9xsNGMcwrvynTg")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを見つけます。ID アイコンにカーソルを合わせると、購読を確認できます。

        ![NjQObiKEco940qxMYSpc8g0mnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/njqobikeco940qxmyspc8g0mnhb.png "NjQObiKEco940qxMYSpc8g0mnHb")

</Procedures>

## プライベートオファーを更新する\{#renew-your-private-offer}

プライベートオファーの有効期限が近づくと、Zilliz は更新用の新しいプライベートオファーリンクを送信します。更新プロセスについて質問がある場合は、アカウントエグゼクティブにお問い合わせください。

<Admonition type="info" icon="📘" title="注">

AWS Marketplace では、更新は新しいプライベートオファーを承諾することとして機能します。承諾すると、新しいオファーが以前のオファーを自動的に置き換えます。その後も、新しいオファーを再度 Zilliz Cloud organization にリンクする必要があります。

</Admonition>

以下は、更新プロセスの概要です。

![GKcDwCIv4hVc12bEFPvcXshQniR](https://zdoc-images.s3.us-west-2.amazonaws.com/GKcDwCIv4hVc12bEFPvcXshQniR.png)

以下の詳細なステップバイステップガイドに従って、AWS Marketplace のプライベートオファーを購読できます。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **You have a new Private Offer** の AWS Marketplace からのメールを探します。メールには、そのオファーにアクセスできる AWS account ID が含まれています。

    1. メール内の **AWS Marketplace console private offers page** リンクをクリックします。求められたら、メールに表示されているものと同じ account ID で AWS にサインインしてください。

        ![GvHEwgn55hnE1fbRg1Mcg8UEnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/GvHEwgn55hnE1fbRg1Mcg8UEnOc.png)

1. AWS Marketplace ページの **Your offers** セクションに移動し、正しいオファーが選択されていることを確認します。**Offer ID** はメールに表示されている ID と一致している必要があります。

    "**Accepting this offer replaces your current agreement**" と表示されます。

    ![NLAjwwr9ahgutebTFJKcVyntnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/NLAjwwr9ahgutebTFJKcVyntnxb.png)

1. オファーの詳細を確認し、オファーを承諾します。

    請求書に発注書（PO）番号を含めるには、**Add a purchase order** を選択して必要な情報を入力します。発注書が不要な場合は、**No purchase order** を選択します。

    **Accept offer** をクリックします。

    ![YHQxwYXemhfrvubRftzcjBSPn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/YHQxwYXemhfrvubRftzcjBSPn7e.png)

1. リクエストが完了するまで待ちます。

    AWS Marketplace には、"*Your request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*" というメッセージが表示されます。

    <Admonition type="info" icon="📘" title="注">

    この時点では "Set up your account" をクリックしないでください。リクエストが完了するまで待ってください。
    
    リクエスト完了前にクリックすると、オファーを Zilliz Cloud organization にリンクする際に "No organization available" と表示される場合があります。これは、以前のプライベートオファーのリンク解除がまだ完了していないためです。

    </Admonition>

1. アカウントをセットアップします。

    リクエストが完了すると、AWS Marketplace ページ上部に緑色の確認バナーが表示されます。

    **Set up your account** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="注">

    この手順は必ず完了してください。そうしないと、プライベートオファーの購読はどの Zilliz Cloud organization にもリンクされません。

    </Admonition>

    ![SEMzwPBZNh5ejWbOOdAcmPJunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/SEMzwPBZNh5ejWbOOdAcmPJunRf.png)

1. Marketplace の購読を Zilliz Cloud organization にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![U3fHb1ZF1o9AWnxYyztcTcpBnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/u3fhb1zf1o9awnxyyztctcpbnxe.png "U3fHb1ZF1o9AWnxYyztcTcpBnXe")

    1. Marketplace の購読にリンクする Zilliz Cloud organization を選択します。

        選択可能な organization がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![KgGJbyKCsoT15cxTzgDcsadWnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/kggjbykcsot15cxtzgdcsadwnhc.png "KgGJbyKCsoT15cxTzgDcsadWnHc")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![Rbp1bcYjJoFfyjxf2s7cLO8KnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/rbp1bcyjjoffyjxf2s7clo8knqh.png "Rbp1bcYjJoFfyjxf2s7cLO8KnQh")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを見つけます。ID アイコンにカーソルを合わせると、購読を確認できます。

        ![G15cbgalfoDgRExOSBWcfbzlnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/g15cbgalfodgrexosbwcfbzlnxd.png "G15cbgalfoDgRExOSBWcfbzlnxd")

</Procedures>

## パブリックオファーからプライベートオファーに切り替える\{#switch-from-a-public-offer-to-a-private-offer}

[プライベートオファーの更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)と同様に、パブリックオファーからプライベートオファーへの切り替えでは、新しいプライベートオファーを承諾する必要があります。承諾すると、新しいプライベートオファーが以前のパブリックオファーを自動的に置き換えます。その後も、新しいオファーを再度 Zilliz Cloud organization にリンクする必要があります。

## プライベートオファーの購読をキャンセルする\{#cancel-private-offer-subscription}

AWS Marketplace からプライベートオファーの購読をキャンセルできます。 

<Admonition type="info" icon="📘" title="注">

購読をキャンセルすると、organization は Zilliz Cloud の高度な機能へのアクセスを失います。organization に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、即座に凍結されます。

</Admonition>

<Procedures>

1. プライベートオファーを承諾した AWS account にサインインします。

1. AWS Marketplace コンソールを開き、**Manage subscriptions** に移動します。

1. Zilliz Cloud の購読を見つけて、契約 ID をクリックします。

1. **Agreement** の下で **Actions** リストを開き、**Cancel subscription** を選択します。

1. **Cancel subscription** ダイアログボックスで **confirm** と入力し、**Yes, cancel subscription** を選択します。

</Procedures>

詳細については、[製品購読のキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html)を参照してください。

## FAQ\{#faq}

**プライベートオファーの有効期限が切れ、更新されなかった場合はどうなりますか？**

プライベートオファーの有効期限が切れて更新されない場合、AWS Marketplace の購読はプライベートオファーの条件を失います。Zilliz Cloud organization で有効な支払い方法または残りのクレジットが利用できない場合、高度な機能へのアクセスが無効になり、organization は凍結されます。

**Marketplace の購読を Zilliz Cloud にリンクする際に、利用可能な organization がない場合はどうすればよいですか？**

考えられる理由はいくつかあります。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない organization の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    Marketplace の購読に organization をリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみである場合は、必要な権限がありません。支援が必要な場合は、organization owner にお問い合わせください。

- **すべての organization がすでに Marketplace の購読に正常にリンクされている**

    これは、すべての organization がすでに Marketplace の購読にリンクされている場合に発生することがあります。利用できない organization の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の marketplace 購読を更新する必要がある場合は、まずその organization の現在の購読をリンク解除してから、新しい購読をセットアップしてください。

    - 異なる Marketplace 購読用に複数の organization が必要な場合は、[organization を作成](./organization-settings#create-an-organization)できます。

- **リストに organization がない**

    - これは、アカウントが閉鎖されている場合、またはすべての organization から離脱している場合に発生することがあります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のことができます。

    - [新しい organization を作成](./organization-settings#create-an-organization)。

    - 他のユーザーに、自分をその organization に[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらいます。

