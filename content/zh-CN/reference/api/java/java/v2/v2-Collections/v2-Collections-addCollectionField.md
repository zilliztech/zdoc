---
title: "addCollectionField() | Java | v2"
slug: /java/java/v2-Collections/v2-Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.1
deprecate_since: false
notebook: false
description: "此操作可向现有集合添加新的标量或向量字段，而无需重新创建集合。现有行不会为新字段提供值，因此新增的向量字段必须可为空。 | Java | v2"
type: docx
token: LaHmdGNGZog0JbxA8amcblpsnDR
sidebar_position: 23
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

此操作可向现有集合添加新的标量或向量字段，而无需重新创建集合。现有行不会为新字段提供值，因此新增的向量字段必须可为空。

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

    目标集合的名称。

- `databaseName(String databaseName)` -

    数据库名称。如未指定，则默认为当前数据库。

- `fieldName(String fieldName)` -

    要添加的字段名称。

- `description(String description)` -

    字段的人类可读描述。

- `dataType(DataType dataType)` -

    字段的数据类型。标量、向量、数组、JSON 以及与 struct 相关的字段类型，使用与创建集合时相同的 `DataType` 值。

- `maxLength(Integer maxLength)` -

    `DataType.VarChar` 字段允许的最大字符数。对于 VarChar 字段，除非该值通过 `typeParams` 提供，否则此项为必填。

- `dimension(Integer dimension)` -

    向量维度。对于固定维度的向量字段（例如 `DataType.FloatVector`），此项为必填。

- `elementType(DataType elementType)` -

    数组字段的元素类型。

- `maxCapacity(Integer maxCapacity)` -

    数组字段中允许的最大元素数量。

- `isNullable(Boolean isNullable)` -

    新增字段是否接受 `null` 值。对于 v3.0.1 及更高版本，向现有集合中添加的向量字段必须将此项设置为 `true`；否则 SDK 会抛出 `MilvusClientException`。

- `defaultValue(Object defaultValue)` -

    新增字段的默认值。其运行时类型必须与 `dataType` 匹配。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为 `DataType.VarChar` 字段启用文本分析。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    VarChar 字段的分析器配置，例如分词器和过滤器设置。

- `enableMatch(Boolean enableMatch)` -

    是否为 VarChar 字段启用关键词匹配。

- `typeParams(Map<String, String> typeParams)` -

    其他字段类型参数。像 `dimension` 或 `maxLength` 这样的专用构建器方法会覆盖此映射中的对应条目。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    文本字段的多语言分析器配置。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    struct 字段的嵌套字段 schema。

- `externalField(String externalField)` -

    当集合由外部数据源支持时，映射到此 Milvus 字段的外部源字段。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将抛出此异常，包括以 `isNullable(false)` 添加向量字段，或未将 `isNullable(true)` 设置到向量字段时。

## 示例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

// 向现有集合添加一个可为空的标量字段。
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .build());

// 向现有集合添加一个可为空的向量字段。
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("embedding_v2")
        .dataType(DataType.FloatVector)
        .dimension(128)
        .isNullable(true)
        .build());
```
