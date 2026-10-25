---
title: "DropCollection() | Cloud"
slug: /cpp/cpp/Collections-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会删除 Collection 及其数据和索引。 | Cloud"
type: docx
token: MjcFdDhKnoUvaCx8QtmclkOKnPn
sidebar_position: 20
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollection()

此操作会删除 Collection 及其数据和索引。

```c++
Status DropCollection(const DropCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称；如果该名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要删除的 Collection 的名称。

**返回值：**

*Status*

返回一个 Status，指示 Collection 是否已成功删除。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropCollection()，以删除 Collection 及其数据。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
status = client->DropCollection(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
