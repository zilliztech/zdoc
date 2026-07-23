---
title: "getFlushAllState() | Java | v2"
slug: /java/java/v2-Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a previous flush-all action has finished. Use it when you call `flushAll` asynchronously and need to poll for completion. | Java | v2"
type: docx
token: U55Vd0IR9oz8m9xS76scr4KDnNh
sidebar_position: 24
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFlushAllState()

This operation checks whether a previous flush-all action has finished. Use it when you call `flushAll` asynchronously and need to poll for completion.

```java
public GetFlushAllStateResp getFlushAllState(GetFlushAllStateReq request)
```

## Request Syntax\{#request-syntax}

```java
getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName(String databaseName)
    .flushAllTs(Long flushAllTs)
    .build());
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The database used when `flushAll` was called.

- `flushAllTs(Long flushAllTs)`

    The flush-all timestamp returned by `flushAll`.

**RETURNS:**

*GetFlushAllStateResp*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when validation fails or the server returns an error for this operation.

## Example\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FlushAllResp flush = client.flushAll(FlushAllReq.builder()
    .databaseName("default")
    .build());
GetFlushAllStateResp state = client.getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName("default")
    .flushAllTs(flush.getFlushAllTs())
    .build());
System.out.println(state.getFlushed());
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
