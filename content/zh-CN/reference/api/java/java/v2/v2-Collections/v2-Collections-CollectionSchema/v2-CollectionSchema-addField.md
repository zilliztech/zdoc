---
title: "addField() | Java | v2"
slug: /java/java/v2-CollectionSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作向 Collection 的 Schema 添加一个字段。 | Java | v2"
type: docx
token: XB9idvIRPo2fEix50dvcAsQHnCg
sidebar_position: 1
keywords: 
  - 图像搜索
  - LLMs
  - 机器学习
  - RAG
  - zilliz
  - zilliz cloud
  - 云
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

此操作向 Collection 的 Schema 添加一个字段。

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

    字段名称。

- `description(String description)` -

    字段描述。

- `dataType(DataType dataType)` -

    字段的数据类型。

    为不同字段选择数据类型时，您可以从以下选项中进行选择。

- `maxLength(Integer maxLength)` -

    值可包含的最大字符数。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.VarChar**，则此项为必填。

- `isPrimaryKey(Boolean isPrimaryKey)` -

    当前字段是否为主字段。

    将其设置为 **True** 会使当前字段成为主字段。

- `isPartitionKey(Boolean isPartitionKey)` -

    当前字段是否为 partitionKey 字段。

    将其设置为 **True** 会使当前字段成为 Partition 键。

- `autoID(Boolean autoID)` -

    是否允许主字段自动递增。

    将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主字段。

    请在 **isPrimaryKey** 设置为 **True** 的字段中设置此参数。

- `dimension(int dimension)` -

    向量字段的维度。该值应大于 1，通常由所使用的嵌入模型决定。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.FloatVector**，则此项为必填。

- `elementType(DataType elementType)` -

    数组字段中元素的数据类型。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此项为必填。

- `maxCapacity(Integer maxCapacity)` -

    数组字段可包含的最大元素数量。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，则此项为必填。

- `isNullable(Boolean isNullable)` -

    用于指定字段是否可接受 null 值的布尔参数。

    更多信息，请参见 Nullable & Default。

- `defaultValue(DataType dataType)` -

    在创建 Collection Schema 时，为其中的特定字段设置默认值。当您希望某些字段即使在插入数据时未显式提供值，也具有初始值时，这一功能尤其有用。

- `enableAnalyzer(Boolean enableAnalyzer)` -

    是否为指定的 `VARCHAR` 字段启用文本分析。设置为 `true` 时，将指示 Milvus 使用文本 Analyzer，对字段中的文本内容进行分词和过滤。

- `enableMatch(Boolean enableMatch)` -

    是否为指定的 `VARCHAR` 字段启用关键字匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而支持快速高效的关键字查找。`enableMatch` 与 `enableAnalyzer` 配合使用，可提供基于结构化术语的文本搜索。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    配置用于文本处理的 Analyzer，特别适用于 `DataType.VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于用于关键字匹配或全文搜索的文本字段。

- `typeParams(Map<String, String> typeParams)` -

    要添加的当前字段中与数据类型相关的特定参数。例如，您可以为 `VarChar` 字段设置 `maxLength`。指定后，它会覆盖上面指定的相应参数值。

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    一种多语言 Analyzer，允许您为文本字段配置多个 Analyzer，并在该文本字段中存储多语言文档。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Array of Structs 字段中的字段列表。

    如果此字段的 **[dataType](./v2-Collections-DataType)** 设置为 **DataType.Array**，且此字段的 **elementType** 设置为 **DataType.Struct**，则此项为必填。

- `externalField(String externalField)` -

    此 Milvus 字段映射到的外部字段的名称。与 `externalSource`、`externalSpec` 以及 `CollectionSchema` 上的配置一起使用，用于声明由外部数据源支持的 Collection。刷新时，外部字段的值会被拉取到此 Milvus 字段中。

**返回值：**

*void*

**异常：**

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
