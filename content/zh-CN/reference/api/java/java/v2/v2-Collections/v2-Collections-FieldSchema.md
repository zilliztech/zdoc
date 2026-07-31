---
title: "FieldSchema | Java | v2"
slug: /java/java/v2-Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldSchema 实例用于定义集合中特定字段的数据类型及相关属性。 | Java | v2"
type: docx
token: ZwKPdk2rzoQUU7xm4CHcPiZqnjh
sidebar_position: 16
keywords: 
  - LLMs
  - Machine Learning
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

**FieldSchema** 实例用于定义集合中特定字段的数据类型及相关属性。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## Constructor\{#constructor}

通过定义字段名称、数据类型和其他参数来构造字段的 schema。

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

**BUILDER METHODS：**

- `name(String name)` -

    字段名称。

- `description(String description)` -

    字段描述。

- `dataType(DataType dataType)` -

    字段的数据类型。为不同字段选择数据类型时，可从以下选项中进行选择：主键字段——使用 **DataType.Int64** 或 **DataType.VarChar**；标量字段——从 **DataType.Bool**、**DataType.Int8**、**DataType.Int16**、**DataType.Int32**、**DataType.Int64**、**DataType.Float**、**DataType.Double**、**DataType.VarChar**、**DataType.JSON** 或 **DataType.Array** 中选择；向量字段——选择 **DataType.BinaryVector** 或 **DataType.FloatVector**。

- `maxLength(Integer maxLength)` -

    值可包含的最大字符数。如果该字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.VarChar**，则此参数为必填。

- `dimension(Integer dimension)` -

    值应具有的维度数。如果该字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.FloatVector**，则此参数为必填。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    当前字段是否为主字段。将其设置为 **True** 时，当前字段将成为主字段。

- `isPartitionKey(Boolean isPartitionKey)` -

    当前字段是否为分区键字段。将其设置为 **True** 时，当前字段将成为分区键。

- `isClusteringKey(Boolean isClusteringKey)` -

    当前字段是否为聚簇键。聚簇键控制磁盘上 segment 的分组，以加速基于此字段过滤的查询。

- `autoID(Boolean autoID)` -

    是否允许主字段自动递增。将其设置为 **True** 时，主字段将自动递增。在这种情况下，为避免出错，插入数据时不应包含主字段。请在 **isPrimaryKey** 设置为 **True** 的字段中设置此参数。

- `elementType(DataType elementType)` -

    数组字段中元素的数据类型。如果该字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此参数为必填。

- `maxCapacity(Integer maxCapacity)` -

    数组字段可包含的最大元素数量。如果该字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此参数为必填。

- `isNullable(Boolean isNullable)` -

    允许此字段使用 `null` 值。默认值：`false`。更多信息请参见 Nullable & Default。

- `defaultValue(Object defaultValue)` -

    为字段设置默认值，当插入时缺少该字段时使用。运行时类型必须与 `dataType` 匹配。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为指定的 `VARCHAR` 字段启用文本分析。设置为 `true` 时，Milvus 会使用文本分析器对字段的文本内容进行分词和过滤。全文检索需要启用此功能。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    `DataType.VarChar` 字段的字段级分析器配置（tokenizer、filters）。与 `enableAnalyzer` 搭配使用。

- `enableMatch(Boolean enableMatch)` -

    是否为指定的 `VARCHAR` 字段启用关键词匹配。当设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而支持快速高效的关键词查找。`enableMatch` 与 `enableAnalyzer` 配合使用，以提供基于结构化词项的文本搜索。

- `typeParams(Map<String, String> typeParams)` -

    未通过专用 builder 方法暴露的通用类型参数。指定后，此处的值会覆盖上面设置的对应参数值。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    多语言分析器，允许你为文本字段配置多个分析器，并在该文本字段中存储多语言文档。

- `externalField(String externalField)` -

    将此 Milvus 字段映射到 schema 的 `externalSource` 所标识的外部数据源中的某一列。用于外部集合。

**RETURN TYPE：**

*FieldSchema*

**RETURNS：**

一个 **FieldSchema** 对象。

**EXCEPTIONS：**

- **MilvusClientExceptions**

    当此操作过程中发生任何错误时，将引发此异常。

## Example\{#example}

```java
// define a id field with autoID set to false
CreateCollectionReq.FieldSchema fieldSchema = CreateCollectionReq.FieldSchema.builder()
        .name("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .autoID(Boolean.FALSE)
        .build();
```
