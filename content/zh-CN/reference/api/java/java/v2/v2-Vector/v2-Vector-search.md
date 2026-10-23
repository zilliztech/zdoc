---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量搜索，支持可选的结果排序、聚合请求和聚合桶以及执行指标。 | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - 词法搜索
  - 最近邻搜索
  - 智能体 RAG
  - RAG LLM 架构
  - Zilliz
  - Zilliz Cloud
  - 云
  - search()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# search()

此操作执行向量搜索，支持可选的结果排序、聚合请求和聚合桶以及执行指标。

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
    .functionChains(functionChains)
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

- `partitionNames(List<String> partitionNames)`

    要搜索的 Partition。

- `annsField(String annsField)`

    用于近似最近邻搜索的向量字段。

- `metricType(IndexParam.MetricType metricType)`

    用于度量向量相似度的度量类型。

- `topK(int topK)`

    向服务器请求的最近候选数量。

- `filter(String filter)`

    标量过滤表达式。

- `outputFields(List<String> outputFields)`

    每个匹配项包含的 Entity 字段。

- `data(List<BaseVector> data)`

    查询向量。请勿与 ids 一起使用。

- `ids(List<Object> ids)`

    存储的向量用作查询向量的主键。请勿与 data 一起使用。

- `offset(long offset)`

    要跳过的匹配项数量。

- `limit(long limit)`

    每个查询返回的最大匹配项数量。

- `roundDecimal(int roundDecimal)`

    用于对得分进行舍入的小数位数。

- `searchParams(Map<String, Object> searchParams)`

    特定索引的搜索参数。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    已弃用的保证时间戳。

- `gracefulTime(Long gracefulTime)`

    已弃用的宽限一致性窗口。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    搜索的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否忽略正在增长的 Segment。

- `timezone(String timezone)`

    用于解释时间表达式的时区。

- `orderByFields(List<OrderByField> orderByFields)`

    用于对搜索结果排序的标量字段和方向。

- `groupByFieldName(String groupByFieldName)`

    用于对匹配 Entity 分组的字段。

- `groupSize(Integer groupSize)`

    每组返回的最大 Entity 数量。

- `strictGroupSize(Boolean strictGroupSize)`

    每个返回的分组是否必须包含 groupSize 个 Entity。

- `functionScore(FunctionScore functionScore)`

    应用于搜索结果的评分函数。

- `ranker(CreateCollectionReq.Function ranker)`

    应用于搜索结果的单个重排函数。请勿与 `functionScore()` 或 `functionChains()` 一起使用。

- `functionChains(List<FunctionChain> functionChains)`

    应用于搜索后处理的函数链。函数链与重排（`ranker()`/`functionScore()`）不能一起使用。请参见 FunctionChain。

- `addFunctionChain(FunctionChain functionChain)`

    向搜索请求追加一个函数链。函数链与重排（`ranker()`/`functionScore()`）不能一起使用。请参见 FunctionChain。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    替换到过滤表达式中占位符的值。

- `highlighter(Highlighter highlighter)`

    返回字段的文本高亮配置。

- `searchAggregation(SearchAggregation searchAggregation)`

    聚合字段、指标、排序、顶部命中结果和嵌套聚合配置。

**返回类型：**

*SearchResp*

**返回值：**

包含搜索结果、召回率、开销、扫描字节数、缓存命中率和聚合桶。

**参数：**

- **searchResults** （*List&lt;List&lt;SearchResult&gt;&gt;*） -

    搜索结果批次列表，每个查询向量对应一个批次，每个批次包含具有以下字段的 **SearchResult** 条目：

- **id** （*Object*） -

    匹配 Entity 的主键值。

- **score** （*Float*） -

    匹配项的相关性得分。

- **entity** （*Map&lt;String,Object&gt;*） -

    包含匹配 Entity 的字段名称和值的映射。

- **primaryKey** （*String*） -

    主键字段的名称。

- **highlightResults** （*Map&lt;String,HighlightResult&gt;*） -

    以字段名称为键的高亮结果，仅在请求高亮时返回。

- **sessionTs** （*long*） -

    读取操作的会话时间戳。

- **recalls** （*List&lt;Float&gt;*） -

    报告时每个查询向量的召回率。

- **cost** （*Long*） -

    操作的时间开销。

- **scannedRemoteBytes** （*Long*） -

    搜索期间远程扫描的字节数。

- **scannedTotalBytes** （*Long*） -

    搜索期间扫描的总字节数。

- **cacheHitRatio** （*Float*） -

    搜索的缓存命中率。

- **aggregationBuckets** （*List&lt;List&lt;AggregationBucket&gt;&gt;*） -

    按查询向量分组的聚合桶，仅在请求聚合时返回。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示如何对 Milvus 执行 search()。

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
