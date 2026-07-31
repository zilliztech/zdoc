---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量相似性搜索，并可选择使用标量过滤表达式。 | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
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

此操作执行向量相似性搜索，并可选择使用标量过滤表达式。

```java
public SearchResp search(SearchReq request)
```

## 请求语法\{#request-syntax}

```java
search(SearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .annsField(String annsField)
    .topK(int topK)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .data(List<BaseVector> data)
    .ids(List<Object> ids)
    .offset(long offset)
    .limit(long limit)
    .roundDecimal(int roundDecimal)
    .searchParams(Map<String, Object> searchParams)
    .guaranteeTimestamp(long guaranteeTimestamp)
    .gracefulTime(Long gracefulTime)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .highlighter(Highlighter highlighter)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)`

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `clusterId(String clusterId)`

    此向量读取请求的目标集群 ID。当多个请求需要共享同一集群 ID 时，请使用 `session(String clusterId)`。

- `partitionNames(List<String> partitionNames)`

    目标分区名称列表。

- `annsField(String annsField)`

    用于近似最近邻搜索的向量字段名称。

- `topK(int topK)`

    要返回的前 K 个结果数量。

- `filter(String filter)`

    用于过滤结果的布尔表达式。

- `outputFields(List<String> outputFields)`

    要包含在输出中的字段名称列表。

- `data(List<BaseVector> data)`

    要以 JSON 对象形式插入/更新插入的数据行列表。

- `ids(List<Object> ids)`

    用于标识特定实体的主键值列表。

- `offset(long offset)`

    返回结果前要跳过的结果数量。

- `limit(long limit)`

    要返回的最大结果数量。

- `roundDecimal(int roundDecimal)`

    距离/分数保留的小数位数。

- `searchParams(Map<String, Object> searchParams)`

    以键值对形式提供的附加搜索参数。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    用于保证在此时间戳之前的所有操作均可见的时间戳。

- `gracefulTime(Long gracefulTime)`

    用于一致性的宽限时间（毫秒）。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    此操作的一致性级别。

- `ignoreGrowing(boolean ignoreGrowing)`

    是否在操作期间忽略 growing segment。

- `timezone(String timezone)`

    用于时间相关过滤的时区字符串。

- `groupByFieldName(String groupByFieldName)`

    用于对搜索结果进行分组的字段名称。

- `groupSize(Integer groupSize)`

    每组要返回的结果数量。

- `strictGroupSize(Boolean strictGroupSize)`

    是否严格执行分组大小。

- `functionScore(FunctionScore functionScore)`

    用于自定义评分的 FunctionScore 对象。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    用于参数化过滤器的模板变量值映射。

- `highlighter(Highlighter highlighter)`

    用于在搜索结果中高亮文本的 Highlighter 对象。

**返回：**

*SearchResp*

*SearchResp*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.ranker.DecayRanker;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

// Build a DecayRanker to rerank results by field value proximity
DecayRanker decay = DecayRanker.builder()
        .name("birth_year_decay")
        .inputFieldNames(Collections.singletonList("birth_year"))
        .function("linear")
        .origin(1900)
        .scale(50)
        .offset(0)
        .decay(0.1)
        .build();

// Search with FunctionScore for reranking
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("Albert Darwin")))
        .limit(100)
        .outputFields(Arrays.asList("birth_year", "lifespan"))
        .functionScore(FunctionScore.builder()
        .addFunction(decay)
        .build())
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```
