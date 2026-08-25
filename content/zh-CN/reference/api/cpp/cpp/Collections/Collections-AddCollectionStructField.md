---
title: "AddCollectionStructField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionStructField
sidebar_label: "AddCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "向现有 Collection 添加结构体字段。| Cloud"
type: docx
token: GWPxd80BYoQleSxNCPNcFvWsnzb
sidebar_position: 33
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionStructField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionStructField()

向现有 Collection 添加结构体字段。

```c++
Status AddCollectionStructField(const AddCollectionStructFieldRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AddCollectionStructFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithStructField(field_schema);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithStructField(StructFieldSchema&& field_schema)`

    设置结构体字段的 Schema。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取详细的失败信息。

## 示例\{#example}

演示如何使用 C++ SDK 调用 AddCollectionStructField()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionStructFieldRequest();
util::CheckStatus(client->AddCollectionStructField(request));
```
