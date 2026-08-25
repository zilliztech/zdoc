---
title: "DropCollectionField() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionField
sidebar_label: "DropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "从现有 Collection 中删除字段。| Cloud"
type: docx
token: Qgmsdk9v3oAOXlxlx0nc1svZn2b
sidebar_position: 35
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionField()

从现有 Collection 中删除字段。

```c++
Status DropCollectionField(const DropCollectionFieldRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithFieldID(field_id);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFieldName(std::string field_name)`

    设置要删除的字段名称。

- `WithFieldID(int64_t field_id)`

    设置要删除的字段 ID。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 DropCollectionField()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFieldRequest();
util::CheckStatus(client->DropCollectionField(request));
```
