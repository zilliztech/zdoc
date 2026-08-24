---
title: "CreateCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションを作成する操作です。 | Cloud"
type: docx
token: ATMTdUxB5oRc3Sx8ByIcL58Anrh
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

コレクションを作成します。

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
    .WithProperties(value)
    .WithIndexes(indexes);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    コレクションを作成するデータベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

    <Admonition type="info" icon="📘" title="Notes">

    従来、**[CollectionSchema](./Collections-CollectionSchema)** にもコレクション名が含まれていましたが、**WithCollectionName()** を指定すると **[CollectionSchema](./Collections-CollectionSchema)** で設定したコレクション名が上書きされます。

    </Admonition>

- `WithDescription(const std::string& description)`

    コレクション名を設定します。

    <Admonition type="info" icon="📘" title="Notes">

    従来、**[CollectionSchema](./Collections-CollectionSchema)** にも説明が含まれていましたが、**WithDescription()** を指定すると **[CollectionSchema](./Collections-CollectionSchema)** で設定したコレクションの説明が上書きされます。

    </Admonition>

- `WithCollectionSchema(const [CollectionSchemaPtr](./Collections-CollectionSchema)& schema)`

    コレクションのスキーマを設定します。

- `WithNumPartitions(int64_t num_partitions)`

    パーティションキーがある場合のパーティション数を設定します。

- `WithNumShards(int64_t num_shards)`

    コレクションのシャード数を設定します。

    <Admonition type="info" icon="📘" title="Notes">

    従来、**[CollectionSchema](./Collections-CollectionSchema)** にもシャード数が含まれていましたが、**WithNumShards()** を指定すると **[CollectionSchema](./Collections-CollectionSchema)** で設定したシャード数が上書きされます。

    </Admonition>

- `WithConsistencyLevel([ConsistencyLevel](./Collections-ConsistencyLevel) level)`

    このコレクションのデフォルト整合性レベルを設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    このコレクションのプロパティを設定します。

- `AddProperty(const std::string& key, const std::string& property)`

    このコレクションのプロパティを1つ設定します。

- `WithIndexes(std::vector<[IndexDesc](./Management-IndexDesc)>&& indexes)`

    作成するインデックスを設定します。

- `AddIndex([IndexDesc](./Management-IndexDesc)&& index)`

    作成するコレクションにインデックスを追加します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、処理の成否を判断します。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr collection_schema = std::make_shared<milvus::CollectionSchema>();
collection_schema->AddField({field_id, milvus::DataType::INT64, "user id", true, false});
milvus::FieldSchema varchar_scheam{field_name, milvus::DataType::VARCHAR, "user name"};
varchar_scheam.SetMaxLength(100);
collection_schema->AddField(varchar_scheam);
collection_schema->AddField({field_age, milvus::DataType::INT8, "user age"});
collection_schema->AddField(
    milvus::FieldSchema(field_face, milvus::DataType::FLOAT_VECTOR, "face signature").WithDimension(dimension));

// define indexes
milvus::IndexDesc index_vector(field_face, "", milvus::IndexType::IVF_FLAT, milvus::MetricType::COSINE);
index_vector.AddExtraParam(milvus::NLIST, "100");
milvus::IndexDesc index_sort(field_age, "", milvus::IndexType::STL_SORT);
milvus::IndexDesc index_varchar(field_name, "", milvus::IndexType::TRIE);

// drop collection if it exists, the CreateCollectionRequest with indexes will automatically create indexes
// for this collection and load the collection
status = client->DropCollection(
    milvus::DropCollectionRequest().WithCollectionName(collection_name).WithDatabaseName(db_name));
status = client->CreateCollection(
    milvus::CreateCollectionRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .WithDescription("my collection")
        .WithNumShards(1)
        .WithCollectionSchema(collection_schema)
        .AddIndex(std::move(index_vector))
        .AddIndex(std::move(index_sort))
        .AddIndex(std::move(index_varchar))
        .AddProperty("my_prop", "dummy")                    // add a customized property
        .AddProperty(milvus::COLLECTION_TTL_SECONDS, "60")  // configure a built-in property
        .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
