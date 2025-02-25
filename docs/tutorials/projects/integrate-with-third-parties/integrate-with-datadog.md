---
title: "Integrate with Datadog | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
notebook: FALSE
description: "Datadog is a cloud monitoring and analytics platform that provides real-time insights into application performance, infrastructure, and log management. By integrating Zilliz Cloud with Datadog, you can send metric data about your Zilliz Cloud clusters to your Datadog dashboards. | Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - datadog
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# Integrate with Datadog

[Datadog](https://www.datadoghq.com/) is a cloud monitoring and analytics platform that provides real-time insights into application performance, infrastructure, and log management. By integrating Zilliz Cloud with Datadog, you can send metric data about your Zilliz Cloud clusters to your Datadog dashboards.

<Admonition type="info" icon="📘" title="Notes">

<p><a href="https://www.datadoghq.com/">Datadog</a> integration is available only for Zilliz Cloud clusters running the <strong>Dedicated-Enterprise</strong> plan. To upgrade your plan tier, refer to <a href="./manage-cluster">Manage Cluster</a>.</p>

</Admonition>

## Before you start{#before-you-start}

- To integrate with Datadog, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You must have a Datadog account and a Datadog API key. For information on how to access your API key, refer to [API and Application Keys](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys).

## Procedure{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane of the project page, click **Integrations**.

1. Locate the **Datadog** section and click **+ Configuration** next to it.

1. In the dialog box that appears, link Datadog to your project and assign clusters to collect metric data.

    1. In the **Configure Datadog Integration** step, configure Datadog settings.

        1. In **Configuration Name**, Enter a name for the integration (e.g., `DG_configuration`).

        1. In **Datadog API Key**, enter your Datadog API key.

        1. In **Datadog Site**, select your Datadog site. Zilliz Cloud supports the following Datadog sites:

            <table>
               <tr>
                 <th><p>Site</p></th>
                 <th><p>Site URL</p></th>
                 <th><p>Site Parameter</p></th>
                 <th><p>Location</p></th>
               </tr>
               <tr>
                 <td><p><code>US1</code></p></td>
                 <td><p><code>https://app.datadoghq.com</code></p></td>
                 <td><p><code>datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US3</code></p></td>
                 <td><p><code>https://us3.datadoghq.com</code></p></td>
                 <td><p><code>us3.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>US5</code></p></td>
                 <td><p><code>https://us5.datadoghq.com</code></p></td>
                 <td><p><code>us5.datadoghq.com</code></p></td>
                 <td><p>US</p></td>
               </tr>
               <tr>
                 <td><p><code>EU1</code></p></td>
                 <td><p><code>https://app.datadoghq.eu</code></p></td>
                 <td><p><code>datadoghq.eu</code></p></td>
                 <td><p>EU (Germany)</p></td>
               </tr>
               <tr>
                 <td><p><code>AP1</code></p></td>
                 <td><p><code>https://ap1.datadoghq.com</code></p></td>
                 <td><p><code>ap1.datadoghq.com</code></p></td>
                 <td><p>Japan</p></td>
               </tr>
            </table>

            For details on Datadog sites, refer to [Access Datadog Sites](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site). 

        1. Click **Test Integration** to verify the connection between Zilliz Cloud and Datadog. If the test is successful, proceed to assign clusters.

    1. In the **Assign Configuration to Zilliz Cloud Cluster(s)** step, select one or more clusters from which metric data will be pushed to Datadog.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Only clusters of the <strong>Dedicated-Enterprise</strong> plan tier can be selected.</p>

        </Admonition>

    1. Click **Create**.

![integrate-with-datadog-1](/img/integrate-with-datadog-1.png)

## Monitor integration progress{#monitor-integration-progress}

After setup, return to the **Integrations** page and verify that your Datadog integration is listed with the provided configuration details. If the status changes to **Active**, the integration is successful. Zilliz Cloud pushes data to Datadog at a minute-level frequency, ensuring near real-time updates.

By clicking the external link icon next to the integration, you can open the associated Datadog dashboard to view cluster metrics that are pushed from the selected Zilliz Cloud clusters.

![integrate-with-datadog-2](/img/integrate-with-datadog-2.png)

## Manage integrations{#manage-integrations}

To manage your Datadog integration, use the **Actions** column:

- **Edit**: Update the monitoring cluster or modify integration settings as needed.

- **Remove**: Delete the integration if it is no longer required.

![integrate-with-datadog-3](/img/integrate-with-datadog-3.png)

## Performance metrics available to Datadog{#performance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/) tracks the following metric data for your Zilliz Cloud cluster. The metric names in parentheses are the names used in the Datadog UI.

### Resource{#resource}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>Metric Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>CU Computation (<code>zilliz.cluster.cu.computation.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>A measure of the used capacity relative to the total capacity of the CU. Range from 0 to 1.</p></td>
   </tr>
   <tr>
     <td><p>CU Capacity (<code>zilliz.cluster.cu.capacity.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>A measure of the utilized computational power relative to the total computational capacity of the CU. Range from 0 to 1.</p></td>
   </tr>
   <tr>
     <td><p>Storage (<code>zilliz.cluster.storage.bytes.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The total amount of persistent storage consumed by data and indexes.</p></td>
   </tr>
</table>

### Performance{#performance}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>Metric Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Cluster Write Performance Capacity (<code>zilliz.cluster.write.performance.capacity.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>A measure of the current rate of write operation relative to the write rate limit. Range from 0 to 1.</p></td>
   </tr>
   <tr>
     <td><p>Slow Query Count (<code>zilliz.request.slow.queries.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>The total number of slow query requests.</p></td>
   </tr>
   <tr>
     <td><p>QPS, Request Failure Rate, Number of Flush Operations (<code>zilliz.requests.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>The total number of requests processed.</p></td>
   </tr>
   <tr>
     <td><p>VPS (<code>zilliz.request.vectors.total</code>)</p></td>
     <td><p>Count</p></td>
     <td><p>The total number of vectors manipulated across all requests.</p></td>
   </tr>
   <tr>
     <td><p>Latency (<code>zilliz.request.latency.milliseconds.average</code>, <code>zilliz.request.latency.milliseconds.p99</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The average/P99 latency of requests processed.</p></td>
   </tr>
</table>

### Data{#data}

<table>
   <tr>
     <th><p>Metric Name</p></th>
     <th><p>Metric Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Entity Count (<code>zilliz.entities.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of entities.</p></td>
   </tr>
   <tr>
     <td><p>Loaded Entities (<code>zilliz.loaded.entities.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of loaded entities.</p></td>
   </tr>
   <tr>
     <td><p>Collection Count (<code>zilliz.collections.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of collections.</p></td>
   </tr>
   <tr>
     <td><p>Number of Unloaded Collections (<code>zilliz.unloaded.collections.current</code>)</p></td>
     <td><p>Gauge</p></td>
     <td><p>The number of unloaded collections.</p></td>
   </tr>
</table>

## Tags available to Datadog{#tags-available-to-datadog}

Datadog sends the following tags on certain metrics to help you better understand, organize, and identify resources.

<table>
   <tr>
     <th><p>Tag Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>org_id</code></p></td>
     <td><p>The ID of the Zilliz Cloud organization associated with the metric.</p></td>
   </tr>
   <tr>
     <td><p><code>project_id</code></p></td>
     <td><p>The ID of the Zilliz Cloud project associated with the metric.</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>The ID of the Zilliz Cloud cluster associated with the metric.</p></td>
   </tr>
   <tr>
     <td><p><code>request_type</code></p></td>
     <td><p>The type of operation that is  being monitored. Possible values: <code>insert</code>, <code>upsert</code>, <code>delete</code>, <code>bulk_insert</code>, <code>flush</code>, <code>search</code>, <code>query</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>The outcome of the operation. Possible values: <code>success</code>, <code>fail</code></p></td>
   </tr>
</table>
