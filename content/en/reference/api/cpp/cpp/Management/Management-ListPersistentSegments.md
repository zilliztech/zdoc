---
title: "ListPersistentSegments() | Cloud"
slug: /cpp/cpp/Management-ListPersistentSegments
sidebar_label: "ListPersistentSegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves information about persisted segments from data nodes. | Cloud"
type: docx
token: XhwtdeOEmoyc9YxuVpqck1ejnNe
sidebar_position: 14
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - ListPersistentSegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPersistentSegments()

This operation retrieves information about persisted segments from data nodes.

```c++
Status ListPersistentSegments(const ListPersistentSegmentsRequest& request, ListPersistentSegmentsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListPersistentSegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *ListPersistentSegmentsResponse*

Check `status.IsOk()` to confirm success.

The response's `Segments()` list contains `SegmentInfo` values. In addition to segment ID, collection ID, partition ID, row count, and state, each `SegmentInfo` value includes collection name, segment level, storage version, and sorted state.

**SegmentLevel values:**

- `UNKNOWN = -1`

- `LEGACY = 0`

- `L0 = 1`

- `L1 = 2`

- `L2 = 3`

**SegmentInfo methods:**

- `const std::string& CollectionName() const`

    Returns the collection name.

- `SegmentLevel Level() const`

    Returns the segment level.

- `int64_t StorageVersion() const`

    Returns the storage version.

- `bool IsSorted() const`

    Returns whether the segment is sorted.

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

milvus::ListPersistentSegmentsResponse response;
status = client->ListPersistentSegments(
    milvus::ListPersistentSegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```
