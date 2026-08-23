---
title: "ListPrivilegeGroups() | Cloud"
slug: /cpp/cpp/Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of all privilege groups. | Cloud"
type: docx
token: JzwFd9yZqozzWdxQrHjcm8jynjc
sidebar_position: 13
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - ListPrivilegeGroups()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups()

This operation returns a list of all privilege groups.

```c++
Status ListPrivilegeGroups(const ListPrivilegeGroupsRequest& request, ListPrivilegeGroupsResponse& response)
```

**RETURNS:**

*Status* with *ListPrivilegeGroupsResponse*

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

milvus::ListPrivilegeGroupsRequest request;
milvus::ListPrivilegeGroupsResponse response;
status = client->ListPrivilegeGroups(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
