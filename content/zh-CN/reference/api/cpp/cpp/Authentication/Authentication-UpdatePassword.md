---
title: "UpdatePassword() | Cloud"
slug: /cpp/cpp/Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新用户的密码。 | Cloud"
type: docx
token: Livud2dUIotCQbxD8SFc8oWwnGp
sidebar_position: 21
keywords: 
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - UpdatePassword()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# UpdatePassword()

此操作会更新用户的密码。

```c++
Status UpdatePassword(const UpdatePasswordRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = UpdatePasswordRequest()
    .WithUserName(name)
    .WithOldPassword(password1)
    .WithNewPassword(password2)
    .WithDescription(description)
    .WithResetConnection(reset_connection);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置用户的名称。

- `WithOldPassword(const std::string& password)`

    设置用户的密码。

- `WithNewPassword(const std::string& password)`

    设置用户的新密码。

- `WithDescription(const std::string& description)`

    设置用户的描述。

- `WithResetConnection(bool reset_connection)`

    是否在密码更新后重置客户端连接。在尝试重新连接之前，密码已在服务器上更新。如果重新连接失败，返回的 Status 会报告密码已更新，但必须使用新凭据手动重新建立连接。

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
