---
title: "Scale Cluster | Cloud"
slug: /scale-cluster
sidebar_label: "Scale Cluster"
beta: FALSE
notebook: FALSE
description: "As data grows, you may face constraints that impact data writing. For example, read operations remain functional, but inserting or upserting new data might fail when the cluster reaches its maximum capacity. | Cloud"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN

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

![manual-scale-entry](/img/manual-scale-entry.png)

In the Scale Cluster dialog box, you can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. 

- For Dedicated (Standard) clusters, you can scale the size up to a maximum of 32 CUs.

- For Dedicated (Enterprise) clusters, you can scale up to a maximum of 256 CUs.

If you require a larger CU size, please [create a support ticket](http://support.zilliz.com/).

<Admonition type="info" icon="📘" title="Notes">

<p>The cluster CU size x <a href="./manage-replica">replica</a> count should not exceed 256. Otherwise, cluster scaling may fail. </p>

</Admonition>

### Scale down a cluster{#scale-down-a-cluster}

![manual-scale-entry](/img/manual-scale-entry.png)

In the **Scale Cluster** dialog box, select the desired CU size in the dialog window. Once you click **Scale**, Zilliz Cloud will check the cluster's data volume and collection numbers. Scaling down will be successfully triggered only when both of the following two conditions are met:

- Current data volume < 80% of the CU capacity of the new CU size.

- Current number of collections < the [maximum number of collections](./limits#collections) allowed in the new CU size.

The time required to complete the process depends on the data volume in your cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>To scale down the cluster CU size to fewer than 8 CUs, ensure that there are no replicas in the cluster.</p>

</Admonition>

## Auto-scaling{#auto-scaling}

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This feature is exclusively available to Dedicated clusters. For Serverless clusters, manual configuration of CU resources is unnecessary, as they automatically scale based on workload.</p></li>
<li><p>Auto-scaling is disabled for clusters with replicas.</p></li>
</ul>

</Admonition>

Auto-scaling is designed for businesses with rapidly changing needs. It can prevent restrictions on user write access caused by insufficient cluster CU capacity and can reduce operational burdens, minimizing disruptions to business operations.

After enabling this feature, you can configure auto-scaling options when a cluster is successfully created.

![configure_autoscaling](/img/configure_autoscaling.png)

In the dialog box, you can set the following configurations:

- **Maximum CU Size:** The maximum CU size to which a cluster can automatically scale up. For CU sizes below 8, the increments are 2 CUs, resulting in the sequence: 1, 2, 4, 6, 8 CUs. For sizes above 8, the increments are 4 CUs, leading to the sequence: 8, 12, 16, 20, 24, 28, 32, etc.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Downward auto-scaling is not currently supported. </p>

    </Admonition>

- **CU Capacity Threshold:** Zilliz Cloud checks the cluster CU capacity every minute. If it has exceeded the specified threshold  (set at 70% by default) at all sampling points for the past 2 minutes, a scaling process is automatically initiated. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>It is not recommended to set the threshold too high (above 90%). This is because when data insertion rate is high, the cluster may not complete auto-scaling in time, leading to write prohibitions.</p>

    </Admonition>

There is a cooldown period of 10 minutes between two automatic scaling events. The time it takes to complete the auto-scaling process varies based on the data volume in the cluster.

<Admonition type="caution" icon="🚧" title="Warning">

<p>During the scaling process, slight service jitters may occur but they do not affect read and write operations. High write rates can sometimes cause CU capacity to hit 100%, resulting in write prohibitions.</p>

</Admonition>

## Increase QPS{#increase-qps}

To boost QPS and query throughput, please consider adding replicas. For more information, refer to [Manage Replica](./manage-replica)

