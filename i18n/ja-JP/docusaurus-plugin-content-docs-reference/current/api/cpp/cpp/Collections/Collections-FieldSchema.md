---
title: "FieldSchema | Cloud"
slug: /cpp/cpp/Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、コレクションスキーマ内の単一フィールドを定義します。コレクションの構造を定義する際は、`FieldSchema` インスタンスを `CollectionSchema:AddField()` に渡します。`FieldSchema` は流暢な With ビルダー API をサポートしており、定義を 1 行で連結できます。 | Cloud"
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

このクラスは、コレクションスキーマ内の単一フィールドを定義します。コレクションの構造を定義する際は、`FieldSchema` インスタンスを `CollectionSchema::AddField()` に渡します。`FieldSchema` は流暢な With* ビルダー API をサポートしており、定義を 1 行で連結できます。

```c++
FieldSchema();
FieldSchema(std::string name, DataType data_type,
            std::string description = "",
            bool is_primary_key = false,
            bool auto_id = false);
```

**パラメーター:**

- **name** (*std::string*)

    フィールド名を設定します。コレクション内で一意である必要があります。

- **data_type** (*[DataType](./Collections-DataType)*)

    フィールドのデータ型を設定します。サポートされているすべての値については、`DataType` を参照してください。

- **description** (*std::string*)

    任意の可読な説明を設定します。デフォルト: `""`。

- **is_primary_key** (*bool*)

    `true` の場合、このフィールドがプライマリキーとなります。各コレクションにはプライマリキーフィールドがちょうど 1 つ必要です。プライマリキー型としてサポートされているのは `INT64` と `VARCHAR` のみです。デフォルト: `false`。

- **auto_id** (*bool*)

    `true` の場合、挿入時にサーバーがプライマリキー値を自動生成します。`is_primary_key` が `true` の場合のみ有効です。デフォルト: `false`。

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

    このフィールドをプライマリキーとして指定します。プライマリキーにできるのは `INT64` フィールドと `VARCHAR` フィールドのみです。

- `WithAutoID(bool auto_id)`

    挿入時にサーバー側でプライマリキー値を自動生成できるようにします。`WithPrimaryKey(true)` も設定されている場合のみ有効です。

- `WithDimension(uint32_t dimension)`

    ベクトル次元を設定します。`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` フィールドでは**必須**です。`BINARY_VECTOR` の場合、次元は 8 の倍数である必要があります。

- `WithMaxLength(uint32_t length)`

    `VARCHAR` フィールドの最大バイト長を設定します。`VARCHAR` フィールドでは**必須**です。最大値: 65535。

- `WithElementType(DataType dt)`

    `ARRAY` フィールドの要素型を設定します。`ARRAY` フィールドでは**必須**です。サポートされている要素型: `JSON` を除くすべてのスカラー型。

- `WithMaxCapacity(uint32_t capacity)`

    `ARRAY` フィールドの最大要素数を設定します。`ARRAY` フィールドでは**必須**です。

- `WithPartitionKey(bool partition_key)`

    このフィールドをパーティションキーとして指定します。コレクションごとにパーティションキーにできるフィールドは最大 1 つです。

- `WithClusteringKey(bool clustering_key)`

    データクラスタリング用のクラスタリングキーとしてこのフィールドを指定します。コレクションごとに最大 1 つのフィールドまで指定できます。

- `WithNullable(bool nullable)`

    このフィールドで `null` 値を許可します。プライマリキーを除くすべてのスカラーフィールドでサポートされています。デフォルト: `false`。

- `WithDefaultValue(const nlohmann::json& val)`

    エンティティがこのフィールドに値を指定しなかった場合に使用されるデフォルト値を設定します。`JSON` フィールドおよび `ARRAY` フィールドではサポートされていません。

- `EnableAnalyzer(bool enable)`

    `VARCHAR` フィールドのトークン化/text分析を有効にします。テキストマッチおよび全文検索機能に必要です。

- `EnableMatch(bool enable)`

    `VARCHAR` フィールドで `TEXT_MATCH` フィルタリングを有効にします。`EnableAnalyzer(true)` が必要です。

- `WithAnalyzerParams(const nlohmann::json& params)`

    `VARCHAR` フィールドのテキストアナライザー設定（トークナイザー、フィルターなど）を設定します。`WithMultiAnalyzerParams()` と併用することはできません。

- `WithMultiAnalyzerParams(const nlohmann::json& params)`

    多言語テキストフィールドの言語別アナライザー設定を行います。`WithAnalyzerParams()` と併用することはできません。

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
