---
title: "getStructFields() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructFields
sidebar_label: "getStructFields()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection Schema 中的所有 Struct 字段 Schema。 | Java | v2"
type: docx
token: S0Iudxn6NoqusZx4xjRcLWLpnGc
sidebar_position: 8
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - getStructFields()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructFields()

此操作返回 Collection Schema 中的所有 Struct 字段 Schema。

```java
public List<CreateCollectionReq.StructFieldSchema> getStructFields()
```

**返回类型：**

*List&lt;CreateCollectionReq.StructFieldSchema&gt;*

**返回：**

一个 **CreateCollectionReq.StructFieldSchema** 对象列表。每个 **CreateCollectionReq.StructFieldSchema** 对象包含以下字段：

**参数：**

- **name** （*String*） -

    Struct 字段的名称。

- **description** （*String*） -

    Struct 字段的描述。该值默认为空字符串。

- **fields** （*List&lt;CreateCollectionReq.FieldSchema&gt;*） -

    Struct 字段的子字段。子字段不支持 Array、ArrayOfVector 和 Struct 元素类型。

- **maxCapacity** （*Integer*） -

    Struct 字段可容纳的最大元素数。

- **nullable** （*Boolean*） -

    Struct 字段是否可为空。默认值：`false`。

- **typeParams** （*Map&lt;String, String&gt;*） -

    Struct 字段的类型参数。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.StructFieldSchema> fields = schema.getStructFields();
```
