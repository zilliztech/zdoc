---
title: "Google Cloud Marketplace で Private Offer にサブスクライブする | Cloud"
slug: /subscribe-on-gcp-marketplace-private-offer
sidebar_key: subscribe-on-gcp-marketplace-private-offer
sidebar_label: "Google Cloud Marketplace (Private Offer)"
beta: FALSE
notebook: FALSE
description: "Google Cloud Marketplace の Private Offer は、Zilliz が組織向けに作成するカスタム購入オプションです。Public Offer が Google Cloud Marketplace の製品ページに表示される標準価格と条件を使用するのに対し、Private Offer には交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | Cloud"
type: origin
token: Fd8EwsD0JiIt98kmps4c5wGlnrh
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace
  - google cloud
  - private offer

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud Marketplace で Private Offer にサブスクライブする

Google Cloud Marketplace の Private Offer は、Zilliz が組織向けに作成するカスタム購入オプションです。Public Offer が Google Cloud Marketplace の製品ページに表示される標準価格と条件を使用するのに対し、Private Offer には交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。

Zilliz Cloud の Private Offer が必要な場合は、[担当の Zilliz アカウントエグゼクティブにお問い合わせ](https://zilliz.com/contact-sales)ください。オファーを受け取る Google Cloud Billing アカウント ID とメールアドレス、想定契約期間、利用要件、組織が含める必要のある調達または請求要件をお知らせください。

このガイドでは、Google Cloud Marketplace で Zilliz Cloud の Private Offer を承諾し、Zilliz Cloud 組織にリンクする方法について説明します。

## 開始前の準備\{#before-you-start}

Private Offer を承諾する前に、次のことを確認してください。

- 有料の Google Cloud Billing アカウントがあること。Free Trial の Google Cloud Billing アカウントは使用できません。

- Cloud Billing アカウントに次のいずれかの必要な権限があること。

    - Billing Account Administrator (`roles/billing.admin`)

    - Billing Account User (`roles/billing.user`) と Consumer Procurement Order Administrator (`roles/consumerprocurement.orderAdmin`)

    必要な権限がない場合は、Billing Administrator または Organization Administrator にアクセス権の付与、または代理でのオファー承諾を依頼してください。

- Zilliz Cloud で Organization Owner または Organization Billing Admin であること。Marketplace サブスクリプションを Zilliz Cloud 組織にリンクするには、これらの権限が必要です。

## Private Offer にサブスクライブする\{#subscribe-to-a-private-offer}

以下は、サブスクリプションプロセスの概要です。

![YSY9wG2TNhNlvMbFCZ9cLrIDnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YSY9wG2TNhNlvMbFCZ9cLrIDnDh.png)

以下の詳細なステップバイステップガイドに従って、Google Cloud Marketplace で Private Offer にサブスクライブできます。

<Procedures>

1. Private Offer について担当の Zilliz アカウントエグゼクティブに問い合わせます。

    [担当の Zilliz アカウントエグゼクティブに問い合わせる](https://zilliz.com/contact-sales)際は、Private Offer を受け取るための [Google Cloud Billing アカウント ID](https://docs.cloud.google.com/billing/docs/how-to/find-billing-account-id) とメールアドレスを提供する必要があります。

1. メールの受信トレイを確認します。

    Google Cloud Marketplace から届く件名 **New Private Offer from Zilliz** のメールを探します。メール内の **Review Offer** ボタンをクリックします。

    ![Oawqwr3rDheYWibpPwQclqh0n3d](https://zdoc-images.s3.us-west-2.amazonaws.com/Oawqwr3rDheYWibpPwQclqh0n3d.png)

    <Admonition type="info" icon="📘" title="Note">

    <p>オファーの有効期限が切れる前に承諾する必要があります。オファーの有効期限が切れている場合は、担当のアカウントエグゼクティブに連絡してください。</p>

    </Admonition>

1. オファーの詳細を確認し、オファーを承諾します。

    ![NGJ1w2fVKh9ED1bMqK4cuzq2n5w](https://zdoc-images.s3.us-west-2.amazonaws.com/NGJ1w2fVKh9ED1bMqK4cuzq2n5w.png)

1. Zilliz にサインアップします。

    オファーの購入が完了すると、ページに **Accepted! Now sign up with Zilliz** というタイトルのダイアログボックスが表示されます。

    **Sign up** をクリックします。Zilliz Cloud にリダイレクトされます。

    <Admonition type="info" icon="📘" title="Note">

    <p>この手順は必ず完了してください。完了しない場合、Private Offer サブスクリプションはどの Zilliz Cloud 組織にもリンクされません。</p>

    </Admonition>

    ![IOkkwz2A6hexfnbiBBfcGGmNnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/IOkkwz2A6hexfnbiBBfcGGmNnxc.png)

1. Marketplace サブスクリプションを Zilliz Cloud 組織にリンクします。

    1. Zilliz Cloud アカウントにログインします。

        ![WZuibFtHLofsE5xOfTPccb4Xnxe](https://zdoc-images.s3.us-west-2.amazonaws.com/wzuibfthlofse5xoftpccb4xnxe.png "WZuibFtHLofsE5xOfTPccb4Xnxe")

    1. Marketplace サブスクリプションにリンクする Zilliz Cloud 組織を選択します。

        選択可能な組織がない場合、または質問がある場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

        ![EGjCbIHRGoDylPxCNQdc4YT6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/egjcbihrgodylpxcnqdc4yt6ntd.png "EGjCbIHRGoDylPxCNQdc4YT6nTd")

    1. プロセスが完了すると、次の確認ウィンドウが表示されます。

        ![Hcy6bjddpoGiJfxszMBccAalnoe](https://zdoc-images.s3.us-west-2.amazonaws.com/hcy6bjddpogijfxszmbccaalnoe.png "Hcy6bjddpoGiJfxszMBccAalnoe")

    1. Zilliz Cloud の **Billing** ページで、**Payment Method** セクションを探します。ID アイコンにカーソルを合わせると、サブスクリプションを確認できます。

        ![XoiTbm6HzoZMCMxCttVco12GnAn](https://zdoc-images.s3.us-west-2.amazonaws.com/xoitbm6hzozmcmxcttvco12gnan.png "XoiTbm6HzoZMCMxCttVco12GnAn")

</Procedures>

## Private Offer を更新する\{#renew-your-private-offer}

Private Offer の有効期限が近づくと、Zilliz は更新用の新しい Private Offer リンクを送信します。更新プロセスについて質問がある場合は、担当のアカウントエグゼクティブに連絡してください。

<Admonition type="info" icon="📘" title="Note">

<p>Google Cloud Marketplace では、更新は既存の Private Offer 注文上で処理されます。更新が有効になると、現在の Private Offer サブスクリプションから継続されるため、サブスクリプションを Zilliz Cloud 組織に再度リンクする必要はありません。</p>

</Admonition>

## Public Offer から Private Offer に切り替える\{#switch-from-a-public-offer-to-a-private-offer}

[Private Offer の更新](./subscribe-on-gcp-marketplace-private-offer#renew-your-private-offer)と同様に、Public Offer から Private Offer に切り替えるには、新しい Private Offer を承諾する必要があります。承諾すると、新しい Private Offer が以前の Public Offer を自動的に置き換えます。それでも、新しいオファーを Zilliz Cloud 組織に再度リンクする必要があります。

## Private Offer サブスクリプションをキャンセルする\{#cancel-private-offer-subscription}

Google Cloud Marketplace から Private Offer サブスクリプションをキャンセルできます。

<Admonition type="info" icon="📘" title="Note">

<p>サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットが期限切れの場合、組織はすぐに凍結されます。</p>

</Admonition>

詳細については、[承諾済みオファーの管理](https://docs.cloud.google.com/marketplace/docs/offers/manage-accepted-offer)を参照してください。

## FAQ\{#faq}

**Private Offer の有効期限が切れ、更新されない場合はどうなりますか？**

Private Offer の有効期限が切れて更新されない場合、Google Cloud Marketplace サブスクリプションでは Private Offer の条件が失われます。Zilliz Cloud 組織に有効な支払い方法または残りのクレジットがない場合、高度な機能へのアクセスが無効になり、組織は凍結されます。

**Private Offer を承諾した後、Zilliz Cloud でのサインアップを完了しない場合はどうなりますか？**

Private Offer を承諾しても **Sign up with Zilliz Cloud** を完了しない場合、Marketplace サブスクリプションは作成されますが、どの Zilliz Cloud 組織にもリンクされません。その結果、組織は Private Offer を支払い方法として使用できません。

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに利用可能な組織がない場合はどうすればよいですか？**

いくつかの理由が考えられます。

- **権限が不十分です**

    十分な権限がない場合に発生します。利用できない組織の横に **"Insufficient Permissions"** タグが表示されます。

    組織を Marketplace サブスクリプションにリンクするには、**Organization Owner** または **Organization Billing Admin** である必要があります。Organization Member のみである場合、必要な権限がありません。組織オーナーに連絡して支援を依頼してください。

- **すべての組織がすでに Marketplace サブスクリプションに正常にリンクされている**

    すべての組織がすでに Marketplace サブスクリプションにリンクされている場合に発生します。この場合、既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

    異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

- **リストに組織がない**

    アカウントがクローズされた場合、またはすべての組織から脱退した場合に発生することがあります。この場合は、[新しい組織を作成](./organization-settings#create-an-organization)するか、他のユーザーに組織へ[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner ロールを付与してもらいます。
