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

    <p>The cluster must contain no more than 10,000 collections. Clusters exceeding this limit may experience incomplete or degraded metrics export.</p>

    </Admonition>

    <table>
       <tr>
         <th><p>Parameter</p></th>
         <th><p>Description</p></th>
       </tr>
       <tr>
         <td><p><code>job_name</code></p></td>
         <td><p>Human-readable label assigned to scraped metrics.</p></td>
       </tr>
       <tr>
         <td><p><code>scheme</code></p></td>
         <td><p>The protocol scheme used to scrape metrics from the Zilliz Cloud endpoints, which is set to <code>https</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>metrics_path</code></p></td>
         <td><p>The path on the target service that provides the metric data.</p></td>
       </tr>
       <tr>
         <td><p><code>scrape_interval</code></p></td>
         <td><p>How frequently to scrape the target. The minimum supported value is <code>60s</code>. Lower values are not accepted by the endpoint.</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.type</code></p></td>
         <td><p>The authentication type used to access the Zilliz Cloud metrics. Set the value to <code>Bearer</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>The API key used for authorization to access the Zilliz Cloud metrics endpoints.</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>The static target that Prometheus will scrape, which should be configured by Zilliz Cloud for you upon requests. For details, please contact <a href="https://support.zilliz.com/hc/en-us">Zilliz Technical Support</a>..</p></td>
       </tr>
    </table>

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

<table>
   <tr>
     <th><p>Label Name</p></th>
     <th><p>Description</p></th>
     <th><p>Values</p></th>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>The ID of the Zilliz Cloud cluster that the metrics are from.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>The ID of the organization that owns the Zilliz Cloud cluster.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>The ID of the project within the organization that the cluster belongs to.</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>collection_name</code></p></td>
     <td><p>The name of the collection. Present on all per-collection metrics, including request metrics (<code>zilliz_requests_total</code>, <code>zilliz_request_vectors_total</code>, <code>zilliz_request_duration_seconds_bucket</code>) and data metrics (<code>zilliz_entities</code>, <code>zilliz_loaded_entities</code>).</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p><code>db_name</code></p></td>
     <td><p>The name of the database the collection belongs to. Present on all per-collection metrics alongside <code>collection_name</code>. Use this label to disambiguate collections with the same name across different databases.</p></td>
     <td><p>Defaults to <code>default</code></p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>The type of operation performed on the data.</p></td>
     <td><p><code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>The outcome of the data operation.</p></td>
     <td><p><code>success</code>, <code>fail</code></p></td>
   </tr>
</table>

## Available metrics\{#available-metrics}

The following table lists the metrics available for Zilliz Cloud, along with their types, descriptions, and associated labels. Per-collection metrics are returned with `collection_name` and `db_name` labels, producing separate time series for each collection. Cluster-only metrics are returned as a single series per cluster.

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>Type</p></th>
     <th><p>Description</p></th>
     <th><p>Labels</p></th>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_computation</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The current computation capacity utilization.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The current storage capacity utilization.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_storage_bytes</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The total storage space used.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_cluster_write_capacity</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The current write throughput.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_requests_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>The total number of requests processed.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>status</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_vectors_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>The total number of vectors manipulated across all requests.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_duration_seconds_bucket</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>The latency distribution of requests processed.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_slow_queries_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>The number of queries exceeding the latency threshold.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The total number of entities stored.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_loaded_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of entities currently loaded in memory.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code>, <code>db_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The total number of collections.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_unloaded_collections</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of unloaded collections.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code></p></td>
   </tr>
</table>

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

    