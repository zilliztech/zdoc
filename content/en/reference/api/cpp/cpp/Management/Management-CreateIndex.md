---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation indexes on vector fields or scalar fields. | Cloud"
type: docx
token: J7Yxdgw6moJca1xZCe7cLOIunve
sidebar_position: 3
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex()

This operation indexes on vector fields or scalar fields.

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    Sets the indexes to be created.

- `AddIndex(IndexDesc&& index)`

    Adds an index to be created.

- `WithSync(bool sync)`

    Sets whether to operate in sync mode. The default value is **True**.

    - **True**: This operation returns until the indexes are created.

    - **False**: This operation returns immediately.

- `WithTimeoutMs(int64_t timeout_ms)`

    Sets the timeout in milliseconds. The default value is 60000 ms. This parameter only works when this operation works in sync mode. 

    If `WaitFlushedMs` is set to 0, this operation repeatedly calls `DescribeIndex()` to check the index state until the index is fully built. If `WaitFlushedMs` is greater than 0, this operation will break the loop after a specified period of time and return a status indicating a timeout.

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

milvus::IndexDesc index_vector("vector_field_name", "vector_index_name", milvus::IndexType::HNSW,
                               milvus::MetricType::L2);
index_vector.AddExtraParam("M", "32");
index_vector.AddExtraParam("efConstruction", "100");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
