---
title: "AddCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionFunction
sidebar_label: "AddCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "此操作会向现有 Collection 添加函数。 | Cloud"
type: docx
token: OrRqdvj4yoN2cMxbHUkcEE9Xnbg
sidebar_position: 2
keywords: 
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - 检索增强生成
  - Zilliz
  - Zilliz Cloud
  - 云
  - AddCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionFunction()

此操作会向现有 Collection 添加函数。

<Admonition type="info" title="Notes">

在 v3.0.x 中已废弃。请使用 [AddFunctionField()](./Collections-AddFunctionField) 将函数与新的输出字段及绑定索引一同添加。

</Admonition>

```c++
Status AddCollectionFunction(const AddCollectionFunctionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AddCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果该名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要添加函数的 Collection 名称。

- `WithFunction(const FunctionPtr& function)`

    设置要添加到 Collection 的函数，该函数以指向函数定义的共享指针表示。

**返回：**

*Status*

返回一个 Status，指示函数是否已成功添加。

**异常处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AddCollectionFunction()，向现有 Collection 添加函数。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AddCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
status = client->AddCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
