---
title: "addField() | Java | v2"
slug: /java/java/v2-CollectionSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作向集合的 schema 添加一个字段。 | Java | v2"
type: docx
token: XB9idvIRPo2fEix50dvcAsQHnCg
sidebar_position: 1
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

此操作向集合的 schema 添加一个字段。

```java
public void addField(AddFieldReq addFieldReq)
```

## 请求语法\{#request-syntax}

```java
CollectionSchema.addField(AddFieldReq.builder()
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .isPrimaryKey(Boolean isPrimaryKey)
    .isPartitionKey(Boolean isPartitionKey)
    .autoID(Boolean autoID)
    .dimension(int dimension)
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
    .isNullable(Boolean isNullable)
    .defaultValue(DataType dataType)
    .enableAnalyzer(Boolean enableAnalyzer)
    .enableMatch(Boolean enableMatch)
    .analyzerParams(Map<String, Object> analyzerParams)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .externalField(String externalField)
    .build()
)
```

**BUILDER METHODS：**

- `fieldName(String fieldName)` -

    字段名称。

- `description(String description)` -

    字段描述。

- `dataType(DataType dataType)` -

    字段的数据类型。

    为不同字段选择数据类型时，可从以下选项中进行选择。

- `maxLength(Integer maxLength)` -

    值可包含的最大字符数。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.VarChar**，则此参数为必需。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    当前字段是否为主字段。

    将其设置为 **True** 会使当前字段成为主字段。

- `isPartitionKey(Boolean isPartitionKey)` -

    当前字段是否为 partitionKey 字段。

    将其设置为 **True** 会使当前字段成为分区键。

- `autoID(Boolean autoID)` -

    是否允许主字段自动递增。

    将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免错误，不应在待插入的数据中包含主字段。

    请在 **isPrimaryKey** 设置为 **True** 的字段中设置此参数。

- `dimension(int dimension)` -

    向量字段的维度。该值应大于 1，通常由所使用的 embedding 模型决定。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.FloatVector**，则此参数为必需。

- `elementType(DataType elementType)` -

    数组字段中元素的数据类型。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此参数为必需。

- `maxCapacity(Integer maxCapacity)` -

    数组字段可包含的最大元素数量。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此参数为必需。

- `isNullable(Boolean isNullable)` -

    一个布尔参数，用于指定该字段是否可以接受 null 值。

    更多信息，请参见 Nullable & Default。

- `defaultValue(DataType dataType)` -

    在创建集合 schema 时，为其中的特定字段设置默认值。当你希望某些字段即使在插入数据时未显式提供值，也具有初始值时，这一功能尤其有用。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为指定的 `VARCHAR` 字段启用文本分析。设置为 `true` 时，将指示 Milvus 使用文本分析器，对字段中的文本内容进行分词和过滤。

- `enableMatch(Boolean enableMatch)` -

    是否为指定的 `VARCHAR` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而支持快速高效的关键词查找。`enableMatch` 与 `enableAnalyzer` 配合使用，以提供基于结构化词项的文本搜索。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    配置用于文本处理的分析器，专用于 `DataType.VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于用于关键词匹配或全文搜索的文本字段。

- `typeParams(Map<String, String> typeParams)` -

    待添加当前字段的数据类型专属参数。例如，你可以为 `VarChar` 字段设置 `maxLength`。指定后，它会覆盖上方对应参数中设置的值。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    多语言分析器，允许你为一个文本字段配置多个分析器，并在该文本字段中存储多语言文档。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Array of Structs 字段中的字段列表。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，且此字段的 **elementType** 设置为 **DataType.Struct**，则此参数为必需。

- `externalField(String externalField)` -

    此 Milvus 字段映射到的外部字段名称。与 `CollectionSchema` 上的 `externalSource` 和 `externalSpec` 一起使用，用于声明由外部数据源支持的集合。刷新时，外部字段的值会被拉取到此 Milvus 字段中。

**RETURNS：**

*void*

**EXCEPTIONS：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two fields, id and vector
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(128).build());
```
