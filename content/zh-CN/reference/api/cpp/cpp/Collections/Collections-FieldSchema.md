---
title: "FieldSchema | Cloud"
slug: /cpp/cpp/Collections-FieldSchema
sidebar_label: "FieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类描述 Collection Schema 中的单个字段。在定义 Collection 的结构时，将 `FieldSchema` 实例传递给 `CollectionSchema:AddField()`。`FieldSchema` 支持流式 With&ast; 构建器 API，因此可以在同一行中链式定义。 | Cloud"
type: docx
token: CmVxdb9mxoe1UixZ3nxc2fmCnOg
sidebar_position: 24
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - FieldSchema
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# FieldSchema

此类描述 Collection Schema 中的单个字段。在定义 Collection 的结构时，将 `FieldSchema` 实例传递给 `CollectionSchema::AddField()`。`FieldSchema` 支持流式 With&ast; 构建器 API，因此可以在同一行中链式定义。

```c++
FieldSchema();
FieldSchema(std::string name, DataType data_type,
            std::string description = "",
            bool is_primary_key = false,
            bool auto_id = false);
```

**参数：**

- **name**（*std::string*）

    设置字段名称。在 Collection 中必须唯一。

- **data_type**（*[DataType](./Collections-DataType)*）

    设置字段的数据类型。所有支持的值请参见 `DataType`。

- **description**（*std::string*）

    设置可选的人类可读描述。该值默认为 `""`。

- **is_primary_key**（*bool*）

    当为 `true` 时，此字段为主键。每个 Collection 必须恰好有一个主键字段。主键类型仅支持 `INT64` 和 `VARCHAR`。该值默认为 `false`。

- **auto_id**（*bool*）

    当为 `true` 时，服务器会在插入时自动生成主键值。仅在 `is_primary_key` 为 `true` 时有效。该值默认为 `false`。

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

    将此字段标记为主键。只有 `INT64` 和 `VARCHAR` 字段可以作为主键。

- `WithAutoID(bool auto_id)`

    启用插入时在服务器端自动生成主键值。仅在同时设置 `WithPrimaryKey(true)` 时有效。

- `WithDimension(uint32_t dimension)`

    设置向量维度。对于 `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR` 和 `INT8_VECTOR` 字段为**必需**。对于 `BINARY_VECTOR`，维度必须是 8 的倍数。

- `WithMaxLength(uint32_t length)`

    设置 `VARCHAR` 字段的最大字节长度。对于 `VARCHAR` 字段为**必需**。最大值为 65535。

- `WithElementType(DataType dt)`

    设置 `ARRAY` 字段的元素类型。对于 `ARRAY` 字段为**必需**。支持的元素类型：除 `JSON` 外的所有标量类型。

- `WithMaxCapacity(uint32_t capacity)`

    设置 `ARRAY` 字段中元素的最大数量。对于 `ARRAY` 字段为**必需**。

- `WithPartitionKey(bool partition_key)`

    将此字段指定为 Partition 键。每个 Collection 最多只有一个字段可以作为 Partition 键。

- `WithClusteringKey(bool clustering_key)`

    将此字段指定为用于数据聚类的聚类键。每个 Collection 最多只有一个字段。

- `WithNullable(bool nullable)`

    允许此字段包含 `null` 值。除主键外的所有标量字段均支持此设置。该值默认为 `false`。

- `WithDefaultValue(const nlohmann::json& val)`

    设置当 Entity 未为此字段提供值时使用的默认值。`JSON` 和 `ARRAY` 字段不支持此设置。

- `EnableAnalyzer(bool enable)`

    为 `VARCHAR` 字段启用分词/text 分析。文本匹配和全文搜索功能要求启用此设置。

- `EnableMatch(bool enable)`

    在 `VARCHAR` 字段上启用 `TEXT_MATCH` 过滤。需要设置 `EnableAnalyzer(true)`。

- `WithAnalyzerParams(const nlohmann::json& params)`

    设置 `VARCHAR` 字段的文本 Analyzer 配置（分词器、过滤器等）。不能与 `WithMultiAnalyzerParams()` 一起使用。

- `WithMultiAnalyzerParams(const nlohmann::json& params)`

    设置多语言文本字段的按语言 Analyzer 配置。不能与 `WithAnalyzerParams()` 一起使用。

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
