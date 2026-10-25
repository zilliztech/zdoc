---
title: "UpdateUser() | Cloud"
slug: /cpp/cpp/Authentication-UpdateUser
sidebar_label: "UpdateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新用户的描述。 | Cloud"
type: docx
token: XXBwdXvCWo1te0xWjifc19kUnjf
sidebar_position: 22
keywords: 
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - UpdateUser()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# UpdateUser()

此操作会更新用户的描述。

```c++
Status UpdateUser(const UpdateUserRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = UpdateUserRequest()
    .WithUserName(user_name)
    .WithDescription(description);
```

**请求方法：**

- `WithUserName(const std::string& user_name)`

    设置用户的名称。

- `WithDescription(const std::string& description)`

    设置用户的描述。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认成功。

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

status = client->UpdateUser(
    milvus::UpdateUserRequest()
        .WithUserName(user_name)
        .WithDescription(description)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
