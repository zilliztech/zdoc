---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema 实例定义了 Collection 中特定字段的数据类型及其相关属性。 | Java | v2"
type: docx
token: ZwKPdk2rzoQUU7xm4CHcPiZqnjh
sidebar_position: 16
keywords: 
  - LLMs
  - 机器学习
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - FieldSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

**FieldSchema** 实例定义了 Collection 中特定字段的数据类型及其相关属性。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## 构造函数\{#constructor}

通过定义字段名称、数据类型和其他参数来构造字段的 Schema。

```java
CreateCollectionReq.FieldSchema.builder()
    .name(String name)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .dimension(Integer dimension)
    .isPrimaryKey(Boolean isPrimaryKey)
    .isPartitionKey(Boolean isPartitionKey)
    .isClusteringKey(Boolean isClusteringKey)
    .autoID(Boolean autoID)
    .isNullable(Boolean isNullable)
    .defaultValue(Object defaultValue)
    .enableAnalyzer(Boolean enableAnalyzer)
    .analyzerParams(Map<String, Object> analyzerParams)
    .enableMatch(Boolean enableMatch)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .externalField(String externalField)
    .build();
```

**构建器方法：**

- `name(String name)` -

    字段名称。

- `description(String description)` -

    字段描述。

- `dataType(DataType dataType)` -

    字段的数据类型。为不同字段选择数据类型时，您可以从以下选项中进行选择：主键字段——使用 **DataType.Int64** 或 **DataType.VarChar**；标量字段——从 **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON** 或 **DataType.Array** 中选择；向量字段——选择 **DataType.BinaryVector** 或 **DataType.FloatVector**。

- `maxLength(Integer maxLength)` -

    值应包含的最大字符数。如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.VarChar**，则此项为必填。

- `dimension(Integer dimension)` -

    值应具有的维度数。如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.FloatVector**，则此项为必填。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    当前字段是否为主字段。将其设置为 **True** 会使当前字段成为主字段。

- `isPartitionKey(Boolean isPartitionKey)` -

    当前字段是否为 Partition 键字段。将其设置为 **True** 会使当前字段成为 Partition 键。

- `isClusteringKey(Boolean isClusteringKey)` -

    当前字段是否为聚类键。聚类键控制磁盘上 Segment 的分组，以加速按此字段过滤的查询。

- `autoID(Boolean autoID)` -

    是否允许主字段自动递增。将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主字段。请在 **isPrimaryKey** 设置为 **True** 的字段中设置此参数。

- `elementType(DataType elementType)` -

    数组字段中元素的数据类型。如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此项为必填。 

- `maxCapacity(Integer maxCapacity)` -

    数组字段可包含的最大元素数量。如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此项为必填。 

- `isNullable(Boolean isNullable)` -

    允许此字段使用 `null` 值。默认值：`false`。更多信息，请参见 Nullable & Default。

- `defaultValue(Object defaultValue)` -

    为字段设置默认值，当插入时缺少该字段时使用。运行时类型必须与 `dataType` 匹配。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为指定的 `VARCHAR` 字段启用文本分析。设置为 `true` 时，Milvus 会使用文本 Analyzer 对字段的文本内容进行分词和过滤。这是全文搜索所必需的。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    用于 `DataType.VarChar` 字段的按字段 Analyzer 配置（分词器、过滤器）。与 `enableAnalyzer` 一起使用。

- `enableMatch(Boolean enableMatch)` -

    是否为指定的 `VARCHAR` 字段启用关键词匹配。当为 `true` 时，Milvus 会为该字段创建倒排索引，从而实现快速高效的关键词查找。`enableMatch` 与 `enableAnalyzer` 配合使用，以提供基于术语的结构化文本搜索。

- `typeParams(Map<String, String> typeParams)` -

    未作为专用构建器方法公开的通用按类型参数。指定后，此处的值会覆盖上面设置的对应参数值。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    一种多语言 Analyzer，允许您为文本字段配置多个 Analyzer，并在该文本字段中存储多语言文档。

- `externalField(String externalField)` -

    将此 Milvus 字段映射到 Schema 的 `externalSource` 上标识的外部源中的某一列。用于外部 Collection。

**返回类型：**

*FieldSchema*

**返回：**

一个 **FieldSchema** 对象。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
// define a id field with autoID set to false
CreateCollectionReq.FieldSchema fieldSchema = CreateCollectionReq.FieldSchema.builder()
        .name("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .autoID(Boolean.FALSE)
        .build();
```
