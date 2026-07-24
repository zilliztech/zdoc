---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Removes a function definition from an existing collection without removing its output field. Use `dropFunctionField()` to remove both. | Java | v2"
type: docx
token: K0wedJ57uoHCyXxOFtNc673tnuA
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

Removes a function definition from an existing collection without removing its output field. Use [`dropFunctionField()`](./v2-Collections-dropFunctionField) to remove both.

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## Request Syntax\{#request-syntax}

```java
DropCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of the target collection.

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `functionName(String functionName)`

    The name of the function definition to remove.

**RETURNS:**

*void*

This operation does not return a value.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
