---
title: "getStructField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructField
sidebar_label: "getStructField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションスキーマから名前で構造体フィールドのスキーマを返します。 | Java | v2"
type: docx
token: KJSvdrks9o6WOsxr0rZcPXe5ngn
sidebar_position: 7
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructField()

この操作では、コレクションスキーマから名前で構造体フィールドのスキーマを返します。

```java
public CreateCollectionReq.StructFieldSchema getStructField(String fieldName)
```

**パラメーター:**

- **fieldName** (*String*) -

    構造体フィールドの名前です。

**戻り値の型:**

*CreateCollectionReq.StructFieldSchema*

**戻り値:**

**CreateCollectionReq.StructFieldSchema** オブジェクトには、以下のフィールドが含まれます。

**パラメーター:**

- **name** (*String*) -

    構造体フィールドの名前です。

- **description** (*String*) -

    構造体フィールドの説明です。デフォルトは空の文字列です。

- **fields** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    構造体フィールドのサブフィールドです。サブフィールドでは、Array、ArrayOfVector、Struct の要素型はサポートされていません。

- **maxCapacity** (*Integer*) -

    構造体フィールドが保持できる要素の最大数です。

- **nullable** (*Boolean*) -

    構造体フィールドを null にできるかどうかです。デフォルトは `false` です。

- **typeParams** (*Map&lt;String, String&gt;*) -

    構造体フィールドの型パラメーターです。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
CreateCollectionReq.StructFieldSchema structField = schema.getStructField("metadata");
```
