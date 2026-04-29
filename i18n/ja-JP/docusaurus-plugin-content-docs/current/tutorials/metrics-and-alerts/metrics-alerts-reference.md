---
title: "メトリクスリファレンス | Cloud"
slug: /metrics-alerts-reference
sidebar_key: metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、メトリクスを以下のレベルに整理しています | Cloud"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - メトリクス
  - アラート

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloud は、メトリクスを以下のレベルに整理しています。

- **組織レベルのメトリクス**: 組織内のすべてのプロジェクトにわたるアカウント全体のステータス（例：ライセンスクレジット、使用量）を反映します。

- **Cluster-level metrics**: 個々のクラスター内のリソース使用状況、パフォーマンス、およびデータを反映します。

- **Collection-level metrics**: クラスターメトリクスのサブセットで、コレクションごとに細分化されており、個々のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

<Admonition type="info" icon="📘" title="Notes">

<p>ほとんどのメトリクスはアラートをサポートしています。アラートは、時間ウィンドウ内で条件（演算子 + しきい値）に対してメトリクスを評価し、条件が満たされた場合に通知します。設定については、<a href="./manage-organization-alerts">Manage 組織アラート</a> および <a href="./manage-project-alerts">Manage プロジェクトアラート</a> を参照してください。</p>

</Admonition>

## 組織レベルのメトリクス\{#organization-level-metrics}

組織レベルのメトリクス は、組織内のすべてのプロジェクトにわたる請求関連の問題を追跡するのに役立ちます。

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>過去 1 日の使用量 ($)</p></td>
     <td><p>過去 1 日間の累積使用料金。</p></td>
     <td><p>予算と比較して監視し、必要に応じて使用量を最適化するか予算を調整します。</p></td>
   </tr>
   <tr>
     <td><p>クレジット有効期限 (日)</p></td>
     <td><p>無料クレジットの有効期限が切れるまでの残り日数。</p></td>
     <td><p>失効前にクレジットを使用または延長します。</p></td>
   </tr>
   <tr>
     <td><p>残クレジット ($)</p></td>
     <td><p>無料クレジットの残高。</p></td>
     <td><p>アカウント機能を維持するため、残量が少なくなったらチャージします。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード有効期限 (日)</p></td>
     <td><p>保存されたカードの有効期限が切れるまでの日数。</p></td>
     <td><p>支払い失敗を防ぐため、失効前にカードを更新または交換します。</p></td>
   </tr>
   <tr>
     <td><p>前払い残高 ($)</p></td>
     <td><p>残りの前払い資金。</p></td>
     <td><p>サービス中断を防ぐため、残量が少なくなったら資金を追加します。</p></td>
   </tr>
</table>

## Cluster and collection metrics\{#cluster-and-collection-metrics}

これらのメトリクスは、個々のクラスター内のリソース使用状況、パフォーマンス、およびデータを説明します。**✦** が付いたメトリクスは、コレクションレベルでも利用可能です。コレクションレベルのメトリクスには、コンソールのコレクション詳細ページから、[Prometheus エンドポイント](./prometheus-monitoring) を経由して、または RESTful API を通じてアクセスできます。

<Admonition type="info" icon="📘" title="Notes">

<p>このセクションでは、<strong>Availability</strong> はプロジェクトプランとデプロイメントオプションを指します。プランの詳細な比較については、<a href="./select-zilliz-cloud-service-plans">Detailed Plan Comparison</a> を参照してください。</p>

</Admonition>

