---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Adds a function definition to an existing collection. In Milvus 3.0, use `addFunctionField()` when the function output field and its index must be added together. | Java | v2"
type: docx
token: Qbvcd9DG1ofMpuxVdEqcToU1nIb
sidebar_position: 30
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

Adds a function definition to an existing collection. In Milvus 3.0, use [`addFunctionField()`](./v2-Collections-addFunctionField) when the function output field and its index must be added together.

```java
public void addCollectionFunction(AddCollectionFunctionReq request)
```

## Request Syntax\{#request-syntax}

```java
AddCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .function(function)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of the target collection.

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `function(CreateCollectionReq.Function function)`

    The function definition to add to existing collection fields.

**RETURNS:**

*void*

This operation does not return a value.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
CreateCollectionReq.Function bm25Function = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("sparse"))
    .build();

client.addCollectionFunction(AddCollectionFunctionReq.builder()
    .collectionName("books")
    .function(bm25Function)
    .build());
```
