---
displayed_sidbar: javaSidebar
title: "dropIndex() | Java | v2"
slug: /java/java/v2-Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
notebook: false
description: "This operation drops an index from a specific collection. | Java | v2"
type: docx
token: KdFEdP8ZToYvZ1xmmQgcE62unUf
sidebar_position: 4
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - javaV225
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropIndex()

This operation drops an index from a specific collection.

```java
public void dropIndex(DropIndexReq request)
```

## Request Syntax{#request-syntax}

```java
dropIndex(DropIndexReq.builder()
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `fieldName(String fieldName)`

    The name of the field on which the index is created.

- `indexName(String indexName)`

    The name of the index to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop index for the field "vector"
DropIndexReq dropIndexReq = DropIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
client.dropIndex(dropIndexReq);
```

