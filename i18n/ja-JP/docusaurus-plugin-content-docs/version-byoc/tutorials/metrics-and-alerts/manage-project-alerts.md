---
title: "プロジェクトのアラートを管理する | BYOC"
slug: /manage-project-alerts
sidebar_label: "プロジェクトのアラートを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。組織アラートは、請求関連ライセンス関連の問題に対応し、プロジェクトアラートは特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、メトリクスとアラートのリファレンスを参照してください。 | BYOC"
type: origin
token: OVeIw4EASiL5EgkJjLlcPbFon4c
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - project
  - alerts
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


# プロジェクトのアラートを管理する

Zilliz Cloudは、リソースモニタリングのための2種類のアラートを提供しています。**組織アラート**は、請求関連ライセンス関連の問題に対応し、**プロジェクトアラート**は特定のプロジェクトのクラスターの運用パフォーマンスに対応しています。クイックリファレンスについては、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

このトピックでは、プロジェクトのアラートを表示および管理する方法について説明します。

## 概要について{#overview}

以下は、事前に定義されたプロジェクトアラートターゲットのデフォルトトリガー条件を概説した表です。

アラートが**ON**状態の場合、条件が満たされると指定された受信者に通知が届きます。[アラートを編集](./manage-project-alerts#edit-a-project-alert)してステータスを変更できます。

推奨アクションの詳細については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

<table>
   <tr>
     <th><p>アラートターゲット</p></th>
     <th><p>ユニット</p></th>
     <th><p>デフォルトのトリガー条件</p></th>
   </tr>
   <tr>
     <td><p>CUコンピュテーション</p></td>
     <td><p>%</p></td>
     <td><p><strong>警告</strong>: 70%以上のトリガーアラートは、10分以上にわたって計算能力を利用しました。 <strong>クリティカル</strong>: 90%以上のトリガーアラートは、10分以上にわたって計算能力を利用しました。</p></td>
   </tr>
   <tr>
     <td><p>CUの容量</p></td>
     <td><p>%</p></td>
     <td><p><strong>警告</strong>:&gt;70%のトリガーアラートは、10+分のCU容量を利用しました。 <strong>クリティカル</strong>: CU容量が10分以上使用され、90%以上のトリガーアラートが発生しました。</p></td>
   </tr>
   <tr>
     <td><p>検索する(QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>10分以上、秒間50回以上の検索操作で<strong>警告</strong>アラートをトリガーしてください。</p></td>
   </tr>
   <tr>
     <td><p>クエリー(QPS)</p></td>
     <td><p>QPS</p></td>
     <td><p>10分以上毎秒50回以上のクエリ操作で<strong>警告</strong>アラートをトリガーします。</p></td>
   </tr>
   <tr>
     <td><p>検索レイテンシ(P 99)</p></td>
     <td><p>ms</p></td>
     <td><p>10分以上のP 99レイテンシ&gt;1,000 msで<strong>警告</strong>アラートをトリガーします。</p></td>
   </tr>
   <tr>
     <td><p>クエリーレイテンシ(P 99)</p></td>
     <td><p>ms</p></td>
     <td><p>10分以上のP 99レイテンシ&gt;1,000 msで<strong>警告</strong>アラートをトリガーします。</p></td>
   </tr>
</table>

**パーミッション**:

- **閲覧**:対象のオーガニゼーションの全メンバーが閲覧可能なプロジェクトアラート。

- **構成**:クラスターアラートを構成できるのは、組織の所有者またはプロジェクト管理者のみです。

- **通知の受信**:所有者によって指定された場合、すべてのOrganizationメンバーが利用できます。

ユーザーロールの詳細については、「[プロジェクトのユーザーを管理する](./project-users)」を参照してください。

## プロジェクトのアラートを表示する{#view-project-alerts}

[**プロジェクトアラート**]ページに移動して、プロジェクトアラートを表示します。

**アラートの構成要素**:

- **アラートターゲット**: Zilliz Cloudによって事前にトリガー条件と重大度が設定されています。

- **ステータス**:アラートがアクティブ（**ON**）かどうかを示します。アラートが**ON**の場合、条件が満たされると指定された受信者に通知が届きます。

- **条件**:アラートのトリガー条件。各プロジェクトのアラートターゲットに対して、トリガー条件には、アラートがトリガーされるために満たす必要がある閾値と期間値が含まれます。条件は、次の演算子のいずれかに設定できます:>、>=、\<、\<=、=。閾値は、クエリレイテンシ、クエリQPS、検索QPS、CU Capacity、CU Computationなどのメトリックの数値などの数値になります。期間は、閾値を超える必要がある時間を指定し、最小1分、最大30分に設定されます。

- **深刻度レベル**:**WARNING**または**CRITICAL**に分類されます。

- **受信者**:通知を受け取るための役割またはメールアドレスを指定します。Webhookを使用してカスタム通知チャンネルを設定することもできます。詳細については、「[通知チャンネルの管理](./manage-notification-channels)」を参照してください。

![byoc-view-project-alert](/byoc/ja-JP/byoc-view-project-alert.png)

## プロジェクトのアラートを作成する{#create-a-project-alert}

デフォルトのプロジェクトアラートに加えて、[**+アラート**]をクリックして、アラートの種類、重要度レベル、アラート条件、および通知受信者をカスタマイズしてアラートを作成できます。

サポートされているカスタムアラートターゲットについては、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

![byoc-create-alert](/byoc/ja-JP/byoc-create-alert.png)

## プロジェクトのアラートを編集する{#edit-a-project-alert}

- **カスタマイズ**:アラート条件の変更、通知受信者の更新、アクティブステータスの変更を行います。

- **制限事項**:アラートの対象タイプと重大度レベルは固定されており、変更できません。

<Admonition type="info" icon="📘" title="ノート">

<p>アラートをすばやく有効または無効にするには、[アクション]列から[<strong>有効</strong>]または[<strong>無効</strong>]を選択し<strong>ま</strong>す。</p>

</Admonition>

## プロジェクトのアラートを有効または無効にする{#enable-or-disable-a-project-alert}

プロジェクトのアラートをすばやく有効または無効にするには、[アクション]列から[**有効**]または[**無効**]を選択し**ま**す。

<Admonition type="info" icon="📘" title="ノート">

<p>アラートを無効にすると、アラート条件が満たされた場合にアラート通知を受け取ることができなくなります。</p>

</Admonition>

## プロジェクトのアラートを削除する{#delete-a-project-alert}

プロジェクトアラートが不要になったら、削除できます。

<Admonition type="caution" icon="🚧" title="警告">

<p>アラートが削除されると、アラートターゲットの通知は受け取れなくなります。</p>

</Admonition>

## アラート履歴を表示する{#view-alert-history}

[**Alert History**]タブでトリガーされたアラートを表示します。アラートの対象、重要度レベル、時間範囲のフィルターがあります。

![byoc-view-project-alert-history](/byoc/ja-JP/byoc-view-project-alert-history.png)

## アラート受信の設定を行う{#configure-alert-receiver-settings}

[Alert Receiver Settings(アラート受信者設定)]機能を使用すると、[プロジェクト管理者](./project-users)はアラートテンプレートを作成して管理できます。

プロジェクトアラートの[**アラート設定**]ページで、アラート受信者の設定を構成します。

![byoc-alert-receiver-settings](/byoc/ja-JP/byoc-alert-receiver-settings.png)

## 関連するトピック{#related-topics}

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)

- [組織のアラートを管理する](./manage-organization-alerts)

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)

