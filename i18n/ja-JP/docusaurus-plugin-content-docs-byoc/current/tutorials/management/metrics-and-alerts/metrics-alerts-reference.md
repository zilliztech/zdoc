---
title: "メトリクスリファレンス | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はメトリクスを次のレベルに整理しています | BYOC"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloud はメトリクスを次のレベルに整理しています。

- **Organization レベルのメトリクス**: すべてのプロジェクトにまたがるアカウント全体の状態（例: ライセンスクレジット、使用状況）を反映します。

- **Cluster レベルのメトリクス**: 個々の cluster 内のリソース使用量、パフォーマンス、およびデータを反映します。

- **Collection レベルのメトリクス**: cluster メトリクスの一部を collection ごとに分類したもので、個々の collection のパフォーマンス問題の特定や容量計画に役立ちます。

<Admonition type="info" icon="📘" title="注記">

ほとんどのメトリクスはアラートをサポートしています。アラートは、一定の時間枠にわたって条件（演算子 + しきい値）に対してメトリクスを評価し、条件が満たされたときに通知します。設定については、[Organization アラートの管理](./manage-organization-alerts) および [Project アラートの管理](./manage-project-alerts) を参照してください。

</Admonition>

## Organization-level metrics\{#organization-level-metrics}

Organization レベルのメトリクスは、organization 内のすべてのプロジェクトにまたがるライセンス関連の問題を追跡するのに役立ちます。

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>License Validity (day)</p></td>
     <td><p>organization のライセンスが期限切れになるまでの残り日数。</p></td>
     <td><ul><li><p><strong>< 60 days</strong>: 更新プロセスを開始してください。</p></li><li><p><strong>Expired</strong>: 完全な機能（例: cluster の作成 / スケールアップ）を復旧するため、直ちに更新 / アップグレードしてください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>License Core Usage (%)</p></td>
     <td><p>使用済み CPU コア数とライセンス済み総コア数の割合。</p></td>
     <td><ul><li><p><strong>></strong> <strong>70%</strong>: 将来のニーズを評価し、更新 / アップグレードを計画してください。</p></li><li><p><strong>100%</strong>: 中断を避けるため、直ちに更新 / アップグレードしてください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Usage Amount in the Past Day ($)</p></td>
     <td><p>過去 1 日間の累積利用料金。</p></td>
     <td><p>予算と照らして監視し、必要に応じて使用量を最適化するか予算を調整してください。</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity (day)</p></td>
     <td><p>無料クレジットの有効期限までの残り日数。</p></td>
     <td><p>期限切れ前にクレジットを使用するか延長してください。</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits ($)</p></td>
     <td><p>無料クレジットの残高。</p></td>
     <td><p>アカウント機能を維持するため、残高が少なくなったらチャージしてください。</p></td>
   </tr>
   <tr>
     <td><p>Credit Card Validity (day)</p></td>
     <td><p>保存済みカードの有効期限までの日数。</p></td>
     <td><p>支払い失敗を避けるため、有効期限前にカードを更新または差し替えてください。</p></td>
   </tr>
   <tr>
     <td><p>Advance Pay Balance ($)</p></td>
     <td><p>前払い資金の残高。</p></td>
     <td><p>サービス中断を防ぐため、残高が少なくなったら資金を追加してください。</p></td>
   </tr>
</table>

## Cluster and collection metrics\{#cluster-and-collection-metrics}

これらのメトリクスは、個々の cluster 内のリソース使用量、パフォーマンス、およびデータを表します。**✦** が付いたメトリクスは collection レベルでも利用できます。collection レベルのメトリクスには、Console の collection 詳細ページ、[Prometheus endpoint](./prometheus-monitoring)、または RESTful API からアクセスできます。

<Admonition type="info" icon="📘" title="注記">

**Availability** 列には、各メトリクスをサポートするコンピュートリソースが表示されます。

