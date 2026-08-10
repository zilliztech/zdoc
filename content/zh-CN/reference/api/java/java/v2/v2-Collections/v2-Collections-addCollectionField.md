---
title: "addCollectionField() | Java | v2"
slug: /java/java/v2-Collections/v2-Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.1
deprecate_since: false
notebook: false
description: "此操作可向现有 Collection 添加新的标量或向量字段，而无需重新创建 Collection。现有行没有新字段的值，因此新增的向量字段必须可为空。 | Java | v2"
type: docx
token: LaHmdGNGZog0JbxA8amcblpsnDR
sidebar_position: 23
keywords: 
  - Milvus 开源
  - Milvus 的工作原理
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

此操作可向现有 Collection 添加新的标量或向量字段，而无需重新创建 Collection。现有行没有新字段的值，因此新增的向量字段必须可为空。

```java
public void addCollectionField(AddCollectionFieldReq request)
```

## 请求语法\{#request-syntax}

```java
client.addCollectionField(AddCollectionFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .dimension(Integer dimension)
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
    .isNullable(Boolean isNullable)
    .defaultValue(Object defaultValue)
    .enableAnalyzer(Boolean enableAnalyzer)
    .analyzerParams(Map<String, Object> analyzerParams)
    .enableMatch(Boolean enableMatch)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .externalField(String externalField)
    .build()
);
```

**构建器方法：**

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认为当前 Database。

- `fieldName(String fieldName)` -

    要添加的字段名称。

- `description(String description)` -

    该字段的便于理解的描述。

- `dataType(DataType dataType)` -

    字段的数据类型。标量、向量、数组、JSON 和 struct 相关字段类型沿用创建 Collection 时使用的相同 `DataType` 值。

- `maxLength(Integer maxLength)` -

    `DataType.VarChar` 字段的最大字符数。对于 VarChar 字段，此项为必填，除非该值通过 `typeParams` 提供。

- `dimension(Integer dimension)` -

    向量维度。对于固定维度的向量字段（如 `DataType.FloatVector`），此项为必填。

- `elementType(DataType elementType)` -

    数组字段的元素类型。

- `maxCapacity(Integer maxCapacity)` -

    数组字段允许的最大元素数量。

- `isNullable(Boolean isNullable)` -

    新增字段是否接受 `null` 值。对于 v3.0.1 及更高版本，添加到现有 Collection 的向量字段必须将此项设置为 `true`；否则 SDK 会引发 `MilvusClientException`。

- `defaultValue(Object defaultValue)` -

    新增字段的默认值。运行时类型必须与 `dataType` 匹配。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为 `DataType.VarChar` 字段启用文本分析。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    VarChar 字段的 Analyzer 配置，例如分词器和过滤器设置。

- `enableMatch(Boolean enableMatch)` -

    是否为 VarChar 字段启用关键词匹配。

- `typeParams(Map<String, String> typeParams)` -

    附加的字段类型参数。专用构建器方法（如 `dimension` 或 `maxLength`）会覆盖此映射中的对应条目。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    文本字段的多语言 Analyzer 配置。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    struct 字段的嵌套字段 Schema。

- `externalField(String externalField)` -

    当 Collection 由外部数据源支持时，映射到此 Milvus 字段的外部源字段。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常，包括在使用 `isNullable(false)` 添加向量字段或未设置 `isNullable(true)` 时。

## 示例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

// Add a nullable scalar field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .build());

// Add a nullable vector field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("embedding_v2")
        .dataType(DataType.FloatVector)
        .dimension(128)
        .isNullable(true)
        .build());
```
