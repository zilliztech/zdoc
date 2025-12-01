---
title: "メトリクスリファレンス | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、メトリクスを2つのレベルに分類しています - 組織レベルとプロジェクトレベル | BYOC"
type: origin
token: KnnBwce9JifxvXkd070cvgUPnag
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


# メトリクスリファレンス

Zilliz Cloudでは、メトリクスを2つのレベルに分類しています - **組織**と**プロジェクト**：

- **組織レベルのメトリクス**： すべてのプロジェクトにわたるアカウント全体の状態（例：ライセンスクレジット、使用量）を反映します。

- **プロジェクトレベルのメトリクス**： 単一プロジェクト内のクラスターリソース、容量、パフォーマンス、およびデータを反映します。

<Admonition type="info" icon="📘" title="ノート">

<p>ほとんどのメトリクスはアラートをサポートしています。アラートは、時間ウィンドウ内でメトリクスを条件（演算子+しきい値）と比較し、条件が満たされると通知します。設定については、<a href="./manage-organization-alerts">組織アラートの管理</a>および<a href="./manage-project-alerts">プロジェクトアラートの管理</a>を参照してください。</p>

</Admonition>

## 組織レベルのメトリクス\{#organization-level-metrics}

組織レベルのメトリクスは、組織内のすべてのプロジェクトにわたるライセンス関連の問題を追跡するのに役立ちます。

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>単位</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td><p>ライセンス有効期限</p></td>
     <td><p>日</p></td>
     <td><p>組織ライセンスの有効期限が切れるまでの残り日数です。</p></td>
     <td><ul><li><p><strong>< 60日</strong>：更新プロセスを開始します。</p></li><li><p><strong>有効期限切れ</strong>：完全な機能を復元するために（例：クラスター作成/スケールアップ）すぐに更新またはアップグレードを行います。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>ライセンスコア使用率</p></td>
     <td><p>%</p></td>
     <td><p>使用中のCPUコア数とライセンス対象の全コア数の割合です。</p></td>
     <td><ul><li><p><strong>></strong><strong>70%</strong>：将来のニーズを評価し、更新またはアップグレードを計画します。</p></li><li><p><strong>100%</strong>：中断を避けるためにすぐに更新またはアップグレードを行います。</p></li></ul></td>
   </tr>
</table>

## プロジェクトレベルのメトリクス（クラスターメトリクス）\{#project-level-metrics-cluster-metrics}

これらのメトリクスは、プロジェクトのクラスター内でのリソース使用量とパフォーマンスを記述します。

<Admonition type="info" icon="📘" title="ノート">

<p>このセクションでは、<strong>可用性</strong>はプロジェクトプランおよびデプロイメントオプションを指します。詳細なプラン比較については、<a href="./select-zilliz-cloud-service-plans">詳細プラン比較</a>を参照してください。</p>

</Admonition>

### Podおよびコンテナーリソース\{#pod-and-container-resources}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>単位</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
     <th><p>可用性</p></th>
   </tr>
   <tr>
     <td><p>CPU使用量</p></td>
     <td><p>コア</p></td>
     <td><p>Podで使用されるCPUコア数です。</p></td>
     <td><p>トレンドを追跡し、持続的な成長やスパイクを調査します。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>CPU使用率（制限値に対する）</p></td>
     <td><p>%</p></td>
     <td><p>PodのCPU使用量が制限値に対して占める割合です。</p></td>
     <td><p>上昇トレンドの場合、ワークロードを最適化するか制限を増やしてください。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>メモリ使用量</p></td>
     <td><p>MB</p></td>
     <td><p>Pod内のコンテナーのメモリ使用量です（キャッシュを除く）。</p></td>
     <td><p>安定した成長や疑われるリークを調査します。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>メモリ使用率（制限値に対する）</p></td>
     <td><p>%</p></td>
     <td><p>Podのメモリ使用量が制限値に対して占める割合です。</p></td>
     <td><p>高水準が継続する場合は、メモリを最適化するか制限を引き上げてください。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク受信フロー</p></td>
     <td><p>Mbps</p></td>
     <td><p>Podのネットワーク受信フローです。</p></td>
     <td><p>輻輳を監視し、帯域幅サイズを検証します。</p></td>
     <td><p>BYOC</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク送信フロー</p></td>
     <td><p>Mbps</p></td>
     <td><p>Podのネットワーク送信フローです。</p></td>
     <td><p>輻輳を監視し、帯域幅サイズを検証します。</p></td>
     <td><p>BYOC</p></td>
   </tr>
