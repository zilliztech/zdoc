---
displayed_sidbar: javaSidebar
title: "hasCollection() | Java | v2"
slug: /java/java/v2-Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
notebook: false
description: "This operation checks whether a specific collection exists. | Java | v2"
type: docx
token: Vs26d4WrYoJ3moxuLifcyP2enyh
sidebar_position: 18
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - javaV225
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hasCollection()

This operation checks whether a specific collection exists.

```java
public Boolean hasCollection(HasCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
hasCollection(HasCollectionReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the specified collection exists.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.HasCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check whether the collection exists
HasCollectionReq hasCollectionReq = HasCollectionReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

