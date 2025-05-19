---
displayed_sidbar: javaSidebar
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
notebook: false
description: "This operation drops a specified partition from the current collection. | Java | v2"
type: docx
token: JTdSdyToooA6Srx2HolcmTPunoe
sidebar_position: 2
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - javaV225
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPartition()

This operation drops a specified partition from the current collection.

Before dropping a partition, you must first release it.

```java
public void dropPartition(DropPartitionReq request)
```

## Request Syntax{#request-syntax}

```java
dropPartition(DropPartitionReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    (Required) The name of an existing collection.

- `partitionName(String partitionName)`

    (Required) The name of the partition to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.DropPartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop partition "test_partition"
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

