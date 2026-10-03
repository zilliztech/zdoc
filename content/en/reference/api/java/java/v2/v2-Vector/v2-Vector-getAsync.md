---
title: "getAsync() | Java | v2"
slug: /java/java/v2-Vector-getAsync
sidebar_label: "getAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Gets specific entities by their IDs asynchronously and returns a future. | Java | v2"
type: docx
token: BvuWd2mJUotj3kxXhbqczE9Zn3U
sidebar_position: 13
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - getAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getAsync()

Gets specific entities by their IDs asynchronously and returns a future.

```java
public CompletableFuture<GetResp> getAsync(GetReq request)
```

This method uses the same request parameters as `get()` but returns a `CompletableFuture<GetResp>` immediately. Use the returned future to consume the result or handle the exceptional completion when the operation fails.

## Request Syntax\{#request-syntax}

```java
CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
    .collectionName(String collectionName)
    .ids(List<Object> ids)
    .build());
```

For the full list of `GetReq` builder methods, refer to [get()](./v2-Vector-get).

**RETURN TYPE:**

*CompletableFuture&lt;GetResp&gt;*

**RETURNS:**

A future completed with a `GetResp`, or completed exceptionally when the operation fails.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when request validation, transport, or server execution fails.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
        .collectionName("my_collection")
        .ids(Collections.singletonList("0"))
        .build());
GetResp response = future.get();
```
