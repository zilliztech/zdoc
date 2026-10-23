---
title: "DataType | Cloud"
slug: /cpp/cpp/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此枚举指定 Collection 字段的数据类型。构造 `FieldSchema` 或调用 `FieldSchema:WithDataType()` 时，请传递一个 `DataType` 值。 | Cloud"
type: docx
token: JzFlderJdofWMTxKLpOcTyfon6d
sidebar_position: 16
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - DataType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DataType

此枚举指定 Collection 字段的数据类型。构造 `FieldSchema` 或调用 `FieldSchema::WithDataType()` 时，请传递一个 `DataType` 值。

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
    TEXT = 25,
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

**值：**

*标量类型：*

- **BOOL**（1） - 布尔值（`true` / `false`）。

- **INT8**（2） - 8 位有符号整数（−128 到 127）。

- **INT16**（3） - 16 位有符号整数。

- **INT32**（4） - 32 位有符号整数。

- **INT64**（5） - 64 位有符号整数。这是唯一支持作为主键的标量类型。

- **FLOAT**（10） - 32 位单精度浮点数。

- **DOUBLE**（11） - 64 位双精度浮点数。

- **VARCHAR**（21） - 可变长度的 UTF-8 字符串。需要使用 `WithMaxLength()`（最大 65535 字节）。

- **ARRAY**（22） - 由单一类型的标量元素组成的数组。需要使用 `WithElementType()` 和 `WithMaxCapacity()`。

- **JSON**（23） - 非结构化 JSON 文档。支持对任意嵌套键路径进行动态过滤。

- **GEOMETRY**（24） - 以 Well-Known Binary（WKB）格式存储的 Geometric/spatial 数据。

- **TEXT**（25） - 用于全文搜索的文本数据类型。通过文本分析索引进行索引，以实现分词。

- **TIMESTAMPTZ**（26） - 带时区的时间戳（RFC 3339 字符串）。

*向量类型：*

- **BINARY_VECTOR**（100） - 按位打包的二进制向量。维度必须是 8 的倍数。需要使用 `WithDimension()`。通常与 `MetricType::HAMMING` 或 `MetricType::JACCARD` 搭配使用。

- **FLOAT_VECTOR**（101） - 32 位浮点稠密向量。需要使用 `WithDimension()`。这是最常见的向量类型。

- **FLOAT16_VECTOR**（102） - 16 位半精度（FP16）浮点向量。需要使用 `WithDimension()`。与 `FLOAT_VECTOR` 相比，其内存占用减半，召回率损失极小。

- **BFLOAT16_VECTOR**（103） - Brain Float 16（BF16）向量。需要使用 `WithDimension()`。数值范围优于 FP16，常用于 ML 模型输出。

- **SPARSE_FLOAT_VECTOR**（104） - 大多数维度为零的稀疏浮点向量。没有固定维度。配合 `MetricType::BM25` 用于关键词搜索。

- **INT8_VECTOR**（105） - INT8 量化的稠密向量。需要使用 `WithDimension()`。在稠密向量类型中内存占用最小。

*多向量类型：*

- **STRUCT**（201） - 包含多个命名子向量的多向量结构体字段。与 `StructFieldSchema` 搭配使用。

*内部：*

- **UNKNOWN**（0） - 未初始化或无法识别的类型。请勿直接使用。

### Schema 类型和列载荷\{#schema-type-and-column-payloads}

`DataType` 标识 Collection Schema 中存储的逻辑类型。`Insert()` 和 `Upsert()` 共用该类型，但它不是通过 DML 请求传递的 C++ 容器。这些方法会将每种 Schema 类型映射到具体的 `XxxFieldData` 容器，并通过 `FieldDataPtr` 接收该容器。

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
