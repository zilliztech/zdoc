---
title: "Google Cloud Marketplace で Private Offer にサブスクライブする | BYOC"
slug: /subscribe-on-gcp-marketplace-private-offer
sidebar_key: subscribe-on-gcp-marketplace-private-offer
sidebar_label: "Google Cloud Marketplace (Private Offer)"
beta: FALSE
notebook: FALSE
description: "Google Cloud Marketplace の Private Offer は、Zilliz が組織向けに作成するカスタム購入オプションです。Public Offer が Google Cloud Marketplace の製品ページに表示される標準価格と条件を使用するのに対し、Private Offer には交渉済み価格、カスタム契約条件、特定の契約期間、定義済みの支払いスケジュールを含めることができます。 | BYOC"
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

以下の詳細なステップバイステップガイドに従って、Google Cloud Marketplace で Private Offer にサブスクライブできます。

<Procedures>

1. Private Offer について担当の Zilliz アカウントエグゼクティブに問い合わせます。

    [担当の Zilliz アカウントエグゼクティブに問い合わせる](https://zilliz.com/contact-sales)際は、Private Offer を受け取るための [Google Cloud Billing アカウント ID](https://docs.cloud.google.com/billing/docs/how-to/find-billing-account-id) とメールアドレスを提供する必要があります。

1. メールの受信トレイを確認します。

    Google Cloud Marketplace から届く件名 **New Private Offer from Zilliz** のメールを探し、メール内の **Review Offer** ボタンをクリックします。

1. オファーの詳細を確認し、オファーを承諾します。

1. **Sign up** をクリックして Zilliz Cloud にリダイレクトし、サブスクリプションを Zilliz Cloud 組織にリンクします。

</Procedures>

<Admonition type="info" icon="📘" title="Note">

<p>この手順は必ず完了してください。完了しない場合、Private Offer サブスクリプションはどの Zilliz Cloud 組織にもリンクされません。</p>

</Admonition>

## Private Offer を更新する\{#renew-your-private-offer}

Private Offer の有効期限が近づくと、Zilliz は更新用の新しい Private Offer リンクを送信します。更新プロセスについて質問がある場合は、担当のアカウントエグゼクティブに連絡してください。

<Admonition type="info" icon="📘" title="Note">

<p>Google Cloud Marketplace では、更新は既存の Private Offer 注文上で処理されます。更新が有効になると、現在の Private Offer サブスクリプションから継続されるため、サブスクリプションを Zilliz Cloud 組織に再度リンクする必要はありません。</p>

</Admonition>

## Private Offer サブスクリプションをキャンセルする\{#cancel-private-offer-subscription}

Google Cloud Marketplace から Private Offer サブスクリプションをキャンセルできます。

<Admonition type="info" icon="📘" title="Note">

<p>サブスクリプションをキャンセルすると、組織は Zilliz Cloud の高度な機能にアクセスできなくなります。組織に残りのクレジットがない場合、またはすべてのクレジットが期限切れの場合、組織はすぐに凍結されます。</p>

</Admonition>

## FAQ\{#faq}

**Marketplace サブスクリプションを Zilliz Cloud にリンクするときに利用可能な組織がない場合はどうすればよいですか？**

既存の Marketplace サブスクリプションを更新する必要がある場合は、まず組織の現在のサブスクリプションをリンク解除してから、新しいサブスクリプションを設定してください。

異なる Marketplace サブスクリプション用に複数の組織が必要な場合は、[組織を作成](./organization-settings#create-an-organization)できます。

リストに組織がない場合は、[新しい組織を作成](./organization-settings#create-an-organization)するか、他のユーザーに組織へ[招待](./organization-users#invite-a-user-to-your-organization)してもらい、Organization Owner ロールを付与してもらいます。
