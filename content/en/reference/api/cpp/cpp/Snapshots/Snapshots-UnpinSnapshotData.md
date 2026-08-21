---
title: "UnpinSnapshotData() | Cloud"
slug: /cpp/cpp/Snapshots-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation unpins snapshot data. Use it when pinned data is no longer needed before its TTL expires. | Cloud"
type: docx
token: TfBadHlwqoakz4xzFOEchPpVnVd
sidebar_position: 9
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

This operation unpins snapshot data. Use it when pinned data is no longer needed before its TTL expires.

```c++
Status UnpinSnapshotData(const UnpinSnapshotDataRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::UnpinSnapshotDataRequest()
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

auto request = milvus::UnpinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
status = client->UnpinSnapshotData(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
