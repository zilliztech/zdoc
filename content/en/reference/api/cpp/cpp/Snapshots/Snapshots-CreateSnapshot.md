---
title: "CreateSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a snapshot for a collection. Use it before destructive maintenance or restore testing. | Cloud"
type: docx
token: S39Pd8SZ6oQ5dbxXS40cptWRnSf
sidebar_position: 1
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

This operation creates a snapshot for a collection. Use it before destructive maintenance or restore testing.

```c++
Status CreateSnapshot(const CreateSnapshotRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::CreateSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithDescription("before quarterly reindex")
    .WithCompactionProtectionSeconds(3600);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database that contains the collection.

- `WithCollectionName(const std::string& collection_name)`

    Sets the collection to snapshot.

- `WithDescription(const std::string& description)`

    Sets an optional snapshot description.

- `WithCompactionProtectionSeconds(int64_t seconds)`

    Sets how long compaction should preserve data needed by the snapshot.

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

auto request = milvus::CreateSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithDescription("before quarterly reindex")
    .WithCompactionProtectionSeconds(3600);
status = client->CreateSnapshot(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