</table>

### リソース\{#resources}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>単位</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
     <th><p>可用性</p></th>
   </tr>
   <tr>
     <td><p>クエリCU計算</p></td>
     <td><p>%</p></td>
     <td><p>CUの総計算容量に対する利用された計算能力の測定値です。</p></td>
     <td><ul><li><p>70-80%：サービス状況を確認し、<a href="./scale-cluster">スケールアップ</a>の準備をします。</p></li><li><p>>90%：中断を避けるために<a href="./scale-cluster">スケールアップ</a>します。</p></li></ul></td>
     <td><p>デディケート / BYOC</p></td>
   </tr>
   <tr>
     <td><p>クエリCU容量</p></td>
     <td><p>%</p></td>
     <td><p>CUの総容量に対する使用済み容量の測定値です。</p></td>
     <td><ul><li><p>70-80%：<a href="./scale-cluster">スケールアップ</a>の準備をします。</p></li><li><blockquote>  <p>90%：<a href="./scale-cluster">スケールアップ</a>します。</p></blockquote></li><li><p><strong>100%</strong>：書き込みはブロックされています - すぐに<a href="./scale-cluster">スケールアップ</a>してください。</p></li></ul></td>
     <td><p>デディケート / BYOC</p></td>
   </tr>
   <tr>
     <td><p>総クエリCU</p></td>
     <td><p>個数</p></td>
     <td><p>現在のクラスター内の総クエリCUです。クラスタークエリCU数とレプリカ数の積として計算されます。（例：クラスターに2つのクエリCUと2つのレプリカがある場合、ここに表示される総クエリCUは4です。）</p></td>
     <td><p>クエリCUスケーリングイベントを特定するため追跡します。</p></td>
     <td><p>デディケート / BYOC</p></td>
   </tr>
   <tr>
     <td><p>レプリカ</p></td>
     <td><p>個数</p></td>
     <td><p>クラスターレプリカ数です。</p></td>
     <td><p>レプリカスケーリングイベントを特定するため追跡します。</p></td>
     <td><p>デディケート / BYOC</p></td>
   </tr>
   <tr>
     <td><p>ストレージ</p></td>
     <td><p>GB</p></td>
     <td><p>データおよびインデックスによって消費される永続ストレージの総量です。</p></td>
     <td><p>ストレージ使用量の監視のために<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
</table>

