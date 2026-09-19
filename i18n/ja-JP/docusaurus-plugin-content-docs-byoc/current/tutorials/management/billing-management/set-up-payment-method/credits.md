---
title: "クレジット | BYOC"
slug: /credits
sidebar_label: "クレジット"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クレジットは、Zilliz Cloud の利用料金の支払いに充当できます。仕事用のメールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットが付与されることがあります。 | BYOC"
type: origin
token: YWhwwvlxOiGk9gkTm0Pc2w00npe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クレジット

クレジットは、Zilliz Cloud の利用料金の支払いに充当できます。仕事用のメールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットが付与されることがあります。

<Admonition type="info" title="Note">

クレジットと支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** であることが必要です。

</Admonition>

## クレジットの仕組み\{#how-credits-work}

クレジットは、他の[支払い方法](./payment-billing#payment-methods)より先に、利用料金へ自動的に適用されます。

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud はそれらを次の順序で適用します。

1. クレジット

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

## クレジットの有効期限\{#credit-validity}

クレジットには有効期限があります。有効期限が切れたクレジットは、今後の利用料金の支払いに使用できません。

利用可能なクレジットを失わないようにするには、次の点を確認してください。

- 残りのクレジット残高を定期的に確認します。

- クレジットの有効期限までの残り日数を確認します。

- クレジットは有効期限内に使用します。

- 有効な支払い方法を追加して、クレジットの有効期限を 30 日から 1 年に延長します。

- クレジットの有効期限について不明な点がある場合は、[Zilliz Support](http://support.zilliz.com) または担当営業にお問い合わせください。

## クレジットと支払い方法\{#credits-and-payment-methods}

クレジットは、Advance Pay 残高または Marketplace サブスクリプションのいずれかと併用できます。

ただし、クレジットは長期的な支払い方法の代わりにはなりません。クレジットを使い切るか有効期限が切れ、他に有効な支払い方法がない場合、組織は高度な機能へのアクセスを失い、凍結状態になります。

クレジットを使い切った後も Zilliz Cloud を引き続き利用するには、次のいずれかの支払い方法を設定してください。

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [AWS Marketplace サブスクリプション](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace サブスクリプション](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace サブスクリプション](./subscribe-on-azure-marketplace)

## クレジットを申請する\{#apply-for-credits}

PoC のためにさらにクレジットが必要な場合は、[営業担当にお問い合わせ](http://zilliz.com/contact-sales)いただくか、担当営業にご連絡ください。

## クレジット残高を確認する\{#view-credit-balance}

クレジット残高を確認するには、次の手順を実行します。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で対象の組織に移動します。

1. **Billing** に移動します。

1. **Credits** セクションで残りの残高を確認します。

</Procedures>

## クレジットアラートを監視する\{#monitor-credit-alerts}

Zilliz Cloud には、クレジットと支払いの健全性を監視するのに役立つ請求アラートが用意されています。

| **メトリクス** | **説明** | **推奨される対応** |
| --- | --- | --- |
| Credit Validity (days) | 無料クレジットの有効期限が切れるまでの日数。 | 対象となるクレジットを期限切れ前に使用するか、PoC を完全に完了するためにクレジットの有効期限を延長する必要がある場合は [Zilliz sales](http://zilliz.com/contact-sales) にお問い合わせください。 |
| Remaining Credits (&#36;) | 残りのクレジット残高。 | クレジットを使い切る前に、別の支払い方法を追加または設定してください。PoC 用のクレジットを追加する場合は [Zilliz sales](http://zilliz.com/contact-sales) にお問い合わせいただけます。 |

