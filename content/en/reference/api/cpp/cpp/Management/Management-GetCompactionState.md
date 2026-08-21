---
title: "GetCompactionState() | Cloud"
slug: /cpp/cpp/Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the status of a compaction job. | Cloud"
type: docx
token: G7OGdOxABoDWKMxUZDncelbanEd
sidebar_position: 9
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState()

This operation gets the status of a compaction job.

```c++
Status GetCompactionState(const GetCompactionStateRequest& request, GetCompactionStateResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetCompactionStateRequest()
    .WithCompactionID(id);
```

**REQUEST METHODS:**

- `WithCompactionID(int64_t id)`

    Sets the compaction job ID returned by `Compact()`.

**RETURNS:**

*Status* with *GetCompactionStateResponse*

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

int64_t compaction_id = 12345;  // obtained from Compact()

milvus::GetCompactionStateResponse response;
status = client->GetCompactionState(
    milvus::GetCompactionStateRequest()
        .WithCompactionID(compaction_id),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "State: " << static_cast<int>(response.State()) << std::endl;
```
