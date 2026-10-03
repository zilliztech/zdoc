---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Performs vector search with optional result ordering, aggregation requests and buckets, and execution metrics. | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# search()

Performs vector search with optional result ordering, aggregation requests and buckets, and execution metrics.

```java
public SearchResp search(SearchReq request)
```

## Request Syntax\{#request-syntax}

```java
SearchReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .clusterId(clusterId)
    .partitionNames(partitionNames)
    .annsField(annsField)
    .topK(topK)
    .filter(filter)
    .outputFields(outputFields)
    .data(data)
    .ids(ids)
    .offset(offset)
    .limit(limit)
    .roundDecimal(roundDecimal)
    .searchParams(searchParams)
    .guaranteeTimestamp(guaranteeTimestamp)
    .gracefulTime(gracefulTime)
    .consistencyLevel(consistencyLevel)
    .ignoreGrowing(ignoreGrowing)
    .timezone(timezone)
    .orderByFields(orderByFields)
    .groupByFieldName(groupByFieldName)
    .groupSize(groupSize)
    .strictGroupSize(strictGroupSize)
    .functionScore(functionScore)
    .functionChains(functionChains)
    .filterTemplateValues(filterTemplateValues)
    .highlighter(highlighter)
    .searchAggregation(searchAggregation)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `collectionName(String collectionName)`

    The name of the target collection.

- `partitionNames(List<String> partitionNames)`

    The partitions to search.

- `annsField(String annsField)`

    The vector field used for approximate nearest-neighbor search.

- `metricType(IndexParam.MetricType metricType)`

    The metric type used to measure vector similarity.

- `topK(int topK)`

    The number of nearest candidates requested from the server.

- `filter(String filter)`

    A scalar filtering expression.

- `outputFields(List<String> outputFields)`

    The entity fields included with each match.

- `data(List<BaseVector> data)`

    The query vectors. Do not use together with ids.

- `ids(List<Object> ids)`

    Primary keys whose stored vectors are used as query vectors. Do not use together with data.

- `offset(long offset)`

    The number of matches to skip.

- `limit(long limit)`

    The maximum number of matches returned for each query.

- `roundDecimal(int roundDecimal)`

    The number of decimal places used to round scores.

- `searchParams(Map<String, Object> searchParams)`

    Index-specific search parameters.

- `guaranteeTimestamp(long guaranteeTimestamp)`

    Deprecated guarantee timestamp.

- `gracefulTime(Long gracefulTime)`

    Deprecated graceful consistency window.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level for the search.

- `ignoreGrowing(boolean ignoreGrowing)`

    Whether to ignore growing segments.

- `timezone(String timezone)`

    The timezone used to interpret temporal expressions.

- `orderByFields(List<OrderByField> orderByFields)`

    The scalar fields and directions used to order search results.

- `groupByFieldName(String groupByFieldName)`

    The field used to group matching entities.

- `groupSize(Integer groupSize)`

    The maximum number of entities returned per group.

- `strictGroupSize(Boolean strictGroupSize)`

    Whether every returned group must contain groupSize entities.

- `functionScore(FunctionScore functionScore)`

    The scoring functions applied to the search results.

- `ranker(CreateCollectionReq.Function ranker)`

    A single rerank function applied to the search results. Do not use together with `functionScore()` or `functionChains()`.

- `functionChains(List<FunctionChain> functionChains)`

    The function chains applied to post-process the search results. Function chains and rerank (`ranker()`/`functionScore()`) cannot be used together. See FunctionChain.

- `addFunctionChain(FunctionChain functionChain)`

    Appends one function chain to the search request. Function chains and rerank (`ranker()`/`functionScore()`) cannot be used together. See FunctionChain.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    Values substituted into placeholders in the filter expression.

- `highlighter(Highlighter highlighter)`

    Text-highlighting configuration for returned fields.

- `searchAggregation(SearchAggregation searchAggregation)`

    Aggregation fields, metrics, ordering, top hits, and nested aggregation configuration.

**RETURN TYPE:**

*SearchResp*

**RETURNS:**

Contains search results, recalls, cost, scanned byte counts, cache hit ratio, and aggregation buckets.

**PARAMETERS:**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    A list of search result batches, one per query vector, each containing **SearchResult** entries with the following fields:

    - **id** (*Object*) -

        The primary key value of the matched entity.

    - **score** (*Float*) -

        The relevance score of the match.

    - **entity** (*Map&lt;String,Object&gt;*) -

        A map that contains the field names and values of the matched entity.

    - **primaryKey** (*String*) -

        The name of the primary key field.

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        The highlight results keyed by field name, when highlighting is requested.

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

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

Demonstrates search() against Milvus.

```java
SearchResp response = client.search(SearchReq.builder()
    .collectionName("books")
    .clusterId(CLUSTER_ID)
    .data(Collections.singletonList(queryVector))
    .annsField("embedding")
    .searchAggregation(SearchAggregation.builder()
        .fields(Collections.singletonList("category"))
        .size(10)
        .build())
    .limit(10)
    .build());
```
