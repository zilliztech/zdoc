---
title: "支払いと請求の概要 | BYOC"
slug: /payment-billing
sidebar_key: payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用できる支払い方法、支払いの優先順位、請求書とサブスクリプションを管理する際の考慮事項について説明します。 | BYOC"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 支払い
  - 請求

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用できる支払い方法、支払いの優先順位、請求書とサブスクリプションを管理する際の考慮事項について説明します。

<Admonition type="info" icon="📘" title="Note">

支払いと請求の設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い方法\{#payment-methods}

次の表は、Zilliz Cloud で利用できる支払い方法と、各方法が SaaS および BYOC デプロイメントでサポートされるかどうかを示しています。

<table>
   <tr>
     <th colspan="2"><p><strong>支払い方法</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>SaaS</strong></p></th>
     <th><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Credits</p></td>
     <td><p>Credits は、Zilliz Cloud への登録時、または対象となる Zilliz Cloud のプログラムやイベントに参加した場合に付与されます。</p><p>Credits は Zilliz Cloud の使用料金に充当できます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の使用量に基づいてクレジットカードに課金されます。請求書は毎月生成されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud サービス用の資金を前払いします。使用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace サブスクリプション</p></td>
     <td><p>Free Trial</p></td>
     <td rowspan="3"><p>AWS Marketplace を通じて Zilliz Cloud の使用料金の請求書を受け取ります。</p></td>
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
</table>

Credits と Advance Pay は、クレジットカードまたは Marketplace サブスクリプションのいずれかと併用できます。ただし、クレジットカードと Marketplace サブスクリプションを同時に使用することはできません。

Marketplace サブスクリプションは支払い方法にすぎません。プロジェクト、クラスタ、関連リソースを作成するクラウドプロバイダーを決定するものではありません。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. Credits

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、未払い請求が &#36;500、Credits が &#36;100、Advance Pay 残高が &#36;200、AWS Marketplace サブスクリプションがリンクされているとします。

- Zilliz Cloud はまず &#36;100 の Credits を適用し、未払い額を &#36;400 に減らします。

- 次に &#36;200 の Advance Pay 残高を適用し、未払い額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに請求されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

Zilliz Cloud は次の Marketplace からサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションにより、組織は既存のクラウド Marketplace 請求アカウントを通じて Zilliz Cloud の料金を受け取れます。これは、財務または購買チームが Zilliz Cloud の使用量を既存のクラウド請求書に表示したい場合に便利です。

詳細な価格については、[営業担当にお問い合わせ](http://zilliz.com/contact-sales)ください。

## ロールと権限\{#roles-and-permissions}

支払いと請求の設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

<table>
   <tr>
     <th><p><strong>ロール</strong></p></th>
     <th><p><strong>請求権限</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization Owner</p></td>
     <td><p>支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。</p></td>
   </tr>
   <tr>
     <td><p>Organization Billing Admin</p></td>
     <td><p>支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。</p></td>
   </tr>
   <tr>
     <td><p>その他の組織ロール</p></td>
     <td><p>請求情報にはアクセスできません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin に連絡してください。</p></td>
   </tr>
</table>

詳細については、[組織ユーザーの管理](./organization-users)を参照してください。
