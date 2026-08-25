---
title: "CreateUser() | Cloud"
slug: /cpp/cpp/Authentication-CreateUser
sidebar_label: "CreateUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Create an user with username and password to login milvus. | Cloud"
type: docx
token: InqLdJ931o15yIxpt1bcfYFinAf
sidebar_position: 5
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CreateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateUser()

使用用户名和密码创建用户，以便登录 Milvus。

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

    设置用户名。

- `WithPassword(const std::string& password)`

    设置用户密码。

- `WithDescription(const std::string& description)`

    设置用户描述。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取详细的失败信息。

## 示例\{#example}

演示如何使用 C++ SDK 调用 CreateUser()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::CreateUserRequest();
util::CheckStatus(client->CreateUser(request));
```
