---
displayed_sidbar: javaSidebar
title: "listIndexes() | Java | v2"
slug: /java/java/v2-Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
notebook: false
description: "This operation lists the indexes of a field in a specific collection. | Java | v2"
type: docx
token: OyWwdNBG1o2pTQxNDD1cLHcTnwc
sidebar_position: 9
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - javaV225
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listIndexes()

This operation lists the indexes of a field in a specific collection.

```java
public List<String> listIndexes(ListIndexesReq request)
```

## Request Syntax{#request-syntax}

```java
listIndexes(ListIndexesReq.builder()
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `fieldName(String fieldName)`

    The name of the target field.

**RETURNS:**

*List\<String>*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// list the indexes on the `varchar` field in the `test` collection
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .build();
        
List<String> indexes = client.listIndexes(ListIndexesReq);
```

