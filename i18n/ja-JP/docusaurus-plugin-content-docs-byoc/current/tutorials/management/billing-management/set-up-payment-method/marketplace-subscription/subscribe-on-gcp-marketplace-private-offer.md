---
title: "Google Cloud Marketplace でプライベート オファーを購読する | BYOC"
slug: /subscribe-on-gcp-marketplace-private-offer
sidebar_label: "Google Cloud Marketplace（プライベート オファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Google Cloud Marketplace のプライベート オファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。Google Cloud Marketplace の製品ページに表示される標準的な価格と条件が適用されるパブリック オファーとは異なり、プライベート オファーでは交渉済みの価格、カスタム契約条件、特定の契約期間、定義された支払いスケジュールを含めることができます。 | BYOC"
type: origin
token: Fd8EwsD0JiIt98kmps4c5wGlnrh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace でプライベート オファーを購読する

Google Cloud Marketplace のプライベート オファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。Google Cloud Marketplace の製品ページに表示される標準的な価格と条件が適用されるパブリック オファーとは異なり、プライベート オファーでは交渉済みの価格、カスタム契約条件、特定の契約期間、定義された支払いスケジュールを含めることができます。

Zilliz Cloud のプライベート オファーが必要な場合は、[Zilliz のアカウント エグゼクティブにお問い合わせください](https://zilliz.com/contact-sales)。その際、オファーの受信用として Google Cloud Billing アカウント ID とメールアドレス、希望する契約期間、利用要件、および組織で必要な調達や請求に関する要件をお伝えください。

このガイドでは、Google Cloud Marketplace で Zilliz Cloud のプライベート オファーを受け入れ、それを Zilliz Cloud 組織にリンクする手順について説明します。

## 開始前に\{#before-you-start}

プライベート オファーを受け入れる前に、以下の点を確認してください。

- 有料の Google Cloud Billing アカウントを持っていること。無料トライアルの Google Cloud Billing アカウントは使用できません。

- Cloud Billing アカウントに対して、以下のいずれかの権限を持っていること。

    - Billing Account Administrator（`roles/billing.admin`）

    - Billing Account User（`roles/billing.user`）および Consumer Procurement Order Administrator（`roles/consumerprocurement.orderAdmin`）

    必要な権限を持っていない場合は、Billing Administrator または Organization Administrator にアクセス権の付与、またはオファーの代理受け入れを依頼してください。

- Zilliz Cloud 上で Organization Owner または Organization Billing Admin であること。これらの権限は、Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクするために必要です。

## プライベート オファーを購読する\{#subscribe-to-a-private-offer}

以下は、サブスクリプション登録プロセスの概要です。

![YSY9wG2TNhNlvMbFCZ9cLrIDnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YSY9wG2TNhNlvMbFCZ9cLrIDnDh.png)

以下の詳細なステップバイステップ ガイドに従って、Google Cloud Marketplace でプライベート オファーを購読できます。

<Procedures>

1. プライベート オファーについて Zilliz のアカウント エグゼクティブに連絡します。

    [Zilliz のアカウント エグゼクティブに連絡する](https://zilliz.com/contact-sales)際は、プライベート オファーを受け取るための [Google Cloud Billing アカウント ID](https://docs.cloud.google.com/billing/docs/how-to/find-billing-account-id) とメールアドレスを提供する必要があります。

1. メールの受信トレイを確認します。

    件名が **New Private Offer from Zilliz** となっている Google Cloud Marketplace からのメールを探し、メール内の **Review Offer** ボタンをクリックします。

    ![Oawqwr3rDheYWibpPwQclqh0n3d](https://zdoc-images.s3.us-west-2.amazonaws.com/Oawqwr3rDheYWibpPwQclqh0n3d.png)

    <Admonition type="info" icon="📘" title="Note">

    有効期限までにオファーを受け入れる必要があります。オファーの有効期限が切れている場合は、アカウント エグゼクティブにお問い合わせください。

    </Admonition>

1. オファーの詳細を確認し、オファーを受け入れます。

    ![NGJ1w2fVKh9ED1bMqK4cuzq2n5w](https://zdoc-images.s3.us-west-2.amazonaws.com/NGJ1w2fVKh9ED1bMqK4cuzq2n5w.png)

1. Zilliz にサインアップします。

    オファーの購入が完了すると、**Accepted! Now sign up with Zilliz** というタイトルのダイアログ ボックスがページに表示されます。

    **Sign up** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順は必ず完了してください。完了しない場合、プライベート オファーのサブスクリプションがどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![IOkkwz2A6hexfnbiBBfcGGmNnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/IOkkwz2A6hexfnbiBBfcGGmNnxc.png)

1. Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![WZuibFtHLofsE5xOfTPccb4Xnxe](https://zdoc-images.s3.us-west-2.amazonaws.com/wzuibfthlofse5xoftpccb4xnxe.png "WZuibFtHLofsE5xOfTPccb4Xnxe")

    1. Marketplace のサブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択できる組織がない場合、またはご不明な点がある場合は、[Zilliz サポート](http://support.zilliz.com)にお問い合わせください。

        ![EGjCbIHRGoDylPxCNQdc4YT6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/egjcbihrgodylpxcnqdc4yt6ntd.png "EGjCbIHRGoDylPxCNQdc4YT6nTd")

    1. プロセスが完了すると、以下の確認ウィンドウが表示されます。

        ![Hcy6bjddpoGiJfxszMBccAalnoe](https://zdoc-images.s3.us-west-2.amazonaws.com/hcy6bjddpogijfxszmbccaalnoe.png "Hcy6bjddpoGiJfxszMBccAalnoe")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを見つけます。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![XoiTbm6HzoZMCMxCttVco12GnAn](https://zdoc-images.s3.us-west-2.amazonaws.com/xoitbm6hzozmcmxcttvco12gnan.png "XoiTbm6HzoZMCMxCttVco12GnAn")

</Procedures>

## プライベート オファーを更新する\{#renew-your-private-offer}

プライベート オファーの有効期限が近づくと、Zilliz から更新用の新しいプライベート オファー リンクが送信されます。更新プロセスについてご質問がある場合は、アカウント エグゼクティブにお問い合わせください。

<Admonition type="info" icon="📘" title="Note">

Google Cloud Marketplace では、更新は既存のプライベート オファー注文で処理されます。更新が有効になると、現在のプライベート オファー サブスクリプションから継続されるため、サブスクリプションを Zilliz Cloud 組織に再度リンクする必要はありません。

</Admonition>

以下は、更新プロセスの概要です。

![CbdUwGifPh2rvFbk0F4c1OVFnxh](https://zdoc-images.s3.us-west-2.amazonaws.com/CbdUwGifPh2rvFbk0F4c1OVFnxh.png)

以下の詳細なステップバイステップ ガイドに従って、Google Cloud Marketplace でプライベート オファーを更新できます。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **New Private Offer from Zilliz** となっている Google Cloud Marketplace からのメールを探し、メール内の **Review Offer** ボタンをクリックします。

        ![DYogwUgizhEYNnbIks9cqZVcn1f](https://zdoc-images.s3.us-west-2.amazonaws.com/DYogwUgizhEYNnbIks9cqZVcn1f.png)

1. オファーの詳細を確認し、オファーを受け入れます。

    ![Y6cAwGfu0hBF5obUyWScaR63njf](https://zdoc-images.s3.us-west-2.amazonaws.com/Y6cAwGfu0hBF5obUyWScaR63njf.png)

1. オファーが正常に更新されました。

    **Amendment request sent to Zilliz** というタイトルのダイアログ ボックスが表示されると、Zilliz Cloud での更新プロセスは完了です。

    ![O7r8wYN4lhED5qbVkrScNkpAned](https://zdoc-images.s3.us-west-2.amazonaws.com/O7r8wYN4lhED5qbVkrScNkpAned.png)

1. 更新内容を確認します。

    1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。請求アカウントを選択し、注文 ID をクリックして詳細を表示します。

        ![A3piwyJD6hz3qwbzry0cAYSunRc](https://zdoc-images.s3.us-west-2.amazonaws.com/A3piwyJD6hz3qwbzry0cAYSunRc.png)

    1. **Key Events** セクションで、既存の注文が正常に変更され、プライベート オファーが新しい契約終了日で更新されたことを確認できます。

        ![SlGfwioVMhP8uqbFi0ucDEMOnmd](https://zdoc-images.s3.us-west-2.amazonaws.com/SlGfwioVMhP8uqbFi0ucDEMOnmd.png)

</Procedures>

## パブリック オファーからプライベート オファーへの切り替え\{#switch-from-a-public-offer-to-a-private-offer}

[プライベート オファーの更新](./subscribe-on-gcp-marketplace-private-offer#renew-your-private-offer)と同様に、パブリック オファーからプライベート オファーへ切り替えるには、新しいプライベート オファーを受け入れる必要があります。受け入れると、新しいプライベート オファーが以前のパブリック オファーに自動的に置き換わります。ただし、新しいオファーを Zilliz Cloud 組織に再度リンクする必要があります。

## プライベート オファーの購読をキャンセルする\{#cancel-private-offer-subscription}

プライベート オファーの購読は、Google Cloud Marketplace からキャンセルできます。

<Admonition type="info" icon="📘" title="Note">

購読をキャンセルすると、組織は高度な Zilliz Cloud 機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. 該当する **Cloud Billing account** を選択します。

1. プライベート オファーの注文を探します。

1. **Actions** で **Contact support** をクリックします。Zilliz Cloud サポート ポータルにリダイレクトされるので、有効なプライベート オファー注文のキャンセルを依頼するチケットを作成します。

    担当のアカウント エグゼクティブに連絡してキャンセルを依頼することもできます。

1. Zilliz がキャンセル リクエストを処理した後、Cloud Marketplace で注文をキャンセルできる旨の通知が Google Cloud に届きます。

</Procedures>

詳細については、[Manage your accepted offers](https://docs.cloud.google.com/marketplace/docs/offers/manage-accepted-offer) を参照してください。

## FAQ\{#faq}

**プライベート オファーの有効期限が切れ、更新されない場合はどうなりますか？**

プライベート オファーが更新されずに有効期限を迎えた場合、Google Cloud Marketplace の購読からプライベート オファーの条件が失われます。Zilliz Cloud 組織に有効な支払い方法や残りのクレジットがない場合、高度な機能へのアクセスが無効になり、組織は凍結されます。

**プライベート オファーを承諾したものの、Zilliz Cloud でのサインアップを完了しなかった場合はどうなりますか？**

プライベート オファーを承諾しても **Sign up with Zilliz Cloud** を完了しない場合、Marketplace の購読は作成されますが、どの Zilliz Cloud 組織にもリンクされません。その結果、組織はプライベート オファーを支払い方法として使用できません。

セットアップを完了するには、次の手順を実行します。

<Procedures>

1. **Google Cloud Marketplace > Your orders** に移動し、Zilliz Cloud の注文を探して製品名をクリックします。

    ![YgzQwi6xDh8eVFbgOSLcNElVnNh](https://zdoc-images.s3.us-west-2.amazonaws.com/YgzQwi6xDh8eVFbgOSLcNElVnNh.png)

1. **Manage on provider** をクリックします。

    ![GO3bwCnjWhyzT0bZCk3cpyHonPH](https://zdoc-images.s3.us-west-2.amazonaws.com/GO3bwCnjWhyzT0bZCk3cpyHonPH.png)

1. Zilliz Cloud にリダイレクトされます。Zilliz Cloud で操作を完了してください。

    ![RYtsbHgYUoaFBuxOspXcxIlrn5b](https://zdoc-images.s3.us-west-2.amazonaws.com/rytsbhgyuoafbuxospxcxilrn5b.png "RYtsbHgYUoaFBuxOspXcxIlrn5b")

</Procedures>

**マーケットプレイスの購読を Zilliz Cloud にリンクする際に、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です**

    十分な権限がない場合に発生する可能性があります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織をマーケットプレイスの購読にリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみの場合は必要な権限がないため、組織のオーナーにお問い合わせください。

- **すべての組織が既に Marketplace の購読にリンクされています**

    すべての組織が既に Marketplace の購読にリンクされている場合に発生する可能性があります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、以下の対応を行ってください。

    - 既存のマーケットプレイス購読を更新する必要がある場合は、まず組織の現在の購読のリンクを解除してから、新しい購読を設定してください。

    - 異なる Marketplace 購読用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がありません**

    - アカウントが閉鎖された場合や、すべての組織から退会した場合に発生する可能性があります。UI は次のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、次のいずれかの操作を行えます。

    - [新しい組織を作成](./organization-settings#create-an-organization)します。

    - 他のユーザーに、自分の組織への[招待](./manage-platform-users#invite-organization-users)と Organization Owner ロールの付与を依頼します。

