---
title: "CreateCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateCollection
sidebar_label: "CreateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a collection. | Cloud"
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

This operation creates a collection.

```c++
Status CreateCollection(const CreateCollectionRequest& request)
```

## Request Syntax\{#request-syntax}

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

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database name in which the collection is created.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

    <Admonition type="info" icon="📘" title="Notes">

    Historically, **[CollectionSchema](./Collections-CollectionSchema)** also contains a collection name. **WithCollectionName()** will override the collection name specified in **[CollectionSchema](./Collections-CollectionSchema)**.

    </Admonition>

- `WithDescription(const std::string& description)`

    Sets the name of the collection. 

    <Admonition type="info" icon="📘" title="Notes">

    Historically, **[CollectionSchema](./Collections-CollectionSchema)** also contains a description. **WithDescription()** will override the collection description specified in **[CollectionSchema](./Collections-CollectionSchema)**.

    </Admonition>

- `WithCollectionSchema(const [CollectionSchemaPtr](./Collections-CollectionSchema)& schema)`

    Sets the collection schema.

- `WithNumPartitions(int64_t num_partitions)`

    Sets the number of partitions when a partition key is present.

- `WithNumShards(int64_t num_shards)`

    Sets the number of shards of the collection. 

    <Admonition type="info" icon="📘" title="Notes">

    Historically, **[CollectionSchema](./Collections-CollectionSchema)** also contains the number of shards. **WithNumShards()** will override the number of shards specified in **[CollectionSchema](./Collections-CollectionSchema)**.

    </Admonition>

- `WithConsistencyLevel([ConsistencyLevel](./Collections-ConsistencyLevel) level)`

    Sets the default consistency level of this collection.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets properties of this collection.

- `AddProperty(const std::string& key, const std::string& property)`

    Sets a property of this collection.

- `WithIndexes(std::vector<[IndexDesc](./Management-IndexDesc)>&& indexes)`

    Sets the indexes to be created.

- `AddIndex([IndexDesc](./Management-IndexDesc)&& index)`

    Adds an index to the collection being created.

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

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
