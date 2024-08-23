---
title: "Prometheus | Cloud"
slug: /prometheus
sidebar_label: "Prometheus"
beta: FALSE
notebook: FALSE
description: "Prometheus is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions. | Cloud"
type: origin
token: Ex99woZlsico4FkfwxGckjRRnqf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - prometheus

---

import Admonition from '@theme/Admonition';


# Prometheus

[Prometheus](https://prometheus.io/) is a monitoring system that collects metrics from configured targets at specified intervals, evaluates rule expressions, displays the results, and can trigger alerts based on specific conditions.

By integrating Zilliz Cloud with Prometheus, you can collect and monitor metrics related to your Zilliz Cloud deployment.

## Prerequisites{#prerequisites}

Before proceeding with the integration, ensure the following requirements are met:

- [Prometheus](https://prometheus.io/) integration is supported only for clusters running the **Dedicated-Enterprise** or **BYOC** plan. For more information, refer to [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

- You must have a working Prometheus instance. If you do not have one, follow the [Prometheus Installation Guide](https://prometheus.io/docs/prometheus/latest/installation/) to set it up.

- (Optional) For visualizing your Prometheus metrics, consider setting up [Grafana](https://prometheus.io/docs/visualization/grafana/).

## Configure Prometheus to scrape Zilliz Cloud metrics{#configure-prometheus-to-scrape-zilliz-cloud-metrics}

To monitor Zilliz Cloud clusters with Prometheus, follow these steps:

1. Access the `Prometheus.yml` configuration file on your Prometheus server. For more information, refer to [Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration).

1. Add the following snippet to the `scrape_configs` section of the `Prometheus.yml` file. Replace the placeholders with the appropriate values:

    - `{{apiKey}}`: Your API key for accessing Zilliz Cloud metrics.

    - `{{clusterId}}`: The ID of the Zilliz Cloud cluster you wish to monitor.

    ```yaml
    scrape_configs:
      - job_name: zilliz-cloud
        authorization:
          credentials: {{apiKey}}
        scrape_interval: 1m
        scheme: https
        static_configs:
          - targets:
              - api.cloud.zilliz.com/v2/clusters/{{cluster1Id}}/metrics/export
              - api.cloud.zilliz.com/v2/clusters/{{cluster2Id}}/metrics/export
              - ...
              - api.cloud.zilliz.com/v2/clusters/{{clusterNId}}/metrics/export
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
         <td><p><code>authorization.credentials</code></p></td>
         <td><p>The API key used for authorization to access the Zilliz Cloud metrics endpoints.</p></td>
       </tr>
       <tr>
         <td><p><code>scrape_interval</code></p></td>
         <td><p>The interval at which Prometheus will scrape metrics from the Zilliz Cloud clusters.</p></td>
       </tr>
       <tr>
         <td><p><code>scheme</code></p></td>
         <td><p>The protocol scheme used to scrape metrics from the Zilliz Cloud endpoints, which is set to HTTPS.</p></td>
       </tr>
       <tr>
         <td><p><code>static_configs.targets</code></p></td>
         <td><p>The list of static targets that Prometheus will scrape, each of which should be the <code>/v2/clusters/\{clusterId}/metrics/export</code> RESTful API endpoint for each Zilliz Cloud cluster.</p></td>
       </tr>
    </table>

1. Save the changes to the `Prometheus.yml` file.

For more details, refer to [Prometheus official documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config).

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
     <th><p>Name</p></th>
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
     <td><p><code>zilliz_write_capacity</code></p></td>
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
     <td><p><code>zilliz_request_duration_seconds</code></p></td>
     <td><p>Histogram</p></td>
     <td><p>The latency distribution of requests processed.</p></td>
     <td><p><code>cluster_id</code>, <code>org_id</code>, <code>project_id</code>, <code>request_type</code>, <code>status</code></p></td>
   </tr>
   <tr>
     <td><p><code>zilliz_slow_queries</code></p></td>
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

    