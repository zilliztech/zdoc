---
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取特定字段的详细信息，包括 Schema 信息。 | Java | v2"
type: docx
token: AXWod56QkoprlXxOXkwcPXfonHg
sidebar_position: 3
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - getField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getField()

此操作获取特定字段的详细信息，包括 Schema 信息。

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## 请求语法\{#request-syntax}

```java
CollectionSchema.getField(String fieldName)
```

**参数：**

- `fieldName`（*String*）

    字段的名称。

**返回类型：**

*CreateCollectionReq.FieldSchema*

**返回：**

包含字段详细信息的 FieldSchema 对象。

**CreateCollectionReq.FieldSchema** 对象包含以下字段：

**参数：**

- **name**（*String*） -

    字段的名称。

- **description**（*String*） -

    字段的说明。默认为空字符串。

- **dataType**（*DataType*） -

    字段的数据类型。

- **maxLength**（*Integer*） -

    值可以包含的最大字符数。如果此字段的 **dataType** 设置为 **DataType.VarChar**，则此项为必填。默认值：`65535`。

- **dimension**（*Integer*） -

    向量字段的维度。该值应大于 1，通常由所使用的嵌入模型确定。

- **isPrimaryKey**（*Boolean*） -

    当前字段是否为主字段。默认值：`false`。

- **isPartitionKey**（*Boolean*） -

    当前字段是否为 Partition 键字段。默认值：`false`。

- **isClusteringKey**（*Boolean*） -

    当前字段是否为聚类键字段。默认值：`false`。

- **autoID**（*Boolean*） -

    主字段是否自动递增。默认值：`false`。

- **elementType**（*DataType*） -

    数组字段中元素的数据类型。如果此字段的 **dataType** 设置为 **DataType.Array**，则此项为必填。

- **maxCapacity**（*Integer*） -

    数组字段可以包含的最大元素数量。如果此字段的 **dataType** 设置为 **DataType.Array**，则此项为必填。

- **isNullable**（*Boolean*） -

    字段是否可以接受 null 值。仅适用于标量字段。默认值：`false`。

- **defaultValue**（*Object*） -

    字段的默认值，在数据插入期间未显式提供值时使用。仅适用于标量字段。

- **enableAnalyzer**（*Boolean*） -

    是否为 `VARCHAR` 字段启用文本分析。设置为 `true` 时，Milvus 会对字段内容使用文本 Analyzer（BM25 分词器）。

- **analyzerParams**（*Map&lt;String, Object&gt;*） -

    `VARCHAR` 字段的 Analyzer 配置（分词器和过滤器设置）。

- **enableMatch**（*Boolean*） -

    是否为 `VARCHAR` 字段启用关键词匹配（BM25 关键词搜索）。

- **typeParams**（*Map&lt;String, String&gt;*） -

    字段数据类型特有的参数，例如 `VarChar` 字段的 `maxLength`。指定的值会覆盖相应的 `typeParams` 键。

- **multiAnalyzerParams**（*Map&lt;String, Object&gt;*） -

    一种多语言 Analyzer，允许您为文本字段配置多个 Analyzer，并将多语言文档存储在该文本字段中。

- **externalField**（*String*） -

    该 Milvus 字段映射到的外部字段的名称。默认为空字符串。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
