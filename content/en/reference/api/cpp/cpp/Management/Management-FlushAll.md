---
title: "FlushAll() | Cloud"
slug: /cpp/cpp/Management-FlushAll
sidebar_label: "FlushAll()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation flushes insert buffers for all collections in a database. Use it before backup or verification workflows that require persisted writes. | Cloud"
type: docx
token: UbjxdApcFonLD4xmm9fcJI2knKd
sidebar_position: 21
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - FlushAll()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FlushAll()

This operation flushes insert buffers for all collections in a database. Use it before backup or verification workflows that require persisted writes.

```c++
Status FlushAll(const FlushAllRequest& request, FlushAllResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the database whose collections should be flushed.

- `WithWaitFlushedMs(int64_t wait_flushed_ms)`

    Sets how long to wait for all flush operations to finish. Zero means wait indefinitely.

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

auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
milvus::FlushAllResponse response;
status = client->FlushAll(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
