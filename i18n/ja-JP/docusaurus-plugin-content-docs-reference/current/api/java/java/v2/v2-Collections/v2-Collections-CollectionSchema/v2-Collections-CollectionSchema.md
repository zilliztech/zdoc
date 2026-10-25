---
title: "CollectionSchema | Java | v2"
slug: /java/java/v2-Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造の概要を示します。 | Java | v2"
type: docx
token: IXVHdXVncoEp64xD6vdcvUJwnlH
sidebar_position: 2
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CollectionSchema
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造の概要を示します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## コンストラクター\{#constructor}

フィールド、データ型、その他のパラメータを定義して、コレクションのスキーマを構築します。

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

**ビルダーメソッド：**

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema> fieldSchemaList)` -

    コレクションスキーマ内のフィールドを定義する **FieldSchema** オブジェクトのリストです。フィールドスキーマは単一フィールドのメタデータを表現して保持し、**CollectionSchema** は FieldSchema オブジェクトのリストをまとめて完全なスキーマを定義します。

- `structFields(List<CreateCollectionReq.StructFieldSchema> structFields)` -

    スキーマの構造体フィールド（ネストされたオブジェクトフィールド）のリストです。コレクションに、値自体が構造化レコードであるフィールドが含まれる場合に使用します。

- `enableDynamicField(boolean enableDynamicField)` -

    `true` に設定すると、非表示の動的フィールド（`$meta`）を有効にし、宣言されたスキーマ外の任意のキーと値の属性を挿入時に含められるようにします。デフォルトは `false` です。

- `functionList(List<CreateCollectionReq.Function> functionList)` -

    挿入時に既存のフィールドから値を導出する関数（例: BM25、JSON-path extraction）を関連付けます。各 `Function` は、入力、出力、およびパラメータを宣言します。

- `externalSource(String externalSource)` -

    このコレクションにバインドされた外部ソース（例: S3 バケット、Lakehouse テーブル）を識別します。`externalSpec` と組み合わせて、Milvus の外部から更新される外部コレクションを定義します。

- `externalSpec(JsonObject externalSpec)` -

    外部ソースの仕様です。通常は接続の詳細と更新ポリシーを記述した JSON です。`externalSource` と組み合わせて使用します。

**戻り値の型：**

*CollectionSchema*

**戻り値：**

**CollectionSchema** オブジェクトです。

**CollectionSchema** オブジェクトには以下のフィールドが含まれます。

**パラメーター：**

- **fieldSchemaList** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    コレクションスキーマ内の通常のフィールドを定義する **FieldSchema** オブジェクトのリストです。

- **structFields** (*List&lt;CreateCollectionReq.StructFieldSchema&gt;*) -

    コレクションスキーマ内の構造体フィールド（ネストされたオブジェクトフィールド）を定義する **StructFieldSchema** オブジェクトのリストです。

- **enableDynamicField** (*boolean*) -

    宣言されたスキーマ外の任意のキーと値の属性を挿入時に含められるよう、非表示の動的フィールド（`$meta`）が有効かどうかを示します。デフォルトは `false` です。

- **functionList** (*List&lt;CreateCollectionReq.Function&gt;*) -

    挿入時に既存のフィールドから値を導出する、スキーマに関連付けられた関数（例: BM25、JSON-path extraction）です。

- **externalSource** (*String*) -

    このコレクションにバインドされた外部ソース（例: S3 バケットまたは Lakehouse テーブル）の名前です。デフォルトは空の文字列です。

- **externalSpec** (*JsonObject*) -

    外部ソースの仕様です。通常は接続の詳細と更新ポリシーを記述した JSON です。

**例外：**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

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

## メソッド\{#methods}

以下は `CollectionSchema` クラスのメソッドです。
