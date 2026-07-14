---
title: "支払いと請求の概要 | Cloud"
slug: /payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、請求書とサブスクリプションを管理する際の注意点について説明します。 | Cloud"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、請求書とサブスクリプションを管理する際の注意点について説明します。

<Admonition type="info" icon="📘" title="📘 注">

支払いおよび請求設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い方法\{#payment-methods}

以下の表では、Zilliz Cloud で利用可能な支払い方法と、各方法が SaaS および BYOC デプロイメントでサポートされているかどうかを説明します。

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
     <td colspan="2"><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用状況に基づいてクレジットカードに請求されます。請求書は毎月生成されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud サービスのために資金を前払いします。利用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace サブスクリプション</p></td>
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
     <td rowspan="2"><p>GCP Marketplace サブスクリプション</p></td>
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
     <td rowspan="2"><p>Microsoft Marketplace サブスクリプション</p></td>
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

Credits と Advance Pay は、クレジットカードまたは Marketplace サブスクリプションのいずれかと組み合わせて使用できます。ただし、クレジットカードと Marketplace サブスクリプションを同時に使用することはできません。

Marketplace サブスクリプションは支払い方法にすぎません。これによって、プロジェクト、クラスター、および関連リソースを作成するクラウドプロバイダーが決まるわけではありません。たとえば、AWS Marketplace 経由でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされている限り、AWS、Google Cloud、または Azure 上に Zilliz Cloud のプロジェクトとクラスターを引き続き作成できます。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は以下の順序で適用します。

1. Credits

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、未払い請求額が &#36;500、Credits が &#36;100、Advance Pay 残高が &#36;200、リンクされた AWS Marketplace サブスクリプションがあるとします。

- Zilliz Cloud は最初に &#36;100 の Credits を適用し、未払い額を &#36;400 に減らします。

- 次に Zilliz Cloud は &#36;200 の Advance Pay 残高を適用し、未払い額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに請求されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

以下の Marketplace から Zilliz Cloud をサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションを利用すると、組織の Zilliz Cloud の料金がクラウド Marketplace の請求アカウントを通じて請求されます。これは、財務チームや調達チームが、既存のクラウド請求書に Zilliz Cloud の利用料金を含めたい場合に役立ちます。

Marketplace の価格は、クラウドプロバイダー、リージョン、クラスタータイプ、クラスタープランによって異なる場合があります。詳細な価格については、[Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

## ロールと権限\{#roles-and-permissions}

支払いおよび請求設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

| **ロール** | **請求権限** |
| --- | --- |
| Organization Owner | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| Organization Billing Admin | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| その他の組織ロール | 請求情報にはアクセスできません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin に連絡してください。 |

詳細については、[組織ユーザーの管理](./organization-users) を参照してください。

## 請求サイクルと請求書\{#billing-cycle-and-invoices}

Zilliz Cloud は、各請求期間中に使用されたリソースおよびサービスに基づいて利用料金を計算します。料金には、デプロイメントモード、クラスタータイプ、リージョン、および有効化されたサービスに応じて、クラスター利用、ストレージ、データ操作、その他の課金対象機能が含まれる場合があります。

支払い方法としてクレジットカードを選択した場合、Zilliz Cloud は組織に対して月次請求書を生成します。請求書の見方の詳細については、[請求書を理解する](./view-invoice) を参照してください。

Marketplace でサブスクライブすることを選択した場合、請求書は対応するクラウド Marketplace によって発行されますが、利用詳細はレビューおよび照合のために Zilliz Cloud でも引き続き確認できる場合があります。

請求サイクルについて質問がある場合は、[営業にお問い合わせください](http://zilliz.com/contact-sales)。

## 請求ステータスとサービスへの影響\{#billing-status-and-service-impact}

組織の請求ステータスによって、有料の Zilliz Cloud 機能およびリソースを継続して利用できるかどうかが決まります。

- 組織に有効な Credits、Advance Pay 残高、クレジットカード、または有効な Marketplace サブスクリプションがある場合、利用はプランおよび支払い条件に従って継続できます。

- 有効な支払い方法または残高が利用できない場合、組織に未払い請求書が発生し、高度な機能へのアクセスを失い、凍結される可能性があります。サービス中断を避けるには、以下を行ってください。

    - Credits の有効期限と残高を監視する。

    - クレジットカード情報を最新の状態に保つ。

    - Advance Pay 残高がなくなる前に補充する。

    - Marketplace サブスクリプションの有効期限が切れる前に更新または変更する。

    - 請求アラートを設定して、支払いまたは利用リスクを早期に検知する。

組織が凍結された場合、または支払いに失敗した場合は、アクセスを復元するために支払い方法を更新してください。詳細については、[支払い失敗](./failed-payments-organization-recovery) を参照してください。

## 関連トピック\{#related-topics}

- [Credits](./credits)

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [支払い方法を更新する](./update-payment-method)

- [請求プロファイルを更新する](./update-billing-profile)

- [請求書を理解する](./view-invoice)

- [請求書を管理する](./manage-invoice)

- [支払い失敗](./failed-payments-organization-recovery)

- [AWS Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace)

- [Microsoft Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-azure-marketplace)

- [請求アラートを監視する](./monitor-billing-alerts)

