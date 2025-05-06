---
title: "組織のアラートを管理する | Cloud"
slug: /manage-organization-alerts
sidebar_label: "組織のアラートを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。組織アラートは、の問題に対応し、プロジェクトアラートは特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、メトリクスとアラートのリファレンスを参照してください。 | Cloud"
type: origin
token: Q0VrwfTIeiSkfxk90cqcuyJpnEb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - organization
  - alerts
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';


# 組織のアラートを管理する

Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。**組織アラート**は、の問題に対応し、**プロジェクトアラート**は特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

このトピックでは、組織のアラートを表示および管理する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、StandardおよびEnterpriseプランのクラスターでのみ利用できます。詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p>

</Admonition>

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
     <td><p>クレジットカードの有効期限</p></td>
     <td><p>デイ</p></td>
     <td><p>クレジットカードの有効期限までの残り日数を監視して、中断のないサービスを確保してください。</p></td>
     <td><p>有効期限前にクレジットカード情報を更新または更新してください。</p></td>
     <td><p><strong>警告</strong>:カードの有効期限から3 0日以内にアラートをトリガーします。 <strong>クリティカル</strong>:カードの有効期限から7日以内にアラートをトリガーします。</p></td>
   </tr>
   <tr>
     <td><p>残りのクレジット</p></td>
     <td><p>&#36;</p></td>
     <td><p>無料クレジットの残高を追跡し、低くなったときにユーザーに警告してトップアップを促します。</p></td>
     <td><p>アカウントの機能を維持するためにクレジットをチャージしてください。</p></td>
     <td><p>無料クレジットの残高が$10を下回ると、トリガー<strong>警告</strong>が表示されます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットの有効期間</p></td>
     <td><p>デイ</p></td>
     <td><p>無料クレジットの残りの有効期間を監視し、ユーザーに使用または延長を促すよう警告します。</p></td>
     <td><p>有効期間を延長するか、期限が切れる前にクレジットを使用してください。</p></td>
     <td><p>無料クレジットの有効期間が0日に達すると、トリガー<strong>警告</strong>が表示されます。</p></td>
   </tr>
   <tr>
     <td><p>事前支払い残高</p></td>
     <td><p>&#36;</p></td>
     <td><p>事前支払い残高を監視し、サービスの中断を防ぐために低くなったときにユーザーに警告します。</p></td>
     <td><p>サービスの中断を避けるために、前払い残高に資金を追加してください。</p></td>
     <td><p>残高が$100を下回ったときに<strong>CRITICAL</strong>アラートをトリガーします。</p></td>
   </tr>
   <tr>
     <td><p>ご利用量</p></td>
     <td><p>&#36;</p></td>
     <td><p>使用量を追跡し、設定された閾値を超えた場合にユーザーに通知して、監視と管理を提案します。</p></td>
     <td><p>予算制限内に収まるように使用状況を監視および管理します。</p></td>
     <td><p>使用量が$100を超えると、トリガー<strong>警告</strong>アラートが表示されます。</p></td>
   </tr>
</table>

**パーミッション**:

- **表示と構成**:組織の所有者のみが使用できます。

- **通知の受信**:所有者によって指定された場合、すべてのOrganizationメンバーが利用できます。

ユーザーの役割の詳細については、[組織のユーザーを管理する](./organization-users)を参照してください。

## 組織のアラートを表示する{#view-organization-alerts}

[**Organization Alert**]ページに移動して、のさまざまなアラートを表示します。

**アラートの構成要素**:

- **アラートターゲット**: Zilliz Cloudによって事前にトリガー条件と重大度が設定されています。

- **ステータス**:アラートがアクティブ（**ON**）かどうかを示します。アラートが**ON**の場合、条件が満たされると指定された受信者に通知が届きます。

- **条件**:アラートのトリガー条件。

- **深刻度レベル**:**WARNING**または**CRITICAL**に分類されます。

- **受信者**:通知を受け取るための役割またはメールアドレスを指定します。Webhookを使用してカスタム通知チャンネルを設定することもできます。詳細については、「[通知チャンネルの管理](./manage-notification-channels)」を参照してください。

![view-organization-alerts](/img/view-organization-alerts.png)

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

