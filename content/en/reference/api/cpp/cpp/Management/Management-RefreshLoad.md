---
title: "RefreshLoad() | Cloud"
slug: /cpp/cpp/Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "This operation refreshes a loaded collection in QueryNode memory. Use it after significant ingestion or compaction when you want the loaded data view to catch up immediately. | Cloud"
type: docx
token: YI1BdnZOMoPSOMxjVMEcrrCwnWh
sidebar_position: 19
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshLoad()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad()

This operation refreshes a loaded collection in QueryNode memory. Use it after significant ingestion or compaction when you want the loaded data view to catch up immediately.

```c++
Status RefreshLoad(const RefreshLoadRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = RefreshLoadRequest()
    .WithCollectionName(collection_name)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

### RefreshLoadRequest\{#refreshloadrequest}

**REQUEST METHODS:**

- `WithCollectionName(const std::string& collection_name)`

    Sets the collection name to refresh.

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database. If omitted, the default database is used.

- `WithSync(bool sync)`

    Controls whether the call blocks until refresh completes. Default is `true`.

- `WithTimeoutMs(int64_t timeout_ms)`

    Sets timeout in milliseconds for synchronous refresh. Default is `60000`.

**RETURNS:**

*Status*

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for invalid collection names, load-state issues, or timeout failures.

## Example\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RefreshLoad(
    milvus::RefreshLoadRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .WithTimeoutMs(60000));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
