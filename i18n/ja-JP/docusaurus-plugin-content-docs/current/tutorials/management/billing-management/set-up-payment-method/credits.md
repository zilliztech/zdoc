---
title: "クレジット | Cloud"
slug: /credits
sidebar_label: "クレジット"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クレジットは、Zilliz Cloud の利用料金の支払いに充当できます。仕事用のメールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットを受け取ることがあります。 | Cloud"
type: origin
token: YWhwwvlxOiGk9gkTm0Pc2w00npe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クレジット

クレジットは、Zilliz Cloud の利用料金の支払いに充当できます。仕事用のメールアドレスで Zilliz Cloud に登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または概念実証（PoC）のために Zilliz からクレジットを受け取った場合に、クレジットを受け取ることがあります。

クレジットは、長期的な支払い方法を設定する前に、Zilliz Cloud を試したり、評価用のワークロードを実行したりするのに役立ちます。

<Admonition type="info" title="Note">

クレジットと支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## クレジットの仕組み\{#how-credits-work}

クレジットは、他の[支払い方法](./payment-billing#payment-methods)より先に、利用料金に自動的に適用されます。

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. クレジット

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

## クレジットの有効性\{#credit-validity}

クレジットには有効期限があります。有効期限が切れたクレジットは、今後の利用料金の支払いに充当できません。

利用可能なクレジットを失わないようにするには、次の点に注意してください。

- 残りのクレジット残高を定期的に確認してください。

- クレジットの有効期限までの日数を確認してください。

- クレジットは有効期限が切れる前に使用してください。

- 有効な支払い方法を追加して、クレジットの有効期間を 30 日から 1 年に延長してください。

- クレジットの有効性について質問がある場合は、[Zilliz Support](http://support.zilliz.com) または担当のアカウントエグゼクティブにお問い合わせください。

## クレジットと支払い方法\{#credits-and-payment-methods}

クレジットは、クレジットカード、Advance Pay 残高、または Marketplace サブスクリプションのいずれかと併用できます。

ただし、クレジットは長期的な支払い方法の代替にはなりません。クレジットを使い切るか有効期限が切れ、他に有効な支払い方法がない場合、組織は高度な機能にアクセスできなくなり、凍結されます。

クレジットを使い切った後も Zilliz Cloud の使用を続けるには、次のいずれかの支払い方法を設定してください。

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [AWS Marketplace サブスクリプション](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace サブスクリプション](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace サブスクリプション](./subscribe-on-azure-marketplace)

## クレジットを申請する\{#apply-for-credits}

PoC のためにさらにクレジットが必要な場合は、[営業担当](http://zilliz.com/contact-sales) または担当のアカウントエグゼクティブにお問い合わせください。

## クレジット残高を表示する\{#view-credit-balance}

クレジット残高を表示するには、次の手順に従います。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で自分の組織に移動します。

1. **Billing** に移動します。

1. **Credits** セクションで残りの残高を確認します。

</Procedures>

## クレジットアラートを監視する\{#monitor-credit-alerts}

Zilliz Cloud は、クレジットと支払いの健全性を監視するのに役立つ請求アラートを提供しています。

| **指標** | **説明** | **推奨アクション** |
| --- | --- | --- |
| Credit Validity (days) | 無料クレジットの有効期限までの日数。 | 対象となるクレジットを有効期限前に使用するか、PoC を完全に完了するためにクレジットの有効期限を延長する必要がある場合は [Zilliz 営業担当](http://zilliz.com/contact-sales) にお問い合わせください。 |
| Remaining Credits (&#36;) | 残りのクレジット残高。 | クレジットがなくなる前に、別の支払い方法を追加または設定してください。PoC 用の追加クレジットについては、[Zilliz 営業担当](http://zilliz.com/contact-sales) にお問い合わせいただけます。 |

