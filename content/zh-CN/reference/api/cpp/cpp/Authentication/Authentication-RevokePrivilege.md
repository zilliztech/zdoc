---
title: "RevokePrivilege() | Cloud"
slug: /cpp/cpp/Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销角色在特定对象上的权限。 | Cloud"
type: docx
token: IA1jdFAQ7ooZj5xkQT8cz6H3ndb
sidebar_position: 25
keywords: 
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - 混合向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - RevokePrivilege()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilege()

此操作会撤销角色在特定对象上的权限。

```c++
Status RevokePrivilege(const RevokePrivilegeRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RevokePrivilegeRequest()
    .WithRoleName(name)
    .WithObjectType(object_type)
    .WithObjectName(object_name)
    .WithPrivilege(privilege)
    .WithDatabaseName(db_name);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置角色的名称。

- `WithObjectType(const std::string& object_type)`

    设置目标对象的类型，例如 `Collection` 或 `Global`。

- `WithObjectName(const std::string& object_name)`

    设置目标对象的名称。使用 `*` 将该权限应用于指定类型的所有对象。

- `WithPrivilege(const std::string& privilege)`

    设置要撤销的权限名称。有关可用权限，请参见 [可用权限](/docs/cluster-privileges)。

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则应用默认 Database。

**返回：**

*Status*

检查 `status.IsOk()` 以确认是否成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以了解错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RevokePrivilege(
    milvus::RevokePrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
