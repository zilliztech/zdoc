---
title: "CollectionSchema | Java | v2"
slug: /java/java/v2-Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema 实例表示 Collection 的 Schema。Schema 用于描述 Collection 的结构。 | Java | v2"
type: docx
token: IXVHdXVncoEp64xD6vdcvUJwnlH
sidebar_position: 2
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CollectionSchema
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** 实例表示 Collection 的 Schema。Schema 用于描述 Collection 的结构。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## 构造函数\{#constructor}

通过定义字段、数据类型和其他参数来构造 Collection 的 Schema。

```java
CreateCollectionReq.CollectionSchema.builder()
    .fieldSchemaList(List<CreateCollectionReq.FieldSchema> fieldSchemaList)
    .structFields(List<CreateCollectionReq.StructFieldSchema> structFields)
    .enableDynamicField(boolean enableDynamicField)
    .functionList(List<CreateCollectionReq.Function> functionList)
    .externalSource(String externalSource)
    .externalSpec(JsonObject externalSpec)
    .build();
```

**构建器方法：**

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema> fieldSchemaList)` -

    **FieldSchema** 对象列表，用于定义 Collection Schema 中的字段。字段 Schema 表示并包含单个字段的元数据，而 **CollectionSchema** 将 FieldSchema 对象列表组合在一起，以定义完整的 Schema。

- `structFields(List<CreateCollectionReq.StructFieldSchema> structFields)` -

    Schema 的结构字段（嵌套对象字段）列表。当 Collection 包含值本身为结构化记录的字段时，请使用此参数。

- `enableDynamicField(boolean enableDynamicField)` -

    设置为 `true` 时，启用隐藏的动态字段（`$meta`），使插入操作可以在已声明的 Schema 之外携带任意键值属性。默认值：`false`。

- `functionList(List<CreateCollectionReq.Function> functionList)` -

    附加函数（例如 BM25、JSON 路径提取），这些函数在插入时从现有字段派生值。每个 `Function` 声明其输入、输出和参数。

- `externalSource(String externalSource)` -

    标识绑定到此 Collection 的外部来源（例如 S3 存储桶、Lakehouse 表）。与 `externalSpec` 配合使用，可定义从 Milvus 外部刷新的外部 Collection。

- `externalSpec(JsonObject externalSpec)` -

    外部来源的规范，通常是描述连接详细信息和刷新策略的 JSON。与 `externalSource` 一起使用。

**返回类型：**

*CollectionSchema*

**返回：**

一个 **CollectionSchema** 对象。

**CollectionSchema** 对象包含以下字段：

**参数：**

- **fieldSchemaList** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    **FieldSchema** 对象列表，用于定义 Collection Schema 中的常规字段。

- **structFields** (*List&lt;CreateCollectionReq.StructFieldSchema&gt;*) -

    **StructFieldSchema** 对象列表，用于定义 Collection Schema 中的结构字段（嵌套对象字段）。

- **enableDynamicField** (*boolean*) -

    是否启用隐藏的动态字段（`$meta`），使插入操作可以在已声明的 Schema 之外携带任意键值属性。默认值：`false`。

- **functionList** (*List&lt;CreateCollectionReq.Function&gt;*) -

    附加到 Schema 的函数（例如 BM25、JSON 路径提取），这些函数在插入时从现有字段派生值。

- **externalSource** (*String*) -

    绑定到此 Collection 的外部来源的名称（例如 S3 存储桶或 Lakehouse 表）。默认为空字符串。

- **externalSpec** (*JsonObject*) -

    外部来源的规范，通常是描述连接详细信息和刷新策略的 JSON。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// define a Collection Schema
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two fields, id and vector
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```

## 方法\{#methods}

以下是 `CollectionSchema` 类的方法：
