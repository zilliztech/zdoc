---
title: "queryAsync() | Java | v2"
slug: /java/java/v2-Vector-queryAsync
sidebar_label: "queryAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Queries entities in a collection asynchronously and returns a future. | Java | v2"
type: docx
token: PWzJdbh5ZoT8K7xo1j4cbvNsnWe
sidebar_position: 16
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - queryAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryAsync()

Queries entities in a collection asynchronously and returns a future.

```java
public CompletableFuture<QueryResp> queryAsync(QueryReq request)
```

This method uses the same request parameters as `query()` but returns a `CompletableFuture<QueryResp>` immediately. Use the returned future to consume the result or handle the exceptional completion when the operation fails.

## Request Syntax\{#request-syntax}

```java
CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
    .collectionName(String collectionName)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .build());
```

For the full list of `QueryReq` builder methods, refer to [query()](./v2-Vector-query).

**RETURN TYPE:**

*CompletableFuture&lt;QueryResp&gt;*

**RETURNS:**

A future completed with a `QueryResp`, or completed exceptionally when the operation fails.

**PARAMETERS:**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    A list of query results, each of which contains the following fields:

    - **entity** (*Map&lt;String,Object&gt;*) -

        A map that contains the field names and values of the matched entity.

    - **elementOffset** (*Long*) -

        For struct-array element-level queries, the matched element's index within the array. Null for ordinary queries.

- **sessionTs** (*long*) -

    The session timestamp of the read.

- **cost** (*Long*) -

    The time cost of the operation.

- **scannedRemoteBytes** (*Long*) -

    The number of bytes scanned remotely during the query.

- **scannedTotalBytes** (*Long*) -

    The total number of bytes scanned during the query.

- **cacheHitRatio** (*Float*) -

    The cache hit ratio of the query.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when request validation, transport, or server execution fails.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
        .collectionName("my_collection")
        .filter("age > 20")
        .outputFields(Arrays.asList("name", "age"))
        .build());
QueryResp response = future.get();
```
