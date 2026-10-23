---
title: "CreateCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたスキーマとオプションを使用してコレクションを作成します。 | Cloud"
type: docx
token: IQZ6dYY6hoNwfxxOJIjcVRqEn97
sidebar_position: 14
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CreateCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateCollection()

この操作は、指定されたスキーマとオプションを使用してコレクションを作成します。

```c++
Status CreateCollection(const CreateCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithDescription(description)
    .WithCollectionSchema(schema)
    .WithNumPartitions(num_partitions)
    .WithNumShards(num_shards)
    .WithConsistencyLevel(level)
    .WithProperties(properties)
    .AddProperty(key, property)
    .WithIndexes(indexes)
    .AddIndex(index);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    コレクションを作成するデータベースの名前を設定します。

- `WithCollectionName(const std::string& collection_name)`

    作成するコレクションの名前を設定します。

- `WithDescription(const std::string& description)`

    コレクションの説明を設定します。

- `WithCollectionSchema(const CollectionSchemaPtr& schema)`

    コレクションのフィールドを定義するコレクションスキーマを設定します。スキーマへの共有ポインター（const CollectionSchemaPtr&）を受け取ります。

- `WithNumPartitions(int64_t num_partitions)`

    コレクションがパーティションキーフィールドを使用する場合に作成されるパーティション数を設定します。

- `WithNumShards(int64_t num_shards)`

    コレクションのシャード数を設定します。

- `WithConsistencyLevel(ConsistencyLevel level)`

    コレクションのデフォルトの整合性レベルを設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    TTL 保持期間を定義する「コレクション.ttl.seconds」などのコレクションレベルのプロパティを設定します。マップは右辺値参照で渡されるため、std::move を使用して渡します。

- `AddProperty(const std::string& key, const std::string& property)`

    コレクションレベルの単一のプロパティをキーと値のペアとして追加します。

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    コレクションとともに作成するインデックスを設定します。ベクトルは右辺値参照で渡されるため、std::move を使用して渡します。

- `AddIndex(IndexDesc&& index)`

    コレクションとともに作成するインデックスを1つ追加します。インデックスは右辺値参照で渡されるため、std::move を使用して渡します。

**戻り値：**

*Status*

コレクションが正常に作成されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で CreateCollection() を呼び出し、スキーマと整合性レベルを持つコレクションを作成します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string db_name = "default";
const std::string collection_name = "book";
const std::string description = "a collection for books";

milvus::CollectionSchema schema(collection_name);
schema.AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema.AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR, "").WithDimension(8));

auto request = milvus::CreateCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithDescription(description)
    .WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema))
    .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);
status = client->CreateCollection(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
