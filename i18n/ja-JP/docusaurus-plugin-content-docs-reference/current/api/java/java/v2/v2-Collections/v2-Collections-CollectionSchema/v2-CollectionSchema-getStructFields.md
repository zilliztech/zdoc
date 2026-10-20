---
title: "getStructFields() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructFields
sidebar_label: "getStructFields()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマ内のすべての struct フィールドスキーマを返します。 | Java | v2"
type: docx
token: S0Iudxn6NoqusZx4xjRcLWLpnGc
sidebar_position: 8
keywords: 
  - Milvus ベクトルデータベース
  - Milvus データベース
  - Milvus ベクトルデータベース
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - クラウド
  - getStructFields()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructFields()

この操作は、コレクションスキーマ内のすべての struct フィールドスキーマを返します。

```java
public List<CreateCollectionReq.StructFieldSchema> getStructFields()
```

**戻り値の型:**

*List&lt;CreateCollectionReq.StructFieldSchema&gt;*

**戻り値:**

**CreateCollectionReq.StructFieldSchema** オブジェクトのリストです。各 **CreateCollectionReq.StructFieldSchema** オブジェクトには、次のフィールドが含まれます。

**パラメーター:**

- **name** (*String*) -

    struct フィールドの名前です。

- **description** (*String*) -

    struct フィールドの説明です。デフォルトは空の文字列です。

- **fields** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    struct フィールドのサブフィールドです。サブフィールドでは、Array、ArrayOfVector、Struct の要素型はサポートされていません。

- **maxCapacity** (*Integer*) -

    struct フィールドに格納できる要素の最大数です。

- **nullable** (*Boolean*) -

    struct フィールドが null を許可するかどうかを示します。デフォルト: `false`。

- **typeParams** (*Map&lt;String, String&gt;*) -

    struct フィールドの型パラメーターです。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.StructFieldSchema> fields = schema.getStructFields();
```
