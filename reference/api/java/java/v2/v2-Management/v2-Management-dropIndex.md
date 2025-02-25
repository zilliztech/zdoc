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
sidebar_position: 3
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - javaV225
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
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
// drop index for field "vector"
DropIndexReq dropIndexReq = DropIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
client_v2.dropIndex(dropIndexReq);
```

