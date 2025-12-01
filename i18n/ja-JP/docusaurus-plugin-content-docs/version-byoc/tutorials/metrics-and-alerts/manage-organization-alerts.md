---
title: "組織アラートの管理 | BYOC"
slug: /manage-organization-alerts
sidebar_label: "組織アラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織アラートは、Zilliz Cloud組織全体の請求およびアカウント関連のメトリクスを監視します。クラスターパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用量のパターンを追跡して、サービスの中断を防ぎ、予期しない請求の問題を回避するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量のしきい値に関するタイムリーな通知を受けることで、アカウントの状態を把握し、サービスの中断を回避できます。 | BYOC"
type: origin
token: UPg7wiU71ioeELk8I8KcLDYqncb
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 組織アラートの管理

組織アラートは、Zilliz Cloud組織全体の請求およびアカウント関連のメトリクスを監視します。クラスターパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用量のパターンを追跡して、サービスの中断を防ぎ、予期しない請求の問題を回避するのに役立ちます。クレジットの枯渇、支払いの失敗、使用量のしきい値に関するタイムリーな通知を受けることで、アカウントの状態を把握し、サービスの中断を回避できます。

## 事前準備\{#before-you-start}

組織アラートを表示または管理する前に、以下の権限があることを確認してください。

- **Organization Owner** ロールアクセス

## 組織アラートの表示\{#view-organization-alerts}

左側のサイドバーで **組織アラート** に移動して、組織アラートダッシュボードにアクセスし、アカウントの財務状況を監視します。

<Supademo id="cmb66uk3u3fadppkplclhnmdd" title="Zilliz Cloud - 組織アラートの表示デモ" />

### アラート履歴\{#alert-history}

**履歴** タブを使用して、過去のアラートアクティビティを調査し、請求パターンを理解します。これは、支出トレンドの分析、クレジット使用量の確認、またはステークホルダーへのアカウント管理状況の提示に役立ちます。

### アラート設定\{#alert-settings}

**設定** タブを使用して、すべての請求関連アラートの現在の状態を監視します。組織を保護しているアラートを確認したり、構成を確認したりする必要がある場合は、ここを確認してください。

アラートを表示する際、以下の構成項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>請求イベントを説明するアラート識別子（例："クレジット残高が少ない"、"支払い方法の有効期限が迫っています"）</p></td>
   </tr>
   <tr>
     <td><p>状態</p></td>
     <td><p>現在のアラート状態：有効（アクティブ監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>監視範囲 - 組織全体</p></td>
   </tr>
   <tr>
     <td><p>メトリクスおよび条件</p></td>
     <td><p>クレジットのしきい値、支払い状況、使用量の制限を含むトリガーのパラメータ</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響の分類</p><ul><li><p><strong>警告：</strong> しきい値に接近中</p></li><li><p><strong>クリティカル：</strong> 直ちに対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>構成されたメールアドレスおよび通信チャネルを含む通知受信者</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション：編集、複製</p></td>
   </tr>
</table>

## 組織アラートの管理\{#manage-organization-alerts}

既存のアラートを変更および維持して、組織のニーズおよび通知設定に合わせた効果的な請求監視を確保します。

<Supademo id="cmb67wl2i00ys1b0i2hcg3ls7" title="組織アラートの管理" isShowcase="true" />

### アラートの無効化または有効化\{#disable-or-enable-an-alert}

アラート構成を失うことなくアクティブ監視を制御できます。

- **無効化されたアラート：** すべての構成を保持しますが、監視と通知を停止します

- **有効化されたアラート：** メトリクスをアクティブに監視し、条件が満たされたら通知を送信します

### アラートの編集\{#edit-an-alert}

通知受信者をカスタマイズし、既存のアラートのトリガー条件を変更します。

### アラートの複製\{#clone-an-alert}

異なる通知設定またはしきい値の変更を伴う類似のアラートを作成します。

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

新しいアラートに自動的に適用される組織全体のデフォルト通知設定を設定し、組織全体で一貫した請求通知の運用を確実にします。

<Supademo id="cmb67pjbs3g31ppkpfd4l8mcv" title="アラート受信者設定の構成" />

## よくある質問\{#faq}

### アラートがトリガーされると、どのくらいの頻度で通知を受け取ることができますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います。

- **最初の通知：** アラートのしきい値が超過された直後に送信されます

- **2回目の通知：** 条件が継続する場合、1時間後に送信されます

- **今後の通知：** アラート条件がアクティブな限り、1日1回送信されます

通知が頻繁すぎると感じる場合は、以下を行えます。

- [アラートを編集](./manage-organization-alerts#edit-an-alert)して条件のしきい値または期間の要件を調整する

- [アラートを無効化](./manage-organization-alerts#disable-or-enable-an-alert)して、構成を保持しながらすべての通知を一時的に停止する