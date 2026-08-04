---
title: "addFunctionField() | Java | v2"
slug: /java/java/v2-Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "向现有的 Milvus 3.0 collection 添加一个由函数支持的字段，以及其显式配置的绑定索引。 | Java | v2"
type: docx
token: GTZHdG3fMoBZi0x23BNctsO7nEE
sidebar_position: 38
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - addFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunctionField()

向现有的 Milvus 3.0 collection 添加一个由函数支持的字段，以及其显式配置的绑定索引。

```java
public void addFunctionField(AddFunctionFieldReq request)
```

## 请求语法\{#request-syntax}

```java
AddFunctionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .description(description)
    .dataType(dataType)
    .maxLength(maxLength)
    .dimension(dimension)
    .elementType(elementType)
    .maxCapacity(maxCapacity)
    .isNullable(isNullable)
    .defaultValue(defaultValue)
    .enableAnalyzer(enableAnalyzer)
    .analyzerParams(analyzerParams)
    .enableMatch(enableMatch)
    .typeParams(typeParams)
    .function(function)
    .indexParam(indexParam)
    .build();
```

**构建器方法：**

- `collectionName(String collectionName)`

    目标 collection 的名称。

- `databaseName(String databaseName)`

    数据库名称。省略时默认为当前数据库。

- `fieldName(String fieldName)`

    要添加的函数输出字段名称。

- `description(String description)`

    新字段的人类可读描述。

- `dataType(DataType dataType)`

    新函数输出字段的数据类型。

- `maxLength(Integer maxLength)`

    可变长度字段的最大长度。

- `dimension(Integer dimension)`

    向量字段的维度。

- `elementType(DataType elementType)`

    数组字段的元素类型。

- `maxCapacity(Integer maxCapacity)`

    数组字段中的最大元素数量。

- `isNullable(Boolean isNullable)`

    该字段是否接受 null 值。

- `defaultValue(Object defaultValue)`

    标量字段的默认值。

- `enableAnalyzer(Boolean enableAnalyzer)`

    是否为该字段启用文本分析。

- `analyzerParams(Map<String, Object> analyzerParams)`

    字段的分析器配置。

- `enableMatch(Boolean enableMatch)`

    是否为该字段启用文本匹配。

- `typeParams(Map<String, String> typeParams)`

    其他字段类型参数。

- `function(CreateCollectionReq.Function function)`

    函数定义。它必须且只能有一个与 fieldName 匹配的输出。

- `indexParam(IndexParam indexParam)`

    绑定索引配置。它必须使用相同字段，并显式指定除 None 或 AUTOINDEX 之外的索引类型。

**返回：**

*void*

此操作不返回值。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时抛出。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
CreateCollectionReq.Function bm25Function = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("sparse"))
    .build();

IndexParam sparseIndex = IndexParam.builder()
    .fieldName("sparse")
    .indexName("sparse_idx")
    .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
    .metricType(IndexParam.MetricType.BM25)
    .build();

client.addFunctionField(AddFunctionFieldReq.builder()
    .collectionName("books")
    .fieldName("sparse")
    .dataType(DataType.SparseFloatVector)
    .function(bm25Function)
    .indexParam(sparseIndex)
    .build());
```
