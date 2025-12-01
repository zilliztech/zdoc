---
title: "組織アラートを管理 | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織アラートを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud組織全体の課金およびアカウント関連のメトリクスを監視します。クラスターパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、および使用パターンを追跡して、サービスの中断を防ぎ、予期しない請求問題を防ぐのに役立ちます。クレジットの枯渇、支払い失敗、使用量のしきい値に関するタイムリーな通知を受信して、アカウントの健全性に関する情報を得て、サービスの中断を回避できます。 | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートを管理

組織アラートは、Zilliz Cloud組織全体の課金およびアカウント関連のメトリクスを監視します。クラスターパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、および使用パターンを追跡して、サービスの中断を防ぎ、予期しない請求問題を防ぐのに役立ちます。クレジットの枯渇、支払い失敗、使用量のしきい値に関するタイムリーな通知を受信して、アカウントの健全性に関する情報を得て、サービスの中断を回避できます。

## 事前準備\{#before-you-start}

組織アラートを表示または管理する前に、以下を持っていることを確認してください：

- **組織オーナー**ロールアクセス

## 組織アラートを表示\{#view-organization-alerts}

左側のサイドバーで**組織アラート**に移動して、組織アラートダッシュボードにアクセスし、アカウントの財務健全性を監視します。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - 組織アラート表示デモ" />

### アラート履歴\{#alert-history}

**履歴**タブを使用して、過去のアラート活動を調査し、請求パターンを理解します。これは、支出傾向の分析、クレジット使用量の確認、またはステークホルダーへのアカウント管理のデモンストレーションに役立ちます。

### アラート設定\{#alert-settings}

**設定**タブを使用して、すべての請求関連アラートの現在のステータスを監視します。組織を保護しているアラートを確認する必要があるときや、構成を確認するときはここを確認してください。

アラートを表示するとき、以下の構成項目が表示されます：

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを説明するアラート識別子（例：「クレジット残高が少なくなっています」、「支払い方法の有効期限が切れます」）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態：有効（アクティブ監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>監視範囲 - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>メトリクスおよび条件</p></td>
     <td><p>クレジットしきい値、支払いステータス、および使用量制限を含むトリガーパラメータ</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響分類</p><ul><li><p><strong>警告：</strong> 制限に近づいています</p></li><li><p><strong>重要：</strong> 直ちに対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>構成されたメールアドレスおよび通信チャネルを含む通知受信者</p></td>
   </tr>
   <tr>
     <td><p>操作</p></td>
     <td><p>利用可能な管理オプション：編集、複製</p></td>
   </tr>
</table>

## 組織アラートを管理\{#manage-organization-alerts}

既存のアラートを変更および維持して、組織の必要および通知設定に合った効果的な請求監視を確保します。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="組織アラートを管理" isShowcase="true" />

### アラートを無効化または有効化\{#disable-or-enable-an-alert}

アラート構成を失うことなくアクティブ監視を制御します。

- **無効なアラート：** すべての構成を保持しますが、監視および通知を停止します

- **有効なアラート：** 請求メトリクスをアクティブに監視し、条件が満たされたときに通知を送信します

### アラートを編集\{#edit-an-alert}

通知受信者をカスタマイズし、既存のアラートのトリガー条件を変更します。

### アラートを複製\{#clone-an-alert}

異なる通知設定またはしきい値の変更で類似のアラートを作成します。

## アラート受信者設定を構成\{#configure-alert-receiver-settings}

新しいアラートに自動的に適用される組織全体のデフォルト通知設定を設定し、組織全体で一貫した請求通知習慣を確保します。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="アラート受信者設定を構成"/>

## よくある質問\{#faq}

### アラートがトリガーされたとき、どのくらいの頻度でアラート通知を受け取りますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います：

- **最初の通知：** アラートしきい値が超過されたときに即座に送信されます

- **2回目の通知：** 条件が継続している場合、1時間後に送信されます

- **その後の通知：** アラート条件がアクティブな間、1日1回送信されます

通知が頻繁すぎる場合は、以下ができます：

- [アラートを編集](./manage-organization-alerts#edit-an-alert)して、条件しきい値または期間要件を調整する

- [アラートを無効化](./manage-organization-alerts#disable-or-enable-an-alert)して、構成を保持しながらすべての通知を一時的に停止する
