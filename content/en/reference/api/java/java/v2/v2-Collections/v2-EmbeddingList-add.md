---
title: "add() | Java | v2"
slug: /java/java/v2-EmbeddingList-add
sidebar_label: "add()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds vector embeddings to an EmbeddingList instance. | Java | v2"
type: docx
token: CJcWdpdqLoZiEExhfagc9A0jnag
sidebar_position: 36
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - add()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# add()

This operation adds vector embeddings to an **[EmbeddingList](./v2-Collections-EmbeddingList)** instance.

```java
public void add(BaseVector vector)
```

**PARAMETERS:**

- **vector** (*BaseVector*) -

    A vector embedding to be added to the current EmbeddingList.

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
embeddingList.add(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}));
```
