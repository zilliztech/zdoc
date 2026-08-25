---
title: "UpdatePassword() | Cloud"
slug: /cpp/cpp/Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于更新用户密码。 | Cloud"
type: docx
token: BXaGduFMvolXlnxaIFkcKy3Nnhu
sidebar_position: 21
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword()

此操作用于更新用户密码。

```c++
Status UpdatePassword(const UpdatePasswordRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = UpdatePasswordRequest()
    .WithUserName(name)
    .WithOldPassword(password1)
    .WithNewPassword(password2);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置用户名。

- `WithOldPassword(const std::string& password)`

    设置用户密码。

- `WithNewPassword(const std::string& password)`

    设置用户的新密码。

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

status = client->UpdatePassword(
    milvus::UpdatePasswordRequest()
        .WithUserName(user_name)
        .WithOldPassword("P@ssw0rd!")
        .WithNewPassword("P@ssw1rd#")
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
