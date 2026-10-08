---
title: "getCompactionState() | Java | v2"
slug: /java/java/v2-Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the state of a specific compact operation. | Java | v2"
type: docx
token: A2Vpd1kXsoF5uexKYb8ckcGMnWe
sidebar_position: 8
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionState()

This operation gets the state of a specific compact operation.

```java
public GetCompactionStateResp getCompactionState(GetCompactionStateReq request)
```

## Request Syntax\{#request-syntax}

```java
getCompactionState(GetCompactionStateReq.builder()
    .compactionID(Long compactionID)
    .build();
)
```

**BUILDER METHODS:**

- `compactionID(Long compactionID)`

    The ID of a compact operation, which is returned by a `compact()` call.

**RETURN TYPE:**

*GetCompactionStateResp*

**RETURNS:**

A GetCompactionStateResp instance, which contains the following parameters:

**PARAMETERS:**

- **state** (*CompactionState*) -

    The current state of the specified compact operation. Possible values are:

    - UndefiedState(0)

    - Executing(1)

    - Completed(2)

- **executingPlanNo** (*Long*) -

    The ID of the corresponding execution plan.

- **timeoutPlanNo** (*Long*) -

    The ID of the timeout plan.

- **completedPlanNo** (*Long*) -

    The ID of the completed plan.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.request.GetCompactionStateReq;
import io.milvus.v2.service.utility.response.CompactResp;
import io.milvus.v2.service.utility.response.GetCompactionStateResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build());

// 3. Get the compaction status
client.getCompactionState(GetCompactionStateReq.builder()
    .compactionID(3431948932481L)
    .build());
```
