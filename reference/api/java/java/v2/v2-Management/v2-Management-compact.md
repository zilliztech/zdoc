---
title: "compact() | Java | v2"
slug: /java/java/v2-Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection. | Java | v2"
type: docx
token: Df6GdjeIXoThhVxM6dMcvDqenSe
sidebar_position: 2
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - javaV226
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection.

```java
public CompactResp compact(CompactReq request)
```

## Request Syntax\{#request-syntax}

```java
compact(CompactReq.builder()
    .databaseName(String database)
    .collectionName(String collection)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String database)`

    The name of the database to which the target collection belongs.

- `collectionName(String collection)`

    The name of the target collection.

**RETURN TYPE:**

*CompactResp*

**RETURNS:**

A **CompactResp** object contains a compaction ID.

- **compactionID** (*Long*)

    The ID of the current compact operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.response.CompactResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build();
);
```

