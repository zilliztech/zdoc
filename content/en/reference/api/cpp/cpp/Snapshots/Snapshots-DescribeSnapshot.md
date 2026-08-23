---
title: "DescribeSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation describes a snapshot. Use it to inspect snapshot metadata before restore or cleanup. | Cloud"
type: docx
token: MjnKdyOXkoKD3exC7rUcXSCMnxe
sidebar_position: 2
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

This operation describes a snapshot. Use it to inspect snapshot metadata before restore or cleanup.

```c++
Status DescribeSnapshot(const DescribeSnapshotRequest& request, DescribeSnapshotResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::DescribeSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database name.

- `WithCollectionName(const std::string& collection_name)`

    Sets the collection name.

- `WithSnapshotName(const std::string& snapshot_name)`

    Sets the snapshot name.

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

auto request = milvus::DescribeSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
milvus::DescribeSnapshotResponse response;
status = client->DescribeSnapshot(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
