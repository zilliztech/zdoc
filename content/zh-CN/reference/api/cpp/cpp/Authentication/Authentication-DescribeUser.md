---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述用户信息。| Cloud"
type: docx
token: WqOudbitToLoSRx9faGctun6nlf
sidebar_position: 7
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser()

描述用户信息。

```c++
Status DescribeUser(const DescribeUserRequest& request, DescribeUserResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeUserRequest()
    .WithUserName(name);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置用户名。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取详细的失败原因。

## 示例\{#example}

演示如何使用 C++ SDK 调用 DescribeUser()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DescribeUserRequest();
milvus::DescribeUserResponse response;
util::CheckStatus(client->DescribeUser(request, response));
```
