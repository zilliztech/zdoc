---
title: "queryIterator() | Java | v2"
slug: /java/java/v2-Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回一个查询迭代器，用于迭代数据。 | Java | v2"
type: docx
token: HnxQdhvGQotpwfxgo4pcviKNn4g
sidebar_position: 6
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - queryIterator()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryIterator()

此操作返回一个查询迭代器，用于迭代数据。

```java
public QueryIterator queryIterator(QueryIteratorReq request)
```

## 请求语法\{#request-syntax}

```java
queryIterator(QueryIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .expr(String expr)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .batchSize(long batchSize)
    .reduceStopForBest(boolean reduceStopForBest)
    .cursor(QueryIteratorCursor cursor)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionNames(List<String> partitionNames)`

    目标 Partition 名称的列表。

- `outputFields(List<String> outputFields)`

    要在输出中包含的字段名称列表。

- `expr(String expr)`

    用于筛选结果的布尔表达式。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `offset(long offset)`

    返回前要跳过的结果数量。

- `limit(long limit)`

    要返回的最大结果数量。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否在操作期间忽略处于增长状态的 Segment。

- `timezone(String timezone)`

    用于时间相关筛选的时区字符串。

- `batchSize(long batchSize)`

    迭代器操作的批大小。

- `reduceStopForBest(boolean reduceStopForBest)`

    是否在找到最佳结果时停止迭代。

- `cursor(QueryIteratorCursor cursor)`

    先前捕获的游标，用于从中恢复分页。设置后，迭代器将从该游标的会话时间戳和位置继续，而不是重新开始；在这种情况下，将忽略 `offset()`。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    用于参数化筛选器的模板变量值映射。

**返回类型：**

*QueryIterator*

**返回：**

用于逐页迭代查询结果的 **QueryIterator** 对象，提供以下方法：

**参数：**

- **next()** (*List&lt;QueryResultsWrapper.RowRecord&gt;*) -

    返回与查询表达式匹配的下一批行。

- **close()** -

    释放迭代器及其游标持有的资源。

- **getCursor()** (*QueryIteratorCursor*) -

    返回保存迭代进度的游标。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.service.vector.request.QueryIteratorReq;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.Arrays;
import java.util.List;

// Create a query iterator to retrieve results in batches
QueryIterator queryIterator = client.queryIterator(QueryIteratorReq.builder()
        .collectionName("my_collection")
        .expr("userID < 3000")
        .outputFields(Arrays.asList("userID", "userAge"))
        .batchSize(100)
        .offset(0)
        .limit(10000)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

// Iterate through all results
int counter = 0;
while (true) {
    List<QueryResultsWrapper.RowRecord> res = queryIterator.next();
    if (res.isEmpty()) {
        queryIterator.close();
        break;
    }
    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
        counter++;
    }
}
System.out.printf("%d query results returned%n", counter);
```
