---
title: "組織アラートの管理 | BYOC"
slug: /manage-organization-alerts
sidebar_label: "組織アラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud 組織全体の課金およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用パターンを追跡し、サービスの継続性を確保して予期しない課金問題を防止するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量の閾値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービスの中断を回避できます。 | BYOC"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートの管理

組織アラートは、Zilliz Cloud 組織全体の課金およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用パターンを追跡し、サービスの継続性を確保して予期しない課金問題を防止するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量の閾値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービスの中断を回避できます。

## 始める前に\{#before-you-start}

組織アラートを表示または管理する前に、以下の条件を満たしていることを確認してください:

- **Organization Owner** ロールのアクセス権限

## 組織アラートの表示\{#view-organization-alerts}

左サイドバーの **Organization Alerts** に移動すると、組織アラートダッシュボードにアクセスしてアカウントの財務状況を監視できます。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View Organization Alerts Demo" />

### アラート履歴\{#alert-history}

**History** タブを使用して、過去のアラート活動を調査し、課金パターンを把握できます。これは、支出傾向の分析、クレジット使用状況の確認、ステークホルダーへのアカウント管理状況の説明などに役立ちます。

### アラート設定\{#alert-settings}

**Settings** タブを使用して、すべての課金関連アラートの現在のステータスを監視できます。どのアラートが組織を保護しているかを確認したり、その設定内容を確認したりする必要がある場合に、ここで確認できます。

アラートを表示すると、以下の設定項目が表示されます:

<table>
   <tr>
     <th><p>Field</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>Alert identifier describing the billing event (e.g., &quot;Credit Balance Low&quot;, &quot;Payment Method Expiring&quot;)</p></td>
   </tr>
   <tr>
     <td><p>Status</p></td>
     <td><p>Current alert state: Enabled (Active monitoring) or Disabled (No notifications)</p></td>
   </tr>
   <tr>
     <td><p>Target</p></td>
     <td><p>Monitored scope - Organization-wide</p></td>
   </tr>
   <tr>
     <td><p>Metric & Condition</p></td>
     <td><p>Trigger parameters including credit thresholds, payment status, and usage limits</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>Impact classification</p><ul><li><p><strong>Warning:</strong> Approaching limits</p></li><li><p><strong>Critical:</strong> Immediate attention required</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>Notification recipients including configured email addresses and communication channels</p></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>Available management options: Edit, Clone</p></td>
   </tr>
</table>

## 組織アラートの管理\{#manage-organization-alerts}

既存のアラートを変更・維持することで、組織のニーズや通知設定に合った効果的な課金監視を実現できます。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isShowcase="true" />

### アラートの無効化または有効化\{#disable-or-enable-an-alert}

アラート設定を失うことなく、アクティブな監視を制御できます。

- **無効化されたアラート:** すべての設定は保持されますが、監視と通知は停止します

- **有効化されたアラート:** 課金メトリクスをアクティブに監視し、条件が満たされたときに通知を送信します

### アラートの編集\{#edit-an-alert}

既存のアラートの通知先をカスタマイズしたり、トリガー条件を変更したりできます。

### アラートの複製\{#clone-an-alert}

異なる通知設定や閾値の変更を加えた類似のアラートを作成できます。

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

新しいアラートに自動的に適用される組織全体のデフォルト通知設定を行い、組織全体で一貫した課金通知運用を確保できます。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### アラートがトリガーされた場合、どのくらいの頻度で通知が届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は、以下の自動頻度パターンに従います:

- **最初の通知**: アラートの閾値を超えるとすぐに送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **その後の通知**: アラート条件がアクティブな間、1日1回送信されます

通知が多すぎると思われる場合は、以下の操作を行えます:

- [アラートを編集](./manage-organization-alerts#edit-an-alert)して、条件の閾値や期間要件を調整する

- [アラートを無効化](./manage-organization-alerts#disable-or-enable-an-alert)して、設定を保持したまま一時的にすべての通知を停止する

