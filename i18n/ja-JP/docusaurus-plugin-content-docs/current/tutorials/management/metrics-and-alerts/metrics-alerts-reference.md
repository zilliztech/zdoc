---
title: "メトリクスリファレンス | Cloud"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はメトリクスを次のレベルに整理しています | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloud はメトリクスを次のレベルに整理しています。

- **Organization レベルのメトリクス**: すべての project にわたるアカウント全体のステータス（例: ライセンスクレジット、使用状況）を反映します。

- **Cluster レベルのメトリクス**: 個々の cluster 内のリソース使用量、パフォーマンス、およびデータを反映します。

- **Collection レベルのメトリクス**: cluster メトリクスの一部を collection ごとに分解したもので、個々の collection のパフォーマンス上の問題の特定やキャパシティ計画に役立ちます。

<Admonition type="info" icon="📘" title="メモ">

ほとんどのメトリクスはアラートをサポートしています。アラートは、時間枠内でメトリクスを条件（演算子 + しきい値）に対して評価し、条件を満たしたときに通知します。設定については、[Manage Organization Alerts](./manage-organization-alerts) および [Manage Project Alerts](./manage-project-alerts) を参照してください。

</Admonition>

## Organization レベルのメトリクス\{#organization-level-metrics}

Organization レベルのメトリクスは、organization 内のすべての project にまたがる請求関連の問題を追跡するのに役立ちます。

| Metric | Description | Recommended action |
| --- | --- | --- |
| Usage Amount in the Past Day ($) | 過去 1 日間の累積使用料金。 | 予算との比較を監視し、必要に応じて使用量を最適化するか予算を調整してください。 |
| Credit Validity (day) | 無料クレジットの有効期限までの残り日数。 | 期限切れ前にクレジットを使用するか延長してください。 |
| Remaining Credits ($) | 無料クレジットの残高。 | アカウント機能を維持するため、残高が少なくなったら追加してください。 |
| Credit Card Validity (day) | 保存済みカードの有効期限までの日数。 | 支払い失敗を避けるため、期限切れ前にカードを更新または交換してください。 |
| Advance Pay Balance ($) | 残りの前払い資金。 | サービス中断を防ぐため、残高が少なくなったら資金を追加してください。 |

## Cluster と collection のメトリクス\{#cluster-and-collection-metrics}

これらのメトリクスは、個々の cluster 内のリソース使用量、パフォーマンス、およびデータを表します。**✦** が付いたメトリクスは collection レベルでも利用できます。collection レベルのメトリクスには、Console の collection 詳細ページ、[Prometheus endpoint](./prometheus-monitoring)、または RESTful API からアクセスできます。

<Admonition type="info" icon="📘" title="メモ">

**Availability** 列には、各メトリクスをサポートするコンピュートリソースが記載されています。

