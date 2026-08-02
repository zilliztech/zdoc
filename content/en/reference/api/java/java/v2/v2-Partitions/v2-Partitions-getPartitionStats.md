---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Returns the complete partition statistics map in addition to the entity count. | Java | v2"
type: docx
token: TOfvdLLzaoWJydxBTPQcKevfndd
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

Returns the complete partition statistics map in addition to the entity count.

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
GetPartitionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `collectionName(String collectionName)`

    The name of the target collection.

- `partitionName(String partitionName)`

    The name of the target partition.

**RETURNS:**

*GetPartitionStatsResp*

Contains numOfEntities and the complete stats map returned by Milvus.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

Demonstrates getPartitionStats() with the reviewed v3.0.x API.

```java
GetPartitionStatsResp response = client.getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName("books")
    .partitionName("history")
    .build());
Map<String, String> stats = response.getStats();
```
