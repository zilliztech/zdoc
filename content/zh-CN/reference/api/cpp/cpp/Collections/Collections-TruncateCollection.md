---
title: "TruncateCollection() | Cloud"
slug: /cpp/cpp/Collections-TruncateCollection
sidebar_label: "TruncateCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "截断 Collection，移除所有数据，同时保留 Collection 结构。 | Cloud"
type: docx
token: GCNTd5HUkogWVDxUcuLcEusZnlh
sidebar_position: 33
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - HNSW 算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - TruncateCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# TruncateCollection()

截断 Collection，移除所有数据，同时保留 Collection 结构。

```c++
Status TruncateCollection(const TruncateCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = TruncateCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

**返回值：**

*Status*

返回的状态指示操作是否成功。

**错误处理：**

- **std::exception**

    在请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

演示如何通过 C++ SDK 使用 TruncateCollection()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::TruncateCollectionRequest();
util::CheckStatus(client->TruncateCollection(request));
```
