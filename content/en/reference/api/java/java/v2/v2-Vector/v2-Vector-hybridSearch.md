---
title: "hybridSearch() | Java | v2"
slug: /java/java/v2-Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation performs multi-vector search on a collection and returns search results after reranking. | Java | v2"
type: docx
token: R1NDdFPnVo4wTuxvHjFcozc8nMa
sidebar_position: 3
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

This operation performs multi-vector search on a collection and returns search results after reranking.

```java
public SearchResp hybridSearch(HybridSearchReq request)
```

## Request Syntax\{#request-syntax}

```java
hybridSearch(HybridSearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .topK(int topK)
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

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database if not specified.

- `clusterId(String clusterId)`

    **Deprecated.** The ID of the cluster to query. Applies to global-cluster deployments.

- `collectionName(String collectionName)`

    The name of the target collection.

- `partitionNames(List<String> partitionNames)`

    A list of partition names to target.

- `searchRequests(List<AnnSearchReq> searchRequests)`

    A list of AnnSearchReq objects for hybrid search.

- `topK(int topK)`

    The number of top results to return.

- `limit(long limit)`

    The maximum number of results to return.

- `outFields(List<String> outFields)`

    A list of field names to include in the output.

- `offset(long offset)`

    The number of results to skip before returning.

- `roundDecimal(int roundDecimal)`

    The number of decimal places for distance/score rounding.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level for the operation.

- `groupByFieldName(String groupByFieldName)`

    The field name to group search results by.

- `groupSize(Integer groupSize)`

    The number of results to return per group.

- `strictGroupSize(Boolean strictGroupSize)`

    Whether to strictly enforce the group size.

- `functionScore(FunctionScore functionScore)`

    A FunctionScore object for custom scoring.

- `ranker(CreateCollectionReq.Function ranker)`

    **Deprecated.** A single rerank function applied to the search results. Prefer `functionScore()`.

**RETURN TYPE:**

*SearchResp*

**RETURNS:**

A **SearchResp** object containing the merged results from all query vectors, ordered by the reranking strategy.

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

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Build ANN search requests for multiple vector fields
List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("float_vector")
        .vectors(floatVectors)
        .params("{\"nprobe\": 10}")
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("binary_vector")
        .vectors(binaryVectors)
        .limit(50)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse_vector")
        .vectors(sparseVectors)
        .limit(100)
        .build());

// Hybrid search with WeightedRanker via FunctionScore
SearchResp searchResp = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(searchRequests)
        .functionScore(FunctionScore.builder()
                .addFunction(WeightedRanker.builder()
                        .weights(Arrays.asList(0.2f, 0.5f, 0.6f))
                        .build())
                .build())
        .limit(5)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```
