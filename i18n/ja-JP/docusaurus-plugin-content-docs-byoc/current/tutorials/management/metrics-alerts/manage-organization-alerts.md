---
title: "Organization Alerts の管理 | BYOC"
slug: /manage-organization-alerts
sidebar_label: "Organization Alerts の管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Organization alerts は、Zilliz Cloud 組織全体にわたる請求およびアカウント関連のメトリクスを監視します。cluster パフォーマンスに焦点を当てる project alerts とは異なり、organization alerts はクレジット残高、支払い方法、使用パターンの追跡を支援し、サービスの中断を防ぎ、予期しない請求問題を回避します。クレジット枯渇、支払い失敗、使用量しきい値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービス停止を回避できます。 | BYOC"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Organization Alerts の管理

Organization alerts は、Zilliz Cloud 組織全体にわたる請求およびアカウント関連のメトリクスを監視します。cluster パフォーマンスに焦点を当てる project alerts とは異なり、organization alerts はクレジット残高、支払い方法、使用パターンの追跡を支援し、サービスの中断を防ぎ、予期しない請求問題を回避します。クレジット枯渇、支払い失敗、使用量しきい値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービス停止を回避できます。

## 始める前に\{#before-you-start}

Organization alerts を表示または管理する前に、以下を確認してください。

- **Organization Owner** ロールへのアクセス権

## Organization alerts を表示する\{#view-organization-alerts}

左側のサイドバーで **Organization Alerts** に移動し、組織の alert ダッシュボードにアクセスして、アカウントの財務状況を監視します。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View Organization Alerts Demo" />

### Alert 履歴\{#alert-history}

**History** タブを使用して、過去の alert アクティビティを調査し、請求パターンを把握します。これは、支出傾向の分析、クレジット使用状況の確認、または関係者へのアカウント管理状況の提示に役立ちます。

### Alert 設定\{#alert-settings}

**Settings** タブを使用して、すべての請求関連 alert の現在の状態を監視します。どの alert が組織を保護しているかを確認し、その設定を見直したい場合はここを確認してください。

alert を表示すると、次の設定項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを示す alert 識別子（例: "Credit Balance Low", "Payment Method Expiring"）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在の alert 状態: Enabled（監視中）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>対象</p></td>
     <td><p>監視範囲 - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>クレジットしきい値、支払いステータス、使用量上限を含むトリガーパラメーター</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響分類</p><ul><li><p><strong>Warning:</strong> 上限に接近中</p></li><li><p><strong>Critical:</strong> 即時対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>設定済みのメールアドレスや通信チャネルを含む通知受信者</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション: Edit、Clone</p></td>
   </tr>
</table>

## Organization alerts を管理する\{#manage-organization-alerts}

既存の alert を変更および維持して、組織のニーズと通知設定に合った効果的な請求監視を実現します。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isShowcase="true" />

### alert を無効化または有効化する\{#disable-or-enable-an-alert}

alert 設定を失うことなく、アクティブな監視を制御します。

- **Disabled alerts:** すべての設定は保持されますが、監視と通知は停止されます

- **Enabled alerts:** 請求メトリクスをアクティブに監視し、条件が満たされると通知を送信します

### alert を編集する\{#edit-an-alert}

通知受信者をカスタマイズし、既存の alert のトリガー条件を変更します。

### alert を複製する\{#clone-an-alert}

異なる通知設定やしきい値変更を使用して、類似の alert を作成します。

## Alert 受信者設定を構成する\{#configure-alert-receiver-settings}

組織全体のデフォルト通知設定を定義します。これらは新しい alert に自動的に適用され、組織全体で一貫した請求通知運用を確保します。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### alert がトリガーされた場合、alert 通知はどのくらいの頻度で受信しますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

alert 通知は自動的な頻度パターンに従います。

- **最初の通知**: alert しきい値を超えると直ちに送信されます

- **2 回目の通知**: 条件が継続している場合、1 時間後に送信されます

- **それ以降の通知**: alert 条件が有効な間、1 日 1 回送信されます

通知頻度が高すぎると感じる場合は、以下を実行できます。

- [alert を編集](./manage-organization-alerts#edit-an-alert) して、条件のしきい値または継続時間要件を調整する

- 設定を保持したまますべての通知を停止するには、[alert を無効化](./manage-organization-alerts#disable-or-enable-an-alert) する

