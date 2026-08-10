---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "执行向量搜索，并可选择结果排序、聚合请求与分桶，以及执行指标。 | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - rag llm 架构
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

执行向量搜索，并可选择结果排序、聚合请求与分桶，以及执行指标。

```java
public SearchResp search(SearchReq request)
```

## 请求语法\{#request-syntax}

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
    .filterTemplateValues(filterTemplateValues)
    .highlighter(highlighter)
    .searchAggregation(searchAggregation)
    .build();
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `clusterId(String clusterId)`

    此请求的 Zilliz Cloud 集群 ID。

- `partitionNames(List<String> partitionNames)`

    要搜索的 Partition。

- `annsField(String annsField)`

    用于近似最近邻搜索的向量字段。

- `topK(int topK)`

    从服务器请求的最近候选项数量。

- `filter(String filter)`

    标量过滤表达式。

- `outputFields(List<String> outputFields)`

    每个匹配结果中包含的 Entity 字段。

- `data(List<BaseVector> data)`

    查询向量。请勿与 ids 一起使用。

- `ids(List<Object> ids)`

    其存储向量将用作查询向量的主键。请勿与 data 一起使用。

- `offset(long offset)`

    要跳过的匹配结果数量。

- `limit(long limit)`

    每个查询返回的最大匹配结果数量。

- `roundDecimal(int roundDecimal)`

    用于对分数进行舍入的小数位数。

- `searchParams(Map<String, Object> searchParams)`

    索引特定的搜索参数。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    已弃用的保证时间戳。

- `gracefulTime(Long gracefulTime)`

    已弃用的宽松一致性时间窗口。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    搜索的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否忽略增长中的 Segment。

- `timezone(String timezone)`

    用于解释时间表达式的时区。

- `orderByFields(List<OrderByField> orderByFields)`

    用于对搜索结果排序的标量字段和方向。

- `groupByFieldName(String groupByFieldName)`

    用于对匹配 Entity 分组的字段。

- `groupSize(Integer groupSize)`

    每组返回的最大 Entity 数量。

- `strictGroupSize(Boolean strictGroupSize)`

    每个返回的组是否都必须包含 groupSize 个 Entity。

- `functionScore(FunctionScore functionScore)`

    应用于搜索结果的评分函数。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    替换到过滤表达式占位符中的值。

- `highlighter(Highlighter highlighter)`

    返回字段的文本高亮配置。

- `searchAggregation(SearchAggregation searchAggregation)`

    聚合字段、指标、排序、top hits 和嵌套聚合配置。

**返回：**

*SearchResp*

包含搜索结果、召回率、开销、扫描字节数、缓存命中率和聚合分桶。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示针对 Zilliz Cloud 集群执行 search()。

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
