---
title: "getFieldSchemaList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFieldSchemaList
sidebar_label: "getFieldSchemaList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマ内のすべてのフィールドスキーマのリストを返します。 | Java | v2"
type: docx
token: XssmdFjdZoXgyXxMDxWceywrnud
sidebar_position: 5
keywords: 
  - プライベート LLM
  - 最近傍検索
  - LLM 評価
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - クラウド
  - getFieldSchemaList()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFieldSchemaList()

この操作は、コレクションスキーマ内のすべてのフィールドスキーマのリストを返します。

```java
public List<CreateCollectionReq.FieldSchema> getFieldSchemaList()
```

**戻り値の型:**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**戻り値:**

**CreateCollectionReq.FieldSchema** オブジェクトのリストです。各 **CreateCollectionReq.FieldSchema** オブジェクトには、以下のフィールドが含まれます。

**パラメーター:**

- **name** (*String*) -

    フィールドの名前です。

- **description** (*String*) -

    フィールドの説明です。デフォルトは空文字列です。

- **dataType** (*DataType*) -

    フィールドのデータ型です。

- **maxLength** (*Integer*) -

    値に含めることができる最大文字数です。このフィールドの **dataType** が **DataType.VarChar** に設定されている場合に必要です。デフォルト: `65535`。

- **dimension** (*Integer*) -

    ベクトルフィールドの次元数です。値は 1 より大きくする必要があり、通常は使用している埋め込みモデルによって決まります。

- **isPrimaryKey** (*Boolean*) -

    現在のフィールドがプライマリフィールドかどうかです。デフォルト: `false`。

- **isPartitionKey** (*Boolean*) -

    現在のフィールドがパーティションキーフィールドかどうかです。デフォルト: `false`。

- **isClusteringKey** (*Boolean*) -

    現在のフィールドがクラスタリングキーフィールドかどうかです。デフォルト: `false`。

- **autoID** (*Boolean*) -

    プライマリフィールドが自動的にインクリメントされるかどうかです。デフォルト: `false`。

- **elementType** (*DataType*) -

    配列フィールド内の要素のデータ型です。このフィールドの **dataType** が **DataType.Array** に設定されている場合に必要です。

- **maxCapacity** (*Integer*) -

    配列フィールドに含めることができる要素の最大数です。このフィールドの **dataType** が **DataType.Array** に設定されている場合に必要です。

- **isNullable** (*Boolean*) -

    フィールドが null 値を受け入れるかどうかです。スカラーフィールドにのみ適用されます。デフォルト: `false`。

- **defaultValue** (*Object*) -

    フィールドのデフォルト値です。データ挿入時に値が明示的に指定されなかった場合に使用されます。スカラーフィールドにのみ適用されます。

- **enableAnalyzer** (*Boolean*) -

    `VARCHAR` フィールドのテキスト分析を有効にするかどうかです。`true` に設定すると、Milvus はフィールドの内容に対してテキストアナライザー（BM25 トークナイザー）を使用します。

- **analyzerParams** (*Map&lt;String, Object&gt;*) -

    `VARCHAR` フィールドのアナライザー設定（トークナイザーとフィルターの設定）です。

- **enableMatch** (*Boolean*) -

    `VARCHAR` フィールドのキーワードマッチングを有効にするかどうかです（BM25 キーワード検索）。

- **typeParams** (*Map&lt;String, String&gt;*) -

    フィールドのデータ型に固有のパラメーターです（例: `VarChar` フィールドの `maxLength`）。指定した値は、対応する `typeParams` キーを上書きします。

- **multiAnalyzerParams** (*Map&lt;String, Object&gt;*) -

    テキストフィールドに複数のアナライザーを構成し、このテキストフィールドに多言語のドキュメントを格納できるようにする多言語アナライザーです。

- **externalField** (*String*) -

    この Milvus フィールドがマップされる外部フィールドの名前です。デフォルトは空文字列です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.FieldSchema> fields = schema.getFieldSchemaList();
```
