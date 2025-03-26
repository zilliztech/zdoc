---
title: "組織のアラートを管理する | BYOC"
slug: /manage-organization-alerts
sidebar_label: "組織のアラートを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。組織アラートは、請求関連ライセンス関連の問題に対応し、プロジェクトアラートは特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、メトリクスとアラートのリファレンスを参照してください。 | BYOC"
type: origin
token: Q0VrwfTIeiSkfxk90cqcuyJpnEb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss

---

import Admonition from '@theme/Admonition';


# 組織のアラートを管理する

Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。**組織アラート**は、請求関連ライセンス関連の問題に対応し、**プロジェクトアラート**は特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

このトピックでは、組織のアラートを表示および管理する方法について説明します。

## 概要について{#overview}

以下は、各組織のアラートのデフォルト設定の概要を示す表です。

アラートが**ON**状態の場合、条件が満たされると指定された受信者に通知が届きます。[アラートを編集](./manage-organization-alerts#edit-organization-alerts)してステータスを変更できます。

<table>
   <tr>
     <th><p>アラートターゲット</p></th>
     <th><p>ユニット</p></th>
     <th><p>説明する</p></th>
     <th><p>推奨アクション</p></th>
     <th><p>デフォルトのトリガー条件</p></th>
   </tr>
   <tr>
     <td><p>ライセンス（コアの使用）</p></td>
     <td><p>%</p></td>
     <td><p>使用済みCPUコアの割合をライセンス済みコアの合計に対して監視します。</p></td>
     <td><p><strong>70%未満</strong>:コア使用率がこの範囲内に収まるように監視を継続します。 <strong>70-99%</strong>:将来のニーズを評価し、ライセンスの更新またはアップグレードの準備をします。</p><p><strong>100%以上</strong>:運用上の混乱を避けるために、すぐにライセンスを更新またはアップグレードしてください。</p></td>
     <td><p><strong>警告</strong>:使用されたCPUコアの数が合計の70%以上に達した場合に発生します。 <strong>クリティカル</strong>:使用されたCPUコア数が合計の100%以上に達した場合に発生します。</p></td>
   </tr>
   <tr>
     <td><p>ライセンス（有効期間）</p></td>
     <td><p>デイ</p></td>
     <td><p>ライセンスの有効期間の残り日数を追跡します。</p></td>
     <td><p><strong>6 0日以上</strong>:有効期間が6 0日以上残っていることを確認するために、モニタリングを継続してください。 <strong>6 0日以下</strong>:ライセンスの更新またはアップグレードの準備を開始します。</p><p><strong>期限切れ</strong>:新しいクラスタを作成したりスケールアップしたりできないなどの制限を回避するために、ライセンスをすぐに更新またはアップグレードします。</p></td>
     <td><p><strong>警告</strong>:ライセンスの有効期限が6 0日以下の場合に発生します。 <strong>クリティカル</strong>:ライセンスの有効期限が切れたときに発生します。</p></td>
   </tr>
</table>

**パーミッション**:

- **表示と構成**:組織の所有者のみが使用できます。

- **通知の受信**:所有者によって指定された場合、すべてのOrganizationメンバーが利用できます。

ユーザーの役割の詳細については、[組織のユーザーを管理する](./organization-users)を参照してください。

## 組織のアラートを表示する{#view-organization-alerts}

[**Organization Alert**]ページに移動して、請求関連ライセンス関連のさまざまなアラートを表示します。

**アラートの構成要素**:

- **アラートターゲット**: Zilliz Cloudによって事前にトリガー条件と重大度が設定されています。

- **ステータス**:アラートがアクティブ（**ON**）かどうかを示します。アラートが**ON**の場合、条件が満たされると指定された受信者に通知が届きます。

- **条件**:アラートのトリガー条件。

- **深刻度レベル**:**WARNING**または**CRITICAL**に分類されます。

- **受信者**:通知を受け取るための役割またはメールアドレスを指定します。Webhookを使用してカスタム通知チャンネルを設定することもできます。詳細については、「[通知チャンネルの管理](./manage-notification-channels)」を参照してください。

![byoc-view-organization-alerts](/byoc/ja-JP/byoc-view-organization-alerts.png)

## 組織のアラートを編集する{#edit-organization-alerts}

- **カスタマイズ**:アラート条件の変更、通知受信者の更新、アクティブステータスの変更を行います。

- **制限事項**:アラートのターゲットと重大度レベルは固定されており、変更することはできません。

<Admonition type="info" icon="📘" title="ノート">

<p>アラートをすばやく有効または無効にするには、[アクション]列から[<strong>有効</strong>]または[<strong>無効</strong>]を選択し<strong>ま</strong>す。</p>

</Admonition>

## 組織のアラートを有効または無効にする{#enable-or-disable-an-organization-alert}

組織のアラートをすばやく有効または無効にするには、[アクション]列から[**有効**]または[**無効**]を選択し**ま**す。

<Admonition type="info" icon="📘" title="ノート">

<p>アラートを無効にすると、アラート条件が満たされた場合にアラート通知を受け取ることができなくなります。</p>

</Admonition>

## アラート履歴を表示する{#view-alert-history}

[**Alert History**]タブでトリガーされたアラートを表示します。アラートの対象、重要度レベル、時間範囲のフィルターがあります。

## 関連するトピック{#related-topics}

- [クラスタのメトリックチャートを表示する](./view-cluster-metric-charts)

- [プロジェクトのアラートを管理する](./manage-project-alerts)

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)

