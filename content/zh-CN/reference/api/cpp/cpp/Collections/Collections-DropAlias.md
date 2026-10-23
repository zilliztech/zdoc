---
title: "DropAlias() | Cloud"
slug: /cpp/cpp/Collections-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会删除别名，使该名称不再解析到对应的 Collection，而底层 Collection 不受影响。 | Cloud"
type: docx
token: JUcUd5B8QoDmc5xEx0LcmVZHnyN
sidebar_position: 19
keywords: 
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias()

此操作会删除别名，使该名称不再解析到对应的 Collection，而底层 Collection 不受影响。

```c++
Status DropAlias(const DropAliasRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称；如果为空，则使用默认 Database。

- `WithAlias(const std::string& alias)`

    设置要删除的别名的名称。

**返回：**

*Status*

返回一个 Status，指示别名是否已成功删除。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropAlias()，从 Collection 中删除别名。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
status = client->DropAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
