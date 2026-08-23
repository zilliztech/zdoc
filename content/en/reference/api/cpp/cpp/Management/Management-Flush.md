---
title: "Flush() | Cloud"
slug: /cpp/cpp/Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation flushes the streaming data and seals segments. It is recommended to call this operation after all the data has been inserted into a collection. | Cloud"
type: docx
token: Ya3cdJkTNoGyqYxTXPMccOd8nun
sidebar_position: 7
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - Flush()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

This operation flushes the streaming data and seals segments. It is recommended to call this operation after all the data has been inserted into a collection.

```c++
Status Flush(const FlushRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = FlushRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(names)
    .WithWaitFlushedMs(ms);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionNames(std::set<std::string>&& names)`

    Sets the name of the collection.

- `AddCollectionName(const std::string& name)`

    Adds the name of a collection to flush.

- `WithWaitFlushedMs(int64_t ms)`

    Sets the number of milliseconds to wait for the flush action to complete. The default value is 0. If `WaitFlushedMs` is set to 0, this operation repeatedly calls `GetFlushState()` to check the status of related segments until all segments are flushed, ensuring that the buffer is persisted successfully. If `WaitFlushedMs` is greater than 0, this operation will break the loop after a specified period of time and return a status indicating a timeout.

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

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

// call flush() here just to persist the data so that indexnode can build index on a new segment
// Note: in practice, no need to call flush() manually since milvus automatically trigger flush actions
status = client->Flush(milvus::FlushRequest().AddCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
