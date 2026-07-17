---
title: "支払いと請求の概要 | Cloud"
slug: /payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、請求書とサブスクリプションを管理する際の考慮事項について説明します。 | Cloud"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、請求書とサブスクリプションを管理する際の考慮事項について説明します。

<Admonition type="info" icon="📘" title="📘 注記">

支払いおよび請求設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い方法\{#payment-methods}

次の表では、Zilliz Cloud で利用可能な支払い方法と、各方法が SaaS および BYOC デプロイメントでサポートされているかどうかを説明します。

<table>
   <tr>
     <th colspan="2"><p><strong>支払い方法</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>SaaS</strong></p></th>
     <th><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Credits</p></td>
     <td><p>Credits は、Zilliz Cloud に登録したとき、または対象となる Zilliz Cloud のプログラムやイベントに参加したときに付与されます。</p><p>Credits は、Zilliz Cloud の利用料金の支払いに使用できます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Credit card</p></td>
     <td><p>Zilliz Cloud の利用状況に基づいてクレジットカードに請求されます。請求書は毎月発行されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud のサービスに対して事前に資金を支払います。利用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace subscription</p></td>
     <td><p>Free Trial</p></td>
     <td rowspan="3"><p>Zilliz Cloud の利用料金に対する請求書を AWS Marketplace 経由で受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Public Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>GCP Marketplace subscription</p></td>
     <td><p>Public Offer</p></td>
     <td rowspan="2"><p>Zilliz Cloud の利用料金に対する請求書を Google Cloud Marketplace 経由で受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Microsoft Marketplace subscription</p></td>
     <td><p>Public Offer</p></td>
     <td rowspan="2"><p>Zilliz Cloud の利用料金に対する請求書を Microsoft Marketplace 経由で受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

Credits と Advance Pay は、クレジットカードまたは Marketplace subscription のいずれかと併用できます。ただし、クレジットカードと Marketplace subscription を同時に使用することはできません。

Marketplace subscription は支払い方法にすぎません。これは、project、cluster、および関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace 経由でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされている限り、AWS、Google Cloud、または Azure 上に Zilliz Cloud の project と cluster を作成できます。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. Credits

1. Advance Pay 残高

1. Credit card または Marketplace subscription

たとえば、&#36;500 の未払い請求、&#36;100 の Credits、&#36;200 の Advance Pay 残高、およびリンクされた AWS Marketplace subscription があるとします。

- Zilliz Cloud は最初に &#36;100 の Credits を適用し、未払い金額を &#36;400 に減らします。

- 次に Zilliz Cloud は &#36;200 の Advance Pay 残高を適用し、未払い金額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace subscription に請求されます。

## Marketplace subscription\{#marketplace-subscription}

次の Marketplace から Zilliz Cloud をサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace subscription を使用すると、組織は Zilliz Cloud の料金をクラウド Marketplace の請求アカウント経由で受け取ることができます。これは、財務チームまたは調達チームが、Zilliz Cloud の利用状況を既存のクラウド請求書に表示したい場合に便利です。

Marketplace の価格は、クラウドプロバイダー、リージョン、cluster type、cluster plan によって異なる場合があります。詳細な価格については、[Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

## ロールと権限\{#roles-and-permissions}

支払いおよび請求設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

| **ロール** | **請求権限** |
| --- | --- |
| Organization Owner | 支払い方法、請求プロファイル、Marketplace subscription、請求書、および請求アラートを管理できます。 |
| Organization Billing Admin | 支払い方法、請求プロファイル、Marketplace subscription、請求書、および請求アラートを管理できます。 |
| Other Organization Roles | 請求情報へのアクセス権はありません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin に連絡してください。 |

詳細については、[組織ユーザーの管理](./organization-users) を参照してください。

## 請求サイクルと請求書\{#billing-cycle-and-invoices}

Zilliz Cloud は、各請求期間中に使用されたリソースとサービスに基づいて利用料金を計算します。料金には、デプロイメントモード、cluster type、リージョン、および有効化されたサービスに応じて、cluster の使用量、ストレージ、データ操作、その他の課金対象機能が含まれる場合があります。

支払い方法として Credit card を選択した場合、Zilliz Cloud は組織に対して毎月請求書を発行します。請求書の見方の詳細については、[請求書を理解する](./view-invoice) を参照してください。

Marketplace でサブスクライブすることを選択した場合、請求書は対応するクラウド Marketplace によって発行されますが、利用明細は確認および照合のために引き続き Zilliz Cloud で利用できる場合があります。

請求サイクルについて質問がある場合は、[営業にお問い合わせください](http://zilliz.com/contact-sales)。

## 請求ステータスとサービスへの影響\{#billing-status-and-service-impact}

組織の請求ステータスによって、有料の Zilliz Cloud 機能およびリソースを引き続き利用できるかどうかが決まります。

- 組織に有効な Credits、Advance Pay 残高、Credit card、または有効な Marketplace subscription がある場合、プランおよび支払い条件に従って利用を継続できます。

- 有効な支払い方法または残高が残っていない場合、組織に未払いの請求書が発生し、高度な機能へのアクセスを失い、凍結状態になる可能性があります。サービス中断を回避するには、以下を行ってください。

    - credit の有効期限と残りの credit 残高を監視する。

    - クレジットカード情報を最新の状態に保つ。

    - Advance Pay 残高がなくなる前に補充する。

    - Marketplace subscription の有効期限が切れる前に更新する。

    - 請求アラートを設定して、支払いまたは使用量のリスクを早期に検知する。

組織が凍結されている場合、または支払いに失敗した場合は、アクセスを復元するために支払い方法を更新してください。詳細については、[支払い失敗](./failed-payments-organization-recovery) を参照してください。

## 関連トピック\{#related-topics}

- [Credits](./credits)

- [Credit Card](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [支払い方法を更新する](./update-payment-method)

- [請求プロファイルを更新する](./update-billing-profile)

- [請求書を理解する](./view-invoice)

- [請求書を管理する](./manage-invoice)

- [支払い失敗](./failed-payments-organization-recovery)

- [AWS Marketplace で Zilliz Cloud 請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace)

- [Microsoft Marketplace で Zilliz Cloud 請求を分離する](./separate-zilliz-cloud-billing-on-azure-marketplace)

- [請求アラートを監視する](./monitor-billing-alerts)

