---
title: "CollectionSchema | Java | v2"
slug: /java/java/v2-Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスは、collection のスキーマを表します。スキーマは collection の構造を概説します。 | Java | v2"
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
  - cloud
  - CollectionSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** インスタンスは、collection のスキーマを表します。スキーマは collection の構造を概説します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## Constructor\{#constructor}

フィールド、データ型、およびその他のパラメータを定義して、collection のスキーマを構築します。

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

**BUILDER METHODS:**

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema> fieldSchemaList)` -

    collection スキーマ内のフィールドを定義する **[FieldSchema](./v2-Collections-FieldSchema)** オブジェクトのリストです。field schema は単一フィールドのメタデータを表現し保持する一方、**CollectionSchema** は FieldSchema オブジェクトのリストをまとめて完全なスキーマを定義します。

- `structFields(List<CreateCollectionReq.StructFieldSchema> structFields)` -

    スキーマの構造体フィールド（ネストされたオブジェクトフィールド）のリストです。collection に、その値自体が構造化レコードであるフィールドが含まれる場合に使用します。

- `enableDynamicField(boolean enableDynamicField)` -

    `true` に設定すると、非表示の動的フィールド（`$meta`）を有効にし、宣言されたスキーマ外の任意のキー・バリュー属性を insert 時に含められるようにします。デフォルト: `false`。

- `functionList(List<CreateCollectionReq.Function> functionList)` -

    insert 時に既存フィールドから値を導出する関数（例: BM25、JSON-path extraction）を追加します。各 `Function` は、その入力、出力、およびパラメータを宣言します。

- `externalSource(String externalSource)` -

    この collection に紐付けられた外部ソース（例: S3 bucket、Lakehouse table）を識別します。`externalSpec` と組み合わせて、Milvus の外部から更新される external collection を定義します。

- `externalSpec(JsonObject externalSpec)` -

    外部ソースの仕様です。通常は接続詳細と更新ポリシーを記述した JSON です。`externalSource` とあわせて使用します。

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

**CollectionSchema** オブジェクト。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

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

## Methods\{#methods}

以下は `CollectionSchema` クラスのメソッドです:
