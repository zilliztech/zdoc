---
title: "AlterRole() | Cloud"
slug: /cpp/cpp/Authentication-AlterRole
sidebar_label: "AlterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新角色的描述。 | Cloud"
type: docx
token: HkRQd5kF5om421xNwSmcoaz3nxb
sidebar_position: 2
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - zilliz
  - Zilliz Cloud
  - 云
  - AlterRole()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterRole()

此操作会更新角色的描述。

```c++
Status AlterRole(const AlterRoleRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterRoleRequest()
    .WithRoleName(role_name)
    .WithDescription(description);
```

**请求方法：**

- `WithRoleName(const std::string& role_name)`

    设置角色的名称。

- `WithDescription(const std::string& description)`

    设置角色的描述。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

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

status = client->AlterRole(
    milvus::AlterRoleRequest()
        .WithRoleName(role_name)
        .WithDescription(description)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
