---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates one or more indexes on vector or scalar fields of a collection. You can specify multiple indexes in a single call, and in sync mode the call waits until the indexes are fully built. | Cloud"
type: docx
token: F2mid3PxKova16x44f8cyyIFnoe
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

This operation creates one or more indexes on vector or scalar fields of a collection. You can specify multiple indexes in a single call, and in sync mode the call waits until the indexes are fully built.

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .AddIndex(index)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. The default database is used if the name is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection whose fields are to be indexed.

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    Sets the indexes to be created. Accepts a std::vector&lt;IndexDesc&gt; rvalue that is moved into the request.

- `AddIndex(IndexDesc&& index)`

    Adds an index to be created. Accepts an IndexDesc rvalue that is moved into the request.

- `WithSync(bool sync)`

    Sets whether the client waits until the indexes are fully built. Defaults to true; if false, the call returns immediately regardless of index build progress.

- `WithTimeoutMs(int64_t timeout_ms)`

    Sets the timeout in milliseconds for waiting on index building. Defaults to 60000 ms and only takes effect in sync mode. A value of zero polls DescribeIndex() until the indexes are fully built; a positive value makes CreateIndex() return a timeout status once the time span elapses.

**RETURNS:**

*Status*

Returns a Status indicating whether the index was created successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call CreateIndex() on a connected MilvusClientV2 to build an HNSW index on a vector field and wait until it is ready.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index("vector", "vector_idx", milvus::IndexType::HNSW, milvus::MetricType::L2);
index.AddExtraParam("M", "16");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
