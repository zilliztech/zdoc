---
title: "AlterRole() | Cloud"
slug: /cpp/cpp/Authentication-AlterRole
sidebar_label: "AlterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "修改现有角色的描述。| Cloud"
type: docx
token: HkRQd5kF5om421xNwSmcoaz3nxb
sidebar_position: 2
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - AlterRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterRole()

修改现有角色的描述。

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

    由 MilvusClientV2::AlterRole() 使用。

- `WithDescription(const std::string& description)`

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 AlterRole()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AlterRoleRequest();
util::CheckStatus(client->AlterRole(request));
```
