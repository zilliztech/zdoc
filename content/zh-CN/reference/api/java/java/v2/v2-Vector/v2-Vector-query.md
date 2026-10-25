---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作按主键或过滤条件查询 Entity，并可通过 `orderByFields` 进行可选排序。 | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - query()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# query()

此操作按主键或过滤条件查询 Entity，并可通过 `orderByFields` 进行可选排序。

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

    Database 的名称。省略该参数时，默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionNames(List<String> partitionNames)`

    要查询的 Partition。

- `outputFields(List<String> outputFields)`

    每个返回行中包含的字段。

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

    是否忽略正在增长的 Segment。

- `timezone(String timezone)`

    用于解释时间表达式的时区。

- `orderByFields(List<OrderByField> orderByFields)`

    用于对匹配行排序的标量字段和排序方向。

- `queryParams(Map<String, Object> queryParams)`

    其他查询参数。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    替换到过滤表达式占位符中的值。

**返回类型：**

*QueryResp*

**返回：**

包含查询返回的行；如果提供了 orderByFields，这些行会按其排序，同时还包含执行指标（`getCost()`、`getScannedRemoteBytes()`、`getScannedTotalBytes()` 和 `getCacheHitRatio()`）。对于 struct-array 元素级查询（通过 `element_filter`），每个返回的 `QueryResult` 都会通过 `getElementOffset()` 携带匹配元素的索引。

**参数：**

- **queryResults** （*List&lt;QueryResp.QueryResult&gt;*） -

    查询结果列表，其中每项包含以下字段：

- **entity** （*Map&lt;String,Object&gt;*） -

    包含匹配 Entity 的字段名和值的映射。

- **elementOffset** （*Long*） -

    对于 struct-array 元素级查询，匹配元素在该数组中的索引。普通查询下为 Null。

- **sessionTs** （*long*） -

    此次读取的会话时间戳。

- **cost** （*Long*） -

    操作的时间开销。

- **scannedRemoteBytes** （*Long*） -

    查询期间远程扫描的字节数。

- **scannedTotalBytes** （*Long*） -

    查询期间扫描的总字节数。

- **cacheHitRatio** （*Float*） -

    查询的缓存命中率。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时抛出。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何针对 Milvus 调用 query()。

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