### リソース\{#resources}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Read vCUs (count)</p></td>
     <td><p>検索およびクエリ操作の vCU 消費量の指標です。</p><p>注：このメトリクスはアラートをサポートしていません。</p></td>
     <td><p>Free / Serverless</p></td>
     <td><p>読み取りコスト/スループットを理解するために傾向を監視します。</p></td>
   </tr>
   <tr>
     <td><p>Write vCUs (count)</p></td>
     <td><p>挿入、削除、およびアップサート操作の vCU 消費量の指標です。</p><p>注：このメトリクスはアラートをサポートしていません。</p></td>
     <td><p>Free / Serverless</p></td>
     <td><p>書き込みコスト/スループットを理解するために傾向を監視します。</p></td>
   </tr>
   <tr>
     <td><p>Query CU計算 (%)</p></td>
     <td><p>CU の総計算能力に対する利用された計算能力の指標です。</p></td>
     <td><p>Dedicated / BYOC</p></td>
     <td><blockquote>  <p>60%: <a href="./manage-replica">レプリカをスケールアウト</a> することを推奨します</p></blockquote></td>
   </tr>
   <tr>
     <td><p>Query CU容量 %</p></td>
     <td><p>CU の総容量に対する使用容量の指標です。</p></td>
     <td><p>Dedicated / BYOC</p></td>
     <td><blockquote>  <p>80%:  <a href="./scale-query-cu">クエリ CU をスケールアップ</a> することを推奨します</p></blockquote></td>
   </tr>
   <tr>
     <td><p>Total Query CU (count)</p></td>
     <td><p>現在のクラスター内の総クエリ CU です。これは、クラスターのクエリ CU 数とレプリカ数の積として計算されます。（例：クラスターに 2 つのクエリ CU と 2 つのレプリカがある場合、ここに表示される総クエリ CU は 4 です。）</p></td>
     <td><p>Dedicated / BYOC</p></td>
     <td><p>クエリ CU のスケーリングイベントを特定するために追跡します。</p></td>
   </tr>
   <tr>
     <td><p>Replica (count)</p></td>
     <td><p>クラスターレプリカの数。</p></td>
     <td><p>Dedicated / BYOC</p></td>
     <td><p>レプリカのスケーリングイベントを特定するために追跡します。</p></td>
   </tr>
   <tr>
     <td><p>Storage (GB)</p></td>
     <td><p>データとインデックスによって消費される永続ストレージの総量。</p></td>
     <td><p>All</p></td>
     <td><p>ストレージ使用状況を監視するために<a href="./manage-project-alerts">アラートを設定</a>します。</p></td>
   </tr>
