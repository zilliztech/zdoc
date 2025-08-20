---
title: "Scale Cluster | BYOC"
slug: /scale-cluster
sidebar_label: "Scale Cluster"
beta: FALSE
notebook: FALSE
description: "As your workload grows and more data is written, the cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail. | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Cluster

As your workload grows and more data is written, the cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail.

To proactively manage this, you can monitor **CU Capacity** on the [metrics](./metrics-alerts-reference) page to determine when scaling is needed. Based on your business needs and patterns, you can increase the number of query CUs to expand cluster capacity or reduce it when demand decreases to save on costs.

This guide explains how to resize a cluster to suit your changing workload.

<Admonition type="info" icon="📘" title="Notes">

<p>For clusters with 1 - 8 CUs, you can directly scale query CU. For clusters with more than 8 CUs, please increase <a href="./manage-replica">replicas</a>.</p>

</Admonition>

## Scaling Methods in Zilliz Cloud{#scaling-methods-in-zilliz-cloud}

Zilliz Cloud offers several ways to scale your cluster:

- [Manual Scaling](./scale-cluster#manual-scaling): Instantly adjust the number of query CU. Ideal if you have a clear understanding of your workload patterns. 

    - When you choose manual scaling, you can further enable **scheduled scaling** to adjust query CU resources based on a predefined time schedule. Scheduled scaling is perfect for recurring workload patterns, such as peaks during business days and lower demand on weekends, or scenarios where your future workload is stable and predicatable.

- [Dynamic Scaling](./scale-cluster#dynamic-scaling): Automatically adjusts the cluster query CU resources within a user-defined min–max range based on real-time metrics. Best for unpredictable workloads that may spike or dip throughout the day.

## Considerations{#considerations}

- **Plan Availability**: Only supported for Dedicated clusters.

- **Resource Limitations**: 

    - **Scale up**

        - Dedicated (Standard) clusters: Up to 32 CUs

            Dedicated (Enterprise) clusters: Up to 256 CUs

        - The product of **Number of Query CU** × **Replica count** must not exceed 256

        For larger query CU, [contact sales](http://zilliz.com/contact-sales).

    - **Scale down**

        - Clusters with replicas cannot scale down to less than 8 CUs

        - A scale-down request only succeeds if:

            - Current data volume &lt; 80% of the CU capacity of the new CU size.

            - Current number of collections and partitions &lt; the [maximum number of collections and partitions](./limits#collections) allowed in the new CU size.

- **During Scaling**: The cluster status changes to “Modifying,” during which no operations can be performed. If multiple scaling tasks are triggered, they will be processed sequentially based on trigger timestamp. Completion time depends on data volume.

- **Performance Impact**: Scaling may cause slight service jitter.

- **Backup Limitations**: Dynamic and scheduled scaling settings are not included in [backups](./create-snapshot). After restoring a cluster, reconfigure these settings manually.

## Manual scaling{#manual-scaling}

You can manually scale your cluster up or down via the Zilliz Cloud console or RESTful API. Note that scheduled scaling is only available on the web console.

### Via web console{#via-web-console}

The following demo shows how to manually scale up and down a cluster on the Zilliz Cloud web console.

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

### Via RESTful API{#via-restful-api}

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

