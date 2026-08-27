---
title: "StructFieldSchema | Cloud"
slug: /cpp/cpp/Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、コレクションスキーマにおける構造体型フィールド（マルチベクトル型）を定義します。マルチベクトルスキーマの構築時に、`StructFieldSchema` インスタンスを `CollectionSchema:AddStructField()` に渡してください。`StructFieldSchema` は、メソッドチェーンに対応した With/Add ビルダー API を提供します。 | Cloud"
type: docx
token: E8V0dJNffoNiQHxsYyGcmQbennc
sidebar_position: 32
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

このクラスは、コレクションスキーマにおける構造体型フィールド（マルチベクトル型）を定義します。マルチベクトルスキーマの構築時に、`StructFieldSchema` インスタンスを `CollectionSchema::AddStructField()` に渡してください。`StructFieldSchema` は、メソッドチェーンに対応した With*/Add* ビルダー API を提供します。

```c++
StructFieldSchema();
explicit StructFieldSchema(std::string name, std::string description = "");
```

**パラメータ:**

- **name** (*std::string*)

    構造体フィールドの名前です。コレクション内で一意である必要があります。

- **description** (*std::string*)

    任意の可読な説明です。デフォルト: `""`。

## リクエスト構文\{#request-syntax}

```c++
StructFieldSchema(name, description)
    .WithName(name)
    .WithDescription(description)
    .WithMaxCapacity(capacity)
    .AddField(field_schema);
```

**リクエストメソッド:**

- `StructFieldSchema& WithName(std::string name)`

    フィールド名を設定し、メソッドチェーン用にスキーマを返します。

- `StructFieldSchema& WithDescription(std::string description)`

    説明を設定し、メソッドチェーン用にスキーマを返します。

- `StructFieldSchema& WithMaxCapacity(int64_t capacity)`

    構造体フィールドに格納できる要素の最大数を設定します。メソッドチェーン用にスキーマを返します。

- `StructFieldSchema& AddField(const FieldSchema& field_schema)`

    サブフィールド（構造体内のベクトルフィールド）を追加し、メソッドチェーン用にスキーマを返します。FieldSchema の詳細については、FieldSchema を参照してください。

- `const std::vector<FieldSchema>& Fields() const`

    これまでに追加されたサブフィールドのリストを返します。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

// Build a schema with a STRUCT field containing two vector sub-fields
CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();
schema->AddField(FieldSchema("id", DataType::INT64).WithPrimaryKey(true).WithAutoID(true));

StructFieldSchema struct_field("embeddings", "multi-vector struct field");
struct_field
    .WithMaxCapacity(2)
    .AddField(FieldSchema("dense", DataType::FLOAT_VECTOR).WithDimension(128))
    .AddField(FieldSchema("sparse", DataType::SPARSE_FLOAT_VECTOR));

schema->AddStructField(struct_field);

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
auto status = client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("multi_vec_collection")
        .WithCollectionSchema(schema));
```