</table>

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>QPS (Read) ✦</p></td>
     <td><p>1 秒あたりの読み取りリクエスト（検索およびクエリ）の数。</p></td>
     <td><p>All</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>QPS (Write) ✦</p></td>
     <td><p>1 秒あたりの書き込みリクエスト（挿入、バルク挿入、アップサート、および削除）の数。</p></td>
     <td><p>All</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Search NQ per Second ✦</p></td>
     <td><p>各検索リクエストが 1 秒間に運ぶクエリベクトルの数。</p></td>
     <td><p>All</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Write Throughput (Entities/sec) ✦</p></td>
     <td><p>すべての書き込み操作（挿入、アップサート、バルク挿入、および削除）において、1 秒間に書き込まれるエンティティ数を測定します。</p></td>
     <td><p>All</p></td>
     <td><p>システムパフォーマンスの監視については、<a href="https://zilliz.com/vector-database-benchmark-tool">benchmark</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Latency (Read) (ms) ✦</p></td>
     <td><p>クライアントがサーバーに読み取りリクエスト（検索およびクエリリクエスト）を送信してから、クライアントが応答を受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p>All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Latency (Write) (ms) ✦</p></td>
     <td><p>クライアントがサーバーに書き込みリクエスト（挿入およびアップサートリクエスト）を送信してから、クライアントが応答を受信するまでの経過時間。平均レイテンシと P99 レイテンシが含まれます。</p></td>
     <td><p>All</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Read) (%) ✦</p></td>
     <td><p>1 秒あたりの全リクエストにおける失敗した読み取りリクエストの割合。</p></td>
     <td><p>All</p></td>
     <td><p>読み取りリクエストの失敗率を監視するために<a href="./manage-project-alerts">アラートを設定</a>します。</p></td>
   </tr>
   <tr>
     <td><p>Request Failure Rate (Write) (%) ✦</p></td>
     <td><p>1 秒あたりの全リクエストにおける失敗した書き込みリクエストの割合。</p></td>
     <td><p>All</p></td>
     <td><p>書き込みリクエストの失敗率を監視するために<a href="./manage-project-alerts">アラートを設定</a>します。</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (counts/min)</p></td>
     <td><p>実行に異常に長い時間がかかるクエリの数。</p><p>デフォルトでは、レイテンシが 5 秒を超えるクエリは低速クエリとみなされます。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>問題のあるクエリを特定し、必要に応じてクラスター構成を調整してパフォーマンスをチューニングします。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Write パフォーマンス Capacity (%)</p></td>
     <td><p>クラスター書き込みパフォーマンス容量 = 現在の書き込み操作レート/書き込みレート制限。80% を超えた場合は、書き込み操作（挿入およびアップサート）のレートを低下させることを推奨します。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>現在のレートが高すぎる場合（80% を超えることが推奨されます）、書き込みレートを低下させることを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>Number of Flush 運用 (counts/min)</p></td>
     <td><p>クラスター上のフラッシュ操作の数。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>フラッシュ操作を頻繁に行うと、クラスター全体のパフォーマンスに悪影響を与える可能性があります。詳細については、<a href="https://docs.cloud-uat3.zilliz.com/docs/limits#flush">Zilliz Cloud 制限s</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Cache Hit Rate (%)</p></td>
     <td><p>クラスター内のすべてのクエリの平均キャッシュヒット率。計算式：クエリごとのキャッシュヒット率 = (スキャンされた総データ − スキャンされたコールドデータ) / スキャンされた総データ。</p></td>
     <td><p>Dedicated (Tiered-storage) / BYOC</p><p><em>&ast;このメトリクスは、Milvus 2.6.x と互換性のあるティアードストレージクラスターでのみ利用可能です。このメトリクスにアクセスするには、クラスターの Milvus バージョンをアップグレードするために<a href="http://support.zilliz.com">お問い合わせ</a>ください。</em></p></td>
     <td><p>クラスターのクエリパフォーマンスを特定するために追跡します。</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Collection Count</p></td>
     <td><p>クラスター内に作成されたコレクションの数。</p></td>
     <td><p>All</p></td>
     <td><p>成長を監視し、必要に応じてプロジェクトごとの制限を適用します。</p></td>
   </tr>
   <tr>
     <td><p>エンティティ数 ✦</p></td>
     <td><p>単一挿入とバルク挿入の両方を含む、クラスターまたはコレクションに挿入されたエンティティの総数。</p></td>
     <td><p>All</p></td>
     <td><p>予期せぬ増加を調査し、ストレージとインデックスを計画します。</p></td>
   </tr>
   <tr>
     <td><p>ロードされたエンティティ (Approx.) ✦</p></td>
     <td><p>ロードされた（アクティブに提供されている）エンティティの概数。</p></td>
     <td><p>Dedicated / BYOC</p></td>
     <td><p>より正確でリアルタイムな値については、コレクション概要ページの「ロードされたエンティティ」値を参照するか、<a href="./single-vector-search">count(&ast;)</a> を使用してください。</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections</p></td>
     <td><p>クラスター内のアンロードされたコレクションの数。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>重要なコレクションをロードし、メモリの余裕を確認します。</p></td>
   </tr>
</table>

### その他\{#others}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>説明</p></th>
     <th><p>Availability</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>Cluster is 異常</p></td>
     <td><p>対象クラスターのステータスが異常である場合。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>クラスターのステータスを調査し、それに応じて対策を講じます。</p></td>
   </tr>
   <tr>
     <td><p>CMEK is Unavailable</p></td>
     <td><p>Zilliz Cloud に追加された KMS キーのいずれかが利用できなくなった場合。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>報告されたキーがまだ利用可能かどうかを判断するために、KMS キーを確認します。</p></td>
   </tr>
   <tr>
     <td><p>Writes to Cluster Are Disabled</p></td>
     <td><p>エラーまたは保護メカニズムにより、対象クラスターへの書き込みが無効になっている場合。</p></td>
     <td><p>Dedicated (Enterprise or ビジネスクリティカル) / BYOC</p></td>
     <td><p>クラスターのステータス、最近の構成またはメンテナンス操作、および関連するアラートを確認し、根本原因を解決して書き込み機能を復元します。</p></td>
   </tr>
</table>

## Related topics\{#related-topics}

- [View Cluster Metric Charts](./view-cluster-metric-charts)

- [Manage 組織アラート](./manage-organization-alerts)

- [Manage プロジェクトアラート](./manage-project-alerts)

