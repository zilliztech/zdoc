---
title: "Google Cloud Marketplace でプライベートオファーにサブスクライブする | Cloud"
slug: /subscribe-on-gcp-marketplace-private-offer
sidebar_label: "Google Cloud Marketplace（プライベートオファー）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Google Cloud Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。Google Cloud Marketplace の製品ページに表示される標準価格と条件を使用する公開オファーとは異なり、プライベートオファーには、交渉済みの価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | Cloud"
type: origin
token: Fd8EwsD0JiIt98kmps4c5wGlnrh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace でプライベートオファーにサブスクライブする

Google Cloud Marketplace のプライベートオファーは、Zilliz がお客様の組織向けに作成するカスタム購入オプションです。Google Cloud Marketplace の製品ページに表示される標準価格と条件を使用する公開オファーとは異なり、プライベートオファーには、交渉済みの価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。

Zilliz Cloud のプライベートオファーが必要な場合は、[Zilliz のアカウント担当者にお問い合わせください](https://zilliz.com/contact-sales)。オファーを受け取る Google Cloud Billing アカウント ID とメールアドレス、想定される契約期間、使用要件、および組織で含める必要のある調達または請求要件を提供してください。

このガイドでは、Google Cloud Marketplace で Zilliz Cloud のプライベートオファーを承認し、それを Zilliz Cloud 組織にリンクする方法を説明します。

## 開始する前に\{#before-you-start}

プライベートオファーを承認する前に、以下を確認してください。

- 有料の Google Cloud Billing アカウントを持っていること。Free Trial Google Cloud Billing アカウントは使用できません。

- Cloud Billing アカウントに対して、以下のいずれかの必要な権限を持っていること。

    - Billing Account Administrator (`roles/billing.admin`)

    - Billing Account User (`roles/billing.user`) および Consumer Procurement Order Administrator (`roles/consumerprocurement.orderAdmin`)

    必要な権限がない場合は、Billing Administrator または Organization Administrator にアクセス権の付与、または代わりにオファーを承認してもらうよう依頼してください。

- Zilliz Cloud で Organization Owner または Organization Billing Admin であること。これらの権限は、Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクするために必要です。

## プライベートオファーにサブスクライブする\{#subscribe-to-a-private-offer}

以下はサブスクリプションプロセスの概要です。

![YSY9wG2TNhNlvMbFCZ9cLrIDnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YSY9wG2TNhNlvMbFCZ9cLrIDnDh.png)

以下の詳細なステップバイステップガイドに従って、Google Cloud Marketplace でプライベートオファーにサブスクライブできます。

<Procedures>

1. プライベートオファーについて Zilliz のアカウント担当者に連絡します。

    [Zilliz のアカウント担当者に問い合わせる](https://zilliz.com/contact-sales)際には、プライベートオファーを受け取るための [Google Cloud Billling account ID](https://docs.cloud.google.com/billing/docs/how-to/find-billing-account-id) とメールアドレスを提供する必要があります。 

1. メールの受信トレイを確認します。

    件名が **New Private Offer from Zilliz** の Google Cloud Marketplace からのメールを探してください。メール内の **Review Offer** ボタンをクリックします。

    ![Oawqwr3rDheYWibpPwQclqh0n3d](https://zdoc-images.s3.us-west-2.amazonaws.com/Oawqwr3rDheYWibpPwQclqh0n3d.png)

    <Admonition type="info" icon="📘" title="Note">

    オファーの有効期限までに承認する必要があります。オファーの期限が切れている場合は、アカウント担当者に連絡してください。

    </Admonition>

1. オファーの詳細を確認し、オファーを承認します。

    ![NGJ1w2fVKh9ED1bMqK4cuzq2n5w](https://zdoc-images.s3.us-west-2.amazonaws.com/NGJ1w2fVKh9ED1bMqK4cuzq2n5w.png)

1. Zilliz にサインアップします。

    オファーの購入が完了すると、ページに **Accepted! Now sign up with Zilliz** というタイトルのダイアログボックスが表示されます。

    **Sign up** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    この手順を完了する必要があります。完了しない場合、プライベートオファーのサブスクリプションはどの Zilliz Cloud 組織にもリンクされません。

    </Admonition>

    ![IOkkwz2A6hexfnbiBBfcGGmNnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/IOkkwz2A6hexfnbiBBfcGGmNnxc.png)

1. Marketplace のサブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![WZuibFtHLofsE5xOfTPccb4Xnxe](https://zdoc-images.s3.us-west-2.amazonaws.com/wzuibfthlofse5xoftpccb4xnxe.png "WZuibFtHLofsE5xOfTPccb4Xnxe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択可能な組織がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![EGjCbIHRGoDylPxCNQdc4YT6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/egjcbihrgodylpxcnqdc4yt6ntd.png "EGjCbIHRGoDylPxCNQdc4YT6nTd")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![Hcy6bjddpoGiJfxszMBccAalnoe](https://zdoc-images.s3.us-west-2.amazonaws.com/hcy6bjddpogijfxszmbccaalnoe.png "Hcy6bjddpoGiJfxszMBccAalnoe")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを確認します。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![XoiTbm6HzoZMCMxCttVco12GnAn](https://zdoc-images.s3.us-west-2.amazonaws.com/xoitbm6hzozmcmxcttvco12gnan.png "XoiTbm6HzoZMCMxCttVco12GnAn")

</Procedures>

## プライベートオファーを更新する\{#renew-your-private-offer}

プライベートオファーの有効期限が近づくと、Zilliz は更新用の新しいプライベートオファーリンクを送信します。更新プロセスについて質問がある場合は、アカウント担当者にお問い合わせください。

<Admonition type="info" icon="📘" title="Note">

Google Cloud Marketplace では、更新は既存のプライベートオファー注文に対して処理されます。更新が有効になると、現在のプライベートオファーのサブスクリプションから継続されるため、サブスクリプションを再度 Zilliz Cloud 組織にリンクする必要はありません。

</Admonition>

以下は更新プロセスの概要です。 

![CbdUwGifPh2rvFbk0F4c1OVFnxh](https://zdoc-images.s3.us-west-2.amazonaws.com/CbdUwGifPh2rvFbk0F4c1OVFnxh.png)

以下の詳細なステップバイステップガイドに従って、Google Cloud Marketplace でプライベートオファーにサブスクライブできます。

<Procedures>

1. メールの受信トレイを確認します。

    1. 件名が **New Private Offer from Zilliz** の Google Cloud Marketplace からのメールを探してください。メール内の **Review Offer** ボタンをクリックします。

        ![DYogwUgizhEYNnbIks9cqZVcn1f](https://zdoc-images.s3.us-west-2.amazonaws.com/DYogwUgizhEYNnbIks9cqZVcn1f.png)

1. オファーの詳細を確認し、オファーを承認します。

    ![Y6cAwGfu0hBF5obUyWScaR63njf](https://zdoc-images.s3.us-west-2.amazonaws.com/Y6cAwGfu0hBF5obUyWScaR63njf.png)

1. オファーは正常に更新されます。

    **Amendment request sent to Zilliz** というタイトルのダイアログボックスが表示されたら、Zilliz Cloud での更新プロセスは完了です。

    ![O7r8wYN4lhED5qbVkrScNkpAned](https://zdoc-images.s3.us-west-2.amazonaws.com/O7r8wYN4lhED5qbVkrScNkpAned.png)

1. 更新を確認します。

    1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動できます。billing account を選択し、order ID をクリックして詳細を表示します。

        ![A3piwyJD6hz3qwbzry0cAYSunRc](https://zdoc-images.s3.us-west-2.amazonaws.com/A3piwyJD6hz3qwbzry0cAYSunRc.png)

    1. **Key Events** セクションで、既存の order が正常に修正され、プライベートオファーが新しい契約終了日で更新されたことを確認できます。

        ![SlGfwioVMhP8uqbFi0ucDEMOnmd](https://zdoc-images.s3.us-west-2.amazonaws.com/SlGfwioVMhP8uqbFi0ucDEMOnmd.png)

</Procedures>

## 公開オファーからプライベートオファーに切り替える\{#switch-from-a-public-offer-to-a-private-offer}

[プライベートオファーの更新](./subscribe-on-gcp-marketplace-private-offer#renew-your-private-offer)と同様に、公開オファーからプライベートオファーに切り替えるには、新しいプライベートオファーを承認する必要があります。承認後、新しいプライベートオファーが以前の公開オファーを自動的に置き換えます。また、新しいオファーを再度 Zilliz Cloud 組織にリンクする必要があります。

## プライベートオファーのサブスクリプションをキャンセルする\{#cancel-private-offer-subscription}

Google Cloud Marketplace からプライベートオファーのサブスクリプションをキャンセルできます。 

<Admonition type="info" icon="📘" title="Note">

サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットの有効期限が切れている場合は、直ちに凍結されます。

</Admonition>

<Procedures>

1. [Google Cloud Orders](https://console.cloud.google.com/marketplace/orders) ページに移動します。

1. 該当する **Cloud Billing account** を選択します。

1. プライベートオファーの order を見つけます。

1. **Actions** で **Contact support** をクリックします。Zilliz Cloud Support portal にリダイレクトされます。アクティブなプライベートオファー order のキャンセルをリクエストするチケットを作成してください。

    キャンセルをリクエストするには、アカウント担当者に連絡することもできます。

1. Zilliz がキャンセルリクエストを処理すると、Cloud Marketplace で order をキャンセルできるという通知を Google Cloud で受け取ります。

</Procedures>

詳細については、[承認済みオファーを管理する](https://docs.cloud.google.com/marketplace/docs/offers/manage-accepted-offer)を参照してください。

## FAQ\{#faq}

**プライベートオファーの有効期限が切れ、更新されなかった場合はどうなりますか？**

プライベートオファーの有効期限が切れて更新されない場合、Google Cloud Marketplace のサブスクリプションはプライベートオファー条件を失います。Zilliz Cloud 組織で有効な支払い方法または残りのクレジットが利用できない場合、高度な機能へのアクセスは無効になり、組織は凍結されます。

**プライベートオファーを承認したが、Zilliz Cloud での Sign up を完了しなかった場合はどうなりますか？**

プライベートオファーを承認しても **Sign up with Zilliz Cloud** を完了しない場合、Marketplace のサブスクリプションは作成されますが、どの Zilliz Cloud 組織にもリンクされません。その結果、組織はプライベートオファーを支払い方法として使用できません。

セットアップを完了するには、

<Procedures>

1. **Google Cloud Marketplace > Your orders** に移動し、Zilliz Cloud の order を見つけます。製品名をクリックします。

    ![YgzQwi6xDh8eVFbgOSLcNElVnNh](https://zdoc-images.s3.us-west-2.amazonaws.com/YgzQwi6xDh8eVFbgOSLcNElVnNh.png)

1. **Manage on provider** をクリックします。

    ![GO3bwCnjWhyzT0bZCk3cpyHonPH](https://zdoc-images.s3.us-west-2.amazonaws.com/GO3bwCnjWhyzT0bZCk3cpyHonPH.png)

1. Zilliz Cloud にリダイレクトされます。Zilliz Cloud で操作を完了してください。

    ![RYtsbHgYUoaFBuxOspXcxIlrn5b](https://zdoc-images.s3.us-west-2.amazonaws.com/rytsbhgyuoafbuxospxcxilrn5b.png "RYtsbHgYUoaFBuxOspXcxIlrn5b")

</Procedures>

**Marketplace のサブスクリプションを Zilliz Cloud にリンクする際、利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限不足** 

    十分な権限がない場合に発生することがあります。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。ただし、Organization Member のみである場合、必要な権限がありません。支援を受けるには、組織の所有者に連絡してください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    これは、すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生することがあります。利用できない組織の横に **"Marketplace Linked"** タグが表示されます。

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    この場合、

    - 既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションのリンクを解除してから、新しいサブスクリプションを設定してください。

    - 異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    - これは、アカウントが閉鎖されている場合や、すべての組織から退出している場合に発生することがあります。UI は以下のようになります。

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    この場合、以下のいずれかを実行できます。

    - [新しい組織を作成する](./organization-settings#create-an-organization)。

    - 他のユーザーに、その人の組織にあなたを[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner のロールを付与してもらいます。

