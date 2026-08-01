---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Aligns insert-row validation for auto-ID fields, function output fields, dynamic fields, and Struct values. | Java | v2"
type: docx
token: DKs7dzHI5oaJvlxezuAcuMVzn9c
sidebar_position: 4
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

Aligns insert-row validation for auto-ID fields, function output fields, dynamic fields, and Struct values.

```java
public InsertResp insert(InsertReq request)
```

## Request Syntax\{#request-syntax}

```java
InsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**BUILDER METHODS:**

- `data(List<JsonObject> data)`

    The rows to insert. Field names and values must conform to the collection schema.

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `collectionName(String collectionName)`

    The name of the target collection.

- `partitionName(String partitionName)`

    The name of the target partition.

**RETURNS:**

*InsertResp*

Contains the number of inserted entities and generated primary keys when applicable.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

Demonstrates insert() with the reviewed v3.0.x API.

```java
InsertResp response = client.insert(InsertReq.builder()
    .collectionName("books")
    .data(rows)
    .build());
```
