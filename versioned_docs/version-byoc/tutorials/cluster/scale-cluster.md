---
title: "Scale Cluster | BYOC"
slug: /scale-cluster
sidebar_label: "Scale Cluster"
beta: FALSE
notebook: FALSE
description: "As data grows, you may face constraints that impact data writing. For example, read operations remain functional, but inserting or upserting new data might fail when the cluster reaches its maximum capacity. | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm

---

import Admonition from '@theme/Admonition';


# Scale Cluster

As data grows, you may face constraints that impact data writing. For example, read operations remain functional, but inserting or upserting new data might fail when the cluster reaches its maximum capacity.  

To address such issues, you can adjust the number of CUs to match fluctuations in workload or storage requirements. You can enhance your cluster's performance by scaling up CUs in response to increased CPU or memory usage, and scale down to reduce costs during periods of low demand.

This guide outlines the procedures of scaling a cluster.

## Manual scaling{#manual-scaling}

You have the option to scale cluster manually by using the Zilliz Cloud web console or making an API request to scale your cluster. This guide focuses on how to manually scale a cluster using the web console. For more information about using the RESTful API, please refer to [Modify Cluster](/reference/restful/modify-cluster-v2).

<Admonition type="caution" icon="🚧" title="Warning">

<p>The scaling may lead to slight service jitter. Please exercise caution.</p>

</Admonition>

### Scale up a cluster{#scale-up-a-cluster}

![manual-scale-entry](/byoc/manual-scale-entry.png)

In the Scale Cluster dialog box, you can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. 

- For Dedicated (Standard) clusters, you can scale the size up to a maximum of 32 CUs.

- For Dedicated (Enterprise) clusters, you can scale up to a maximum of 256 CUs.

If you require a larger CU size, please [create a support ticket](http://support.zilliz.com/).

<Admonition type="info" icon="📘" title="Notes">

<p>The cluster CU size x <a href="./manage-replica">replica</a> count should not exceed 256. Otherwise, cluster scaling may fail. </p>

</Admonition>

### Scale down a cluster{#scale-down-a-cluster}

![manual-scale-entry](/byoc/manual-scale-entry.png)

In the **Scale Cluster** dialog box, select the desired CU size in the dialog window. Once you click **Scale**, Zilliz Cloud will check the cluster's data volume and collection numbers. Scaling down will be successfully triggered only when both of the following two conditions are met:

- Current data volume < 80% of the CU capacity of the new CU size.

- Current number of collections < the [maximum number of collections](./limits#collections) allowed in the new CU size.

The time required to complete the process depends on the data volume in your cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>To scale down the cluster CU size to fewer than 8 CUs, ensure that there are no replicas in the cluster.</p>

</Admonition>

## Increase QPS{#increase-qps}

To boost QPS and query throughput, please consider adding replicas. For more information, refer to [Manage Replica](./manage-replica)

