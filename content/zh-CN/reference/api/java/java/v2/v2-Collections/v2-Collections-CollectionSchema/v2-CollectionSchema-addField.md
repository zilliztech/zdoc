---
title: "addField() | Java | v2"
slug: /java/java/v2-CollectionSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Collection 的 Schema 添加字段。 | Java | v2"
type: docx
token: XB9idvIRPo2fEix50dvcAsQHnCg
sidebar_position: 1
keywords: 
  - 图像搜索
  - 大语言模型
  - 机器学习
  - RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addField()

此操作会向 Collection 的 Schema 添加字段。

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

**构建器方法：**

- `fieldName(String fieldName)` -

    字段的名称。

- `description(String description)` -

    字段的描述。

- `dataType(DataType dataType)` -

    字段的数据类型。

    为不同字段选择数据类型时，您可以从以下选项中选择。

- `maxLength(Integer maxLength)` -

    值应包含的最大字符数。

    如果此字段的 **dataType** 设置为 **DataType.VarChar**，则此参数为必需。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    当前字段是否为主键字段。

    将其设置为 **True** 会使当前字段成为主键字段。

- `isPartitionKey(Boolean isPartitionKey)` -

    当前字段是否为 partitionKey 字段。

    将其设置为 **True** 会使当前字段成为 Partition key。

- `autoID(Boolean autoID)` -

    是否允许主键字段自动递增。

    将其设置为 **True** 会使主键字段自动递增。在这种情况下，主键字段不应包含在要插入的数据中，以避免错误。

    在 **isPrimaryKey** 设置为 **True** 的字段中设置此参数。

- `dimension(int dimension)` -

    向量字段的维度。该值应大于 1，通常由所使用的 Embedding 模型决定。

    如果此字段的 **dataType** 设置为 **DataType.FloatVector**，则此参数为必需。

- `elementType(DataType elementType)` -

    数组字段中元素的数据类型。

    如果此字段的 **dataType** 设置为 **DataType.Array**，则此参数为必需。

- `maxCapacity(Integer maxCapacity)` -

    数组字段可以包含的最大元素数。

    如果此字段的 **dataType** 设置为 **DataType.Array**，则此参数为必需。

- `isNullable(Boolean isNullable)` -

    一个布尔参数，用于指定字段是否可以接受 null 值。

    有关更多信息，请参见 Nullable & Default。

- `defaultValue(DataType dataType)` -

    在创建 Collection Schema 时，为其中的特定字段设置默认值。当您希望某些字段即使在数据插入期间未显式提供值也具有初始值时，此参数尤其有用。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为指定的 `VARCHAR` 字段启用文本分析。设置为 `true` 时，会指示 Milvus 使用文本 Analyzer，该 Analyzer 会对字段的文本内容进行分词和过滤。

- `enableMatch(Boolean enableMatch)` -

    是否为指定的 `VARCHAR` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，以便快速高效地执行关键词查找。`enableMatch` 与 `enableAnalyzer` 配合使用，可提供基于词项的结构化文本搜索。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    为文本处理配置 Analyzer，特别适用于 `DataType.VarChar` 字段。此参数可配置分词器和过滤器设置，尤其适用于关键词匹配或全文搜索所用的文本字段。

- `typeParams(Map<String, String> typeParams)` -

    特定于要添加的当前字段数据类型的参数。例如，您可以为 `VarChar` 字段设置 `maxLength`。指定后，它将覆盖上文指定的相应参数值。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    一种多语言 Analyzer，可让您为文本字段配置多个 Analyzer，并在该文本字段中存储多语言文档。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Struct 数组字段中的字段列表。

    如果此字段的 **dataType** 设置为 **DataType.Array**，且 **elementType** 设置为 **DataType.Struct**，则此参数为必需。

- `externalField(String externalField)` -

    此 Milvus 字段所映射的外部字段的名称。与 `CollectionSchema` 上的 `externalSource` 和 `externalSpec` 一起使用，以声明由外部数据源支持的 Collection。刷新时，外部字段的值会被拉取到此 Milvus 字段中。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

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
