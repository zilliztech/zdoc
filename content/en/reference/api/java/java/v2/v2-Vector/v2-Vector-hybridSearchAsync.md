---
title: "hybridSearchAsync() | Java | v2"
slug: /java/java/v2-Vector-hybridSearchAsync
sidebar_label: "hybridSearchAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation runs a multi-vector similarity search with a ranker asynchronously and returns a future. | Java | v2"
type: docx
token: BqO8dsvRBoAZ5Mxgqhscqattnzh
sidebar_position: 15
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

This operation runs a multi-vector similarity search with a ranker asynchronously and returns a future.

```java
public CompletableFuture<SearchResp> hybridSearchAsync(HybridSearchReq request)
```

This method uses the same request parameters as `hybridSearch()` but returns a `CompletableFuture<SearchResp>` immediately. Use the returned future to consume the result or handle the exceptional completion when the operation fails.

## Request Syntax\{#request-syntax}

```java
CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
    .collectionName(String collectionName)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .ranker(FunctionScore ranker)
    .limit(long limit)
    .build());
```

For the full list of `HybridSearchReq` builder methods, refer to hybridSearch().

**RETURN TYPE:**

*CompletableFuture&lt;SearchResp&gt;*

**RETURNS:**

A future completed with a `SearchResp`, or completed exceptionally when the operation fails.

**PARAMETERS:**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    A list of search result batches, one per query vector, each containing **SearchResult** entries with the following fields:

    - **id** (*Object*) -

        The primary key value of the matched entity.

    - **score** (*Float*) -

        The relevance score of the match after reranking.

    - **entity** (*Map&lt;String,Object&gt;*) -

        A map that contains the field names and values of the matched entity.

    - **primaryKey** (*String*) -

        The name of the primary key field.

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        The highlight results keyed by field name, when highlighting is requested.

    - **elementOffset** (*Long*) -

        For struct-array element-level matches (via `element_filter`), the matched element's index within the array. Null for ordinary matches.

- **sessionTs** (*long*) -

    The session timestamp of the read.

- **recalls** (*List&lt;Float&gt;*) -

    The recall of each query vector, when reported.

- **cost** (*Long*) -

    The time cost of the operation.

- **scannedRemoteBytes** (*Long*) -

    The number of bytes scanned remotely during the search.

- **scannedTotalBytes** (*Long*) -

    The total number of bytes scanned during the search.

- **cacheHitRatio** (*Float*) -

    The cache hit ratio of the search.

- **aggregationBuckets** (*List&lt;List&lt;AggregationBucket&gt;&gt;*) -

    The aggregation buckets grouped by query vector, when an aggregation is requested.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when request validation, transport, or server execution fails.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(Arrays.asList(
                AnnSearchReq.builder()
                        .vectorFieldName("dense_vector")
                        .vectors(Collections.singletonList(queryVector))
                        .build(),
                AnnSearchReq.builder()
                        .vectorFieldName("sparse_vector")
                        .vectors(Collections.singletonList(sparseVector))
                        .build()))
        .build());
SearchResp response = future.get();
```
