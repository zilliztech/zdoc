---
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取特定字段的详细信息，包括 schema 信息。 | Java | v2"
type: docx
token: AXWod56QkoprlXxOXkwcPXfonHg
sidebar_position: 3
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getField()

此操作获取特定字段的详细信息，包括 schema 信息。

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## 请求语法\{#request-syntax}

```java
CollectionSchema.getField(String fieldName)
```

**参数：**

- `fieldName` (*String*)

    字段名称。

**返回类型：**

*CreateCollectionReq.FieldSchema*

**返回：**

包含字段详细信息的 [FieldSchema](./v2-Collections-FieldSchema) 对象。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
