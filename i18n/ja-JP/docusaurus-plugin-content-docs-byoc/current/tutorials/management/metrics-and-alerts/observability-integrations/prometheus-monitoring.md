---
title: "Prometheus と統合する | BYOC"
slug: /prometheus-monitoring
sidebar_label: "Prometheus"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Prometheus は、設定されたターゲットから指定された間隔でメトリクスを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。 | BYOC"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Prometheus と統合する

[Prometheus](https://prometheus.io/) は、設定されたターゲットから指定された間隔でメトリクスを収集し、ルール式を評価し、結果を表示し、特定の条件に基づいてアラートをトリガーできる監視システムです。

Zilliz Cloud を Prometheus と統合することで、Zilliz Cloud デプロイメントに関連するメトリクスを収集および監視できます。

Prometheus 統合では Serving Cluster メトリクスのみをエクスポートします。On-Demand Compute データベースのメトリクスはエクスポートしません。

## Prometheus が Zilliz Cloud メトリクスをスクレイプするよう設定する\{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

Prometheus で Zilliz Cloud クラスターを監視するには、以下の手順に従ってください。

<Procedures>

1. Prometheus サーバー上の `Prometheus.yml` 設定ファイルにアクセスします。詳細については、[Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration) を参照してください。

1. `Prometheus.yml` ファイルの `scrape_configs` セクションに、以下のスニペットを追加します。プレースホルダーは適切な値に置き換えてください。

    - `{{apiKey}}`: クラスターメトリクスにアクセスするための Zilliz Cloud API キー。

    - `{{clusterId}}`: 監視したい Zilliz Cloud クラスターの ID。

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

    <Admonition type="info" icon="📘" title="注意">

    クラスターに含まれるコレクションは 10,000 件以下である必要があります。この上限を超えるクラスターでは、メトリクスのエクスポートが不完全になったり、品質が低下したりする場合があります。

    </Admonition>

    | Parameter | Description |
    | --- | --- |
    | `job_name` | スクレイプされたメトリクスに割り当てる、人間が読みやすいラベルです。 |
    | `scheme` | Zilliz Cloud エンドポイントからメトリクスをスクレイプする際に使用するプロトコルスキームで、`https` に設定されます。 |
    | `metrics_path` | メトリクスデータを提供するターゲットサービス上のパスです。 |
    | `scrape_interval` | ターゲットをスクレイプする頻度です。サポートされる最小値は `60s` です。これより小さい値はエンドポイントで受け付けられません。 |
    | `authorization.type` | Zilliz Cloud メトリクスにアクセスするために使用する認証タイプです。値を `Bearer` に設定してください。 |
    | `authorization.credentials` | Zilliz Cloud メトリクスエンドポイントへのアクセス認可に使用する API キーです。 |
    | `static_configs.targets` | Prometheus がスクレイプする静的ターゲットです。これはリクエストに応じて Zilliz Cloud により設定される必要があります。詳細については、[Zilliz Technical Support](https://support.zilliz.com/hc/en-us) にお問い合わせください。 |

1. `Prometheus.yml` ファイルへの変更を保存します。

</Procedures>

詳細については、[Prometheus official documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config) を参照してください。

## スクレイプされたメトリクスの例\{#example-scraped-metrics}

以下は、Zilliz Cloud の `/metrics/export` エンドポイントからスクレイプされた Prometheus メトリクスの例です。コレクションごとのメトリクスには `collection_name` と `db_name` ラベルが含まれ、クラスターのみのメトリクスは変更されません。

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

## Zilliz Cloud のメトリクスラベル\{#zilliz-cloud-metric-labels}

Zilliz Cloud によって公開されるメトリクスには、以下の識別子ラベルが付与されます。

| Label Name | Description | Values |
| --- | --- | --- |
| `cluster_id` | メトリクスの発生元である Zilliz Cloud クラスターの ID。 | - |
| `org_id` | Zilliz Cloud クラスターを所有する組織の ID。 | - |
| `project_id` | クラスターが属する、組織内のプロジェクトの ID。 | - |
| `collection_name` | コレクションの名前です。リクエストメトリクス（`zilliz_requests_total`、`zilliz_request_vectors_total`、`zilliz_request_duration_seconds_bucket`）およびデータメトリクス（`zilliz_entities`、`zilliz_loaded_entities`）を含む、すべてのコレクションごとのメトリクスに存在します。 | - |
| `db_name` | コレクションが属するデータベースの名前です。`collection_name` とともに、すべてのコレクションごとのメトリクスに存在します。このラベルは、異なるデータベース間で同名のコレクションを区別するために使用します。 | デフォルトは `default` |
| `request_type` | データに対して実行された操作の種類。 | `insert`, `upsert`, `delete`, `bulk_insert`, `flush`, `search`, `query` |
| `status` | データ操作の結果。 | `success`, `fail` |

## 利用可能なメトリクス\{#available-metrics}

以下の表は、Zilliz Cloud で利用可能なメトリクスを、そのタイプ、説明、および関連ラベルとともに示しています。コレクションごとのメトリクスは `collection_name` と `db_name` ラベル付きで返され、各コレクションごとに個別の時系列が生成されます。クラスターのみのメトリクスは、クラスターごとに 1 つの系列として返されます。

| Metric Name | Type | Description | Labels |
| --- | --- | --- | --- |
| `zilliz_cluster_computation` | Gauge | 現在の計算容量使用率。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_capacity` | Gauge | 現在のストレージ容量使用率。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_storage_bytes` | Gauge | 使用されているストレージ容量の合計。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_write_capacity` | Gauge | 現在の書き込みスループット。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_requests_total` | Counter | 処理されたリクエストの総数。 | `cluster_id`, `org_id`, `project_id`, `request_type`, `status`, `collection_name`, `db_name` |
| `zilliz_request_vectors_total` | Counter | すべてのリクエストで処理されたベクトルの総数。 | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_request_duration_seconds_bucket` | Histogram | 処理されたリクエストのレイテンシ分布。 | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_slow_queries_total` | Counter | レイテンシしきい値を超えたクエリの数。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_entities` | Gauge | 保存されているエンティティの総数。 | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_loaded_entities` | Gauge | 現在メモリにロードされているエンティティ数。 | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_collections` | Gauge | コレクションの総数。 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_unloaded_collections` | Gauge | アンロードされているコレクションの数。 | `cluster_id`, `org_id`, `project_id` |

## Prometheus クエリの例\{#example-prometheus-queries}

以下は、Prometheus で Zilliz Cloud メトリクスを分析するために使用できるクエリ例です。

- insert QPS を計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- insert VPS を計算する

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- insert レイテンシの 70 パーセンタイルを計算する

    ```plaintext
    histogram_quantile(
        0.70, 
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
        ) by (le) 
    )
    ```

- insert リクエスト失敗率を計算する

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[$__rate_interval])
    /
    rate(zilliz_requests_total{cluster_id=?}[$__rate_interval])
    ```

- 1 分あたりの低速クエリ数を計算する

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- 5 分あたりの低速クエリ数を計算する

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```

    
