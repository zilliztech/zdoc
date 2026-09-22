---
title: "Create() | Cloud"
slug: /cpp/cpp/Client-Create
sidebar_label: "Create()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new MilvusClientV2 instance. | Cloud"
type: docx
token: CfaudoM2CocOHtxYirFcJqbKnof
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - Create()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Create()

This operation creates a new MilvusClientV2 instance.

```c++
static std::shared_ptr<MilvusClientV2> Create()
```

**RETURNS:**

*std::shared_ptr&lt;milvus::MilvusClientV2&gt;*

Returns the newly created client instance, ready to be configured with Connect().

**ERROR HANDLING:**

- **std::exception**

    Thrown when the client instance cannot be constructed. Inspect the exception message for failure details.

## Example\{#example}

Creates the client instance, then connects it to a Milvus server.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
