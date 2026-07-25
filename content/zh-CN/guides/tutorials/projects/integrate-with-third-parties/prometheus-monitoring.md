---
title: "Prometheus 监控 | Cloud"
slug: /prometheus-monitoring
sidebar_key: prometheus-monitoring
sidebar_label: "Prometheus"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Prometheus 监控系统能够在指定的时间间隔内从配置的目标收集指标，评估规则表达式，展示结果，并根据特定条件触发告警。 | Cloud"
type: origin
token: LVC1wq5Qginkeskq2G0c0Z8WnPc
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 告警
  - prometheus

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Prometheus 监控

[Prometheus](https://prometheus.io/) 监控系统能够在指定的时间间隔内从配置的目标收集指标，评估规则表达式，展示结果，并根据特定条件触发告警。

通过将 Zilliz Cloud 与 Prometheus 集成，您可以收集并监控与 Zilliz Cloud 集群相关的指标。

https://zilliverse.feishu.cn/sync/EaQKd6kURsSBc1bD8Loc4RsjnCg

## 配置 Prometheus 监控\{#configure-prometheus-monitoring}

要配置 Prometheus 以采集 Zilliz Cloud 集群指标，请按照以下步骤操作：

<Procedures>

1. 获取 Prometheus 实例的 `Prometheus.yml` 配置文件。有关更多信息，请参阅 [Prometheus 官方文档](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration)。

1. 将以下代码片段添加到 `Prometheus.yml` 文件的 `scrape_configs` 部分。请将以下占位符替换为实际值：

    - `{{apiKey}}`：您用于访问集群指标的 Zilliz Cloud API 密钥。

    - `{{clusterId}}`：您希望监控的 Zilliz Cloud 集群的 ID。

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
          - targets: ["api.cloud.zilliz.com.cn"]
    ```

    ```yaml
    scrape_configs:
      - job_name: "inxx-xxxxxxxxxxxxxxx"
        scheme: https
        metrics_path: /v2/clusters/{{clusterId}}/metrics/export
        authorization:
          type: Bearer
          credentials: {{apiKey}}
    
        static_configs:
          - targets: ["YOUR_PROMETHEUS_TARGET"]
    ```

    <Admonition type="info" icon="📘" title="说明">

    集群中的 Collection 数量不得超过 10,000 个。超过此限制的集群可能出现指标导出不完整或性能下降的情况。

    </Admonition>

    <table>
       <tr>
         <th><p>参数</p></th>
         <th><p>描述</p></th>
       </tr>
       <tr>
         <td><p><code>job_name</code></p></td>
         <td><p>指标抓取任务的名称，用于识别任务。</p></td>
       </tr>
       <tr>
         <td><p><code>scheme</code></p></td>
         <td><p>指标时使用的协议方案，设置为 <code>https</code>。Prometheus 会通过 HTTPS 安全地抓取目标服务的数据。</p></td>
       </tr>
       <tr>
         <td><p><code>metrics_path</code></p></td>
         <td><p>目标服务上用于提供指标数据的路径。</p></td>
       </tr>
       <tr>
         <td><p><code>scrape_interval</code></p></td>
         <td><p>抓取目标的频率。最小支持值为 60s，暂不支持低于 60s 的值。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.type</code></p></td>
         <td><p>身份验证类型，设置为 <code>Bearer</code>。</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>用于授权访问 Zilliz Cloud 集群的 API 密钥。</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>Prometheus 将要抓取的静态目标， 即 Zilliz Cloud RESTful API 的主机地址。设置为 <code>api.cloud.zilliz.com.cn</code>。</p></td>
       </tr>
    </table>

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

<table>
   <tr>
     <th><p>标签名称</p></th>
     <th><p>描述</p></th>
     <th><p>示例值</p></th>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>指标来源的 Zilliz Cloud 集群 ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>拥有该 Zilliz Cloud 集群的组织 ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>该集群所属组织内项目的 ID。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>collection_name</code></p></td>
     <td><p>Collection 的名称。出现在所有 Collection 级别的指标中，包括请求类指标（<code>zilliz_requests_total</code>、<code>zilliz_request_vectors_total</code>、<code>zilliz_request_duration_seconds_bucket</code>）和数据类指标（<code>zilliz_entities</code>、<code>zilliz_loaded_entities</code>）。</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>db_name</code></p></td>
     <td><p>Collection 所属的 Database 名称。该标签会与 <code>collection_name</code> 一起出现在所有 Collection 级别的指标上。您可以用它来区分不同 Database 中同名的 Collection。</p></td>
     <td><p>默认值为 <code>default</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>对数据执行的操作类型。</p></td>
     <td><p><code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>数据操作的结果。</p></td>
     <td><p><code>success</code>, <code>fail</code></p></td>
   </tr>
</table>

## 可用指标\{#available-metrics}

下表列出了 Zilliz Cloud 可用的指标，包括指标类型、描述和相关标签。

<table>
   <tr>
     <th><p>指标名称</p></th>
     <th><p>类型</p></th>
     <th><p>描述</p></th>
     <th><p>标签</p></th>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_computation</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>当前 CU 容量利用率</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>当前存储容量利用率</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_storage_bytes</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>使用的总存储空间</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_write_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>当前写入吞吐量</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_requests_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>处理的总请求数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>status</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_vectors_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>所有请求中操作的向量总数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_duration_seconds_bucket</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>处理请求的延时分布</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_slow_queries_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>超过延时阈值的查询数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>存储的 entity 总数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_loaded_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>当前加载到内存中的 entity 数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>Collection 总数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_unloaded_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>未加载的 collection 数</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
</table>

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

