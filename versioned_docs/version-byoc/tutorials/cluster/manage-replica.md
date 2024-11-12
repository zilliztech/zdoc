---
title: "Manage Replica | BYOC"
slug: /manage-replica
sidebar_label: "Manage Replica"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud enables cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability. | BYOC"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage

---

import Admonition from '@theme/Admonition';


# Manage Replica

Zilliz Cloud enables cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability.

For users with small datasets experiencing QPS bottlenecks, adding replicas can distribute the query workload, enhancing overall query throughput. However, adding replicas will not increase the cluster capacity because the capacity is only determined by the CU size of each replica. If you want to increase the cluster capacity, please refer to [Scale Cluster](./scale-cluster).

Configuring replicas will affect the cluster's monthly CU cost. The storage cost of the cluster will remain unchanged. 

This guide outlines the procedures of configuring replicas for a cluster in Zilliz Cloud.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is currently exclusively available to Dedicated (Enterprise) clusters. </p>

</Admonition>

## Configure replicas{#configure-replicas}

You can add replicas for an existing Dedicated cluster as long as the following conditions are met:

- The cluster has 8 CUs or more

- For clusters whose compatible Milvus version is lower than 2.4.13, all collections in the cluster need to be released

When adding replicas, please note that the cluster CU size x replica count should not exceed 256. 

<Admonition type="caution" icon="🚧" title="Warning">

<p>Updating the replica configurations may lead to slight service jitter. Please exercise caution.</p>

</Admonition>

![configure-replica](/byoc/configure-replica.png)

For more information about using the RESTful API to configure replicas, please refer to [Modify Cluster](/reference/restful/modify-cluster-v2).

