---
title: "UpdateUser() | Cloud"
slug: /cpp/cpp/Authentication-UpdateUser
sidebar_label: "UpdateUser()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "更新用户密码。| Cloud"
type: docx
token: XXBwdXvCWo1te0xWjifc19kUnjf
sidebar_position: 22
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - UpdateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdateUser()

更新指定用户的密码。

```c++
Status UpdateUser(const UpdateUserRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = UpdateUserRequest()
    .WithUserName(user_name)
    .WithDescription(description);
```

**请求方法：**

- `WithUserName(const std::string& user_name)`

    由 MilvusClientV2::UpdateUser() 使用。

- `WithDescription(const std::string& description)`

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取详细的失败信息。

## 示例\{#example}

演示如何使用 C++ SDK 调用 UpdateUser()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpdateUserRequest();
util::CheckStatus(client->UpdateUser(request));
```
