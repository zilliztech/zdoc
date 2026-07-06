---
title: "searchIterator() | Java | v2"
slug: /java/java/v2-Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "(placeholder) | Java | v2"
type: docx
token: X7Ybdk6yRoVRPZxeHklct1i2n8c
sidebar_position: 8
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - searchIterator()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# searchIterator()

# searchIterator()\{#searchiterator}

This method returns a search iterator to iterate search results.

```java
public SearchIterator searchIterator(SearchIteratorReq request)
```

## Request Syntax\{#request-syntax}

```java
searchIterator(SearchIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .vectorFieldName(String vectorFieldName)
    .topK(int topK)
    .limit(long limit)
    .expr(String expr)
    .outputFields(List<String> outputFields)
    .vectors(List<BaseVector> vectors)
    .roundDecimal(int roundDecimal)
    .params(String params)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .groupByFieldName(String groupByFieldName)
    .batchSize(long batchSize)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)`

    The name of the target collection.

- `clusterId(String clusterId)`

    The target cluster ID for this vector read request. Use `session(String clusterId)` when multiple requests should share the same cluster ID.

- `partitionNames(List<String> partitionNames)`

    A list of partition names to target.

- `vectorFieldName(String vectorFieldName)`

    The name of the vector field.

- `topK(int topK)`

    The number of top results to return.

- `limit(long limit)`

    The maximum number of results to return.

- `expr(String expr)`

    A boolean expression to filter results.

- `outputFields(List<String> outputFields)`

    A list of field names to include in the output.

- `vectors(List<BaseVector> vectors)`

    A list of vectors to search with.

- `roundDecimal(int roundDecimal)`

    The number of decimal places for distance/score rounding.

- `params(String params)`

    Additional search parameters as a JSON string.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level for the operation.

- `ignoreGrowing(boolean ignoreGrowing)`

    Whether to ignore growing segments during the operation.

- `groupByFieldName(String groupByFieldName)`

    The field name to group search results by.

- `batchSize(long batchSize)`

    The batch size for iterator operations.

**RETURNS:**

*SearchIterator*

A *SearchIterator* object to iterate search results, which offers the following methods:

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.orm.iterator.SearchIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchIteratorReq;
import io.milvus.v2.service.vector.request.data.FloatVec;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Iterator search
List<Float> vector = generateFloatVector();
SearchIterator searchIterator = client.searchIterator(SearchIteratorReq.builder()
        .collectionName("test")
        .outputFields(Lists.newArrayList("vector"))
        .batchSize(50L)
        .vectorFieldName("vector")
        .vectors(Collections.singletonList(new FloatVec(vector)))
        .expr("id > 100")
        .params("{\"range_filter\": 15.0, \"radius\": 20.0}")
        .topK(300)
        .metricType(IndexParam.MetricType.L2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

System.out.println("SearchIteratorV1 results:");
while (true) {
    List<QueryResultsWrapper.RowRecord> res = searchIterator.next();
    if (res.isEmpty()) {
        System.out.println("Search iteration finished, close");
        searchIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}
```
