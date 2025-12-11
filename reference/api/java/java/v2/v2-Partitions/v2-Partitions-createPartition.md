---
title: "createPartition() | Java | v2"
slug: /java/java/v2-Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation creates a partition in the target collection. | Java | v2"
type: docx
token: WE4gduIjooCgQUxcKyLcwQe1n3g
sidebar_position: 1
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - createPartition()
  - javaV226
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

This operation creates a partition in the target collection.

```java
public void createPartition(CreatePartitionReq request)
```

## Request Syntax\{#request-syntax}

```java
createPartition(CreatePartitionReq.builder()
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

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to create.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.CreatePartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a partition "test_partition" in collection "test"
CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.createPartition(createPartitionReq);
```

