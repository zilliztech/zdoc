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

<Admonition type="info" title="Note">

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
     <td colspan="2"><p>クレジット</p></td>
     <td><p>クレジットは、Zilliz Cloud に登録したとき、または対象となる Zilliz Cloud のプログラムやイベントに参加したときに付与されます。</p><p>クレジットは、Zilliz Cloud の利用料金の支払いに充当できます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud の利用量に基づいてクレジットカードで請求されます。請求書は毎月発行されます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Advance Pay</p></td>
     <td><p>Zilliz Cloud のサービスのために資金を前払いします。利用料金は Advance Pay 残高から差し引かれます。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>AWS Marketplace サブスクリプション</p></td>
     <td><p>無料トライアル</p></td>
     <td rowspan="3"><p>Zilliz Cloud の利用に対する請求書を AWS Marketplace 経由で受け取ります。</p></td>
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
     <td rowspan="2"><p>Zilliz Cloud の利用に対する請求書を Google Cloud Marketplace 経由で受け取ります。</p></td>
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
     <td rowspan="2"><p>Zilliz Cloud の利用に対する請求書を Microsoft Marketplace 経由で受け取ります。</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>プライベートオファー</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

クレジットと Advance Pay は、クレジットカードまたは Marketplace サブスクリプションのいずれかと組み合わせて使用できます。ただし、クレジットカードと Marketplace サブスクリプションを同時に使用することはできません。

Marketplace サブスクリプションは支払い方法にすぎません。プロジェクト、クラスター、および関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace 経由でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされている限り、AWS、Google Cloud、または Azure 上で Zilliz Cloud のプロジェクトとクラスターを引き続き作成できます。

## 支払い方法の優先順位\{#payment-method-priority}

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. クレジット

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

たとえば、&#36;500 の未払い請求があり、&#36;100 のクレジット、&#36;200 の Advance Pay 残高、およびリンクされた AWS Marketplace サブスクリプションがあるとします。

- Zilliz Cloud はまず &#36;100 のクレジットを適用し、未払い額を &#36;400 に減らします。

- 次に Zilliz Cloud は &#36;200 の Advance Pay 残高を適用し、未払い額を &#36;200 に減らします。

- 残りの &#36;200 は AWS Marketplace サブスクリプションに請求されます。

## Marketplace サブスクリプション\{#marketplace-subscription}

次の Marketplace を通じて Zilliz Cloud をサブスクライブできます。

- [AWS Marketplace](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace](./subscribe-on-azure-marketplace)

Marketplace サブスクリプションを使用すると、組織はクラウド Marketplace の請求アカウントを通じて Zilliz Cloud の料金を受け取ることができます。これは、財務チームまたは調達チームが、既存のクラウド請求書に Zilliz Cloud の利用量を表示させたい場合に便利です。

Marketplace の価格は、クラウドプロバイダー、リージョン、クラスタータイプ、クラスタープランによって異なる場合があります。詳細な価格については、[Zilliz Cloud Pricing](https://zilliz.com/pricing) を参照してください。

## ロールと権限\{#roles-and-permissions}

支払いおよび請求設定は組織レベルで管理されます。請求情報を表示または更新するには、必要な組織レベルの権限を持っている必要があります。

| **ロール** | **請求権限** |
| --- | --- |
| Organization Owner | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| Organization Billing Admin | 支払い方法、請求プロファイル、Marketplace サブスクリプション、請求書、請求アラートを管理できます。 |
| Other Organization Roles | 請求情報にアクセスできません。請求設定を表示または更新するには、Organization Owner または Organization Billing Admin にお問い合わせください。 |

詳細については、[Manage Platform Users](./manage-platform-users) を参照してください。

## 請求サイクルと請求書\{#billing-cycle-and-invoices}

Zilliz Cloud は、各請求期間中に使用されたリソースとサービスに基づいて利用料金を計算します。料金には、デプロイメントモード、クラスタータイプ、リージョン、および有効化されているサービスに応じて、クラスターの使用量、ストレージ、データ操作、その他の課金対象機能が含まれる場合があります。

支払い方法としてクレジットカードを選択した場合、Zilliz Cloud は組織に対して毎月の請求書を生成します。請求書の読み方の詳細については、[請求書について理解する](./view-invoice) を参照してください。

Marketplace でサブスクライブすることを選択した場合、請求書は対応するクラウド Marketplace から発行されますが、利用の詳細は引き続き Zilliz Cloud で確認および照合できる場合があります。

請求サイクルについてご不明な点がある場合は、[営業担当](http://zilliz.com/contact-sales) にお問い合わせください。

## 請求ステータスとサービスへの影響\{#billing-status-and-service-impact}

組織の請求ステータスによって、有料の Zilliz Cloud 機能とリソースを引き続き使用できるかどうかが決まります。

- 組織に有効なクレジット、Advance Pay 残高、クレジットカード、または有効な Marketplace サブスクリプションがある場合、プランと支払い条件に従って利用を継続できます。

- 有効な支払い方法または残りの残高がない場合、組織に未払いの請求書が発生し、高度な機能へのアクセスを失い、凍結される可能性があります。サービスの中断を避けるには、次の点に注意してください。

    - クレジットの有効期限と残りのクレジット残高を監視してください。

    - クレジットカードの情報を最新の状態に保ってください。

    - Advance Pay 残高がなくなる前に補充してください。

    - Marketplace サブスクリプションの有効期限が切れる前に更新してください。

    - 請求アラートを設定して、支払いまたは使用量のリスクを早期に検出してください。

組織が凍結されている場合、または支払いに失敗した場合は、支払い方法を更新してアクセスを復旧してください。詳細については、[支払いの失敗 ](./failed-payments-organization-recovery) を参照してください。

## 関連トピック\{#related-topics}

- [クレジット](./credits)

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [支払い方法の更新](./update-payment-method)

- [請求先プロファイルを更新](./update-billing-profile)

- [請求書について理解する](./view-invoice)

- [請求書の管理](./manage-invoice)

- [支払いの失敗 ](./failed-payments-organization-recovery)

- [AWS Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace)

- [Microsoft Marketplace での Zilliz Cloud 請求の分離](./separate-zilliz-cloud-billing-on-azure-marketplace)

- [請求アラートを監視する](./monitor-billing-alerts)
