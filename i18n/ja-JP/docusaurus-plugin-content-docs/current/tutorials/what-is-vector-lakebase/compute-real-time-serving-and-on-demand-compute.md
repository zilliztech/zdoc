---
title: "コンピュート：リアルタイムサービング＆オンデマンドコンピュート | Cloud"
slug: /compute-real-time-serving-and-on-demand-compute
sidebar_key: compute-real-time-serving-and-on-demand-compute
sidebar_label: "コンピュート：リアルタイムサービング＆オンデマンドコンピュート"
beta: FALSE
notebook: FALSE
description: "AI アプリケーションには、ライブトラフィックに対応するために常時オンラインで動作するコンピュートと、チームがシステムの評価、調整、改善を行う際にのみ実行されるコンピュートの 2 種類が必要です。これら 2 つのワークロードは合わせて、継続的サービングと継続的発見のループを形成します。| Cloud"
type: origin
token: QiFhwuHoZiN891ks5IDcGABsnAd
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コンピュート
  - リアルタイムサービング
  - オンデマンドコンピュート

---

import Admonition from '@theme/Admonition';


# Compute: Realtime Serving & On-demand Compute

AI アプリケーションには、2 種類のコンピュートが必要です。ライブトラフィックに対応するために常時オンラインで稼働するコンピュートと、チームがシステムの評価、調整、改善を行う際のみ実行されるコンピュートです。これら 2 つのワークロードは、**Continuous Serving** と **Continuous Discovery** のループを形成します。

Continuous Serving では、本番システムがライブクエリに応答し、推奨事項を生成し、オンライン RAG 体験を実現します。これらのシステムによって生成されるシグナル（クエリパターン、関連性フィードバック、結果品質メトリクス、アプリケーションイベントなど）は、改善内容がサービングに反映される前に分析および検証されます。

Zilliz Cloud は、常時稼働の本番ワークロード向けの **Realtime Serving** と、弾力的な発見ワークロード向けの **On-demand Compute** という 2 つのコンピュートモードでこのループをサポートします。

<Admonition type="info" icon="📘" title="Notes">

<p>Realtime Serving は、本番ワークロード向けの既存の Zilliz Cloud サービング機能です。On-demand Compute は、弾力的な発見ワークロード向けに導入された新しいコンピュート機能です。</p>

</Admonition>

## Why Zilliz Cloud has two compute modes\{#why-zilliz-cloud-has-two-compute-modes}

Continuous Serving と Continuous Discovery は、コンピュートに対して異なる要件を課します。

- **Serving** ワークロードには、24 時間体制でウォーム状態を維持する安定した低レイテンシのコンピュートが必要です。予測可能な本番トラフィックには、常時稼働型コンピュートが適切なトレードオフとなります。

- **Discovery** ワークロード（オフライン評価、再現テスト、A/B 実験、インデックスチューニング、データ品質チェック、ノートブックでの探索など）はバースト的に実行され、実行間にはアイドル状態になることがあります。スケールツーゼロ型のコンピュートを採用することで、これらのバースト間のアイドルリソースに対する課金を回避できます。

