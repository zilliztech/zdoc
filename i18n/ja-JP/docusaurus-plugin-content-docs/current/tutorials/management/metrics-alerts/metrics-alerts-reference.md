---
title: "メトリクスリファレンス | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はメトリクスを以下のレベルに整理しています | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloud はメトリクスを以下のレベルに整理しています。

- **組織レベルのメトリクス**: すべてのプロジェクトにまたがる、アカウント全体のステータス（例: ライセンスクレジット、使用状況）を反映します。

- **クラスターレベルのメトリクス**: 個々のクラスター内のリソース使用量、パフォーマンス、およびデータを反映します。

- **コレクションレベルのメトリクス**: クラスターメトリクスの一部をコレクションごとに分解したもので、個々のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

<Admonition type="info" icon="📘" title="注意">

ほとんどのメトリクスはアラートに対応しています。アラートは、ある時間枠においてメトリクスを条件（演算子 + しきい値）に照らして評価し、条件を満たした場合に通知します。設定については、[組織アラートの管理](./manage-organization-alerts) および [プロジェクトアラートの管理](./manage-project-alerts) を参照してください。

</Admonition>

## 組織レベルのメトリクス\{#organization-level-metrics}

組織レベルのメトリクスは、組織内のすべてのプロジェクトにまたがる請求関連の問題を追跡するのに役立ちます。

| Metric | Description | Recommended action |
| --- | --- | --- |
| Usage Amount in the Past Day ($) | 過去 1 日間の累積使用料金。 | 予算との比較を監視し、必要に応じて使用量を最適化するか予算を調整します。 |
| Credit Validity (day) | 無料クレジットの有効期限までの残り日数。 | 有効期限が切れる前にクレジットを使用するか延長します。 |
| Remaining Credits ($) | 無料クレジットの残高。 | アカウント機能を維持するため、残高が少なくなったら補充します。 |
| Credit Card Validity (day) | 保存済みカードの有効期限までの日数。 | 支払い失敗を避けるため、有効期限前にカードを更新または差し替えます。 |
| Advance Pay Balance ($) | 残りの前払い資金。 | サービス中断を防ぐため、残高が少なくなったら資金を追加します。 |

## クラスターおよびコレクションメトリクス\{#cluster-and-collection-metrics}

これらのメトリクスは、個々のクラスター内のリソース使用量、パフォーマンス、およびデータを表します。**✦** が付いたメトリクスはコレクションレベルでも利用できます。コレクションレベルのメトリクスには、Console のコレクション詳細ページ、[Prometheus endpoint](./prometheus-monitoring)、または RESTful API からアクセスできます。

<Admonition type="info" icon="📘" title="注意">

**Availability** 列には、各メトリクスをサポートするコンピュートリソースが示されています。

- **Serving Clusters only**: このメトリクスは Serving Clusters でのみ利用できます。値には、サポートされる Serving Cluster のデプロイオプションが表示されます。**All** は、すべての Serving Cluster デプロイオプションを意味します。詳細は、[デプロイメントとプランの比較](./select-zilliz-cloud-service-plans) を参照してください。

- **On-Demand Compute databases**: 利用できるのはコレクションレベルのメトリクスの一部のみです。サポートされるメトリクスには、**QPS (Read)**、**Search NQ per Second**、**Latency (Read)**、**Request Failure Rate (Read)**、および **Entity Count** が含まれます。これらのメトリクスは Console で利用できます。このリリースでは、On-Demand Compute database メトリクスの Prometheus エクスポートはサポートされていません。

</Admonition>

