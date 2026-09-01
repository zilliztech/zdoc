---
title: "Google Cloud Marketplace でプライベートオファーに登録する | BYOC"
slug: /subscribe-on-gcp-marketplace-private-offer
sidebar_label: "Google Cloud Marketplace（プライベートオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Google Cloud Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。商品ページに記載された標準価格・条件が適用されるパブリックオファーとは異なり、プライベートオファーでは個別交渉による価格、カスタム契約条件、特定の契約期間、支払いスケジュールなどを設定できます。 | BYOC"
type: origin
token: Fd8EwsD0JiIt98kmps4c5wGlnrh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace でプライベートオファーに登録する

Google Cloud Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。商品ページに記載された標準価格・条件が適用されるパブリックオファーとは異なり、プライベートオファーでは個別交渉による価格、カスタム契約条件、特定の契約期間、支払いスケジュールなどを設定できます。

Zilliz Cloud 向けのプライベートオファーをご希望の場合は、[Zilliz のアカウントエグゼクティブにお問い合わせください](https://zilliz.com/contact-sales)。その際、オファーの受取先となる Google Cloud Billing アカウント ID とメールアドレス、ご希望の契約期間、利用要件、および組織として必要な調達・請求関連の要件をお知らせください。

このガイドでは、Google Cloud Marketplace で Zilliz Cloud のプライベートオファーを承諾し、Zilliz Cloud 組織にリンクする手順を説明します。

## 事前準備\{#before-you-start}

プライベートオファーを承諾する前に、以下の条件を満たしていることを確認してください。

- 有料の Google Cloud Billing アカウントを保有していること。無料トライアルの Google Cloud Billing アカウントは使用できません。

- Cloud Billing アカウントに対して、以下のいずれかの権限を持っていること。

    - Billing Account Administrator (`roles/billing.admin`)

    - Billing Account User (`roles/billing.user`) および Consumer Procurement Order Administrator (`roles/consumerprocurement.orderAdmin`)

    必要な権限がない場合は、Billing Administrator または Organization Administrator にアクセス権の付与、またはオファーの承諾を依頼してください。

- Zilliz Cloud で Organization Owner または Organization Billing Admin の権限を持っていること。Marketplace サブスクリプションを Zilliz Cloud 組織にリンクするには、これらの権限が必要です。

## プライベートオファーへの登録\{#subscribe-to-a-private-offer}

以下に登録プロセスの概要を示します。

![YSY9wG2TNhNlvMbFCZ9cLrIDnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YSY9wG2TNhNlvMbFCZ9cLrIDnDh.png)

Google Cloud Marketplace でプライベートオファーに登録するには、以下の詳細な手順に従ってください。

<Procedures>

1. Zilliz のアカウントエグゼクティブに連絡し、プライベートオファーを依頼します。

    [Zilliz のアカウントエグゼクティブに連絡する](https://zilliz.com/contact-sales)際は、[Google Cloud Billing アカウント ID](https://docs.cloud.google.com/billing/docs/how-to/find-billing-account-id) と、プライベートオファーの受取先メールアドレスをお知らせください。

1. メールの受信トレイを確認します。

    件名が **New Private Offer from Zilliz** の Google Cloud Marketplace からのメールを探し、メール内の **Review Offer** ボタンをクリックします。

    ![Oawqwr3rDheYWibpPwQclqh0n3d](https://zdoc-images.s3.us-west-2.amazonaws.com/Oawqwr3rDheYWibpPwQclqh0n3d.png)

    <Admonition type="info" icon="📘" title="Note">

    オファーは有効期限までに承諾する必要があります。期限切れになった場合は、アカウントエグゼクティブにお問い合わせください。

    </Admonition>

1. オファーの内容を確認し、承諾します。

    ![NGJ1w2fVKh9ED1bMqK4cuzq2n5w](https://zdoc-images.s3.us-west-2.amazonaws.com/NGJ1w2fVKh9ED1bMqK4cuzq2n5w.png)

1. Zilliz にサインアップします。

    オファーの購入が完了すると、**Accepted! Now sign up with Zilliz** というタイトルのダイアログボックスが表示されます。

    **Sign up** をクリックすると、Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必須です。完了しない場合、プライベートオファーのサブスクリプションが Zilliz Cloud 組織にリンクされません。

    </Admonition>

    ![IOkkwz2A6hexfnbiBBfcGGmNnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/IOkkwz2A6hexfnbiBBfcGGmNnxc.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![WZuibFtHLofsE5xOfTPccb4Xnxe](https://zdoc-images.s3.us-west-2.amazonaws.com/wzuibfthlofse5xoftpccb4xnxe.png "WZuibFtHLofsE5xOfTPccb4Xnxe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択可能な組織がない場合やご不明な点がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![EGjCbIHRGoDylPxCNQdc4YT6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/egjcbihrgodylpxcnqdc4yt6ntd.png "EGjCbIHRGoDylPxCNQdc4YT6nTd")

    1. 処理が完了すると、以下の確認ウィンドウが表示されます。

        ![Hcy6bjddpoGiJfxszMBccAalnoe](https://zdoc-images.s3.us-west-2.amazonaws.com/hcy6bjddpogijfxszmbccaalnoe.png "Hcy6bjddpoGiJfxszMBccAalnoe")

    1. Zilliz Cloud の **Billing** ページにある **Payment Method** セクションで、ID アイコンにカーソルを合わせるとサブスクリプションを確認できます。

        ![XoiTbm6HzoZMCMxCttVco12GnAn](https://zdoc-images.s3.us-west-2.amazonaws.com/xoitbm6hzozmcmxcttvco12gnan.png "XoiTbm6HzoZMCMxCttVco12GnAn")

</Procedures>

## プライベートオファーの更新\{#renew-your-private-offer}

プライベートオファーの有効期限が近づくと、Zilliz から更新用の新しいプライベートオファーリンクが送信されます。更新手続きについてご質問がある場合は、アカウントエグゼクティブにお問い合わせください。

<Admonition type="info" icon="📘" title="Note">

Google Cloud Marketplace では、更新は既存のプライベートオファー注文に対して行われます。更新が有効になると現在のプライベートオファーサブスクリプションから継続されるため、サブスクリプションを Zilliz Cloud 組織に再度リンクする必要はありません。

</Admonition>

以下に更新プロセスの概要を示します。

![CbdUwGifPh2rvFbk0F4c1OVFnxh](https://zdoc-images.s3.us-west-2.amazonaws.com/CbdUwGifPh2rvFbk0F4c1OVFnxh.png)

Google Cloud Marketplace でプライベートオファーを更新するには、以下の詳細な手順に従ってください。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **New Private Offer from Zilliz** の Google Cloud Marketplace からのメールを探し、メール内の **Review Offer** ボタンをクリックします。

        ![DYogwUgizhEYNnbIks9cqZVcn1f](https://zdoc-images.s3.us-west-2.amazonaws.com/DYogwUgizhEYNnbIks9cqZVcn1f.png)

1. オファーの内容を確認し、承諾します。

    ![Y6cAwGfu0hBF5obUyWScaR63njf](https://zdoc-images.s3.us-west-2.amazonaws.com/Y6cAwGfu0hBF5obUyWScaR63njf.png)

1. オファーが正常に更新されました。

    **Amendment request sent to Zilliz** というタイトルのダイアログボックスが表示されたら、Zilliz Cloud での更新プロセスは完了です。

    ![O7r8wYN4lhED5qbVkrScNkpAned](https://zdoc-images.s3.us-west-2.amazonaws.com/O7r8wYN4lhED5qbVkrScNkpAned.png)

1. 更新内容を確認します。

    1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動し、請求先アカウントを選択してから注文 ID をクリックして詳細を表示します。

        ![A3piwyJD6hz3qwbzry0cAYSunRc](https://zdoc-images.s3.us-west-2.amazonaws.com/A3piwyJD6hz3qwbzry0cAYSunRc.png)

    1. **Key Events** セクションで、既存の注文が正常に変更され、プライベートオファーが新しい契約終了日で更新されたことを確認できます。

        ![SlGfwioVMhP8uqbFi0ucDEMOnmd](https://zdoc-images.s3.us-west-2.amazonaws.com/SlGfwioVMhP8uqbFi0ucDEMOnmd.png)

</Procedures>

## パブリックオファーからプライベートオファーへの切り替え\{#switch-from-a-public-offer-to-a-private-offer}

[プライベートオファーの更新](./subscribe-on-gcp-marketplace-private-offer#renew-your-private-offer)と同様に、パブリックオファーからプライベートオファーへ切り替える場合も、新しいプライベートオファーを承諾する必要があります。承諾後、新しいプライベートオファーが以前のパブリックオファーを自動的に置き換えます。なお、新しいオファーを Zilliz Cloud 組織に再度リンクする必要があります。

## プライベートオファーのサブスクリプションを解約する\{#cancel-private-offer-subscription}

プライベートオファーのサブスクリプションは、Google Cloud Marketplace から解約できます。

<Admonition type="info" icon="📘" title="Note">

サブスクリプションを解約すると、組織は Zilliz Cloud の高度な機能を利用できなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、組織が直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. 該当する **Cloud Billing アカウント** を選択します。

1. プライベートオファーの注文を探します。

1. **Actions** で **Contact support** をクリックします。Zilliz Cloud サポートポータルにリダイレクトされるので、有効なプライベートオファー注文の解約を依頼するチケットを作成します。

    また、アカウントエグゼクティブに連絡して解約を依頼することもできます。

1. Zilliz が解約リクエストを処理した後、Cloud Marketplace で注文を解約できることを知らせる通知が Google Cloud に届きます。

</Procedures>

詳細については、[承諾済みオファーの管理](https://docs.cloud.google.com/marketplace/docs/offers/manage-accepted-offer) を参照してください。

## FAQ\{#faq}

**プライベートオファーの有効期限が切れて更新されない場合はどうなりますか？**

プライベートオファーが更新されずに有効期限を迎えた場合、Google Cloud Marketplace のサブスクリプションからプライベートオファーの条件が失われます。お客様の Zilliz Cloud 組織に有効な支払い方法や残りのクレジットがない場合、高度な機能へのアクセスが無効になり、組織は凍結されます。

**プライベートオファーを承諾したものの、Zilliz Cloud でのサインアップを完了しない場合はどうなりますか？**

プライベートオファーを承諾しても **Zilliz Cloud でのサインアップ** を完了しない場合、Marketplace サブスクリプションは作成されますが、どの Zilliz Cloud 組織にもリンクされません。その結果、組織はプライベートオファーを支払い方法として使用できません。

セットアップを完了するには、次の手順を実行します。

<Procedures>

1. **Google Cloud Marketplace > Your orders** に移動し、Zilliz Cloud の注文を見つけてプロダクト名をクリックします。

    ![YgzQwi6xDh8eVFbgOSLcNElVnNh](https://zdoc-images.s3.us-west-2.amazonaws.com/YgzQwi6xDh8eVFbgOSLcNElVnNh.png)

1. **Manage on provider** をクリックします。

    ![GO3bwCnjWhyzT0bZCk3cpyHonPH](https://zdoc-images.s3.us-west-2.amazonaws.com/GO3bwCnjWhyzT0bZCk3cpyHonPH.png)

1. Zilliz Cloud にリダイレクトされます。Zilliz Cloud で操作を完了してください。

    ![RYtsbHgYUoaFBuxOspXcxIlrn5b](https://zdoc-images.s3.us-west-2.amazonaws.com/rytsbhgyuoafbuxospxcxilrn5b.png "RYtsbHgYUoaFBuxOspXcxIlrn5b")

</Procedures>

**Marketplace サブスクリプションを Zilliz Cloud にリンクする際に利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足**

    十分な権限がない場合に発生します。利用できない組織の横に **「Insufficient Permissions」** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。Organization Member のみの場合は必要な権限がないため、組織の所有者に問い合わせてください。

- **すべての組織がすでに Marketplace サブスクリプションにリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。利用できない組織の横に **「Marketplace Linked」** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合は、以下の対応を行ってください。

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織が表示されない**

    - アカウントが閉鎖されている場合や、すべての組織から退出している場合に発生します。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合は、次のいずれかの操作が可能です。

    - [新しい組織を作成](./organization-settings#create-an-organization)する。

    - 他のユーザーに、各自の組織へ[招待](./manage-platform-users#invite-organization-members)してもらい、Organization Owner ロールを付与してもらう。