![NyYbbdU5doijRkxNCLkcLQD5n23](https://zdoc-images.s3.us-west-2.amazonaws.com/nyybbdu5doijrkxnclkclqd5n23.png "NyYbbdU5doijRkxNCLkcLQD5n23")

この図は、AI ワークロードの典型的な 1 週間を示しています。上段のレーンは、月曜日から日曜日まで連続して実行されライブクエリを処理する Real-time Serving を示しており、常時稼働型コンピュートを使用するため、継続的なコスト基準が発生します。下段のレーンは、評価、A/B テスト、再インデックス作成、ノートブック分析などの発見タスク中にのみ出現し、バースト間にアイドル期間がある On-demand Compute を示しています。

## Choose a compute mode\{#choose-a-compute-mode}

ワークロードが Continuous Serving と Continuous Discovery のループ内のどこに位置するかに基づいて、コンピュートモードを選択してください。

<table>
   <tr>
     <th><p>ワークロードの形状</p></th>
     <th><p>Realtime Serving</p></th>
     <th><p>On-demand Compute</p></th>
   </tr>
   <tr>
     <td><p>CS/CD ループにおける役割</p></td>
     <td><p>Continuous Serving</p></td>
     <td><p>Continuous Discovery</p></td>
   </tr>
   <tr>
     <td><p>適している用途</p></td>
     <td><p>本番検索、リアルタイム推奨、オンライン RAG</p></td>
     <td><p>評価、実験、バッチ検索、ノートブック、単発分析</p></td>
   </tr>
   <tr>
     <td><p>ランタイム動作</p></td>
     <td><p>一時停止または削除されるまで常時稼働</p></td>
     <td><p>オンデマンドで起動し、アイドル時間後にスケールツーゼロ</p></td>
   </tr>
   <tr>
     <td><p>アクセスパターン</p></td>
     <td><p>24 時間 365 日の安定したトラフィック</p></td>
     <td><p>バースト的、定期的、またはアドホックなワークロード</p></td>
   </tr>
   <tr>
     <td><p>レイテンシの期待値</p></td>
     <td><p>低レイテンシの本番検索（目標：<code>p99 &lt;= 50 ms</code>）</p></td>
     <td><p>コールドスタートは許容範囲</p></td>
   </tr>
   <tr>
     <td><p>書き込み操作</p></td>
     <td><p>Insert、Upsert、Delete をサポート</p></td>
     <td><p>Import のみ</p></td>
   </tr>
   <tr>
     <td><p>コストモデル</p></td>
     <td><p>クラスター実行中に課金</p></td>
     <td><p>コンピュートアクティブ時またはアイドルタイムアウト待機中に課金</p></td>
   </tr>
</table>

一般的なパターン：

- **Serving のみ**: アプリケーションに安定した本番トラフィックがあり、予測可能な低レイテンシが必要な場合は、Real-time Serving を使用してください。

- **On-demand のみ**: ワークロードが定期的またはアドホックである場合（オフライン評価、品質チェック、ノートブック分析など）は、On-demand Compute を使用してください。

- **両方**: ライブトラフィックには Realtime Serving を使用し、本番シグナルの分析、変更の評価、改善の検証を行い、それをサービングに反映させる前段階として On-demand Compute を使用してください。

## Realtime Serving\{#realtime-serving}

Realtime Serving は、Continuous Serving 向けの常時稼働型コンピュートです。Zilliz Cloud において、Realtime Serving は Serving Cluster によって提供されます。これは、安定した可用性、低レイテンシ、完全な書き込みサポートを必要とする本番アプリケーション向けの長寿命コンピュートリソースです。

以下の要件のいずれか 1 つ以上を満たすワークロードの場合、Realtime Serving を使用してください：

- アプリケーションがライブの本番トラフィックを処理している。

- クエリレイテンシを一貫して低く保つ必要がある。

- トラフィックが安定しており、24 時間体制で予想される。

- アプリケーションで Insert、Upsert、または Delete 操作が必要である。

- ウォーム状態を維持するコンピュートから恩恵を受けるワークロードである。

Serving Cluster が作成されると、ライフサイクル状態を明示的に変更するまで実行され続けます。コンピュートの課金を停止するために一時停止したり、ワークロードを再度利用可能にするために再開したり、実行中にスケールさせたり、不要になった場合に削除したりすることができます。

![WMDubXaLqoWIuvxsolzcyMTOnog](https://zdoc-images.s3.us-west-2.amazonaws.com/wmdubxalqowiuvxsolzcymtonog.png "WMDubXaLqoWIuvxsolzcyMTOnog")

Serving Cluster がデータをどのように処理するかについては、[データ: External & Managed Collections](./data-external-and-managed-collections) を参照してください。

Serving Cluster の作成方法については、「Create Cluster」を参照してください。

## On-demand Compute | PUBLIC\{#on-demand-compute}

On-demand Compute は、Continuous Discovery 向けの弾力的なコンピュートです。2 つのアクセス形状をサポートします。共有発見ワークロード向けの **On-demand Cluster** と、分離された発見セッション向けの **On-demand Ephemeral** です。

以下の要件のいずれか 1 つ以上を満たすワークロードの場合、On-demand Compute を使用してください：

- クエリが連続的ではなくバースト的に実行される。

- ワークロードがコールドスタートのレイテンシに耐えられる。

- アイドル時のコストを最小限に抑える必要がある。

- ワークロードが探索的、実験的、またはスケジュールベースである。

- ワークロードが、サービングに適用される前の本番シグナルの分析や改善の検証を行うものである。

<Admonition type="info" icon="📘" title="Notes">

<p>取り込みに関して、On-demand Compute は Import のみをサポートします。Insert、Upsert、Delete は利用できません。</p>

</Admonition>

### On-demand Cluster\{#on-demand-cluster}

On-demand Cluster は、共有発見ワークロード向けのユーザー可視な On-demand Compute です。チーム、アプリケーション、またはスケジュールされたジョブが繰り返し分析や評価を実行し、共有コンピュートリソースと共有キャッシュから恩恵を受ける場合に有用です。

On-demand Cluster は、以下のライフサイクルフェーズを経過します。

![QYqxb0zolooNXVx7F0ycrcrznxS](https://zdoc-images.s3.us-west-2.amazonaws.com/qyqxb0zoloonxvx7f0ycrcrznxs.png "QYqxb0zolooNXVx7F0ycrcrznxS")

<table>
   <tr>
     <th><p>フェーズ</p></th>
     <th><p>発生すること</p></th>
     <th><p>課金対象？</p></th>
   </tr>
   <tr>
     <td><ol><li>Provisioning</li></ol></td>
     <td><p>プラットフォームがコンピュートを準備しウォームアップする</p></td>
     <td><p>いいえ</p></td>
   </tr>
   <tr>
     <td><ol start="2"><li>Compute</li></ol></td>
     <td><p>検索リクエストを積極的に処理中</p></td>
     <td><p><strong>はい</strong></p></td>
   </tr>
   <tr>
     <td><ol start="3"><li>Idle wait</li></ol></td>
     <td><p>クエリなし。アイドルタイムアウトの満了を待機中</p></td>
     <td><p><strong>はい</strong></p></td>
   </tr>
   <tr>
     <td><ol start="4"><li>Release</li></ol></td>
     <td><p>コンピュートがスケールツーゼロ</p></td>
     <td><p>いいえ</p></td>
   </tr>
</table>

コンピュートがスケールツーゼロした後の最初のクエリでは、コールドスタートのレイテンシが発生する可能性があります。この起動遅延がワークロードにとって許容範囲である場合に、On-demand Cluster を使用してください。

On-demand Cluster はクラスターとして作成および管理されますが、そのコンピュートは常に実行され続ける必要はありません。アイドル時にスケールツーゼロし、新しい作業が到着したときに再び起動できます。

### On-demand Ephemeral\{#on-demand-ephemeral}

On-demand Ephemeral は、独立した発見セッション向けの分離された On-demand Compute です。各スクリプト、ノートブック、またはツールが、他のユーザーやジョブとセッション状態を共有せずに、独自の短命コンピュート割り当てを取得する必要がある場合に有用です。

On-demand Ephemeral は On-demand Cluster に依存しますが、それ自体はスタンドアロンのクラスターではありません。各セッションについて、Zilliz Cloud は指定された On-demand Cluster に裏打ちされた分離コンピュートを割り当て、セッションの終了またはアイドル化後にその分離コンピュートを解放します。

![KCahbqAjmo8K5NxOBFycKMV2nLc](https://zdoc-images.s3.us-west-2.amazonaws.com/kcahbqajmo8k5nxobfyckmv2nlc.png "KCahbqAjmo8K5NxOBFycKMV2nLc")

## Quick reference\{#quick-reference}

<table>
   <tr>
     <th><p>次元</p></th>
     <th><p>Serving Cluster</p></th>
     <th><p>On-demand Cluster</p></th>
     <th><p>On-demand Ephemeral</p></th>
   </tr>
   <tr>
     <td><p>CS/CD ループにおける役割</p></td>
     <td><p>Continuous Serving</p></td>
     <td><p>共有 Continuous Discovery</p></td>
     <td><p>分離 Continuous Discovery</p></td>
   </tr>
   <tr>
     <td><p>適している用途</p></td>
     <td><p>本番検索、推奨、オンライン RAG</p></td>
     <td><p>共有探索、スケジュールされたバッチ検索、繰り返し評価</p></td>
     <td><p>ノートブック、スクリプト、単発分析</p></td>
   </tr>
   <tr>
     <td><p>ランタイム動作</p></td>
     <td><p>一時停止または削除されるまで常時稼働</p></td>
     <td><p>オンデマンドで起動し、アイドル時間後にスケールツーゼロ</p></td>
     <td><p>セッションごとに割り当てられ、セッション終了またはアイドル化後に解放</p></td>
   </tr>
   <tr>
     <td><p>ライフサイクル所有者</p></td>
     <td><p>ユーザーが Serving Cluster のライフサイクルを管理</p></td>
     <td><p>ユーザーが On-demand Cluster を管理。コンピュートはワークロードに応じて自動スケール</p></td>
     <td><p>Zilliz Cloud がセッション範囲のコンピュート割り当てを管理</p></td>
   </tr>
   <tr>
     <td><p>リソースモデル</p></td>
     <td><p>Realtime 本番コンピュート</p></td>
     <td><p>共有 On-demand Compute</p></td>
     <td><p>セッションごとの分離コンピュート</p></td>
   </tr>
   <tr>
     <td><p>キャッシュ動作</p></td>
     <td><p>本番トラフィック向けのウォームコンピュート</p></td>
     <td><p>セッションまたはジョブ間で共有されるキャッシュ</p></td>
     <td><p>セッションごとの分離コンピュート</p></td>
   </tr>
   <tr>
     <td><p>レイテンシの期待値</p></td>
     <td><p>低レイテンシの本番検索（目標：p99 &lt;= 50 ms）</p></td>
     <td><p>コールドスタートは許容範囲。繰り返しクエリは共有キャッシュから恩恵を受けられる</p></td>
     <td><p>コールドスタートは許容範囲。共有ウォームキャッシュよりも分離性が重要</p></td>
   </tr>
   <tr>
     <td><p>書き込み操作</p></td>
     <td><p>Insert、Upsert、Delete</p></td>
     <td><p>Import のみ</p></td>
     <td><p>Import のみ</p></td>
   </tr>
   <tr>
     <td><p>請求</p></td>
     <td><p>クラスター実行中に課金</p></td>
     <td><p>Compute フェーズおよび Idle wait フェーズ中に課金</p></td>
     <td><p>セッションの Compute フェーズおよび Idle wait フェーズ中に課金</p></td>
   </tr>
</table>

