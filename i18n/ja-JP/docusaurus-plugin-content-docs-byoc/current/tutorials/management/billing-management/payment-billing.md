---
title: "支払いと請求の概要 | BYOC"
slug: /payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払い優先順位の仕組み、請求書およびサブスクリプションを管理する際の注意点について説明します。 | BYOC"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払い優先順位の仕組み、請求書およびサブスクリプションを管理する際の注意点について説明します。

<Admonition type="info" icon="📘" title="📘 注記">

支払いおよび請求の設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

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
     <td><p>Credits は、Zilliz Cloud に登録したとき、または対象となる Zilliz Cloud のプログラムやイベントに参加したときに付与されます。 </p><p>Credits は Zilliz Cloud の利用料金の支払いに使用できます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用状況に基づいてクレジットカードに請求されます。請求書は毎月発行されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud サービスのために事前に資金を支払います。利用料金は Advance Pay 残高から差し引かれます。</p></td>
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

Marketplace サブスクリプションは支払い方法にすぎません。プロジェクト、クラスター、および関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace 経由でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされている限り、AWS、Google Cloud、または Azure 上に Zilliz Cloud のプロジェクトとクラスターを作成できます。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は以下の順序で適用します。

1. Credits

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、&#36;500 の未払い請求、&#36;100 の Credits、&#36;200 の Advance Pay 残高、およびリンクされた AWS Marketplace サブスクリプションがあるとします。

- Zilliz Cloud は最初に &#36;100 の Credits を適用し、未払い額を &#36;400 に減らします。

- 次に Zilliz Cloud は &#36;200 の Advance Pay 残高を適用し、未払い額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに請求されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

以下の Marketplace から Zilliz Cloud をサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションを使用すると、組織はクラウドマーケットプレイスの請求アカウントを通じて Zilliz Cloud の請求を受けることができます。これは、財務チームや調達チームが、Zilliz Cloud の利用料金を既存のクラウド請求書に含めたい場合に便利です。

詳細な価格については、[営業にお問い合わせください](http://zilliz.com/contact-sales)。

## ロールと権限\{#roles-and-permissions}

支払いおよび請求の設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

| **ロール** | **請求権限** |
| --- | --- |
| Organization Owner | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、および請求アラートを管理できます。 |
| Organization Billing Admin | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、および請求アラートを管理できます。 |
| その他の Organization ロール | 請求情報へのアクセス権はありません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin にお問い合わせください。 |

詳細については、[組織ユーザーの管理](./organization-users) を参照してください。

