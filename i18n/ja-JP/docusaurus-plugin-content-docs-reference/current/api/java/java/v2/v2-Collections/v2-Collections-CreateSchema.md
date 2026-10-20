---
title: "CreateSchema() | Java | v2"
slug: /java/java/v2-Collections-CreateSchema
sidebar_label: "CreateSchema()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、コレクションのスキーマを作成します。 | Java | v2"
type: docx
token: DAIfdXKk5oCHeNxOUvCc1KcpnNh
sidebar_position: 21
keywords: 
  - セマンティック検索
  - 異常検出
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSchema()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# CreateSchema()

この操作では、コレクションのスキーマを作成します。

```java
public static CreateCollectionReq.CollectionSchema CreateSchema()
```

## リクエスト構文\{#request-syntax}

```java
MilvusClientV2.createSchema()
```

**パラメーター:**

なし

**戻り値の型:**

*CreateCollectionReq.CollectionSchema*

**戻り値:**

**CreateCollectionReq.CollectionSchema** オブジェクトです。

**CreateCollectionReq.CollectionSchema** オブジェクトには、以下のフィールドがあります。

**パラメーター:**

- **fieldSchemaList** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    コレクションスキーマ内の通常のフィールドを定義する **FieldSchema** オブジェクトのリストです。

- **structFields** (*List&lt;CreateCollectionReq.StructFieldSchema&gt;*) -

    コレクションスキーマ内の構造体フィールド（ネストされたオブジェクトのフィールド）を定義する **StructFieldSchema** オブジェクトのリストです。

- **enableDynamicField** (*boolean*) -

    宣言されたスキーマ外の任意のキーと値の属性を挿入時に指定できるよう、非表示の動的フィールド（`$meta`）が有効かどうか。デフォルト: `false`。

- **functionList** (*List&lt;CreateCollectionReq.Function&gt;*) -

    スキーマにアタッチされ、挿入時に既存のフィールドから値を導出する関数（BM25、JSON パス抽出など）。

- **externalSource** (*String*) -

    このコレクションにバインドされた外部ソース（S3 バケットや Lakehouse テーブルなど）の名前。デフォルトは空文字列です。

- **externalSpec** (*JsonObject*) -

    外部ソースの仕様。通常は、接続の詳細と更新ポリシーを記述した JSON です。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2 Quickly create a collectionSchema
CreateCollectionReq.CollectionSchema collectionSchema = client.CreateSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```
