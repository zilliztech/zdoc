---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation drops an existing function from a collection. | Java | v2"
type: docx
token: A6dgdXJdRoxwKAxGB1hctKXvnZg
sidebar_position: 33
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

This operation drops an existing function from a collection.

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## Request Syntax\{#request-syntax}

```java
dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .functionName(String functionName)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection.

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `functionName(String functionName)` -

    **[REQUIRED]**

    The name of the function to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.collection.request.DropCollectionFunctionReq;

client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("my_collection")
    .functionName("bm25")
    .build());
```
