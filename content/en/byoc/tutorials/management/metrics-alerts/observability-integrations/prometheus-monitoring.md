---
title: "Integrate with Prometheus | BYOC"
slug: /prometheus-monitoring
sidebar_label: "Prometheus"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Prometheus is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions. | BYOC"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Integrate with Prometheus

[Prometheus](https://prometheus.io/) is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions.

By integrating Zilliz Cloud with Prometheus, you can collect and monitor metrics related to your Zilliz Cloud deployment.

Prometheus integration exports Serving Cluster metrics only. It does not export On-Demand Compute database metrics.

## Configure Prometheus to scrape Zilliz Cloud metrics\{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

To monitor Zilliz Cloud clusters with Prometheus, follow these steps:

<Procedures>

1. Access the `Prometheus.yml` configuration file on your Prometheus server. For more information, refer to [Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration).

1. Add the following snippet to the `scrape_configs` section of the `Prometheus.yml` file. Replace the placeholders with the appropriate values:

    - `{{apiKey}}`: Your Zilliz Cloud API key for accessing cluster metrics.

    - `{{clusterId}}`: The ID of the Zilliz Cloud cluster you wish to monitor.

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

    The cluster must contain no more than 10,000 collections. Clusters exceeding this limit may experience incomplete or degraded metrics export.

    </Admonition>

    | Parameter | Description |
    | --- | --- |
    | `job_name` | Human-readable label assigned to scraped metrics. |
    | `scheme` | The protocol scheme used to scrape metrics from the Zilliz Cloud endpoints, which is set to `https`. |
    | `metrics_path` | The path on the target service that provides the metric data. |
    | `scrape_interval` | How frequently to scrape the target. The minimum supported value is `60s`. Lower values are not accepted by the endpoint. |
    | `authorization.type` | The authentication type used to access the Zilliz Cloud metrics. Set the value to `Bearer`. |
    | `authorization.credentials` | The API key used for authorization to access the Zilliz Cloud metrics endpoints. |
    | `static_configs.targets` | The static target that Prometheus will scrape, which should be configured by Zilliz Cloud for you upon requests. For details, please contact [Zilliz Technical Support](https://support.zilliz.com/hc/en-us).. |

1. Save the changes to the `Prometheus.yml` file.

</Procedures>

For more details, refer to [Prometheus official documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config).

## Example scraped metrics\{#example-scraped-metrics}

The following are example Prometheus metrics scraped from the Zilliz Cloud `/metrics/export` endpoint. Per-collection metrics include `collection_name` and `db_name` labels, while cluster-only metrics remain unchanged.

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

## Zilliz Cloud metric labels\{#zilliz-cloud-metric-labels}

The metrics exposed by Zilliz Cloud are labeled with the following identifiers.

| Label Name | Description | Values |
| --- | --- | --- |
| `cluster_id` | The ID of the Zilliz Cloud cluster that the metrics are from. | - |
| `org_id` | The ID of the organization that owns the Zilliz Cloud cluster. | - |
| `project_id` | The ID of the project within the organization that the cluster belongs to. | - |
| `collection_name` | The name of the collection. Present on all per-collection metrics, including request metrics (`zilliz_requests_total`, `zilliz_request_vectors_total`, `zilliz_request_duration_seconds_bucket`) and data metrics (`zilliz_entities`, `zilliz_loaded_entities`). | - |
| `db_name` | The name of the database the collection belongs to. Present on all per-collection metrics alongside `collection_name`. Use this label to disambiguate collections with the same name across different databases. | Defaults to `default` |
| `request_type` | The type of operation performed on the data. | `insert`, `upsert`, `delete`, `bulk_insert`, `flush`, `search`, `query` |
| `status` | The outcome of the data operation. | `success`, `fail` |

## Available metrics\{#available-metrics}

The following table lists the metrics available for Zilliz Cloud, along with their types, descriptions, and associated labels. Per-collection metrics are returned with `collection_name` and `db_name` labels, producing separate time series for each collection. Cluster-only metrics are returned as a single series per cluster.

| Metric Name | Type | Description | Labels |
| --- | --- | --- | --- |
| `zilliz_cluster_computation` | Gauge | The current computation capacity utilization. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_capacity` | Gauge | The current storage capacity utilization. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_storage_bytes` | Gauge | The total storage space used. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_cluster_write_capacity` | Gauge | The current write throughput. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_requests_total` | Counter | The total number of requests processed. | `cluster_id`, `org_id`, `project_id`, `request_type`, `status`, `collection_name`, `db_name` |
| `zilliz_request_vectors_total` | Counter | The total number of vectors manipulated across all requests. | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_request_duration_seconds_bucket` | Histogram | The latency distribution of requests processed. | `cluster_id`, `org_id`, `project_id`, `request_type`, `collection_name`, `db_name` |
| `zilliz_slow_queries_total` | Counter | The number of queries exceeding the latency threshold. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_entities` | Gauge | The total number of entities stored. | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_loaded_entities` | Gauge | The number of entities currently loaded in memory. | `cluster_id`, `org_id`, `project_id`, `collection_name`, `db_name` |
| `zilliz_collections` | Gauge | The total number of collections. | `cluster_id`, `org_id`, `project_id` |
| `zilliz_unloaded_collections` | Gauge | The number of unloaded collections. | `cluster_id`, `org_id`, `project_id` |

## Example Prometheus queries\{#example-prometheus-queries}

Here are some example queries you can use to analyze Zilliz Cloud metrics with Prometheus.

- Calculate insert QPS

    ```plaintext
    rate(zilliz_requests_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- Calculate insert VPS

    ```plaintext
    rate(zilliz_request_vectors_total{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
    ```

- Calculate 70th percentile insert latency

    ```plaintext
    histogram_quantile(
        0.70, 
        sum(
            rate(zilliz_request_duration_seconds_bucket{cluster_id='in01-xxxxx',request_type='insert'}[$__rate_interval])
        ) by (le) 
    )
    ```

- Calculate insert request fail rate

    ```plaintext
    rate(zilliz_requests_total{cluster_id=?,status!='success'}[$__rate_interval])
    /
    rate(zilliz_requests_total{cluster_id=?}[$__rate_interval])
    ```

- Calculate the number of slow queries per 1 minute

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[1m]))
    ```

- Calculate the number of slow queries per 5 minutes

    ```plaintext
    sum(increase(zilliz_slow_queries_total{cluster_id=?}[5m]))
    ```

    