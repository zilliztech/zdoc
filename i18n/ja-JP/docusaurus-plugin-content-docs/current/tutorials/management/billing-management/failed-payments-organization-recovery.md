---
title: "支払いの失敗と組織の復旧 | Cloud"
slug: /failed-payments-organization-recovery
sidebar_label: "支払いの失敗と組織の復旧"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "支払いの失敗は、組織の請求ステータスや有料 Zilliz Cloud 機能へのアクセスに影響を及ぼす可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いが完了しない場合の挙動、および組織を復旧する手順について説明します。 | Cloud"
type: origin
token: JYXswRlj9i5KE5kJ2U0cdaM5nBh
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払いの失敗と組織の復旧

支払いの失敗は、組織の請求ステータスや有料 Zilliz Cloud 機能へのアクセスに影響を及ぼす可能性があります。このガイドでは、支払い失敗の一般的な原因、支払いが完了しない場合の挙動、および組織を復旧する手順について説明します。

<Admonition type="info" icon="📘" title="**Note**">

支払いと請求の設定を管理するには、**Organization Owner** または **Organization Billing Admin** の権限が必要です。

</Admonition>

## 支払い失敗の一般的な原因\{#common-causes-for-failed-payments}

支払いは、主に以下の理由で失敗する可能性があります。

- 登録済みのクレジットカードの有効期限が切れている。

- カード発行会社によってクレジットカードの利用が拒否された。

- Advance Pay の残高が不足している。

- クレジットを使い果たした、または有効期限が切れた。

- Marketplace パブリックオファーのサブスクリプションが失効、キャンセルされた、あるいは Zilliz Cloud 組織とのリンクが解除されている。

- Marketplace プライベートオファーのサブスクリプションが失効し、更新されていない。

- Marketplace 無料トライアルのサブスクリプションが失効し、Zilliz Cloud に他の支払い方法が登録されていない。

## クレジットカードの中間請求\{#credit-card-interim-charges}

Zilliz Cloud SaaS の請求書は毎月発行されます。ただし、初めて支払い方法としてクレジットカードを追加した新規組織の場合、Zilliz Cloud は月次請求書の発行前に中間請求を行うことがあります。

中間請求は、累積使用量が &#36;100 や &#36;1,000 などの特定の請求閾値に初めて達した際に発生します。これらの閾値での中間請求が正常に完了すると、その後の請求は通常の月次請求サイクルに戻ります。

この中間請求は、新規アカウントの請求信頼性を確立し、請求サイクル中に組織のステータスを良好に保つために役立ちます。

中間請求が失敗した場合、月次請求サイクルの終了前であっても組織が即座に凍結される可能性があります。サービスの中断を避けるため、クレジットカードが有効であり、十分な利用可能枠があることを確認してください。

## サービスへの影響\{#service-impact}

Zilliz Cloud が支払いを回収できず、有効なクレジットや Advance Pay 残高もない場合、組織には未払いの請求書が発生し、凍結状態となります。

組織が凍結されると、以下の状態になります。

- Zilliz Cloud からメール通知が送信され、未払い請求書の支払いのために 15 日間の猶予期間が設けられます。猶予期間後も支払いが行われない場合、データとリソースはごみ箱へ移動されます。

- 実行中のサービスや高度な機能が制限される場合があります。

- 新しい有料リソースを作成できなくなります。

- 影響を受けた Zilliz Cloud リソースに依存するアプリケーションが停止する可能性があります。

- バックアップは、組織の凍結から 60 日後に自動的に削除されます。

## 組織の復旧\{#recover-your-organization}

アクセスを復元するには、請求に関する問題を解決し、組織に有効な支払い方法または利用可能な残高があることを確認してください。

### クレジットの有効期限切れまたは残高不足の場合\{#if-credits-expired-or-ran-out}

<Procedures>

1. [クレジットカード](./subscribe-by-adding-credit-card) や [Marketplace サブスクリプション](./marketplace-subscription) など、有効な支払い方法を追加します。

1. [Advance Pay](./advance-pay) をご利用の場合は、残高に入金します。

1. クレジットについてサポートが必要な場合は、Zilliz [s](http://zilliz.com/contact-sales)[ales](http://zilliz.com/contact-sales) または担当チームにお問い合わせください。

</Procedures>

### クレジットカードの支払いが失敗した場合\{#if-your-credit-card-payment-failed}

<Procedures>

1. Zilliz Cloud コンソールに移動します。

1. 対象の組織を開きます。

1. **Billing** に移動します。

1. クレジットカードを[変更](./subscribe-by-adding-credit-card#replace-a-credit-card)します。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。それでも未払いの請求書を支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Advance Pay の残高が不足している場合\{#if-your-advance-pay-balance-is-insufficient}

<Procedures>

1. [Advance Pay](./advance-pay) の残高に入金します。

1. 更新された残高が Billing ページに反映されていることを確認します。

1. 残高の更新後も組織が凍結されたままの場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

### Marketplace サブスクリプションが失効またはキャンセルされた場合\{#if-your-marketplace-subscription-expired-or-was-canceled}

<Procedures>

1. Marketplace のサブスクリプション状況を確認します。

    1. Marketplace の **無料トライアル** サブスクリプションが失効した場合は、有料サブスクリプションへ[アップグレード](./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription)します。

    1. Marketplace の **パブリックオファー** サブスクリプションがキャンセルされた場合は、再度[サブスクライブ](./subscribe-on-aws-marketplace)するか、[別の支払い方法に切り替え](./update-payment-method)ます。

    1. Marketplace の **プライベートオファー** サブスクリプションが失効した場合は、プライベートオファーを[更新](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer)するか、アカウントエグゼクティブにお問い合わせください。

1. Billing ページの **Payment Method** セクションで、サブスクリプションが更新されていることを確認します。

1. 支払いを[再試行](./manage-invoice#pay-invoice)します。それでも未払いの請求書を支払えない場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

</Procedures>

## 組織の復旧後\{#after-recovering-your-organization}

組織の凍結が解除されても、ごみ箱に移動されたデータとリソースは自動的には復元されません。

これらを復旧するには、[ごみ箱](./use-recycle-bin) に移動し、必要なデータとリソースを手動で復元してください。

復元後は、アプリケーションが復旧したリソースに正常にアクセスできることを確認してください。

## 支払いの問題を防ぐ\{#avoid-payment-issues}

サービスの中断リスクを軽減するには、以下の対応を推奨します。

- クレジットの残高と有効期限を[監視](./monitor-billing-alerts)します。

- [クレジットカード](./subscribe-by-adding-credit-card) の情報を最新の状態に保ちます。

- 残高がなくなる前に [Advance Pay](./advance-pay) を補充します。

- Marketplace の[プライベートオファー](./subscribe-on-aws-marketplace-private-offer)は有効期限が切れる前に更新します。

- 使用量、クレジット、カードの有効性、Advance Pay 残高について[請求アラートを設定](./monitor-billing-alerts)します。

- [Marketplace サブスクリプション](./marketplace-subscription)が正しい Zilliz Cloud 組織にリンクされていることを確認します。

- 組織で最近初めてクレジットカードを追加した場合は、累積使用量が請求閾値に達した際の中間請求に備え、カードに十分な利用可能枠があることを確認してください。

