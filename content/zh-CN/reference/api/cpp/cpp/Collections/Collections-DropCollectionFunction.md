---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "此操作删除现有 Collection 中的函数。| Cloud"
type: docx
token: C6UadudBVopgWOxeZRwcf0uKn6b
sidebar_position: 22
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionFunction()

此操作删除现有 Collection 中的函数。

<Admonition type="info" title="Notes">

在 v3.0.x 中已弃用。请使用 [DropFunctionField()](./Collections-DropFunctionField) 将函数连同其输出字段和绑定索引一并删除。

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

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置目标 Collection 的名称。

- `WithFunctionName(std::string function_name)`

    设置要删除的函数名称。此名称不能为空。

**返回值：**

*Status*

返回一个 Status，用于指示函数是否已成功删除。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropCollectionFunction()，以删除现有 Collection 中的函数。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
status = client->DropCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
