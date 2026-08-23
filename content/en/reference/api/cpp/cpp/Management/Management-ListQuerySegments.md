---
title: "ListQuerySegments() | Cloud"
slug: /cpp/cpp/Management-ListQuerySegments
sidebar_label: "ListQuerySegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves information about loaded segments from query nodes. | Cloud"
type: docx
token: J946dq9upog3BoxXTaucrrqvn4g
sidebar_position: 15
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - ListQuerySegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListQuerySegments()

This operation retrieves information about loaded segments from query nodes.

```c++
Status ListQuerySegments(const ListQuerySegmentsRequest& request, ListQuerySegmentsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListQuerySegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *ListQuerySegmentsResponse*

Check `status.IsOk()` to confirm success.

The response's `Segments()` list contains `QuerySegmentInfo` values. `QuerySegmentInfo` inherits the segment metadata methods from `SegmentInfo` and also exposes memory size for the loaded segment.

**SegmentInfo methods:**

- `const std::string& CollectionName() const`

    Returns the collection name.

- `SegmentLevel Level() const`

    Returns the segment level.

- `int64_t StorageVersion() const`

    Returns the storage version.

- `bool IsSorted() const`

    Returns whether the segment is sorted.

**QuerySegmentInfo methods:**

- `int64_t MemSize() const`

    Returns the memory size of the query segment.

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

milvus::ListQuerySegmentsResponse response;
status = client->ListQuerySegments(
    milvus::ListQuerySegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```
