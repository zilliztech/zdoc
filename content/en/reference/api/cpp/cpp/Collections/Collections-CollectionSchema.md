---
title: "CollectionSchema | Cloud"
slug: /cpp/cpp/Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This class defines the schema of a collection by specifying its fields and dynamic-field settings. An alias `CollectionSchemaPtr` (a `std:sharedptr`) is provided for convenience. Pass the pointer to `CreateCollectionRequest::WithCollectionSchema()` when creating a collection. | Cloud"
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

This class defines the schema of a collection by specifying its fields and dynamic-field settings. An alias `CollectionSchemaPtr` (a `std::shared_ptr<CollectionSchema>`) is provided for convenience. Pass the pointer to `CreateCollectionRequest::WithCollectionSchema()` when creating a collection.

```c++
CollectionSchema();
explicit CollectionSchema(std::string name, std::string desc = "",
                          int32_t shard_num = 1,
                          bool enable_dynamic_field = true);

using CollectionSchemaPtr = std::shared_ptr<CollectionSchema>;
```

**PARAMETERS:**

- **name** (*std::string*)

    Sets the Collection name. In MilvusClientV2 this is set via `CreateCollectionRequest::WithCollectionName()` and this constructor parameter is ignored.

- **desc** (*std::string*)

    Sets the optional human-readable description. Default: `""`.

- **shard_num** (*int32_t*)

    Sets the number of shards. Must be greater than `0`. Default: `1`. In MilvusClientV2, set this via `CreateCollectionRequest::WithNumShards()` instead.

- **enable_dynamic_field** (*bool*)

    When `true`, entities may contain fields that are not declared in the schema. The extra fields are stored internally in a JSON field named `$meta`. Default: `true`.

## Methods\{#methods}

**Adding fields:**

- `bool AddField(const FieldSchema& field_schema)`

    Appends a regular field to the schema. Returns `true` on success. Use `FieldSchema` to specify the field name, `DataType`, and type-specific settings (e.g., `WithDimension()` for vector fields, `WithMaxLength()` for VARCHAR fields, `WithPrimaryKey(true)` for the primary key).

- `const std::vector<FieldSchema>& Fields() const`

    Returns the list of field schemas added so far.

- `bool AddStructField(const StructFieldSchema& field_schema)`

    Appends a struct field (multi-vector type). Returns `true` on success.

- `const std::vector<StructFieldSchema>& StructFields() const`

    Returns the list of struct field schemas.

- `void AddFunction(const FunctionPtr& function)`

    Attaches a built-in function (e.g., a BM25 tokenizer function) to the schema.

- `const std::vector<FunctionPtr>& Functions() const`

    Returns the list of functions attached to the schema.

**Dynamic field:**

- `void SetEnableDynamicField(bool enable_dynamic_field)`

    Enables or disables dynamic fields at runtime.

- `bool EnableDynamicField() const`

    Returns whether dynamic fields are enabled.

**Introspection:**

- `std::string PrimaryFieldName() const`

    Returns the name of the primary key field.

- `std::unordered_set<std::string> AnnsFieldNames() const`

    Returns the names of all vector (ANNS) fields in the schema.

## Example\{#example}

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
