---
title: "お支払いと請求の概要 | BYOC"
slug: /payment-billing
sidebar_label: "お支払いと請求の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud で利用可能なお支払い方法、お支払いの優先順位、および請求書やサブスクリプションを管理する際の注意点について説明します。 | BYOC"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# お支払いと請求の概要

このガイドでは、Zilliz Cloud で利用可能なお支払い方法、お支払いの優先順位、および請求書やサブスクリプションを管理する際の注意点について説明します。

<Admonition type="info" icon="📘" title="📘 Note">

お支払いと請求の設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## お支払い方法\{#payment-methods}

次の表は、Zilliz Cloud で利用可能なお支払い方法と、各方法が SaaS および BYOC デプロイメントでサポートされているかどうかを示しています。

<table>
   <tr>
     <th colspan="2"><p><strong>Payment method</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>SaaS</strong></p></th>
     <th><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Credits</p></td>
     <td><p>Credits は、Zilliz Cloud への登録時や、対象となる Zilliz Cloud プログラムまたはイベントへの参加時に付与されます。</p><p>Credits を使用して Zilliz Cloud の利用料金を支払うことができます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Credit card</p></td>
     <td><p>クレジットカードによる課金は、Zilliz Cloud の使用量に基づいて行われます。請求書は毎月発行されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud サービスの利用にあたり、事前に資金を前払いします。利用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace subscription</p></td>
     <td><p>Free Trial</p></td>
     <td rowspan="3"><p>AWS Marketplace を通じて Zilliz Cloud の利用料金が請求されます。</p></td>
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
     <td rowspan="2"><p>Google Cloud Marketplace を通じて Zilliz Cloud の利用料金が請求されます。</p></td>
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
     <td rowspan="2"><p>Microsoft Marketplace を通じて Zilliz Cloud の利用料金が請求されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Private Offer</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

Credits と Advance Pay は、クレジットカードまたは Marketplace サブスクリプションのいずれかと併用できます。ただし、クレジットカードと Marketplace サブスクリプションを同時に使用することはできません。

Marketplace サブスクリプションはあくまでお支払い方法であり、プロジェクト、クラスター、および関連リソースを作成するクラウド プロバイダーを決定するものではありません。たとえば、AWS Marketplace でサブスクリプションに登録した後でも、選択したクラウド プロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、または Azure 上で Zilliz Cloud のプロジェクトやクラスターを作成できます。

## お支払い方法の優先順位\{#payment-method-priority}

複数のお支払い方法または残高が利用可能な場合、Zilliz Cloud は以下の順序で適用します。

1. Credits

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、&#36;500 の未払い請求があり、&#36;100 の Credits、&#36;200 の Advance Pay 残高、およびリンク済みの AWS Marketplace サブスクリプションがあるとします。

- まず Zilliz Cloud が &#36;100 の Credits を適用し、未払い額が &#36;400 に減ります。

- 次に Zilliz Cloud が &#36;200 の Advance Pay 残高を適用し、未払い額が &#36;200 に減ります。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに課金されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

以下のマーケットプレイスを通じて Zilliz Cloud のサブスクリプションに登録できます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションを利用すると、組織のクラウド マーケットプレイス請求アカウントを通じて Zilliz Cloud の料金を請求できます。これは、経理部門や調達部門が既存のクラウド請求書に Zilliz Cloud の使用量を含めたい場合に便利です。

詳細な料金については、[営業チームにお問い合わせください](http://zilliz.com/contact-sales)。

## ロールと権限\{#roles-and-permissions}

お支払いと請求の設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

| **ロール** | **請求に関する権限** |
| --- | --- |
| Organization Owner | お支払い方法、請求プロフィール、Marketplace サブスクリプション、請求書、および請求アラートを管理できます。 |
| Organization Billing Admin | お支払い方法、請求プロフィール、Marketplace サブスクリプション、請求書、および請求アラートを管理できます。 |
| その他の組織ロール | 請求情報へのアクセス権はありません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin にお問い合わせください。 |

詳細については、[組織ユーザーの管理](./organization-users)を参照してください。

