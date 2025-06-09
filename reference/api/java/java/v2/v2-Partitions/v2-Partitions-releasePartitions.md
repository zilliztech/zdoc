---
displayed_sidbar: javaSidebar
title: "releasePartitions() | Java | v2"
slug: /java/java/v2-Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
notebook: false
description: "This operation releases the partitions in a specified collection from memory. | Java | v2"
type: docx
token: VsyQdDkXnoloWYxfjXNchc0dnng
sidebar_position: 7
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - javaV225
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# releasePartitions()

This operation releases the partitions in a specified collection from memory.

```java
public void releasePartitions(ReleasePartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
releasePartitions(ReleasePartitionsReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to release.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release partition in collection
ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("test_partition")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.releasePartitions(releasePartitionsReq);
```

