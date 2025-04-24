---
displayed_sidbar: javaSidebar
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
notebook: false
description: "This operation lists the statistics collected on a specific partition. | Java | v2"
type: docx
token: G09ndDq8poAh24xxmr4c7oHknid
sidebar_position: 3
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStats()
  - javaV225
  - vector database
  - IVF
  - knn
  - Image Search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getPartitionStats()

This operation lists the statistics collected on a specific partition.

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## Request Syntax{#request-syntax}

```java
getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition in the specified collection.

**RETURN TYPE:**

*GetPartitionStatsResp*

**RETURNS:**

A **GetPartitionStatsResp** object containing collected statistics on the specified collection.

**PARAMETERS:**

- **numOfEntities** (*long*)

    The count of entities in the partition.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GetPartitionStatsReq getPartitionStatsReq = GetPartitionStatsReq.builder()
        .collectionName("test")
        .partitionName("default")
        .build();
        
GetPartitionStatsResp getPartitionStatsResp = client.getPartitionStats(getPartitionStatsReq);
```

