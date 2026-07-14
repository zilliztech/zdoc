---
title: "支払い失敗と組織の復旧 | Cloud"
slug: /failed-payments-organization-recovery
sidebar_label: "支払い失敗と組織の復旧"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "支払い失敗は、組織の請求ステータスや有料の Zilliz Cloud 機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に何が起こるか、そして組織を復旧する方法について説明します。 | Cloud"
type: origin
token: JYXswRlj9i5KE5kJ2U0cdaM5nBh
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払い失敗と組織の復旧

支払い失敗は、組織の請求ステータスや有料の Zilliz Cloud 機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に何が起こるか、そして組織を復旧する方法について説明します。

<Admonition type="info" icon="📘" title="**注**">

支払いおよび請求設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い失敗の一般的な原因\{#common-causes-for-failed-payments}

支払いは、いくつかの理由で失敗する可能性があります。

- 保存されているクレジットカードの有効期限が切れている。

- クレジットカードがカード発行会社によって拒否されている。

- Advance Pay の残高が不足している。

- クレジットが使い切られている、または有効期限が切れている。

- Marketplace public offer のサブスクリプションの有効期限が切れている、キャンセルされている、または Zilliz Cloud 組織にリンクされなくなっている。

- Marketplace private offer のサブスクリプションの有効期限が切れており、更新されていない。

- Marketplace free trial のサブスクリプションの有効期限が切れており、Zilliz Cloud に他の支払い方法が設定されていない。

## クレジットカードの中間請求\{#credit-card-interim-charges}

Zilliz Cloud SaaS の請求書は毎月発行されます。ただし、新しい組織が初めて支払い方法としてクレジットカードを追加した場合、Zilliz Cloud は毎月の請求書が発行される前に中間請求を実行することがあります。

中間請求は、累積使用量が &#36;100 や &#36;1,000 などの特定の請求しきい値に初めて達したときに発生します。これらのしきい値での中間請求が正常に完了すると、その後の請求は通常の毎月の請求サイクルに従います。

これらの中間請求は、新規アカウントの請求の信頼性を確立し、請求サイクル中に組織を良好な状態に保つのに役立ちます。

中間請求に失敗すると、毎月の請求サイクルが終了していなくても、組織が即座に凍結される可能性があります。サービスの中断を避けるため、クレジットカードが有効であり、利用可能残高が十分であることを確認してください。

## サービスへの影響\{#service-impact}

Zilliz Cloud が支払いを回収できず、有効なクレジットまたは Advance Pay 残高も利用できない場合、組織には期限超過の請求書が発生し、凍結状態になります。

組織が凍結されると、次のようになります。

- Zilliz Cloud はメール通知を送信し、期限超過の請求書を支払うための 15 日間の猶予期間を提供します。猶予期間後も請求書が未払いのままである場合、データとリソースはごみ箱に移動されます。

- 実行中のサービスおよび高度な機能が制限される場合があります。

- 新しい有料リソースを作成できなくなります。

- 影響を受けた Zilliz Cloud リソースに依存するアプリケーションが中断される可能性があります。

## 組織を復旧する\{#recover-your-organization}

アクセスを復元するには、請求の問題を解決し、組織に有効な支払い方法または利用可能な残高があることを確認してください。

### クレジットの有効期限が切れた、または使い切った場合\{#if-credits-expired-or-ran-out}

<Procedures>

1. [credit card](./subscribe-by-adding-credit-card) や [Marketplace subscription](./undefined) などの有効な支払い方法を追加します。

1. [Advance Pay](./advance-pay) を使用している場合は、残高に入金します。

1. クレジットに関してサポートが必要な場合は、Zilliz [s](http://zilliz.com/contact-sales)[ales](http://zilliz.com/contact-sales) または担当アカウントチームにお問い合わせください。

</Procedures>

### クレジットカードでの支払いに失敗した場合\{#if-your-credit-card-payment-failed}

<Procedures>

1. Zilliz Cloud コンソールに移動します。

1. 組織を開きます。

1. **Billing** に移動します。

1. クレジットカードを[差し替え](./subscribe-by-adding-credit-card#replace-a-credit-card)ます。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。期限超過の請求書をまだ支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Advance Pay 残高が不足している場合\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. [Advance Pay](./advance-pay) 残高に入金します。

1. 更新された残高が Billing ページに表示されることを確認します。

1. 残高更新後も組織が凍結されたままの場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Marketplace サブスクリプションの有効期限が切れた、またはキャンセルされた場合\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. marketplace サブスクリプションを確認します。

    1. Marketplace **free trial** のサブスクリプションの有効期限が切れた場合は、有料サブスクリプションに[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)します。

    1. Marketplace **public offer** のサブスクリプションがキャンセルされた場合は、再度[サブスクライブ](./subscribe-on-aws-marketplace)するか、[他の支払い方法に切り替え](./update-payment-method)ます。

    1. Marketplace **private offer** のサブスクリプションの有効期限が切れた場合は、private offer を[更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)するか、担当のアカウントエグゼクティブにお問い合わせください。

1. Billing ページの **Payment Method** セクションで更新後のサブスクリプションを確認します。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。期限超過の請求書をまだ支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

## 組織の復旧後\{#after-recovering-your-organization}

組織の凍結が解除された後、ごみ箱に移動されたデータとリソースは自動的には復元されません。

復旧するには、[recycle bin](./use-recycle-bin) に移動し、必要なデータとリソースを手動で復元してください。 

復元後、アプリケーションが復旧したリソースに期待どおりアクセスできることを確認してください。

## 支払いの問題を回避する\{#avoid-payment-issues}

サービス中断のリスクを減らすには、次のことを行ってください。

- 残りのクレジットとクレジットの有効期限を[監視](./monitor-billing-alerts)する。

- [credit card](./subscribe-by-adding-credit-card) を最新の状態に保つ。

- 残高がなくなる前に [Advance Pay](./advance-pay) を補充する。

- 有効期限が切れる前に Marketplace の [private offers](./subscribe-on-aws-marketplace-private-offer) を更新する。

- 使用量、クレジット、カードの有効性、Advance Pay 残高に関する[請求アラートを設定](./monitor-billing-alerts)する。

- [Marketplace subscription](./undefined) が正しい Zilliz Cloud 組織にリンクされていることを確認する。

- 組織が最近初めてクレジットカードを追加した場合は、累積使用量が最初に請求しきい値に達したときの中間請求に備えて、カードに十分な利用可能残高があることを確認する。

