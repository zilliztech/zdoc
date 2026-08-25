---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "删除现有 Collection 中的函数。| Cloud"
type: docx
token: C6UadudBVopgWOxeZRwcf0uKn6b
sidebar_position: 22
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFunction()

删除现有 Collection 中的函数。

<Admonition type="info" icon="📘" title="Note">

在 v3.0.x 中已弃用。请使用 DropFunctionField() 将函数连同其输出字段及绑定索引一并删除。

</Admonition>

```c++
Status DropCollectionFunction(const DropCollectionFunctionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

### DropCollectionFunctionRequest\{#dropcollectionfunctionrequest}

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；若为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFunctionName(std::string function_name)`

    设置要删除的函数名称。

**返回值：**

*Status*

返回一个状态，用于指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 DropCollectionFunction()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFunctionRequest();
util::CheckStatus(client->DropCollectionFunction(request));
```
