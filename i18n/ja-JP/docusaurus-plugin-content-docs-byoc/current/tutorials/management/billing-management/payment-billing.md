---
title: "支払いと請求の概要 | BYOC"
slug: /payment-billing
sidebar_label: "支払いと請求の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、および請求書やサブスクリプションを管理する際に考慮すべき点について説明します。 | BYOC"
type: origin
token: Y6Qqw4a3XiWPlCkQYMqcLEORnAU
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 支払いと請求の概要

このガイドでは、Zilliz Cloud で利用可能な支払い方法、支払いの優先順位の仕組み、および請求書やサブスクリプションを管理する際に考慮すべき点について説明します。

<Admonition type="info" title="Note">

支払いと請求の設定を管理するには、**Organization Owner** または **Organization Billing Admin** であることが必要です。

</Admonition>

## 支払い方法\{#payment-methods}

次の表に、Zilliz Cloud で利用可能な支払い方法と、各方法が SaaS および BYOC デプロイメントでサポートされているかどうかを示します。

<table>
   <tr>
     <th colspan="2"><p><strong>支払い方法</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>SaaS</strong></p></th>
     <th><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>クレジット</p></td>
     <td><p>クレジットは、Zilliz Cloud への登録時、または対象となる Zilliz Cloud のプログラムやイベントへの参加時に付与されます。</p><p>クレジットは Zilliz Cloud の利用料金に充当できます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用状況に基づいてクレジットカードで課金されます。請求書は毎月発行されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud サービスの利用代金を前払いします。利用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace サブスクリプション</p></td>
     <td><p>無料トライアル</p></td>
     <td rowspan="3"><p>Zilliz Cloud の利用料金の請求書は、AWS Marketplace を通じて受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>パブリックオファー</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>プライベートオファー</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>GCP Marketplace サブスクリプション</p></td>
     <td><p>パブリックオファー</p></td>
     <td rowspan="2"><p>Zilliz Cloud の利用料金の請求書は、Google Cloud Marketplace を通じて受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>プライベートオファー</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Microsoft Marketplace サブスクリプション</p></td>
     <td><p>パブリックオファー</p></td>
     <td rowspan="2"><p>Zilliz Cloud の利用料金の請求書は、Microsoft Marketplace を通じて受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>プライベートオファー</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

クレジットと Advance Pay は、クレジットカードまたは Marketplace サブスクリプションのいずれかと併用できます。ただし、クレジットカードと Marketplace サブスクリプションを同時に使用することはできません。

Marketplace サブスクリプションはあくまで支払い方法であり、プロジェクト、クラスター、関連リソースを作成するクラウドプロバイダーを規定するものではありません。たとえば、AWS Marketplace でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、Azure のいずれにも Zilliz Cloud のプロジェクトやクラスターを作成できます。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud はそれらを次の順序で適用します。

1. クレジット

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、未払いの請求額が &#36;500、クレジットが &#36;100、Advance Pay 残高が &#36;200 あり、AWS Marketplace サブスクリプションがリンクされているとします。

- Zilliz Cloud はまず &#36;100 のクレジットを適用し、未払い額を &#36;400 に減らします。

- 次に Zilliz Cloud は &#36;200 の Advance Pay 残高を適用し、未払い額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに課金されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

Zilliz Cloud には、以下のマーケットプレイスからサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションを利用すると、組織のクラウドマーケットプレイス請求アカウントを通じて Zilliz Cloud の料金を請求できます。これは、経理部門や調達部門が Zilliz Cloud の利用料金を既存のクラウド請求書に表示したい場合に便利です。

料金の詳細については、[営業チームにお問い合わせください](http://zilliz.com/contact-sales)。

## ロールと権限\{#roles-and-permissions}

支払いと請求の設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限が必要です。

| **ロール** | **請求に関する権限** |
| --- | --- |
| Organization Owner | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| Organization Billing Admin | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| その他の組織ロール | 請求情報へのアクセス権はありません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin にお問い合わせください。 |

詳細については、[プラットフォームユーザーの管理](./manage-platform-users) を参照してください。

