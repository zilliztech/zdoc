---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "按主键或过滤条件查询 Entity，并可通过 `orderByFields` 选择性地进行排序。 | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - query()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# query()

按主键或过滤条件查询 Entity，并可通过 `orderByFields` 选择性地进行排序。

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

    Database 的名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `clusterId(String clusterId)`

    此请求对应的 Zilliz Cloud 集群 ID。

- `partitionNames(List<String> partitionNames)`

    要查询的 Partition。

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

    是否忽略增长中的 Segment。

- `timezone(String timezone)`

    用于解释时间表达式的时区。

- `orderByFields(List<OrderByField> orderByFields)`

    用于对匹配行排序的标量字段及方向。

- `queryParams(Map<String, Object> queryParams)`

    附加查询参数。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    替换过滤表达式中占位符的值。

**返回：**

*QueryResp*

包含查询结果行；如果提供了 orderByFields，则结果将按其排序。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何针对 Zilliz Cloud 集群使用 query()。

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