- **Serving Clusters only**: このメトリクスは Serving Clusters でのみ利用できます。値にはサポートされる Serving Cluster のデプロイオプションが表示されます。**All** はすべての Serving Cluster デプロイオプションを意味します。詳細は [Deployment and Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

- **On-Demand Compute databases**: 利用できるのは collection レベルのメトリクスの一部のみです。サポートされるメトリクスには **QPS (Read)**、**Search NQ per Second**、**Latency (Read)**、**Request Failure Rate (Read)**、および **Entity Count** が含まれます。これらのメトリクスは Console で利用できます。このリリースでは、On-Demand Compute database メトリクスの Prometheus エクスポートはサポートされていません。

</Admonition>

### Pod & container resources\{#pod-and-container-resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| CPU Usage (core) | pod で使用されている CPU コア数。 | BYOC | 傾向を追跡し、継続的な増加やスパイクを調査してください。 |
| CPU Usage Rate for Limit (%) | limit 値に対する pod CPU 使用率の割合。 | BYOC | 上昇傾向にある場合は、ワークロードを最適化するか limit を引き上げてください。 |
| Memory Usage (MB) | pod 内の container のメモリ使用量（キャッシュを除く）。 | BYOC | 継続的な増加やリークの疑いを調査してください。 |
| Memory Usage Rate for Limit (%) | limit 値に対する pod メモリ使用率の割合。 | BYOC | 一貫して高い場合は、メモリを最適化するか limit を引き上げてください。 |
| Network Inbound Flow (Mbps) | pod のネットワーク受信フロー。 | BYOC | 輻輳を監視し、帯域幅のサイジングを検証してください。 |
| Network Outbound Flow (Mbps) | pod のネットワーク送信フロー。 | BYOC | 輻輳を監視し、帯域幅のサイジングを検証してください。 |

### Resources\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Query CU Computation (%) | クエリ実行が CPU リソースをどれだけ使用しているかを測定します。QueryNode の CPU 使用率をその CPU limit に対して相対的に計算します。 | **Serving Clusters only**: Dedicated / BYOC | 値が継続的に高い場合、クエリ実行が CPU ボトルネックになっていることを意味します。Zilliz Cloud は、並列クエリ処理能力を高めるために [replica をスケールアウト](./plan-cluster-scaling) する場合があります。 |
| Query CU Capacity (%) | 現在の Query CU が容量上限にどれだけ近いかを測定します。ロード済みデータで使用されるメモリと、cluster ストレージクォータに対する保存データサイズという 2 つのシグナルのうち高い方を使用します。 | **Serving Clusters only**: Dedicated / BYOC | 値が継続的に高い場合、現在の Query CU サイズでは容量が不足している可能性があります。自動スケーリングが有効な場合、Zilliz Cloud はより多くの容量を提供するために [query CU をスケールアップ](./plan-cluster-scaling) することがあります。 |
| Total Query CU (count) | 現在の cluster における総 query CU 数。cluster の query CU 数と replica 数の積として計算されます。（例: cluster に 2 つの Query CUs と 2 つの Replicas がある場合、ここに表示される Total Query CU は 4 です。） | **Serving Clusters only**: Dedicated / BYOC | query-CU スケーリングイベントを特定するために追跡してください。 |
| Replica (count) | cluster の replica 数。 | **Serving Clusters only**: Dedicated / BYOC | replica スケーリングイベントを特定するために追跡してください。 |
| Storage (GB) | データと index が消費する永続ストレージの総量。 | **Serving Clusters only**: All | ストレージ使用量を監視するために [アラートを設定](./manage-project-alerts) してください。 |

### Performance\{#performance}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read) ✦</p></td>
     <td><p>1 秒あたりの読み取りリクエスト数（search および query）。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write) ✦</p></td>
     <td><p>1 秒あたりの書き込みリクエスト数（insert、bulk insert、upsert、および delete）。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>各 search リクエストが 1 秒あたりに持つ query vector の数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>すべての書き込み操作（insert、upsert、bulk insert、および delete）にわたって、1 秒あたりに書き込まれる entity 数を測定します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>クライアントが読み取りリクエスト（search および query リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>クライアントが書き込みリクエスト（insert および upsert リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに占める、失敗した読み取りリクエストの割合。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>読み取りリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに占める、失敗した書き込みリクエストの割合。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>書き込みリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min) ✦</p></td>
     <td><p>実行に通常より長い時間がかかる query の数。</p><p>デフォルトでは、レイテンシが 5 秒を超える query は低速 query と見なされます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>問題のある query を特定し、必要に応じて cluster 構成を調整してパフォーマンスをチューニングしてください。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (%)</p></td>
     <td><p>Cluster の書き込みパフォーマンス容量 = 現在の書き込み操作レート / 書き込みレート上限。80% を超えた場合は、書き込み操作（insert および upsert）のレートを下げることを推奨します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% 超が推奨目安）、書き込みレートを下げることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations (counts/min)</p></td>
     <td><p>cluster における flush 操作の回数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>flush 操作を頻繁に実行しすぎると、cluster 全体のパフォーマンスに悪影響を及ぼす可能性があります。詳細は <a href="./limits#flush">Zilliz Cloud Limits</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>cluster 内のすべての query の平均キャッシュヒット率。計算式: query ごとのキャッシュヒット率 = (スキャンされた総データ − コールドデータとしてスキャンされた量) / スキャンされた総データ。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のある tiered-storage cluster でのみ利用できます。このメトリクスにアクセスするには、cluster の Milvus バージョンをアップグレードするために <a href="http://support.zilliz.com">お問い合わせください</a>。</em></p></td>
     <td><p>cluster の query パフォーマンスを特定するために追跡してください。</p></td>
   </tr>
</table>

### Data\{#data}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>cluster 内に作成された collection の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>増加を監視し、必要に応じて project ごとの上限を適用してください。</p></td>
   </tr>
   <tr>
     <td><p>Entity Count ✦</p></td>
     <td><p>単一 insert と bulk insert の両方を含め、cluster または collection に挿入された entity の総数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>予期しない増加を調査し、ストレージと indexing を計画してください。</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.) ✦</p></td>
     <td><p>ロード済み（アクティブに提供中）の entity の概算数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムな値については、collection overview ページの「Loaded Entities」値を参照するか、<a href="./single-vector-search">count(&ast;)</a> を使用してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>cluster 内のアンロードされた collection の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>重要な collection をロードし、メモリの余裕を確認してください。</p></td>
   </tr>
</table>

### Others\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | 対象 cluster のステータスが異常な場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | cluster のステータスを調査し、それに応じた対策を講じてください。 |
| CMEK is Unavailable | Zilliz Cloud に追加した KMS key の 1 つが利用不可になった場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | 報告された key が引き続き利用可能かどうかを確認するために KMS key を確認してください。 |
| Writes to Cluster Are Disabled | エラーまたは保護メカニズムにより、対象 cluster への書き込みが無効になっている場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | cluster のステータス、最近の構成またはメンテナンス操作、および関連アラートを確認し、根本原因を解決して書き込み機能を復旧してください。 |
| Access Logs Forwarding is Abnormal | 設定されたストレージ統合に access logs を正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、転送先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されることを確認してください。 |
| Audit Logs Forwarding is Abnormal | 設定されたストレージ統合に audit logs を正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、転送先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されることを確認してください。 |

## 関連トピック\{#related-topics}

- [Cluster メトリクスチャートを表示する](./view-cluster-metric-charts)

- [Organization アラートを管理する](./manage-organization-alerts)

- [Project アラートを管理する](./manage-project-alerts)

