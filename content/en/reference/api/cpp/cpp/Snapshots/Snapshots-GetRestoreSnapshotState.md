---
title: "GetRestoreSnapshotState() | Cloud"
slug: /cpp/cpp/Snapshots-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets restore-snapshot job state. Use it to poll restore progress and failure reasons. | Cloud"
type: docx
token: Utu5dQE8Eo1zD0xdoJccCAx0nnf
sidebar_position: 4
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - GetRestoreSnapshotState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

This operation gets restore-snapshot job state. Use it to poll restore progress and failure reasons.

```c++
Status GetRestoreSnapshotState(const GetRestoreSnapshotStateRequest& request, GetRestoreSnapshotStateResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617");
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database name.

- `WithCollectionName(const std::string& collection_name)`

    Sets the target collection name.

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

auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617");
milvus::GetRestoreSnapshotStateResponse response;
status = client->GetRestoreSnapshotState(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
