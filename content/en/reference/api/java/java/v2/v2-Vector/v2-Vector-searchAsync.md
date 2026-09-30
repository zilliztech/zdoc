---
title: "searchAsync() | Java | v2"
slug: /java/java/v2-Vector-searchAsync
sidebar_label: "searchAsync()"
beta: false
added_since: v3.0.7
last_modified: false
deprecate_since: false
notebook: false
description: "This operation searches vector data asynchronously. Use it when an application needs to issue vector search without blocking the current thread, or when multiple searches should be composed concurrently. | Java | v2"
type: docx
token: DONndM4QbouPN1xdGujcWedRnXb
sidebar_position: 19
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - searchAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# searchAsync()

This operation searches vector data asynchronously. Use it when an application needs to issue vector search without blocking the current thread, or when multiple searches should be composed concurrently.

```java
public CompletableFuture<SearchResp> searchAsync(SearchReq request)
```

## Request Syntax\{#request-syntax}

```java
CompletableFuture<SearchResp> future = searchAsync(SearchReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .annsField(String annsField)
    .metricType(IndexParam.MetricType metricType)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .data(List<BaseVector> data)
    .ids(List<Object> ids)
    .offset(long offset)
    .limit(long limit)
    .roundDecimal(int roundDecimal)
    .searchParams(Map<String, Object> searchParams)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .orderByFields(List<OrderByField> orderByFields)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .functionChains(List<FunctionChain> functionChains)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .highlighter(Highlighter highlighter)
    .searchAggregation(SearchAggregation searchAggregation)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to search.

- `partitionNames(List<String> partitionNames)` -

    The partition names to search. If omitted, Milvus searches all loaded partitions.

- `annsField(String annsField)` -

    The vector field used for approximate nearest neighbor search.

- `metricType(IndexParam.MetricType metricType)` -

    The metric type used to compare query vectors with stored vectors. For available values, refer to `IndexParam.MetricType`.

- `filter(String filter)` -

    A scalar filter expression applied before or during vector search.

- `outputFields(List<String> outputFields)` -

    The fields to return for each search hit.

- `data(List<BaseVector> data)` -

    **[REQUIRED]**

    The query vectors. Each vector must match the dimension and data type of `annsField()`.

- `ids(List<Object> ids)` -

    Optional primary-key constraints for the search.

- `offset(long offset)` -

    The number of hits to skip before returning results.

- `limit(long limit)` -

    The maximum number of hits to return.

- `roundDecimal(int roundDecimal)` -

    The number of decimal places retained in returned distances. Use `-1` to keep the server default.

- `searchParams(Map<String, Object> searchParams)` -

    Index-specific search parameters such as `nprobe`, `ef`, or other values supported by the selected index.

- `consistencyLevel(ConsistencyLevel consistencyLevel)` -

    The consistency level for the search. If omitted, the collection or client default is used.

- `ignoreGrowing(boolean ignoreGrowing)` -

    Whether to ignore growing segments during search.

- `timezone(String timezone)` -

    The timezone used for time-related expression evaluation.

- `orderByFields(List<OrderByField> orderByFields)` -

    Sort definitions applied to search results when supported by the server.

- `groupByFieldName(String groupByFieldName)` -

    The scalar field used to group search hits.

- `groupSize(Integer groupSize)` -

    The maximum number of hits returned for each group.

- `strictGroupSize(Boolean strictGroupSize)` -

    Whether each returned group must contain exactly `groupSize()` hits when possible.

- `functionScore(FunctionScore functionScore)` -

    Function-based scoring configuration. Use this instead of the deprecated `ranker()` API.

- `functionChains(List<FunctionChain> functionChains)` -

    Function chains applied to ordinary search. This is mutually exclusive with `functionScore()`.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)` -

    Template values for placeholders in `filter()`.

- `highlighter(Highlighter highlighter)` -

    Highlighting configuration for text matches in search results.

- `searchAggregation(SearchAggregation searchAggregation)` -

    Aggregation configuration for grouped or summarized search output.

**RETURNS:**

*CompletableFuture&lt;SearchResp&gt;*

The future completes with a `SearchResp` when the search succeeds, or completes exceptionally if the RPC fails or Milvus returns an error.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised synchronously if the client is closed before the request can be submitted.

- **MilvusClientException**

    This exception may complete the future exceptionally when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;

CompletableFuture<SearchResp> future = client.searchAsync(SearchReq.builder()
    .collectionName("book_catalog")
    .annsField("embedding")
    .data(Collections.singletonList(new FloatVec(new float[] {0.12f, 0.34f, 0.56f})))
    .limit(5)
    .outputFields(Arrays.asList("id", "title"))
    .build());

SearchResp resp = future.join();
System.out.println(resp.getSearchResults().size());
```
