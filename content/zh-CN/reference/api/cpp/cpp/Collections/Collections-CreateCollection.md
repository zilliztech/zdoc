---
title: "CreateCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用给定的 Schema 和选项创建 Collection。 | Cloud"
type: docx
token: IQZ6dYY6hoNwfxxOJIjcVRqEn97
sidebar_position: 14
keywords: 
  - RAG
  - NLP
  - 神经网络
  - 深度学习
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

此操作使用给定的 Schema 和选项创建 Collection。

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
    .WithProperties(properties)
    .AddProperty(key, property)
    .WithIndexes(indexes)
    .AddIndex(index);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置在其中创建 Collection 的 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置要创建的 Collection 的名称。

- `WithDescription(const std::string& description)`

    设置 Collection 的描述。

- `WithCollectionSchema(const CollectionSchemaPtr& schema)`

    设置用于定义 Collection 字段的 Collection Schema。接收指向该 Schema 的共享指针（const CollectionSchemaPtr&）。

- `WithNumPartitions(int64_t num_partitions)`

    设置当 Collection 使用 Partition Key 字段时创建的 Partition 数量。

- `WithNumShards(int64_t num_shards)`

    设置 Collection 的分片数。

- `WithConsistencyLevel(ConsistencyLevel level)`

    设置 Collection 的默认一致性级别。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置 Collection 级属性，例如“collection.ttl.seconds”，用于定义 TTL 保留窗口。该映射以右值引用传递，因此请使用 std::move 传递。

- `AddProperty(const std::string& key, const std::string& property)`

    以键值对形式添加单个 Collection 级属性。

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    设置要随 Collection 一起创建的索引。该向量以右值引用传递，因此请使用 std::move 传递。

- `AddIndex(IndexDesc&& index)`

    添加要随 Collection 一起创建的单个索引。该索引以右值引用传递，因此请使用 std::move 传递。

**返回值：**

*Status*

返回一个 Status，用于指示 Collection 是否创建成功。

**异常：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 CreateCollection()，以使用 Schema 和一致性级别创建 Collection。

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
