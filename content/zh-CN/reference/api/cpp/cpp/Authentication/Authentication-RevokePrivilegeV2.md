---
title: "RevokePrivilegeV2() | Cloud"
slug: /cpp/cpp/Authentication-RevokePrivilegeV2
sidebar_label: "RevokePrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于撤销角色的权限或权限组。 | Cloud"
type: docx
token: RC3FdSxLbov3uixeCBlcWud8nCd
sidebar_position: 18
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilegeV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilegeV2()

此操作用于撤销角色的权限或权限组。

```c++
Status RevokePrivilegeV2(const RevokePrivilegeV2Request& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RevokePrivilegeV2Request()
    .WithRoleName(name)
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrivilege(privilege);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置角色名称。

- `WithDatabaseName(const std::string& db_name)`

    设置角色所属的目标 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置角色关联的目标 Collection 名称。

- `WithPrivilege(const std::string& privilege)`

    设置权限名称。可用权限请参阅[此页面](https://milvus.io/docs/grant_privileges.md)。

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

status = client->RevokePrivilegeV2(milvus::RevokePrivilegeV2Request()
                                       .WithRoleName(role_name)
                                       .WithPrivilege(privilege_group_name)
                                       .WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
