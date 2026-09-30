---
title: "getAsync() | Java | v2"
slug: /java/java/v2-Vector-getAsync
sidebar_label: "getAsync()"
beta: false
added_since: v3.0.7
last_modified: false
deprecate_since: false
notebook: false
description: "This operation retrieves entities by primary key asynchronously. Use it when an application needs to overlap a point lookup with other work or compose the result with other `CompletableFuture` tasks. | Java | v2"
type: docx
token: BvuWd2mJUotj3kxXhbqczE9Zn3U
sidebar_position: 15
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

This operation retrieves entities by primary key asynchronously. Use it when an application needs to overlap a point lookup with other work or compose the result with other `CompletableFuture` tasks.

```java
public CompletableFuture<GetResp> getAsync(GetReq request)
```

## Request Syntax\{#request-syntax}

```java
CompletableFuture<GetResp> future = getAsync(GetReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .partitionNames(List<String> partitionNames)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to read from.

- `partitionName(String partitionName)` -

    The name of one partition to read from. Use either `partitionName()` or `partitionNames()` when the lookup should be limited to specific partitions.

- `partitionNames(List<String> partitionNames)` -

    The names of multiple partitions to read from.

- `ids(List<Object> ids)` -

    **[REQUIRED]**

    The primary key values of the entities to retrieve. Values must match the primary-key field type of the collection.

- `outputFields(List<String> outputFields)` -

    The scalar and vector fields to return for each entity. If omitted, Milvus returns the default output fields.

**RETURNS:**

*CompletableFuture&lt;GetResp&gt;*

The future completes with a `GetResp` when the lookup succeeds, or completes exceptionally if the RPC fails or Milvus returns an error.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised synchronously if the client is closed before the request can be submitted.

- **MilvusClientException**

    This exception may complete the future exceptionally when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

CompletableFuture<GetResp> future = client.getAsync(GetReq.builder()
    .collectionName("book_catalog")
    .ids(Arrays.asList(1001L, 1002L))
    .outputFields(Arrays.asList("id", "title", "category"))
    .build());

GetResp resp = future.join();
System.out.println(resp.getGetResults().size());
```
