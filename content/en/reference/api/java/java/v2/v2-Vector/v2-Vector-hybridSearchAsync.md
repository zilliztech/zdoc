---
title: "hybridSearchAsync() | Java | v2"
slug: /java/java/v2-Vector-hybridSearchAsync
sidebar_label: "hybridSearchAsync()"
beta: false
added_since: v3.0.7
last_modified: false
deprecate_since: false
notebook: false
description: "This operation runs hybrid search asynchronously. Use it to combine multiple ANN search requests, return immediately with a `CompletableFuture`, and process the merged result when it becomes available. | Java | v2"
type: docx
token: BqO8dsvRBoAZ5Mxgqhscqattnzh
sidebar_position: 17
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearchAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearchAsync()

This operation runs hybrid search asynchronously. Use it to combine multiple ANN search requests, return immediately with a `CompletableFuture`, and process the merged result when it becomes available.

```java
public CompletableFuture<SearchResp> hybridSearchAsync(HybridSearchReq request)
```

## Request Syntax\{#request-syntax}

```java
CompletableFuture<SearchResp> future = hybridSearchAsync(HybridSearchReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .limit(long limit)
    .outFields(List<String> outFields)
    .offset(long offset)
    .roundDecimal(int roundDecimal)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to search.

- `partitionNames(List<String> partitionNames)` -

    The partition names to search. If omitted, Milvus searches all loaded partitions.

- `searchRequests(List<AnnSearchReq> searchRequests)` -

    **[REQUIRED]**

    The ANN search requests to combine. Each request defines its own vector field, query vectors, filter, and search parameters.

- `limit(long limit)` -

    The maximum number of merged hits to return.

- `outFields(List<String> outFields)` -

    The fields to return for each merged hit.

- `offset(long offset)` -

    The number of merged hits to skip before returning results.

- `roundDecimal(int roundDecimal)` -

    The number of decimal places retained in returned distances. Use `-1` to keep the server default.

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    The consistency level for the hybrid search. If omitted, the collection or client default is used.

- `groupByFieldName(String groupByFieldName)` -

    The scalar field used to group merged hits.

- `groupSize(Integer groupSize)` -

    The maximum number of hits returned for each group.

- `strictGroupSize(Boolean strictGroupSize)` -

    Whether each returned group must contain exactly `groupSize()` hits when possible.

- `functionScore(FunctionScore functionScore)` -

    Function-based scoring configuration for reranking or combining results. Use this instead of the deprecated `ranker()` API.

**RETURNS:**

*CompletableFuture&lt;SearchResp&gt;*

The future completes with a `SearchResp` when hybrid search succeeds, or completes exceptionally if the RPC fails or Milvus returns an error.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised synchronously if the client is closed before the request can be submitted.

- **MilvusClientException**

    This exception may complete the future exceptionally when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;

AnnSearchReq titleSearch = AnnSearchReq.builder()
    .vectorFieldName("title_vector")
    .vectors(Collections.singletonList(new FloatVec(new float[] {0.12f, 0.34f, 0.56f})))
    .limit(20)
    .build();

AnnSearchReq bodySearch = AnnSearchReq.builder()
    .vectorFieldName("body_vector")
    .vectors(Collections.singletonList(new FloatVec(new float[] {0.22f, 0.44f, 0.66f})))
    .limit(20)
    .build();

CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
    .collectionName("book_catalog")
    .searchRequests(Arrays.asList(titleSearch, bodySearch))
    .functionScore(new RRFRanker(60))
    .limit(10)
    .outFields(Arrays.asList("id", "title"))
    .build());

SearchResp resp = future.join();
System.out.println(resp.getSearchResults().size());
```
