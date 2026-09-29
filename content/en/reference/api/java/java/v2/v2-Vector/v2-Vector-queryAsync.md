---
title: "queryAsync() | Java | v2"
slug: /java/java/v2-Vector-queryAsync
sidebar_label: "queryAsync()"
beta: false
added_since: v3.0.7
last_modified: false
deprecate_since: false
notebook: false
description: "This operation queries entities asynchronously with a scalar filter, a primary-key list, or both. Use it when query latency should not block the caller thread. | Java | v2"
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

This operation queries entities asynchronously with a scalar filter, a primary-key list, or both. Use it when query latency should not block the caller thread.

```java
public CompletableFuture<QueryResp> queryAsync(QueryReq request)
```

## Request Syntax\{#request-syntax}

```java
CompletableFuture<QueryResp> future = queryAsync(QueryReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .ids(List<Object> ids)
    .filter(String filter)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .orderByFields(List<OrderByField> orderByFields)
    .queryParams(Map<String, Object> queryParams)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to query.

- `partitionNames(List<String> partitionNames)` -

    The partition names to query. If omitted, Milvus queries all loaded partitions.

- `outputFields(List<String> outputFields)` -

    The fields to return for each matched entity.

- `ids(List<Object> ids)` -

    Primary key values to query. Use this for exact entity retrieval when the primary keys are known.

- `filter(String filter)` -

    A boolean expression used to filter entities, such as `"price > 20 and category == 'database'"`.

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    The consistency level for the query. If omitted, the collection or client default is used.

- `offset(long offset)` -

    The number of matched entities to skip before returning results.

- `limit(long limit)` -

    The maximum number of entities to return.

- `ignoreGrowing(boolean ignoreGrowing)` -

    Whether to ignore growing segments during query.

- `timezone(String timezone)` -

    The timezone used for time-related expression evaluation.

- `orderByFields(List<OrderByField> orderByFields)` -

    Sort definitions for ordered query results.

- `queryParams(Map<String, Object> queryParams)` -

    Additional query parameters supported by the server.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)` -

    Template values for placeholders in `filter()`. Use this to avoid repeatedly parsing very large literal lists inside an expression.

**RETURNS:**

*CompletableFuture&lt;QueryResp&gt;*

The future completes with a `QueryResp` when the query succeeds, or completes exceptionally if the RPC fails or Milvus returns an error.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised synchronously if the client is closed before the request can be submitted.

- **MilvusClientException**

    This exception may complete the future exceptionally when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

CompletableFuture<QueryResp> future = client.queryAsync(QueryReq.builder()
    .collectionName("book_catalog")
    .filter("category == \"database\"")
    .outputFields(Arrays.asList("id", "title", "price"))
    .limit(20)
    .build());

future.thenAccept(resp ->
    System.out.println("Matched rows: " + resp.getQueryResults().size())
).join();
```
