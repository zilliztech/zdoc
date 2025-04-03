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
sidebar_position: 19
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - javaV225
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
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
// check whether collection test exists
HasCollectionReq hasCollectionReq = HasCollectionReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

