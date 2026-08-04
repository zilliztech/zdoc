---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "按主键或过滤条件查询实体，并可通过 `orderByFields` 进行可选排序。 | Java | v2"
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

按主键或过滤条件查询实体，并可通过 `orderByFields` 进行可选排序。

```java
public QueryResp query(QueryReq request)
```

## 请求语法\{#request-syntax}

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

**构建器方法：**

- `databaseName(String databaseName)`

    数据库名称。省略时默认为当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `clusterId(String clusterId)`

    此请求对应的 Zilliz Cloud 集群 ID。

- `partitionNames(List<String> partitionNames)`

    要查询的分区。

- `outputFields(List<String> outputFields)`

    每个返回行中要包含的字段。

- `ids(List<Object> ids)`

    要查询的主键值。

- `filter(String filter)`

    标量过滤表达式。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    查询的一致性级别。

- `offset(long offset)`

    要跳过的匹配行数。

- `limit(long limit)`

    要返回的最大行数。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否忽略 growing segment。

- `timezone(String timezone)`

    用于解释时间表达式的时区。

- `orderByFields(List<OrderByField> orderByFields)`

    用于对匹配行排序的标量字段及其方向。

- `queryParams(Map<String, Object> queryParams)`

    其他查询参数。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    替换过滤表达式中占位符的值。

**返回：**

*QueryResp*

包含查询结果行；提供 `orderByFields` 时，将按其指定顺序排序。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时抛出。请检查异常消息以获取确切失败原因。

## 示例\{#example}

演示如何在 Zilliz Cloud 集群上使用 `query()`。

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
