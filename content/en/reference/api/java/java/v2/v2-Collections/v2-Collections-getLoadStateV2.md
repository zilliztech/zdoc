---
title: "getLoadStateV2() | Java | v2"
slug: /java/java/v2-Collections-getLoadStateV2
sidebar_label: "getLoadStateV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets detailed load-state information for a collection or partition. Use it when you need both the current load state and loading progress. | Java | v2"
type: docx
token: JEgudTxxYocs2VxLjgccpB7SnOb
sidebar_position: 41
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadStateV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadStateV2()

This operation gets detailed load-state information for a collection or partition. Use it when you need both the current load state and loading progress.

```java
public GetLoadStateResp getLoadStateV2(GetLoadStateReq request)
```

## Request Syntax\{#request-syntax}

```java
getLoadStateV2(GetLoadStateReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build());
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The database that contains the collection.

- `collectionName(String collectionName)`

    The collection whose load state is inspected.

- `partitionName(String partitionName)`

    An optional partition name. Omit it to inspect the collection-level load state.

**RETURNS:**

*GetLoadStateResp*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when validation fails or the server returns an error for this operation.

## Example\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetLoadStateResp resp = client.getLoadStateV2(GetLoadStateReq.builder()
    .collectionName("book")
    .build());
System.out.println(resp.getState());
System.out.println(resp.getProgress());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
