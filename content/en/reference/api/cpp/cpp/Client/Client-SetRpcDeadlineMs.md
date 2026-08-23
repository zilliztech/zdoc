---
title: "SetRpcDeadlineMs() | Cloud"
slug: /cpp/cpp/Client-SetRpcDeadlineMs
sidebar_label: "SetRpcDeadlineMs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation changes the timeout value in milliseconds for each RPC call. | Cloud"
type: docx
token: Ff8gdJFLKoKfACxQXBxcK6mmnNf
sidebar_position: 11
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - SetRpcDeadlineMs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SetRpcDeadlineMs()

This operation changes the timeout value in milliseconds for each RPC call.

```c++
Status SetRpcDeadlineMs(uint64_t timeout_ms)
```

**PARAMETERS:**

- **timeout_ms** (*uint64_t*)

    Sets the timeout duration in milliseconds.

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

// set timeout value for each rpc call
client->SetRpcDeadlineMs(1000);
```
