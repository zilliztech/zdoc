---
title: "Scale Cluster | Cloud"
slug: /scale-cluster
sidebar_label: "Scale Cluster"
beta: FALSE
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
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Cluster

As your workload grows and more data is written, the cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail.

To proactively manage this, you can monitor **CU Capacity** on the [metrics](./metrics-alerts-reference) page to determine when scaling is needed. Based on your business needs and patterns, you can increase the CU size to expand cluster capacity or reduce it when demand decreases to save on costs.

This guide explains how to resize a cluster to suit your changing workload.

<Admonition type="info" icon="📘" title="Notes">

<p>To improve query performance (QPS) or availability, increase <a href="./manage-replica">replicas</a>—not CU size, which only affects storage and ingestion capacity.</p>

</Admonition>

## Scaling Options in Zilliz Cloud{#scaling-options-in-zilliz-cloud}

Zilliz Cloud offers several ways to scale your cluster:

- [Manual Scaling](./scale-cluster#manual-scaling): Manually adjust CU size anytime for full control. Ideal if you have a clear understanding of your workload patterns.

- [Dynamic Auto-Scaling](./scale-cluster#dynamic-auto-scaling): Automatically adjust CU size based on real-time metrics. Best for unpredictable workloads that may spike or dip throughout the day.

- [Scheduled Auto-Scaling](./scale-cluster#scheduled-auto-scaling): Automatically adjust CU size based on a predefined time schedule. Perfect for recurring workload patterns, such as peaks during business days and lower demand on weekends.

## Considerations{#considerations}

- Scaling is only available for Dedicated clusters.

- Downward auto-scaling is currently not supported in dynamic auto-scaling.

- Scaling may cause slight service jitter. Completion time varies by data volume.

## Manual scaling{#manual-scaling}

You can manually scale your cluster up or down via the Zilliz Cloud console or RESTful API.

The followings are the limits and considerations for manual scaling.

- **Scale up**

    - Dedicated (Standard) clusters: Up to 32 CUs

        Dedicated (Enterprise) clusters: Up to 256 CUs

        For larger CU sizes, [contact sales](http://zilliz.com/contact-sales).

    - The product of **CU size** × **Replica count** must not exceed 256

- **Scale down**

    - Clusters with replicas cannot scale down to less than 8 CUs

    - A scale-down request only succeeds if:

        - Current data volume < 80% of the CU capacity of the new CU size.

        - Current number of collections < the [maximum number of collections](./limits#collections) allowed in the new CU size.

#### Via web console{#via-web-console}

The following demo shows how to manually scale up and down a cluster on the Zilliz Cloud web console.

<Supademo id="cmd2r0jc634jlc4kju69onxyh" title=""  />

#### Via RESTful API{#via-restful-api}

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

## Auto-scaling{#auto-scaling}

To reduce operational overhead and avoid service interruptions, you can enable auto-scaling in the Zilliz Cloud web console. Two modes are available—**dynamic** and **scheduled**—and you can enable either or both.

The followings are the limits and considerations for auto-scaling.

- Downward auto-scaling is not currently supported in dynamic auto-scaling.

- There is **10-minute cooldown** between two automatic scaling events.

### Dynamic auto-scaling{#dynamic-auto-scaling}

The following demo shows how to configure dynamic auto-scaling on the Zilliz Cloud web console. 

<Supademo id="cmd2r7eqb34nbc4kj3wly357s" title=""  />

**CU Capacity Threshold**: The usage percentage (default 70%) that triggers auto-scaling if consistently exceeded at all sample points over the past 2 minutes. Avoid setting it too high (e.g., >90%), as high write rates can push CU capacity to 100% before the cluster can finish scaling, resulting in write prohibitions.

### Scheduled auto-scaling{#scheduled-auto-scaling}

The following demo shows how to configure scheduled auto-scaling on the Zilliz Cloud web console.

<Supademo id="cmd2rdlw234orc4kjuqvvhss6" title=""  />

