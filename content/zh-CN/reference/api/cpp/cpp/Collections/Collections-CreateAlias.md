---
title: "CreateAlias() | Cloud"
slug: /cpp/cpp/Collections-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为 Collection 创建别名，以便搜索和查询调用可以使用该别名而非 Collection 名称来访问该 Collection。 | Cloud"
type: docx
token: Pz42dXmiqoCNScx0MPzcjmXLnib
sidebar_position: 13
keywords: 
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - CreateAlias()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateAlias()

此操作为 Collection 创建别名，以便搜索和查询调用可以使用该别名而非 Collection 名称来访问该 Collection。

```c++
Status CreateAlias(const CreateAliasRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称；如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要为其创建别名的 Collection 的名称。

- `WithAlias(const std::string& alias)`

    设置要创建的别名的名称。

**返回：**

*Status*

返回一个 Status，指示别名是否已成功创建。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 CreateAlias()，创建一个引用现有 Collection 的别名。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->CreateAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
