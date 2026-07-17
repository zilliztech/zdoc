---
title: "請求アラートの監視 | Cloud"
slug: /monitor-billing-alerts
sidebar_label: "請求アラートの監視"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 組織の最近の使用状況、クレジットのステータス、支払い方法の有効性、前払い残高を追跡するために請求アラートを監視します。これらのアラートは、想定外の支出を検知し、サービス中断のリスクを減らすために適時に支払い方法を更新するのに役立ちます。 | Cloud"
type: origin
token: XCZaw6aKbixxWIkMssEchOtOnlg
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 請求アラートの監視

Zilliz Cloud 組織の最近の使用状況、クレジットのステータス、支払い方法の有効性、前払い残高を追跡するために請求アラートを監視します。これらのアラートは、想定外の支出を検知し、サービス中断のリスクを減らすために適時に支払い方法を更新するのに役立ちます。

このガイドでは、請求関連のアラートについて説明します。請求アラートの設定方法については、[Organization Alerts の管理](./manage-organization-alerts)を参照してください。

<Admonition type="info" icon="📘" title="**注記**">

請求アラートを表示または管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 請求アラートのメトリクス\{#billing-alert-metrics}

Zilliz Cloud は、次の請求アラートメトリクスを提供します。

| **メトリクス** | **説明** | **推奨される対応** |
| --- | --- | --- |
| Usage Amount in the Past Day ($) | 過去 1 日間の累積使用料金。 | 使用量を予算と比較してください。使用量が想定より多い場合は、最近のアクティビティを確認し、[ワークロードを最適化](./cost-optimization)するか、必要に応じて予算を調整してください。 |
| Credit Validity (days) | 無料クレジットの有効期限が切れるまでの日数。 | 対象となるクレジットは有効期限が切れる前に使用するか、クレジットの有効期限についてサポートが必要な場合は[営業にお問い合わせ](http://zilliz.com/contact-sales)ください。 |
| Remaining Credits ($) | 無料クレジットの残高。 | サービス中断を避けるため、クレジットがなくなる前に、[Credits](./credits) や [Credit Card](./subscribe-by-adding-credit-card) などの別の支払い方法を設定してください。 |
| Credit Card Validity (days) | 保存済みクレジットカードの有効期限が切れるまでの日数。 | 支払い失敗を避けるため、有効期限前に[クレジットカードを交換](./subscribe-by-adding-credit-card#replace-a-credit-card)してください。 |
| Advance Pay Balance ($) | 前払い Advance Pay の残高。 | 残高が少なくなったら、支払いの問題やサービス中断を防ぐために[入金](./advance-pay#add-funds-to-advance-pay)してください。 |

## **推奨アラート**\{#recommended-alerts}

組織の支払い方法と使用パターンに基づいてアラートを設定してください。

<table>
   <tr>
     <th><p><strong>支払い設定</strong></p></th>
     <th><p><strong>推奨アラート</strong></p></th>
   </tr>
   <tr>
     <td><p>無料クレジットのみ</p></td>
     <td><ul><li><p>Credit Validity</p></li><li><p>Remaining Credits</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><ul><li><p>Credit Card Validity</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Advance Pay</p></td>
     <td><ul><li><p>Advance Pay Balance</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Marketplace サブスクリプション</p></td>
     <td><ul><li>Usage Amount in the Past Day</li></ul></td>
   </tr>
   <tr>
     <td><p>クレジット + 有料の支払い方法</p></td>
     <td><ul><li><p>Credit Validity</p></li><li><p>Remaining Credits</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
</table>

## ベストプラクティス\{#best-practices}

- 想定される 1 日あたりの支出に基づいて使用量アラートを設定してください。

- テストや PoC の間は残りのクレジットを監視してください。さらに多くのクレジットを申請する必要がある場合は、[営業にお問い合わせ](http://zilliz.com/contact-sales)ください。

- サービス中断を防ぐため、クレジットカードの有効期限または Advance Pay の残高を監視し、適時に支払い方法を更新してください。

