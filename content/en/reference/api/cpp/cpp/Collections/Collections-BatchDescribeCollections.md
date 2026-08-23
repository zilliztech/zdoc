---
title: "BatchDescribeCollections() | Cloud"
slug: /cpp/cpp/Collections-BatchDescribeCollections
sidebar_label: "BatchDescribeCollections()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "This operation retrieves schema and configuration metadata for a batch of collections. Use it to reduce round trips when inspecting many collections at once. | Cloud"
type: docx
token: IpztddRkJo1o6JxKNWHcPjO8n8f
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - BatchDescribeCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# BatchDescribeCollections()

This operation retrieves schema and configuration metadata for a batch of collections. Use it to reduce round trips when inspecting many collections at once.

```c++
Status BatchDescribeCollections(const BatchDescribeCollectionsRequest& request, BatchDescribeCollectionsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .AddCollectionName("collection_a")
    .AddCollectionName("collection_b");
```

### BatchDescribeCollectionsRequest\{#batchdescribecollectionsrequest}

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database containing the target collections.

- `WithCollectionNames(std::vector<std::string>&& collection_names)`

    Sets the full list of collection names to describe.

- `AddCollectionName(const std::string& collection_name)`

    Appends one collection name to the request list.

- `WithCollectionIDs(std::vector<int64_t>&& collection_ids)`

    Sets the full list of collection IDs to describe.

- `AddCollectionID(int64_t collection_id)`

    Appends one collection ID to the request list.

**RETURNS:**

*Status* with *BatchDescribeCollectionsResponse*

### BatchDescribeCollectionsResponse\{#batchdescribecollectionsresponse}

This class represents batched collection metadata returned by `BatchDescribeCollections()`.

```c++
const BatchDescribeCollectionsResponse& response = resp;
```

**METHODS:**

- `const std::vector<CollectionDesc>& Descs() const`

    Returns the collection descriptions returned by the server.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for invalid database, missing collections, or permission failures.

## Example\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::BatchDescribeCollectionsResponse response;
status = client->BatchDescribeCollections(
    milvus::BatchDescribeCollectionsRequest()
        .WithDatabaseName("default")
        .AddCollectionName("books")
        .AddCollectionName("movies"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& desc : response.Descs()) {
    std::cout << desc.CollectionName() << std::endl;
}
```
