---
title: "CreateUser() | Cloud"
slug: /cpp/cpp/Authentication-CreateUser
sidebar_label: "CreateUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "使用用户名和密码创建用户以登录 Milvus。 | Cloud"
type: docx
token: InqLdJ931o15yIxpt1bcfYFinAf
sidebar_position: 5
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - CreateUser()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateUser()

使用用户名和密码创建用户以登录 Milvus。

```c++
Status CreateUser(const CreateUserRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateUserRequest()
    .WithUserName(name)
    .WithPassword(password)
    .WithDescription(description);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置用户的名称。

- `WithPassword(const std::string& password)`

    设置用户的密码。

- `WithDescription(const std::string& description)`

    设置用户的描述。

**返回：**

*Status*

返回用于指示操作是否成功的状态。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

演示如何通过 C++ SDK 使用 CreateUser()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::CreateUserRequest();
util::CheckStatus(client->CreateUser(request));
```
