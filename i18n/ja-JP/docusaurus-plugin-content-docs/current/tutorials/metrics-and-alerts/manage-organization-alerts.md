---
title: "組織のアラートを管理する | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織のアラートを管理する"
beta: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud組織全体で請求およびアカウント関連のメトリックスを監視します。クラスターのパフォーマンスに焦点を当てたプロジェクトアラートとは異なり、組織アラートは、クレジット残高、支払い方法、および使用パターンを追跡して、中断のないサービスを確保し、予期しない請求問題を防止するのに役立ちます。クレジット枯渇、支払い失敗、および使用閾値に関するタイムリーな通知を受け取ることで、アカウントの健康状態について情報を把握し、サービスの中断を回避します。 | Cloud"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


# 組織のアラートを管理する

組織アラートは、Zilliz Cloud組織全体で請求およびアカウント関連のメトリックスを監視します。クラスターのパフォーマンスに焦点を当てたプロジェクトアラートとは異なり、組織アラートは、クレジット残高、支払い方法、および使用パターンを追跡して、中断のないサービスを確保し、予期しない請求問題を防止するのに役立ちます。クレジット枯渇、支払い失敗、および使用閾値に関するタイムリーな通知を受け取ることで、アカウントの健康状態について情報を把握し、サービスの中断を回避します。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、StandardプランとEnterpriseプランのクラスターでのみ利用できます。詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p>

</Admonition>

</exclude>

## 始める前に{#before-you-start}

組織のアラートを表示または管理する前に、次のことを確認してください:

- **組織のオーナー**ロールへのアクセス

## 組織のアラートを表示する{#view-organization-alerts}

左側のサイドバーにある**組織アラート**に移動して、組織アラートダッシュボードにアクセスし、アカウントの財務状況を監視してください。

<supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - View Organization Alerts Demo"></supademo>

### アラート履歴{#alert-history}

過去のアラート活動を調査し、請求パターンを理解するには、**履歴**タブを使用してください。これは、支出傾向の分析、クレジットの使用状況の確認、ステークホルダーへのアカウント管理のデモンストレーションに役立ちます。

### アラート設定{#alert-settings}

**設定**タブを使用して、すべての請求関連のアラートの現在の状態を監視します。組織を保護しているアラートを確認し、その構成を確認する必要がある場合は、ここを確認してください。

アラートを表示すると、次の設定項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>お名前</p></td>
     <td><p>請求イベントを説明するアラート識別子(例:「クレジット残高が低い」、「支払い方法が期限切れ」)</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態:有効(アクティブモニタリング)または無効(通知なし)</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>モニタリング範囲-組織全体</p></td>
   </tr>
   <tr>
     <td><p>メートルと条件</p></td>
     <td><p>クレジットの閾値、支払い状況、使用限度などのトリガーパラメータ</p></td>
   </tr>
   <tr>
     <td><p>深刻度レベル</p></td>
     <td><p>インパクト分類</p><ul><li><p><strong>警告:</strong>限界に近づいています</p></li><li><p><strong>重要:</strong>即時の注意が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>レシーバー</p></td>
     <td><p>設定された電子メールアドレスと通信チャネルを含む通知受信者</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>使用可能な管理オプション:編集、クローン</p></td>
   </tr>
</table>

## 組織のアラートを管理する{#manage-organization-alerts}

既存のアラートを変更して維持し、組織のニーズと通知設定に合わせた効果的な請求モニタリングを確保します。

<supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="Manage Organization Alerts" isshowcase="true"></supademo>

### アラートを無効または有効にする{#disable-or-enable-an-alert}

アラート設定を失うことなくアクティブモニタリングを制御します。

- **無効なアラート:**すべての設定を保持しますが、監視と通知を停止します

- **有効なアラート:**請求メトリックスを積極的に監視し、条件が満たされた場合に通知を送信します

### アラートを編集する{#edit-an-alert}

通知の受信者をカスタマイズし、既存のアラートのトリガー条件を変更します。

### アラートをクローンする{#clone-an-alert}

異なる通知設定または閾値変更を持つ類似のアラートを作成してください。

## アラート受信の設定を行う{#configure-alert-receiver-settings}

新しいアラートに自動的に適用される組織全体のデフォルト通知設定を設定し、組織全体で一貫した請求通知プラクティスを確保します。

<supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="Configure Alert Receiver Settings"></supademo>

### アラートがトリガーされたときにアラート通知を受け取る頻度はどのくらいですか?{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います。

- **最初の通知**:アラートの閾値を超えた場合にすぐに送信されます

- **2回目の通知**:状態が続く場合は1時間後に送信されます

- **後続の通知**:アラート条件が有効な間、1日1回送信されます

通知が頻繁すぎる場合は、次のことができます:

- 条件の閾値または期間要件を調整するには、[アラートを編集する](./manage-organization-alerts#edit-an-alert)を使用してください

- [アラートを無効にする](./manage-organization-alerts#disable-or-enable-an-alert)は、設定を保持しながらすべての通知を一時的に停止します

