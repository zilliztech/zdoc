---
title: "クレジット | Cloud"
slug: /credits
sidebar_label: "クレジット"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クレジットは、Zilliz Cloud の利用料金の支払いに使用できます。仕事用メールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットを取得できることがあります。 | Cloud"
type: origin
token: YWhwwvlxOiGk9gkTm0Pc2w00npe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クレジット

クレジットは、Zilliz Cloud の利用料金の支払いに使用できます。仕事用メールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットを取得できることがあります。

クレジットを利用すると、長期的な支払い方法を設定する前に、Zilliz Cloud を試したり、評価用ワークロードを実行したりできます。

<Admonition type="info" icon="📘" title="📘 注記">

クレジットと支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## クレジットの仕組み\{#how-credits-work}

クレジットは、他の[支払い方法](./payment-billing#payment-methods)より先に、利用料金に自動的に適用されます。

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. クレジット

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

## クレジットの有効期限\{#credit-validity}

クレジットには有効期限があります。有効期限が切れたクレジットは、今後の利用料金の支払いには使用できません。

利用可能なクレジットを失わないようにするには、次の点に注意してください。

- 残りのクレジット残高を定期的に確認する。

- クレジットの有効期限までの残り日数を確認する。

- 有効期限が切れる前にクレジットを使用する。

- 有効な支払い方法を追加して、クレジットの有効期間を 30 日から 1 年に延長する。

- クレジットの有効期限について質問がある場合は、[Zilliz Support](http://support.zilliz.com) または担当営業に連絡する。

## クレジットと支払い方法\{#credits-and-payment-methods}

クレジットは、クレジットカード、Advance Pay 残高、または Marketplace サブスクリプションのいずれかと併用できます。

ただし、クレジットは長期的な支払い方法の代替ではありません。クレジットを使い切るか有効期限が切れ、他に有効な支払い方法がない場合、組織は高度な機能にアクセスできなくなり、凍結状態になります。

クレジットを使い切った後も Zilliz Cloud を継続して利用するには、次のいずれかの支払い方法を設定してください。

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [AWS Marketplace サブスクリプション](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace サブスクリプション](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace サブスクリプション](./subscribe-on-azure-marketplace)

## クレジットを申請する\{#apply-for-credits}

PoC のためにさらに多くのクレジットが必要な場合は、[営業にお問い合わせ](http://zilliz.com/contact-sales)いただくか、担当営業にご連絡ください。

## クレジット残高を確認する\{#view-credit-balance}

クレジット残高を確認するには、次の手順を行います。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で自分の組織に移動します。

1. **Billing** に進みます。

1. **Credits** セクションで残高を確認します。

</Procedures>

## クレジットアラートを監視する\{#monitor-credit-alerts}

Zilliz Cloud は、クレジットと支払い状況の健全性を監視するのに役立つ請求アラートを提供します。

| **指標** | **説明** | **推奨アクション** |
| --- | --- | --- |
| Credit Validity (days) | 無料クレジットの有効期限までの日数。 | 対象となるクレジットを有効期限前に使用するか、PoC を完全に完了するためにクレジットの有効期限延長が必要な場合は [Zilliz sales](http://zilliz.com/contact-sales) に連絡してください。 |
| Remaining Credits ($) | 残りのクレジット残高。 | クレジットを使い切る前に、別の支払い方法を追加または設定してください。PoC 用の追加クレジットについては、[Zilliz sales](http://zilliz.com/contact-sales) に連絡できます。 |

