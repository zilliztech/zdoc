---
title: "DropUser() | Cloud"
slug: /cpp/cpp/Authentication-DropUser
sidebar_label: "DropUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除用户。 | Cloud"
type: docx
token: FtGndkY80oH1PNx04hvclmVCnDg
sidebar_position: 10
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropUser()

此操作用于删除用户。

```c++
Status DropUser(const DropUserRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropUserRequest()
    .WithUserName(name);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置用户名。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

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

status = client->DropUser(
    milvus::DropUserRequest()
        .WithUserName(user_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
