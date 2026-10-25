---
title: "GrantPrivilege() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于针对特定对象向角色授予权限。 | Cloud"
type: docx
token: FPhDdyJa4oTIAxx6dHAcn9nynld
sidebar_position: 24
keywords: 
  - 自然语言处理
  - 神经网络
  - 深度学习
  - 知识库
  - Zilliz
  - Zilliz Cloud
  - 云
  - GrantPrivilege()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GrantPrivilege()

此操作用于针对特定对象向角色授予权限。

```c++
Status GrantPrivilege(const GrantPrivilegeRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = GrantPrivilegeRequest()
    .WithRoleName(name)
    .WithObjectType(object_type)
    .WithObjectName(object_name)
    .WithPrivilege(privilege)
    .WithDatabaseName(db_name);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置角色名称。

- `WithObjectType(const std::string& object_type)`

    设置目标对象的类型，例如 `Collection` 或 `Global`。

- `WithObjectName(const std::string& object_name)`

    设置目标对象的名称。使用 `*` 可将权限应用于给定类型的所有对象。

- `WithPrivilege(const std::string& privilege)`

    设置要授予的权限名称。可用权限请参见 [可用权限](/docs/cluster-privileges)。

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则使用默认 Database。

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

status = client->GrantPrivilege(
    milvus::GrantPrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
