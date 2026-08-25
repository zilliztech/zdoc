---
title: "ListUsers() | Cloud"
slug: /cpp/cpp/Authentication-ListUsers
sidebar_label: "ListUsers()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回用户名列表。 | Cloud"
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

此操作返回用户名列表。

```c++
Status ListUsers(const ListUsersRequest& request, ListUsersResponse& response)
```

**返回值：**

包含 *ListUsersResponse* 的 *Status*

检查 `status.IsOk()` 以确认是否成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

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
