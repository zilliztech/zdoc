---
title: "CreateCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建 Collection。 | Cloud"
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

此操作用于创建 Collection。

```c++
Status CreateCollection(const CreateCollectionRequest& request)
```

## 请求语法\{#request-syntax}

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

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置待创建 Collection 所属的 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

    <Admonition type="info" icon="📘" title="Notes">

    在早期版本中，**[CollectionSchema](./Collections-CollectionSchema)** 也包含 Collection 名称。**WithCollectionName()** 将覆盖 **[CollectionSchema](./Collections-CollectionSchema)** 中指定的 Collection 名称。

    </Admonition>

- `WithDescription(const std::string& description)`

    设置 Collection 的名称。

    <Admonition type="info" icon="📘" title="Notes">

    在早期版本中，**[CollectionSchema](./Collections-CollectionSchema)** 也包含描述信息。**WithDescription()** 将覆盖 **[CollectionSchema](./Collections-CollectionSchema)** 中指定的 Collection 描述。

    </Admonition>

- `WithCollectionSchema(const [CollectionSchemaPtr](./Collections-CollectionSchema)& schema)`

    设置 Collection 的 Schema。

- `WithNumPartitions(int64_t num_partitions)`

    当存在 Partition Key 时，设置 Partition 数量。

- `WithNumShards(int64_t num_shards)`

    设置 Collection 的分片数。

    <Admonition type="info" icon="📘" title="Notes">

    在早期版本中，**[CollectionSchema](./Collections-CollectionSchema)** 也包含分片数。**WithNumShards()** 将覆盖 **[CollectionSchema](./Collections-CollectionSchema)** 中指定的分片数。

    </Admonition>

- `WithConsistencyLevel([ConsistencyLevel](./Collections-ConsistencyLevel) level)`

    设置该 Collection 的默认一致性级别。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置该 Collection 的属性。

- `AddProperty(const std::string& key, const std::string& property)`

    设置该 Collection 的单个属性。

- `WithIndexes(std::vector<[IndexDesc](./Management-IndexDesc)>&& indexes)`

    设置需要创建的索引。

- `AddIndex([IndexDesc](./Management-IndexDesc)&& index)`

    为正在创建的 Collection 添加索引。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

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
