---
title: "ListSnapshots() | Cloud"
slug: /cpp/cpp/Snapshots-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists snapshots for a collection. Use it to discover available restore points. | Cloud"
type: docx
token: GJDKdgCbpoAxYkxpXygcdfFQnFe
sidebar_position: 6
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListSnapshots()

This operation lists snapshots for a collection. Use it to discover available restore points.

```c++
Status ListSnapshots(const ListSnapshotsRequest& request, ListSnapshotsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database name.

- `WithCollectionName(const std::string& collection_name)`

    Sets the collection name.

**RETURNS:**

*Status*

**EXCEPTIONS:**

- **std::exception**

    This exception can be raised if the request cannot be sent or the response cannot be parsed.

## Example\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
milvus::ListSnapshotsResponse response;
status = client->ListSnapshots(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
