---
title: "メトリクス リファレンス | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "メトリクス リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はメトリクスを以下のレベルに整理しています | BYOC"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリクス リファレンス

Zilliz Cloud はメトリクスを以下のレベルに整理しています。

- **組織レベルのメトリクス**: すべてのプロジェクトにまたがるアカウント全体の状態（例: ライセンスクレジット、使用状況）を反映します。

- **クラスター レベルのメトリクス**: 個々のクラスター内のリソース使用量、パフォーマンス、データを反映します。

- **コレクション レベルのメトリクス**: クラスター メトリクスのサブセットをコレクションごとに分解したもので、個々のコレクションのパフォーマンス問題の特定やキャパシティ計画に役立ちます。

<Admonition type="info" icon="📘" title="注意">

ほとんどのメトリクスはアラートに対応しています。アラートは、時間枠の中でメトリクスを条件（演算子 + しきい値）に照らして評価し、条件を満たしたときに通知します。設定については、[組織アラートの管理](./manage-organization-alerts) および [プロジェクトアラートの管理](./manage-project-alerts) を参照してください。

</Admonition>

## 組織レベルのメトリクス\{#organization-level-metrics}

組織レベルのメトリクスは、組織内のすべてのプロジェクトにまたがるライセンス関連の問題を追跡するのに役立ちます。

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>License Validity (day)</p></td>
     <td><p>組織ライセンスの有効期限までの残り日数。</p></td>
     <td><ul><li><p><strong>&lt; 60 日</strong>: 更新プロセスを開始してください。</p></li><li><p><strong>Expired</strong>: 完全な機能（例: クラスターの作成 / スケールアップ）を回復するため、ただちに更新 / アップグレードしてください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>License Core Usage (%)</p></td>
     <td><p>使用済み CPU コア数の、ライセンスされた総コア数に対する割合。</p></td>
     <td><ul><li><p><strong>></strong> <strong>70%</strong>: 将来のニーズを評価し、更新 / アップグレードを計画してください。</p></li><li><p><strong>100%</strong>: 中断を避けるため、ただちに更新 / アップグレードしてください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Usage Amount in the Past Day ($)</p></td>
     <td><p>過去 1 日間の累積利用料金。</p></td>
     <td><p>予算と比較して監視し、必要に応じて使用量を最適化するか予算を調整してください。</p></td>
   </tr>
   <tr>
     <td><p>Credit Validity (day)</p></td>
     <td><p>無料クレジットの有効期限までの残り日数。</p></td>
     <td><p>有効期限前にクレジットを使用するか延長してください。</p></td>
   </tr>
   <tr>
     <td><p>Remaining Credits ($)</p></td>
     <td><p>無料クレジットの残高。</p></td>
     <td><p>アカウント機能を維持するため、残高が少なくなったら補充してください。</p></td>
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

## クラスターとコレクションのメトリクス\{#cluster-and-collection-metrics}

これらのメトリクスは、個々のクラスター内のリソース使用量、パフォーマンス、データを表します。**✦** が付いたメトリクスはコレクション レベルでも利用できます。コレクション レベルのメトリクスには、Console のコレクション詳細ページ、[Prometheus endpoint](./prometheus-monitoring)、または RESTful API を通じてアクセスできます。

<Admonition type="info" icon="📘" title="注意">

**Availability** 列には、各メトリクスをサポートするコンピュートリソースが示されています。

- **Serving Clusters only**: このメトリクスは Serving Clusters でのみ利用できます。値にはサポートされている Serving Cluster のデプロイオプションが示されます。**All** はすべての Serving Cluster デプロイオプションを意味します。詳細については、[デプロイメントとプランの比較](./select-zilliz-cloud-service-plans) を参照してください。

- **On-Demand Compute databases**: 利用できるのはコレクション レベルのメトリクスの一部のみです。サポートされるメトリクスには **QPS (Read)**、**Search NQ per Second**、**Latency (Read)**、**Request Failure Rate (Read)**、および **Entity Count** が含まれます。これらのメトリクスは Console で利用できます。このリリースでは、On-Demand Compute database メトリクスの Prometheus エクスポートはサポートされていません。

</Admonition>

