---
title: "Integrate with Prometheus | Cloud"
slug: /prometheus-monitoring
sidebar_label: "Prometheus"
beta: FALSE
notebook: FALSE
description: "Prometheus is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions. | Cloud"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - prometheus
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# Integrate with Prometheus

[Prometheus](https://prometheus.io/) is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions.

By integrating Zilliz Cloud with Prometheus, you can collect and monitor metrics related to your Zilliz Cloud deployment.

<Admonition type="info" icon="📘" title="Notes">

<p><a href="https://prometheus.io/">Prometheus</a> integration is supported only for Zilliz Cloud clusters running the <strong>Dedicated-Enterprise</strong> or <strong>BYOC</strong> plan.</p>

</Admonition>

## Configure Prometheus to scrape Zilliz Cloud metrics{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

To monitor Zilliz Cloud clusters with Prometheus, follow these steps:

1. Access the `Prometheus.yml` configuration file on your Prometheus server. For more information, refer to [Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration).

1. Add the following snippet to the `scrape_configs` section of the `Prometheus.yml` file. Replace the placeholders with the appropriate values:

    - `{{apiKey}}`: Your Zilliz Cloud API key for accessing cluster metrics.

    - `{{clusterId}}`: The ID of the Zilliz Cloud cluster you wish to monitor.

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
         <td><p><code>authorization.type</code></p></td>
         <td><p>The authentication type used to access the Zilliz Cloud metrics. Set the value to <code>Bearer</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>The API key used for authorization to access the Zilliz Cloud metrics endpoints.</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>The static target that Prometheus will scrape, which should be <code>api.cloud.zilliz.com</code>, the host address of the Zilliz Cloud RESTful API.</p></td>
       </tr>
    </table>

1. Save the changes to the `Prometheus.yml` file.

For more details, refer to [Prometheus official documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config).

## Example scraped metrics{#example-scraped-metrics}

The following are example Prometheus metrics scraped from the Zilliz Cloud `/metrics/export` endpoint:

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

## Zilliz Cloud metric labels{#zilliz-cloud-metric-labels}

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
     <td><p>The name of the collection being monitored.</p></td>
     <td><p>-</p></td>
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

## Available metrics{#available-metrics}

The following table lists the metrics available for Zilliz Cloud, along with their types, descriptions, and associated labels.

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
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>status</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_vectors_total</code></p></td>
     <td><p>Counter</p></td>
     <td><p>The total number of vectors manipulated across all requests.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_request_duration_seconds_bucket</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>The latency distribution of requests processed.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code></p></td>
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
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_loaded_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of entities currently loaded in memory.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_indexed_entities</code></p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of entities that have been indexed.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>collection_name</code></p></td>
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

## Example Prometheus queries{#example-prometheus-queries}

Here are some example queries you can use to analyze Zilliz Cloud metrics with Prometheus:

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

    