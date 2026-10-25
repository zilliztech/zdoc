---
title: "SearchIteratorV2() | Java | v2"
slug: /java/java/v2-Vector-SearchIteratorV2
sidebar_label: "SearchIteratorV2()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，此迭代器尤为有用。 | Java | v2"
type: docx
token: ZouQdklUsoSZEDxWkJvc90pvnmg
sidebar_position: 11
keywords: 
  - 向量 Database 对比
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - SearchIteratorV2()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# SearchIteratorV2()

此操作会创建一个迭代器，供您遍历搜索结果。当搜索结果包含大量数据时，此迭代器尤为有用。

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

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `clusterId(String clusterId)`

    此向量读取请求的目标集群 ID。当多个请求应共享同一集群 ID 时，请使用 `session(String clusterId)`。

- `partitionNames(List<String> partitionNames)`

    目标 Partition 名称的列表。

- `vectorFieldName(String vectorFieldName)`

    要搜索的向量字段的名称。

- `topK(int topK)`

    要返回的排名靠前结果的数量。

- `limit(long limit)`

    要返回的结果数上限。

- `filter(String filter)`

    用于筛选结果的布尔表达式。

- `outputFields(List<String> outputFields)`

    要包含在输出中的字段名称列表。

- `vectors(List<BaseVector> vectors)`

    用于搜索的向量列表。

- `roundDecimal(int roundDecimal)`

    对 distance/score 进行舍入时保留的小数位数。

- `searchParams(Map<String, Object> searchParams)`

    以键值对形式提供的附加搜索参数。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作期间是否忽略 growing Segment。

- `timezone(String timezone)`

    用于时间相关筛选条件的时区字符串。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名。

- `batchSize(long batchSize)`

    迭代器操作的批大小。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    参数化筛选条件的模板变量值映射。

**返回类型：**

*SearchIteratorV2*

**返回：**

一个 **SearchIteratorV2** 迭代器，您可以使用它遍历搜索结果。

**参数：**

- **searchIterator** (*SearchIteratorV2*) -

    此操作返回的迭代器实例。调用 `next()` 获取下一批结果；当它返回空列表时，调用 `close()` 释放迭代器。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

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
