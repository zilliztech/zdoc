---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation lists the statistics collected on a specific partition. | Java | v2"
type: docx
token: ZCESd1IrfoFHByx125kcd38Zndg
sidebar_position: 3
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStats()
  - javaV226
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

This operation lists the statistics collected on a specific partition.

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
getPartitionStats(GetPartitionStatsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition in the specified collection.

**RETURN TYPE:**

*GetPartitionStatsResp*

**RETURNS:**

A **GetPartitionStatsResp** object containing collected statistics on the specified collection.

**PARAMETERS:**

- **numOfEntities** (*long*)

    The count of entities in the partition.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.GetPartitionStatsReq;
import io.milvus.v2.service.partition.response.GetPartitionStatsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get partition stats
GetPartitionStatsReq getPartitionStatsReq = GetPartitionStatsReq.builder()
        .collectionName("test")
        .partitionName("default")
        .build();
GetPartitionStatsResp getPartitionStatsResp = client.getPartitionStats(getPartitionStatsReq);
```

