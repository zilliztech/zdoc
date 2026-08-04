---
title: "SearchIteratorV2() | Java | v2"
slug: /java/java/v2-Vector-SearchIteratorV2
sidebar_label: "SearchIteratorV2()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个迭代器，供您遍历搜索结果。它尤其适用于搜索结果中包含大量数据的场景。 | Java | v2"
type: docx
token: ZouQdklUsoSZEDxWkJvc90pvnmg
sidebar_position: 11
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - SearchIteratorV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# SearchIteratorV2()

此操作会创建一个迭代器，供您遍历搜索结果。它尤其适用于搜索结果中包含大量数据的场景。

```java
public SearchIteratorV2 searchIteratorV2(SearchIteratorReqV2 request)
```

## 请求语法\{#request-syntax}

```java
searchIteratorV2(SearchIteratorReqV2.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .vectorFieldName(String vectorFieldName)
    .topK(int topK)
    .limit(long limit)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .vectors(List<BaseVector> vectors)
    .roundDecimal(int roundDecimal)
    .searchParams(Map<String, Object> searchParams)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .groupByFieldName(String groupByFieldName)
    .batchSize(long batchSize)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)`

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `clusterId(String clusterId)`

    此向量读取请求的目标集群 ID。当多个请求需要共享相同的集群 ID 时，请使用 `session(String clusterId)`。

- `partitionNames(List<String> partitionNames)`

    要指定的分区名称列表。

- `vectorFieldName(String vectorFieldName)`

    要搜索的向量字段名称。

- `topK(int topK)`

    要返回的前 K 个结果数量。

- `limit(long limit)`

    要返回的最大结果数量。

- `filter(String filter)`

    用于筛选结果的布尔表达式。

- `outputFields(List<String> outputFields)`

    输出中要包含的字段名称列表。

- `vectors(List<BaseVector> vectors)`

    用于搜索的向量列表。

- `roundDecimal(int roundDecimal)`

    对距离/分数进行舍入时保留的小数位数。

- `searchParams(Map<String, Object> searchParams)`

    以键值对形式提供的其他搜索参数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作期间是否忽略 growing segment。

- `timezone(String timezone)`

    用于时间相关筛选条件的时区字符串。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名称。

- `batchSize(long batchSize)`

    迭代器操作的批处理大小。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    参数化筛选条件的模板变量值映射。

**返回：**

*SearchIteratorV2*

*SearchIteratorV2*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.orm.iterator.SearchIteratorV2;
import io.milvus.v2.service.vector.request.SearchIteratorReqV2;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

// Create a SearchIteratorV2 for paginated vector search.
// V2 is recommended over V1: 20-30% faster with better recall.
SearchIteratorV2 searchIterator = client.searchIteratorV2(SearchIteratorReqV2.builder()
        .collectionName("my_collection")
        .outputFields(Arrays.asList("userAge"))
        .batchSize(50)
        .vectorFieldName("userFace")
        .vectors(Collections.singletonList(new FloatVec(queryVector)))
        .filter("userAge > 10 && userAge < 20")
        .searchParams(new HashMap<>())
        .limit(120)
        .metricType(IndexParam.MetricType.L2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

// Iterate through search results
int counter = 0;
while (true) {
    List<SearchResp.SearchResult> res = searchIterator.next();
    if (res.isEmpty()) {
        searchIterator.close();
        break;
    }
    for (SearchResp.SearchResult result : res) {
        System.out.println(result);
        counter++;
    }
}
System.out.printf("%d search results returned%n", counter);
```
