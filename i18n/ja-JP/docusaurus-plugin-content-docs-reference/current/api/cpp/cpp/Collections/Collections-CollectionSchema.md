---
title: "CollectionSchema | Cloud"
slug: /cpp/cpp/Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、フィールドと動的フィールドの設定を指定してコレクションのスキーマを定義します。利便性のため、エイリアス `CollectionSchemaPtr`（`std:sharedptr`）が用意されています。コレクション作成時に `CreateCollectionRequest::WithCollectionSchema()` へのポインターを渡してください。 | Cloud"
type: docx
token: AKq1dk2CLofyBXxCjAIcYdDNnae
sidebar_position: 11
keywords: 
  - what is milvus
  - milvus データベース
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

このクラスは、フィールドと動的フィールドの設定を指定してコレクションのスキーマを定義します。利便性のため、エイリアス `CollectionSchemaPtr`（`std::shared_ptr<CollectionSchema>`）が用意されています。コレクション作成時に `CreateCollectionRequest::WithCollectionSchema()` へのポインターを渡してください。

```c++
CollectionSchema();
explicit CollectionSchema(std::string name, std::string desc = "",
                          int32_t shard_num = 1,
                          bool enable_dynamic_field = true);

using CollectionSchemaPtr = std::shared_ptr<CollectionSchema>;
```

**パラメーター:**

- **name** (*std::string*)

    コレクション名を設定します。MilvusClientV2 では `CreateCollectionRequest::WithCollectionName()` を通じて設定されるため、このコンストラクターパラメーターは無視されます。

- **desc** (*std::string*)

    任意で、人間が読みやすい説明を設定します。デフォルト: `""`。

- **shard_num** (*int32_t*)

    シャード数を設定します。値は `0` より大きい必要があります。デフォルト: `1`。MilvusClientV2 では、代わりに `CreateCollectionRequest::WithNumShards()` で設定してください。

- **enable_dynamic_field** (*bool*)

    `true` の場合、エンティティにスキーマで宣言されていないフィールドを含めることができます。これらの追加フィールドは、`$meta` という名前の JSON フィールドに内部的に格納されます。デフォルト: `true`。

## メソッド\{#methods}

**フィールドの追加:**

- `bool AddField(const FieldSchema& field_schema)`

    通常のフィールドをスキーマに追加します。成功時は `true` を返します。`FieldSchema` を使用して、フィールド名、`DataType`、および型固有の設定（例: ベクトルフィールドの `WithDimension()`、VARCHAR フィールドの `WithMaxLength()`、主キーの `WithPrimaryKey(true)`）を指定します。

- `const std::ベクトル<FieldSchema>& Fields() const`

    これまでに追加されたフィールドスキーマの一覧を返します。

- `bool AddStructField(const StructFieldSchema& field_schema)`

    構造体フィールド（マルチベクトル型）を追加します。成功時は `true` を返します。

- `const std::ベクトル<StructFieldSchema>& StructFields() const`

    構造体フィールドスキーマの一覧を返します。

- `void AddFunction(const FunctionPtr& function)`

    組み込み関数（BM25 トークナイザー関数など）をスキーマにアタッチします。

- `const std::ベクトル<FunctionPtr>& Functions() const`

    スキーマにアタッチされた関数の一覧を返します。

**動的フィールド:**

- `void SetEnableDynamicField(bool enable_dynamic_field)`

    実行時に動的フィールドの有効/無効を切り替えます。

- `bool EnableDynamicField() const`

    動的フィールドが有効かどうかを返します。

**イントロスペクション:**

- `std::string PrimaryFieldName() const`

    主キーフィールドの名前を返します。

- `std::unordered_set<std::string> AnnsFieldNames() const`

    スキーマ内のすべてのベクトル（ANNS）フィールド名を返します。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

// Build a schema: int64 primary key, varchar, int8, and a 128-dim float vector
CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();
schema->AddField(FieldSchema("id",  DataType::INT64,        "primary key").WithPrimaryKey(true));
schema->AddField(FieldSchema("name",DataType::VARCHAR,      "user name").WithMaxLength(200));
schema->AddField(FieldSchema("age", DataType::INT8,         "user age"));
schema->AddField(FieldSchema("vec", DataType::FLOAT_VECTOR, "embedding").WithDimension(128));

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

auto status = client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema)
        .AddIndex(IndexDesc("vec", "", IndexType::HNSW, MetricType::COSINE))
        .WithConsistencyLevel(ConsistencyLevel::STRONG));
```