### パフォーマンス\{#performance}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>単位</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
     <th><p>可用性</p></th>
   </tr>
   <tr>
     <td><p>QPS（読み取り）</p></td>
     <td><p>-</p></td>
     <td><p>1秒あたりの読み取りリクエスト（検索およびクエリ）数です。</p></td>
     <td><p>システムパフォーマンス監視については<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>QPS（書き込み）</p></td>
     <td><p>-</p></td>
     <td><p>1秒あたりの書き込みリクエスト（挿入、一括挿入、アップサート、および削除）数です。</p></td>
     <td><p>システムパフォーマンス監視については<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>1秒あたりの検索NQ</p></td>
     <td><p>-</p></td>
     <td><p>1秒あたりの検索リクエストで運ばれるクエリベクトル数です。</p></td>
     <td><p>システムパフォーマンス監視については<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>書き込みスループット（エンティティ/秒）</p></td>
     <td><p>-</p></td>
     <td><p>すべての書き込み操作（挿入、アップサート、一括挿入、および削除）で1秒あたりに書き込まれたエンティティ数を測定します。</p></td>
     <td><p>システムパフォーマンス監視については<a href="https://zilliz.com/vector-database-benchmark-tool">ベンチマーク</a>を参照してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ（読み取り）</p></td>
     <td><p>ms</p></td>
     <td><p>クライアントがサーバーに読み取りリクエスト（検索およびクエリ要求）を送信してから、クライアントが応答を受信するまでに経過した時間です。平均レイテンシとP99レイテンシが含まれます。</p></td>
     <td><p>-</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>レイテンシ（書き込み）</p></td>
     <td><p>ms</p></td>
     <td><p>クライアントがサーバーに書き込みリクエスト（挿入およびアップサート要求）を送信してから、クライアントが応答を受信するまでに経過した時間です。平均レイテンシとP99レイテンシが含まれます。</p></td>
     <td><p>-</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>リクエスト失敗率（読み取り）</p></td>
     <td><p>%</p></td>
     <td><p>1秒あたりのすべてのリクエストの中で失敗したすべての読み取りリクエストの割合です。</p></td>
     <td><p>読み取りリクエストの失敗率を監視するために<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>リクエスト失敗率（書き込み）</p></td>
     <td><p>%</p></td>
     <td><p>1秒あたりのすべてのリクエストの中で失敗したすべての書き込みリクエストの割合です。</p></td>
     <td><p>書き込みリクエストの失敗率を監視するために<a href="./manage-project-alerts">アラートを設定</a>してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>低速クエリ数</p></td>
     <td><p>回数/分</p></td>
     <td><p>実行に異常に長い時間がかかるクエリ数です。</p></td>
     <td><p>問題のあるクエリを特定し、必要に応じてクラスター構成を調整してパフォーマンスを調整してください。</p></td>
     <td><p>デディケート（エンタープライズまたはビジネスクリティカル）/ BYOC</p></td>
   </tr>
   <tr>
     <td><p>クラスター書き込みパフォーマンス容量</p></td>
     <td><p>%</p></td>
     <td><p>クラスター書き込みパフォーマンス容量 = 現在の書き込み操作レート / 書き込みレート制限です。80%を超えると、書き込み操作のレート（挿入およびアップサート）を減らすことをお勧めします。</p></td>
     <td><p>現在のレートが高すぎる場合（80%を超えると推奨されます）は、書き込みレートを下げることをお勧めします。</p></td>
     <td><p>デディケート（エンタープライズまたはビジネスクリティカル）/ BYOC</p></td>
   </tr>
   <tr>
     <td><p>フラッシュ操作数</p></td>
     <td><p>回数/分</p></td>
     <td><p>クラスターでのフラッシュ操作数です。</p></td>
     <td><p>フラッシュ操作を頻繁に行うと、クラスター全体のパフォーマンスに悪影響を与える可能性があります。詳細については、<a href="https://docs.cloud-uat3.zilliz.com/docs/limits#flush">Zilliz Cloud制限</a>を参照してください。</p></td>
     <td><p>デディケート（エンタープライズまたはビジネスクリティカル）/ BYOC</p></td>
   </tr>
</table>

### データ\{#data}

<table>
   <tr>
     <th><p>メトリクス</p></th>
     <th><p>単位</p></th>
     <th><p>説明</p></th>
     <th><p>推奨アクション</p></th>
     <th><p>可用性</p></th>
   </tr>
   <tr>
     <td><p>コレクション数</p></td>
     <td><p>個数</p></td>
     <td><p>クラスターで作成されたコレクション数です。</p></td>
     <td><p>成長を監視します。必要に応じてプロジェクトごとの制限を適用してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>エンティティ数</p></td>
     <td><p>個数</p></td>
     <td><p>クラスターに挿入されたエンティティの総数です。単一挿入と一括挿入の両方を含みます。</p></td>
     <td><p>予期しない成長を調査します。ストレージとインデックスを計画してください。</p></td>
     <td><p>すべて</p></td>
   </tr>
   <tr>
     <td><p>ロード済みエンティティ数（概算）</p></td>
     <td><p>個数</p></td>
     <td><p>ロードされた（アクティブに提供されている）エンティティの概算数です。</p></td>
     <td><p>より正確でリアルタイムの値については、コレクション概要ページの「ロード済みエンティティ」値を参照するか、<a href="./single-vector-search">count(*)</a>を使用してください。</p></td>
     <td><p>デディケート / BYOC</p></td>
   </tr>
   <tr>
     <td><p>アンロードされたコレクション数</p></td>
     <td><p>個数</p></td>
     <td><p>クラスター内のアンロードされたコレクション数です。</p></td>
     <td><p>重要なコレクションをロードします。メモリの余裕を確認してください。</p></td>
     <td><p>デディケート（エンタープライズまたはビジネスクリティカル）/ BYOC</p></td>
   </tr>
</table>

## 関連トピック\{#related-topics}

- [クラスターメトリックチャートの表示](./view-cluster-metric-charts)

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)