---
title: "請求アラートを監視 | Cloud"
slug: /monitor-billing-alerts
sidebar_key: monitor-billing-alerts
sidebar_label: "請求アラートを監視"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "請求アラートを監視して、Zilliz Cloud 組織の最近の使用量、Credits の状態、支払い方法の有効性、前払い残高を追跡します。これらのアラートは、想定外の支出を検出し、支払い方法を適時に更新してサービス中断のリスクを軽減するのに役立ちます。 | Cloud"
type: origin
token: XCZaw6aKbixxWIkMssEchOtOnlg
sidebar_position: 9
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - 使用量
  - 監視
  - 請求アラート

---

import Admonition from '@theme/Admonition';


# 請求アラートを監視

請求アラートを監視して、Zilliz Cloud 組織の最近の使用量、Credits の状態、支払い方法の有効性、前払い残高を追跡します。これらのアラートは、想定外の支出を検出し、支払い方法を適時に更新してサービス中断のリスクを軽減するのに役立ちます。

このガイドでは、請求関連のアラートについて説明します。請求アラートの設定方法については、[組織アラートの管理](./manage-organization-alerts)を参照してください。

<Admonition type="info" icon="📘" title="**Note**">

請求アラートを表示または管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## 請求アラートのメトリクス\{#billing-alert-metrics}

Zilliz Cloud では、以下の請求アラートメトリクスを提供しています。

<table>
   <tr>
     <th><p><strong>メトリクス</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>推奨アクション</strong></p></th>
   </tr>
   <tr>
     <td><p>Usage Amount in the Past Day ($)</p></td>
     <td><p>過去 1 日の累積使用料金。</p></td>
     <td><p>使用量を予算と比較します。使用量が想定より高い場合は、最近のアクティビティを確認し、必要に応じて<a href="./cost-optimization">ワークロードを最適化</a>するか予算を調整します。</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity (days)</p></td>
     <td><p>無料 Credits が期限切れになるまでの日数。</p></td>
     <td><p>期限切れになる前に対象 Credits を使用するか、Credits の有効性についてサポートが必要な場合は <a href="http://zilliz.com/contact-sales">sales にお問い合わせ</a>ください。</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits ($)</p></td>
     <td><p>無料 Credits の残高。</p></td>
     <td><p>サービス中断を避けるため、Credits がなくなる前に<a href="./set-up-payment-method">別の支払い方法を設定</a>します。</p></td>
   </tr>
   <tr>
     <td><p>Credit Card Validity (days)</p></td>
     <td><p>登録済みクレジットカードの有効期限までの日数。</p></td>
     <td><p>支払い失敗を避けるため、有効期限が切れる前に<a href="./subscribe-by-adding-credit-card#replace-a-credit-card">クレジットカードを置き換え</a>ます。</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay Balance ($)</p></td>
     <td><p>残りの前払い済み Advance Pay 残高。</p></td>
     <td><p>残高が少なくなったら<a href="./advance-pay#add-funds-to-advance-pay">入金</a>して、支払いの問題やサービス中断を防ぎます。</p></td>
   </tr>
</table>

## **推奨アラート**\{#recommended-alerts}

組織の支払い方法と使用パターンに基づいてアラートを設定します。

<table>
   <tr>
     <th><p><strong>支払い設定</strong></p></th>
     <th><p><strong>推奨アラート</strong></p></th>
   </tr>
   <tr>
     <td><p>無料 Credits のみ</p></td>
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
     <td><p>Credits + 有料の支払い方法</p></td>
     <td><ul><li><p>Credit Validity</p></li><li><p>Remaining Credits</p></li><li><p>Usage Amount in the Past Day</p></li></ul></td>
   </tr>
</table>

## ベストプラクティス\{#best-practices}

- 想定される日次支出に基づいて使用量アラートを設定します。

- テストまたは PoC 中は、残りの Credits を監視します。追加 Credits を申請する必要がある場合は、[sales にお問い合わせ](http://zilliz.com/contact-sales)ください。

- サービス中断を防ぐため、クレジットカードの有効性または Advance Pay 残高を監視し、支払い方法を適時に更新します。
