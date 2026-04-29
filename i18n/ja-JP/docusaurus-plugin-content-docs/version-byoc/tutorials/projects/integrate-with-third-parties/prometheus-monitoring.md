---
title: "Prometheus との統合 | BYOC"
slug: /prometheus-monitoring
sidebar_key: prometheus-monitoring
sidebar_label: "Prometheus"
beta: FALSE
notebook: FALSE
description: "Prometheus は、設定されたターゲットから指定された間隔でメトリクスを収集し、ルール式を評価して結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。| BYOC"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - third-party
  - services
  - prometheus

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Prometheus との統合

[Prometheus](https://prometheus.io/) は、設定されたターゲットから指定された間隔でメトリクスを収集し、ルール式を評価して結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。

Zilliz Cloud を Prometheus と統合することで、Zilliz Cloud デプロイメントに関連するメトリクスを収集および監視できます。

## Zilliz Cloud メトリクスをスクレイプするための Prometheus の設定\{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

Prometheus で Zilliz Cloud クラスターを監視するには、次の手順に従ってください。

<Procedures>

1. Prometheus サーバー上の `Prometheus.yml` 設定ファイルにアクセスします。詳細については、[設定](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration) を参照してください。

1. `Prometheus.yml` ファイルの `scrape_configs` セクションに以下のスニペットを追加します。プレースホルダーを適切な値に置き換えてください。

    - `{{apiキー}}`: クラスターメトリクスにアクセスするための Zilliz Cloud API キー。

    - `{{clusterId}}`: 監視対象の Zilliz Cloud クラスターの ID。

    ```yaml
    scrape_configs:
      - job_name: {{clusterId}}
        scheme: https
        metrics_path: /v2/clusters/{{clusterId}}/metrics/export
        scrape_interval: 60s
        scrape_timeout: 30s
        authorization:
          type: Bearer
          credentials: {{apiKey}}
        
        static_configs:
            - targets: ["YOUR-PROMETHEUS-TARGET"]
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>クラスター内のコレクション数は 10,000 以下である必要があります。この制限を超えたクラスターでは、メトリクスのエクスポートが不完全になったり、性能が低下したりする可能性があります。</p>

    </Admonition>

    <table>
       <tr>
         <th><p>パラメータ</p></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>job_name</code></p></td>
         <td><p>スクレイプされたメトリクスに割り当てられる人間が読めるラベル。</p></td>
       </tr>
       <tr>
         <td><p><code>scheme</code></p></td>
         <td><p>Zilliz Cloud エンドポイントからメトリクスをスクレイプするために使用されるプロトコルスキームで、<code>https</code> に設定されます。</p></td>
       </tr>
       <tr>
         <td><p><code>metrics_path</code></p></td>
         <td><p>メトリクスデータを提供するターゲットサービス上のパス。</p></td>
       </tr>
       <tr>
         <td><p><code>scrape_interval</code></p></td>
         <td><p>ターゲットをスクレイプする頻度。サポートされる最小値は <code>60s</code> です。これより小さい値はエンドポイントで受け付けられません。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.type</code></p></td>
         <td><p>Zilliz Cloud メトリクスへのアクセスに使用される認証タイプ。値を <code>Bearer</code> に設定します。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>Zilliz Cloud メトリクスエンドポイントへのアクセス権限付与に使用される API キー。</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>Prometheus がスクレイプする静的ターゲットであり、リクエストに応じて Zilliz Cloud によって設定されます。詳細については、<a href="https://support.zilliz.com/hc/en-us">Zilliz テクニカルサポート</a>にお問い合わせください。</p></td>
       </tr>
    </table>

1. `Prometheus.yml` ファイルへの変更内容を保存します。

</Procedures>

詳細については、[Prometheus 公式ドキュメント](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config) を参照してください。

## スクレイプされたメトリクスの例\{#example-scraped-metrics}

以下は、Zilliz Cloud の `/metrics/export` エンドポイントからスクレイプされた Prometheus メトリクスの例です。コレクションごとのメトリクスには `collection_name` および `db_name` ラベルが含まれますが、クラスター全体のメトリクスは変更されません。

```yaml
# HELP zilliz_entities Total number of entities stored
# TYPE zilliz_entities gauge
zilliz_entities{cluster_id="in01-xxx", collection_name="prod_embedding", db_name="default"} 5000000
zilliz_entities{cluster_id="in01-xxx", collection_name="user_profile", db_name="default"} 120000
# HELP zilliz_loaded_entities Number of entities loaded in memory
# TYPE zilliz_loaded_entities gauge
zilliz_loaded_entities{cluster_id="in01-xxx", collection_name="prod_embedding", db_name="default"} 3000000
zilliz_loaded_entities{cluster_id="in01-xxx", collection_name="user_profile", db_name="default"} 80000

# HELP zilliz_requests_total Total number of requests processed
# TYPE zilliz_requests_total counter
zilliz_requests_total{cluster_id="in01-xxx", request_type="search", status="success", collection_name="prod_embedding", db_name="default"} 30000
zilliz_requests_total{cluster_id="in01-xxx", request_type="search", status="success", collection_name="user_profile", db_name="default"} 12850
# HELP zilliz_request_duration_seconds_bucket Latency distribution of requests
# TYPE zilliz_request_duration_seconds_bucket histogram
zilliz_request_duration_seconds_bucket{cluster_id="in01-xxx", request_type="search", le="0.1", collection_name="prod_embedding", db_name="default"} 28000
zilliz_request_duration_seconds_bucket{cluster_id="in01-xxx", request_type="search", le="0.1", collection_name="user_profile", db_name="default"} 10000
# HELP zilliz_request_vectors_total Total number of vectors in requests
# TYPE zilliz_request_vectors_total counter
zilliz_request_vectors_total{cluster_id="in01-xxx", request_type="search", collection_name="prod_embedding", db_name="default"} 50000
zilliz_request_vectors_total{cluster_id="in01-xxx", request_type="insert", collection_name="prod_embedding", db_name="default"} 10000

# --- Cluster-only metrics ---
# HELP zilliz_cluster_capacity Cluster capacity ratio
# TYPE zilliz_cluster_capacity gauge
zilliz_cluster_capacity 0.88
# HELP zilliz_cluster_computation Cluster computation ratio
# TYPE zilliz_cluster_computation gauge
zilliz_cluster_computation 0.1
# HELP zilliz_storage_bytes Cluster storage usage
# TYPE zilliz_storage_bytes gauge
zilliz_storage_bytes 8.9342782E7
```

## Zilliz Cloud メトリクスラベル\{#zilliz-cloud-metric-labels}

Zilliz Cloud によって公開されるメトリクスには、以下の識別子がラベルとして付与されます。

<table>
   <tr>
     <th><p>ラベル名</p></th>
     <th><p>説明</p></th>
     <th><p>値</p></th>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>メトリクスの送信元である Zilliz Cloud クラスターの ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>Zilliz Cloud クラスターを所有する組織の ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>クラスターが所属する、組織内のプロジェクトの ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>collection_name</code></p></td>
     <td><p>コレクションの名前。すべてのコレクション単位のメトリクス（リクエストメトリクス（<code>zilliz_requests_total</code>、<code>zilliz_request_vectors_total</code>、<code>zilliz_request_duration_seconds_bucket</code>）およびデータメトリクス（<code>zilliz_entities</code>、<code>zilliz_loaded_entities</code>）を含む）に存在します。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>db_name</code></p></td>
     <td><p>コレクションが所属するデータベースの名前。<code>collection_name</code> とともに、すべてのコレクション単位のメトリクスに存在します。異なるデータベース間で同名のコレクションを区別するためにこのラベルを使用します。</p></td>
     <td><p>デフォルトは <code>default</code></p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>データに対して実行された操作のタイプ。</p></td>
     <td><p><code>insert</code>、<code>upsert</code>、<code>delete</code>、<code>bulk_insert</code>、<code>flush</code>、<code>search</code>、<code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>データ操作の結果。</p></td>
     <td><p><code>success</code>、<code>fail</code></p></td>
   </tr>
</table>

## 利用可能なメトリクス\{#available-metrics}

以下の表は、Zilliz Cloud で利用可能なメトリクスを、そのタイプ、説明、関連するラベルとともに一覧にしたものです。コレクション単位のメトリクスは `collection_name` および `db_name` ラベル付きで返され、各コレクションごとに個別の時系列が生成されます。クラスターのみのメトリクスは、クラスターごとに 1 つの時系列として返されます。

<table>
   <tr>
     <th><p>メトリクス名</p></th>
     <th><p>タイプ</p></th>
     <th><p>説明</p></th>
     <th><p>ラベル</p></th>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_computation</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在の計算容量の使用率。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在のストレージ容量の使用率。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_storage_bytes</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>使用されている総ストレージ容量。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_write_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在の書き込みスループット。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_requests_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>処理されたリクエストの総数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code>、<code>request_type</code>、<code>status</code>、<code>collection_name</code>、<code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_vectors_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>すべてのリクエストを通じて操作されたベクトルの総数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code>、<code>request_type</code>、<code>collection_name</code>、<code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_duration_seconds_bucket</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>処理されたリクエストのレイテンシ分布。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code>、<code>request_type</code>、<code>collection_name</code>、<code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_slow_queries_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>レイテンシ閾値を超えたクエリの数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>保存されているエンティティの総数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code>、<code>collection_name</code>、<code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_loaded_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>現在メモリ上にロードされているエンティティの数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code>、<code>collection_name</code>、<code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>コレクションの総数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_unloaded_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>ロードされていないコレクションの数。</p></td>
     <td><p><code>cluster_id</code>、<code>org_id</code>、<code>project_id</code></p></td>
   </tr>
</table>

## Prometheus クエリの例\{#example-prometheus-queries}

以下は、Prometheus を使用して Zilliz Cloud のメトリクスを分析するために使用できるクエリの例です。

- insert QPS を計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- 挿入 VPS を計算する

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- 70 パーセンタイルの挿入レイテンシを計算する

    ```plaintext
    histogram_quantile(
        0.70, 
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
        ) by (le) 
    )
    ```

- 挿入リクエストの失敗率を計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[$__rate_interval])
    /
    rate(zilliz_requests_total{cluster_id=?}[$__rate_interval])
    ```

- 1 分あたりのスロークエリ数を計算する

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- 5 分ごとのスロークエリ数を計算する

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```

    