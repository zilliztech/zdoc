---
title: "EmbeddingList | Java | v2"
slug: /java/java/v2-Collections-EmbeddingList
sidebar_label: "EmbeddingList"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "An EmbeddingList instance represents a list of vector embeddings. You can use an EmbeddingList instance to build the query vectors in a search against a vector field in an Array of Structs field. | Java | v2"
type: docx
token: EXcNdtZrro7Ufkxp3G6cUArOn7b
sidebar_position: 2
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - EmbeddingList
  - javaV226
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# EmbeddingList

An **EmbeddingList** instance represents a list of vector embeddings. You can use an **EmbeddingList** instance to build the query vectors in a search against a vector field in an Array of Structs field.

```java
io.milvus.v2.service.vector.request.data.EmbeddingList
```

## Constructor\{#constructor}

Constructs an empty embedding list or a list of given vector embeddings.

```java
EmbeddingList()
```

**RETURN TYPE:**

EmbeddingList

**RETURNS:**

An EmbeddingList instance comprises one or multiple vector embeddings. You can use it to search against the vector fields in the Struct elements of an Array of Structs field.

## Examples:\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
// 2. Initialize EmbeddingList
EmbeddingList embeddingList1 = new EmbeddingList();
embeddingList1.add(new FloatVec(vector1));
embeddingList1.add(new FloatVec(vector2));

EmbeddingList embeddingList2 = new EmbeddingList();
embeddingList2.add(new FloatVec(vector3));
embeddingList2.add(new FloatVec(vector4));

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField(annName)
        .data(Arrays.asList(embeddingList1, embeddingList2))
        .limit(10)
        .build());
```

