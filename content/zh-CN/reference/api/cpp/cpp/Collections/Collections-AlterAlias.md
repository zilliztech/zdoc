---
title: "AlterAlias() | Cloud"
slug: /cpp/cpp/Collections-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将现有别名从其当前 Collection 重新分配至请求中指定的 Collection，使使用该别名的搜索和查询调用此后指向新的 Collection。 | Cloud"
type: docx
token: V2UCd9pXGobxHKxw10HcZBuQn8f
sidebar_position: 4
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterAlias()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterAlias()

此操作会将现有别名从其当前 Collection 重新分配至请求中指定的 Collection，使使用该别名的搜索和查询调用此后指向新的 Collection。

```c++
Status AlterAlias(const AlterAliasRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称；如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置别名重新分配到的 Collection 的名称。

- `WithAlias(const std::string& alias)`

    设置要更改的别名的名称。

**返回：**

*Status*

返回一个 Status，指示别名是否已成功更改。

**错误处理：**

- **std::exception**

    若请求构建、传输或响应处理失败，则抛出此异常。请检查异常消息或返回的 Status，以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AlterAlias()，将别名重新分配给另一个 Collection。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->AlterAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
