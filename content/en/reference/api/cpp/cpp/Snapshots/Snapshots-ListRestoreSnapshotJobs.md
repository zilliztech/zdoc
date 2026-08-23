---
title: "ListRestoreSnapshotJobs() | Cloud"
slug: /cpp/cpp/Snapshots-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists restore-snapshot jobs. Use it to inspect restore history and active restore operations. | Cloud"
type: docx
token: ObE8dlNmooAuRQxQnyEci9RInxH
sidebar_position: 5
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - ListRestoreSnapshotJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

This operation lists restore-snapshot jobs. Use it to inspect restore history and active restore operations.

```c++
Status ListRestoreSnapshotJobs(const ListRestoreSnapshotJobsRequest& request, ListRestoreSnapshotJobsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
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

auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
milvus::ListRestoreSnapshotJobsResponse response;
status = client->ListRestoreSnapshotJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
