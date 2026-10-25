---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作提供指定用户的详细信息，包括授予该用户的角色。 | Cloud"
type: docx
token: WqOudbitToLoSRx9faGctun6nlf
sidebar_position: 7
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - 向量数据库
  - 多模态向量 Database 检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeUser()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DescribeUser()

此操作提供指定用户的详细信息，包括授予该用户的角色。

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

    设置要描述的用户名称。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

- **response** (*DescribeUserResponse*) -

    - **Desc** (*const UserDesc&*) -

        获取用户描述。

        - **Name** (*const std::string&*) -

            获取用户的名称。

        - **Description** (*const std::string&*) -

            获取用户描述。

        - **Roles** (*const std::vector&lt;std::string&gt;&*) -

            获取用户的角色名称。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

以下示例演示如何使用 DescribeUser() 获取用户的详细信息。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeUserRequest()
    .WithUserName(name);
status = client->DescribeUser(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
