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
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

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

To configure replicas for an existing Dedicated cluster as long as the following conditions are met:

- The cluster has 8 CUs or more

- For clusters whose compatible Milvus version is lower than 2.4.13, all collections in the cluster need to be released

Note that the cluster CU size x replica count should not exceed 256

<Admonition type="caution" icon="🚧" title="Warning">

<p>Updating the replica configurations may lead to slight service jitter. Please exercise caution.</p>

</Admonition>

You can adjust the number of replicas for an existing Dedicated cluster either manually on the console or programmatically.

### Configure replicas on the console{#configure-replicas-on-the-console}

You can configure replicas on the console as shown in the following figure.

![configure-replica](/img/configure-replica.png)

### Configure replicas programmatically{#configure-replicas-programmatically}

You can use the RESTful API to configure replicas programmatically. 

Note that the value for the `replica` parameter should be an integer ranging from 1 to 8. For more details, refer to [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2).

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="YOUR_CLUSTER_ID"
export TOKEN="YOUR_API_KEY"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modifyReplica" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "replica": "2"
      }'
```

