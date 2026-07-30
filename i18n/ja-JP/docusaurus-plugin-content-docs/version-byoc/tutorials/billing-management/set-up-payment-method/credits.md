---
title: "Credits | BYOC"
slug: /credits
sidebar_key: credits
sidebar_label: "Credits"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Credits は Zilliz Cloud の使用料金に充当できます。Zilliz Cloud に勤務先メールで登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または PoC 用に Zilliz から Credits を受け取った場合に付与されることがあります。 | BYOC"
type: origin
token: YWhwwvlxOiGk9gkTm0Pc2w00npe
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 支払い
  - 請求
  - credits

---

import Admonition from '@theme/Admonition';

import Procedures from '@site/src/components/Procedures';

# Credits

Credits は Zilliz Cloud の使用料金に充当できます。Zilliz Cloud に勤務先メールで登録した場合、対象となる Zilliz Cloud のプログラムやイベントに参加した場合、または PoC 用に Zilliz から Credits を受け取った場合に付与されることがあります。

<Admonition type="info" icon="📘" title="Note">

Credits と支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## Credits の仕組み\{#how-credits-work}

Credits は、他の[支払い方法](./payment-billing#payment-methods)より前に使用料金へ自動的に適用されます。

複数の支払い方法または残高が利用可能な場合、Zilliz Cloud は次の順序で適用します。

1. Credits

1. Advance Pay 残高

1. クレジットカードまたは Marketplace サブスクリプション

## Credits の有効期限\{#credit-validity}

Credits には有効期限があります。期限切れの Credits は、将来の使用料金に充当できません。

利用可能な Credits を失わないようにするには、次の点を確認してください。

- 残りの Credits 残高を定期的に確認します。

- Credits の有効期限までの日数を確認します。

- 期限切れになる前に Credits を使用します。

- 有効な支払い方法を追加し、Credits の有効期限を 30 日から 1 年に延長します。

- Credits の有効期限について質問がある場合は、[Zilliz Support](http://support.zilliz.com) または担当アカウントエグゼクティブにお問い合わせください。

## Credits と支払い方法\{#credits-and-payment-methods}

Credits は、Advance Pay 残高または Marketplace サブスクリプションと併用できます。

ただし、Credits は長期的な支払い方法の代替にはなりません。Credits がなくなるか期限切れになり、他に有効な支払い方法がない場合、組織は高度な機能にアクセスできなくなり、凍結されます。

Credits の使用後も Zilliz Cloud を継続して利用するには、次のいずれかの支払い方法を設定します。

- [クレジットカード](./subscribe-by-adding-credit-card)

- [Advance Pay](./advance-pay)

- [AWS Marketplace サブスクリプション](./subscribe-on-aws-marketplace)

- [Google Cloud Marketplace サブスクリプション](./subscribe-on-gcp-marketplace)

- [Microsoft Marketplace サブスクリプション](./subscribe-on-azure-marketplace)

## Credits を申請する\{#apply-for-credits}

PoC 用に追加の Credits が必要な場合は、[営業担当にお問い合わせ](http://zilliz.com/contact-sales)いただくか、担当アカウントエグゼクティブにご連絡ください。

## Credits 残高を確認する\{#view-credit-balance}

Credits 残高を確認するには、次の手順に従います。

![FWMbwmjNKh6Qt3btRCyc4KKSnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/FWMbwmjNKh6Qt3btRCyc4KKSnZf.png)

<Procedures>

1. Zilliz Cloud で組織に移動します。

1. **Billing** に移動します。

1. **Credits** セクションで残高を確認します。

</Procedures>

## Credits アラートを監視する\{#monitor-credit-alerts}

Zilliz Cloud は、Credits と支払い状況の監視に役立つ請求アラートを提供します。

<table>
   <tr>
     <th><p><strong>メトリクス</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>推奨される対応</strong></p></th>
   </tr>
   <tr>
     <td><p>Credit Validity (days)</p></td>
     <td><p>無料 Credits の有効期限までの日数。</p></td>
     <td><p>期限切れになる前に対象の Credits を使用するか、PoC を完了するために有効期限の延長が必要な場合は <a href="http://zilliz.com/contact-sales">Zilliz 営業担当</a>にお問い合わせください。</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits ($)</p></td>
     <td><p>残りの Credits 残高。</p></td>
     <td><p>Credits を使い切る前に、別の支払い方法を追加または設定してください。追加の PoC Credits については、<a href="http://zilliz.com/contact-sales">Zilliz 営業担当</a>にお問い合わせいただけます。</p></td>
   </tr>
</table>
