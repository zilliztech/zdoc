---
title: "支払い失敗と組織の復旧 | Cloud"
slug: /failed-payments-organization-recovery
sidebar_key: failed-payments-organization-recovery
sidebar_label: "支払い失敗と組織の復旧"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "支払いの失敗は、組織の請求ステータスや Zilliz Cloud の有料機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に起こること、および組織を復旧する方法について説明します。 | Cloud"
type: origin
token: JYXswRlj9i5KE5kJ2U0cdaM5nBh
sidebar_position: 8
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - 請求書
  - 延滞
  - 凍結
  - 組織の復旧
  - 支払い失敗

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払い失敗と組織の復旧

支払いの失敗は、組織の請求ステータスや Zilliz Cloud の有料機能へのアクセスに影響する可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いを完了できない場合に起こること、および組織を復旧する方法について説明します。

<Admonition type="info" icon="📘" title="**Note**">

支払いと請求設定を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 支払い失敗の一般的な原因\{#common-causes-for-failed-payments}

支払いは、いくつかの理由で失敗することがあります。

- 登録済みのクレジットカードの有効期限が切れている。

- クレジットカードがカード発行会社により拒否されている。

- Advance Pay 残高が不足している。

- Credits が使い切られている、または有効期限が切れている。

- Marketplace の Public Offer サブスクリプションが期限切れ、キャンセル済み、または Zilliz Cloud 組織にリンクされていない。

- Marketplace の Private Offer サブスクリプションが期限切れで、更新されていない。

- Marketplace の無料トライアルサブスクリプションが期限切れで、Zilliz Cloud で他の支払い方法が提供されていない。

## クレジットカードの中間請求\{#credit-card-interim-charges}

Zilliz Cloud SaaS の請求書は毎月発行されます。ただし、初めてクレジットカードを支払い方法として追加する新しい組織の場合、Zilliz Cloud は月次請求書が発行される前に中間請求を行うことがあります。

中間請求は、累積使用量が初めて特定の請求しきい値（&#36;100 や &#36;1,000 など）に達したときに発生します。これらのしきい値での中間請求が正常に完了すると、以降の請求は通常の月次請求サイクルに従います。

これらの中間請求は、新しいアカウントの請求の信頼性を確立し、請求サイクル中に組織を良好な状態に保つのに役立ちます。

中間請求が失敗した場合、月次請求サイクルが終了していなくても、組織は即座に凍結される可能性があります。サービスの中断を避けるために、クレジットカードが有効であり、十分な利用可能残高があることを確認してください。

## サービスへの影響\{#service-impact}

Zilliz Cloud が支払いを回収できず、有効な Credits または Advance Pay 残高もない場合、組織には延滞請求書が発生し、凍結されます。

組織が凍結されると、次の状態になります。

- Zilliz Cloud はメール通知を送信し、延滞請求書を支払うための 15 日間の猶予期間を提供します。猶予期間後も請求書が未払いのままの場合、データとリソースはごみ箱に移動されます。

- 実行中のサービスや高度な機能が制限される場合があります。

- 新しい有料リソースを作成できません。

- 影響を受けた Zilliz Cloud リソースに依存するアプリケーションが中断される場合があります。

- バックアップは、組織が凍結されてから60日後に自動的に削除されます。

## 組織を復旧する\{#recover-your-organization}

アクセスを復旧するには、請求の問題を解決し、組織に有効な支払い方法または利用可能な残高があることを確認します。

### Credits の有効期限が切れた、または使い切った場合\{#if-credits-expired-or-ran-out}

<Procedures>

1. [クレジットカード](./subscribe-by-adding-credit-card)や [Marketplace サブスクリプション](./marketplace-subscription)など、有効な支払い方法を追加します。

1. [Advance Pay](./advance-pay) を使用している場合は、残高に入金します。

1. Credits に関するサポートが必要な場合は、[Zilliz sales](http://zilliz.com/contact-sales) または担当アカウントチームにお問い合わせください。

</Procedures>

### クレジットカード支払いに失敗した場合\{#if-your-credit-card-payment-failed}

<Procedures>

1. Zilliz Cloud コンソールに移動します。

1. 組織を開きます。

1. **Billing** に移動します。

1. クレジットカードを[置き換えます](./subscribe-by-adding-credit-card#replace-a-credit-card)。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。延滞請求書をまだ支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Advance Pay 残高が不足している場合\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. [Advance Pay](./advance-pay) 残高に入金します。

1. 更新された残高が Billing ページに表示されていることを確認します。

1. 残高の更新後も組織が凍結されたままの場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Marketplace サブスクリプションが期限切れまたはキャンセルされた場合\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. Marketplace サブスクリプションを確認します。

    1. Marketplace の **Free Trial** サブスクリプションが期限切れの場合は、有料サブスクリプションに[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)します。

    1. Marketplace の **Public Offer** サブスクリプションがキャンセルされた場合は、再度[サブスクライブ](./subscribe-on-aws-marketplace)するか、[他の支払い方法に切り替え](./update-payment-method)ます。

    1. Marketplace の **Private Offer** サブスクリプションが期限切れの場合は、Private Offer を[更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)するか、担当アカウントエグゼクティブにお問い合わせください。

1. Billing ページの **Payment Method** セクションで、更新されたサブスクリプションを確認します。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。延滞請求書をまだ支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

## 組織の復旧後\{#after-recovering-your-organization}

組織の凍結が解除された後、ごみ箱に移動されたデータとリソースは自動的には復元されません。

復旧するには、[ごみ箱](./use-recycle-bin)に移動し、必要なデータとリソースを手動で復元します。

復元後、アプリケーションが復旧したリソースに想定どおりアクセスできることを確認します。

## 支払いの問題を回避する\{#avoid-payment-issues}

サービス中断のリスクを軽減するには、次の点を確認してください。

- 残りの Credits と Credits の有効期限を[監視](./monitor-billing-alerts)します。

- [クレジットカード](./subscribe-by-adding-credit-card)を最新の状態に保ちます。

- 残高がなくなる前に [Advance Pay](./advance-pay) に再入金します。

- Marketplace の [Private Offer](./subscribe-on-aws-marketplace-private-offer) を期限切れになる前に更新します。

- 使用量、Credits、カードの有効性、Advance Pay 残高について、[請求アラートを設定](./monitor-billing-alerts)します。

- [Marketplace サブスクリプション](./marketplace-subscription)が正しい Zilliz Cloud 組織にリンクされていることを確認します。

- 組織が初めてクレジットカードを追加したばかりの場合は、累積使用量が初めて請求しきい値に達したときの中間請求に備えて、カードの利用可能残高が十分であることを確認します。
