---
title: "FieldSchema | Cloud"
slug: /cpp/cpp/Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类用于描述 Collection Schema 中的单个字段。在定义 Collection 结构时，请将 `FieldSchema` 实例传递给 `CollectionSchema:AddField()`。`FieldSchema` 支持流式 With 构建器 API，允许在单行内链式完成定义。 | Cloud"
type: docx
token: CmVxdb9mxoe1UixZ3nxc2fmCnOg
sidebar_position: 24
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
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

此类用于描述 Collection Schema 中的单个字段。在定义 Collection 结构时，请将 `FieldSchema` 实例传递给 `CollectionSchema::AddField()`。`FieldSchema` 支持流式 With* 构建器 API，允许在单行内链式完成定义。

```c++
FieldSchema();
FieldSchema(std::string name, DataType data_type,
            std::string description = "",
            bool is_primary_key = false,
            bool auto_id = false);
```

**参数：**

- **name** (*std::string*)

    设置字段名称。该名称在 Collection 内必须唯一。

- **data_type** (*[DataType](./Collections-DataType)*)

    设置字段的数据类型。所有支持的值请参见 `DataType`。

- **description** (*std::string*)

    设置可选的可读描述。默认值：`""`。

- **is_primary_key** (*bool*)

    当值为 `true` 时，表示该字段为主键。每个 Collection 必须有且仅有一个主键字段。仅支持 `INT64` 和 `VARCHAR` 作为主键类型。默认值：`false`。

- **auto_id** (*bool*)

    当值为 `true` 时，服务器将在插入数据时自动生成主键值。仅当 `is_primary_key` 为 `true` 时生效。默认值：`false`。

## 请求语法\{#request-syntax}

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

**请求方法：**

- `WithPrimaryKey(bool is_primary_key)`

    将该字段指定为主键。仅 `INT64` 和 `VARCHAR` 类型的字段可用作主键。

- `WithAutoID(bool auto_id)`

    启用服务端在插入时自动生成主键值的功能。仅当同时设置了 `WithPrimaryKey(true)` 时生效。

- `WithDimension(uint32_t dimension)`

    设置向量维度。对于 `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR` 和 `INT8_VECTOR` 字段为**必填项**。对于 `BINARY_VECTOR` 字段，维度必须是 8 的倍数。

- `WithMaxLength(uint32_t length)`

    设置 `VARCHAR` 字段的最大字节长度。对于 `VARCHAR` 字段为**必填项**。最大值为 65535。

- `WithElementType(DataType dt)`

    设置 `ARRAY` 字段的元素类型。对于 `ARRAY` 字段为**必填项**。支持的元素类型包括除 `JSON` 以外的所有标量类型。

- `WithMaxCapacity(uint32_t capacity)`

    设置 `ARRAY` 字段允许包含的最大元素数量。对于 `ARRAY` 字段为**必填项**。

- `WithPartitionKey(bool partition_key)`

    将该字段指定为 Partition Key。每个 Collection 最多只能有一个 Partition Key 字段。

- `WithClusteringKey(bool clustering_key)`

    将该字段指定为用于数据聚类的 Clustering Key。每个 Collection 最多只能有一个 Clustering Key 字段。

- `WithNullable(bool nullable)`

    允许该字段接受 `null` 值。除主键外的所有标量字段均支持此配置。默认值：`false`。

- `WithDefaultValue(const nlohmann::json& val)`

    设置当 Entity 未提供该字段值时使用的默认值。不支持 `JSON` 或 `ARRAY` 字段。

- `EnableAnalyzer(bool enable)`

    为 `VARCHAR` 字段启用分词/text分析。使用文本匹配和全文搜索功能时必须开启此项。

- `EnableMatch(bool enable)`

    在 `VARCHAR` 字段上启用 `TEXT_MATCH` 过滤。需先启用 `EnableAnalyzer(true)`。

- `WithAnalyzerParams(const nlohmann::json& params)`

    为 `VARCHAR` 字段设置文本 Analyzer 配置（包括分词器、过滤器等）。不可与 `WithMultiAnalyzerParams()` 同时使用。

- `WithMultiAnalyzerParams(const nlohmann::json& params)`

    为多语言文本字段设置分语言的 Analyzer 配置。不可与 `WithAnalyzerParams()` 同时使用。

## 示例\{#example}

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
