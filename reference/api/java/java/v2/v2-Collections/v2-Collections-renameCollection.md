---
displayed_sidbar: javaSidebar
title: "renameCollection() | Java | v2"
slug: /java/java/v2-Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
notebook: false
description: "This operation renames an existing collection. | Java | v2"
type: docx
token: CtTvdQVMoo2ec5xbWTPcSzjNnQc
sidebar_position: 16
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - renameCollection()
  - javaV225
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# renameCollection()

This operation renames an existing collection.

```java
public void renameCollection(RenameCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
renameCollection(RenameCollectionReq.builder()
    .collectionName(String collectionName)
    .newCollectionName(String newCollectionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- `newCollectionName(String newCollectionName)`

    The name of the target collection after this operation.

    Setting this to the value of **old_name** results in a **MilvusException**.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// rename collection "test" to "test2"
RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("test")
        .newCollectionName("test2")
        .build();
client.renameCollection(renameCollectionReq);
```