- **Serving Clusters only**: このメトリクスは Serving Clusters でのみ利用できます。値にはサポートされる Serving Cluster のデプロイオプションが示されます。**All** はすべての Serving Cluster デプロイオプションを意味します。詳細については、[Deployment and Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

- **On-Demand Compute databases**: 利用できるのは collection レベルメトリクスの一部のみです。サポートされるメトリクスには **QPS (Read)**、**Search NQ per Second**、**Latency (Read)**、**Request Failure Rate (Read)**、および **Entity Count** が含まれます。

</Admonition>

### Resources\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Read vCUs (count) | search および query 操作の vCU 消費量の指標です。<br/>注: このメトリクスではアラートはサポートされていません。 | **Serving Clusters only**: Free / Serverless | 傾向を監視して、読み取りコスト/スループットを把握してください。 |
| Write vCUs (count) | insert、delete、および upsert 操作の vCU 消費量の指標です。<br/>注: このメトリクスではアラートはサポートされていません。 | **Serving Clusters only**: Free / Serverless | 傾向を監視して、書き込みコスト/スループットを把握してください。 |
| Query CU Computation (%) | query 実行が CPU リソースをどの程度使用しているかを測定します。これは、QueryNode の CPU 使用率を CPU 制限に対して相対化して計算されます。 | **Serving Clusters only**: Dedicated / BYOC | 高い値が継続する場合、query 実行が CPU ボトルネックになっていることを意味します。Zilliz Cloud は、並列 query 処理能力を高めるために [scale out replicas](./plan-cluster-scaling) する場合があります。 |
| Query CU Capacity (%) | 現在の Query CU がその容量上限にどれだけ近いかを測定します。ロード済みデータによるメモリ使用量と、cluster ストレージクォータに対する保存データサイズという 2 つのシグナルのうち高い方を使用します。 | **Serving Clusters only**: Dedicated / BYOC | 高い値が継続する場合、現在の Query CU サイズでは十分な容量がない可能性があります。auto scaling が有効な場合、Zilliz Cloud はより多くの容量を提供するために [scale up query CU](./plan-cluster-scaling) する場合があります。 |
| Total Query CU (count) | 現在の cluster の合計 query CU です。これは、cluster query CU 数と replica 数の積として計算されます。（例: cluster に 2 つの Query CUs と 2 つの Replicas がある場合、ここに表示される Total Query CU は 4 です。） | **Serving Clusters only**: Dedicated / BYOC | query-CU のスケーリングイベントを特定するために追跡してください。 |
| Replica (count) | cluster replica の数。 | **Serving Clusters only**: Dedicated / BYOC | replica のスケーリングイベントを特定するために追跡してください。 |
| Storage (GB) | データと index が消費する永続ストレージの総量。 | **Serving Clusters only**: All | ストレージ使用量を監視するために [Configure alerts](./manage-project-alerts) してください。 |

### Performance\{#performance}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read) ✦</p></td>
     <td><p>1 秒あたりの読み取りリクエスト（search および query）の数。</p></td>
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
     <td><p>各 search リクエストが 1 秒あたりに持つ query vector の数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>すべての書き込み操作（insert、upsert、bulk insert、および delete）にわたって、1 秒あたりに書き込まれる entity 数を測定します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンスの監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>クライアントが読み取りリクエスト（search および query リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間です。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>クライアントが書き込みリクエスト（insert および upsert リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間です。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに対する、失敗した読み取りリクエストの割合。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>読み取りリクエスト失敗率を監視するために <a href="./manage-project-alerts">Configure alerts</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに対する、失敗した書き込みリクエストの割合。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>書き込みリクエスト失敗率を監視するために <a href="./manage-project-alerts">Configure alerts</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min) ✦</p></td>
     <td><p>実行に異常に長い時間がかかる query の数。</p><p>デフォルトでは、レイテンシが 5 秒を超える query は slow query と見なされます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>問題のある query を特定し、必要に応じて cluster 構成を調整してパフォーマンスをチューニングしてください。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (%)</p></td>
     <td><p>Cluster 書き込みパフォーマンス容量 = 現在の書き込み操作レート / 書き込みレート上限。80% を超える場合は、書き込み操作（insert および upsert）のレートを下げることを推奨します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% 超が推奨しきい値）、書き込みレートを下げることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations (counts/min)</p></td>
     <td><p>cluster 上の flush 操作の回数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>flush 操作を頻繁に実行しすぎると、cluster 全体のパフォーマンスに悪影響を与える可能性があります。詳細については、<a href="./limits#flush">Zilliz Cloud Limits</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>cluster 内のすべての query の平均キャッシュヒット率で、次のように計算されます: query ごとのキャッシュヒット率 = (スキャンされた総データ − スキャンされたコールドデータ) / スキャンされた総データ。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のある tiered-storage cluster でのみ利用できます。このメトリクスにアクセスするには、cluster の Milvus バージョンをアップグレードするために <a href="http://support.zilliz.com">contact us</a> してください。</em></p></td>
     <td><p>cluster query パフォーマンスを特定するために追跡してください。</p></td>
   </tr>
</table>

### Data\{#data}

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Description</p></th>
     <th><p>Availability</p></th>
     <th><p>Recommended action</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>cluster 内に作成された collection の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>増加を監視し、必要に応じて project ごとの制限を適用してください。</p></td>
   </tr>
   <tr>
     <td><p>Entity Count ✦</p></td>
     <td><p>single insert と bulk insert の両方を含む、cluster または collection に挿入された entity の総数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>想定外の増加を調査し、ストレージと indexing を計画してください。</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.) ✦</p></td>
     <td><p>ロード済み（アクティブに提供中）の entity の概算数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムな値については、collection overview ページの 'Loaded Entities' 値を参照するか、<a href="./single-vector-search">count(&ast;)</a> を使用してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>cluster 内の未ロード collection の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>重要な collection をロードし、メモリ余裕を確認してください。</p></td>
   </tr>
</table>

### Others\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | 対象 cluster のステータスが異常な場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | cluster のステータスを調査し、それに応じた対策を講じてください。 |
| CMEK is Unavailable | Zilliz Cloud に追加した KMS key のいずれかが利用不可になった場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | 報告された key がまだ利用可能かどうかを判断するために、KMS key を確認してください。 |
| Writes to Cluster Are Disabled | エラーまたは保護メカニズムにより、対象 cluster への書き込みが無効化されている場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | cluster のステータス、最近の設定またはメンテナンス操作、および関連アラートを確認し、根本原因を解決して書き込み機能を復旧してください。 |
| Access Logs Forwarding is Abnormal | access log を設定済みの storage integration に正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | log 転送設定、送信先サービスのステータス、ネットワーク接続性、および関連する認証情報または権限を確認し、問題を解決して log 転送が再開されることを確認してください。 |
| Audit Logs Forwarding is Abnormal | audit log を設定済みの storage integration に正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | log 転送設定、送信先サービスのステータス、ネットワーク接続性、および関連する認証情報または権限を確認し、問題を解決して log 転送が再開されることを確認してください。 |

## 関連トピック\{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage Organization Alerts](./manage-organization-alerts)

- [Manage Project Alerts](./manage-project-alerts)

