---
title: "add() | Java | v2"
slug: /java/java/v2-EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds vector embeddings to an EmbeddingList instance. | Java | v2"
type: docx
token: PUOBd229uoQGUIxnHLWcMSidnQh
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - javaV226
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# add()

This operation adds vector embeddings to an **EmbeddingList** instance.

```java
public void add(BaseVector vector)
```

**PARAMETERS:**

- **vector** (*BaseVector*) -

    A vector embedding to be added to the current EmbeddingList. 

**RETURN TYPE:**

*EmbeddingList*

**RETURNS:**

An EmbeddingList instance that can be used again to chain up other `add()` methods.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception arises if different types of vector embeddings are provided.

## Examples:\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;
        
// 1. Initialize an EmbeddingList
EmbeddingList embeddingList = new EmbeddingList();

// 2. Add vector embedding
embeddingList.add(new FloatVec[0.1, 0.2, 0.3, 0.4, 0.5])
```
