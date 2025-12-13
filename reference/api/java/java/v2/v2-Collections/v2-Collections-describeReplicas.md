---
title: "describeReplicas() | Java | v2"
slug: /java/java/v2-Collections-describeReplicas
sidebar_label: "describeReplicas()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns information about the replicas of a specific collection. | Java | v2"
type: docx
token: WRSYdEZwroNY1Txpk2DcI1sSnVg
sidebar_position: 25
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - describeReplicas()
  - javaV226
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeReplicas()

This operation returns information about the replicas of a specific collection.

```java
public DescribeReplicasResp describeReplicas(DescribeReplicasReq request)
```

## Request Syntax\{#request-syntax}

```java
describeReplicas(DescribeReplicasReq.builder()
    .databaseName(String alias)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String alias)`

    The name of the database that holds the target collection.

- `collectionName(String collectionName)`

    The name of the target collection.

**RETURN TYPE:**

*DescribeReplicasResp*

**RETURNS:**

A DescribeReplicasResp that contains detailed information about the replicas in the specified collection.

**PARAMETERS:**

- **replicas** (*List\<ReplicaInfo>*) -

    A list of replicas, each of which contains the following fields:

    - **replicaID** (*Long*) -

        The ID of a replica.

    - **collectionID** (*Long*) -

        The ID of the specified collection.

    - **partitionIDs** (*List\<Long>*) -

        The IDs of partitions associated with the current replica.

    - **shardReplicas** (*List\<ShardReplicas>*) -

        The shards associated with the current replica. Each of the shards contains the following information:

        - **leaderID** (*Long*) -

            The ID of the leader shard

        - **leaderAddress** (*String*) -

            The address of the leader shard in the form of `IP:PORT`.

        - **channelName** (*String*) -

            The name of the channel associated with the current shard.

        - **nodeIDs** (*List\<Long>*) -

            The IDs of the query nodes associated with the current shard.

    - **nodeIDs** (*List\<Long>*) -

        The IDs of the query nodes associated with the current replica.

    - **resourceGroupName** (*String*) -

        The name of the resource group associated with the current replica.

    - **numOutboundNode** (*Map\<String, Integer>*) -

        The number of outbound query nodes.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.ReplicaInfo;
import io.milvus.v2.service.collection.request.DescribeReplicasReq;
import io.milvus.v2.service.collection.response.DescribeReplicasResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// describe the replicas of a collection named `test`
DescribeReplicasReq describeReplicasReq = DescribeReplicasReq.builder()
        .collectionName("test")
        .build();
DescribeReplicasResp descReplicaResp = client.describeReplicas(describeReplicasReq);
for (ReplicaInfo replica : descReplicaResp.getReplicas()) {
    System.out.println(replica.getReplicaID());
}
```

