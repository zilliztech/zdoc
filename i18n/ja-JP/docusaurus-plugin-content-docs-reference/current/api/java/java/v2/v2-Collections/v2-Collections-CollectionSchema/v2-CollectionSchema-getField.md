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
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - getField()
  - javaV230
displayed_sidebar: javaSidebar

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

    フィールドの名前です。

**戻り値の型:**

*CreateCollectionReq.FieldSchema*

**戻り値:**

フィールドの詳細を含む FieldSchema オブジェクトです。

**CreateCollectionReq.FieldSchema** オブジェクトには、次のフィールドが含まれます。

**パラメーター:**

- **name** (*String*) -

    フィールドの名前です。

- **description** (*String*) -

    フィールドの説明です。デフォルトは空の文字列です。

- **dataType** (*DataType*) -

    フィールドのデータ型です。

- **maxLength** (*Integer*) -

    値に含めることができる最大文字数です。このフィールドの **dataType** が **DataType.VarChar** に設定されている場合に必要です。デフォルト: `65535`。

- **dimension** (*Integer*) -

    ベクトルフィールドの次元数です。値は 1 より大きい必要があり、通常は使用中の埋め込みモデルによって決まります。

- **isPrimaryKey** (*Boolean*) -

    現在のフィールドがプライマリフィールドかどうかを示します。デフォルト: `false`。

- **isPartitionKey** (*Boolean*) -

    現在のフィールドがパーティションキーフィールドかどうかを示します。デフォルト: `false`。

- **isClusteringKey** (*Boolean*) -

    現在のフィールドがクラスタリングキーフィールドかどうかを示します。デフォルト: `false`。

- **autoID** (*Boolean*) -

    プライマリフィールドが自動的にインクリメントされるかどうかを示します。デフォルト: `false`。

- **elementType** (*DataType*) -

    配列フィールド内の要素のデータ型です。このフィールドの **dataType** が **DataType.Array** に設定されている場合に必要です。

- **maxCapacity** (*Integer*) -

    配列フィールドに含めることができる最大要素数です。このフィールドの **dataType** が **DataType.Array** に設定されている場合に必要です。

- **isNullable** (*Boolean*) -

    フィールドが null 値を受け入れられるかどうかを示します。スカラーフィールドにのみ適用されます。デフォルト: `false`。

- **defaultValue** (*Object*) -

    フィールドのデフォルト値です。データ挿入時に値が明示的に指定されていない場合に使用されます。スカラーフィールドにのみ適用されます。

- **enableAnalyzer** (*Boolean*) -

    `VARCHAR` フィールドのテキスト分析を有効にするかどうかを示します。`true` に設定すると、Milvus はフィールドの内容にテキストアナライザー（BM25 トークナイザー）を使用します。

- **analyzerParams** (*Map&lt;String, Object&gt;*) -

    `VARCHAR` フィールドのアナライザー構成（トークナイザーとフィルターの設定）です。

- **enableMatch** (*Boolean*) -

    `VARCHAR` フィールドのキーワードマッチング（BM25 キーワード検索）を有効にするかどうかを示します。

- **typeParams** (*Map&lt;String, String&gt;*) -

    フィールドのデータ型に固有のパラメーターです（例: `VarChar` フィールドの `maxLength`）。指定した値は、対応する `typeParams` キーを上書きします。

- **multiAnalyzerParams** (*Map&lt;String, Object&gt;*) -

    テキストフィールドに複数のアナライザーを構成し、多言語のドキュメントをこのテキストフィールドに保存できる多言語アナライザーです。

- **externalField** (*String*) -

    この Milvus フィールドがマップされる外部フィールドの名前です。デフォルトは空の文字列です。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
