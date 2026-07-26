---
title: "Integrate with Datadog | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Datadog is a cloud monitoring and analytics platform that provides real-time insights into application performance, infrastructure, and log management. By integrating Zilliz Cloud with Datadog, you can send metric data about your Zilliz Cloud clusters to your Datadog dashboards. | Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Integrate with Datadog

[Datadog](https://www.datadoghq.com/) is a cloud monitoring and analytics platform that provides real-time insights into application performance, infrastructure, and log management. By integrating Zilliz Cloud with Datadog, you can send metric data about your Zilliz Cloud clusters to your Datadog dashboards.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in an **Enterprise** project.

</Admonition>

## Before you start\{#before-you-start}

- To integrate with Datadog, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You must have a Datadog account and a Datadog API key. For information on how to access your API key, refer to [API and Application Keys](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys).

## Procedure\{#procedure}

![integrate-with-datadog-1](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-datadog-1.png "integrate-with-datadog-1")

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane of the project page, click **Integrations**.

1. Locate the **Datadog** section and click **+ Configuration** next to it.

1. In the dialog box that appears, link Datadog to your project and assign clusters to collect metric data.

    1. In the **Configure Datadog Integration** step, configure Datadog settings.

        1. In **Configuration Name**, Enter a name for the integration (e.g., `DG_configuration`).

        1. In **Datadog API Key**, enter your Datadog API key.

        1. In **Datadog Site**, select your Datadog site. Zilliz Cloud supports the following Datadog sites:

            | Site | Site URL | Site Parameter | Location |
            | --- | --- | --- | --- |
            | `US1` | `https://app.datadoghq.com` | `datadoghq.com` | US |
            | `US3` | `https://us3.datadoghq.com` | `us3.datadoghq.com` | US |
            | `US5` | `https://us5.datadoghq.com` | `us5.datadoghq.com` | US |
            | `EU1` | `https://app.datadoghq.eu` | `datadoghq.eu` | EU (Germany) |
            | `AP1` | `https://ap1.datadoghq.com` | `ap1.datadoghq.com` | Japan |

            For details on Datadog sites, refer to [Access Datadog Sites](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site). 

        1. Click **Test Integration** to verify the connection between Zilliz Cloud and Datadog. If the test is successful, proceed to assign clusters.

    1. In the **Assign Configuration to Zilliz Cloud Cluster(s)** step, select one or more clusters from which metric data will be pushed to Datadog.

        <Admonition type="info" icon="📘" title="Notes">

        Only clusters of the **Dedicated-Enterprise** plan tier can be selected.

        </Admonition>

    1. Click **Create**.

</Procedures>

## Monitor integration progress\{#monitor-integration-progress}

After setup, return to the **Integrations** page and verify that your Datadog integration is listed with the provided configuration details. If the status changes to **Active**, the integration is successful. Zilliz Cloud pushes data to Datadog at a minute-level frequency, ensuring near real-time updates.

By clicking the external link icon next to the integration, you can open the associated Datadog dashboard to view cluster metrics that are pushed from the selected Zilliz Cloud clusters.

![integrate-with-datadog-2](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-datadog-2.png "integrate-with-datadog-2")

## Manage integrations\{#manage-integrations}

To manage your Datadog integration, use the **Actions** column:

- **Edit**: Update the monitoring cluster or modify integration settings as needed.

- **Remove**: Delete the integration if it is no longer required.

![integrate-with-datadog-3](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-datadog-3.png "integrate-with-datadog-3")

## Performance metrics available to Datadog\{#performance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/) tracks the following metric data for your Zilliz Cloud cluster. The metric names in parentheses are the names used in the Datadog UI.

### Resource\{#resource}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| CU Computation<br/>(`zilliz.cluster.cu.computation.current`) | Gauge | A measure of the used capacity relative to the total capacity of the CU. Range from 0 to 1. |
| CU Capacity<br/>(`zilliz.cluster.cu.capacity.current`) | Gauge | A measure of the utilized computational power relative to the total computational capacity of the CU. Range from 0 to 1. |
| Storage<br/>(`zilliz.cluster.storage.bytes.current`) | Gauge | The total amount of persistent storage consumed by data and indexes. |

### Performance\{#performance}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| Cluster Write Performance Capacity<br/>(`zilliz.cluster.write.performance.capacity.current`) | Gauge | A measure of the current rate of write operation relative to the write rate limit. Range from 0 to 1. |
| Slow Query Count<br/>(`zilliz.request.slow.queries.total`) | Count | The total number of slow query requests. |
| QPS, Request Failure Rate, Number of Flush Operations<br/>(`zilliz.requests.total`) | Count | The total number of requests processed. |
| VPS<br/>(`zilliz.request.vectors.total`) | Count | The total number of vectors manipulated across all requests. |
| Latency<br/>(`zilliz.request.latency.milliseconds.average`, `zilliz.request.latency.milliseconds.p99`) | Gauge | The average/P99 latency of requests processed. |

### Data\{#data}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| Entity Count<br/>(`zilliz.entities.current`) | Gauge | The number of entities. |
| Loaded Entities<br/>(`zilliz.loaded.entities.current`) | Gauge | The number of loaded entities. |
| Collection Count<br/>(`zilliz.collections.current`) | Gauge | The number of collections. |
| Number of Unloaded Collections<br/>(`zilliz.unloaded.collections.current`) | Gauge | The number of unloaded collections. |

## Tags available to Datadog\{#tags-available-to-datadog}

Datadog sends the following tags on certain metrics to help you better understand, organize, and identify resources.

| Tag Name | Description |
| --- | --- |
| `org_id` | The ID of the Zilliz Cloud organization associated with the metric. |
| `project_id` | The ID of the Zilliz Cloud project associated with the metric. |
| `cluster_id` | The ID of the Zilliz Cloud cluster associated with the metric. |
| `request_type` | The type of operation that is  being monitored. Possible values: `insert`, `upsert`, `delete`, `bulk_insert`, `flush`, `search`, `query` |
| `status` | The outcome of the operation. Possible values: `success`, `fail` |
