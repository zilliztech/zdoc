---
title: "FieldSchema | Cloud"
slug: /cpp/cpp/Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、コレクションスキーマ内の単一フィールドを記述します。コレクションの構造を定義するときは、`FieldSchema` インスタンスを `CollectionSchema:AddField()` に渡します。`FieldSchema` は、メソッドチェーン形式の With&ast; ビルダー API をサポートしているため、定義を 1 行でチェーンできます。 | Cloud"
type: docx
token: CmVxdb9mxoe1UixZ3nxc2fmCnOg
sidebar_position: 24
keywords: 
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - FieldSchema
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

このクラスは、コレクションスキーマ内の単一フィールドを記述します。コレクションの構造を定義するときは、`FieldSchema` インスタンスを `CollectionSchema::AddField()` に渡します。`FieldSchema` は、メソッドチェーン形式の With&ast; ビルダー API をサポートしているため、定義を 1 行でチェーンできます。

```c++
FieldSchema();
FieldSchema(std::string name, DataType data_type,
            std::string description = "",
            bool is_primary_key = false,
            bool auto_id = false);
```

**パラメータ:**

- **name** (*std::string*)

    フィールド名を設定します。コレクション内で一意である必要があります。

- **data_type** (*[DataType](./Collections-DataType)*)

    フィールドのデータ型を設定します。サポートされるすべての値については、`DataType` を参照してください。

- **description** (*std::string*)

    任意の人間が読める説明を設定します。デフォルト: `""`。

- **is_primary_key** (*bool*)

    `true` の場合、このフィールドは主キーです。各コレクションには、主キーフィールドが必ず 1 つだけ必要です。主キーの型としてサポートされるのは `INT64` と `VARCHAR` のみです。デフォルト: `false`。

- **auto_id** (*bool*)

    `true` の場合、サーバーは挿入時に主キー値を自動生成します。`is_primary_key` が `true` の場合にのみ有効です。デフォルト: `false`。

## リクエスト構文\{#request-syntax}

```c++
FieldSchema(name, data_type)
    .WithPrimaryKey(is_primary_key)
    .WithAutoID(auto_id)
    .WithDimension(dimension)
    .WithMaxLength(max_length)
    .WithElementType(element_type)
    .WithMaxCapacity(max_capacity)
    .WithPartitionKey(partition_key)
    .WithClusteringKey(clustering_key)
    .WithNullable(nullable)
    .WithDefaultValue(default_value)
    .EnableAnalyzer(enable_analyzer)
    .EnableMatch(enable_match)
    .WithAnalyzerParams(params)
    .WithMultiAnalyzerParams(params);
```

**リクエストメソッド:**

- `WithPrimaryKey(bool is_primary_key)`

    このフィールドを主キーとしてマークします。主キーにできるのは `INT64` と `VARCHAR` フィールドのみです。

- `WithAutoID(bool auto_id)`

    挿入時にサーバー側で主キー値を自動生成できるようにします。`WithPrimaryKey(true)` も設定されている場合にのみ有効です。

- `WithDimension(uint32_t dimension)`

    ベクトルの次元を設定します。`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` フィールドでは**必須**です。`BINARY_VECTOR` の場合、次元は 8 の倍数である必要があります。

- `WithMaxLength(uint32_t length)`

    `VARCHAR` フィールドの最大バイト長を設定します。`VARCHAR` フィールドでは**必須**です。最大値: 65535。

- `WithElementType(DataType dt)`

    `ARRAY` フィールドの要素型を設定します。`ARRAY` フィールドでは**必須**です。サポートされる要素型は、`JSON` を除くすべてのスカラー型です。

- `WithMaxCapacity(uint32_t capacity)`

    `ARRAY` フィールド内の要素の最大数を設定します。`ARRAY` フィールドでは**必須**です。

- `WithPartitionKey(bool partition_key)`

    このフィールドをパーティションキーとして指定します。コレクションごとに、パーティションキーにできるフィールドは最大 1 つです。

- `WithClusteringKey(bool clustering_key)`

    データクラスタリング用のクラスタリングキーとして、このフィールドを指定します。コレクションごとに指定できるフィールドは最大 1 つです。

- `WithNullable(bool nullable)`

    このフィールドに `null` 値を許可します。主キーを除くすべてのスカラーフィールドでサポートされます。デフォルト: `false`。

- `WithDefaultValue(const nlohmann::json& val)`

    エンティティがこのフィールドの値を指定しない場合に使用されるデフォルト値を設定します。`JSON` または `ARRAY` フィールドではサポートされません。

- `EnableAnalyzer(bool enable)`

    `VARCHAR` フィールドのトークン化/text 分析を有効にします。テキスト一致および全文検索機能に必要です。

- `EnableMatch(bool enable)`

    `VARCHAR` フィールドで `TEXT_MATCH` フィルタリングを有効にします。`EnableAnalyzer(true)` が必要です。

- `WithAnalyzerParams(const nlohmann::json& params)`

    `VARCHAR` フィールドのテキストアナライザー設定（トークナイザー、フィルターなど）を設定します。`WithMultiAnalyzerParams()` と併用できません。

- `WithMultiAnalyzerParams(const nlohmann::json& params)`

    多言語テキストフィールド向けに、言語別のアナライザー構成を指定します。`WithAnalyzerParams()` と併用できません。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();

// INT64 primary key with auto-generated IDs
schema->AddField(FieldSchema("id", DataType::INT64, "primary key")
                     .WithPrimaryKey(true).WithAutoID(true));

// VARCHAR field with text search enabled
schema->AddField(FieldSchema("title", DataType::VARCHAR, "article title")
                     .WithMaxLength(512)
                     .EnableAnalyzer(true)
                     .EnableMatch(true));

// Nullable INT32 field with a default value
schema->AddField(FieldSchema("views", DataType::INT32, "view count")
                     .WithNullable(true)
                     .WithDefaultValue(0));

// ARRAY of up to 5 VARCHAR tags
schema->AddField(FieldSchema("tags", DataType::ARRAY, "tag list")
                     .WithElementType(DataType::VARCHAR)
                     .WithMaxCapacity(5));

// 128-dim float vector
schema->AddField(FieldSchema("vec", DataType::FLOAT_VECTOR, "embedding")
                     .WithDimension(128));

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema)
        .AddIndex(IndexDesc("vec", "", IndexType::HNSW, MetricType::COSINE)));
```
