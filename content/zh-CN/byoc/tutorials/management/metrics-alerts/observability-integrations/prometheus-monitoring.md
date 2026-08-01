---
title: "Prometheus 监控 | BYOC"
slug: /prometheus-monitoring
sidebar_label: "Prometheus 监控"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Prometheus 监控系统能够在指定的时间间隔内从配置的目标收集指标，评估规则表达式，展示结果，并根据特定条件触发告警。 | BYOC"
type: origin
token: LVC1wq5Qginkeskq2G0c0Z8WnPc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Prometheus 监控

[Prometheus](https://prometheus.io/) 监控系统能够在指定的时间间隔内从配置的目标收集指标，评估规则表达式，展示结果，并根据特定条件触发告警。

通过将 Zilliz Cloud 与 Prometheus 集成，您可以收集并监控与 Zilliz Cloud 集群相关的指标。

Prometheus 集成仅导出 Serving 集群指标，不导出按需计算 Database 指标。

## 配置 Prometheus 监控\{#configure-prometheus-monitoring}

要配置 Prometheus 以采集 Zilliz Cloud 集群指标，请按照以下步骤操作：

<Procedures>

1. 获取 Prometheus 实例的 `Prometheus.yml` 配置文件。有关更多信息，请参阅 [Prometheus 官方文档](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration)。

1. 将以下代码片段添加到 `Prometheus.yml` 文件的 `scrape_configs` 部分。请将以下占位符替换为实际值：

    - `{{apiKey}}`：您用于访问集群指标的 Zilliz Cloud API 密钥。

    - `{{clusterId}}`：您希望监控的 Zilliz Cloud 集群的 ID。

    <Admonition type="info" icon="📘" title="说明">

    集群中的 Collection 数量不得超过 10,000 个。超过此限制的集群可能出现指标导出不完整或性能下降的情况。

    </Admonition>

    | 参数 | 描述 |
    | --- | --- |
    | `job_name` | 指标抓取任务的名称，用于识别任务。 |
    | `scheme` | 指标时使用的协议方案，设置为 `https`。Prometheus 会通过 HTTPS 安全地抓取目标服务的数据。 |
    | `metrics_path` | 目标服务上用于提供指标数据的路径。 |
    | `scrape_interval` | 抓取目标的频率。最小支持值为 60s，暂不支持低于 60s 的值。 |
    | `authorization.type` | 身份验证类型，设置为 `Bearer`。 |
    | `authorization.credentials` | 用于授权访问 Zilliz Cloud 集群的 API 密钥。 |
    | `static_configs.targets` | Prometheus 将要抓取的静态目标， 即Zilliz Cloud 根据您的请求配置的主机地址。更多详情，请联系 [Zilliz 技术支持](https://support.zilliz.com.cn/hc/zh-cn)。。 |

1. 保存并应用 `Prometheus.yml` 文件。

</Procedures>

有关更多信息，请参阅 [Prometheus 官方文档](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)。

## 指标示例\{#example-prometheus-query-results}

以下示例展示了从 Zilliz Cloud 的 /metrics/export 端点抓取的 Prometheus 指标。其中，按 Collection 维度统计的指标会包含 `collection_name` 和 `db_name` 这两个标签，而仅按集群维度统计的指标保持不变。

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

## Zilliz Cloud 指标标签\{#zilliz-cloud-metric-labels}

Zilliz Cloud 暴露的指标带有以下标识符标签：

| 标签名称 | 描述 | 示例值 |
| --- | --- | --- |
| `cluster_id` | 指标来源的 Zilliz Cloud 集群 ID。 | - |
| `org_id` | 拥有该 Zilliz Cloud 集群的组织 ID。 | - |
| `project_id` | 该集群所属组织内项目的 ID。 | - |
| `collection_name` | Collection 的名称。出现在所有 Collection 级别的指标中，包括请求类指标（`zilliz_requests_total`、`zilliz_request_vectors_total`、`zilliz_request_duration_seconds_bucket`）和数据类指标（`zilliz_entities`、`zilliz_loaded_entities`）。 | - |
| `db_name` | Collection 所属的 Database 名称。该标签会与 `collection_name` 一起出现在所有 Collection 级别的指标上。您可以用它来区分不同 Database 中同名的 Collection。 | 默认值为 `default`。 |
| `request_type` | 对数据执行的操作类型。 | `insert`, `upsert`, `delete`, `bulk_insert`, `flush`, `search`, `query` |
| `status` | 数据操作的结果。 | `success`, `fail` |

## 可用指标\{#available-metrics}

下表列出了 Zilliz Cloud 可用的指标，包括指标类型、描述和相关标签。

| 指标名称 | 类型 | 描述 | 标签 |
| --- | --- | --- | --- |
| `zilliz_cluster_computation` | Gauge | 当前 CU 容量利用率 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_capacity` | Gauge | 当前存储容量利用率 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_storage_bytes` | Gauge | 使用的总存储空间 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_write_capacity` | Gauge | 当前写入吞吐量 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_requests_total` | Counter | 处理的总请求数 | `cluster_id`, `org_id`, `project_id`, `request_type`, `status`, `collection_name`, `db_name` |
| `zilliz_request_vectors_total` | Counter | 所有请求中操作的向量总数 | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_request_duration_seconds_bucket` | Histogram | 处理请求的延时分布 | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_slow_queries_total` | Counter | 超过延时阈值的查询数 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_entities` | Gauge | 存储的 entity 总数 | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_loaded_entities` | Gauge | 当前加载到内存中的 entity 数 | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_collections` | Gauge | Collection 总数 | `cluster_id`, `org_id`, `project_id` |
| `zilliz_unloaded_collections` | Gauge | 未加载的 collection 数 | `cluster_id`, `org_id`, `project_id` |

## 示例查询\{#example-prometheus-queries}

以下是一些示例查询，您可以使用 Prometheus 分析 Zilliz Cloud 指标。

- 计算插入 QPS

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[1m])
    ```

- 计算插入 VPS

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[1m])
    ```

- 计算 P70 插入操作的延时

    ```plaintext
    histogram_quantile(
        0.70, 
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='?',request_type='insert'}[1m])
        ) by (le) 
    )
    ```

- 计算插入请求失败率

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[1m])
    /
    rate(zilliz_requests_total{cluster_id=?}[1m])
    ```

- 计算每分钟的慢查询数

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- 计算每五分钟的慢查询数

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```

