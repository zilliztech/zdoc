---
title: "Connect() | Cloud"
slug: /cpp/cpp/Client-Connect
sidebar_label: "Connect()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation connects to Zilliz Cloud cluster. | Cloud"
type: docx
token: FBXDdgCrfoG5mzx2p1KcX2Kbnib
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - Connect()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Connect()

This operation connects to Zilliz Cloud cluster.

```c++
Status Connect(const ConnectParam& connect_param)
```

**PARAMETERS:**

- **connect_param** (*const [ConnectParam](./Client-ConnectParam)&*)

    Sets the connection parameters.

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
```