### Pod とコンテナのリソース\{#pod-and-container-resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| CPU Usage (core) | Pod によって使用されている CPU コア数。 | BYOC | 傾向を追跡し、継続的な増加やスパイクを調査してください。 |
| CPU Usage Rate for Limit (%) | limit 値に対する Pod CPU 使用率の割合。 | BYOC | 上昇傾向にある場合は、ワークロードを最適化するか limit を増やしてください。 |
| Memory Usage (MB) | Pod 内のコンテナのメモリ使用量（キャッシュを除く）。 | BYOC | 着実な増加やメモリリークの疑いを調査してください。 |
| Memory Usage Rate for Limit (%) | limit 値に対する Pod メモリ使用率の割合。 | BYOC | 一貫して高い場合は、メモリを最適化するか limit を引き上げてください。 |
| Network Inbound Flow (Mbps) | Pod の受信ネットワークフロー。 | BYOC | 輻輳を監視し、帯域幅のサイズ設定を検証してください。 |
| Network Outbound Flow (Mbps) | Pod の送信ネットワークフロー。 | BYOC | 輻輳を監視し、帯域幅のサイズ設定を検証してください。 |

### リソース\{#resources}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Query CU Computation (%) | クエリ実行が CPU リソースをどれだけ使用しているかを測定します。これは、QueryNode の CPU 使用率をその CPU limit に対して相対化して計算されます。 | **Serving Clusters only**: Dedicated / BYOC | 継続的に高い値は、クエリ実行が CPU ボトルネックになっていることを意味します。Zilliz Cloud は、並列クエリ処理能力を高めるために [レプリカをスケールアウト](./plan-cluster-scaling) する場合があります。 |
| Query CU Capacity (%) | 現在の Query CU が容量上限にどれだけ近いかを測定します。これは、ロード済みデータによるメモリ使用量と、クラスター ストレージクォータに対する保存データサイズという 2 つのシグナルのうち高い方を使用します。 | **Serving Clusters only**: Dedicated / BYOC | 継続的に高い値は、現在の Query CU サイズでは十分な容量がない可能性があることを示します。オートスケーリングが有効な場合、Zilliz Cloud はより多くの容量を提供するために [query CU をスケールアップ](./plan-cluster-scaling) する場合があります。 |
| Total Query CU (count) | 現在のクラスターにおける query CU の総数。これは、クラスターの query CU 数とレプリカ数の積として計算されます。（例: クラスターに 2 つの Query CUs と 2 つの Replicas がある場合、ここに表示される Total Query CU は 4 です。） | **Serving Clusters only**: Dedicated / BYOC | query-CU のスケーリングイベントを特定するために追跡してください。 |
| Replica (count) | クラスター レプリカの数。 | **Serving Clusters only**: Dedicated / BYOC | レプリカのスケーリングイベントを特定するために追跡してください。 |
| Storage (GB) | データおよびインデックスによって消費される永続ストレージの総量。 | **Serving Clusters only**: All | ストレージ使用量を監視するために [アラートを設定](./manage-project-alerts) してください。 |

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
     <td><p>1 秒あたりの読み取りリクエスト（search および query）の数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write) ✦</p></td>
     <td><p>1 秒あたりの書き込みリクエスト（insert、bulk insert、upsert、および delete）の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>各 search リクエストが保持するクエリ ベクトル数の 1 秒あたりの数。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>すべての書き込み操作（insert、upsert、bulk insert、および delete）において、1 秒あたりに書き込まれるエンティティ数を測定します。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>システムパフォーマンス監視については <a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>クライアントが読み取りリクエスト（search および query リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間。平均レイテンシと P99 レイテンシを含みます。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>クライアントが書き込みリクエスト（insert および upsert リクエスト）をサーバーに送信してから、クライアントがレスポンスを受信するまでの経過時間。平均レイテンシと P99 レイテンシを含みます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに対する、失敗した読み取りリクエスト全体の割合。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>読み取りリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>1 秒あたりのすべてのリクエストに対する、失敗した書き込みリクエスト全体の割合。</p></td>
     <td><p><strong>Serving Clusters only</strong>: All</p></td>
     <td><p>書き込みリクエスト失敗率を監視するために <a href="./manage-project-alerts">アラートを設定</a> してください。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min) ✦</p></td>
     <td><p>実行に異常に長い時間がかかる query の数。</p><p>デフォルトでは、レイテンシが 5 秒を超える query は slow query と見なされます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>問題のある query を特定し、必要に応じてクラスター設定を調整してパフォーマンスをチューニングしてください。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (%)</p></td>
     <td><p>Cluster write performance capacity = 現在の書き込み操作レート / 書き込みレート上限。80% を超える場合は、書き込み操作（insert および upsert）のレートを下げることが推奨されます。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% を超えている場合）、書き込みレートを下げることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush Operations (counts/min)</p></td>
     <td><p>クラスターにおける flush 操作の数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>flush 操作を頻繁に実行しすぎると、クラスター全体のパフォーマンスに悪影響を及ぼす可能性があります。詳細については、<a href="./limits#flush">Zilliz Cloud Limits</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>クラスター内のすべての query の平均キャッシュヒット率。計算式: query ごとのキャッシュヒット率 = (総スキャンデータ − コールドデータのスキャン量) / 総スキャンデータ。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のある tiered-storage クラスターでのみ利用できます。このメトリクスにアクセスするには、クラスターの Milvus バージョンをアップグレードするために <a href="http://support.zilliz.com">お問い合わせください</a>。</em></p></td>
     <td><p>クラスターの query パフォーマンスを特定するために追跡してください。</p></td>
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
     <td><p>増加を監視し、必要に応じてプロジェクトごとの制限を適用してください。</p></td>
   </tr>
   <tr>
     <td><p>Entity Count ✦</p></td>
     <td><p>クラスターまたはコレクションに insert されたエンティティの総数。単一 insert と bulk insert の両方を含みます。</p></td>
     <td><ul><li><p><strong>Serving Clusters</strong>: All</p></li><li><p><strong>On-Demand Compute databases</strong>: Managed collections, external collections</p></li></ul></td>
     <td><p>想定外の増加を調査し、ストレージとインデックス作成を計画してください。</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (Approx.) ✦</p></td>
     <td><p>ロード済み（アクティブに提供中）のエンティティの概算数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムな値については、コレクション概要ページの「Loaded Entities」の値を参照するか、<a href="./single-vector-search">count(&ast;)</a> を使用してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>クラスター内でアンロードされているコレクションの数。</p></td>
     <td><p><strong>Serving Clusters only</strong>: Dedicated (Enterprise or  Business Critical) / BYOC</p></td>
     <td><p>重要なコレクションをロードし、メモリの余裕を確認してください。</p></td>
   </tr>