### リソース\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Read vCUs (count) | 検索およびクエリ操作の vCU 消費量の指標。<br/>注: このメトリクスではアラートはサポートされていません。 | **Serving Clusters only**: Free / Serverless | 傾向を監視して、読み取りコスト/スループットを把握します。 |
| Write vCUs (count) | 挿入、削除、および upsert 操作の vCU 消費量の指標。<br/>注: このメトリクスではアラートはサポートされていません。 | **Serving Clusters only**: Free / Serverless | 傾向を監視して、書き込みコスト/スループットを把握します。 |
| Query CU Computation (%) | クエリ実行が CPU リソースをどの程度使用しているかを測定します。これは QueryNode の CPU 使用率をその CPU 制限に対して相対化して計算されます。 | **Serving Clusters only**: Dedicated / BYOC | 高い値が継続する場合、クエリ実行が CPU ボトルネックになっていることを意味します。Zilliz Cloud は並列クエリ処理能力を高めるために [レプリカをスケールアウト](./plan-cluster-scaling) する場合があります。 |
| Query CU Capacity (%) | 現在の Query CU が容量上限にどれだけ近いかを測定します。これは、ロード済みデータが使用するメモリと、クラスターのストレージクォータに対する保存データサイズという 2 つのシグナルのうち高い方を使用します。 | **Serving Clusters only**: Dedicated / BYOC | 高い値が継続する場合、現在の Query CU サイズでは十分な容量がない可能性があります。自動スケーリングが有効な場合、Zilliz Cloud はより多くの容量を提供するために [Query CU をスケールアップ](./plan-cluster-scaling) する場合があります。 |
| Total Query CU (count) | 現在のクラスターにおける合計 Query CU 数。これは、クラスターの Query CU 数とレプリカ数の積として計算されます。（例: クラスターに 2 つの Query CUs と 2 つの Replicas がある場合、ここに表示される Total Query CU は 4 です。） | **Serving Clusters only**: Dedicated / BYOC | Query CU のスケーリングイベントを特定するために追跡します。 |
| Replica (count) | クラスターのレプリカ数。 | **Serving Clusters only**: Dedicated / BYOC | レプリカのスケーリングイベントを特定するために追跡します。 |
| Storage (GB) | データとインデックスが消費する永続ストレージの総量。 | **Serving Clusters only**: All | ストレージ使用量を監視するために [アラートを設定](./manage-project-alerts) します。 |

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read) ✦</p></td>
     <td><p>1 秒あたりの読み取りリクエスト（検索およびクエリ）の数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write) ✦</p></td>
     <td><p>1 秒あたりの書き込みリクエスト（insert、bulk insert、upsert、および delete）の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>各検索リクエストが 1 秒あたりに運ぶクエリベクトルの数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>すべての書き込み操作（insert、upsert、bulk insert、および delete）において、1 秒あたりに書き込まれるエンティティ数を測定します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>クライアントが読み取りリクエスト（検索およびクエリリクエスト）をサーバーに送信してから、クライアントが応答を受信するまでの経過時間です。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>クライアントが書き込みリクエスト（insert および upsert リクエスト）をサーバーに送信してから、クライアントが応答を受信するまでの経過時間です。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>1 秒あたりの全リクエストに占める、失敗した読み取りリクエスト全体の割合。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>読み取りリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> します。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>1 秒あたりの全リクエストに占める、失敗した書き込みリクエスト全体の割合。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>書き込みリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> します。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min) ✦</p></td>
     <td><p>実行に異常に長い時間がかかるクエリの数。</p><p>デフォルトでは、レイテンシが 5 秒を超えるクエリはスロークエリと見なされます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>問題のあるクエリを特定し、必要に応じてクラスター構成を調整してパフォーマンスを最適化します。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (%)</p></td>
     <td><p>クラスターの書き込みパフォーマンス容量 = 現在の書き込み操作率 / 書き込みレート上限。80% を超える場合は、書き込み操作（insert および upsert）のレートを下げることを推奨します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% 超が目安）、書き込みレートを下げることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations (counts/min)</p></td>
     <td><p>クラスターに対する flush 操作の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>flush 操作を頻繁に実行しすぎると、クラスター全体のパフォーマンスに悪影響を及ぼす可能性があります。詳細は <a href="./limits#flush">Zilliz Cloud Limits</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>クラスター内のすべてのクエリにおける平均キャッシュヒット率で、次のように計算されます: クエリごとのキャッシュヒット率 = (総スキャンデータ量 − コールドデータのスキャン量) / 総スキャンデータ量。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のある tiered-storage クラスターでのみ利用可能です。このメトリクスにアクセスするには、クラスターの Milvus バージョンをアップグレードするために <a href="http://support.zilliz.com">お問い合わせください</a>。</em></p></td>
     <td><p>クラスターのクエリパフォーマンスを特定するために追跡します。</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>クラスター内に作成されたコレクションの数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>増加を監視し、必要に応じてプロジェクトごとの上限を適用します。</p></td>
   </tr>
   <tr>
     <td><p>Entity Count ✦</p></td>
     <td><p>単一 insert と bulk insert の両方を含む、クラスターまたはコレクションに挿入されたエンティティの総数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>想定外の増加を調査し、ストレージとインデックス作成を計画します。</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.) ✦</p></td>
     <td><p>ロード済み（アクティブに提供中）のエンティティの概算数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムな値については、コレクション概要ページの「Loaded Entities」の値を参照するか、<a href="./single-vector-search">count(&ast;)</a> を使用してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>クラスター内の未ロードコレクション数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>重要なコレクションをロードし、メモリの余裕を見直します。</p></td>
   </tr>
</table>

### その他\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | 対象クラスターのステータスが異常な場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | クラスターのステータスを調査し、それに応じた対策を講じます。 |
| CMEK is Unavailable | Zilliz Cloud に追加した KMS キーの 1 つが利用不可になった場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | 報告されたキーがまだ利用可能かどうかを判断するために、KMS キーを確認します。 |
| Writes to Cluster Are Disabled | エラーまたは保護メカニズムにより、対象クラスターへの書き込みが無効化された場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | クラスターのステータス、最近の設定またはメンテナンス操作、および関連するアラートを確認し、根本原因を解決して書き込み機能を復旧します。 |
| Access Logs Forwarding is Abnormal | アクセスログを設定済みのストレージ統合先へ正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、送信先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されたことを確認します。 |
| Audit Logs Forwarding is Abnormal | 監査ログを設定済みのストレージ統合先へ正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、送信先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されたことを確認します。 |

## 関連トピック\{#related-topics}

- [クラスターメトリクスチャートの表示](./view-cluster-metric-charts)

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)

