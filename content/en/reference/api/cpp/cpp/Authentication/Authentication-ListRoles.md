---
title: "ListRoles() | Cloud"
slug: /cpp/cpp/Authentication-ListRoles
sidebar_label: "ListRoles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of roles. | Cloud"
type: docx
token: Syt3dskDpo3VcQxMu43cXcBFnre
sidebar_position: 14
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - ListRoles()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRoles()

This operation returns a list of roles.

```c++
Status ListRoles(const ListRolesRequest& request, ListRolesResponse& response)
```

**RETURNS:**

*Status* with *ListRolesResponse*

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

milvus::ListRolesRequest request;
milvus::ListRolesResponse response;
status = client->ListRoles(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