</table>

### その他\{#others}

| Metric | Description | Availability | Recommended action |
| --- | --- | --- | --- |
| Cluster is Abnormal | 対象クラスターのステータスが異常な場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | クラスターのステータスを調査し、それに応じた対策を講じてください。 |
| CMEK is Unavailable | Zilliz Cloud に追加した KMS キーのいずれかが利用不可になった場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | 報告されたキーがまだ利用可能かどうかを判断するため、KMS キーを確認してください。 |
| Writes to Cluster Are Disabled | エラーまたは保護メカニズムにより、対象クラスターへの書き込みが無効になった場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) / BYOC | クラスターのステータス、最近の設定またはメンテナンス操作、および関連アラートを確認し、根本原因を解決して書き込み機能を復旧してください。 |
| Access Logs Forwarding is Abnormal | アクセスログを設定済みのストレージ インテグレーションに正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、転送先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されたことを確認してください。 |
| Audit Logs Forwarding is Abnormal | 監査ログを設定済みのストレージ インテグレーションに正常に転送できない場合。 | **Serving Clusters only**: Dedicated (Enterprise or  Business Critical) | ログ転送設定、転送先サービスのステータス、ネットワーク接続、および関連する認証情報または権限を確認し、問題を解決してログ転送が再開されたことを確認してください。 |

## 関連トピック\{#related-topics}

- [クラスターメトリクスチャートを表示する](./view-cluster-metric-charts)

- [組織アラートを管理する](./manage-organization-alerts)

- [プロジェクトアラートを管理する](./manage-project-alerts)

