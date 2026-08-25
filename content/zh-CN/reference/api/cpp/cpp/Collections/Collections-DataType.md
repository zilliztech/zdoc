---
title: "DataType | Cloud"
slug: /cpp/cpp/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此枚举用于指定 Collection 字段的数据类型。在构造 `DataType` 或调用 `FieldSchema:WithDataType()` 时，请传入一个 `FieldSchema` 值。 | Cloud"
type: docx
token: SGYTdh0fJo6O1uxW3yjcET9Nnpf
sidebar_position: 16
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DataType

此枚举用于指定 Collection 字段的数据类型。在构造 `FieldSchema` 或调用 `FieldSchema::WithDataType()` 时，请传入一个 `DataType` 值。

```c++
enum class DataType {
    UNKNOWN = 0,
    BOOL = 1,
    INT8 = 2,
    INT16 = 3,
    INT32 = 4,
    INT64 = 5,
    FLOAT = 10,
    DOUBLE = 11,
    VARCHAR = 21,
    ARRAY = 22,
    JSON = 23,
    GEOMETRY = 24,
    TIMESTAMPTZ = 26,
    BINARY_VECTOR = 100,
    FLOAT_VECTOR = 101,
    FLOAT16_VECTOR = 102,
    BFLOAT16_VECTOR = 103,
    SPARSE_FLOAT_VECTOR = 104,
    INT8_VECTOR = 105,
    STRUCT = 201,
};
```

**取值：**

*标量类型：*

- **BOOL** (1) - 布尔值（`true` / `false`）。

- **INT8** (2) - 8 位有符号整数（−128 至 127）。

- **INT16** (3) - 16 位有符号整数。

- **INT32** (4) - 32 位有符号整数。

- **INT64** (5) - 64 位有符号整数。这是唯一支持作为主键的标量类型。

- **FLOAT** (10) - 32 位单精度浮点数。

- **DOUBLE** (11) - 64 位双精度浮点数。

- **VARCHAR** (21) - 可变长度的 UTF-8 字符串。需指定 `WithMaxLength()`（最大 65535 字节）。

- **ARRAY** (22) - 包含单一类型标量元素的数组。需指定 `WithElementType()` 和 `WithMaxCapacity()`。

- **JSON** (23) - 非结构化 JSON 文档。支持对任意嵌套键路径进行动态过滤。

- **GEOMETRY** (24) - 以 Well-Known Binary (WKB) 格式存储的几何/spatial数据。

- **TIMESTAMPTZ** (26) - 带时区的时间戳（RFC 3339 字符串）。

*向量类型：*

- **BINARY_VECTOR** (100) - 按位打包的二进制向量。维度必须为 8 的倍数。需指定 `WithDimension()`。通常与 `MetricType::HAMMING` 或 `MetricType::JACCARD` 搭配使用。

- **FLOAT_VECTOR** (101) - 32 位浮点稠密向量。需指定 `WithDimension()`。这是最常用的向量类型。

- **FLOAT16_VECTOR** (102) - 16 位半精度 (FP16) 浮点向量。需指定 `WithDimension()`。其内存占用仅为 `FLOAT_VECTOR` 的一半，且召回率损失极小。

- **BFLOAT16_VECTOR** (103) - Brain Float 16 (BF16) 向量。需指定 `WithDimension()`。其数值范围优于 FP16，常用于 ML 模型输出。

- **SPARSE_FLOAT_VECTOR** (104) - 大多数维度为零的稀疏浮点向量。无固定维度限制。适用于通过 `MetricType::BM25` 进行关键词搜索。

- **INT8_VECTOR** (105) - INT8 量化稠密向量。需指定 `WithDimension()`。在所有稠密向量类型中内存占用最小。

*多向量类型：*

- **STRUCT** (201) - 包含多个命名子向量的多向量结构体字段。需配合 `StructFieldSchema` 使用。

*内部类型：*

- **UNKNOWN** (0) - 未初始化或无法识别的类型。请勿直接使用。

### Schema 类型与列负载\{#schema-type-and-column-payloads}

`DataType` 用于标识 Collection Schema 中存储的逻辑类型。该类型由 `Insert()` 和 `Upsert()` 共享，但并非随 DML 请求传递的 C++ 容器。这些方法会将每种 Schema 类型映射到具体的 `XxxFieldData` 容器，并通过 `FieldDataPtr` 接收数据。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/DataType.h>
using namespace milvus;

CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();

// Scalar fields
schema->AddField(FieldSchema("id",   DataType::INT64,   "primary key").WithPrimaryKey(true));
schema->AddField(FieldSchema("name", DataType::VARCHAR, "user name").WithMaxLength(200));
schema->AddField(FieldSchema("age",  DataType::INT8,    "user age"));
schema->AddField(FieldSchema("tags", DataType::ARRAY,   "tag list")
                    .WithElementType(DataType::VARCHAR).WithMaxCapacity(10));
schema->AddField(FieldSchema("meta", DataType::JSON,    "extra metadata"));

// Vector field
schema->AddField(FieldSchema("vec", DataType::FLOAT_VECTOR, "embedding").WithDimension(128));

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema));
```
