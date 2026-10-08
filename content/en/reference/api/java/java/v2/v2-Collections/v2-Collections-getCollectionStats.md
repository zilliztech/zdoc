---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the complete collection statistics map in addition to the entity count. | Java | v2"
type: docx
token: RSNDdgCQ2oRIMWxeVafcNf8LnAc
sidebar_position: 15
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStats()

This operation returns the complete collection statistics map in addition to the entity count.

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
GetCollectionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `collectionName(String collectionName)`

    The name of the target collection.

**RETURN TYPE:**

*GetCollectionStatsResp*

**RETURNS:**

A **GetCollectionStatsResp** object that contains the entity count and the complete statistics map of the specified collection.

**PARAMETERS:**

- **numOfEntities** (*Long*) -

    The number of entities in the collection.

- **stats** (*Map&lt;String, String&gt;*) -

    The complete statistics map of the collection, returned by Milvus as key-value pairs.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```
