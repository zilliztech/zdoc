---
title: "getPersistentSegmentInfo() | Java | v2"
slug: /java/java/v2-Management-getPersistentSegmentInfo
sidebar_label: "getPersistentSegmentInfo()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets information about persistent segments of a collection from the data nodes, including the number of entities. | Java | v2"
type: docx
token: Qg8wdRoRdoan3pxQnJLcOW5jnub
sidebar_position: 20
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getPersistentSegmentInfo()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPersistentSegmentInfo()

This operation gets information about persistent segments of a collection from the data nodes, including the number of entities.

```java
public GetPersistentSegmentInfoResp getPersistentSegmentInfo(GetPersistentSegmentInfoReq request)
```

## Request Syntax\{#request-syntax}

```java
getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of the target collection.

**RETURN TYPE:**

*GetPersistentSegmentInfoResp*

**RETURNS:**

A **GetPersistentSegmentInfoResp** object that contains detailed information about the persisted segments in the specified collection, including the number of entities in each of these segments. The object has the following parameters:

**PARAMETERS:**

- **segmentInfos** (*List&lt;PersistentSegmentInfo&gt;*) -

    A list of segments, each represented by a PersistentSegmentInfo object, which has the following fields.

    - **segmentID** (*Long*) -

        The ID of the current segment.

    - **collectionID** (*Long*) -

        The ID of the collection to which the current segment belongs.

    - **partitionID** (*Long*) -

        The ID of the partition to which the current segment belongs.

    - **collectionName** (*String*) -

        The name of the collection to which the current segment belongs.

    - **numOfRows** (*Long*) -

        The number of entities in the current segment.

    - **state** (*String*) -

        The state of the current segment. Possible values are: "Growing", "Sealed", "Flushed", "Flushing", "Dropped", "Importing".

    - **level** (*String*) -

        The compaction level of the current segment. Possible values are: "Legacy", "L0", "L1", "L2".

    - **storageVersion** (*Long*) -

        The storage format version of the current segment.

    - **isSorted** (*Boolean*) -

        Whether the entities in the current segment are sorted.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.GetPersistentSegmentInfoReq;
import io.milvus.v2.service.utility.response.GetPersistentSegmentInfoResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get segment info
GetPersistentSegmentInfoResp segInfoResp = client.getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
        .collectionName(randomCollectionName)
        .build());
```
