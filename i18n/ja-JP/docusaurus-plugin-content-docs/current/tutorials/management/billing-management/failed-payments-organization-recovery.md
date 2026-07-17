---
title: "支払い失敗と組織の復旧 | Cloud"
slug: /failed-payments-organization-recovery
sidebar_label: "支払い失敗と組織の復旧"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "支払いの失敗は、組織の請求ステータスや有料の Zilliz Cloud 機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に何が起こるか、そして組織を復旧する方法について説明します。 | Cloud"
type: origin
token: JYXswRlj9i5KE5kJ2U0cdaM5nBh
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払い失敗と組織の復旧

支払いの失敗は、組織の請求ステータスや有料の Zilliz Cloud 機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に何が起こるか、そして組織を復旧する方法について説明します。

<Admonition type="info" icon="📘" title="**注**">

支払いおよび請求設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い失敗の一般的な原因\{#common-causes-for-failed-payments}

支払いが失敗する理由はいくつかあります。

- 保存済みのクレジットカードの有効期限が切れている。

- クレジットカードがカード発行会社によって拒否されている。

- Advance Pay の残高が不足している。

- クレジットが使い切られている、または有効期限が切れている。

- Marketplace public offer のサブスクリプションの有効期限が切れている、キャンセルされている、または Zilliz Cloud 組織にリンクされなくなっている。

- Marketplace private offer のサブスクリプションの有効期限が切れており、更新されていない。

- Marketplace free trial のサブスクリプションの有効期限が切れており、Zilliz Cloud で他の支払い方法が提供されていない。

## クレジットカードの中間請求\{#credit-card-interim-charges}

Zilliz Cloud SaaS の請求書は毎月発行されます。ただし、新しい組織が初めて支払い方法としてクレジットカードを追加した場合、Zilliz Cloud は月次請求書が発行される前に中間請求を実行することがあります。

中間請求は、累積使用量が初めて特定の請求しきい値（&#36;100 や &#36;1,000 など）に達したときに実行されます。これらのしきい値での中間請求が正常に完了すると、その後の請求は通常の月次請求サイクルに従います。

これらの中間請求は、新規アカウントの請求信頼性を確立し、請求サイクル中に組織を正常な状態に保つのに役立ちます。

中間請求が失敗した場合、月次請求サイクルがまだ終了していなくても、組織が直ちに凍結されることがあります。サービスの中断を避けるため、クレジットカードが有効で、利用可能残高が十分にあることを確認してください。

## サービスへの影響\{#service-impact}

Zilliz Cloud が支払いを回収できず、有効なクレジットまたは利用可能な Advance Pay 残高もない場合、組織には未払いの請求書が発生し、凍結されます。

組織が凍結されると、次のようになります。

- Zilliz Cloud はメール通知を送信し、未払い請求書を支払うための 15 日間の猶予期間を提供します。猶予期間後も請求書が未払いのままの場合、データとリソースはごみ箱に移動されます。

- 実行中のサービスおよび高度な機能が制限される場合があります。

- 新しい有料リソースを作成できなくなります。

- 影響を受ける Zilliz Cloud リソースに依存するアプリケーションが中断される可能性があります。

## 組織を復旧する\{#recover-your-organization}

アクセスを復元するには、請求の問題を解決し、組織に有効な支払い方法または利用可能な残高があることを確認してください。

### クレジットの有効期限が切れた、または使い切った場合\{#if-credits-expired-or-ran-out}

<Procedures>

1. [クレジットカード](./subscribe-by-adding-credit-card) または [Marketplace subscription](./marketplace-subscription) などの有効な支払い方法を追加します。

1. [Advance Pay](./advance-pay) を使用している場合は、残高に資金を追加します。

1. クレジットについてサポートが必要な場合は、[Zilliz Sales](http://zilliz.com/contact-sales) または担当アカウントチームに連絡します。

</Procedures>

### クレジットカードの支払いに失敗した場合\{#if-your-credit-card-payment-failed}

<Procedures>

1. Zilliz Cloud コンソールに移動します。

1. 組織を開きます。

1. **Billing** に移動します。

1. クレジットカードを[差し替え](./subscribe-by-adding-credit-card#replace-a-credit-card)ます。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。それでも未払い請求書を支払えない場合は、[Zilliz Support](http://support.zilliz.com) に連絡してください。

</Procedures>

### Advance Pay の残高が不足している場合\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. [Advance Pay](./advance-pay) の残高に資金を追加します。

1. 更新後の残高が Billing ページに表示されていることを確認します。

1. 残高の更新後も組織が凍結されたままの場合は、[Zilliz Support](http://support.zilliz.com) に連絡してください。

</Procedures>

### Marketplace subscription の有効期限が切れた、またはキャンセルされた場合\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. marketplace subscription を確認します。

    1. Marketplace **free trial** のサブスクリプションの有効期限が切れている場合は、有料サブスクリプションに[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)します。

    1. Marketplace **public offer** のサブスクリプションがキャンセルされている場合は、再度[サブスクライブ](./subscribe-on-aws-marketplace)するか、[他の支払い方法に切り替え](./update-payment-method)ます。

    1. Marketplace **private offer** のサブスクリプションの有効期限が切れている場合は、private offer を[更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)するか、担当アカウントエグゼクティブに連絡します。

1. Billing ページの **Payment Method** セクションで更新済みのサブスクリプションを確認します。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。それでも未払い請求書を支払えない場合は、[Zilliz Support](http://support.zilliz.com) に連絡してください。

</Procedures>

## 組織を復旧した後\{#after-recovering-your-organization}

組織の凍結が解除された後、ごみ箱に移動されたデータとリソースは自動的には復元されません。

それらを復旧するには、[ごみ箱](./use-recycle-bin) に移動し、必要なデータとリソースを手動で復元してください。 

復元後、アプリケーションが復旧したリソースに期待どおりアクセスできることを確認してください。

## 支払いの問題を回避する\{#avoid-payment-issues}

サービス中断のリスクを減らすには、次の点を実施してください。

- 残りのクレジットとクレジットの有効期限を[監視](./monitor-billing-alerts)する。

- [クレジットカード](./subscribe-by-adding-credit-card) を最新の状態に保つ。

- 残高がなくなる前に [Advance Pay](./advance-pay) を補充する。

- 有効期限が切れる前に Marketplace の [private offers](./subscribe-on-aws-marketplace-private-offer) を更新する。

- 使用量、クレジット、カードの有効性、Advance Pay 残高に対する[請求アラートを設定](./monitor-billing-alerts)する。

- [Marketplace subscription](./marketplace-subscription) が正しい Zilliz Cloud 組織にリンクされていることを確認する。

- 組織が最近初めてクレジットカードを追加した場合は、累積使用量が初めて請求しきい値に達した際の中間請求に対応できるよう、そのカードに十分な利用可能残高があることを確認する。

