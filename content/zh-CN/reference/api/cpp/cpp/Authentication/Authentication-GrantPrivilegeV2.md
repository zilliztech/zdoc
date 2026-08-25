---
title: "GrantPrivilegeV2() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于向角色授予权限或权限组。 | Cloud"
type: docx
token: RkNpdn17xopIkwxeBxYcmQj0nFg
sidebar_position: 11
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilegeV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2()

此操作用于向角色授予权限或权限组。

```c++
Status GrantPrivilegeV2(const GrantPrivilegeV2Request& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = GrantPrivilegeV2Request()
    .WithRoleName(name)
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrivilege(privilege);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置角色名称。

- `WithDatabaseName(const std::string& db_name)`

    设置角色的目标 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置角色的目标 Collection 名称。

- `WithPrivilege(const std::string& privilege)`

    设置要授予角色的权限名称。可用权限请参阅[此页面](https://milvus.io/docs/grant_privileges.md)。

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

status = client->GrantPrivilegeV2(
    milvus::GrantPrivilegeV2Request()
        .WithRoleName(role_name)
        .WithPrivilege(privilege_group_name)
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
