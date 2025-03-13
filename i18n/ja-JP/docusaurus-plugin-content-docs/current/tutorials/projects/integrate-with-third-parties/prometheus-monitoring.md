---
title: "Prometheusと統合する | Cloud"
slug: /prometheus-monitoring
sidebar_label: "Prometheusと統合する"
beta: FALSE
notebook: FALSE
description: "Prometheusは、指定された間隔で設定されたターゲットからメトリックを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。 | Cloud"
type: origin
token: Xw77wFha7i8uqJkmnsJcLMO2nkg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - prometheus
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';


# Prometheusと統合する

[Prometheus](https://prometheus.io/)は、指定された間隔で設定されたターゲットからメトリックを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。

Zilliz CloudをPrometheusと統合することで、Zilliz Cloudの展開に関連するメトリックを収集し、監視することができます。

<Admonition type="info" icon="📘" title="ノート">

<p><a href="https://prometheus.io/">Prometheus</a>の統合は、<strong>Dedicated-Enterprise</strong>または<strong>BYOC</strong>プランを実行しているZilliz Cloudクラスターでのみサポートされています。</p>

</Admonition>

## Zilliz CloudメトリクスをスクレイピングするためにPrometheusを設定する{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

PrometheusでZilliz Cloudクラスタを監視するには、次の手順に従ってください:

1. Prometheusサーバー上の`Prometheus`. yml設定ファイルにアクセスします。詳細については、[設定](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration)を参照してください。

1. Prometheus. ymlファイルの`scrape_configs`セクションに次のスニペットを追加し`ま`す。プレースホルダを適切な値に置き換えます。

    - `{{apiKey}}:`クラスタメトリクスにアクセスするためのZilliz Cloud APIキー。

    - `{{cluster terId}}`:監視したいZilliz CloudクラスタのID。

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
         <th><p>説明する</p></th>
       </tr>
       <tr>
         <td><p><code>job_name</code></p></td>
         <td><p>スクレイピングされたメトリックに割り当てられた人間が読めるラベル。</p></td>
       </tr>
       <tr>
         <td><p><code>schema</code></p></td>
         <td><p>Zilliz Cloudエンドポイントからメトリックをスクレイピングするために使用されるプロトコルスキームは<code>https</code>に設定されています。</p></td>
       </tr>
       <tr>
         <td><p><code>metrics_path</code></p></td>
         <td><p>メトリックデータを提供するターゲットサービス上のパス。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.type</code></p></td>
         <td><p>Zilliz Cloudのメトリックにアクセスするために使用される認証タイプ。値を<code>Bearer</code>に設定してください。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>Zilliz Cloudメトリクスエンドポイントにアクセスするために使用されるAPIキー。</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>Prometheusがスクレイピングする静的ターゲットは、Zilliz Cloud RESTful APIのホストアドレスを<code>api.cloud.zilliz.com</code>する必要があります。</p></td>
       </tr>
    </table>

1. 変更をPrometheus. ymlファイルに保存`し`ます。

詳細については、[Prometheus公式ドキュメント](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)を参照してください。

## スクレイピングされたメトリックの例{#example-scraped-metrics}

以下は、Zilliz Cloud`/metrics/export`エンドポイントからスクレイピングされたPrometheusメトリクスの例です。

```plaintext
# HELP zilliz_cluster_capacity Cluster capacity ratio
# TYPE zilliz_cluster_capacity gauge
zilliz_cluster_capacity 0.88
# HELP zilliz_cluster_computation Cluster computation ratio
# TYPE zilliz_cluster_computation gauge
zilliz_cluster_computation 0.1
# HELP zilliz_cluster_storage_bytes Cluster storage usage
# TYPE zilliz_cluster_storage_bytes gauge
zilliz_cluster_storage_bytes 8.9342782E7
# HELP zilliz_request_vectors_total Total number of vectors in requests
# TYPE zilliz_request_vectors_total counter
zilliz_request_vectors_total{request_type="bulk_insert"} 1.0
zilliz_request_vectors_total{request_type="delete"} 1.0
zilliz_request_vectors_total{request_type="insert"} 1.0
zilliz_request_vectors_total{request_type="search"} 1.0
zilliz_request_vectors_total{request_type="upsert"} 1.0
```

## Zilliz Cloudのメトリックラベル{#zilliz-cloud-metric-labels}

Zilliz Cloudによって公開されるメトリックは、以下の識別子でラベル付けされています。

<table>
   <tr>
     <th><p>レーベル名</p></th>
     <th><p>説明する</p></th>
     <th><p>価値観</p></th>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリックが含まれるZilliz CloudクラスターのID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>Zilliz Cloudクラスターを所有する組織のID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>クラスターが属する組織内のプロジェクトのID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>collection_name</code></p></td>
     <td><p>監視されているコレクションの名前。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>データに対して実行される操作の種類。</p></td>
     <td><p><code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>データ操作の結果。</p></td>
     <td><p><code>success</code>, <code>fail</code></p></td>
   </tr>
</table>

## 利用可能なメトリック{#available-metrics}

以下の表は、Zilliz Cloudで利用可能なメトリクス、その種類、説明、および関連するラベルをリストしています。

<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>タイプ</p></th>
     <th><p>説明する</p></th>
     <th><p>ラベル</p></th>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_computation</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在の計算容量の利用率。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在のストレージ容量の利用率。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_storage_bytes</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>使用された総ストレージスペース。</p></td>
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
     <td><p>すべての要求で操作されたベクトルの総数。</p></td>
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
     <td><p>遅延のしきい値を超えるクエリの数。</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>格納されているエンティティの総数。</p></td>
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
     <td><p>インデックス化されたエンティティの数。</p></td>
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

## Prometheusクエリの例{#example-prometheus-queries}

以下は、Prometheusを使用してZilliz Cloudメトリックスを分析するために使用できるクエリの例です。

- インサートQPSを計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- インサートVPSを計算する

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- 70パーセンタイルの挿入レイテンシを計算する

    ```plaintext
    histogram_quantile(
        0.70, 
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
        ) by (le) 
    )
    ```

- 挿入要求の失敗率を計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[$__rate_interval])
    /
    rate(zilliz_requests_total{cluster_id=?}[$__rate_interval])
    ```

- 1分あたりの遅いクエリ数を計算する

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- 5分あたりの遅いクエリの数を計算してください

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```

    