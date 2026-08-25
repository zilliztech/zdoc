---
title: "DropFunctionField() | Cloud"
slug: /cpp/cpp/Collections-DropFunctionField
sidebar_label: "DropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "从现有 Collection 中删除函数及其生成的输出字段。 | Cloud"
type: docx
token: CC9zdTSe3onmvrxGs5ic0e8inJd
sidebar_position: 36
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - DropFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropFunctionField()

从现有 Collection 中删除函数及其生成的输出字段。

```c++
Status DropFunctionField(const DropFunctionFieldRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFunctionName(std::string function_name)`

    设置要连同其输出字段一起删除的函数名称。

**返回值：**

*Status*

返回指示操作是否成功的状态。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以了解失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 DropFunctionField()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropFunctionFieldRequest();
util::CheckStatus(client->DropFunctionField(request));
```
