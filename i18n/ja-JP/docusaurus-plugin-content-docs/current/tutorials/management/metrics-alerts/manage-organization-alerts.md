---
title: "組織アラートの管理 | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織アラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud organization 全体の請求およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに特化したプロジェクトアラートとは異なり、組織アラートではクレジット残高、支払い方法、利用状況を追跡でき、サービスの継続性を確保し、予期しない請求トラブルを未然に防げます。クレジットの枯渇、支払いの失敗、使用量の閾値に関する通知をタイムリーに受け取ることで、アカウントの健全性を把握し、サービス停止を回避できます。 | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートの管理

組織アラートは、Zilliz Cloud organization 全体の請求およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに特化したプロジェクトアラートとは異なり、組織アラートではクレジット残高、支払い方法、利用状況を追跡でき、サービスの継続性を確保し、予期しない請求トラブルを未然に防げます。クレジットの枯渇、支払いの失敗、使用量の閾値に関する通知をタイムリーに受け取ることで、アカウントの健全性を把握し、サービス停止を回避できます。

## 前提条件\{#before-you-start}

組織アラートを表示または管理する前に、以下の条件を満たしていることを確認してください。

- **Organization Owner** ロールの権限を有していること

## 組織アラートの表示\{#view-organization-alerts}

左サイドバーの **Organization Alerts** から組織アラートダッシュボードにアクセスし、アカウントの財務状況を監視できます。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View Organization Alerts Demo" />

### アラート履歴\{#alert-history}

**History** タブでは、過去のアラート履歴を確認し、請求の傾向を把握できます。支出の分析、クレジット消費状況の確認、ステークホルダーへのアカウント管理状況の説明などに活用できます。

### アラート設定\{#alert-settings}

**Settings** タブでは、請求関連の全アラートの現在の状態を確認できます。組織を保護するために有効化されているアラートや、その設定内容を確認したい場合に利用します。

アラート一覧には、以下の設定項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを示すアラート識別子（例: &quot;Credit Balance Low&quot;、&quot;Payment Method Expiring&quot;）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>アラートの現在の状態: Enabled（監視中）または Disabled（通知停止）</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>監視スコープ - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>クレジットの閾値、支払いステータス、使用制限などのトリガーパラメーター</p></td>
   </tr>
   <tr>
     <td><p>重大度レベル</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限に接近しています</p></li><li><p><strong>Critical:</strong> 即時対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>登録済みのメールアドレスや通信チャネルを含む通知の宛先</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な操作: 編集、複製</p></td>
   </tr>
</table>

## 組織アラートの管理\{#manage-organization-alerts}

既存のアラートを調整・維持することで、組織のニーズや通知設定に適した効果的な請求監視を実現できます。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isShowcase="true" />

### アラートの無効化と有効化\{#disable-or-enable-an-alert}

アラート設定を保持したまま、監視の有無を切り替えられます。

- **無効なアラート:** 設定はすべて保持されますが、監視と通知は行われません

- **有効なアラート:** 請求メトリクスを継続的に監視し、条件合致時に通知を送信します

### アラートの編集\{#edit-an-alert}

既存のアラートについて、通知先のカスタマイズやトリガー条件の変更を行えます。

### アラートの複製\{#clone-an-alert}

通知設定や閾値を変更した類似のアラートを新規作成できます。

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

新規アラートに自動適用される組織共通のデフォルト通知設定を定義することで、組織全体で統一された請求通知運用を実現できます。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### アラート発生時、通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は、以下の自動スケジュールに従って送信されます。

- **初回通知**: アラート閾値を超えた時点で即座に送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **それ以降の通知**: アラート条件が解消されるまで、1日1回送信されます

通知が多すぎる場合は、以下の対応が可能です。

- [アラートを編集](./manage-organization-alerts#edit-an-alert)して、条件の閾値や期間要件を調整する

- [アラートを無効化](./manage-organization-alerts#disable-or-enable-an-alert)して、設定を保持したまま一時的にすべての通知を停止する

