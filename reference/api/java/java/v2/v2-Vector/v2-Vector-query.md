---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Queries entities by primary key or filter, with optional ordering through `orderByFields`. | Java | v2"
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

Queries entities by primary key or filter, with optional ordering through `orderByFields`.

```java
public QueryResp query(QueryReq request)
```

## Request Syntax\{#request-syntax}

```java
QueryReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .clusterId(clusterId)
    .partitionNames(partitionNames)
    .outputFields(outputFields)
    .ids(ids)
    .filter(filter)
    .consistencyLevel(consistencyLevel)
    .offset(offset)
    .limit(limit)
    .ignoreGrowing(ignoreGrowing)
    .timezone(timezone)
    .orderByFields(orderByFields)
    .queryParams(queryParams)
    .filterTemplateValues(filterTemplateValues)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database. Defaults to the current database when omitted.

- `collectionName(String collectionName)`

    The name of the target collection.

- `clusterId(String clusterId)`

    The Zilliz Cloud cluster ID for this request.

- `partitionNames(List<String> partitionNames)`

    The partitions to query.

- `outputFields(List<String> outputFields)`

    The fields to include in each returned row.

- `ids(List<Object> ids)`

    Primary-key values to query.

- `filter(String filter)`

    A scalar filtering expression.

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    The consistency level for the query.

- `offset(long offset)`

    The number of matching rows to skip.

- `limit(long limit)`

    The maximum number of rows to return.

- `ignoreGrowing(boolean ignoreGrowing)`

    Whether to ignore growing segments.

- `timezone(String timezone)`

    The timezone used to interpret temporal expressions.

- `orderByFields(List<OrderByField> orderByFields)`

    The scalar fields and directions used to order matching rows.

- `queryParams(Map<String, Object> queryParams)`

    Additional query parameters.

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    Values substituted into placeholders in the filter expression.

**RETURNS:**

*QueryResp*

Contains query rows ordered according to orderByFields when provided.

**EXCEPTIONS:**

- **MilvusClientException**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

Demonstrates query() against a Zilliz Cloud cluster.

```java
QueryResp response = client.query(QueryReq.builder()
    .collectionName("books")
    .clusterId(CLUSTER_ID)
    .orderByFields(Collections.singletonList(OrderByField.builder()
        .fieldName("published_year")
        .direction(AggDirection.DESC)
        .build()))
    .limit(10)
    .build());
```
