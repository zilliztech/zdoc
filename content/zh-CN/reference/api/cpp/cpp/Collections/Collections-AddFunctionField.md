---
title: "AddFunctionField() | Cloud"
slug: /cpp/cpp/Collections-AddFunctionField
sidebar_label: "AddFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "向现有 Collection 添加函数生成的输出字段。| Cloud"
type: docx
token: TcF2doHmuoNHsKxRRJbcsYevnph
sidebar_position: 34
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - AddFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddFunctionField()

向现有 Collection 添加函数生成的输出字段。

```c++
Status AddFunctionField(const AddFunctionFieldRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AddFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema)
    .WithFunction(function)
    .WithIndex(index);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithField(FieldSchema&& field_schema)`

    设置字段 Schema。

- `WithFunction(const FunctionPtr& function)`

    设置要添加的函数。

- `WithIndex(IndexDesc&& index)`

    设置绑定到函数输出字段的索引。该索引为必选项，且必须指定显式索引类型，不支持 AUTOINDEX。

**返回值：**

*Status*

返回表示操作是否成功的状态。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以了解失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 AddFunctionField()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddFunctionFieldRequest();
util::CheckStatus(client->AddFunctionField(request));
```
