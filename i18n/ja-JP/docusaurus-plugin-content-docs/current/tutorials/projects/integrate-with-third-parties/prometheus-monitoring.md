---
title: "Prometheusとの統合 | Cloud"
slug: /prometheus-monitoring
sidebar_label: "Prometheus"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Prometheusは、指定された間隔で設定されたターゲットからメトリクスを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。 | Cloud"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 5
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - サードパーティ
  - サービス
  - prometheus
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search

---

import Admonition from '@theme/Admonition';


# Prometheusとの統合

[Prometheus](https://prometheus.io/)は、指定された間隔で設定されたターゲットからメトリクスを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。

Zilliz CloudをPrometheusと統合することで、Zilliz Cloudデプロイメントに関連するメトリクスを収集および監視できます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## Prometheusを構成してZilliz Cloudメトリクスをスクレイプする\{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

PrometheusでZilliz Cloudクラスターを監視するには、以下の手順に従います：

1. Prometheusサーバー上の`Prometheus.yml`構成ファイルにアクセスします。詳細については、[構成](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration)を参照してください。

1. `Prometheus.yml`ファイルの`scrape_configs`セクションに以下のスニペットを追加します。プレースホルダーを適切な値に置き換えてください：

    - `{{apiKey}}`：クラスターメトリクスにアクセスするためのZilliz Cloud APIキー。

    - `{{clusterId}}`：監視したいZilliz CloudクラスターのID。

    ```yaml
    scrape_configs:
      - job_name: in01-06b8404b623xxxx
        scheme: https
        metrics_path: /v2/clusters/{{clusterId}}/metrics/export
        authorization:
          type: Bearer
          credentials: {{apiKey}}

        static_configs:
            - targets: ["api.cloud.zilliz.com"]
    ```

    <table>
       <tr>
         <th><p>パラメータ</p></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>job_name</code></p></td>
         <td><p>スクレイプされたメトリクスに割り当てられた人間が読めるラベル。</p></td>
       </tr>
       <tr>
         <td><p><code>scheme</code></p></td>
         <td><p>Zilliz Cloudエンドポイントからメトリクスをスクレイプするために使用されるプロトコルスキームで、<code>https</code>に設定されています。</p></td>
       </tr>
       <tr>
         <td><p><code>metrics_path</code></p></td>
         <td><p>メトリクスデータを提供するターゲットサービス上のパス。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.type</code></p></td>
         <td><p>Zilliz Cloudメトリクスにアクセスするために使用される認証タイプ。値を<code>Bearer</code>に設定します。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>Zilliz Cloudメトリクスエンドポイントにアクセスするための認証に使用されるAPIキー。</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>Prometheusがスクレイプする静的ターゲットで、Zilliz Cloud RESTful APIのホストアドレスである<code>api.cloud.zilliz.com</code>である必要があります。</p></td>
       </tr>
    </table>

1. `Prometheus.yml`ファイルへの変更を保存します。

詳細については、[Prometheus公式ドキュメント](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)を参照してください。

## スクレイプされたメトリクスの例\{#example-scraped-metrics}

以下は、Zilliz Cloudの`/metrics/export`エンドポイントからスクレイプされたPrometheusメトリクスの例です：

```plaintext
# HELP zilliz_cluster_capacity クラスターキャパシティ比率
# TYPE zilliz_cluster_capacity gauge
zilliz_cluster_capacity 0.88
# HELP zilliz_cluster_computation クラスターコンピュテーション比率
# TYPE zilliz_cluster_computation gauge
zilliz_cluster_computation 0.1
# HELP zilliz_cluster_storage_bytes クラスターストレージ使用量
# TYPE zilliz_cluster_storage_bytes gauge
zilliz_cluster_storage_bytes 8.9342782E7
# HELP zilliz_request_vectors_total リクエスト内のベクトルの総数
# TYPE zilliz_request_vectors_total counter
zilliz_request_vectors_total{request_type="bulk_insert"} 1.0
zilliz_request_vectors_total{request_type="delete"} 1.0
zilliz_request_vectors_total{request_type="insert"} 1.0
zilliz_request_vectors_total{request_type="search"} 1.0
zilliz_request_vectors_total{request_type="upsert"} 1.0
```

## Zilliz Cloudメトリクスラベル\{#zilliz-cloud-metric-labels}

Zilliz Cloudによって公開されるメトリクスには、以下の識別子でラベルが付けられます。

<table>
   <tr>
     <th><p>ラベル名</p></th>
     <th><p>説明</p></th>
     <th><p>値</p></th>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリクスが属するZilliz CloudクラスターのID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>Zilliz Cloudクラスターを所有する組織のID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>クラスターが所属する組織内のプロジェクトのID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>collection_name</code></p></td>
     <td><p>監視されているコレクションの名前。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>データに対して実行された操作のタイプ。</p></td>
     <td><p><code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>データ操作の結果。</p></td>
     <td><p><code>success</code>, <code>fail</code></p></td>
   </tr>
</table>

## 利用可能なメトリクス\{#available-metrics}

以下の表は、Zilliz Cloudで利用可能なメトリクスを、その型、説明、および関連するラベルとともにリストしています。

<table>
   <tr>
     <th><p>メトリクス名</p></th>
     <th><p>型</p></th>
     <th><p>説明</p></th>
     <th><p>ラベル</p></th>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_computation</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在のコンピュテーションキャパシティ使用率。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在のストレージキャパシティ使用率。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_storage_bytes</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>使用されている合計ストレージ容量。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_write_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在の書き込みスループット。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_requests_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>処理されたリクエストの総数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>status</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_vectors_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>すべてのリクエストで操作されたベクトルの総数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_duration_seconds_bucket</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>処理されたリクエストのレイテンシ分布。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_slow_queries_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>レイテンシしきい値を超えたクエリの数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>保存されているエンティティの総数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_loaded_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在メモリにロードされているエンティティの数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_indexed_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>インデックス化されているエンティティの数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>コレクションの総数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_unloaded_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>アンロードされたコレクションの数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
</table>

## Prometheusクエリの例\{#example-prometheus-queries}

以下は、PrometheusでZilliz Cloudメトリクスを分析するために使用できるクエリの例です：

- インサートQPSを計算

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- インサートVPSを計算

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- 70パーセンタイルのインサートレイテンシを計算

    ```plaintext
    histogram_quantile(
        0.70,
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
        ) by (le)
    )
    ```

- インサートリクエストの失敗率を計算

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[$__rate_interval])
    /
    rate(zilliz_requests_total{cluster_id=?}[$__rate_interval])
    ```

- 1分あたりのスロークエリ数を計算

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- 5分あたりのスロークエリ数を計算

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```