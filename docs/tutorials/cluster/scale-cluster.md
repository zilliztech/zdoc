---
title: "Scale Cluster | Cloud"
slug: /scale-cluster
sidebar_label: "Scale Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "As your workload grows and more data is written, the cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail. | Cloud"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Cluster

As your workload grows and more data is written, the cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail.

To proactively manage this, you can monitor **CU Capacity** on the [metrics](./metrics-alerts-reference) page to determine when scaling is needed. Based on your business needs and patterns, you can increase the number of query CUs to expand cluster capacity or reduce it when demand decreases to save on costs.

Please note that for clusters with 1 - 8 CUs, you can directly scale query CU. For clusters with more than 8 CUs, please increase [replicas](./manage-replica).

This guide explains how to resize a cluster to suit your changing workload.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Scaling Methods in Zilliz Cloud\{#scaling-methods-in-zilliz-cloud}

Zilliz Cloud offers several ways to scale your cluster:

- [Manual Scaling](./scale-cluster#manual-scaling): Instantly adjust the number of query CU. Ideal if you have a clear understanding of your workload patterns. 

    - When you choose manual scaling, you can further enable **scheduled scaling** to adjust query CU resources based on a predefined time schedule. Scheduled scaling is perfect for recurring workload patterns, such as peaks during business days and lower demand on weekends, or scenarios where your future workload is stable and predictable.

- [Dynamic Scaling](./scale-cluster#dynamic-scaling): Automatically adjusts the cluster query CU resources within a user-defined min–max range based on real-time metrics. Best for unpredictable workloads that may spike or dip throughout the day.

## Considerations\{#considerations}

- **Resource Limitations**: 

    - **Scale up**

        - Dedicated (Standard) clusters: Up to 32 CUs

            Dedicated (Enterprise) clusters: Up to 256 CUs

        - The product of **Number of Query CU** × **Replica count** must not exceed 256

        For larger query CU, [contact sales](http://zilliz.com/contact-sales).

    - **Scale down**

        - Clusters with replicas cannot scale down to less than 8 CUs

        - A scale-down request only succeeds if:

            - Current data volume < 80% of the CU capacity of the new CU size.

            - Current number of collections and partitions < the [maximum number of collections and partitions](./limits#collections) allowed in the new CU size.

- **During Scaling**: The cluster status changes to “Modifying,” during which no operations can be performed. If multiple scaling tasks are triggered, they will be processed sequentially based on trigger timestamp. Completion time depends on data volume.

- **Performance Impact**: Scaling may cause slight service jitter.

- **Backup Limitations**: Dynamic and scheduled scaling settings are not included in [backups](./create-snapshot). After restoring a cluster, reconfigure these settings manually.

## Manual scaling\{#manual-scaling}

You can manually scale your cluster up or down via the Zilliz Cloud console or RESTful API. Note that scheduled scaling is only available on the web console.

### Via web console\{#via-web-console}

The following demo shows how to manually scale up and down a cluster on the Zilliz Cloud web console.

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

### Via RESTful API\{#via-restful-api}

The following example scales an existing cluster to 2 CU. For details, see [Modify Cluster](/reference/restful/modify-cluster-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

The following is an example output.

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```

## Dynamic scaling\{#dynamic-scaling}

Zilliz Cloud supports dynamic scaling to help you maintain performance while eliminating manual intervention. When enabled, the system automatically adjusts the **query CU** resources based on the real-time **CU capacity** metric, ensuring your workload is served efficiently without service disruption.

When setting up dynamic scaling, you can configure the following bounds:

- **Minimum Query CU**: Defaults to the current size.

- **Maximum Query CU**: Defaults to 4× the current CU size.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Selecting a maximum query CU below the current value triggers an immediate scale-down.</p></li>
<li><p>Selecting a minimum query CU above the current value triggers an immediate scale-up.</p></li>
</ul>

</Admonition>

### Trigger conditions\{#trigger-conditions}

- Scale Up: Triggered when CU capacity exceeds 80% for 10 minutes. Or when CU capacity reaches 100%, a scale up will be triggered immediately.

- Scale Down: Triggered when CU capacity stays below 60% for 30 minutes.

- A cooldown period of 10 minutes applies between scale-up events, and 30 minutes between scale-down events. Scaling down will execute on a size-by-size basis until the target metric value has been achieved.

### Scaling size calculation\{#scaling-size-calculation}

The following formula explains how Zilliz Cloud calculates the target number of query CU for a dynamic scaling event. The dynamic scaling formula aims to maintain your CU capacity at a target value of 70%.

```plaintext
Target Query CU Number = Current Query CU Number × (Current Metric Value / Target Metric Value) 
```

<table>
   <tr>
     <th><p>Variable Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Target Query CU Number</p></td>
     <td><p>The new size the system aims to scale the cluster to.</p></td>
   </tr>
   <tr>
     <td><p>Current Query CU Number</p></td>
     <td><p>The current query CU number of the cluster.</p></td>
   </tr>
   <tr>
     <td><p>Current Metric Value</p></td>
     <td><p>The current measured value of the CU capacity metric.</p></td>
   </tr>
   <tr>
     <td><p>Target Metric Value</p></td>
     <td><p>Expected CU capacity value after scaling, which is 70.</p></td>
   </tr>
</table>

For example, if dynamic scaling is enabled and the following conditions are met:

- **Current Query CU Number:** 60 CU

- **Cluster CU Capacity:** Above 80% for 10 minutes

A dynamic scaling event will be triggered. The target query CU number is calculated as:

```plaintext
60 × (80 / 70) ≈ 68.57 CU
```

This value is then rounded up to the next available CU number, resulting in a new size of **72 CU**.

### Procedures\{#procedures}

The following demo shows how to configure dynamic auto-scaling on the Zilliz Cloud web console. 

<Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

## View scaling progress\{#view-scaling-progress}

Once a manual scaling request is sent or a dynamic scaling event is triggered, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

When a scaling job is in progress, you cluster status will change to "Modifying". Once the scaling job is successful, the cluster status will change to "Running".

## FAQ\{#faq}

1. **Which scaling option should I choose?**

    The following is a quick tip to help you choose the right scaling method for your needs:

![YfDow6t7Bh9HONbg60RcQryvnfe](https://zdoc-images.s3.us-west-2.amazonaws.com/YfDow6t7Bh9HONbg60RcQryvnfe.png)

    - If you have a very clear understanding of your workload patterns—such as consistent daily peaks or planned batch import jobs—**manual** scaling and **scheduled** scaling is right option for you. If you need to adjust the query CU immediately, choose manual scaling. If you want the adjustment to occur recurringly at a specific future time, choose scheduled scaling.

    - If your workload is unpredictable and varies throughout the day or week, **dynamic scaling** is recommended. It adjusts the cluster size automatically within a range you define, helping to maintain performance while optimizing cost.

1. **When should I scale replicas and when should I scale query CU?**

    You are recommended to:

    - Increase **replica** count when:

        - You need to handle high QPS (queries per second) and high availability.

        - Your workload consists of many concurrent search or query requests. You need to increase throughput.

        *Tips: Each replica is an independent copy of the query CU resources and handles a subset of queries.*

    - Increase **query CU** when:

        - You are working with large datasets or require more collections.

        - You are seeing high CPU or memory usage.

        *Tips:  Increasing CU size gives each query node more computing resources and capacity.*

    - **Suggestion**: For clusters with 1 - 8 CUs, you can directly scale query CU. For clusters with more than 8 CUs, please increase replicas.

1. **What are the limitations when scaling down a cluster?**

    Clusters with replicas cannot scale down to fewer than 8 CUs.

    A scale-down request will only succeed if both of the following conditions are met:

    - The current data volume is less than 80% of the new CU size's capacity.

    - The number of collections and partitions is within the limit allowed by the new CU size.

