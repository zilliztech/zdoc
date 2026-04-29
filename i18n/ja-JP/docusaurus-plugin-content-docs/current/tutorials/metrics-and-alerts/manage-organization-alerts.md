---
title: "組織アラートの管理 | Cloud"
slug: /manage-organization-alerts
sidebar_key: manage-organization-alerts
sidebar_label: "組織アラートの管理"
beta: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud 組織全体の請求およびアカウント関連の指標を監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用パターンを追跡し、サービスの中断を防ぎ、予期せぬ請求問題を回避するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量の閾値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービスの中断を防ぐことができます。| Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - organization
  - alerts

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートの管理

組織アラートは、Zilliz Cloud 組織全体の請求およびアカウント関連の指標を監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用パターンを追跡し、サービスの中断を防ぎ、予期せぬ請求問題を防止するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量の閾値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービスの中断を回避できます。

## 始める前に\{#before-you-start}

組織アラートを表示または管理する前に、以下を確認してください：

- **組織オーナー** ロールのアクセス権限

## 組織アラートの表示\{#view-organization-alerts}

左側のサイドバーで**組織アラート**に移動し、組織アラートダッシュボードにアクセスして、アカウントの財務状態を監視します。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View 組織アラート Demo" />

### アラート履歴\{#alert-history}

**履歴**タブを使用して、過去のアラート活動を調査し、請求パターンを理解します。これは、支出傾向の分析、クレジット使用量のレビュー、またはステークホルダーへのアカウント管理の実証に役立ちます。

### アラート設定\{#alert-settings}

**Settings**タブを使用して、すべての請求関連アラートの現在のステータスを監視します。どのアラートが組織を保護しているかを確認し、その構成をレビューする必要がある場合は、ここで確認します。

アラートを表示すると、以下の構成項目が表示されます：

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを記述するアラート識別子（例："Credit Balance Low"、"支払い 方法 Expiring"）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態：有効（アクティブな監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>監視範囲 - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>指標と条件</p></td>
     <td><p>クレジット閾値、支払いステータス、使用量制限などのトリガーパラメータ</p></td>
   </tr>
   <tr>
     <td><p>重大度レベル</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>警告：</strong>制限に近づいています</p></li><li><p><strong>重要：</strong>即時の対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>設定されたメールアドレスや通信チャネルを含む通知受信者</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション：編集、クローン</p></td>
   </tr>
</table>

## 組織アラートの管理\{#manage-organization-alerts}

既存のアラートを変更および維持し、組織のニーズと通知設定に合わせた効果的な請求監視を確保します。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage 組織アラート" isShowcase="true" />

### アラートの無効化または有効化\{#disable-or-enable-an-alert}

アラート構成を失うことなく、アクティブな監視を制御します。

- **無効なアラート：** すべての構成を保持しますが、監視と通知を停止します

- **有効なアラート：** 請求指標を積極的に監視し、条件が満たされたときに通知を送信します

### アラートの編集\{#edit-an-alert}

既存のアラートに対して、通知受信者をカスタマイズし、トリガー条件を変更します。

### アラートのクローン\{#clone-an-alert}

異なる通知設定や閾値の変更を持つ類似のアラートを作成します。

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

新しいアラートに自動的に適用される組織全体のデフォルト通知設定を設定し、組織全体で一貫した請求通知慣行を確保します。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"/>

## FAQ\{#faq}

### アラートがトリガーされた場合、アラート通知はどのくらいの頻度で受信されますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います：

- **最初の通知**：アラート閾値を超えた直ちに送信されます

- **2 番目の通知**：条件が継続する場合、1 時間後に送信されます

- **以降の通知**：アラート条件がアクティブである間、毎日 1 回送信されます

通知が頻繁すぎると思われる場合は、以下を実行できます：

- [アラートを編集する](./manage-organization-alerts#edit-an-alert) して、条件の閾値や期間要件を調整します

- [アラートを無効化する](./manage-organization-alerts#disable-or-enable-an-alert) して、構成を保持したまま一時的にすべての通知を停止します

