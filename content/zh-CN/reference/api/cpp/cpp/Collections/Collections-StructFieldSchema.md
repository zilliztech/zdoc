---
title: "StructFieldSchema | Cloud"
slug: /cpp/cpp/Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类用于描述 Collection Schema 中的结构体类型字段（多向量类型）。构建多向量 Schema 时，请将 `StructFieldSchema` 实例传递给 `CollectionSchema:AddStructField()`。`StructFieldSchema` 提供了流式 With/Add 构建器 API。 | Cloud"
type: docx
token: E8V0dJNffoNiQHxsYyGcmQbennc
sidebar_position: 32
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

此类用于描述 Collection Schema 中的结构体类型字段（多向量类型）。构建多向量 Schema 时，请将 `StructFieldSchema` 实例传递给 `CollectionSchema::AddStructField()`。`StructFieldSchema` 提供了流式 With*/Add* 构建器 API。

```c++
StructFieldSchema();
explicit StructFieldSchema(std::string name, std::string description = "");
```

**参数：**

- **name** (*std::string*)

    结构体字段的名称，在 Collection 内必须唯一。

- **description** (*std::string*)

    可选的可读性描述。默认值：`""`。

## 请求语法\{#request-syntax}

```c++
StructFieldSchema(name, description)
    .WithName(name)
    .WithDescription(description)
    .WithMaxCapacity(capacity)
    .AddField(field_schema);
```

**请求方法：**

- `StructFieldSchema& WithName(std::string name)`

    设置字段名称，并返回 Schema 以支持链式调用。

- `StructFieldSchema& WithDescription(std::string description)`

    设置描述信息，并返回 Schema 以支持链式调用。

- `StructFieldSchema& WithMaxCapacity(int64_t capacity)`

    设置结构体字段可容纳的最大元素数量，并返回 Schema 以支持链式调用。

- `StructFieldSchema& AddField(const FieldSchema& field_schema)`

    追加一个子字段（结构体内的向量字段），并返回 Schema 以支持链式调用。有关 FieldSchema 的详细信息，请参见 FieldSchema。

- `const std::vector<FieldSchema>& Fields() const`

    返回当前已添加的子字段列表。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

// Build a schema with a STRUCT field containing two vector sub-fields
CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();
schema->AddField(FieldSchema("id", DataType::INT64).WithPrimaryKey(true).WithAutoID(true));

StructFieldSchema struct_field("embeddings", "multi-vector struct field");
struct_field
    .WithMaxCapacity(2)
    .AddField(FieldSchema("dense", DataType::FLOAT_VECTOR).WithDimension(128))
    .AddField(FieldSchema("sparse", DataType::SPARSE_FLOAT_VECTOR));

schema->AddStructField(struct_field);

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
auto status = client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("multi_vec_collection")
        .WithCollectionSchema(schema));
```
