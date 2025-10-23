---
title: "loadPartitions() | Java | v2"
slug: /java/java/v2-Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases the partitions in a specified collection from memory. | Java | v2"
type: docx
token: Jei2dpJMuoyOF5xTIuccfzcinOh
sidebar_position: 6
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitions()
  - javaV225
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

This operation releases the partitions in a specified collection from memory.

```java
public void loadPartitions(LoadPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
loadPartitions(LoadPartitionsReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionNames(List<String> partitionNames)`

    A list of the names of the partitions to load.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.LoadPartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load partition in collection
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("test")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.loadPartitions(loadPartitionsReq);
```

