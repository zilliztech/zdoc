---
title: "SetRetryParam() | Cloud"
slug: /cpp/cpp/Client-SetRetryParam
sidebar_label: "SetRetryParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the retry rules for each RPC call. | Cloud"
type: docx
token: IR7hd6VQcoQPg3xNzL2cBw6Nn7f
sidebar_position: 10
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - SetRetryParam()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SetRetryParam()

This operation resets the retry rules for each RPC call.

```c++
Status SetRetryParam(const RetryParam& retry_param)
```

**PARAMETERS:**

- **retry_param** (*const [RetryParam](./Client-RetryParam)&*)

    Sets the retry parameters.

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

milvus::RetryParam retry_param;
retry_param.WithMaxRetryTimes(10)
           .WithInitialBackOffMs(100)
           .WithMaxBackOffMs(5000)
           .WithBackOffMultiplier(2)
           .WithRetryOnRateLimit(true);

status = client->SetRetryParam(retry_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
