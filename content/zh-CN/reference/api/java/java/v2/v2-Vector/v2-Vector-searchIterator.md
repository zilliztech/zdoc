---
title: "searchIterator() | Java | v2"
slug: /java/java/v2-Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会返回搜索迭代器，用于迭代搜索结果。 | Java | v2"
type: docx
token: X7Ybdk6yRoVRPZxeHklct1i2n8c
sidebar_position: 8
keywords: 
  - 大语言模型评估
  - 稀疏向量与稠密向量
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - searchIterator()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# searchIterator()

此操作会返回搜索迭代器，用于迭代搜索结果。

```java
public SearchIterator searchIterator(SearchIteratorReq request)
```

## 请求语法\{#request-syntax}

```java
searchIterator(SearchIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .vectorFieldName(String vectorFieldName)
    .metricType(IndexParam.MetricType metricType)
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

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。如果未指定，则默认为当前 Database。

- `clusterId(String clusterId)`

    **已弃用。** 要查询的集群的 ID。适用于 global-cluster 部署。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionNames(List<String> partitionNames)`

    要作为目标的 Partition 名称列表。

- `vectorFieldName(String vectorFieldName)`

    向量字段的名称。

- `metricType(IndexParam.MetricType metricType)`

    用于度量向量相似度的度量类型。

- `topK(int topK)`

    要返回的排名靠前结果的数量。

- `limit(long limit)`

    要返回的结果的最大数量。

- `expr(String expr)`

    用于过滤结果的布尔表达式。

- `outputFields(List<String> outputFields)`

    要包含在输出中的字段名称列表。

- `vectors(List<BaseVector> vectors)`

    用于搜索的向量列表。

- `roundDecimal(int roundDecimal)`

    距离/score 舍入的小数位数。

- `params(String params)`

    作为 JSON 字符串提供的其他搜索参数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否在操作期间忽略 growing Segment。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名称。

- `batchSize(long batchSize)`

    迭代器操作的批大小。

**返回类型：**

*SearchIterator*

**返回：**

用于迭代搜索结果的 **SearchIterator** 对象，它提供以下方法：

**参数：**

- **next()** (*List&lt;QueryResultsWrapper.RowRecord&gt;*) -

    返回与搜索表达式匹配的下一批结果。

- **close()** -

    释放迭代器及其游标占用的资源。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.orm.iterator.SearchIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchIteratorReq;
import io.milvus.v2.service.vector.request.data.FloatVec;

import com.google.common.collect.Lists;
import java.util.Collections;
import java.util.List;
import java.util.Set;

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
