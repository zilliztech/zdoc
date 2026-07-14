---
title: "組織アラートの管理 | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織アラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud 組織全体にわたる請求およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートは、クレジット残高、支払い方法、使用パターンを追跡して、サービスの中断を防ぎ、予期しない請求問題を回避するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量しきい値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービス中断を回避できます。 | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートの管理

組織アラートは、Zilliz Cloud 組織全体にわたる請求およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートは、クレジット残高、支払い方法、使用パターンを追跡して、サービスの中断を防ぎ、予期しない請求問題を回避するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量しきい値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービス中断を回避できます。

## 始める前に\{#before-you-start}

組織アラートを表示または管理する前に、以下を確認してください。

- **Organization Owner** ロールへのアクセス権

## 組織アラートを表示する\{#view-organization-alerts}

左側のサイドバーで **Organization Alerts** に移動し、組織アラートダッシュボードにアクセスして、アカウントの財務状況を監視します。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - 組織アラート表示デモ" />

### アラート履歴\{#alert-history}

**History** タブを使用して、過去のアラートアクティビティを調査し、請求パターンを把握します。これは、支出傾向の分析、クレジット使用状況の確認、または関係者へのアカウント管理状況の提示に役立ちます。

### アラート設定\{#alert-settings}

**Settings** タブを使用して、請求関連のすべてのアラートの現在の状態を監視します。どのアラートが組織を保護しているかを確認したり、その設定を見直したりする必要がある場合は、ここを確認してください。

アラートを表示すると、以下の設定項目があります。

<table>
   <tr>
     <th><p>項目</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを説明するアラート識別子（例: "Credit Balance Low", "Payment Method Expiring"）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態: Enabled（監視中）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>対象</p></td>
     <td><p>監視範囲 - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>クレジットしきい値、支払い状況、使用量上限を含むトリガーパラメータ</p></td>
   </tr>
   <tr>
     <td><p>重大度レベル</p></td>
     <td><p>影響の分類</p><ul><li><p><strong>Warning:</strong> 上限に近づいている状態</p></li><li><p><strong>Critical:</strong> 即時対応が必要</p></li></ul></td>
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

## 組織アラートを管理する\{#manage-organization-alerts}

組織のニーズや通知設定に合った効果的な請求監視を実現するために、既存のアラートを変更および保守します。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isShowcase="true" />

### アラートを無効化または有効化する\{#disable-or-enable-an-alert}

アラート設定を失うことなく、アクティブな監視を制御できます。

- **Disabled alerts:** すべての設定を保持したまま、監視と通知を停止します

- **Enabled alerts:** 請求メトリクスをアクティブに監視し、条件が満たされると通知を送信します

### アラートを編集する\{#edit-an-alert}

既存のアラートについて、通知受信者をカスタマイズし、トリガー条件を変更します。

### アラートを複製する\{#clone-an-alert}

異なる通知設定やしきい値の変更を持つ類似のアラートを作成します。

## アラート受信者設定を構成する\{#configure-alert-receiver-settings}

新しいアラートに自動適用される組織全体のデフォルト通知設定を行い、組織全体で一貫した請求通知の運用を確保します。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### アラートがトリガーされた場合、アラート通知はどのくらいの頻度で受信しますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的に以下の頻度パターンに従います。

- **初回通知**: アラートしきい値を超えた時点ですぐに送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **以降の通知**: アラート条件が有効である間、1日1回送信されます

通知が多すぎると感じる場合は、以下を実行できます。

- [アラートを編集](./manage-organization-alerts#edit-an-alert) して、条件のしきい値または継続時間の要件を調整する

- [アラートを無効化](./manage-organization-alerts#disable-or-enable-an-alert) して、設定を保持したまま、すべての通知を一時的に停止する

