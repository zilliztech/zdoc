---
title: "ListUsers() | Cloud"
slug: /cpp/cpp/Authentication-ListUsers
sidebar_label: "ListUsers()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of user names. | Cloud"
type: docx
token: NSvXdtRoioS4NKxdjANcGFd9nrc
sidebar_position: 15
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - ListUsers()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListUsers()

This operation returns a list of user names.

```c++
Status ListUsers(const ListUsersRequest& request, ListUsersResponse& response)
```

**RETURNS:**

*Status* with *ListUsersResponse*

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

milvus::ListUsersRequest request;
milvus::ListUsersResponse response;
status = client->ListUsers(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
