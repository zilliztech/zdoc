---
title: "CollectionSchema | Cloud"
slug: /cpp/cpp/Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类通过指定字段及动态字段配置来定义 Collection 的 Schema。为便于使用，提供了别名 `CollectionSchemaPtr`（即 `std:sharedptr`）。创建 Collection 时，请将该指针传递给 `CreateCollectionRequest::WithCollectionSchema()`。 | Cloud"
type: docx
token: AKq1dk2CLofyBXxCjAIcYdDNnae
sidebar_position: 11
keywords: 
  - what is milvus
  - milvus database
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

此类通过指定字段及动态字段配置来定义 Collection 的 Schema。为便于使用，提供了别名 `CollectionSchemaPtr`（即 `std::shared_ptr<CollectionSchema>`）。创建 Collection 时，请将该指针传递给 `CreateCollectionRequest::WithCollectionSchema()`。

```c++
CollectionSchema();
explicit CollectionSchema(std::string name, std::string desc = "",
                          int32_t shard_num = 1,
                          bool enable_dynamic_field = true);

using CollectionSchemaPtr = std::shared_ptr<CollectionSchema>;
```

**参数：**

- **name** (*std::string*)

    设置 Collection 名称。在 MilvusClientV2 中，名称需通过 `CreateCollectionRequest::WithCollectionName()` 设置，此构造函数参数将被忽略。

- **desc** (*std::string*)

    设置可选的可读描述。默认值：`""`。

- **shard_num** (*int32_t*)

    设置分片数。该值必须大于 `0`。默认值：`1`。在 MilvusClientV2 中，请改用 `CreateCollectionRequest::WithNumShards()` 进行设置。

- **enable_dynamic_field** (*bool*)

    当设置为 `true` 时，Entity 可包含未在 Schema 中声明的字段。这些额外字段将作为名为 `$meta` 的 JSON 字段存储在内部。默认值：`true`。

## 方法\{#methods}

**添加字段：**

- `bool AddField(const FieldSchema& field_schema)`

    向 Schema 追加一个普通字段。成功时返回 `true`。使用 `FieldSchema` 指定字段名、`DataType` 以及特定类型的配置（例如：向量字段的 `WithDimension()`、VARCHAR 字段的 `WithMaxLength()`、主键的 `WithPrimaryKey(true)`）。

- `const std::vector<FieldSchema>& Fields() const`

    返回当前已添加的字段 Schema 列表。

- `bool AddStructField(const StructFieldSchema& field_schema)`

    追加一个结构体字段（多向量类型）。成功时返回 `true`。

- `const std::vector<StructFieldSchema>& StructFields() const`

    返回结构体字段 Schema 列表。

- `void AddFunction(const FunctionPtr& function)`

    将内置函数（如 BM25 分词函数）绑定到 Schema。

- `const std::vector<FunctionPtr>& Functions() const`

    返回绑定到 Schema 的函数列表。

**动态字段：**

- `void SetEnableDynamicField(bool enable_dynamic_field)`

    在运行时启用或禁用动态字段。

- `bool EnableDynamicField() const`

    返回是否已启用动态字段。

**内省：**

- `std::string PrimaryFieldName() const`

    返回主键字段的名称。

- `std::unordered_set<std::string> AnnsFieldNames() const`

    返回 Schema 中所有向量（ANNS）字段的名称。

## 示例\{#example}

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
