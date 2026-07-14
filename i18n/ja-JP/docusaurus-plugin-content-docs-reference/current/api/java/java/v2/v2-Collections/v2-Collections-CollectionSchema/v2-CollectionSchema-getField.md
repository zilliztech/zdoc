---
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スキーマ情報を含む特定のフィールドの詳細を取得します。 | Java | v2"
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

この操作は、スキーマ情報を含む特定のフィールドの詳細を取得します。

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## リクエスト構文\{#request-syntax}

```java
CollectionSchema.getField(String fieldName)
```

**パラメーター:**

- `fieldName` (*String*)

    フィールドの名前。

**戻り値の型:**

*CreateCollectionReq.FieldSchema*

**戻り値:**

フィールドの詳細を含む [FieldSchema](./v2-Collections-FieldSchema) オブジェクト。

**例外:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
