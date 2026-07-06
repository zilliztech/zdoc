---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a scalar filtering with a specified boolean expression. | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# query()

This operation conducts a scalar filtering with a specified boolean expression.

```java
public QueryResp query(QueryReq request)
```

## Request Syntax\{#request-syntax}

```java
query(QueryReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .ids(List<Object> ids)
    .filter(String filter)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .queryParams(Map<String, Object> queryParams)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
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

- `outputFields(List<String> outputFields)`

    A list of field names to include in the output.

- `ids(List<Object> ids)`

    A list of primary key values to identify specific entities.

- `filter(String filter)`

    A boolean expression to filter results.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level for the operation.

- `offset(long offset)`

    The number of results to skip before returning.

- `limit(long limit)`

    The maximum number of results to return.

- `ignoreGrowing(boolean ignoreGrowing)`

    Whether to ignore growing segments during the operation.

- `timezone(String timezone)`

    The timezone string for time-related filters.

- `queryParams(Map<String, Object> queryParams)`

    Additional query parameters as key-value pairs. Defaults to `new HashMap<>()`.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    A map of template variable values for parameterized filters.

**RETURNS:**

*QueryResp*

A **QueryResp** object representing specific query results with the specified output fields

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Query by filter "id < 10"
QueryReq queryReq = QueryReq.builder()
        .collectionName("test")
        .filter("id < 10")
        .build();
QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getGetResults()) {
    System.out.println(result.getEntity());
}
```
